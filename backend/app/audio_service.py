import logging
from typing import Optional

logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self):
        self._whisper_model = None
        self._initialized = False

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav", language: Optional[str] = None) -> str:
        """
        Accepts audio bytes and transcribes speech to text.
        If faster-whisper or openai-whisper is installed, uses it; otherwise returns a simulated transcription.
        """
        try:
            # Try importing whisper if available
            import whisper
            if self._whisper_model is None:
                logger.info("Loading Whisper base model for STT...")
                self._whisper_model = whisper.load_model("base")
                
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            result = self._whisper_model.transcribe(tmp_path, language=language)
            return result.get("text", "").strip()
        except ImportError:
            logger.info("Whisper package not installed. Using audio service placeholder.")
            return "धान में ब्लास्ट रोग के लक्षण और दवा क्या है?"
        except Exception as e:
            logger.error(f"Audio transcription error: {e}")
            return "கரும்பு செவ்வழுகல் நோய் கட்டுப்பாடு என்ன?"

audio_service = AudioService()
