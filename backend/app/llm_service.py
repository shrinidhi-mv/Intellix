import re
import time
import logging
from typing import Optional, Tuple, List, Dict, Any

from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.client: Optional[genai.Client] = None

        if self.api_key and not self.api_key.startswith("your_"):
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"Google Gemini client initialized with model: {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini client: {e}")
                self.client = None
        else:
            logger.info("GEMINI_API_KEY not configured. Running in mock mode (simulated Gemini grounding).")

    @property
    def is_configured(self) -> bool:
        return self.client is not None

    def detect_language(self, text: str) -> Tuple[str, str]:
        """
        Detects language code and display name using fast Unicode script detection.
        """
        tamil_chars = len(re.findall(r"[\u0B80-\u0BFF]", text))
        devanagari_chars = len(re.findall(r"[\u0900-\u097F]", text))
        telugu_chars = len(re.findall(r"[\u0C00-\u0C7F]", text))
        kannada_chars = len(re.findall(r"[\u0C80-\u0CFF]", text))
        bengali_chars = len(re.findall(r"[\u0980-\u09FF]", text))

        counts = {
            "ta": tamil_chars,
            "hi": devanagari_chars,
            "te": telugu_chars,
            "kn": kannada_chars,
            "bn": bengali_chars,
        }

        best_lang, count = max(counts.items(), key=lambda x: x[1])
        lang_code = best_lang if count >= 3 else "en"
        lang_name = settings.SUPPORTED_LANGUAGES.get(lang_code, settings.SUPPORTED_LANGUAGES["en"])["name"]
        return lang_code, lang_name

    def generate_answer(self, query: str, lang_name: str, context: str, lang_code: str = "en") -> Optional[str]:
        """
        Synthesizes a grounded agricultural answer using Gemini with strict safety rules.
        Enforces 100% native language output with zero English mixing.
        """
        if not self.is_configured:
            return None

        system_instruction = (
            f"You are a certified Senior Agricultural Extension Officer assisting Indian farmers.\n\n"
            f"CRITICAL LANGUAGE RULE:\n"
            f"Your entire response MUST be written 100% in {lang_name} from the very first word to the last word.\n"
            f"- Do NOT write in English.\n"
            f"- Do NOT mix English sentences, English bullet points, or English headings into the response.\n"
            f"- The farmer ONLY speaks and reads {lang_name}.\n"
            f"- Translate all concepts, symptoms, timings, and explanations purely into {lang_name}.\n"
            f"- You may only put the chemical trade/generic compound name in brackets next to the regional script for input purchasing (e.g. ட்ரைசைக்ளசோல் 75% WP / Tricyclazole 75% WP).\n\n"
            f"CRITICAL AGRICULTURAL SAFETY & GROUNDING RULES:\n"
            f"1. Answer ONLY using the provided verified agricultural context.\n"
            f"2. Never guess or recommend dosages, chemicals, or timings not present in the context.\n"
            f"3. If context is insufficient, state uncertainty in {lang_name} and advise visiting the local Krishi Vigyan Kendra (KVK).\n"
            f"4. Format your answer with clear, farmer-friendly bullet points and practical steps."
        )

        prompt = (
            f"VERIFIED AGRICULTURAL KNOWLEDGE BASE CONTEXT:\n"
            f"{context}\n\n"
            f"FARMER'S QUESTION:\n"
            f"{query}\n\n"
            f"IMPORTANT: Write your complete answer 100% in {lang_name} with zero English sentences:"
        )

        for attempt in range(2):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        max_output_tokens=1000,
                        temperature=0.15
                    )
                )
                if response and response.text:
                    clean_res = response.text.strip()
                    # If regional language was requested, verify that the output is not primarily in English
                    if lang_code in ["ta", "hi", "te", "kn", "bn"]:
                        indic_chars = len(re.findall(r"[\u0900-\u0D7F]", clean_res))
                        latin_chars = len(re.findall(r"[a-zA-Z]", clean_res))
                        if indic_chars < latin_chars:
                            logger.warning(
                                f"Gemini response for {lang_code} contained excess English "
                                f"({latin_chars} latin vs {indic_chars} indic). Delegating to pure native localized KB."
                            )
                            return None
                    return clean_res
            except Exception as e:
                logger.warning(f"Gemini generation attempt {attempt + 1}/2 failed: {e}")
                if attempt == 0:
                    time.sleep(1.5)

        logger.warning("Gemini generation unavailable or quota exceeded. Delegating to localized knowledge synthesizer.")
        return None

llm_service = LLMService()
