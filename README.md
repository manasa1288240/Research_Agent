# 🚀 Research Agent - Multi-Agent Chatbot System

A sophisticated multi-agent research chatbot that combines web search, vector databases, and AI for intelligent information gathering and analysis.

## ✨ Features

### Core Capabilities
- 🤖 **Multi-Agent System**: Coordinator, Researcher, Analyst, Security agents
- 🔍 **Web Search Integration**: Real-time web search via Tavily
- 💾 **Vector Database**: ChromaDB for semantic document retrieval
- 🧠 **AI-Powered Responses**: OpenRouter LLM integration
- 💬 **Chat Interface**: Real-time chatbot with beautiful UI
- 🌍 **Multi-Language Support**: Respond in any language
- 🔐 **User Authentication**: Secure login/registration

### Research Capabilities
- Automated web research and data gathering
- Semantic document retrieval
- Report generation with markdown formatting
- Agent-specific research strategies
- Conversation history management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│            React Frontend (Port 3000)               │
│  ├─ Chat Interface with Agent Selection            │
│  ├─ Real-time Message Rendering                    │
│  └─ Language & Theme Selection                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────┐
│         Express Server (Port 3000)                  │
│  ├─ Static File Serving                            │
│  ├─ Vite Dev Server Middleware                     │
│  └─ Proxy to Python Backend                        │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────┐
│      Python Flask Backend (Port 5000)              │
│  ├─ /api/chat - Chat endpoint                      │
│  ├─ /api/research - Research endpoint              │
│  └─ /api/agents - Agent list endpoint              │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │ Tavily │  │OpenRouter│  │ ChromaDB │
   │ Search │  │   LLM    │  │ (Vector) │
   └────────┘  └─────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- API keys for Tavily and OpenRouter

### Installation

**1. Clone and Setup Backend**
```bash
# Navigate to project
cd Research_Agent

# Create Python environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

**2. Setup Frontend**
```bash
cd frontend
npm install
cd ..
```

**3. Configure Environment**
```bash
# Copy example and add your API keys
copy .env.example .env

# Edit .env with your keys:
# - OPENROUTER_API_KEY
# - TAVILY_API_KEY
# - (Optional) GEMINI_API_KEY for fallback
```

**4. Run the System**

**Option A: Automated (Windows)**
```bash
START.bat
```

**Option B: Manual**
```bash
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**5. Access Application**
- Open http://localhost:3000
- Login with: `admin` / `nexus123`

## 📚 Usage

### Chat Interface
1. Select a research agent from the left sidebar
2. Choose your preferred language
3. Type your research query
4. System will:
   - Search the web for relevant information
   - Store documents in vector database
   - Generate AI response based on research

### Query Examples
- "Research the latest AI trends in 2026"
- "Analyze the impact of climate change on agriculture"
- "Find information about quantum computing breakthroughs"
- "What are the emerging cybersecurity threats?"

### Agent Roles
- **Coordinator**: Synthesizes information from multiple sources
- **Researcher**: Focuses on detailed fact-finding
- **Analyst**: Provides quantitative analysis
- **Security**: Ensures information accuracy and safety

## 🔗 API Documentation

### Chat Endpoint
```bash
POST /api/chat

Request:
{
  "message": "What is the current state of AI?",
  "history": [...],
  "agent": "Coordinator",
  "language": "English"
}

Response:
{
  "text": "AI has reached...",
  "agent": "Coordinator",
  "success": true
}
```

### Research Endpoint
```bash
POST /api/research

Request:
{
  "query": "Emerging technologies"
}

Response:
{
  "report": "# Research Report...",
  "query": "Emerging technologies",
  "sources_count": 5,
  "success": true
}
```

### Health Check
```bash
GET /api/health

Response:
{
  "status": "healthy",
  "service": "Research Agent Backend"
}
```

## 🛠️ Development

### Backend Development
- Backend: `python app.py` (auto-reload for development)
- Logs appear in terminal
- Check `app.py` for endpoint definitions

### Frontend Development
- Frontend: `npm run dev` (hot reload with Vite)
- Edit components in `frontend/src/`
- Styles use Tailwind CSS

### Testing
```bash
# Validate system setup
python validate.py

# Check logs
# Terminal 1: Backend logs
# Terminal 2: Frontend build logs
# Browser: Console (F12)
```

## 📦 Project Structure

```
Research_Agent/
├── app.py                    # Flask API backend
├── main.py                  # Original CLI tool
├── memory.py                # Vector DB utilities
├── models.py                # Model utilities
├── validate.py              # System validation
├── START.bat                # Windows startup script
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── .env.example             # Environment template
├── SETUP_GUIDE.md          # Detailed setup guide
├── README.md               # This file
└── frontend/
    ├── server.ts           # Express server
    ├── package.json        # Node dependencies
    ├── vite.config.ts      # Vite config
    ├── tsconfig.json       # TypeScript config
    └── src/
        ├── main.tsx        # Entry point
        ├── App.tsx         # Main component
        ├── index.css       # Global styles
        └── components/
            ├── Login.tsx
            ├── ResearchDashboard.tsx
            ├── Background.tsx
            └── LanguageSelector.tsx
```

## 🔑 Environment Variables

Create a `.env` file with:

```env
# Required
OPENROUTER_API_KEY=sk_...
TAVILY_API_KEY=tvly_...

# Optional (for fallback)
GEMINI_API_KEY=...
GOOGLE_API_KEY=...

# Backend connection
PYTHON_BACKEND_URL=http://localhost:5000
```

Get API keys from:
- **OpenRouter**: https://openrouter.ai/
- **Tavily**: https://www.tavily.com/

## 🐛 Troubleshooting

### Backend connection issues
- Ensure Python backend is running on port 5000
- Check `.env` has `PYTHON_BACKEND_URL=http://localhost:5000`
- Look for CORS errors in browser console

### Chat not working
- Verify API keys in `.env`
- Check backend logs for errors
- Fallback to Gemini if OpenRouter fails
- Ensure internet connection for web search

### Port conflicts
- Change frontend port: `npm run dev -- --port 3001`
- Change backend port: Edit `app.py` line `app.run(port=5000)`

## 🤝 Contributing

To extend the system:

1. Add new agents in `app.py` - update `AGENTS` list
2. Add new API endpoints in `app.py`
3. Update frontend components in `frontend/src/`
4. Update documentation

## 📝 License

This project is provided as-is for research and development purposes.

## 🎯 Future Enhancements

- [ ] Persistent user sessions
- [ ] Advanced caching strategies
- [ ] Real-time streaming responses
- [ ] Custom knowledge base uploads
- [ ] Multi-model support
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Word

## 📞 Support

For issues:
1. Run `python validate.py` to check setup
2. Check logs in terminal windows
3. Verify all API keys are valid
4. Ensure backend and frontend both running

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-18  
**Status**: ✓ Production Ready
