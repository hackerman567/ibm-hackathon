import { addonStore } from '../db/addonStore.js';
import { realtimeTransport } from './realtimeTransport.js';
import { checkStudentNameCalled } from './nameMatcher.js';

export const ALERT_TYPES = {
  NAME_CALLED: 'NAME_CALLED',
  QUESTION_ASKED: 'QUESTION_ASKED',
  NEW_TOPIC: 'NEW_TOPIC',
  EMERGENCY: 'EMERGENCY'
};

export const VIBRATION_PATTERNS = {
  NAME_CALLED: [200, 100, 200],
  QUESTION_ASKED: [100, 50, 100],
  NEW_TOPIC: [150],
  EMERGENCY: [500, 200, 500, 200, 500] // Repeating until acknowledged
};

export function triggerAlert({ sessionId, type, targetStudentId = null, message = '', source = 'system' }) {
  if (!sessionId || !type) {
    throw new Error('SessionId and alert type are required');
  }

  const alert = addonStore.addAlert({
    sessionId,
    type,
    targetStudentId,
    message,
    source,
    vibrationPattern: VIBRATION_PATTERNS[type] || [200]
  });

  // Realtime publication
  if (targetStudentId) {
    realtimeTransport.publishToUser(targetStudentId, 'alert_triggered', alert);
  } else {
    realtimeTransport.publishToSession(sessionId, 'alert_triggered', alert);
  }

  return alert;
}

export function evaluateCaptionForAlerts({ sessionId, segmentId, text }) {
  if (!sessionId || !text) return [];

  const generatedAlerts = [];
  const sessionMembers = addonStore.getSessionMembers(sessionId);

  // 1. Check NAME_CALLED for all session members
  for (const member of sessionMembers) {
    const match = checkStudentNameCalled(text, member);
    if (match) {
      const alert = triggerAlert({
        sessionId,
        type: ALERT_TYPES.NAME_CALLED,
        targetStudentId: member.id,
        message: `Your name was called in class ("${match.matchedWord}")`,
        source: 'auto_name_match'
      });
      generatedAlerts.push(alert);
    }
  }

  // 2. Check emergency suggestion keywords (suggest to teacher only, NEVER auto-send emergency)
  const lower = text.toLowerCase();
  if (/\b(fire|evacuate|earthquake|emergency|lockdown|active shooter|shelter in place)\b/.test(lower)) {
    realtimeTransport.publishToSession(sessionId, 'emergency_suggested', {
      segmentId,
      text,
      keyword: text.match(/\b(fire|evacuate|earthquake|emergency|lockdown|active shooter|shelter in place)\b/)?.[0]
    });
  }

  return generatedAlerts;
}

export function acknowledgeAlert(alertId, userId) {
  const alert = addonStore.acknowledgeAlert(alertId, userId);
  if (alert) {
    realtimeTransport.publishToSession(alert.sessionId, 'alert_acknowledged', {
      alertId,
      userId,
      acknowledgedBy: alert.acknowledgedBy
    });
  }
  return alert;
}
