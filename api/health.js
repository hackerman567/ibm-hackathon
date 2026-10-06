export default function handler(req, res) {
  const apiKey = process.env.GROQ_API_KEY;
  const isConfigured = !!apiKey && apiKey !== 'your_key_here' && apiKey.trim() !== '';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqConfigured: isConfigured
  });
}
