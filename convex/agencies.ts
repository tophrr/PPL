import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createAgency = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const agencyId = await ctx.db.insert('agencies', {
      name: args.name,
      tokenQuotaRemaining: 1000,
      totalTokenQuota: 1000,
    });

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        agencyId,
        role: 'Admin',
      });
    }

    return agencyId;
  },
});

export const getAgency = query({
  args: { agencyId: v.id('agencies') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agencyId);
  },
});

export const updateAgency = mutation({
  args: { agencyId: v.id('agencies'), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agencyId, { name: args.name });
  },
});
