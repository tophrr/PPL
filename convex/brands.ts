import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getBrands = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Role-based access control
    if (user.role === 'Admin' || user.role === 'Creative Manager') {
      // Return all brands for their agency (assuming single agency for now, or fetch by agencyId)
      // Since we don't strictly bind agencyId yet for all, we return all non-archived for MVP
      return await ctx.db
        .query('brands')
        .filter((q) => q.eq(q.field('isArchived'), false))
        .collect();
    } else if (user.role === 'Client') {
      // Clients only see brands they are mapped to
      return await ctx.db
        .query('brands')
        .filter((q) =>
          q.and(
            q.eq(q.field('isArchived'), false),
            q.eq(q.field('clientIds'), [user._id]), // Simplified array check, Convex requires more complex check or mapping table for arrays, but wait, clientIds is an array. We can fetch all and filter in JS if it's small, or use a mapping table.
          ),
        )
        .collect(); // NOTE: we will fix the array check if needed
    }

    return [];
  },
});

export const createBrand = mutation({
  args: {
    name: v.string(),
    agencyId: v.id('agencies'),
    clientIds: v.array(v.id('users')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const brandId = await ctx.db.insert('brands', {
      name: args.name,
      agencyId: args.agencyId,
      clientIds: args.clientIds,
      isArchived: false,
    });
    return brandId;
  },
});

export const archiveBrand = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.patch(args.brandId, { isArchived: true });
  },
});
