# Research Agent - Chatbot Setup Guide

## Overview
This is a multi-agent research chatbot system with:
- **Backend**: Python Flask API with Tavily web search + OpenRouter LLM
- **Frontend**: React chatbot interface with TypeScript
- **Database**: ChromaDB for document storage and retrieval

## Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

## Environment Setup

### 1. Python Backend Setup

```bash
# Navigate to project root
cd Research_Agent

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Return to root
cd ..
```

### 3. Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
OPENROUTER_API_KEY=your_openrouter_api_key
GOOGLE_API_KEY=your_google_api_key
TAVILY_API_KEY=your_tavily_api_key
GEMINI_API_KEY=your_gemini_api_key (optional fallback)
PYTHON_BACKEND_URL=http://localhost:5000
```

Get your API keys from:
- **OpenRouter**: https://openrouter.ai/
- **Tavily**: https://www.tavily.com/
- **Google**: https://ai.google.dev/

## Running the System

### Option 1: Using Startup Script (Windows)
```bash
START.bat
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
# Activate venv
venv\Scripts\activate

# Start Flask server
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Default Credentials**: admin / nexus123

## API Endpoints

### Backend (Python Flask - Port 5000)

**POST /api/chat**
- Send a chat message with research capability
- Body: `{ message, history, agent, language }`
- Returns: `{ text, agent, success }`

**POST /api/research**
- Perform advanced research with web search
- Body: `{ query }`
- Returns: `{ report, query, sources_count, success }`

**GET /api/health**
- Health check endpoint

**GET /api/agents**
- Get list of available research agents

**POST /api/clear-history**
- Clear conversation history

### Frontend (Express - Port 3000)

**POST /api/login**
- Authenticate user
- Body: `{ username, password }`

**POST /api/register**
- Create new user account
- Body: `{ username, password }`

## Features

### Research Agents
1. **Coordinator**: Routes tasks and synthesizes views
2. **Researcher**: Deep data gathering and fact finding
3. **Analyst**: Quantitative analysis and pattern detection
4. **Security**: Compliance and safety checks

### Capabilities
- Real-time web search via Tavily
- Vector database for document retrieval (ChromaDB)
- Multi-language support
- Chat history management
- Multiple AI agents for different research styles

## Architecture

```
Research_Agent/
├── app.py                 # Python Flask backend
├── main.py               # Original CLI research tool
├── memory.py             # Vector DB (ChromaDB) management
├── models.py             # Model utilities
├── requirements.txt      # Python dependencies
├── frontend/
│   ├── server.ts        # Express server
│   ├── package.json     # Node dependencies
│   ├── vite.config.ts   # Vite configuration
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── Login.tsx
│           ├── ResearchDashboard.tsx
│           ├── Background.tsx
│           └── LanguageSelector.tsx
└── .env                 # Environment variables
```

## Troubleshooting

### Backend not connecting
- Ensure Flask is running on port 5000
- Check `PYTHON_BACKEND_URL` in `.env` file
- Look for CORS errors in browser console

### API key errors
- Verify all API keys are correctly set in `.env`
- Check that API key quotas are not exceeded

### Chat not responding
- Backend will fallback to Gemini if Tavily/OpenRouter fails
- Check API key validity

## Development

### Hot Reload
- Frontend: Automatically reloads with Vite
- Backend: Restart `python app.py` for changes

### Debugging
- Backend logs: Check terminal where `python app.py` is running
- Frontend logs: Check browser console (F12)

## Performance Notes

- First research query takes ~5-10 seconds (web search + embedding)
- Subsequent queries with similar topics use cached embeddings
- Conversation history limited to ~10 messages per request for performance

## Future Improvements

- Database persistence for user sessions
- Advanced caching strategies
- Real-time streaming responses
- Additional research sources
- Custom prompt engineering per agent

## Support

For issues or questions:
1. Check that all prerequisites are installed
2. Verify API keys are valid
3. Ensure both backend and frontend are running
4. Check network connectivity

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-18
