import { sameOriginUploadsUrl } from "@/lib/api";
import { authedFormUpload, authedJson, HttpError } from "@/lib/http";
import {
  defaultBrandWatermarkSettings,
  normalizeBrandWatermarkSettings,
  saveBrandWatermarkSettings,
  sizeLabelToPercent,
  sizePercentToLabel,
  type BrandWatermarkSettings,
} from "@/lib/watermark-brand";

export class WatermarkApiError extends HttpError {}

type ApiWatermarkTemplate = {
  size?: string;
  sizeLabel?: string;
  opacity?: number;
  position?: { x?: number; y?: number };
};

type ApiWatermarkLogo = {
  logoSrc?: string | null;
  logoUrl?: string | null;
  trim?: { x?: number; y?: number; width?: number; height?: number };
};

export type ApiWatermarkPayload = {
  enabled?: boolean;
  logo?: ApiWatermarkLogo;
  portrait?: ApiWatermarkTemplate;
  landscape?: ApiWatermarkTemplate;
};

type ApiWatermarkResponse = {
  watermark?: ApiWatermarkPayload;
  message?: string;
};

function coerceLogoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:")) return trimmed;
  return sameOriginUploadsUrl(trimmed);
}

export function apiWatermarkToBrand(raw: ApiWatermarkPayload | undefined): BrandWatermarkSettings {
  if (!raw) return defaultBrandWatermarkSettings();
  const logo = raw.logo;
  const normalized = normalizeBrandWatermarkSettings({
    enabled: raw.enabled,
    logo,
    portrait: raw.portrait,
    landscape: raw.landscape,
  });
  if (normalized.logoDataUrl) {
    normalized.logoDataUrl = coerceLogoUrl(normalized.logoDataUrl);
  }
  return normalized;
}

function trimFromCrop(settings: BrandWatermarkSettings) {
  const crop = settings.crop;
  return {
    x: crop?.x ?? 0,
    y: crop?.y ?? 0,
    width: crop?.w ?? 1,
    height: crop?.h ?? 1,
  };
}

export function brandWatermarkToFormData(
  settings: BrandWatermarkSettings,
  logoFile?: File | null,
): FormData {
  const form = new FormData();
  const trim = trimFromCrop(settings);

  form.append("enabled", settings.enabled ? "true" : "false");
  form.append("trimX", String(trim.x));
  form.append("trimY", String(trim.y));
  form.append("trimWidth", String(trim.width));
  form.append("trimHeight", String(trim.height));

  form.append("portraitSize", sizePercentToLabel(settings.portrait.sizePercent));
  form.append("portraitOpacity", String(settings.portrait.opacity));
  form.append("portraitPositionX", String(Math.round(settings.portrait.posX * 100)));
  form.append("portraitPositionY", String(Math.round(settings.portrait.posY * 100)));

  form.append("landscapeSize", sizePercentToLabel(settings.landscape.sizePercent));
  form.append("landscapeOpacity", String(settings.landscape.opacity));
  form.append("landscapePositionX", String(Math.round(settings.landscape.posX * 100)));
  form.append("landscapePositionY", String(Math.round(settings.landscape.posY * 100)));

  if (logoFile) {
    form.append("logo", logoFile);
  }

  return form;
}

export async function getWatermarkSettings(): Promise<BrandWatermarkSettings> {
  const body = await authedJson<ApiWatermarkResponse>(
    "/api/settings/watermark",
    { method: "GET" },
    "Failed to load watermark settings",
    WatermarkApiError,
  );
  const settings = apiWatermarkToBrand(body.watermark);
  saveBrandWatermarkSettings(settings);
  return settings;
}

export type UpdateWatermarkInput = {
  settings: BrandWatermarkSettings;
  /** When set, uploads a new logo file. Omit to keep the existing server logo. */
  logoFile?: File | null;
};

export async function updateWatermarkSettings(
  input: UpdateWatermarkInput,
): Promise<BrandWatermarkSettings> {
  const form = brandWatermarkToFormData(input.settings, input.logoFile);
  const body = await authedFormUpload<ApiWatermarkResponse>(
    "/api/settings/watermark",
    form,
    {
      method: "PUT",
      fallbackError: "Failed to save watermark settings",
      ErrorCtor: WatermarkApiError,
    },
  );
  const settings = apiWatermarkToBrand(body.watermark);
  saveBrandWatermarkSettings(settings);
  return settings;
}
