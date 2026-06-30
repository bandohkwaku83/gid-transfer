"use client";

import Image from "next/image";
import { CalendarDays, ChevronRight } from "lucide-react";
import type { GalleryBlogPost } from "@/lib/gallery-blog";
import type { GalleryBlogAssetRef } from "@/lib/gallery-blog";
import { cn } from "@/lib/utils";

export function GalleryBlogPostCard({
  post,
  coverAsset,
  onOpen,
  className,
}: {
  post: GalleryBlogPost;
  coverAsset?: GalleryBlogAssetRef;
  onOpen: () => void;
  className?: string;
}) {
  const coverSrc = (coverAsset?.previewUrl ?? coverAsset?.thumbUrl)?.trim();
  const dateIso = post.publishedAt ?? post.updatedAt;
  const dateLabel = (() => {
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  })();

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">No cover</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{dateLabel}</span>
        </div>
        <h3 className="font-[family-name:var(--font-recoleta-fallback)] text-xl font-semibold leading-snug text-zinc-900 transition group-hover:text-brand dark:text-zinc-50 dark:group-hover:text-brand-on-dark">
          {post.title}
        </h3>
        {post.subtitle ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {post.subtitle}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand dark:text-brand-on-dark">
          Read post
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}

export function GalleryBlogPostGrid({
  posts,
  assetsById,
  onOpen,
  className,
}: {
  posts: GalleryBlogPost[];
  assetsById: Map<string, GalleryBlogAssetRef>;
  onOpen: (postId: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      {posts.map((post) => {
        const coverAsset = post.coverAssetId ? assetsById.get(post.coverAssetId) : undefined;
        return (
          <GalleryBlogPostCard
            key={post.id}
            post={post}
            coverAsset={coverAsset}
            onOpen={() => onOpen(post.id)}
          />
        );
      })}
    </div>
  );
}
