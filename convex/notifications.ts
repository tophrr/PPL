import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const createNotificationInternal = internalMutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    message: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      userId: args.userId,
      title: args.title,
      message: args.message,
      link: args.link,
      isRead: false,
      createdAt: Date.now(),
    });

    // REQ-NOTF-2: Simulated email notification
    console.log(
      `[EMAIL SIMULATION] To: ${args.userId} | Subject: ${args.title} | Body: ${args.message}`,
    );
  },
});
