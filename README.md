# Kisan Sahayak (किसान सहायक / உழவர் உதவியாளர்)
### Multilingual Farmer Knowledge Assistant (RAG Prototype)

A full-stack, Retrieval-Augmented Generation (RAG) web application built to empower farmers to ask agricultural questions in their regional language (**Tamil**, **Hindi**, **Telugu**, **Kannada**, etc.) and receive accurate, grounded, and non-hallucinated advisory backed by verified agricultural extension records.

---

## 🌾 Key Features

1. **Regional Language Understanding**:
   - Accepts queries in native Indian scripts (e.g., தமிழ், हिन्दी, తెలుగు, ಕನ್ನಡ, English).
   - Real-time **Web Speech API** integration for native voice recognition and microphone dictation.
   - Text-to-Speech (TTS) audio readout of recommendations in the farmer's language.

2. **Grounded RAG Pipeline**:
   - Dense vector retrieval powered by **ChromaDB** and multilingual sentence transformers (`paraphrase-multilingual-MiniLM-L12-v2`).
   - Query translation: Regional query is mapped to semantic English search terms via LLM / rule-based layer to match high-precision agricultural taxonomies.
   - Strict Anti-Hallucination Guardrails: Claude Sonnet is instructed to answer **ONLY** from retrieved context chunks. If verified records lack sufficient evidence, it explicitly reports uncertainty and recommends visiting the local Krishi Vigyan Kendra (KVK) rather than guessing critical chemical dosages.

3. **Source Transparency & Farmer Trust**:
   - Every answer displays a **Grounding Badge** and lists the exact source documents used.
   - Farmers or field extension workers can click **"View Source Documents"** to inspect the exact reference text, similarity match percentage, and document category.

4. **Curated Agricultural Knowledge Base**:
   - 16 verified markdown reference guides covering:
     - **Pests & Diseases**: Rice Blast, Cotton Pink Bollworm, Wheat Yellow Rust, Sugarcane Red Rot, Maize Fall Armyworm, Tomato Leaf Curl Virus.
     - **Fertilizer Schedules**: Recommended NPK dosages and application timetables for Rice, Wheat, Cotton, and Sugarcane.
     - **Irrigation Guidance**: Drip & sprinkler efficiency, acid washing for clogged emitters, critical crop moisture stress stages.
     - **Government Schemes**: PM-KISAN (₹6000/yr), PMFBY Crop Insurance (72-hour claim rule), Soil Health Card (12 parameters), Kisan Credit Card (4% subsidized interest rate).

---

## 🏗️ Architecture & Component Flow

```
[Farmer: Voice / Text] 
         │ (e.g., "நெல் குலை நோய் கட்டுப்பாடு என்ன?")
         ▼
[React + Tailwind Mobile-First Frontend]
         │ POST /api/query
         ▼
[FastAPI Backend]
         │
         ├── 1. Language Detection & Normalization (Tamil detected)
         ├── 2. Query Translation to Agricultural English ("Rice blast disease symptoms and fungicide control")
         ├── 3. Dense Retrieval: ChromaDB + Multilingual Sentence Transformers (Cosine Similarity)
         │       └── Retrieves Top 3 Chunks from `pest_rice_blast.md`
         ├── 4. Grounding Check:
         │       └── If similarity < threshold: Return safe refusal in Tamil
         │       └── If verified chunks present: Construct anti-hallucination prompt
         ├── 5. LLM Synthesis (Google Gemini 2.0 Flash via google-genai SDK):
         │       └── Answers strictly from context, outputs in Tamil with exact dosages (Tricyclazole 75% WP @ 0.6g/L)
         ▼
[Response to Farmer]
         ├── Local Language Answer (Tamil / Hindi / Telugu)
         ├── Grounding Status: "100% Grounded in Verified Agri Records"
         └── Source Transparency Cards (Document, Category, Match Score, Excerpt)
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10 or 3.11) with `uv` or standard `python -m venv`

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment and activate
uv venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env
# Edit .env and set your Google Gemini API Key (get one free at https://aistudio.google.com/apikey):
# GEMINI_API_KEY=AIzaSy...
# GEMINI_MODEL=gemini-2.0-flash

# Ingest knowledge base into local ChromaDB
python scripts/ingest.py

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be accessible at:
- API Root: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will be running at: `http://localhost:5173` (automatically proxies `/api` requests to backend at `http://localhost:8000`).

---

## 🧪 Testing the Prototype

1. **Pest Advisory in Tamil**:
   - Query: `நெல் பயிரில் குலை நோய் (Blast) வந்தால் என்ன மருந்து தெளிக்க வேண்டும்?`
   - Result: Recommends Tricyclazole 75% WP @ 0.6 g/L, cites `pest_rice_blast.md`.
2. **Fertilizer Schedule in Hindi**:
   - Query: `गेहूं की फसल में यूरिया और डीएपी कब और कितना डालना चाहिए?`
   - Result: Details basal application at sowing and CRI irrigation stages, cites `fertilizer_wheat_schedule.md`.
3. **Pest Control in Telugu**:
   - Query: `పత్తిలో గులాబీ రంగు కాయ తొలుచు పురుగు నివారణ ఏమిటి?`
   - Result: Pheromone traps and Emamectin Benzoate dosages, cites `pest_cotton_pink_bollworm.md`.
4. **Anti-Hallucination Guardrail Check**:
   - Query: `What is the best way to repair an airplane engine?`
   - Result: Refuses to guess out-of-domain content, explaining that the verified agricultural database has no records.

---

## ⚖️ Prototype Trade-offs vs. Production-Ready System

| Dimension | This Prototype | Production-Ready Target |
| :--- | :--- | :--- |
| **Vector DB** | Local **ChromaDB** (embedded file store) | Managed **Pinecone**, **Qdrant**, or **pgvector** with high availability & clustering |
| **Knowledge Base** | 16 curated Markdown files | Automated ETL pipeline ingesting thousands of ICAR, TNAU, and SAU package-of-practices PDFs |
| **Translation** | LLM-based query normalization + script heuristics | Dedicated translation pipeline (Bhashini API / AI4Bharat IndicTrans2) for 22 Indian languages |
| **Voice Interface** | Browser Web Speech API | Whisper / Conformer fine-tuned on regional rural accents and dialects + IVR telephony gateway |
| **Offline Support** | Online web application | On-device quantized SLM (e.g. Gemma 2B) or local caching for low-connectivity rural areas |
| **Access Channel** | Web app (mobile browser) | **WhatsApp Business Bot**, Telegram, and Toll-Free Voice IVR (Interactive Voice Response) |

---

## 🔮 Future Roadmap (Out of Scope for Initial Prototype)

1. **Automated Ingestion Pipeline**: Ingest official State Agriculture University PDF bulletins via unstructured text extractors, table parsers, and periodic crawlers.
2. **WhatsApp & SMS Bot**: Allow farmers to send voice notes or photos of diseased crops directly on WhatsApp without needing a web browser.
3. **Computer Vision for Leaf Pathology**: Add a vision model to diagnose plant diseases directly from leaf photos uploaded by the farmer.
4. **User Authentication & Land Profile**: Store farmer landholding size, soil type, and current crops to provide hyper-personalized stage-wise advisories.
5. **Weather & Market Price Integration**: Connect real-time mandi prices (e-NAM) and local block-level weather forecasts.
