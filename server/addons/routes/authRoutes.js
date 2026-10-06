import express from 'express';
import { registerUser, loginUser } from '../services/authService.js';
import { requireAuth } from '../middleware/addonAuth.js';
import { addonStore } from '../db/addonStore.js';
import { config } from '../config.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, aliases } = req.body;
    const { user, token } = await registerUser({ name, email, password, role, aliases });

    res.cookie('signify_addon_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });

    res.cookie('signify_addon_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('signify_addon_token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user, flags: { auth: config.ADDON_AUTH, emphasis: config.ADDON_EMPHASIS, alerts: config.ADDON_ALERTS } });
});

router.post('/aliases', requireAuth, (req, res) => {
  try {
    const { aliases } = req.body;
    if (!Array.isArray(aliases)) {
      return res.status(400).json({ error: 'Aliases must be an array of strings' });
    }
    const updatedUser = addonStore.updateUserAliases(req.user.id, aliases);
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
