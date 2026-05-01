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
  .get('/owners', async (c) => {
    const addresses = c.req.query('addresses')?.split(',') || [];
    if (addresses.length === 0) {
      return c.json({ owners: {} });
    }

    const result: Record<string, unknown> = {};
    const unique = [...new Set(addresses.map((a) => a.toLowerCase()))];

    const promises = unique.map(async (address) => {
      try {
        const res = await fetchIndexer(`/names/${address}`);
        if (res.ok) {
          const data = await res.json();
          result[address] = data;
        }
      } catch {
        // Silently skip failed requests
      }
    });

    await Promise.all(promises);
    return c.json({ owners: result });
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
  });
