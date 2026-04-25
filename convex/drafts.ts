import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import { internal } from './_generated/api';

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

export const getDraft = query({
  args: { draftId: v.id('contentDrafts') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    const draft = await ctx.db.get(args.draftId);
    if (!draft) return null;

    const brand = await ctx.db.get(draft.brandId);
    if (!brand) return null;

    // Verify access
    const isTeam =
      user.agencyId === brand.agencyId &&
      (user.role === 'Admin' || user.role === 'Creative Manager' || user.role === 'Creator');
    const isClient = user.role === 'Client' && brand.clientIds.some((id) => id === user._id);

    if (!isTeam && !isClient) {
      throw new Error('Unauthorized access to this draft');
    }

    return draft;
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

export const updateDraftStatus = mutation({
  args: {
    draftId: v.id('contentDrafts'),
    status: v.union(v.literal('Draft'), v.literal('Review'), v.literal('Approved')),
    revisionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const patch: any = { status: args.status };
    if (args.revisionNotes !== undefined) {
      patch.revisionNotes = args.revisionNotes;
    }

    await ctx.db.patch(args.draftId, patch);

    // Trigger notification
    const draft = await ctx.db.get(args.draftId);
    if (draft) {
      await ctx.runMutation(internal.notifications.createNotificationInternal, {
        userId: draft.authorId,
        title: `Draft Status Updated`,
        message: `Your draft has been moved to ${args.status}.`,
        link: `/dashboard/planner`,
      });
    }
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

    const tables = ['contentDrafts', 'brands', 'projects'] as const;
    let deletedCount = 0;

    for (const table of tables) {
      const oldRecords = await ctx.db
        .query(table)
        .filter((q) => q.eq(q.field('isDeleted'), true))
        .collect();

      for (const record of oldRecords) {
        if (record.deletedAt && record.deletedAt < threshold) {
          await ctx.db.delete(record._id);
          deletedCount++;
        }
      }
    }

    console.log(`Hard deleted ${deletedCount} old records from trash.`);
  },
});

export const getDashboardStats = query({
  args: { agencyId: v.id('agencies') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user || (user.role !== 'Client' && user.agencyId !== args.agencyId)) {
      throw new Error('Unauthorized access to this agency');
    }

    const brands = await ctx.db
      .query('brands')
      .withIndex('by_agency', (q) => q.eq('agencyId', args.agencyId))
      .collect();

    let accessibleBrandIds = brands.map((b) => b._id);

    if (user.role === 'Client') {
      accessibleBrandIds = brands
        .filter((b) => b.clientIds.some((id) => id === user._id))
        .map((b) => b._id);
    }

    const drafts = await ctx.db
      .query('contentDrafts')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    // Filter by brands belonging to this agency
    const agencyDrafts = drafts.filter((d) => accessibleBrandIds.includes(d.brandId));

    const stats = {
      total: agencyDrafts.length,
      draft: agencyDrafts.filter((d) => d.status === 'Draft').length,
      review: agencyDrafts.filter((d) => d.status === 'Review').length,
      approved: agencyDrafts.filter((d) => d.status === 'Approved').length,
    };

    return stats;
  },
});

export const getDraftsByAgency = query({
  args: { agencyId: v.id('agencies') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user || (user.role !== 'Client' && user.agencyId !== args.agencyId)) {
      throw new Error('Unauthorized access to this agency');
    }

    const brands = await ctx.db
      .query('brands')
      .withIndex('by_agency', (q) => q.eq('agencyId', args.agencyId))
      .collect();

    let accessibleBrandIds = brands.map((b) => b._id);

    if (user.role === 'Client') {
      accessibleBrandIds = brands
        .filter((b) => b.clientIds.some((id) => id === user._id))
        .map((b) => b._id);
    }

    const drafts = await ctx.db
      .query('contentDrafts')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    return drafts.filter((d) => accessibleBrandIds.includes(d.brandId));
  },
});
