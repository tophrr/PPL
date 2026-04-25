'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export function MediaItem({ assetId }: { assetId: Id<'mediaAssets'> }) {
  const asset = useQuery(api.media.getMediaAsset, { assetId });

  if (!asset) {
    return <div className="aspect-square animate-pulse rounded-xl bg-[var(--slate-100)]" />;
  }

  const isImage = asset.contentType.startsWith('image/');

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--slate-200)] bg-[var(--slate-50)]">
      {isImage ? (
        <img
          src={asset.url || ''}
          alt="Media Asset"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--slate-900)] text-white text-[10px] font-bold uppercase">
          Video
        </div>
      )}
    </div>
  );
}
