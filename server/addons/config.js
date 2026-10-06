import 'dotenv/config';

export const config = {
  ADDON_AUTH: process.env.ADDON_AUTH !== 'false',
  ADDON_EMPHASIS: process.env.ADDON_EMPHASIS !== 'false',
  ADDON_ALERTS: process.env.ADDON_ALERTS !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'signify-addon-secret-key-2026',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  NEW_TOPIC_DEBOUNCE_MS: 60 * 1000,
  NAME_CALLED_COOLDOWN_MS: 20 * 1000,
  DEFAULT_CONFIDENCE_THRESHOLD: 0.65
};
