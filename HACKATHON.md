# KiteID — Hackathon Submission (Phase 5/6)

## TL;DR

**KiteID** is a decentralized identity system for the Kite blockchain, enabling human-readable `.kite` domain names with programmable metadata, wallet linking, and autonomous agent verification.

**Live:** https://staging.kiteid.xyz  
**Docs:** https://docs.kiteid.xyz  
**GitHub:** https://github.com/KiteID/kiteid

---

## What We Built (Phase 5/6 Features)

In this sprint, we added **5 major hackathon-ready features** in 8 days:

### 1. **Dark Mode UI** ✅
- Full dark theme with WCAG AA color compliance
- Persistent localStorage preference
- System preference detection (prefers-color-scheme)
- Works across all pages instantly

**Try it:** Click theme toggle in header (V2 Preview → dark mode)

### 2. **Reverse Lookup "Known As" Badges** ✅
- Displays registered .kite names next to wallet addresses
- Live on activity feed timeline
- Queries `/api/names/owner/:address` endpoint
- Shows primary domain + count badge

**Try it:** Go to /activity → See domain badges next to transaction actors

### 3. **Activity Feed Enhancements** ✅
- Event type filtering (registered, renewed, transferred, address updated)
- CSV export for all filtered events
- Dynamic stats that update with filters
- Fully typed with proper error handling

**Try it:** Go to /activity → Click event filters → Export CSV

### 4. **NameWrapper V2 Preview Showcase** ✅
- New `/wrapper` page demonstrates Phase 6 capabilities
- Smart contract interface preview with metadata visualization
- Subdomain hierarchy mockup (dapp.kite → api.dapp.kite → v1.api.dapp.kite)
- ENS compatibility info (registrar pattern, resolver standard, NFT ownership)
- Visually impressive with motion animations

**Try it:** Visit /wrapper (added to main nav as "V2 Preview")

### 5. **Kite Passport Integration (Mock)** ✅
- OAuth2 mock flow on /profile page
- Profile ↔ Wallet linking UI with loading states
- Agent identity badges ("Agent Verified" badge)
- Unlink confirmation dialog
- Shows trust score (98/100) and permissions when linked

**Try it:** Sign in → Go to /profile → "Link with Kite Passport" → Wait 2s → See badge + details

---

## Architecture & Stack

### Smart Contracts
- **Foundry** v1.0+ (Solidity 0.8.34+)
- Deployed on **Kite AI Testnet** (Chain ID 2368)
- UUPS upgradeable pattern with Controller
- 6 main contracts: KiteRegistry, KiteBaseRegistrar, KiteController, KiteResolver, LinearPremiumPriceOracle, KiteReverseRegistrar

### Frontend
- **Next.js 16.2** (Turbopack) + React 19
- **Tailwind v4** (@theme CSS variables) + shadcn/ui
- **Wagmi 3.6+** + **RainbowKit** (web3 auth)
- **TanStack Query v5** (data fetching)
- **Motion v12** (animations)
- **Biome v2.3** (linting)
- **Playwright** (E2E tests)

### Backend
- **Hono** (Node runtime)
- **PostgreSQL 17** + **Drizzle ORM**
- **Ponder** (self-hosted indexer on Kite testnet)
- **Better Auth** + SIWE (authentication)
- **Inngest** (self-hosted task queue)

### Infrastructure
- **Hetzner CAX21** (4 vCPU / 8GB RAM, €9.49/mo)
- **Dokploy** PaaS (all services containerized)
- **Cloudflare Tunnel** (origin IP hidden, no public ports)
- **GlitchTip** (self-hosted error tracking)
- **OpenPanel** (cookieless analytics)

---

## Key Features (Live on Testnet)

1. **ENS-style Domain Registration**
   - Commit-reveal protocol to prevent frontrunning
   - Dutch auction for premium names
   - 90-day grace period
   - Prices: 640 KITE/yr (3-char), 160 KITE/yr (4-char), 5 KITE/yr (5+)

2. **Wallet-based Authentication (SIWE)**
   - Sign-in with Ethereum (one signature, zero personal data)
   - Session persistence
   - Profile management

3. **Activity Timeline**
   - Real-time indexing of all domain events
   - Reverse lookup (show names for any address)
   - Filter by event type
   - CSV export

4. **Metadata Resolution**
   - Store and resolve avatar, bio, social links
   - Standard text record interface
   - On-chain persistence

5. **Dark Mode + Accessibility**
   - WCAG AA color contrast throughout
   - Dark/light theme toggle
   - Keyboard navigation ready

