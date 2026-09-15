import sys
import io
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.vector_store import VectorStore

def main():
    print("=" * 60)
    print("[AGRI-RAG] Agricultural Knowledge Base Ingestion Script")
    print("=" * 60)
    
    vs = VectorStore.get_instance()
    print("Starting ingestion into ChromaDB...")
    count = vs.ingest_knowledge_base(force_reload=True)
    
    stats = vs.get_stats()
    print("[OK] Ingestion complete!")
    print(f"Total Documents: {stats['total_documents']}")
    print(f"Total Chunks: {stats['total_chunks']}")
    print(f"Embedding Model: {stats['embedding_model']}")
    print("=" * 60)

if __name__ == "__main__":
    main()
