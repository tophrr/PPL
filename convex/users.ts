import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal('Admin'),
      v.literal('Creative Manager'),
      v.literal('Creator'),
      v.literal('Client'),
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert('users', {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      role: args.role,
    });

    return userId;
  },
});

export const updateUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
      .unique();

    if (!existingUser) {
      throw new Error('User not found');
    }

    await ctx.db.patch(existingUser._id, {
      email: args.email,
      name: args.name,
    });
  },
});

export const deleteUser = mutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
      .unique();

    if (existingUser) {
      await ctx.db.delete(existingUser._id);
    }
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    return user;
  },
});
