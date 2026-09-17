import re
import logging
from pathlib import Path
from typing import List, Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)


class VectorStore:
    """
    Lightweight knowledge-base search.

    Uses a simple BM25-style keyword ranking instead of
    SentenceTransformers + ChromaDB, so it can run on
    low-memory hosting such as Render's free instance.
    """

    _instance = None

    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.loaded = False

        logger.info("Initializing lightweight knowledge store")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _tokenize(self, text: str) -> List[str]:
        """Convert text into simple lowercase tokens."""
        return re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())

    def chunk_markdown(self, file_path: Path) -> List[Dict[str, Any]]:
        """
        Split a markdown knowledge-base file into chunks
        while preserving title and category information.
        """
        content = file_path.read_text(encoding="utf-8")
        filename = file_path.name

        title_match = re.search(
            r"^#\s+(.+)$",
            content,
            re.MULTILINE
        )

        title = (
            title_match.group(1).strip()
            if title_match
            else file_path.stem.replace("_", " ").title()
        )

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

        sections = re.split(r"(?=\n##\s+)", content)

        chunks = []
        chunk_idx = 0

        for section in sections:
            section_clean = section.strip()

            if not section_clean:
                continue

            if len(section_clean) > 900:
                paragraphs = section_clean.split("\n\n")
                buffer = ""

                for paragraph in paragraphs:
                    paragraph = paragraph.strip()

                    if not paragraph:
                        continue

                    if len(buffer) + len(paragraph) < 700:
                        buffer += (
                            "\n\n" if buffer else ""
                        ) + paragraph
                    else:
                        if buffer:
                            chunks.append(
                                self._make_chunk(
                                    file_path,
                                    filename,
                                    title,
                                    category,
                                    buffer,
                                    chunk_idx
                                )
                            )
                            chunk_idx += 1

                        buffer = paragraph

                if buffer:
                    chunks.append(
                        self._make_chunk(
                            file_path,
                            filename,
                            title,
                            category,
                            buffer,
                            chunk_idx
                        )
                    )
                    chunk_idx += 1

            else:
                chunks.append(
                    self._make_chunk(
                        file_path,
                        filename,
                        title,
                        category,
                        section_clean,
                        chunk_idx
                    )
                )
                chunk_idx += 1

        return chunks

    def _make_chunk(
        self,
        file_path: Path,
        filename: str,
        title: str,
        category: str,
        text: str,
        chunk_idx: int
    ) -> Dict[str, Any]:

        return {
    "id": f"{file_path.stem}_chunk_{chunk_idx}",
    "document_id": filename,
    "title": title,
    "category": category,
    "text": (
        f"Document: {title}\n"
        f"Category: {category}\n\n"
        f"{text}"
    ),
    "snippet": text[:280],
    "raw_snippet": text[:280]
}

    def ingest_knowledge_base(self, force_reload: bool = False) -> int:
        """
        Load all markdown files from the knowledge base
        into memory.
        """

        if self.loaded and not force_reload:
            return len(self.documents)

        kb_dir = settings.KNOWLEDGE_BASE_DIR

        if not kb_dir.exists():
            logger.warning(
                f"Knowledge base directory {kb_dir} does not exist!"
            )
            return 0

        md_files = list(kb_dir.glob("*.md"))

        if not md_files:
            logger.warning(
                f"No .md files found in {kb_dir}!"
            )
            return 0

        self.documents = []

        for file_path in md_files:
            chunks = self.chunk_markdown(file_path)
            self.documents.extend(chunks)

        self.loaded = True

        logger.info(
            f"Loaded {len(self.documents)} knowledge chunks "
            f"from {len(md_files)} documents"
        )

        return len(self.documents)

    def search(
        self,
        query: str,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Lightweight keyword-based relevance search.

        No ML model, PyTorch, ChromaDB, or SentenceTransformer
        is loaded, keeping memory usage very low.
        """

        if not self.loaded:
            self.ingest_knowledge_base()

        if not self.documents:
            return []

        query_tokens = set(self._tokenize(query))

        if not query_tokens:
            return []

        scored_documents = []

        for document in self.documents:
            text_tokens = self._tokenize(document["text"])

            if not text_tokens:
                continue

            text_token_set = set(text_tokens)

            matched = query_tokens.intersection(text_token_set)

            if not matched:
                continue

            # Basic relevance score.
            #
            # Gives higher scores when more query terms
            # appear in the document.
            coverage = len(matched) / len(query_tokens)

            # Small bonus for repeated occurrences.
            frequency_bonus = min(
                0.2,
                sum(text_tokens.count(token) for token in matched)
                / max(len(text_tokens), 1)
            )

            score = min(
                1.0,
                coverage + frequency_bonus
            )

            result = dict(document)
            result["score"] = round(score, 4)

            scored_documents.append(result)

        scored_documents.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        return scored_documents[:top_k]

    def get_stats(self) -> Dict[str, Any]:
        if not self.loaded:
            self.ingest_knowledge_base()

        md_files = (
            list(settings.KNOWLEDGE_BASE_DIR.glob("*.md"))
            if settings.KNOWLEDGE_BASE_DIR.exists()
            else []
        )

        return {
            "total_chunks": len(self.documents),
            "total_documents": len(md_files),
            "documents": [f.name for f in md_files],
            "embedding_model": "Lightweight keyword search"
        }