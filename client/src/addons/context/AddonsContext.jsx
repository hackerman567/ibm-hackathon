import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { addonConfig } from '../config';
import { saveAddonTag, saveAddonAlert, getAddonTagsForSession } from '../db/addonsDb';

const AddonsContext = createContext(null);

export function AddonsProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'teacher' | 'student' | 'guest'
  const [token, setToken] = useState(localStorage.getItem('signify_addon_token') || '');
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTags, setSessionTags] = useState([]); // Array of tag objects
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [emergencySuggestion, setEmergencySuggestion] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Student alert preferences
  const [alertPreferences, setAlertPreferences] = useState({
    NAME_CALLED: true,
    QUESTION_ASKED: true,
    NEW_TOPIC: true,
    EMERGENCY: true // Cannot be fully disabled
  });

  const eventSourceRef = useRef(null);

  // Initialize auth check from server on mount
  useEffect(() => {
    if (token) {
      fetch('/api/addons/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setRole(data.user.role);
          } else {
            // Token expired or invalid
            setToken('');
            localStorage.removeItem('signify_addon_token');
          }
        })
        .catch(() => {
          // Fail silently
        });
    }
  }, [token]);

  // Connect SSE realtime stream whenever session or token changes
  useEffect(() => {
    if (!activeSession) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const sseUrl = `/api/addons/realtime/stream?sessionId=${activeSession.id}&token=${token}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'tag_added') {
          setSessionTags(prev => [...prev.filter(t => t.id !== data.payload.id), data.payload]);
          saveAddonTag(data.payload);
        } else if (data.type === 'tag_removed') {
          setSessionTags(prev => prev.filter(t => t.id !== data.payload.tagId));
        } else if (data.type === 'alert_triggered') {
          const alert = data.payload;
          saveAddonAlert(alert);
          if (alert.type === 'EMERGENCY') {
            setEmergencyAlert(alert);
          } else {
            setActiveAlerts(prev => {
              if (prev.some(a => a.id === alert.id)) return prev;
              return [alert, ...prev];
            });
          }
        } else if (data.type === 'alert_acknowledged') {
          setActiveAlerts(prev => prev.filter(a => a.id !== data.payload.alertId));
          if (emergencyAlert && emergencyAlert.id === data.payload.alertId) {
            setEmergencyAlert(null);
          }
        } else if (data.type === 'emergency_suggested') {
          setEmergencySuggestion(data.payload);
        }
      } catch (err) {
        // Fail silently
      }
    };

    return () => {
      es.close();
    };
  }, [activeSession, token, emergencyAlert]);

  // Auth Handlers
  const login = async (email, password) => {
    const res = await fetch('/api/addons/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setUser(data.user);
    setRole(data.user.role);
    setToken(data.token);
    localStorage.setItem('signify_addon_token', data.token);
    toast.success(`Welcome back, ${data.user.name} (${data.user.role})`);
    return data;
  };

  const register = async ({ name, email, password, role, aliases }) => {
    const res = await fetch('/api/addons/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, aliases })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    setUser(data.user);
    setRole(data.user.role);
    setToken(data.token);
    localStorage.setItem('signify_addon_token', data.token);
    toast.success(`Registered successfully as ${data.user.role}`);
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/api/addons/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    setRole('guest');
    setToken('');
    setActiveSession(null);
    localStorage.removeItem('signify_addon_token');
    toast.success('Signed out');
  };

  const updateAliases = async (aliases) => {
    const res = await fetch('/api/addons/auth/aliases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ aliases })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update aliases');
    setUser(data.user);
    toast.success('Nicknames updated for name detection');
  };

  // Teacher Session Controls
  const createClassSession = async () => {
    const res = await fetch('/api/addons/sessions/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create session');

    setActiveSession(data.session);
    setSessionTags([]);
    setActiveAlerts([]);
    toast.success(`Classroom session created! Code: ${data.session.joinCode}`);
    return data.session;
  };

  const joinClassSession = async (joinCode) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch('/api/addons/sessions/join', {
      method: 'POST',
      headers,
      body: JSON.stringify({ joinCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to join session');

    setActiveSession(data.session);
    // Load historical tags
    const existingTags = await getAddonTagsForSession(data.session.id);
    setSessionTags(existingTags || []);
    toast.success(`Joined class session!`);
    return data.session;
  };

  const leaveClassSession = () => {
    setActiveSession(null);
    setSessionTags([]);
    toast.success('Left class session');
  };

  const endClassSession = async () => {
    if (!activeSession) return;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch('/api/addons/sessions/end', {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId: activeSession.id })
    });
    const data = await res.json();
    setActiveSession(null);
    toast.success('Session ended');
  };

  // Manual Tag Overrides (Teacher)
  const addManualTag = async ({ segmentId, type, text, label }) => {
    if (!activeSession) return;
    const res = await fetch('/api/addons/emphasis/tags/manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId: activeSession.id, segmentId, type, text, label })
    });
    const data = await res.json();
    if (data.tag) {
      setSessionTags(prev => [...prev, data.tag]);
    }
  };

  const removeTag = async (tagId) => {
    const res = await fetch(`/api/addons/emphasis/tags/${tagId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.removed) {
      setSessionTags(prev => prev.filter(t => t.id !== tagId));
    }
  };

  // Alerts API
  const triggerManualAlert = async (type, message) => {
    if (!activeSession) return;
    const res = await fetch('/api/addons/alerts/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId: activeSession.id, type, message })
    });
    const data = await res.json();
    if (data.alert) {
      if (type === 'EMERGENCY') {
        setEmergencyAlert(data.alert);
      } else {
        setActiveAlerts(prev => {
          if (prev.some(a => a.id === data.alert.id)) return prev;
          return [data.alert, ...prev];
        });
      }
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await fetch('/api/addons/alerts/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ alertId })
      });
    } catch (e) {}

    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    if (emergencyAlert && emergencyAlert.id === alertId) {
      setEmergencyAlert(null);
    }
  };

  const value = {
    user,
    role,
    token,
    activeSession,
    sessionTags,
    activeAlerts,
    emergencyAlert,
    emergencySuggestion,
    isAuthModalOpen,
    setIsAuthModalOpen,
    alertPreferences,
    setAlertPreferences,
    login,
    register,
    logout,
    updateAliases,
    createClassSession,
    joinClassSession,
    leaveClassSession,
    endClassSession,
    addManualTag,
    removeTag,
    triggerManualAlert,
    acknowledgeAlert,
    setEmergencySuggestion
  };

  return <AddonsContext.Provider value={value}>{children}</AddonsContext.Provider>;
}

export function useAddons() {
  const ctx = useContext(AddonsContext);
  if (!ctx) {
    throw new Error('useAddons must be used within an AddonsProvider');
  }
  return ctx;
}
