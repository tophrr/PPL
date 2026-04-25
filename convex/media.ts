import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMediaAsset = mutation({
  args: {
    storageId: v.id('_storage'),
    size: v.number(),
    contentType: v.string(),
    draftId: v.optional(v.id('contentDrafts')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const url = await ctx.storage.getUrl(args.storageId);
    const mediaId = await ctx.db.insert('mediaAssets', {
      storageId: args.storageId,
      size: args.size,
      contentType: args.contentType,
      url: url || undefined,
    });

    if (args.draftId) {
      const draft = await ctx.db.get(args.draftId);
      if (draft) {
        await ctx.db.patch(draft._id, {
          mediaAssetIds: [...draft.mediaAssetIds, mediaId],
        });
      }
    }

    return mediaId;
  },
});

export const getMediaUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getMediaAsset = query({
  args: { assetId: v.id('mediaAssets') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assetId);
  },
});
