import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

export const getDrafts = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    return await ctx.db
      .query('contentDrafts')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();
  },
});

export const createDraft = mutation({
  args: {
    projectId: v.id('projects'),
    brandId: v.id('brands'),
    content: v.string(),
    aiPrompt: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    const draftId = await ctx.db.insert('contentDrafts', {
      projectId: args.projectId,
      brandId: args.brandId,
      authorId: user._id,
      content: args.content,
      aiPrompt: args.aiPrompt,
      status: 'Draft',
      isDeleted: false,
      mediaAssetIds: [],
      // platform: args.platform // Not in schema currently, but could be added if needed or we use tags
    });
    return draftId;
  },
});

export const updateDraftContent = mutation({
  args: {
    draftId: v.id('contentDrafts'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    // This is called by the auto-save mechanism
    await ctx.db.patch(args.draftId, { content: args.content });
  },
});

export const updateDraftSchedule = mutation({
  args: {
    draftId: v.id('contentDrafts'),
    scheduledDate: v.number(), // timestamp
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.patch(args.draftId, { scheduledDate: args.scheduledDate });
  },
});

export const softDeleteDraft = mutation({
  args: { draftId: v.id('contentDrafts') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.patch(args.draftId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
  },
});

export const hardDeleteOldDrafts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const threshold = Date.now() - THIRTY_DAYS_MS;

    const oldDrafts = await ctx.db
      .query('contentDrafts')
      .filter((q) => q.eq(q.field('isDeleted'), true))
      .collect();

    let deletedCount = 0;
    for (const draft of oldDrafts) {
      if (draft.deletedAt && draft.deletedAt < threshold) {
        await ctx.db.delete(draft._id);
        deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} old drafts from trash.`);
  },
});
