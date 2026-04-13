import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';

const { Pool } = pg;

// PgBouncer connection for queries (transaction mode)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://kiteid:kiteid_dev@localhost:6432/kiteid_dev',
  max: 20,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
