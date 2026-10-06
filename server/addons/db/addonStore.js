import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  users: [],
  sessions: [],
  session_members: [],
  tags: [],
  alerts: []
};

class AddonStore {
  constructor() {
    this.data = { ...defaultData };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[SIGNIFY ADDONS DB] Error initializing storage:', err);
      this.data = { ...defaultData };
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[SIGNIFY ADDONS DB] Error saving data:', err);
    }
  }

  // Users
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id) || null;
  }

  createUser(userData) {
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      aliases: [],
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserAliases(userId, aliases) {
    const user = this.findUserById(userId);
    if (user) {
      user.aliases = Array.from(new Set(aliases.map(a => a.trim()).filter(Boolean)));
      this.save();
    }
    return user;
  }

  // Sessions
  createSession(teacherId, joinCode) {
    const newSession = {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      teacherId,
      joinCode: joinCode.toUpperCase(),
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null
    };
    this.data.sessions.push(newSession);
    this.save();
    return newSession;
  }

  findSessionByCode(joinCode) {
    if (!joinCode) return null;
    return this.data.sessions.find(s => s.joinCode === joinCode.toUpperCase() && s.status === 'active') || null;
  }

  findSessionById(sessionId) {
    return this.data.sessions.find(s => s.id === sessionId) || null;
  }

  endSession(sessionId) {
    const session = this.findSessionById(sessionId);
    if (session) {
      session.status = 'ended';
      session.endedAt = new Date().toISOString();
      this.save();
    }
    return session;
  }

  addSessionMember(sessionId, studentId) {
    const existing = this.data.session_members.find(m => m.sessionId === sessionId && m.studentId === studentId);
    if (existing) return existing;

    const member = {
      id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sessionId,
      studentId,
      joinedAt: new Date().toISOString()
    };
    this.data.session_members.push(member);
    this.save();
    return member;
  }

  getSessionMembers(sessionId) {
    const memberRecords = this.data.session_members.filter(m => m.sessionId === sessionId);
    return memberRecords.map(m => {
      const u = this.findUserById(m.studentId);
      return u ? { id: u.id, name: u.name, aliases: u.aliases || [], joinedAt: m.joinedAt } : null;
    }).filter(Boolean);
  }

  // Tags
  addTag(tagData) {
    const newTag = {
      id: 'tag_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      confidence: 0.9,
      createdAt: new Date().toISOString(),
      ...tagData
    };
    this.data.tags.push(newTag);
    this.save();
    return newTag;
  }

  removeTag(tagId) {
    const idx = this.data.tags.findIndex(t => t.id === tagId);
    if (idx !== -1) {
      const removed = this.data.tags.splice(idx, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  getSessionTags(sessionId) {
    return this.data.tags.filter(t => t.sessionId === sessionId);
  }

  // Alerts
  addAlert(alertData) {
    const newAlert = {
      id: 'alt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      acknowledgedBy: [],
      ...alertData
    };
    this.data.alerts.push(newAlert);
    this.save();
    return newAlert;
  }

  acknowledgeAlert(alertId, userId) {
    const alert = this.data.alerts.find(a => a.id === alertId);
    if (alert) {
      if (!alert.acknowledgedBy.includes(userId)) {
        alert.acknowledgedBy.push(userId);
        this.save();
      }
    }
    return alert;
  }

  getSessionAlerts(sessionId) {
    return this.data.alerts.filter(a => a.sessionId === sessionId);
  }
}

export const addonStore = new AddonStore();
