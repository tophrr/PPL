import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk identity.subject
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal('Admin'),
      v.literal('Creative Manager'),
      v.literal('Creator'),
      v.literal('Client'),
    ),
    agencyId: v.optional(v.id('agencies')),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_agency', ['agencyId'])
    .index('by_email', ['email']),

  agencies: defineTable({
    name: v.string(),
    tokenQuotaRemaining: v.number(),
    totalTokenQuota: v.optional(v.number()),
  }),

  brands: defineTable({
    name: v.string(),
    agencyId: v.id('agencies'),
    clientIds: v.array(v.id('users')),
    isArchived: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  }).index('by_agency', ['agencyId']),

  projects: defineTable({
    name: v.string(),
    brandId: v.id('brands'),
    description: v.optional(v.string()),
    isArchived: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  }).index('by_brand', ['brandId']),

  contentDrafts: defineTable({
    projectId: v.id('projects'),
    brandId: v.id('brands'),
    authorId: v.id('users'),
    content: v.string(), // Rich text content or AI prompt result
    aiPrompt: v.optional(v.string()), // To store what generated it
    status: v.union(v.literal('Draft'), v.literal('Review'), v.literal('Approved')),
    revisionNotes: v.optional(v.string()),
    scheduledDate: v.optional(v.number()), // Timestamp
    platform: v.optional(v.string()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    mediaAssetIds: v.array(v.id('mediaAssets')),
  })
    .index('by_project', ['projectId'])
    .index('by_brand', ['brandId'])
    .index('by_author', ['authorId']),

  mediaAssets: defineTable({
    storageId: v.id('_storage'),
    size: v.number(),
    contentType: v.string(),
    url: v.optional(v.string()),
  }),

  collaborativeLocks: defineTable({
    documentId: v.id('contentDrafts'),
    field: v.string(),
    lockedBy: v.id('users'),
    lockedAt: v.number(),
  }).index('by_document_and_field', ['documentId', 'field']),

  auditLogs: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.id('users'),
  }).index('by_entity', ['entityType', 'entityId']),

  notifications: defineTable({
    userId: v.id('users'),
    title: v.string(),
    message: v.string(),
    link: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index('by_user', ['userId', 'isRead']),
});
