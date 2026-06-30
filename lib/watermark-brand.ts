export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export type WatermarkTemplateSettings = {
  /** Normalized horizontal center of the logo (0–1). */
  posX: number;
  /** Normalized vertical center of the logo (0–1). */
  posY: number;
  /** Logo width as % of the shorter edge of the export (5–40). */
  sizePercent: number;
  /** 10–100 */
  opacity: number;
};

/** Normalized crop on the uploaded logo (0–1). */
export type WatermarkLogoCrop = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type BrandWatermarkSettings = {
  enabled: boolean;
  logoDataUrl: string | null;
  crop: WatermarkLogoCrop | null;
  portrait: WatermarkTemplateSettings;
  landscape: WatermarkTemplateSettings;
};

export type WatermarkSizeLabel = "small" | "medium" | "large";

export function sizePercentToLabel(sizePercent: number): WatermarkSizeLabel {
  if (sizePercent <= 12) return "small";
  if (sizePercent >= 28) return "large";
  return "medium";
}

export function sizeLabelToPercent(label: string): number {
  switch (label.trim().toLowerCase()) {
    case "small":
      return 10;
    case "large":
      return 30;
    default:
      return 18;
  }
}

export const WATERMARK_POSITIONS: { id: WatermarkPosition; label: string }[] = [
  { id: "top-left", label: "Top left" },
  { id: "top-right", label: "Top right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-right", label: "Bottom right" },
  { id: "center", label: "Center" },
];

const POSITION_NORM: Record<WatermarkPosition, { posX: number; posY: number }> = {
  "top-left": { posX: 0.12, posY: 0.12 },
  "top-right": { posX: 0.88, posY: 0.12 },
  "bottom-left": { posX: 0.12, posY: 0.88 },
  "bottom-right": { posX: 0.88, posY: 0.88 },
  center: { posX: 0.5, posY: 0.5 },
};

export const DEFAULT_PORTRAIT_TEMPLATE: WatermarkTemplateSettings = {
  posX: POSITION_NORM["bottom-right"].posX,
  posY: POSITION_NORM["bottom-right"].posY,
  sizePercent: 18,
  opacity: 85,
};

export const DEFAULT_LANDSCAPE_TEMPLATE: WatermarkTemplateSettings = {
  posX: POSITION_NORM["bottom-right"].posX,
  posY: POSITION_NORM["bottom-right"].posY,
  sizePercent: 12,
  opacity: 85,
};

export function defaultBrandWatermarkSettings(): BrandWatermarkSettings {
  return {
    enabled: false,
    logoDataUrl: null,
    crop: null,
    portrait: { ...DEFAULT_PORTRAIT_TEMPLATE },
    landscape: { ...DEFAULT_LANDSCAPE_TEMPLATE },
  };
}

const STORAGE_KEY = "gidostorage_brand_watermark_v1";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizePosition(raw: unknown, fallback: WatermarkTemplateSettings) {
  let posX = Number.NaN;
  let posY = Number.NaN;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    posX = Number(o.posX ?? o.pos_x);
    posY = Number(o.posY ?? o.pos_y);
    if (!Number.isFinite(posX) || !Number.isFinite(posY)) {
      const pos = o.position;
      if (typeof pos === "string" && pos in POSITION_NORM) {
        posX = POSITION_NORM[pos as WatermarkPosition].posX;
        posY = POSITION_NORM[pos as WatermarkPosition].posY;
      } else if (pos && typeof pos === "object") {
        const po = pos as Record<string, unknown>;
        posX = Number(po.x);
        posY = Number(po.y);
      }
    }
  }
  if (!Number.isFinite(posX)) posX = fallback.posX;
  if (!Number.isFinite(posY)) posY = fallback.posY;
  if (posX > 1) posX /= 100;
  if (posY > 1) posY /= 100;
  return { posX: clamp(posX, 0, 1), posY: clamp(posY, 0, 1) };
}

