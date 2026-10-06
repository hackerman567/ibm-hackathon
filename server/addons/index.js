import express from 'express';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import emphasisRoutes from './routes/emphasisRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import realtimeRoutes from './routes/realtimeRoutes.js';
import { addonsRateLimiter } from './middleware/addonRateLimit.js';
import { config } from './config.js';

const router = express.Router();

// Apply dedicated rate limiting
router.use(addonsRateLimiter);

// Status / Health check endpoint for Add-ons
router.get('/status', (req, res) => {
  res.json({
    enabled: config.ADDON_AUTH || config.ADDON_EMPHASIS || config.ADDON_ALERTS,
    flags: {
      auth: config.ADDON_AUTH,
      emphasis: config.ADDON_EMPHASIS,
      alerts: config.ADDON_ALERTS
    }
  });
});

// Mount modular sub-routes
router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/emphasis', emphasisRoutes);
router.use('/alerts', alertRoutes);
router.use('/realtime', realtimeRoutes);

export default router;
