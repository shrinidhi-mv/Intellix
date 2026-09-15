from typing import List, Optional
from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    text: str = Field(..., min_length=2, description="Farmer query in regional or English language")
    language: Optional[str] = Field(
        None, 
        description="Optional language code (e.g. 'ta', 'hi', 'te', 'en') or 'auto'"
    )

class SourceDocument(BaseModel):
    document_id: str
    title: str
    category: str
    snippet: str
    score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")

class QueryResponse(BaseModel):
    query: str
    detected_language: str
    language_name: str
    english_query: str
    answer: str
    sources: List[SourceDocument] = []
    confidence: float = 1.0
    is_grounded: bool = True
    has_sufficient_context: bool = True
    disclaimer: str
    model_used: str

class TranscriptionResponse(BaseModel):
    text: str
    language: Optional[str] = "auto"
    success: bool = True

class HealthResponse(BaseModel):
    status: str
    total_chunks: int
    total_documents: int
    embedding_model: str
    llm_mode: str
    gemini_configured: bool
    anthropic_configured: Optional[bool] = False
