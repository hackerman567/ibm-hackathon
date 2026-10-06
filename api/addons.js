import express from 'express';
import addonsRoute from '../server/addons/index.js';

const app = express();
app.use(express.json());
app.use('/api/addons', addonsRoute);

export default app;