function normalizeTemplate(raw: unknown, fallback: WatermarkTemplateSettings): WatermarkTemplateSettings {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  const { posX, posY } = normalizePosition(o, fallback);
  let sizePercent = fallback.sizePercent;
  const sizeRaw = o.sizePercent ?? o.size_percent ?? o.size;
  if (typeof sizeRaw === "string") {
    sizePercent = sizeLabelToPercent(sizeRaw);
  } else if (Number.isFinite(Number(sizeRaw))) {
    sizePercent = Number(sizeRaw);
  }
  const opacity = clamp(Number(o.opacity ?? fallback.opacity), 10, 100);
  return {
    posX,
    posY,
    sizePercent: clamp(sizePercent, 5, 40),
    opacity,
  };
}

function normalizeCrop(raw: unknown): WatermarkLogoCrop | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x);
  const y = Number(o.y);
  const w = Number(o.w ?? o.width);
  const h = Number(o.h ?? o.height);
  if (![x, y, w, h].every(Number.isFinite)) return null;
  if (w <= 0 || h <= 0) return null;
  return {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    w: clamp(w, 0.05, 1),
    h: clamp(h, 0.05, 1),
  };
}

export function normalizeBrandWatermarkSettings(raw: unknown): BrandWatermarkSettings {
  const base = defaultBrandWatermarkSettings();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  let logoDataUrl: string | null = null;
  let crop = normalizeCrop(o.crop);
  const logoObj = o.logo;
  if (logoObj && typeof logoObj === "object") {
    const lo = logoObj as Record<string, unknown>;
    const url =
      typeof lo.logoUrl === "string"
        ? lo.logoUrl
        : typeof lo.logoSrc === "string"
          ? lo.logoSrc
          : null;
    if (url?.trim()) logoDataUrl = url.trim();
    const trimCrop = normalizeCrop(lo.trim);
    if (trimCrop) crop = trimCrop;
  }
  if (!logoDataUrl) {
    logoDataUrl =
      typeof o.logoDataUrl === "string"
        ? o.logoDataUrl
        : typeof o.logo_data_url === "string"
          ? o.logo_data_url
          : null;
  }

  return {
    enabled: Boolean(o.enabled ?? o.brandWatermarkEnabled),
    logoDataUrl,
    crop,
    portrait: normalizeTemplate(o.portrait, DEFAULT_PORTRAIT_TEMPLATE),
    landscape: normalizeTemplate(o.landscape, DEFAULT_LANDSCAPE_TEMPLATE),
  };
}

export function getBrandWatermarkSettings(): BrandWatermarkSettings {
  if (typeof window === "undefined") return defaultBrandWatermarkSettings();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBrandWatermarkSettings();
    return normalizeBrandWatermarkSettings(JSON.parse(raw) as unknown);
  } catch {
    return defaultBrandWatermarkSettings();
  }
}

export function saveBrandWatermarkSettings(settings: BrandWatermarkSettings): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function effectiveLogoDataUrl(settings: BrandWatermarkSettings): string | null {
  const url = settings.logoDataUrl?.trim();
  return url || null;
}

export function isImageMime(mime: string): boolean {
  const m = mime.toLowerCase();
  return m.startsWith("image/") && !m.includes("svg");
}

/** Inset from photo edges so the logo is not flush against the border. */
export function watermarkPaddingPx(w: number, h: number): number {
  const min = Math.min(w, h);
  return Math.max(16, Math.round(min * 0.045));
}

export function watermarkLogoMetrics(
  canvasW: number,
  canvasH: number,
  logoNaturalW: number,
  logoNaturalH: number,
  sizePercent: number,
): { logoW: number; logoH: number } {
  const minEdge = Math.min(canvasW, canvasH);
  const targetW = (minEdge * sizePercent) / 100;
  const aspect = logoNaturalW / Math.max(1, logoNaturalH);
  let logoW = targetW;
  let logoH = targetW / aspect;
  if (logoH > minEdge * 0.4) {
    logoH = minEdge * 0.4;
    logoW = logoH * aspect;
  }
  return { logoW, logoH };
}

export function watermarkLogoPlacement(
  posX: number,
  posY: number,
  canvasW: number,
  canvasH: number,
  logoW: number,
  logoH: number,
): { x: number; y: number } {
  const pad = watermarkPaddingPx(canvasW, canvasH);
  let x = posX * canvasW - logoW / 2;
  let y = posY * canvasH - logoH / 2;
  x = clamp(x, pad, canvasW - logoW - pad);
  y = clamp(y, pad, canvasH - logoH - pad);
  return { x, y };
}
