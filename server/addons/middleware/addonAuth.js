import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { addonStore } from '../db/addonStore.js';

export function parseTokenFromReq(req) {
  let token = null;
  
  // 1. Header Bearer Token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie Token
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, val] = cookie.trim().split('=');
      acc[key] = val;
      return acc;
    }, {});
    if (cookies.signify_addon_token) {
      token = cookies.signify_addon_token;
    }
  }

  return token;
}

export function requireAuth(req, res, next) {
  const token = parseTokenFromReq(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = addonStore.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          aliases: user.aliases || []
        };
        return next();
      }
    } catch (err) {
      // invalid token, fallback below if auth feature flag is disabled
    }
  }

  if (!config.ADDON_AUTH) {
    // Fallback if no valid token provided and ADDON_AUTH is off
    req.user = { id: 'guest', name: 'Guest User', role: 'student' };
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
}

export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!config.ADDON_AUTH) {
      return next();
    }
    if (!req.user || req.user.role !== allowedRole) {
      return res.status(403).json({ error: `Forbidden: Requires ${allowedRole} role` });
    }
    next();
  };
}
