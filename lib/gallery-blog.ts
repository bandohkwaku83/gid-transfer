import { getFolderOverride, patchFolderOverride, loadProjectByShareToken } from "@/lib/demo-data";
import { isLocalDemoFolderId } from "@/lib/folders/helpers";
import type { PublicGalleryKey } from "@/lib/share-gallery-api";
import { publicGallerySessionId } from "@/lib/share-gallery-api";

export type GalleryBlogTemplate = "editorial" | "story" | "grid";

export type GalleryBlogImageLayout = "full" | "wide" | "inset";

export type GalleryBlogBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | {
      type: "image";
      assetId: string;
      caption?: string;
      layout?: GalleryBlogImageLayout;
      alt?: string;
    }
  | {
      type: "image-row";
      leftAssetId: string;
      rightAssetId: string;
      caption?: string;
    }
  | { type: "gallery-button"; label?: string }
  | { type: "spacer" };

export type GalleryBlogPost = {
  id: string;
  title: string;
  subtitle?: string;
  status: "draft" | "published";
  template: GalleryBlogTemplate;
  blocks: GalleryBlogBlock[];
  coverAssetId?: string;
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
  showGalleryButton?: boolean;
  enableLightbox?: boolean;
};

export type GalleryBlogAssetRef = {
  id: string;
  thumbUrl: string;
  previewUrl?: string;
  originalName: string;
};

const BLOG_STORAGE = "gidostorage_gallery_blog_v1";

export const GALLERY_BLOG_TEMPLATES: {
  id: GalleryBlogTemplate;
  label: string;
  description: string;
}[] = [
  {
    id: "editorial",
    label: "Editorial",
    description: "Full-bleed hero images with clean captions — ideal for weddings and portraits.",
  },
  {
    id: "story",
    label: "Story",
    description: "Alternating photos and text blocks for a narrative walkthrough.",
  },
  {
    id: "grid",
    label: "Photo grid",
    description: "Pairs and grids of gallery photos with a short intro.",
  },
];

