"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicGalleryKey } from "@/lib/share-gallery-api";
import type { GalleryBlogAssetRef } from "@/lib/gallery-blog";
import {
  ensureDemoGalleryBlogSeed,
  listPublishedGalleryBlogPostsForShare,
  resolveGalleryBlogFolderId,
  type GalleryBlogPost,
} from "@/lib/gallery-blog";
import { GalleryBlogViewer } from "@/components/gallery-blog/gallery-blog-viewer";
import { GalleryBlogPostGrid } from "@/components/gallery-blog/gallery-blog-post-card";
import { cn } from "@/lib/utils";

export type GalleryBlogClientSectionProps = {
  folderId?: string | null;
  publicKey: PublicGalleryKey;
  assets: GalleryBlogAssetRef[];
  onViewGallery: () => void;
  className?: string;
};

export function GalleryBlogClientSection({
  folderId,
  publicKey,
  assets,
  onViewGallery,
  className,
}: GalleryBlogClientSectionProps) {
  const [posts, setPosts] = useState<GalleryBlogPost[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const resolvedFolderId = useMemo(
    () => resolveGalleryBlogFolderId({ folderId, publicKey }),
    [folderId, publicKey],
  );

  const assetsById = useMemo(
    () => new Map(assets.map((a) => [a.id, a])),
    [assets],
  );

  useEffect(() => {
    if (!resolvedFolderId) {
      setPosts([]);
      return;
    }
    ensureDemoGalleryBlogSeed(
      resolvedFolderId,
      assets.slice(0, 6).map((a) => a.id),
    );
    setPosts(listPublishedGalleryBlogPostsForShare({ folderId: resolvedFolderId, publicKey }));
  }, [resolvedFolderId, publicKey, assets]);

  const activePost = activePostId ? posts.find((p) => p.id === activePostId) : null;

  if (posts.length === 0) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Blog posts from your photographer will appear here.
        </p>
      </div>
    );
  }

  if (activePost) {
    return (
      <div className={className}>
        <GalleryBlogViewer
          post={activePost}
          assetsById={assetsById}
          onViewGallery={onViewGallery}
          onBack={() => setActivePostId(null)}
          showBack
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand dark:text-brand-on-dark">
          Stories
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-recoleta-fallback)] text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          From the gallery
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
          Highlights and behind-the-scenes moments, curated by your photographer.
        </p>
      </div>
      <GalleryBlogPostGrid
        posts={posts}
        assetsById={assetsById}
        onOpen={setActivePostId}
      />
    </div>
  );
}
