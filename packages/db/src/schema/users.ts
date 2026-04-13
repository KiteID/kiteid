import { boolean, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  // Better Auth core fields
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // KiteID custom fields
  primaryName: varchar('primary_name', { length: 255 }),
  bio: text('bio'),
  notificationPrefs: jsonb('notification_prefs')
    .$type<{
      expiryReminder: boolean;
      renewalConfirm: boolean;
      transferAlert: boolean;
    }>()
    .default({ expiryReminder: true, renewalConfirm: true, transferAlert: true }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
