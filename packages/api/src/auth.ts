import { randomBytes } from 'node:crypto';
import { db } from '@kiteid/db';
import * as schema from '@kiteid/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { siwe } from 'better-auth/plugins/siwe';
import { createPublicClient, http } from 'viem';

const kiteClient = createPublicClient({
  chain: {
    id: 2366,
    name: 'Kite AI',
    nativeCurrency: { name: 'KITE', symbol: 'KITE', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.gokite.ai/'] } },
  },
  transport: http(process.env.KITE_RPC_URL || 'https://rpc.gokite.ai/'),
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      walletAddress: schema.walletAddresses,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'kiteid-dev-secret-change-in-production',
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min JWT cache
    },
  },
  user: {
    additionalFields: {
      primaryName: { type: 'string', required: false },
      bio: { type: 'string', required: false },
    },
  },
  plugins: [
    siwe({
      domain: process.env.APP_DOMAIN || 'localhost:3000',
      // Generates placeholder email for anonymous SIWE: "0x...@wallet.kiteid.xyz"
      // Without this, getOrigin() produces invalid "0x...@https://kiteid.xyz"
      emailDomainName: process.env.SIWE_EMAIL_DOMAIN || 'wallet.kiteid.xyz',
      getNonce: async () => randomBytes(16).toString('hex'),
      verifyMessage: async ({ message, signature }) => {
        return kiteClient.verifySiweMessage({
          message,
          signature: signature as `0x${string}`,
        });
      },
    }),
  ],
  trustedOrigins: (
    process.env.TRUSTED_ORIGINS ||
    'http://localhost:3000,https://kiteid.xyz,https://www.kiteid.xyz,https://staging.kiteid.xyz'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
});

export type Auth = typeof auth;
