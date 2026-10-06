import { addonStore } from '../db/addonStore.js';

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid easily confused chars O/0, I/1
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createSession(teacherId) {
  let joinCode = generateJoinCode();
  // Ensure uniqueness among active sessions
  while (addonStore.findSessionByCode(joinCode)) {
    joinCode = generateJoinCode();
  }
  return addonStore.createSession(teacherId, joinCode);
}

export function joinSession(joinCode, studentId) {
  const session = addonStore.findSessionByCode(joinCode);
  if (!session) {
    throw new Error('Active session not found with that join code');
  }
  const member = addonStore.addSessionMember(session.id, studentId);
  return { session, member };
}

export function endSession(sessionId, teacherId) {
  const session = addonStore.findSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.teacherId !== teacherId) {
    throw new Error('Forbidden: Only the creating teacher can end this session');
  }
  return addonStore.endSession(sessionId);
}

export function getSessionInfo(sessionId) {
  const session = addonStore.findSessionById(sessionId);
  if (!session) return null;
  const members = addonStore.getSessionMembers(sessionId);
  return { session, members };
}
