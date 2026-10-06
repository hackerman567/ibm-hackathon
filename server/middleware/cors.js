import cors from 'cors';

const corsOptions = {
  origin: true, // allow all origins (needed for Vercel preview URLs)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

export default cors(corsOptions);