function blogPostId(): string {
  return `blog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readRemoteBlogMap(): Record<string, GalleryBlogPost[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BLOG_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, GalleryBlogPost[]>)
      : {};
  } catch {
    return {};
  }
}

function writeRemoteBlogMap(next: Record<string, GalleryBlogPost[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOG_STORAGE, JSON.stringify(next));
}

function readBlogPosts(folderId: string): GalleryBlogPost[] {
  if (isLocalDemoFolderId(folderId)) {
    return getFolderOverride(folderId)?.galleryBlogPosts ?? [];
  }
  return readRemoteBlogMap()[folderId] ?? [];
}

function writeBlogPosts(folderId: string, posts: GalleryBlogPost[]) {
  if (isLocalDemoFolderId(folderId)) {
    patchFolderOverride(folderId, { galleryBlogPosts: posts });
    return;
  }
  const map = readRemoteBlogMap();
  writeRemoteBlogMap({ ...map, [folderId]: posts });
}

export function listGalleryBlogPosts(folderId: string): GalleryBlogPost[] {
  return [...readBlogPosts(folderId)].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function listPublishedGalleryBlogPosts(folderId: string): GalleryBlogPost[] {
  return listGalleryBlogPosts(folderId).filter((p) => p.status === "published");
}

export function getGalleryBlogPost(folderId: string, postId: string): GalleryBlogPost | undefined {
  return readBlogPosts(folderId).find((p) => p.id === postId);
}

export function saveGalleryBlogPost(folderId: string, post: GalleryBlogPost): GalleryBlogPost {
  const posts = readBlogPosts(folderId);
  const idx = posts.findIndex((p) => p.id === post.id);
  const next = idx >= 0 ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts];
  writeBlogPosts(folderId, next);
  return post;
}

export function deleteGalleryBlogPost(folderId: string, postId: string) {
  writeBlogPosts(
    folderId,
    readBlogPosts(folderId).filter((p) => p.id !== postId),
  );
}

export function createGalleryBlogPost(input: {
  folderId: string;
  title: string;
  template: GalleryBlogTemplate;
  assetIds: string[];
  subtitle?: string;
}): GalleryBlogPost {
  const now = new Date().toISOString();
  const post: GalleryBlogPost = {
    id: blogPostId(),
    title: input.title.trim() || "Untitled post",
    subtitle: input.subtitle?.trim() || undefined,
    status: "draft",
    template: input.template,
    blocks: buildBlocksFromTemplate(input.template, input.assetIds),
    coverAssetId: input.assetIds[0],
    createdAt: now,
    updatedAt: now,
    showGalleryButton: true,
    enableLightbox: true,
  };
  return saveGalleryBlogPost(input.folderId, post);
}

export function buildBlocksFromTemplate(
  template: GalleryBlogTemplate,
  assetIds: string[],
): GalleryBlogBlock[] {
  const blocks: GalleryBlogBlock[] = [
    {
      type: "text",
      text: "Every gallery tells a story. Add your words here — the venue, the light, the moments that mattered.",
    },
  ];

  if (template === "grid") {
    for (let i = 0; i < assetIds.length; i += 2) {
      if (i + 1 < assetIds.length) {
        blocks.push({
          type: "image-row",
          leftAssetId: assetIds[i]!,
          rightAssetId: assetIds[i + 1]!,
        });
      } else {
        blocks.push({ type: "image", assetId: assetIds[i]!, layout: "wide" });
      }
    }
  } else if (template === "story") {
    for (const assetId of assetIds) {
      blocks.push({ type: "image", assetId, layout: "wide" });
      blocks.push({ type: "text", text: "" });
    }
  } else {
    for (const assetId of assetIds) {
      blocks.push({ type: "image", assetId, layout: "full" });
    }
  }

  blocks.push({ type: "gallery-button", label: "View gallery" });
  return blocks;
}

export function resolveGalleryBlogFolderId(input: {
  folderId?: string | null;
  publicKey?: PublicGalleryKey;
}): string | null {
  if (input.folderId?.trim()) return input.folderId.trim();
  if (input.publicKey?.type === "token") {
    const fromToken = loadProjectByShareToken(input.publicKey.token);
    if (fromToken) return fromToken.id;
  }
  if (input.publicKey) {
    return `blog-session:${publicGallerySessionId(input.publicKey)}`;
  }
  return null;
}

export function listPublishedGalleryBlogPostsForShare(input: {
  folderId?: string | null;
  publicKey?: PublicGalleryKey;
}): GalleryBlogPost[] {
  const folderId = resolveGalleryBlogFolderId(input);
  if (!folderId) return [];
  return listPublishedGalleryBlogPosts(folderId);
}

/** Demo seed — one published editorial post for the Kwaku wedding gallery. */
export function ensureDemoGalleryBlogSeed(folderId: string, assetIds: string[]) {
  if (readBlogPosts(folderId).length > 0) return;
  if (assetIds.length < 2) return;

  const now = new Date().toISOString();
  const post: GalleryBlogPost = {
    id: "blog-seed-kwaku",
    title: "Kwaku & Ama — A celebration of love",
    subtitle: "Ceremony highlights from Accra",
    status: "published",
    template: "editorial",
    coverAssetId: assetIds[0],
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    showGalleryButton: true,
    enableLightbox: true,
    blocks: [
      {
        type: "text",
        text: "From the first look to the last dance, every frame was about joy, family, and the golden hour light pouring through the chapel windows.",
      },
      { type: "image", assetId: assetIds[0]!, layout: "full", caption: "The aisle moment" },
      {
        type: "text",
        text: "We loved how the reception opened onto the garden — candid laughter between formal portraits, and plenty of room for the little details that make a day unforgettable.",
      },
      { type: "image", assetId: assetIds[1]!, layout: "wide", caption: "Reception golden hour" },
      ...(assetIds[2]
        ? [{ type: "image" as const, assetId: assetIds[2], layout: "full" as const }]
        : []),
      { type: "gallery-button", label: "Browse the full gallery" },
    ],
  };
  saveGalleryBlogPost(folderId, post);
}
