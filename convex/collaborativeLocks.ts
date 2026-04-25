import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const LOCK_TIMEOUT_MS = 60 * 1000; // 1 minute timeout

export const getLock = query({
  args: {
    documentId: v.id('contentDrafts'),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const lock = await ctx.db
      .query('collaborativeLocks')
      .withIndex('by_document_and_field', (q) =>
        q.eq('documentId', args.documentId).eq('field', args.field),
      )
      .first();

    if (!lock) return null;

    // Check if lock has expired
    if (Date.now() - lock.lockedAt > LOCK_TIMEOUT_MS) {
      return null;
    }

    // Resolve the user who locked it
    const user = await ctx.db.get(lock.lockedBy);
    return {
      ...lock,
      userName: user?.name || 'Unknown User',
    };
  },
});

export const acquireLock = mutation({
  args: {
    documentId: v.id('contentDrafts'),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    const existingLock = await ctx.db
      .query('collaborativeLocks')
      .withIndex('by_document_and_field', (q) =>
        q.eq('documentId', args.documentId).eq('field', args.field),
      )
      .first();

    if (existingLock) {
      if (
        existingLock.lockedBy !== user._id &&
        Date.now() - existingLock.lockedAt <= LOCK_TIMEOUT_MS
      ) {
        throw new Error('Field is currently locked by another user');
      }
      // Overwrite expired lock or renew own lock
      await ctx.db.patch(existingLock._id, {
        lockedBy: user._id,
        lockedAt: Date.now(),
      });
      return;
    }

    // Create new lock
    await ctx.db.insert('collaborativeLocks', {
      documentId: args.documentId,
      field: args.field,
      lockedBy: user._id,
      lockedAt: Date.now(),
    });
  },
});

export const releaseLock = mutation({
  args: {
    documentId: v.id('contentDrafts'),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) return;

    const existingLock = await ctx.db
      .query('collaborativeLocks')
      .withIndex('by_document_and_field', (q) =>
        q.eq('documentId', args.documentId).eq('field', args.field),
      )
      .first();

    // Only allow releasing if it's their own lock
    if (existingLock && existingLock.lockedBy === user._id) {
      await ctx.db.delete(existingLock._id);
    }
  },
});
