# ⚡ Clarix
### AI-Powered Enterprise Knowledge Retrieval System

> *Because the answers were always there — they just had no voice.*

---

## 🌐 Live Deployment Links

- **Frontend (Vercel):** [Clarix Live](https://clarix-eclipse-hackathon.vercel.app)
- **Backend API (Render):** [Clarix API](https://clarix-eclipse-hackathon.onrender.com) || [Clarix API Docs](https://clarix-eclipse-hackathon.onrender.com/docs)

---

## 🔴 The Problem

Picture this — it's Monday morning. A new employee at a 500-person company asks:
*"What's our leave policy for medical emergencies?"*

Their manager doesn't know. HR is busy. The document exists — buried inside a PDF uploaded two years ago, sitting in a shared drive nobody remembers. Three Slack messages, two forwarded emails, and 40 minutes later — they have an answer that was always there.

**This is the daily reality of enterprise knowledge management.**

Organizations generate thousands of documents — policies, technical guides, SOPs, reports. But knowledge stays locked inside files nobody can efficiently search. Employees waste hours hunting for information that already exists. Productivity bleeds out quietly, every single day.

---

## ✅ Our Solution — Clarix

Clarix is a **multi-tenant AI knowledge retrieval system** that lets employees ask questions in plain English and get instant, cited answers — pulled exclusively from their organization's own documents.

No hallucinations. No internet. No guessing. Just your data, made searchable.

**The same Monday morning scenario with Clarix:**
> *Employee types: "What's our leave policy for medical emergencies?"*
> *Clarix responds in 3 seconds with the exact policy + source document citation.*

---

## � Key Features

- **Multi-Tenant Architecture:** Strict boundaries separating data between different organizations using Neon DB relations and namespaced ChromaDB collections.
- **Advanced RAG Pipeline:** Documents are chunked contextually using LangChain and converted into 384-dimensional vector embeddings using CPU-optimized `all-MiniLM-L6-v2`.
- **Multi-Format Parsing:** Native support for extracting text from `.pdf`, `.docx`, and `.csv` files.
- **Strict Context Adherence:** Gemini 1.5 Flash is heavily prompt-engineered to **only** answer based on retrieved documents, preventing AI hallucinations. If the answer isn't in your docs, the AI will explicitly say: *"I don't know based on the provided context."*
- **Direct Source Citations:** Every answer links back to the exact chunk and filename it learned the information from.

---

## 🏗️ System Architecture & Workflow

### 1. Document Ingestion Pipeline
When an admin uploads a new company document, it goes through a strict chunking and embedding pipeline before becoming searchable:

```mermaid
graph TD
    A[Admin User] -->|Uploads PDF/DOCX/CSV| B(Next.js Frontend)
    B -->|Multipart Form POST| C{FastAPI Backend}
    C -->|Extract Text| D[File Parsers: PyMuPDF / python-docx]
    D -->|Raw Text| E[LangChain RecursiveTextSplitter]
    E -->|Text Chunks| F[SentenceTransformers Embedder]
    F -->|Vector Embeddings| G[(ChromaDB: org_id collection)]
    F -->|File Metadata| H[(PostgreSQL: Neon DB)]
    G -.->|Success| C
    H -.->|Success| C
    C -->|Status 200| B
```

### 2. Retrieval-Augmented Generation (RAG) Query Flow
When an employee asks a question, Clarix intercepts it, finds the most relevant knowledge, and feeds it into the AI to generate a precise answer:

```mermaid
graph TD
    A[Employee] -->|Types Question| B(Next.js Frontend)
    B -->|JWT + Query POST| C{FastAPI Backend}
    C -->|Validate & Extract org_id| D[JWT Middleware]
    D -->|Question Text| E[SentenceTransformers Embedder]
    E -->|Question Vector| F[(ChromaDB: org_id collection)]
    F -->|Cosine Similarity Search| G[Top 5 Relevant Chunks]
    G -->|Context + Original Question| H[Gemini 1.5 Flash LLM]
    H -->|Synthesized Answer| I[Backend API]
    I -->|Answer + Citations| B
    B -->|Displays Result| A
```

**Multi-Tenant Security Isolation** — Every organization's data lives in its own ChromaDB collection. An employee of `Org A` can absolutely never access `Org B`'s documents. The crucial `org_id` is extracted purely from the encrypted JWT token on the server-side and is never trusted or read from client-side request bodies.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, Tailwind CSS, shadcn/ui (Deployed on **Vercel**) |
| **Backend** | Python FastAPI, Uvicorn, SQLAlchemy (Deployed on **Render**) |
| **Database** | PostgreSQL (Neon DB) |
| **Auth** | JWT (python-jose) + bcrypt |
| **AI / LLM** | Google Gemini 1.5 Flash |
| **Embeddings** | PyTorch (CPU-optimized), Sentence-transformers (all-MiniLM-L6-v2) |
| **Vector DB** | ChromaDB (persistent, per-org) |
| **RAG Pipeline** | LangChain |
| **File Parsing** | PyMuPDF, python-docx, pandas |

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- Python 3.10+
- A PostgreSQL Database (Local or Neon DB)

### 2. Run the Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate # Windows
   # source venv/bin/activate   # Mac/Linux
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your Environment Variables in `.env`:
   ```bash
   DATABASE_URL=postgresql://user:password@neon.tech/dbname
   JWT_SECRET=your_super_secret_key
   JWT_ALGORITHM=HS256
   GEMINI_API_KEY=your_google_ai_studio_api_key
   CHROMA_DB_PATH=./chroma_db_v2
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will be running at `http://localhost:10000`*

### 3. Run the Frontend (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set your Environment Variable in `.env`:
   ```bash
   NEXT_PUBLIC_API_URL=http://127.0.0.1:10000
   ```
4. Start the frontend application:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:3000`*

---

## 🧠 Why We Built This
 
We watched smart people waste their smartest hours searching for things that already existed. That felt wrong. So we fixed it.

---

<br/>

> *"The answers were never missing — they were just unheard. We didn't build a search engine. We built a way to finally listen to what your organization already knows."*
