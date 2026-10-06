import express from 'express';

const router = express.Router();

// In-memory session store: Map<sessionId, { hostName, transcript[], active, createdAt, lastActivity, subscribers[] }>
const sessions = new Map();

// Cleanup sessions older than 2 hours
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      // Close any open SSE connections
      session.subscribers.forEach(res => {
        try { res.end(); } catch (_) {}
      });
      sessions.delete(id);
      console.log(`[Sessions] Cleaned up expired session: ${id}`);
    }
  }
}, 5 * 60 * 1000); // run every 5 minutes

// POST /api/sessions/create
router.post('/create', (req, res) => {
  const { sessionId, hostName } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const joinUrl = `${req.protocol}://${req.get('host')}/join/${sessionId}`;

  const existing = sessions.get(sessionId);

  // Preserve existing subscribers (students who scanned QR early) and transcript
  sessions.set(sessionId, {
    hostName: hostName || 'Teacher',
    transcript: existing?.transcript || [],
    active: true,
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastActivity: Date.now(),
    subscribers: existing?.subscribers || []
  });

  res.json({ sessionId, joinUrl, createdAt: new Date().toISOString() });
});

// POST /api/sessions/:sessionId/push
router.post('/:sessionId/push', (req, res) => {
  const { sessionId } = req.params;
  const { line, translated, language } = req.body;

  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const event = {
    line: line || '',
    translated: translated || '',
    language: language || 'en',
    timestamp: new Date().toISOString()
  };

  session.transcript.push(event);
  session.lastActivity = Date.now();

  // Push to all SSE subscribers
  const data = `data: ${JSON.stringify(event)}\n\n`;
  session.subscribers.forEach(subRes => {
    try { subRes.write(data); } catch (_) {}
  });

  res.json({ success: true, subscriberCount: session.subscribers.length });
});

// GET /api/sessions/:sessionId/stream (SSE)
router.get('/:sessionId/stream', (req, res) => {
  const { sessionId } = req.params;
  let session = sessions.get(sessionId);

  // Auto-create a pending session if student connects before teacher
  if (!session) {
    session = {
      hostName: 'Teacher',
      transcript: [],
      active: false,
      createdAt: new Date().toISOString(),
      lastActivity: Date.now(),
      subscribers: []
    };
    sessions.set(sessionId, session);
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send all existing transcript lines first
  session.transcript.forEach(event => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Add this subscriber to live push list
  session.subscribers.push(res);
  session.lastActivity = Date.now();

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (_) {}
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    if (sessions.has(sessionId)) {
      const s = sessions.get(sessionId);
      s.subscribers = s.subscribers.filter(sub => sub !== res);
    }
  });
});

// GET /api/sessions/:sessionId (check if session exists)
router.get('/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ 
    sessionId: req.params.sessionId,
    hostName: session.hostName,
    active: session.active,
    lineCount: session.transcript.length,
    createdAt: session.createdAt
  });
});

export default router;
