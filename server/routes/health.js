import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const isConfigured = !!apiKey && apiKey !== 'your_key_here' && apiKey.trim() !== '';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqConfigured: isConfigured
  });
});

export default router;
