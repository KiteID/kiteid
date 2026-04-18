import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { auth } from './auth';
import { rateLimit } from './middleware/rate-limit';
import { namesRouter } from './routes/names';
import { notificationsRouter } from './routes/notifications';
import { profileRouter } from './routes/profile';

const app = new Hono().basePath('/api');

// Global middleware
app.use('*', logger());
const corsOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:3000,https://kiteid.xyz,https://www.kiteid.xyz,https://staging.kiteid.xyz'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  '*',
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

// Global rate limit: 100 requests / 15 min
app.use('*', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, keyPrefix: 'global' }));

// Auth rate limit: 10 requests / 1 min
app.use('/auth/*', rateLimit({ windowMs: 60 * 1000, max: 10, keyPrefix: 'auth' }));

// Better Auth handler — handles /api/auth/*
app.on(['POST', 'GET'], '/auth/**', (c) => auth.handler(c.req.raw));

// Health
app.get('/health', (c) => c.json({ status: 'ok', service: 'kiteid-api', timestamp: Date.now() }));

// Routes
app.route('/names', namesRouter);
app.route('/profile', profileRouter);
app.route('/notifications', notificationsRouter);

export default app;
export type AppType = typeof app;
