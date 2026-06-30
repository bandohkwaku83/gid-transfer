type JsPdfDoc = import("jspdf").jsPDF;

type FontFiles = {
  bodyRegular: string;
  bodyBold: string;
  displayRegular: string;
  displayBold: string;
};

/** Body text — Noto Sans includes currency symbols (e.g. GH₵ U+20B5). */
const FONT_BODY = "NotoSans";
const FONT_DISPLAY = "Fraunces";
const FALLBACK_FONT = "helvetica";

const CDN = {
  notoSansRegular:
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
  notoSansBold:
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
  frauncesRegular:
    "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-400-normal.ttf",
  frauncesBold:
    "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-700-normal.ttf",
};


type RegisteredFonts = {
  body: boolean;
  bodyBold: boolean;
  display: boolean;
  displayBold: boolean;
};

let fontCache: FontFiles | null = null;
let fontLoadPromise: Promise<FontFiles> | null = null;
let registeredFonts: RegisteredFonts = {
  body: false,
  bodyBold: false,
  display: false,
  displayBold: false,
};

async function fetchBinaryAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function tryFetchBase64(url: string): Promise<string | null> {
  try {
    return await fetchBinaryAsBase64(url);
  } catch {
    return null;
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** jsPDF only accepts TrueType / OpenType — not WOFF2 or HTML error pages. */
function isValidTtfOrOtf(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  if (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0) return true;
  if (bytes[0] === 0x4f && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4f) return true;
  if (bytes[0] === 0x74 && bytes[1] === 0x72 && bytes[2] === 0x75 && bytes[3] === 0x65) return true;
  return false;
}

function isValidTtfBase64(base64: string | null | undefined): base64 is string {
  if (!base64 || base64.length < 16) return false;
  try {
    return isValidTtfOrOtf(base64ToBytes(base64));
  } catch {
    return false;
  }
}

function safeAddFont(
  doc: JsPdfDoc,
  vfsName: string,
  family: string,
  style: "normal" | "bold",
  data: string,
): boolean {
  if (!isValidTtfBase64(data)) return false;
  try {
    doc.addFileToVFS(vfsName, data);
    doc.addFont(vfsName, family, style);
    doc.setFont(family, style);
    const width = doc.getTextWidth("M");
    if (!Number.isFinite(width) || width <= 0) return false;
    return true;
  } catch {
    return false;
  }
}

async function loadFontFiles(): Promise<FontFiles> {
  const [notoSansRegular, notoSansBold, frauncesRegular, frauncesBold] = await Promise.all([
    tryFetchBase64(CDN.notoSansRegular),
    tryFetchBase64(CDN.notoSansBold),
    tryFetchBase64(CDN.frauncesRegular),
    tryFetchBase64(CDN.frauncesBold),
  ]);

  return {
    bodyRegular: notoSansRegular ?? "",
    bodyBold: notoSansBold ?? "",
    // Fraunces is the open substitute for Recoleta — jsPDF needs TTF, not WOFF2.
    displayRegular: frauncesRegular ?? "",
    displayBold: frauncesBold ?? "",
  };
}

async function getFontFiles(): Promise<FontFiles> {
  if (fontCache) return fontCache;
  if (!fontLoadPromise) {
    fontLoadPromise = loadFontFiles().then((files) => {
      fontCache = files;
      return files;
    });
  }
  return fontLoadPromise;
}

export async function registerInvoicePdfFonts(doc: JsPdfDoc): Promise<void> {
  const files = await getFontFiles();

  registeredFonts = {
    body: safeAddFont(doc, "NotoSans-Regular.ttf", FONT_BODY, "normal", files.bodyRegular),
    bodyBold: safeAddFont(doc, "NotoSans-Bold.ttf", FONT_BODY, "bold", files.bodyBold),
    display: false,
    displayBold: false,
  };

  const displayRegularOk = safeAddFont(
    doc,
    "Display-Regular.ttf",
    FONT_DISPLAY,
    "normal",
    files.displayRegular,
  );
  const displayBoldOk = safeAddFont(
    doc,
    "Display-Bold.ttf",
    FONT_DISPLAY,
    "bold",
    files.displayBold,
  );

  registeredFonts.display = displayRegularOk;
  registeredFonts.displayBold = displayBoldOk;
}

export function pdfBodyFont(doc: JsPdfDoc, weight: "normal" | "bold" = "normal") {
  if (weight === "bold" && registeredFonts.bodyBold) {
    doc.setFont(FONT_BODY, "bold");
    return;
  }
  if (registeredFonts.body) {
    doc.setFont(FONT_BODY, "normal");
    return;
  }
  doc.setFont(FALLBACK_FONT, weight);
}

export function pdfDisplayFont(doc: JsPdfDoc, weight: "normal" | "bold" = "normal") {
  if (!registeredFonts.display) {
    doc.setFont(FALLBACK_FONT, weight);
    return;
  }
  if (weight === "bold" && !registeredFonts.displayBold) {
    doc.setFont(FONT_DISPLAY, "normal");
    return;
  }
  doc.setFont(FONT_DISPLAY, weight);
}

/**
 * Currency string for PDF output. Uses GH₵ with a space before the amount so the
 * cedis sign (U+20B5) renders cleanly in Noto Sans — Questrial/Fraunces/Helvetica
 * latin subsets omit that glyph.
 */
export function formatPdfCurrency(amount: number, currency = "GHS"): string {
  const code = currency.trim().toUpperCase() || "GHS";
  const formatted = amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (code === "GHS") return `GH\u20B5 ${formatted}`;
  return `${code} ${formatted}`;
}
