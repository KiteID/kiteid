import { randomBytes } from 'node:crypto';
import { KiteWrapperAbi } from '@kiteid/contracts-abi';
import { db, relayerNonces, walletAddresses, wrappedNames } from '@kiteid/db';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { createPublicClient, getAddress, http } from 'viem';
import {
  getWrapDomain,
  UNWRAP_REQUEST_TYPES,
  verifyRelaySignature,
  WRAP_REQUEST_TYPES,
} from '../lib/eip712';
import { relayerWalletClient } from '../lib/wallet';
import { requireAuth } from '../middleware/session';

const WRAPPER_ADDRESS = process.env.WRAPPER_ADDRESS;

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

      // Try on-chain read if wrapper is deployed
      if (WRAPPER_ADDRESS && WRAPPER_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        try {
          const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '2368');
          const rpcUrl =
            chainId === 2366
              ? process.env.KITE_RPC_URL || 'https://rpc.gokite.ai/'
              : process.env.KITE_TESTNET_RPC_URL || 'https://rpc-testnet.gokite.ai/';
          const client = createPublicClient({
            transport: http(rpcUrl),
          });

          const expiry = (await client.readContract({
            address: WRAPPER_ADDRESS as `0x${string}`,
            abi: KiteWrapperAbi,
            functionName: 'getExpiry',
            args: [normalizedNode as `0x${string}`],
          })) as bigint;

          if (expiry > 0n) {
            const fuses = (await client.readContract({
              address: WRAPPER_ADDRESS as `0x${string}`,
              abi: KiteWrapperAbi,
              functionName: 'getFuses',
              args: [normalizedNode as `0x${string}`],
            })) as bigint;

            const response: WrapStatusResponse = {
              node: nodeParam,
              wrapped: true,
              fuses: fuses.toString(),
              expiry: Number(expiry),
            };
            return c.json(response);
          }
        } catch (_onChainErr) {
          // Fall through to DB query if on-chain read fails
        }
      }

      // Fall back to DB query
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

      // Check if wrapper is deployed
      const wrapperNotDeployed =
        !WRAPPER_ADDRESS || WRAPPER_ADDRESS === '0x0000000000000000000000000000000000000000';

      // Basic validation
      if (!body.node || !body.owner || body.fuses === undefined) {
        return c.json({ error: 'Missing required fields: node, owner, fuses' }, 400);
      }

      // Estimate gas for wrap transaction (static estimate for MVP)
      const gasEstimate: Record<string, string> = {
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
        wrapperAddress: WRAPPER_ADDRESS || '0x0000000000000000000000000000000000000000',
        wrapperNotDeployed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: 'Failed to generate wrap preview', detail: message }, 400);
    }
  })

  // GET /v2/wrap/nonce - Issue a server nonce for EIP-712 relay
  .get('/nonce', requireAuth(), async (c) => {
    try {
      const user = c.get('user');
      if (!user?.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Get user's primary wallet address
      const walletAddress = await db.query.walletAddresses.findFirst({
        where: and(eq(walletAddresses.userId, user.id), eq(walletAddresses.isPrimary, true)),
      });

      if (!walletAddress) {
        return c.json({ error: 'No primary wallet found' }, 400);
      }

      const address = getAddress(walletAddress.address);

      // Per-wallet cap on outstanding (unused, unexpired) nonces to prevent DB bloat / DoS.
      // 10 is generous for a real user; a normal flow consumes one nonce per wrap.
      const outstanding = await db.query.relayerNonces.findMany({
        where: and(
          eq(relayerNonces.address, address),
          gt(relayerNonces.expiresAt, new Date()),
          isNull(relayerNonces.usedAt),
        ),
        limit: 11,
      });
      if (outstanding.length >= 10) {
        return c.json({ error: 'Too many outstanding nonces; wait for them to expire' }, 429);
      }

      const nonce = `0x${randomBytes(32).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 300_000); // 5 minutes

      // Store nonce in DB
      await db.insert(relayerNonces).values({
        address,
        nonce,
        expiresAt,
      });

      return c.json({ nonce, expiresAt: expiresAt.toISOString() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: 'Failed to issue nonce', detail: message }, 500);
    }
  })

  // POST /v2/wrap/relay - Relay a signed wrap/unwrap request
  .post('/relay', requireAuth(), async (c) => {
    try {
      const user = c.get('user');
      if (!user?.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (!relayerWalletClient) {
        return c.json({ error: 'Relayer not configured' }, 503);
      }

      if (!WRAPPER_ADDRESS || WRAPPER_ADDRESS === '0x0000000000000000000000000000000000000000') {
        return c.json({ error: 'KiteWrapper not deployed' }, 400);
      }

      const body = (await c.req.json()) as {
        action: 'wrap' | 'unwrap';
        params: Record<string, unknown>;
        signer: string;
        nonce: string;
        deadline: number;
        signature: `0x${string}`;
      };

      const { action, params, signer, nonce, deadline, signature } = body;

      // Validate action
      if (!['wrap', 'unwrap'].includes(action)) {
        return c.json({ error: 'Invalid action' }, 400);
      }

      // Get user's primary wallet address
      const walletAddress = await db.query.walletAddresses.findFirst({
        where: and(eq(walletAddresses.userId, user.id), eq(walletAddresses.isPrimary, true)),
      });

      if (!walletAddress) {
        return c.json({ error: 'No primary wallet found' }, 400);
      }

      const sessionWallet = getAddress(walletAddress.address);
      const signerAddress = getAddress(signer);

      // Signer must match session wallet
      if (signerAddress !== sessionWallet) {
        return c.json({ error: 'Signer does not match session wallet' }, 401);
      }

      // Owner in params must match signer/session wallet (prevent grief wrapping)
      // biome-ignore lint/suspicious/noExplicitAny: runtime params require any
      const paramsOwner = getAddress((params as any).owner);
      if (paramsOwner !== sessionWallet) {
        return c.json({ error: 'Owner must match authorized wallet' }, 401);
      }

      // Validate deadline is in the future
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (deadline <= nowSeconds) {
        return c.json({ error: 'Deadline has passed' }, 400);
      }

      // Atomically consume nonce: update only if conditions match, return count
      const updateResult = await db
        .update(relayerNonces)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(relayerNonces.address, sessionWallet),
            eq(relayerNonces.nonce, nonce),
            gt(relayerNonces.expiresAt, new Date()),
            isNull(relayerNonces.usedAt),
          ),
        );

      // Treat null/undefined rowCount as zero (some drivers do not report it).
      if (!updateResult.rowCount) {
        return c.json({ error: 'Invalid or expired nonce' }, 409);
      }

      // Verify EIP-712 signature
      const primaryType = action === 'wrap' ? ('WrapRequest' as const) : ('UnwrapRequest' as const);
      const types = action === 'wrap' ? WRAP_REQUEST_TYPES : UNWRAP_REQUEST_TYPES;
      const domain = getWrapDomain(
        Number(process.env.NEXT_PUBLIC_CHAIN_ID || '2368'),
        WRAPPER_ADDRESS as `0x${string}`,
      );

      const message = {
        signer: signerAddress,
        ...params,
        nonce,
        deadline,
      };

      const recoveredSigner = await verifyRelaySignature(
        primaryType,
        // biome-ignore lint/suspicious/noExplicitAny: viem types dynamic from request
        types as any,
        message,
        signature,
        domain,
      );

      if (!recoveredSigner || recoveredSigner !== signerAddress) {
        return c.json({ error: 'Invalid signature' }, 401);
      }

      // Broadcast transaction via relayer wallet
      // biome-ignore lint/suspicious/noExplicitAny: runtime params require any
      const p = params as any;
      const tokenId = BigInt(p.tokenId);
      const fuses = action === 'wrap' ? BigInt(p.fuses) : 0n;
      const expiry = action === 'wrap' ? BigInt(p.expiry) : 0n;

      // Bounds checks on signed parameters (post-verify but pre-broadcast).
      if (action === 'wrap') {
        // Reject expiry that is missing, in the past, or absurdly far in the future (>10y).
        const maxExpiry = BigInt(nowSeconds + 10 * 365 * 24 * 3600);
        if (expiry <= BigInt(nowSeconds) || expiry > maxExpiry) {
          return c.json({ error: 'Invalid expiry' }, 400);
        }
        // Only valid fuse bits allowed (must match KiteWrapper VALID_FUSE_MASK).
        const VALID_FUSE_MASK = 1n | (1n << 2n) | (1n << 18n) | (1n << 19n);
        if ((fuses & ~VALID_FUSE_MASK) !== 0n) {
          return c.json({ error: 'Invalid fuses' }, 400);
        }
      }

      const writeContractParams = {
        address: WRAPPER_ADDRESS as `0x${string}`,
        abi: KiteWrapperAbi,
        functionName: action,
        args:
          action === 'wrap'
            ? [p.node, tokenId, p.owner, fuses, expiry]
            : [p.node, tokenId, p.owner],
        // biome-ignore lint/suspicious/noExplicitAny: viem writeContract requires any for dynamic args
      } as any;
      const txHash = await relayerWalletClient.writeContract(writeContractParams);

      return c.json({ txHash });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Relay error:', err);
      return c.json({ error: 'Failed to relay transaction', detail: message }, 500);
    }
  });
