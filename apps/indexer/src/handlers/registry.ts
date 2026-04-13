import { ponder } from 'ponder:registry';
import { eq } from 'drizzle-orm';
import { domain } from '../../ponder.schema';

// NewOwner: node = parent's namehash, label = child's labelhash
ponder.on('KiteRegistry:NewOwner', async ({ event, context }) => {
  const { label, owner } = event.args;

  // label IS the labelhash of the child domain — correct lookup field
  const [existing] = await context.db.sql
    .select({ name: domain.name })
    .from(domain)
    .where(eq(domain.labelhash, label))
    .limit(1);

  if (existing) {
    await context.db.update(domain, { name: existing.name }).set({ owner });
  }
});

// NewResolver: node = full namehash of the domain
ponder.on('KiteRegistry:NewResolver', async ({ event, context }) => {
  const { node, resolver } = event.args;

  // node IS the full namehash — lookup by namehash column
  const [existing] = await context.db.sql
    .select({ name: domain.name })
    .from(domain)
    .where(eq(domain.namehash, node))
    .limit(1);

  if (existing) {
    await context.db.update(domain, { name: existing.name }).set({ resolver });
  }
});
