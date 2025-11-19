import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import publishRouter from './routes/publish.js';
import postsRouter from './routes/posts.js';
import plansRouter from './routes/plans.js';
import webhooksRouter from './routes/webhooks.js';
import { getPublishQueue, closePublishQueue } from './jobs/publishQueue.js';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error(`CORS: origin '${origin}' not allowed`));
        }
      : false,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// stripe needs raw body before json parser
app.use(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhooksRouter
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/publish', publishRouter);
app.use('/api/posts', postsRouter);
app.use('/api/plans', plansRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`PostCraft running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  getPublishQueue();
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    try {
      await closePublishQueue();
      const { pool } = await import('./config/db.js');
      await pool.end();
      const redis = (await import('./config/redis.js')).default;
      await redis.quit();
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err.message);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
