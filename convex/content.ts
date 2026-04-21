import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDraft = mutation({
  args: {
    title: v.string(),
    caption: v.string(),
    targetAudience: v.string(),
    niche: v.string(),
    tone: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated user cannot create drafts");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User record not found");
    }

    const draftId = await ctx.db.insert("content_drafts", {
      agency_id: user.agency_id,
      creator_id: user._id,
      title: args.title,
      caption: args.caption,
      status: "Draft",
      ai_generated: true,
      scheduled_date: undefined,
    });

    return draftId;
  },
});

export const updateDraftCaption = mutation({
  args: {
    id: v.id("content_drafts"),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.db.patch(args.id, {
      caption: args.caption,
    });
  },
});

export const listDrafts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("content_drafts")
      .withIndex("by_agency", (q) => q.eq("agency_id", user.agency_id))
      .collect();
  },
});

export const updateDraftStatus = mutation({
  args: {
    id: v.id("content_drafts"),
    status: v.union(
      v.literal("Draft"),
      v.literal("Review"),
      v.literal("Approved"),
      v.literal("Revision")
    ),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User record not found");

    const draft = await ctx.db.get(args.id);
    if (!draft || draft.agency_id !== user.agency_id) {
      throw new Error("Draft not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    await ctx.db.insert("audit_logs", {
      user_id: user._id,
      draft_id: draft._id,
      action_type: `Status changed to ${args.status}`,
      comment: args.comment,
      timestamp: Date.now(),
    });
  },
});

export const updateDraftSchedule = mutation({
  args: {
    id: v.id("content_drafts"),
    scheduled_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User record not found");

    const draft = await ctx.db.get(args.id);
    if (!draft || draft.agency_id !== user.agency_id) {
      throw new Error("Draft not found or unauthorized");
    }

    if (args.scheduled_date && args.scheduled_date < Date.now()) {
      throw new Error("Cannot schedule in the past");
    }

    await ctx.db.patch(args.id, {
      scheduled_date: args.scheduled_date,
    });

    await ctx.db.insert("audit_logs", {
      user_id: user._id,
      draft_id: draft._id,
      action_type: "Schedule changed",
      timestamp: Date.now(),
    });
  },
});