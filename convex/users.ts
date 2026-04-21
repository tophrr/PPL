import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    full_name: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic sync function for demo purposes.
    // In a real app we'd need to create an agency first if none exists.
    
    // Look up by tokenIdentifier
    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        email: args.email,
        full_name: args.full_name,
        last_login: Date.now(),
      });
      return existing._id;
    }

    // Default to Administrator role for first user or mock agency creation
    // To satisfy the schema constraints, we need an agency_id.
    const defaultAgency = await ctx.db.insert("agencies", {
      name: `Agency for ${args.full_name}`,
      ai_token_quota: 1000,
      createdAt: Date.now(),
    });

    const newUserId = await ctx.db.insert("users", {
      agency_id: defaultAgency,
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      full_name: args.full_name,
      role: "Administrator",
      last_login: Date.now(),
    });

    return newUserId;
  },
});