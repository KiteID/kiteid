import type { Env } from 'hono';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  primaryName?: string | null;
};

export type AppEnv = Env & {
  Variables: {
    user: SessionUser;
    session: unknown;
  };
};
