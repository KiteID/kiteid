import { db, wrappedNames } from '@kiteid/db';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

const WRAPPER_ADDRESS = process.env.KITE_WRAPPER_ADDRESS;

interface WrapPreviewRequest {
  node: string; // hex node
  owner: string; // address
  fuses: string; // uint96 as string
  duration: number; // seconds
}

interface WrapStatusResponse {
  node: string;
  wrapped: boolean;
  owner?: string;
  fuses?: string;
  expiry?: number;
  wrappedAt?: string;
  txHash?: string;
}

export const wrapperRouter = new Hono()
  // GET /v2/wrap/status/:node - Check if name is wrapped
  .get('/status/:node', async (c) => {
    try {
      const nodeParam = c.req.param('node');
      // Normalize to 0x-prefixed hex
      const normalizedNode = nodeParam.startsWith('0x') ? nodeParam : `0x${nodeParam}`;

      const wrapped = await db.query.wrappedNames.findFirst({
        where: eq(wrappedNames.node, normalizedNode),
      });

      if (!wrapped) {
        const response: WrapStatusResponse = {
          node: nodeParam,
          wrapped: false,
        };
        return c.json(response);
      }

      const response: WrapStatusResponse = {
        node: nodeParam,
        wrapped: true,
        owner: wrapped.owner,
        fuses: wrapped.fuses.toString(),
        expiry: Number(wrapped.expiry),
        wrappedAt: wrapped.wrappedAt?.toISOString(),
        txHash: wrapped.txHash,
      };

      return c.json(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: 'Failed to fetch wrap status', detail: message }, 500);
    }
  })

  // POST /v2/wrap/preview - Estimate gas for wrapping
  .post('/preview', async (c) => {
    try {
      const body = (await c.req.json()) as WrapPreviewRequest;

      if (!WRAPPER_ADDRESS) {
        return c.json({ error: 'Wrapper address not configured' }, 500);
      }

      // Basic validation
      if (!body.node || !body.owner || body.fuses === undefined) {
        return c.json({ error: 'Missing required fields: node, owner, fuses' }, 400);
      }

      // Estimate gas (static estimate for MVP)
      // Real implementation would call contract's wrap() via RPC
      const gasEstimate = {
        wrap: '150000',
        unwrap: '100000',
        setFuses: '80000',
        bindPassport: '120000',
      };

      return c.json({
        node: body.node,
        owner: body.owner,
        fuses: body.fuses,
        duration: body.duration,
        gasEstimate,
        wrapperAddress: WRAPPER_ADDRESS,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: 'Failed to generate wrap preview', detail: message }, 400);
    }
  });
