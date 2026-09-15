import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    _instance = None

    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB client at: {self.persist_dir}")
        self.client = chromadb.PersistentClient(
            path=str(self.persist_dir),
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        logger.info(f"Loading multilingual embedding model: {settings.EMBEDDING_MODEL_NAME}")
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        
        self.collection = self.client.get_or_create_collection(
            name=settings.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"ChromaDB collection '{settings.COLLECTION_NAME}' ready. Current items: {self.collection.count()}")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.embedding_model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return embeddings.tolist()

    def chunk_markdown(self, file_path: Path) -> List[Dict[str, Any]]:
        """
        Split a markdown knowledge base file into semantic chunks preserving headers and metadata.
        """
        content = file_path.read_text(encoding="utf-8")
        filename = file_path.name
        
        # Extract title from first H1 if available
        title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else file_path.stem.replace("_", " ").title()
        
        # Determine category based on prefix
        if filename.startswith("pest_"):
            category = "Pests & Diseases"
        elif filename.startswith("fertilizer_"):
            category = "Fertilizer Schedule"
        elif filename.startswith("irrigation_"):
            category = "Irrigation Guidance"
        elif filename.startswith("scheme_"):
            category = "Government Schemes"
        else:
            category = "General Agriculture"
            
        # Split into sections by H2 headers (##)
        sections = re.split(r"(?=\n##\s+)", content)
        chunks = []
        chunk_idx = 0
        
        for section in sections:
            section_clean = section.strip()
            if not section_clean:
                continue
                
            # If section is very large (>900 chars), subdivide by paragraph
            if len(section_clean) > 900:
                paragraphs = section_clean.split("\n\n")
                buffer = ""
                for p in paragraphs:
                    p = p.strip()
                    if not p:
                        continue
                    if len(buffer) + len(p) < 700:
                        buffer += ("\n\n" if buffer else "") + p
                    else:
                        if buffer:
                            chunk_id = f"{file_path.stem}_chunk_{chunk_idx}"
                            chunks.append({
                                "id": chunk_id,
                                "document_id": filename,
                                "title": title,
                                "category": category,
                                "text": f"Document: {title}\nCategory: {category}\n\n{buffer}",
                                "raw_snippet": buffer[:280]
                            })
                            chunk_idx += 1
                        buffer = p
                if buffer:
                    chunk_id = f"{file_path.stem}_chunk_{chunk_idx}"
                    chunks.append({
                        "id": chunk_id,
                        "document_id": filename,
                        "title": title,
                        "category": category,
                        "text": f"Document: {title}\nCategory: {category}\n\n{buffer}",
                        "raw_snippet": buffer[:280]
                    })
                    chunk_idx += 1
            else:
                chunk_id = f"{file_path.stem}_chunk_{chunk_idx}"
                chunks.append({
                    "id": chunk_id,
                    "document_id": filename,
                    "title": title,
                    "category": category,
                    "text": f"Document: {title}\nCategory: {category}\n\n{section_clean}",
                    "raw_snippet": section_clean[:280]
                })
                chunk_idx += 1
                
        return chunks

    def ingest_knowledge_base(self, force_reload: bool = False) -> int:
        """
        Ingests all markdown files from the knowledge_base directory into ChromaDB.
        """
        kb_dir = settings.KNOWLEDGE_BASE_DIR
        if not kb_dir.exists():
            logger.warning(f"Knowledge base directory {kb_dir} does not exist!")
            return 0
            
        md_files = list(kb_dir.glob("*.md"))
        if not md_files:
            logger.warning(f"No .md files found in {kb_dir}!")
            return 0
            
        existing_count = self.collection.count()
        if existing_count > 0 and not force_reload:
            logger.info(f"Knowledge base already ingested with {existing_count} chunks. Skipping re-ingestion.")
            return existing_count
            
        if force_reload and existing_count > 0:
            logger.info("Clearing existing collection for clean re-ingest...")
            self.client.delete_collection(name=settings.COLLECTION_NAME)
            self.collection = self.client.create_collection(
                name=settings.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )

        all_chunks = []
        for file_path in md_files:
            file_chunks = self.chunk_markdown(file_path)
            all_chunks.extend(file_chunks)

        if not all_chunks:
            logger.warning("No chunks generated from knowledge base files.")
            return 0

        logger.info(f"Embedding and storing {len(all_chunks)} chunks across {len(md_files)} documents...")
        
        ids = [c["id"] for c in all_chunks]
        texts = [c["text"] for c in all_chunks]
        metadatas = [
            {
                "document_id": c["document_id"],
                "title": c["title"],
                "category": c["category"],
                "raw_snippet": c["raw_snippet"]
            }
            for c in all_chunks
        ]
        
        embeddings = self.embed_texts(texts)
        
        # Batch insert into Chroma
        batch_size = 50
        for i in range(0, len(ids), batch_size):
            end = i + batch_size
            self.collection.upsert(
                ids=ids[i:end],
                embeddings=embeddings[i:end],
                documents=texts[i:end],
                metadatas=metadatas[i:end]
            )
            
        final_count = self.collection.count()
        logger.info(f"Successfully ingested {final_count} chunks into ChromaDB!")
        return final_count

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Performs semantic cosine similarity search against ingested knowledge.
        """
        if self.collection.count() == 0:
            self.ingest_knowledge_base()

        query_embedding = self.embed_texts([query])[0]
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, max(1, self.collection.count())),
            include=["documents", "metadatas", "distances"]
        )

        sources = []
        if results and results["ids"] and results["ids"][0]:
            ids = results["ids"][0]
            documents = results["documents"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0]

            for doc_id, doc_text, meta, dist in zip(ids, documents, metadatas, distances):
                # Cosine distance in chroma is (1 - cosine_similarity).
                # Convert distance to similarity score between 0.0 and 1.0
                similarity = max(0.0, min(1.0, 1.0 - dist))
                sources.append({
                    "id": doc_id,
                    "document_id": meta.get("document_id", ""),
                    "title": meta.get("title", "Agricultural Advisory"),
                    "category": meta.get("category", "General"),
                    "text": doc_text,
                    "snippet": meta.get("raw_snippet", doc_text[:250]),
                    "score": round(similarity, 4)
                })

        return sources

    def get_stats(self) -> Dict[str, Any]:
        md_files = list(settings.KNOWLEDGE_BASE_DIR.glob("*.md")) if settings.KNOWLEDGE_BASE_DIR.exists() else []
        return {
            "total_chunks": self.collection.count(),
            "total_documents": len(md_files),
            "documents": [f.name for f in md_files],
            "embedding_model": settings.EMBEDDING_MODEL_NAME
        }
