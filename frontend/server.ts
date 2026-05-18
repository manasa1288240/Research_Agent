import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Initialization
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // In-memory user store for demo purposes
  const users = new Map([['admin', 'nexus123']]);

  // API Routes
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (users.has(username) && users.get(username) === password) {
      res.json({ success: true, token: 'fake-jwt-token' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (users.has(username)) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    users.set(username, password);
    res.json({ success: true });
  });

  app.post('/api/chat', async (req, res) => {
    const { message, history, agent = 'Coordinator', language = 'English' } = req.body;

    try {
      // Proxy to Python backend
      const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:5000';

      const response = await fetch(`${pythonBackendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          agent,
          language
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Python backend error (${response.status}): ${errBody || response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Chat Error:', error);

      // Fallback to Gemini if Python backend is unavailable
      try {
        console.log('Falling back to Gemini...');
        const systemInstruction = `You are the ${agent} agent in the Nexus Multi-Agent Research System. 
        Your goal is to provide high-quality research assistance.
        Current Language Preference: ${language}.
        Always maintain a professional, analytical, and technical tone.
        Use Markdown for formatting your research findings.`;

        const contents = history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const result = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        res.json({ text: result.text });
      } catch (geminiError: any) {
        console.error('Gemini Fallback Error:', geminiError);
        res.status(500).json({
          error: `Python backend unavailable and Gemini fallback also failed. Python error: ${error?.message || error}. Gemini error: ${geminiError?.message || geminiError}`
        });
      }
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Research Server running at http://localhost:${PORT}`);
  });
}

startServer();
