# Workflow AI — Phát triển ứng dụng AI

> **LUẬT NGÔN NGỮ**: UI text trong AI app (chat message, label, thông báo) = **tiếng Việt**.

## Bước 1: Stack
**Backend**: FastAPI + LangChain (mặc định), FastAPI + LlamaIndex, Django + Celery
**LLM**: OpenAI GPT-4o (mặc định), Claude 3.5, Gemini, Local (Ollama)
**DB/Vector**: PostgreSQL + pgvector (mặc định), ChromaDB, Pinecone, Redis

## Bước 2: Setup
```bash
python -m venv .venv && pip install fastapi uvicorn langchain openai pydantic
pip install psycopg2-binary sqlalchemy pgvector
```
`.gitignore`: `.opencode/`, `.github/`, `.gitignore`, `__pycache__/`, `*.pyc`, `.venv/`, `.env`

## Bước 3: Cấu trúc
`api/` → `core/` → `models/` → `services/` (llm, rag, embedding, agent) → `vector_store/` → `prompts/` → `utils/`

## Bước 4: Flow code
`Setup LLM → API → RAG Pipeline → Agent/Tools → Frontend Chat → Deploy`

Chi tiết: LLM Setup → API Routes (streaming) → RAG (Load→Chunk→Embed→Store→Retrieve→Generate) → Agent/Tools (function calling, multi-step) → Frontend Chat → Deploy

## Bước 5: Patterns
Chat đơn giản / RAG với PDF / AI Agent / Multi-modal / Streaming SSE / Function Calling

## Bước 6: Security
Rate limiting, input sanitization (prompt injection defense), auth, token limits + cost monitoring, logging LLM calls

## Post-code: route đến agents theo company workflow pattern. Xem `workflows/company.workflow.md`.
