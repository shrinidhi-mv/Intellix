import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
ROOT_DIR = BACKEND_DIR.parent
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)

class Settings:
    PROJECT_NAME: str = "Multilingual Farmer Knowledge Assistant (Kisan Sahayak)"
    VERSION: str = "1.0.0"
    
    # Google Gemini configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()
    
    # Embeddings & Vector DB configuration
    EMBEDDING_MODEL_NAME: str = os.getenv(
        "EMBEDDING_MODEL_NAME", 
        "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    ).strip()
    
    CHROMA_PERSIST_DIR: Path = Path(os.getenv("CHROMA_PERSIST_DIR", str(BACKEND_DIR / "chroma_db"))).resolve()
    KNOWLEDGE_BASE_DIR: Path = (BACKEND_DIR / "knowledge_base").resolve()
    
    COLLECTION_NAME: str = "agri_multilingual_knowledge"
    
    # Server host & port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Supported regional languages mapping
    SUPPORTED_LANGUAGES = {
        "ta": {"name": "Tamil", "native": "தமிழ்", "code": "ta"},
        "hi": {"name": "Hindi", "native": "हिन्दी", "code": "hi"},
        "te": {"name": "Telugu", "native": "తెలుగు", "code": "te"},
        "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "code": "kn"},
        "mr": {"name": "Marathi", "native": "मराठी", "code": "mr"},
        "bn": {"name": "Bengali", "native": "বাংলা", "code": "bn"},
        "en": {"name": "English", "native": "English", "code": "en"},
    }

settings = Settings()
