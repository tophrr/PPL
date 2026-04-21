import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agencies: defineTable({
    name: v.string(),
    ai_token_quota: v.number(),
    // created_at is implicitly handled by _creationTime, but let's be explicit if needed.
    createdAt: v.number(),
  }),
  users: defineTable({
    agency_id: v.id("agencies"),
    full_name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("Administrator"),
      v.literal("Creative Manager"),
      v.literal("Content Creator"),
      v.literal("Client")
    ),
    last_login: v.number(),
    tokenIdentifier: v.string(), // Clerk identity
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
  content_drafts: defineTable({
    agency_id: v.id("agencies"),
    creator_id: v.id("users"),
    title: v.string(),
    caption: v.string(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Review"),
      v.literal("Approved"),
      v.literal("Revision")
    ),
    scheduled_date: v.optional(v.number()),
    ai_generated: v.boolean(),
  }).index("by_agency", ["agency_id"]),
  media_assets: defineTable({
    draft_id: v.id("content_drafts"),
    file_url: v.string(),
    file_type: v.union(v.literal("Image"), v.literal("Video")),
  }).index("by_draft", ["draft_id"]),
  audit_logs: defineTable({
    user_id: v.id("users"),
    draft_id: v.optional(v.id("content_drafts")),
    action_type: v.string(),
    comment: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_draft", ["draft_id"]),
});
