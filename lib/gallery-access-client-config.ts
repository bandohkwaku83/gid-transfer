/** Photographer dashboard ↔ client link bridge for access-code UI until fully API-driven. */
const CONFIG_PREFIX = "gidostorage-gallery-access:";
const TOKEN_PREFIX = "gidostorage-gallery-access-token:";

export type GalleryAccessClientConfig = {
  enabled: boolean;
  pin: string;
};

export function galleryAccessConfigStorageKey(sessionId: string): string {
  return `${CONFIG_PREFIX}${sessionId}`;
}

export function galleryAccessTokenStorageKey(sessionId: string): string {
  return `${TOKEN_PREFIX}${sessionId}`;
}

export function readGalleryAccessClientConfig(
  sessionId: string,
): GalleryAccessClientConfig | null {
  if (typeof window === "undefined" || !sessionId) return null;
  try {
    const raw = window.localStorage.getItem(galleryAccessConfigStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GalleryAccessClientConfig;
    if (typeof parsed.enabled !== "boolean" || typeof parsed.pin !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeGalleryAccessClientConfig(
  sessionId: string,
  config: GalleryAccessClientConfig,
): void {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    window.localStorage.setItem(
      galleryAccessConfigStorageKey(sessionId),
      JSON.stringify(config),
    );
  } catch {
    /* ignore quota */
  }
}

export function readGalleryAccessToken(sessionId: string): string | null {
  if (typeof window === "undefined" || !sessionId) return null;
  try {
    const token = window.sessionStorage.getItem(galleryAccessTokenStorageKey(sessionId))?.trim();
    return token || null;
  } catch {
    return null;
  }
}

export function writeGalleryAccessToken(sessionId: string, token: string): void {
  if (typeof window === "undefined" || !sessionId || !token.trim()) return;
  try {
    window.sessionStorage.setItem(galleryAccessTokenStorageKey(sessionId), token.trim());
  } catch {
    /* ignore quota */
  }
}

export function clearGalleryAccessToken(sessionId: string): void {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    window.sessionStorage.removeItem(galleryAccessTokenStorageKey(sessionId));
  } catch {
    /* ignore */
  }
}

export function isGalleryAccessUnlocked(sessionId: string): boolean {
  return Boolean(readGalleryAccessToken(sessionId));
}

/** @deprecated Use {@link writeGalleryAccessToken} — kept for call-site compatibility. */
export function markGalleryAccessUnlocked(sessionId: string, accessToken?: string): void {
  if (accessToken?.trim()) {
    writeGalleryAccessToken(sessionId, accessToken);
  }
}

export function clearGalleryAccessUnlock(sessionId: string): void {
  clearGalleryAccessToken(sessionId);
}
