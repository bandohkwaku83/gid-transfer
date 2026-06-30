export type GalleryListSort = "newest" | "oldest" | "custom";

const ORDER_KEY = "gidostorage.gallery-list-order";
const SORT_KEY = "gidostorage.gallery-list-sort";

function readJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
  } catch {
    return [];
  }
}

export function loadGalleryListOrder(): string[] {
  if (typeof window === "undefined") return [];
  return readJsonArray(window.localStorage.getItem(ORDER_KEY));
}

export function saveGalleryListOrder(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
}

export function loadGalleryListSort(): GalleryListSort {
  if (typeof window === "undefined") return "newest";
  const raw = window.localStorage.getItem(SORT_KEY);
  return raw === "oldest" || raw === "custom" ? raw : "newest";
}

export function saveGalleryListSort(sort: GalleryListSort) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SORT_KEY, sort);
}

/** Keep saved order, drop missing ids, append new galleries at the end. */
export function mergeGalleryListOrder(saved: string[], folderIds: string[]): string[] {
  const idSet = new Set(folderIds);
  const kept = saved.filter((id) => idSet.has(id));
  const added = folderIds.filter((id) => !kept.includes(id));
  return [...kept, ...added];
}

export function applyGalleryListOrder<T extends { _id: string }>(items: T[], order: string[]): T[] {
  if (!order.length) return items;
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const ai = rank.get(a._id);
    const bi = rank.get(b._id);
    if (ai == null && bi == null) return 0;
    if (ai == null) return 1;
    if (bi == null) return -1;
    return ai - bi;
  });
}
