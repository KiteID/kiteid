import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(__dirname, 'drizzle');

const pool = new pg.Pool({
  // Direct connection (bypass PgBouncer) for DDL statements
  connectionString:
    process.env.DATABASE_DIRECT_URL || 'postgresql://kiteid:kiteid_dev@localhost:5432/kiteid_dev',
  max: 1,
});

const db = drizzle(pool);

console.log('[migrate] Running database migrations...');
try {
  await migrate(db, { migrationsFolder });
  console.log('[migrate] Migrations applied successfully.');
} catch (err) {
  console.error('[migrate] Migration failed:', err);
  process.exit(1);
} finally {
  await pool.end();
}
