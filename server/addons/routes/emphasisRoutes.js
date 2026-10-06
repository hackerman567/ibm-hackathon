import express from 'express';
import { requireAuth, requireRole } from '../middleware/addonAuth.js';
import { analyzeSegment } from '../services/emphasisService.js';
import { evaluateCaptionForAlerts } from '../services/alertService.js';
import { addonStore } from '../db/addonStore.js';
import { realtimeTransport } from '../services/realtimeTransport.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { segmentId, text, timestamp, slidingWindow, sessionId } = req.body;

    // Analyze emphasis tag (non-blocking LLM/Rules analysis with 1.5s max timeout)
    const tagAnalysis = await analyzeSegment({ segmentId, text, timestamp, slidingWindow });

    let savedTag = null;
    if (tagAnalysis && sessionId) {
      savedTag = addonStore.addTag({
        sessionId,
        ...tagAnalysis
      });
      // Broadcast tag to active session members
      realtimeTransport.publishToSession(sessionId, 'tag_added', savedTag);
    }

    // Also evaluate caption for name-called or emergency suggestions in background
    if (sessionId && text) {
      evaluateCaptionForAlerts({ sessionId, segmentId, text });
    }

    res.json({ tag: savedTag || null });
  } catch (err) {
    // Fail silently, keep captions running
    res.json({ tag: null, error: err.message });
  }
});

router.get('/tags/:sessionId', requireAuth, (req, res) => {
  try {
    const tags = addonStore.getSessionTags(req.params.sessionId);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher manual tag addition
router.post('/tags/manual', requireAuth, requireRole('teacher'), (req, res) => {
  try {
    const { sessionId, segmentId, type, text, label } = req.body;
    if (!sessionId || !type || !text) {
      return res.status(400).json({ error: 'SessionId, type, and text are required' });
    }
    const manualTag = addonStore.addTag({
      sessionId,
      segmentId: segmentId || 'manual_' + Date.now(),
      type,
      confidence: 1.0,
      source: 'teacher',
      text,
      label: label || 'Teacher manual tag'
    });
    realtimeTransport.publishToSession(sessionId, 'tag_added', manualTag);
    res.status(201).json({ tag: manualTag });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher manual tag removal
router.delete('/tags/:tagId', requireAuth, requireRole('teacher'), (req, res) => {
  try {
    const removed = addonStore.removeTag(req.params.tagId);
    if (removed) {
      realtimeTransport.publishToSession(removed.sessionId, 'tag_removed', { tagId: req.params.tagId });
    }
    res.json({ removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
