import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import QueryRequest, QueryResponse, HealthResponse, TranscriptionResponse
from app.vector_store import VectorStore
from app.rag_service import rag_service
from app.llm_service import llm_service
from app.audio_service import audio_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Multilingual Farmer Knowledge Assistant Backend...")
    # Initialize vector store and check ingestion
    vs = VectorStore.get_instance()
    stats = vs.get_stats()
    if stats["total_chunks"] == 0:
        logger.info("Empty vector store detected. Automatically ingesting knowledge base...")
        vs.ingest_knowledge_base()
    else:
        logger.info(f"Vector store already primed with {stats['total_chunks']} chunks.")
    yield
    logger.info("Shutting down backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RAG-based Multilingual Agricultural Assistant providing grounded advisory in regional Indian languages.",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Multilingual Farmer Knowledge Assistant API",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Monitoring"])
def health():
    vs = VectorStore.get_instance()
    stats = vs.get_stats()
    return HealthResponse(
        status="healthy",
        total_chunks=stats["total_chunks"],
        total_documents=stats["total_documents"],
        embedding_model=stats["embedding_model"],
        llm_mode=f"Live Gemini ({settings.GEMINI_MODEL})" if llm_service.is_configured else "Simulated Gemini Grounding",
        gemini_configured=llm_service.is_configured,
        anthropic_configured=llm_service.is_configured
    )

@app.get("/api/documents", tags=["Knowledge Base"])
def get_documents() -> List[Dict[str, Any]]:
    kb_dir = settings.KNOWLEDGE_BASE_DIR
    if not kb_dir.exists():
        return []
    docs = []
    for f in kb_dir.glob("*.md"):
        docs.append({
            "filename": f.name,
            "title": f.stem.replace("_", " ").title(),
            "category": "Pests" if "pest" in f.name else ("Fertilizer" if "fertilizer" in f.name else ("Irrigation" if "irrigation" in f.name else "Government Schemes"))
        })
    return sorted(docs, key=lambda x: (x["category"], x["title"]))

@app.post("/api/query", response_model=QueryResponse, tags=["RAG"])
def query_rag(request: QueryRequest):
    try:
        response = rag_service.query(text=request.text, requested_lang=request.language)
        return response
    except Exception as e:
        logger.error(f"Error processing query '{request.text}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe", response_model=TranscriptionResponse, tags=["Audio"])
async def transcribe(file: UploadFile = File(...), language: str = Form("auto")):
    try:
        contents = await file.read()
        transcribed_text = audio_service.transcribe_audio(
            audio_bytes=contents, 
            filename=file.filename or "audio.wav", 
            language=None if language == "auto" else language
        )
        return TranscriptionResponse(text=transcribed_text, language=language, success=True)
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return TranscriptionResponse(
            text="धान में ब्लास्ट रोग के लक्षण और दवा क्या है?",
            language=language,
            success=False
        )

@app.post("/api/reingest", tags=["Admin"])
def reingest():
    vs = VectorStore.get_instance()
    count = vs.ingest_knowledge_base(force_reload=True)
    return {"message": "Knowledge base re-ingested successfully", "total_chunks": count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
