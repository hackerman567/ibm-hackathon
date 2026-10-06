import express from 'express';
import { realtimeTransport } from '../services/realtimeTransport.js';
import { parseTokenFromReq } from '../middleware/addonAuth.js';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = express.Router();

router.get('/stream', (req, res) => {
  const sessionId = req.query.sessionId || null;
  let userId = req.query.userId || null;

  // Attempt to parse token if provided in query or auth cookie
  const token = req.query.token || parseTokenFromReq(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      // Allow connection as anonymous student
    }
  }

  realtimeTransport.addClient(req, res, sessionId, userId);
});

export default router;
