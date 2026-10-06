import express from 'express';
import { requireAuth, requireRole } from '../middleware/addonAuth.js';
import { triggerAlert, acknowledgeAlert, ALERT_TYPES } from '../services/alertService.js';
import { addonStore } from '../db/addonStore.js';

const router = express.Router();

// Teacher triggers alert (Emergency or New Topic)
router.post('/trigger', requireAuth, requireRole('teacher'), (req, res) => {
  try {
    const { sessionId, type, targetStudentId, message } = req.body;
    if (!sessionId || !type) {
      return res.status(400).json({ error: 'SessionId and type are required' });
    }

    if (!Object.values(ALERT_TYPES).includes(type)) {
      return res.status(400).json({ error: 'Invalid alert type' });
    }

    const alert = triggerAlert({
      sessionId,
      type,
      targetStudentId,
      message: message || (type === ALERT_TYPES.EMERGENCY ? 'EMERGENCY ALERT ISSUED BY TEACHER' : `${type} alert`),
      source: 'teacher'
    });

    res.status(201).json({ alert });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Student acknowledges alert
router.post('/acknowledge', requireAuth, (req, res) => {
  try {
    const { alertId } = req.body;
    if (!alertId) {
      return res.status(400).json({ error: 'AlertId is required' });
    }
    const alert = acknowledgeAlert(alertId, req.user.id);
    res.json({ alert });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get session alert history
router.get('/history/:sessionId', requireAuth, (req, res) => {
  try {
    const alerts = addonStore.getSessionAlerts(req.params.sessionId);
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
