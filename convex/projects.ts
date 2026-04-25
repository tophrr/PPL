import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getProjects = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error('Brand not found');

    // Verify access
    const isTeam =
      user.agencyId === brand.agencyId &&
      (user.role === 'Admin' || user.role === 'Creative Manager' || user.role === 'Creator');
    const isClient = user.role === 'Client' && brand.clientIds.includes(user._id);

    if (!isTeam && !isClient) {
      throw new Error('Unauthorized access to this brand');
    }

    return await ctx.db
      .query('projects')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .filter((q) => q.and(q.eq(q.field('isArchived'), false), q.eq(q.field('isDeleted'), false)))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    brandId: v.id('brands'),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error('Brand not found');

    if (user.agencyId !== brand.agencyId || user.role === 'Client') {
      throw new Error('Unauthorized to create projects for this brand');
    }

    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      brandId: args.brandId,
      description: args.description,
      isArchived: false,
      isDeleted: false,
    });
    return projectId;
  },
});

export const archiveProject = mutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.patch(args.projectId, { isArchived: true });
  },
});

export const softDeleteProject = mutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.patch(args.projectId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
  },
});
