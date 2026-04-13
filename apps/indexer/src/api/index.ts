import { db } from 'ponder:api';
import schema from 'ponder:schema';
import { count, desc, eq, gte } from 'drizzle-orm';
import { Hono } from 'hono';
import { graphql } from 'ponder';

const app = new Hono();

// GraphQL endpoint
app.use('/graphql', graphql({ db, schema }));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'kiteid-indexer', timestamp: Date.now() });
});

app.get('/ready', (c) => {
  return c.json({ status: 'ready' });
});

// Domain list by owner address
app.get('/names/:address', async (c) => {
  const address = c.req.param('address').toLowerCase() as `0x${string}`;

  const domains = await db
    .select()
    .from(schema.domain)
    .where(eq(schema.domain.owner, address))
    .orderBy(desc(schema.domain.registeredAt));

  return c.json({ domains, count: domains.length });
});

// Domain detail by name
app.get('/names/detail/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();

  const [domainData] = await db
    .select()
    .from(schema.domain)
    .where(eq(schema.domain.name, name))
    .limit(1);

  if (!domainData) {
    return c.json({ error: 'Domain not found' }, 404);
  }

  const records = await db
    .select()
    .from(schema.resolverRecord)
    .where(eq(schema.resolverRecord.name, name));

  const events = await db
    .select()
    .from(schema.activityEvent)
    .where(eq(schema.activityEvent.name, name))
    .orderBy(desc(schema.activityEvent.timestamp))
    .limit(20);

  return c.json({ domain: domainData, records, events });
});

// Global stats
app.get('/stats', async (c) => {
  const now = BigInt(Math.floor(Date.now() / 1000));

  const [totalResult] = await db.select({ total: count() }).from(schema.domain);

  const [activeResult] = await db
    .select({ active: count() })
    .from(schema.domain)
    .where(gte(schema.domain.expiresAt, now));

  return c.json({
    totalDomains: totalResult?.total ?? 0,
    activeDomains: activeResult?.active ?? 0,
    expiredDomains: (totalResult?.total ?? 0) - (activeResult?.active ?? 0),
  });
});

// Recent activity feed
app.get('/activity/recent', async (c) => {
  const limitParam = c.req.query('limit');
  const limit = Math.min(Number(limitParam) || 50, 100);

  const events = await db
    .select()
    .from(schema.activityEvent)
    .orderBy(desc(schema.activityEvent.timestamp))
    .limit(limit);

  return c.json({ events, count: events.length });
});

export default app;
