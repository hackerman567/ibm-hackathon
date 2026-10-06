// In-memory session store (note: serverless functions are stateless,
// so sessions will not persist across cold starts. This is a best-effort
// implementation for the hackathon demo. For production, use a database like
// Vercel KV, Upstash Redis, or Supabase.)
const sessions = new Map();

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `https://${req.headers.host}`);
  // Extract the dynamic path segments after /api/sessions/
  const segments = pathname.replace('/api/sessions', '').split('/').filter(Boolean);
  const sessionId = segments[0];
  const action = segments[1]; // e.g. "push", "stream"

  // --- POST /api/sessions/create ---
  if (req.method === 'POST' && (pathname.endsWith('/create') || segments[0] === 'create')) {
    const { sessionId: bodySessionId, hostName } = req.body;
    if (!bodySessionId) return res.status(400).json({ error: 'sessionId required' });

    const joinUrl = `https://${req.headers.host}/join/${bodySessionId}`;

    const existing = sessions.get(bodySessionId);
    sessions.set(bodySessionId, {
      hostName: hostName || 'Teacher',
      transcript: existing?.transcript || [],
      active: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      lastActivity: Date.now(),
      subscribers: []
    });

    return res.json({ sessionId: bodySessionId, joinUrl, createdAt: new Date().toISOString() });
  }

  // --- POST /api/sessions/:sessionId/push ---
  if (req.method === 'POST' && action === 'push' && sessionId) {
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

    return res.json({ success: true, subscriberCount: 0 });
  }

  // --- GET /api/sessions/:sessionId ---
  if (req.method === 'GET' && sessionId && !action) {
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({
      sessionId,
      hostName: session.hostName,
      active: session.active,
      lineCount: session.transcript.length,
      createdAt: session.createdAt
    });
  }

  // --- GET /api/sessions/:sessionId/stream ---
  // SSE is not supported in Vercel serverless. Return transcript as JSON instead.
  if (req.method === 'GET' && action === 'stream' && sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      return res.json({ transcript: [], message: 'Session not found or not yet created.' });
    }
    return res.json({ transcript: session.transcript });
  }

  return res.status(404).json({ error: 'Route not found' });
}
