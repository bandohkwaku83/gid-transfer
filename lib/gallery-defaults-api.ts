import { sameOriginUploadsUrl } from "@/lib/api";
import { authedFormUpload, authedJson, HttpError } from "@/lib/http";

export class GalleryDefaultsApiError extends HttpError {}

export type ApiGalleryDefaultCover = {
  hasCover: boolean;
  coverSrc: string | null;
  coverUrl: string | null;
  emptyStateLabel: string | null;
};

export type ApiGalleryDefaults = {
  watermarkPreviewEnabled: boolean;
  watermarkPreview: {
    enabled: boolean;
    title: string;
    description: string;
  };
  defaultCover: ApiGalleryDefaultCover;
};

type ApiGalleryDefaultsResponse = {
  galleryDefaults?: ApiGalleryDefaults;
  message?: string;
};

export type GalleryDefaultsSettingsFields = {
  watermarkPreviewImages: boolean;
  defaultCoverImage?: string;
  defaultCoverImageUrl?: string;
};

function coerceCoverUrl(url: string | null | undefined): string | undefined {
  if (typeof url !== "string" || !url.trim()) return undefined;
  return sameOriginUploadsUrl(url.trim());
}

function requireGalleryDefaults(body: ApiGalleryDefaultsResponse): ApiGalleryDefaults {
  if (!body.galleryDefaults) {
    throw new GalleryDefaultsApiError("Gallery defaults missing from response", 500, body);
  }
  return body.galleryDefaults;
}

export function apiGalleryDefaultsToSettings(
  raw: ApiGalleryDefaults,
): GalleryDefaultsSettingsFields {
  const coverUrl = coerceCoverUrl(raw.defaultCover?.coverUrl ?? raw.defaultCover?.coverSrc);
  return {
    watermarkPreviewImages: Boolean(
      raw.watermarkPreviewEnabled ?? raw.watermarkPreview?.enabled,
    ),
    defaultCoverImage: coverUrl,
    defaultCoverImageUrl: coverUrl,
  };
}

export async function getGalleryDefaults(): Promise<ApiGalleryDefaults> {
  const body = await authedJson<ApiGalleryDefaultsResponse>(
    "/api/settings/gallery-defaults",
    { method: "GET" },
    "Failed to load gallery defaults",
    GalleryDefaultsApiError,
  );
  return requireGalleryDefaults(body);
}

export async function updateGalleryWatermarkPreview(
  enabled: boolean,
): Promise<ApiGalleryDefaults> {
  const body = await authedJson<ApiGalleryDefaultsResponse>(
    "/api/settings/gallery-defaults/watermark-preview",
    {
      method: "PATCH",
      body: JSON.stringify({ watermarkPreviewEnabled: enabled }),
    },
    "Failed to save gallery defaults",
    GalleryDefaultsApiError,
  );
  return requireGalleryDefaults(body);
}

export async function uploadGalleryDefaultCover(file: File): Promise<ApiGalleryDefaults> {
  const form = new FormData();
  form.append("defaultCover", file);
  const body = await authedFormUpload<ApiGalleryDefaultsResponse>(
    "/api/settings/gallery-defaults/default-cover",
    form,
    {
      method: "POST",
      fallbackError: "Failed to upload default cover",
      ErrorCtor: GalleryDefaultsApiError,
    },
  );
  return requireGalleryDefaults(body);
}

export async function deleteGalleryDefaultCover(): Promise<ApiGalleryDefaults> {
  const body = await authedJson<ApiGalleryDefaultsResponse>(
    "/api/settings/gallery-defaults/default-cover",
    { method: "DELETE" },
    "Failed to remove default cover",
    GalleryDefaultsApiError,
  );
  return requireGalleryDefaults(body);
}
