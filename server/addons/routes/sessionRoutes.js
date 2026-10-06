import express from 'express';
import { requireAuth, requireRole, parseTokenFromReq } from '../middleware/addonAuth.js';
import { createSession, joinSession, endSession, getSessionInfo } from '../services/sessionService.js';
import { addonStore } from '../db/addonStore.js';

const router = express.Router();

// Teacher creates session
router.post('/create', requireAuth, requireRole('teacher'), (req, res) => {
  try {
    const session = createSession(req.user.id);
    res.status(201).json({ session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Student joins session with join code (supports authenticated students & guest students)
router.post('/join', (req, res, next) => {
  const token = parseTokenFromReq(req);
  if (!token) {
    req.user = { id: 'guest_std_' + Math.random().toString(36).substring(2, 8), name: 'Guest Student', role: 'student' };
    return next();
  }
  return requireAuth(req, res, next);
}, (req, res) => {
  try {
    const { joinCode } = req.body;
    if (!joinCode) {
      return res.status(400).json({ error: 'Join code is required' });
    }
    const { session, member } = joinSession(joinCode, req.user.id);
    res.json({ session, member });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher ends session
router.post('/end', requireAuth, requireRole('teacher'), (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }
    const session = endSession(sessionId, req.user.id);
    res.json({ session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get session details & members
router.get('/:sessionId', requireAuth, (req, res) => {
  try {
    const info = getSessionInfo(req.params.sessionId);
    if (!info) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
