"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Images } from "lucide-react";
import type { GalleryBlogBlock, GalleryBlogPost, GalleryBlogAssetRef } from "@/lib/gallery-blog";
import { MediaLightbox, lightboxMediaClass } from "@/components/ui/media-lightbox";
import { cn } from "@/lib/utils";

export type GalleryBlogViewerProps = {
  post: GalleryBlogPost;
  assetsById: Map<string, GalleryBlogAssetRef>;
  onViewGallery?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
};

function assetSrc(asset: GalleryBlogAssetRef | undefined): string {
  if (!asset) return "";
  return (asset.previewUrl ?? asset.thumbUrl).trim();
}

function assetAlt(asset: GalleryBlogAssetRef | undefined, fallback: string): string {
  return asset?.originalName?.trim() || fallback;
}

export function GalleryBlogViewer({
  post,
  assetsById,
  onViewGallery,
  onBack,
  showBack = false,
  className,
}: GalleryBlogViewerProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const coverAsset = post.coverAssetId ? assetsById.get(post.coverAssetId) : undefined;
  const coverSrc = assetSrc(coverAsset);

  const openLightbox = useCallback(
    (assetId: string) => {
      if (!post.enableLightbox) return;
      const asset = assetsById.get(assetId);
      const src = assetSrc(asset);
      if (!src) return;
      setLightboxSrc(src);
      setLightboxAlt(assetAlt(asset, "Gallery photo"));
    },
    [assetsById, post.enableLightbox],
  );

  const publishedLabel = useMemo(() => {
    const iso = post.publishedAt ?? post.updatedAt;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }, [post.publishedAt, post.updatedAt]);

  return (
    <article className={cn("mx-auto max-w-3xl", className)}>
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          All posts
        </button>
      ) : null}

      <header className="mb-8 text-center">
        {coverSrc ? (
          <button
            type="button"
            onClick={() => post.coverAssetId && openLightbox(post.coverAssetId)}
            className="group relative mb-8 block w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-lg ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={coverSrc}
                alt={assetAlt(coverAsset, post.title)}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
          </button>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand dark:text-brand-on-dark">
          Gallery blog
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-recoleta-fallback)] text-3xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {post.title}
        </h1>
        {post.subtitle ? (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{post.subtitle}</p>
        ) : null}
        {publishedLabel ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">{publishedLabel}</p>
        ) : null}
      </header>

      <div className="space-y-8">
        {post.blocks.map((block, index) => (
          <GalleryBlogBlockView
            key={`${block.type}-${index}`}
            block={block}
            assetsById={assetsById}
            showGalleryButton={post.showGalleryButton !== false}
            onImageClick={openLightbox}
            onViewGallery={onViewGallery}
          />
        ))}
      </div>

      {post.enableLightbox && lightboxSrc ? (
        <MediaLightbox
          open
          onClose={() => setLightboxSrc(null)}
          ariaLabel={lightboxAlt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt={lightboxAlt} className={lightboxMediaClass} />
        </MediaLightbox>
      ) : null}
    </article>
  );
}

function GalleryBlogBlockView({
  block,
  assetsById,
  showGalleryButton,
  onImageClick,
  onViewGallery,
}: {
  block: GalleryBlogBlock;
  assetsById: Map<string, GalleryBlogAssetRef>;
  showGalleryButton: boolean;
  onImageClick: (assetId: string) => void;
  onViewGallery?: () => void;
}) {
  if (block.type === "heading") {
    return (
      <h2 className="font-[family-name:var(--font-recoleta-fallback)] text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {block.text}
      </h2>
    );
  }

  if (block.type === "text") {
    if (!block.text.trim()) return <div className="h-2" aria-hidden />;
    return (
      <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-[1.05rem] sm:leading-8">
        {block.text}
      </p>
    );
  }

  if (block.type === "spacer") {
    return <div className="h-6" aria-hidden />;
  }

  if (block.type === "gallery-button") {
    if (!showGalleryButton || !onViewGallery) return null;
    return (
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onViewGallery}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Images className="h-4 w-4 shrink-0" aria-hidden />
          {block.label?.trim() || "View gallery"}
        </button>
      </div>
    );
  }

  if (block.type === "image-row") {
    const left = assetsById.get(block.leftAssetId);
    const right = assetsById.get(block.rightAssetId);
    return (
      <figure className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[left, right].map((asset, i) => {
            const src = assetSrc(asset);
            const id = i === 0 ? block.leftAssetId : block.rightAssetId;
            if (!src) return <div key={id} className="aspect-[4/5] rounded-2xl bg-zinc-100 dark:bg-zinc-900" />;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onImageClick(id)}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800"
              >
                <Image
                  src={src}
                  alt={assetAlt(asset, "Gallery photo")}
                  fill
                  sizes="(max-width: 768px) 45vw, 360px"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </button>
            );
          })}
        </div>
        {block.caption ? (
          <figcaption className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "image") {
    const asset = assetsById.get(block.assetId);
    const src = assetSrc(asset);
    if (!src) return null;
    const layout = block.layout ?? "full";
    const widthClass =
      layout === "inset"
        ? "mx-auto max-w-xl"
        : layout === "wide"
          ? "mx-auto max-w-2xl"
          : "w-full";

    return (
      <figure className={cn("space-y-3", widthClass)}>
        <button
          type="button"
          onClick={() => onImageClick(block.assetId)}
          className={cn(
            "group relative block w-full overflow-hidden bg-zinc-100 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800",
            layout === "full" ? "rounded-3xl" : "rounded-2xl",
          )}
        >
          <div
            className={cn(
              "relative w-full",
              layout === "full" ? "aspect-[16/10]" : "aspect-[4/3]",
            )}
          >
            <Image
              src={src}
              alt={block.alt?.trim() || assetAlt(asset, "Gallery photo")}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </button>
        {block.caption ? (
          <figcaption className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return null;
}
