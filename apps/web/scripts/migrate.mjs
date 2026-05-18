// Runtime migration entrypoint for the web container. Lives inside apps/web/
// so Node module resolution can walk up to apps/web/node_modules and find the
// drizzle/pg packages that Next.js standalone copies there.
//
// The script is intentionally idempotent: drizzle's migrator tracks applied
// migrations in drizzle.__drizzle_migrations and silently no-ops on re-runs,
// so it is safe to call on every container start (which is what the Dockerfile
// CMD does).
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
// From apps/web/scripts/ → packages/db/drizzle is two levels up + into packages.
const migrationsFolder = resolve(__dirname, '../../../packages/db/drizzle');

const connectionString = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[migrate] DATABASE_DIRECT_URL/DATABASE_URL not set; refusing to run.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, max: 1 });
const db = drizzle(pool);

console.log('[migrate] Running database migrations from', migrationsFolder);
try {
  await migrate(db, { migrationsFolder });
  console.log('[migrate] Migrations applied successfully.');
} catch (err) {
  console.error('[migrate] Migration failed:', err);
  process.exit(1);
} finally {
  await pool.end();
}
