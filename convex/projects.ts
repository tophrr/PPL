import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getProjects = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    return await ctx.db
      .query('projects')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .filter((q) => q.eq(q.field('isArchived'), false))
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

    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      brandId: args.brandId,
      description: args.description,
      isArchived: false,
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