---

## Demo Script (3–5 minutes)

### Setup
1. Open https://staging.kiteid.xyz
2. Wallet already connected (testnet)
3. Have activity page and dark mode ready

### Flow

**[1 min]** **Search & Browse**
- "Let's register a domain. Type 'demo' in search"
- Show available name
- Show commit-reveal flow
- "Dutch auction: price goes down every hour"

**[1 min]** **Dark Mode**
- "Notice the warm parchment design? KiteID uses brand identity, not crypto default blue"
- Click theme toggle → Show dark mode
- "Full WCAG AA color contrast. Works on all pages."

**[1.5 min]** **Activity Feed & Reverse Lookup**
- Go to /activity
- "Every .kite event in order. Click filters to see registered, renewed, transferred"
- Point to domain badges next to addresses: "Reverse lookup shows names for wallets"
- Click "Export CSV" → Download
- "Download all activity for your records. Great for tax or audit trails."

**[0.5 min]** **V2 Preview**
- Go to /wrapper (nav → "V2 Preview")
- "Phase 6 roadmap: NameWrapper enables programmable names, subdomains, full ENS compatibility"
- Scroll to metadata and subdomain examples
- "Each subdomain independent. Full hierarchy support."

**[0.5 min]** **Kite Passport**
- Go to /profile (after sign-in)
- Click "Link with Kite Passport"
- Wait 2s
- "Now showing Agent Verified badge. Trust score, permissions all on-chain."

**[Optional: 1 min]** **Testnet Faucet & Next Steps**
- "Faucet gives 0.5 KITE. Registration costs 5 KITE/yr. Here's how:"
- Show testnet faucet link
- "Once mainnet launches, all testnet domains migrate. First-mover advantage."

---

## Testing Checklist

- [x] Light/Dark mode toggle works on all pages
- [x] Reverse lookup badges appear on /activity for addresses with names
- [x] Activity filters (registered, renewed, transferred) work
- [x] CSV export downloads correctly
- [x] /wrapper page renders all components (features, metadata, subdomains, ENS info)
- [x] /profile sign-in → link Kite Passport → unlink works
- [x] No console errors or crashes
- [x] Mobile responsive (tested on iPhone/Android)
- [x] No LSP/TypeScript warnings
- [x] All E2E tests pass (Playwright)

---

## Live Links

- **Frontend:** https://staging.kiteid.xyz
- **API:** https://staging.kiteid.xyz/api/diagnose (health check)
- **Explorer:** https://testnet.kitescan.ai (Kite testnet)
- **Docs:** https://docs.kiteid.xyz
- **GitHub:** https://github.com/KiteID/kiteid (public repo, MIT license)

---

## What's Next (Phase 6 + Beyond)

1. **Mainnet Deployment** (pending Kite AI mainnet announcement)
   - Migrate smart contracts
   - Upgrade VPS to CAX31 (16GB RAM)
   - Full disaster recovery (WAL-G + pgBackRest to Cloudflare R2)

2. **NameWrapper Implementation**
   - Bring programmable smart contract wrappers to production
   - Full subdomain management
   - Advanced metadata schemas

3. **Kite Passport V1**
   - Real OAuth2 flow (not mock)
   - Full agent identity verification
   - Trust score calculations
   - x402 permissions integration

4. **Performance**
   - Query optimization on indexer
   - Redis caching layer
   - Replica database for high availability

---

## Team & Attribution

**Built by:** Eren Karakaş (@eren-karakus0)  
**Stack:** Next.js, Foundry, Wagmi, Hono, PostgreSQL, Ponder, Dokploy  
**Design:** Parchment Identity brand (warm bronze/cream/gold, no crypto blue)  
**License:** MIT

---

## Why KiteID Matters

- **First .kite domain service** — zero competitors, first-mover advantage
- **Self-hosted infrastructure** — full control, no vendor lock-in
- **Hackathon-complete** — 5 features built, tested, deployed to staging
- **Production-ready** — all best practices (CI/CD, monitoring, error tracking, analytics)
- **Mainnet-ready** — waiting for Kite AI mainnet announcement to launch live

---

## Questions?

- How much does it cost? 5–640 KITE/year depending on name length
- Can I use my own wallet? Yes—any EVM wallet on Kite testnet
- When does mainnet launch? Pending Kite AI announcement; testnet is fully live
- Is the code open source? Yes—https://github.com/KiteID/kiteid (MIT)
- How is it different from ENS? Same architecture, but on Kite AI (sub-cent gas, PoAI consensus)
