import { Hono } from 'hono';

const PONDER_URL = process.env.PONDER_URL || 'http://localhost:42069';

export const namesRouter = new Hono()
  .get('/recent', async (c) => {
    const limit = c.req.query('limit') || '20';

    const res = await fetch(`${PONDER_URL}/activity/recent?limit=${limit}`);
    if (!res.ok) {
      return c.json({ error: 'Indexer unavailable' }, 502);
    }

    const data = await res.json();
    return c.json(data);
  })
  .get('/stats', async (c) => {
    const res = await fetch(`${PONDER_URL}/stats`);
    if (!res.ok) {
      return c.json({ error: 'Indexer unavailable' }, 502);
    }

    const data = await res.json();
    return c.json(data);
  })
  .get('/:name', async (c) => {
    const name = c.req.param('name').toLowerCase();

    const res = await fetch(`${PONDER_URL}/names/detail/${encodeURIComponent(name)}`);
    if (!res.ok) {
      if (res.status === 404) return c.json({ error: 'Domain not found' }, 404);
      return c.json({ error: 'Indexer unavailable' }, 502);
    }

    const data = await res.json();
    return c.json(data);
  })
  .get('/owner/:address', async (c) => {
    const address = c.req.param('address').toLowerCase();

    const res = await fetch(`${PONDER_URL}/names/${address}`);
    if (!res.ok) {
      return c.json({ error: 'Indexer unavailable' }, 502);
    }

    const data = await res.json();
    return c.json(data);
  });
