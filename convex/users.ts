import { mutation, query, internalQuery, internalMutation } from './_generated/server';
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

export const checkQuota = internalQuery({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
      .unique();

    if (!user || !user.agencyId) return true;

    const agency = await ctx.db.get(user.agencyId);
    if (!agency) return true;

    return agency.tokenQuotaRemaining > 0;
  },
});

export const deductQuota = internalMutation({
  args: { tokenIdentifier: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
      .unique();

    if (!user || !user.agencyId) return;

    const agency = await ctx.db.get(user.agencyId);
    if (agency && agency.tokenQuotaRemaining >= args.amount) {
      await ctx.db.patch(user.agencyId, {
        tokenQuotaRemaining: agency.tokenQuotaRemaining - args.amount,
      });
    }
  },
});

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Called storeUser without authentication present');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      const updates: any = {};

      if (user.name !== identity.name || user.email !== identity.email) {
        updates.name = identity.name ?? 'Unknown';
        updates.email = identity.email ?? '';
      }

      if (!user.agencyId) {
        // Auto-create an agency if they don't have one
        const newAgencyId = await ctx.db.insert('agencies', {
          name: `${identity.name ?? 'New User'}'s Agency`,
          tokenQuotaRemaining: 1000,
        });
        updates.agencyId = newAgencyId;
        updates.role = 'Admin';
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
      return user._id;
    }

    // Auto-create an agency for the new user
    const agencyId = await ctx.db.insert('agencies', {
      name: `${identity.name ?? 'New User'}'s Agency`,
      tokenQuotaRemaining: 1000,
    });

    return await ctx.db.insert('users', {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? 'Unknown',
      email: identity.email ?? '',
      role: 'Admin', // Give them Admin role so they can create brands
      agencyId: agencyId,
    });
  },
});
