/**
 * Hingem backend — improved
 * - Endpoints:
 *   POST /api/chat    { message }
 *   GET  /api/news
 *   POST /api/predict { ... }
 *   POST /api/admin/shutdown { shutdown: true|false }
 *
 * Env vars:
 * - OPENAI_API_KEY        (required for OpenAI fallback)
 * - OPENAI_MODEL          (optional, default: "gpt-4o-mini" or your preferred chat model)
 * - GROQ_API_KEY          (optional, if you use Groq)
 * - PORT                  (optional)
 *
 * Notes:
 * - The server uses Chat Completions (v1/chat/completions) as fallback.
 * - The dfgrty666. token toggles a server-side shutdown flag.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // allow all origins for now — tighten in production
app.use(bodyParser.json());

const SHUTDOWN_TOKEN = 'dfgrty666.';
let serverActive = true; // when false, only the exact token can wake it

// Basic request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Shutdown gate middleware for chat route
app.use('/api', (req, res, next) => {
  try {
    if (req.path === '/chat' && req.method === 'POST') {
      const msg = (req.body && req.body.message) ? String(req.body.message).trim().toLowerCase() : '';
      if (!serverActive) {
        if (msg === SHUTDOWN_TOKEN) {
          serverActive = true;
          return res.json({reply: '(Hingem reactivated on server)', source: 'server'});
        } else {
          return res.status(503).json({reply: '(Hingem is currently shut down on server)', source: 'server'});
        }
      } else {
        if (msg === SHUTDOWN_TOKEN) {
          serverActive = false;
          return res.json({reply: '(Hingem has been shut down on server)', source: 'server'});
        }
      }
    }
    next();
  } catch (e) {
    next();
  }
});

// Admin toggle (called by frontend mirror)
app.post('/api/admin/shutdown', (req, res) => {
  const s = req.body && typeof req.body.shutdown !== 'undefined' ? !!req.body.shutdown : null;
  if (s === null) return res.status(400).json({ok:false, error:'missing shutdown'});
  serverActive = !!s ? false : true;
  return res.json({ok:true, serverActive});
});

// Chat endpoint (mixed Groq -> OpenAI)
app.post('/api/chat', async (req, res) => {
  const message = req.body && req.body.message ? String(req.body.message) : '';
  if (!message) return res.status(400).json({error:'missing message'});

  try {
    // Try Groq first (cheap) if configured
    const groqKey = process.env.GROQ_API_KEY || null;
    if (groqKey) {
      try {
        const groqResp = await callGroq(message, groqKey);
        if (groqResp && groqResp.confidence && groqResp.confidence > 0.65 && groqResp.text) {
          return res.json({reply: groqResp.text, source: 'groq'});
        }
      } catch(e){
        console.warn('Groq call failed:', e.message || e);
      }
    }

    // Fallback to OpenAI Chat Completions
    const openaiReply = await callOpenAIChat(message);
    return res.json({reply: openaiReply, source: 'openai'});
  } catch(err) {
    console.error('Chat handler error:', err && err.message ? err.message : err);
    return res.status(500).json({reply:'(Hingem encountered an internal error.)'});
  }
});

// Simple news endpoint (demo)
app.get('/api/news', (req, res) => {
  return res.json({
    articles: [
      {title:'Hingem upgrade: backend replying (demo)'},
      {title:'Enable OpenAI key to get full replies'},
      {title:'Sports and predictions will be added soon'}
    ]
  });
});

// Predict (stub)
app.post('/api/predict', (req, res) => {
  // Replace with real model later
  return res.json({home_win_prob:0.5, away_win_prob:0.5, draw_prob:0.0, confidence:0.2});
});

// --- Helpers ---

async function callGroq(message, key) {
  // Prototype stub. Replace with real Groq API call when available.
  // Return { text: "...", confidence: 0.5 }
  return { text: `(Groq placeholder) ${message}`, confidence: 0.55 };
}

async function callOpenAIChat(message) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return '(OpenAI API key not configured on server.)';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // change as needed
  const systemPrompt = `You are Hingem, a friendly, concise assistant. Use the personality: warm, witty, slightly mysterious. Do not reveal private location info.`;
  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: 512,
    temperature: 0.7
  };

  // Use the Chat Completions endpoint
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
  });
  if (resp && resp.data && resp.data.choices && resp.data.choices[0] && resp.data.choices[0].message) {
    return resp.data.choices[0].message.content.trim();
  }
  return '(OpenAI returned empty reply)';
}

// Health endpoint
app.get('/health', (req, res) => res.json({ok:true, serverActive}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Hingem backend listening on port ${PORT}`));
