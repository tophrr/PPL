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
      return [];
    }

    // Role-based access control
    if (user.role === 'Admin' || user.role === 'Creative Manager' || user.role === 'Creator') {
      if (!user.agencyId) return [];
      return await ctx.db
        .query('brands')
        .withIndex('by_agency', (q) => q.eq('agencyId', user.agencyId!))
        .filter((q) => q.and(q.eq(q.field('isArchived'), false), q.eq(q.field('isDeleted'), false)))
        .collect();
    } else if (user.role === 'Client') {
      if (!user.agencyId) return [];
      const agencyBrands = await ctx.db
        .query('brands')
        .withIndex('by_agency', (q) => q.eq('agencyId', user.agencyId!))
        .filter((q) => q.and(q.eq(q.field('isArchived'), false), q.eq(q.field('isDeleted'), false)))
        .collect();

      // Filter in JS since Convex doesn't support .includes() natively for array fields
      return agencyBrands.filter((b) => b.clientIds.includes(user._id));
    }

    return [];
  },
});

export const getAgencyQuota = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user || !user.agencyId) return null;

    return await ctx.db.get(user.agencyId);
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

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user || user.agencyId !== args.agencyId || user.role !== 'Admin') {
      throw new Error('Only Agency Admins can create brands');
    }

    const brandId = await ctx.db.insert('brands', {
      name: args.name,
      agencyId: args.agencyId,
      clientIds: args.clientIds,
      isArchived: false,
      isDeleted: false,
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

export const softDeleteBrand = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.patch(args.brandId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
  },
});

export const addClientToBrand = mutation({
  args: { brandId: v.id('brands'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error('Brand not found');

    const clientIds = [...brand.clientIds];
    if (!clientIds.includes(args.userId)) {
      clientIds.push(args.userId);
      await ctx.db.patch(args.brandId, { clientIds });
    }
  },
});

export const removeClientFromBrand = mutation({
  args: { brandId: v.id('brands'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error('Brand not found');

    const clientIds = brand.clientIds.filter((id) => id !== args.userId);
    await ctx.db.patch(args.brandId, { clientIds });
  },
});
