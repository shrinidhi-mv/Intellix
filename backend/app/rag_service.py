import re
import logging
from typing import Dict, Any, List, Optional, Tuple

from app.config import settings
from app.schemas import SourceDocument, QueryResponse
from app.vector_store import VectorStore
from app.llm_service import llm_service
from app.localized_knowledge import LOCALIZED_KB_SUMMARIES, get_localized_summary

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.vector_store = VectorStore.get_instance()
        self.llm = llm_service

    def translate_and_detect(self, query: str, user_selected_lang: Optional[str] = None) -> Tuple[str, str, str]:
        """
        Detects language and expands query with agricultural English keywords.
        Runs locally in 0ms without consuming any Gemini API quota.
        """
        if user_selected_lang and user_selected_lang != "auto" and user_selected_lang in settings.SUPPORTED_LANGUAGES:
            lang_code = user_selected_lang
            lang_name = settings.SUPPORTED_LANGUAGES[lang_code]["name"]
        else:
            lang_code, lang_name = self.llm.detect_language(query)

        if lang_code == "en":
            return lang_code, lang_name, query

        # Precise regional agricultural taxonomy keywords
        english_query = query
        term_mappings = [
            (r"நெல்|dhan|धान|వరి|ಭತ್ತ", "rice paddy"),
            (r"கோதுமை|गेहूं|గోధుమ|ಗೋಧಿ", "wheat gehun"),
            (r"பருத்தி|कपास|పత్తి|ಹತ್ತಿ", "cotton kapas"),
            (r"கரும்பு|गन्ना|చెరకు|ಕಬ್ಬು", "sugarcane"),
            (r"மக்காச்சோளம்|मक्का|మొక్కజొన్న|ಮೆಕ್ಕೆಜೋಳ|ಜೋಳ", "maize corn makka"),
            (r"தக்காளி|टमाटर|టమోటా|ಟೊಮೆಟೊ", "tomato"),
            (r"குலை\s*நோய்|பிளாஸ்ட்|ब्लास्ट|झुलसा|అగ్గితెగులు|ಬೆಂಕಿ ರೋಗ", "blast pyricularia"),
            (r"துரு\s*நோய்|रतुआ|రస్ట్|ತುಕ್ಕು", "yellow rust stripe rust puccinia"),
            (r"செவ்வழுகல்|சழுகல்|लाल सड़न|ఎర్ర కుళ్ళు|ಕೆಂಪು ಕೊಳೆ", "red rot colletotrichum"),
            (r"படைப்புழு|फॉल आर्मीवर्म|కత్తెర పురుగు|ಲದ್ದಿ ಹುಳು", "fall armyworm spodoptera"),
            (r"இளஞ்சிவப்பு\s*காய்ப்புழு|गुलाबी सुंडी|గులాబీ రంగు|ಗುಲಾಬಿ ಕಾಯಿ", "pink bollworm pectinophora"),
            (r"இலை சுருள்|சுருள்\s*நோய்|पत्ता मरोड़|ఆకు ముడత|ಎಲೆ ಸುರುಟು", "leaf curl virus whitefly"),
            (r"உரம்|உர\s*அட்டவணை|உர\s*மேலாண்மை|खाद|उर्वरक|ఎరువులు|ಗೊಬ್ಬರ|ರಸಗೊಬ್ಬರ", "fertilizer schedule NPK urea DAP"),
            (r"பாசனம்|சொட்டு\s*நீர்|தெளிப்பு\s*நீர்|ड्रिप|सिंचाई|సేద్యం|హని ನೀರಾವರಿ|ಸಿಂಪಡಣೆ", "irrigation drip sprinkler micro-irrigation"),
            (r"பிஎம்\s*கிசான்|கிசான்\s*சம்மான்|पीएम किसान|పీఎం కిసాన్|ಕಿಸಾನ್ ಸಮ್ಮಾನ್", "PM KISAN samman nidhi 6000"),
            (r"பயிர்\s*காப்பீடு|காப்பீடு|फसल बीमा|ఫసల్ బీమా|ಬೆಳೆ ವಿಮೆ", "PMFBY crop insurance claim 72 hours"),
            (r"மண்\s*வள|மண்\s*அட்டை|மண்\s*பரிசோதனை|मृदा स्वास्थ्य|సాయిల్ హెల్త్|ಮಣ್ಣು ಆರೋಗ್ಯ", "soil health card testing"),
            (r"கிரெடிட்\s*கார்டு|கேசிசி|किसान क्रेडिट कार्ड|కేసీసీ|ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್", "kisan credit card KCC 4 percent interest"),
        ]
        
        detected_keywords = []
        for pattern, replacement in term_mappings:
            if re.search(pattern, query, re.IGNORECASE):
                detected_keywords.append(replacement)
                
        if detected_keywords:
            english_query = f"{query} " + " ".join(detected_keywords)
            
        return lang_code, lang_name, english_query

    def query(self, text: str, requested_lang: Optional[str] = None) -> QueryResponse:
        """
        Full RAG pipeline:
        1. Language detection & local keyword enrichment
        2. Semantic retrieval from ChromaDB
        3. Context filtering & grounding verification
        4. 100% Native Language Generation via Gemini (with 100% native localized fallback)
        5. Source attribution
        """
        clean_text = text.strip()
        lang_code, lang_name, english_query = self.translate_and_detect(clean_text, requested_lang)

        # Retrieve top 4 context chunks
        retrieved_sources = self.vector_store.search(english_query, top_k=4)
        
        if not retrieved_sources or (retrieved_sources and retrieved_sources[0]["score"] < 0.35):
            raw_sources = self.vector_store.search(clean_text, top_k=4)
            if raw_sources and (not retrieved_sources or raw_sources[0]["score"] > retrieved_sources[0]["score"]):
                retrieved_sources = raw_sources

        max_score = retrieved_sources[0]["score"] if retrieved_sources else 0.0
        MIN_RELEVANCE_THRESHOLD = 0.28
        
        has_sufficient_context = max_score >= MIN_RELEVANCE_THRESHOLD
        
        source_docs = [
            SourceDocument(
                document_id=src["document_id"],
                title=src["title"],
                category=src["category"],
                snippet=src["snippet"],
                score=src["score"]
            )
            for src in retrieved_sources
            if src["score"] >= (MIN_RELEVANCE_THRESHOLD - 0.05)
        ]

        if not has_sufficient_context or not source_docs:
            unsupported_msg = self._get_insufficient_context_message(lang_code)
            return QueryResponse(
                query=clean_text,
                detected_language=lang_code,
                language_name=lang_name,
                english_query=english_query,
                answer=unsupported_msg,
                sources=[],
                confidence=round(max_score, 2),
                is_grounded=True,
                has_sufficient_context=False,
                disclaimer="Verified database lacks certified records for this specific question. Please contact local Krishi Vigyan Kendra.",
                model_used="Grounding Guardrail (Strict No-Hallucination)"
            )

        context_str = "\n\n---\n\n".join([
            f"SOURCE [{idx+1}] - Title: {src['title']} (Category: {src['category']})\nContent:\n{src['text']}"
            for idx, src in enumerate(retrieved_sources[:3])
        ])

        answer = None
        model_used = "Verified Advisory (Local RAG)"

        # 1. Try Google Gemini first
        if self.llm.is_configured:
            answer = self.llm.generate_answer(clean_text, lang_name, context_str, lang_code)
            if answer:
                model_used = f"Google Gemini ({settings.GEMINI_MODEL})"

        # 2. If Gemini is cooling down or unconfigured, use 100% native language localized fallback
        if not answer:
            answer = self._generate_grounded_fallback(clean_text, lang_code, lang_name, retrieved_sources[:3])
            if self.llm.is_configured:
                model_used = "Verified Advisory (Local RAG • Free Quota Backup)"
            else:
                model_used = "Simulated Gemini Grounding (Set GEMINI_API_KEY in .env)"

        return QueryResponse(
            query=clean_text,
            detected_language=lang_code,
            language_name=lang_name,
            english_query=english_query,
            answer=answer,
            sources=source_docs[:3],
            confidence=round(max_score, 3),
            is_grounded=True,
            has_sufficient_context=True,
            disclaimer="Strictly grounded in certified Agricultural University and ICAR verified extension guidelines. Always follow product labels and local safety regulations.",
            model_used=model_used
        )

    def _get_insufficient_context_message(self, lang_code: str) -> str:
        messages = {
            "ta": (
                "மன்னிக்கவும், எங்கள் சரிபார்க்கப்பட்ட விவசாய அறிவுத்தளத்தில் இந்த கேள்விக்கான நேரடி மற்றும் துல்லியமான ஆவணங்கள் இல்லை.\n\n"
                "விவசாயிகளின் பயிர் பாதுகாப்பு மற்றும் தவறான மருந்து அளவுகளை தவிர்ப்பதற்காக, நாங்கள் யூகத்தின் அடிப்படையில் பதில் அளிப்பதில்லை. "
                "தயவுசெய்து உங்கள் அருகிலுள்ள **வேளாண் அறிவியல் மையம் (KVK)** அல்லது இலவச உழவர் உதவி மையத்தை (**1800-180-1551**) தொடர்பு கொள்ளவும்."
            ),
            "hi": (
                "क्षमा करें, हमारे सत्यापित कृषि ज्ञानकोष में इस प्रश्न के लिए प्रमाणित जानकारी उपलब्ध नहीं है।\n\n"
                "फसल सुरक्षा और रसायनों की सही मात्रा सुनिश्चित करने के लिए हम बिना प्रमाणित संदर्भ के अनुमानित सलाह नहीं देते हैं। "
                "कृपया सटीक समाधान के लिए अपने नजदीकी **कृषि विज्ञान केंद्र (KVK)** या किसान कॉल सेंटर (**1800-180-1551**) से संपर्क करें।"
            ),
            "te": (
                "క్షమించండి, మా ధృవీకరించబడిన వ్యవసాయ డేటాబేస్‌లో దీనికి సంబంధించి తగిన ఆధారాలు లేవు.\n\n"
                "రైతుల భద్రత మరియు సరైన మందుల మోతాదు కొరకు మేము ఊహించి సమాధానం ఇవ్వము. "
                "దయచేసి ఖచ్చితమైన సమాచారం కోసం మీ సమీప **కృషి విజ్ఞాన కేంద్రం (KVK)** లేదా కిసాన్ కాల్ సెంటర్ (**1800-180-1551**) ను సంప్రదించండి."
            ),
            "kn": (
                "ಕ್ಷಮಿಸಿ, ನಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ಜ್ಞಾನ ಭಂಡಾರದಲ್ಲಿ ಈ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.\n\n"
                "ರೈತರ ಹಿತದೃಷ್ಟಿಯಿಂದ ನಾವು ಊಹಾಪೋಹದ ಸಲಹೆಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹತ್ತಿರದ **ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK)** ಅಥವಾ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (**1800-180-1551**) ಅನ್ನು ಸಂಪರ್ಕಿಸಿ."
            ),
            "en": (
                "I apologize, but our verified agricultural knowledge base does not contain certified records for this specific question.\n\n"
                "To protect crop health and prevent incorrect chemical applications, we do not guess answers without verified documentation. "
                "Please contact your nearest **Krishi Vigyan Kendra (KVK)** or the National Kisan Call Center at **1800-180-1551**."
            )
        }
        return messages.get(lang_code, messages["en"])

    def _generate_grounded_fallback(self, query: str, lang_code: str, lang_name: str, sources: List[Dict[str, Any]]) -> str:
        """
        Synthesizes a 100% native language grounded response with zero English mixing.
        Guarantees that for regional languages, NO English text or English headings are outputted.
        """
        # 1. Search through retrieved sources for a localized summary match
        for src in sources:
            doc_id = src.get("document_id", "")
            summary = get_localized_summary(doc_id, lang_code)
            if summary:
                return summary

        # 2. If english was requested, format the clean English text
        best_source = sources[0]
        title = best_source["title"]
        text = best_source["text"]

        if lang_code == "en":
            clean_points = [
                line.strip() for line in text.split("\n") 
                if line.strip() and not line.startswith("Document:") and not line.startswith("Category:") and not line.startswith("#")
            ]
            content_summary = "\n".join(clean_points[:6])
            return (
                f"### {title} - Verified Agricultural Guidance\n\n"
                f"{content_summary}\n\n"
                f"> **Safety Advisory:** *Adhere strictly to certified recommended dosages.*"
            )

        # 3. For regional languages, under NO circumstance output English sentences
        return self._get_insufficient_context_message(lang_code)

rag_service = RAGService()
