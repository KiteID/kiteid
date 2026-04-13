import type { ConnectionOptions } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const url = new URL(REDIS_URL);

export const connection: ConnectionOptions = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  password: url.password || undefined,
};
