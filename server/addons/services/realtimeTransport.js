// Realtime Transport interface supporting Server-Sent Events (SSE) & polling fallback

class RealtimeTransport {
  constructor() {
    this.clients = new Set(); // { id, sessionId, userId, res }
  }

  addClient(req, res, sessionId, userId) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    const client = {
      id: 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sessionId,
      userId,
      res
    };

    this.clients.add(client);

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId: client.id })}\n\n`);

    req.on('close', () => {
      this.clients.delete(client);
    });

    return client;
  }

  publishToSession(sessionId, eventType, payload) {
    const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (!sessionId || client.sessionId === sessionId) {
        try {
          client.res.write(`data: ${data}\n\n`);
        } catch (err) {
          this.clients.delete(client);
        }
      }
    }
  }

  publishToUser(userId, eventType, payload) {
    const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (client.userId === userId) {
        try {
          client.res.write(`data: ${data}\n\n`);
        } catch (err) {
          this.clients.delete(client);
        }
      }
    }
  }
}

export const realtimeTransport = new RealtimeTransport();
