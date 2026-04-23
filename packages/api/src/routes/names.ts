import { Hono } from 'hono';

const PONDER_URL = process.env.PONDER_URL || 'http://localhost:42069';
const INDEXER_TIMEOUT_MS = 5000;

async function fetchIndexer(path: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), INDEXER_TIMEOUT_MS);
  try {
    return await fetch(`${PONDER_URL}${path}`, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const namesRouter = new Hono()
  .get('/recent', async (c) => {
    const limit = c.req.query('limit') || '20';
    try {
      const res = await fetchIndexer(`/activity/recent?limit=${limit}`);
      if (!res.ok) {
        return c.json({ error: 'Indexer unavailable', status: res.status }, 502);
      }
      const data = await res.json();
      return c.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown indexer error';
      return c.json({ error: 'Indexer unreachable', detail: message }, 502);
    }
  })
  .get('/stats', async (c) => {
    try {
      const res = await fetchIndexer('/stats');
      if (!res.ok) {
        return c.json({ error: 'Indexer unavailable', status: res.status }, 502);
      }
      const data = await res.json();
      return c.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown indexer error';
      return c.json({ error: 'Indexer unreachable', detail: message }, 502);
    }
  })
  .get('/:name', async (c) => {
    const name = c.req.param('name').toLowerCase();
    try {
      const res = await fetchIndexer(`/names/detail/${encodeURIComponent(name)}`);
      if (!res.ok) {
        if (res.status === 404) return c.json({ error: 'Domain not found' }, 404);
        return c.json({ error: 'Indexer unavailable', status: res.status }, 502);
      }
      const data = await res.json();
      return c.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown indexer error';
      return c.json({ error: 'Indexer unreachable', detail: message }, 502);
    }
  })
  .get('/owner/:address', async (c) => {
    const address = c.req.param('address').toLowerCase();
    try {
      const res = await fetchIndexer(`/names/${address}`);
      if (!res.ok) {
        return c.json({ error: 'Indexer unavailable', status: res.status }, 502);
      }
      const data = await res.json();
      return c.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown indexer error';
      return c.json({ error: 'Indexer unreachable', detail: message }, 502);
    }
  });
