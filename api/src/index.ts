import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { skillsRouter } from './routes/skills.js';
import { searchRouter } from './routes/search.js';
import { reviewsRouter } from './routes/reviews.js';
import { authRouter } from './auth.js';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/skills', skillsRouter);
app.use('/api/search', searchRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ClawHub API running on port ${PORT}`);
});

export { app };
