# 🤖 Workflow AI — Phát triển ứng dụng AI

Dùng workflow này khi bạn làm: chatbot, RAG system, LLM integration, AI agent, ML inference API, NLP processing, computer vision, automation AI.

> **🌏 LUẬT NGÔN NGỮ**: UI text trong AI app (chat message, label, thông báo, hướng dẫn) phải là **tiếng Việt**.

## 🚀 Quy trình vibe code AI

### Bước 1: Chọn stack

#### Backend (Python - mặc định)
| Stack | Khi nào dùng |
|-------|-------------|
| FastAPI + LangChain | **Mặc định** — RAG, chatbot, agent |
| FastAPI + LlamaIndex | Document-heavy RAG, data pipeline |
| FastAPI + direct OpenAI/Claude API | Đơn giản, gọi LLM trực tiếp |
| Django + Celery | Production, task queue, heavy processing |

#### LLM Provider
| Provider | Khi nào dùng |
|----------|-------------|
| OpenAI GPT-4o | **Mặc định** — mạnh, dễ dùng |
| Claude 3.5 Sonnet | Code generation, reasoning |
| Gemini | Free tier, multimodal |
| Local (Ollama) | Offline, privacy, không internet |

#### Database & Vector Store
| Tool | Khi nào dùng |
|------|-------------|
| PostgreSQL + pgvector | **Mặc định** — lưu cả data + vector |
| ChromaDB | Prototype, local dev |
| Pinecone / Weaviate | Production-scale vector search |
| Redis | Cache, session, rate limiting |

### Bước 2: Setup

```bash
# Python + FastAPI (mặc định)
mkdir app
cd app
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1
pip install fastapi uvicorn langchain openai pydantic

# PostgreSQL + pgvector
pip install psycopg2-binary sqlalchemy pgvector
```

### Bước 2.1: Setup `.gitignore`

Sau khi setup, đảm bảo `.gitignore` đúng chuẩn Python/AI:
- Luôn có `.opencode`, `.playwright-mcp`, `.gitignore`, `__pycache__/`, `*.pyc`, `.venv/`, `.env`, `*.egg-info/`, `dist/`
- Nếu đã có `.gitignore` → chỉ cần ensure `.opencode`, `.playwright-mcp`, `.gitignore` được thêm vào

### Bước 3: Cấu trúc thư mục AI chuẩn
`api/` → `core/` → `models/` → `services/` (llm, rag, embedding, agent) → `vector_store/` → `prompts/` → `utils/`

### Bước 4: Flow code AI

```
Setup LLM → API → RAG Pipeline → Agent/Tools → Frontend Chat → Deploy
```

Chi tiết:
1. **LLM Setup**: Kết nối provider, system prompt, temperature, max tokens
2. **API Routes**: Chat endpoint (streaming), upload file, query history
3. **RAG Pipeline**: Load → Chunk → Embed → Store → Retrieve → Generate
4. **Agent/Tools**: Function calling, tool definitions, multi-step reasoning
5. **Frontend Chat**: UI chat box (Streamlit / React), markdown rendering
6. **Deploy**: Docker + Cloud Run / Railway / tự host

### Bước 5: Các mẫu AI phổ biến

| Pattern | Cài đặt |
|---------|---------|
| Chat đơn giản | `openai.ChatCompletion` → stream response |
| RAG với PDF | Load PDF → chunk → embed → pgvector → retrieve → LLM |
| AI Agent | Tool definitions → LLM chọn tool → execute → loop |
| Multi-modal | Upload image → LLM vision → phân tích |
| Streaming | SSE / WebSocket → response từng token |
| Function Calling | LLM trả về JSON action → execute → return result |

### Bước 6: Security

- ✅ Rate limiting trên chat endpoint
- ✅ Input sanitization (prompt injection defense)
- ✅ User authentication (nếu multi-user)
- ✅ Token limits & cost monitoring
- ✅ Logging tất cả LLM calls (audit)

## Post-code: route đến agents theo company workflow pattern (test → fix → review → build → persist). Xem `workflows/company.workflow.md`.
