import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Direct connection for migrations (bypasses PgBouncer)
    url:
      process.env.DATABASE_DIRECT_URL || 'postgresql://kiteid:kiteid_dev@localhost:5432/kiteid_dev',
  },
  verbose: true,
  strict: true,
});
