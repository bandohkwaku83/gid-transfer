import type { BookedShoot } from "@/components/schedules/booking-types";
import { formatBookedTimeLabel } from "@/components/schedules/booking-types";
import { BRAND_RGB, DEFAULT_STUDIO_LOGO_PATH, STUDIO_NAME } from "@/lib/branding";
import type { PhotographerStudioProfile } from "@/lib/auth-demo";
import {
  formatPdfCurrency,
  pdfBodyFont,
  pdfDisplayFont,
  registerInvoicePdfFonts,
} from "@/lib/invoice-pdf-fonts";

export type BookingInvoiceStudio = {
  companyName: string;
  email?: string;
  phone?: string;
  website?: string;
  logoDataUrl?: string;
};

export type BookingInvoiceClient = {
  name: string;
  email?: string;
  contact?: string;
  location?: string;
};

export type InvoiceAddOn = {
  label: string;
  amount: number;
};

export type BookingInvoiceLineItem = {
  description: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type BookingInvoiceData = {
  invoiceNumber: string;
  issuedOn: string;
  dueOn: string;
  studio: BookingInvoiceStudio;
  client: BookingInvoiceClient;
  booking: BookedShoot;
  lineItems: BookingInvoiceLineItem[];
  subtotal: number;
  total: number;
  currency: string;
  notes?: string;
};

const INK_RGB: [number, number, number] = [24, 24, 27];
const MUTED_RGB: [number, number, number] = [113, 113, 122];
const BORDER_RGB: [number, number, number] = [228, 228, 231];
const SOFT_RGB: [number, number, number] = [250, 250, 252];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoTodayLocal(): string {
  const t = new Date();
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatInvoiceDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function invoiceNumberForBooking(bookingId: string, issuedOn: string): string {
  const suffix = bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "000000";
  const compact = issuedOn.replace(/-/g, "");
  return `INV-${compact}-${suffix}`;
}

function bookingServiceTitle(booking: BookedShoot): string {
  return `${booking.shootTypeLabel} — ${booking.title}`;
}

function bookingServiceDetail(booking: BookedShoot): string {
  const dateLabel = formatInvoiceDate(booking.date);
  const timeLabel = formatBookedTimeLabel(booking.startTime);
  const end = booking.endTime ? ` – ${formatBookedTimeLabel(booking.endTime)}` : "";
  const location = booking.location ? ` · ${booking.location}` : "";
  return `${dateLabel} · ${timeLabel}${end}${location}`;
}

export function studioFromProfile(
  studio: PhotographerStudioProfile | undefined,
  accountEmail?: string,
): BookingInvoiceStudio {
  return {
    companyName: studio?.companyName?.trim() || STUDIO_NAME,
    email: accountEmail?.trim() || undefined,
    phone: studio?.phone?.trim() || undefined,
    website: studio?.website?.trim() || studio?.studioUrl?.trim() || undefined,
    logoDataUrl: studio?.logoDataUrl,
  };
}

function normalizeAddOns(addOns: InvoiceAddOn[] = []): InvoiceAddOn[] {
  return addOns
    .map((item) => ({
      label: item.label.trim(),
      amount: Number.isFinite(item.amount) && item.amount > 0 ? item.amount : 0,
    }))
    .filter((item) => item.label && item.amount > 0);
}

export function buildBookingInvoiceData(
  booking: BookedShoot,
  client: BookingInvoiceClient,
  studio: BookingInvoiceStudio,
  options?: { issuedOn?: string; dueInDays?: number; addOns?: InvoiceAddOn[] },
): BookingInvoiceData {
  const issuedOn = options?.issuedOn ?? isoTodayLocal();
  const dueInDays = options?.dueInDays ?? 14;
  const baseAmount = booking.amountCharged && booking.amountCharged > 0 ? booking.amountCharged : 0;
  const currency = booking.currency?.trim() || "GHS";
  const addOns = normalizeAddOns(options?.addOns);

  const lineItems: BookingInvoiceLineItem[] = [
    {
      description: bookingServiceTitle(booking),
      detail: bookingServiceDetail(booking),
      quantity: 1,
      unitPrice: baseAmount,
      total: baseAmount,
    },
    ...addOns.map((addOn) => ({
      description: addOn.label,
      quantity: 1,
      unitPrice: addOn.amount,
      total: addOn.amount,
    })),
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  return {
    invoiceNumber: invoiceNumberForBooking(booking.id, issuedOn),
    issuedOn,
    dueOn: addDaysIso(issuedOn, dueInDays),
    studio,
    client,
    booking,
    lineItems,
    subtotal,
    total: subtotal,
    currency,
    notes: booking.notes,
  };
}

function formatMoney(amount: number, currency: string): string {
  return formatPdfCurrency(amount, currency);
}

function safePdfFilename(invoiceNumber: string): string {
  return `${invoiceNumber.replace(/[^a-zA-Z0-9-_]+/g, "-")}.pdf`;
}

async function loadJsPdf() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

type JsPdfDoc = InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>;

function writeWrappedText(
  doc: JsPdfDoc,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  fontSize = lineHeight,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight);
  });
  if (lines.length === 0) return y;
  const lastBaseline = y + (lines.length - 1) * lineHeight;
  return lastBaseline + fontSize * 0.85;
}

function imageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  const match = /^data:image\/(png|jpe?g|webp)/i.exec(dataUrl);
  if (!match) return "PNG";
  const type = match[1].toLowerCase();
  if (type === "jpg" || type === "jpeg") return "JPEG";
  if (type === "webp") return "WEBP";
  return "PNG";
}

async function rasterizeImageToPngDataUrl(src: string, maxSize = 220): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not prepare logo."));
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Could not load logo."));
    img.src = src;
  });
}

export async function resolveStudioLogoDataUrl(
  studio: BookingInvoiceStudio,
): Promise<string | null> {
  if (studio.logoDataUrl?.startsWith("data:image")) {
    return studio.logoDataUrl;
  }
  try {
    return await rasterizeImageToPngDataUrl(DEFAULT_STUDIO_LOGO_PATH);
  } catch {
    return null;
  }
}

export async function generateBookingInvoicePdf(data: BookingInvoiceData): Promise<Blob> {
  const jsPDF = await loadJsPdf();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await registerInvoicePdfFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  const logoDataUrl = await resolveStudioLogoDataUrl(data.studio);

  let y = margin;
  let studioTextX = margin;

  if (logoDataUrl) {
    try {
      const format = imageFormatFromDataUrl(logoDataUrl);
      const logoH = 44;
      const logoW = 44;
      doc.addImage(logoDataUrl, format, margin, y, logoW, logoH);
      studioTextX = margin + logoW + 14;
    } catch {
      // Continue without logo if embedding fails.
    }
  }

  pdfDisplayFont(doc, "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK_RGB);
  doc.text(data.studio.companyName, studioTextX, y + 16);

  pdfBodyFont(doc);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_RGB);
  const studioContact = [data.studio.email, data.studio.phone, data.studio.website].filter(Boolean);
  studioContact.forEach((line, i) => {
    doc.text(String(line), studioTextX, y + 30 + i * 11);
  });

  pdfDisplayFont(doc, "normal");
  doc.setFontSize(32);
  doc.setTextColor(...INK_RGB);
  doc.text("Invoice", pageWidth - margin, y + 18, { align: "right" });

  pdfBodyFont(doc);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_RGB);
  doc.text(data.invoiceNumber, pageWidth - margin, y + 34, { align: "right" });
  doc.text(`Issued ${formatInvoiceDate(data.issuedOn)}`, pageWidth - margin, y + 46, {
    align: "right",
  });
  doc.text(`Due ${formatInvoiceDate(data.dueOn)}`, pageWidth - margin, y + 58, { align: "right" });

  y += 72;
  doc.setDrawColor(...BRAND_RGB);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  const colAmount = pageWidth - margin;
  const colQty = margin + contentWidth * 0.68;
  const totalsAreaLeft = colAmount - 200;

  pdfBodyFont(doc, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED_RGB);
  doc.text("BILL TO", margin, y);
  doc.text("AMOUNT DUE", colAmount, y, { align: "right" });
  y += 16;

  pdfDisplayFont(doc, "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK_RGB);
  doc.text(data.client.name, margin, y);

  pdfBodyFont(doc, "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND_RGB);
  doc.text(formatMoney(data.total, data.currency), colAmount, y, { align: "right" });
  y += 16;

  pdfBodyFont(doc);
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED_RGB);
  if (data.client.email) {
    doc.text(data.client.email, margin, y);
    y += 12;
  }
  if (data.client.contact) {
    doc.text(data.client.contact, margin, y);
    y += 12;
  }
  if (data.client.location) {
    y = writeWrappedText(doc, data.client.location, margin, y, totalsAreaLeft - margin - 12, 12);
  }

  y += 20;

  const descWidth = totalsAreaLeft - margin - 16;

  doc.setFillColor(...SOFT_RGB);
  doc.rect(margin, y, contentWidth, 22, "F");
  pdfBodyFont(doc, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED_RGB);
  doc.text("Description", margin + 8, y + 14);
  doc.text("Qty", colQty + 28, y + 14, { align: "right" });
  doc.text("Amount", colAmount, y + 14, { align: "right" });
  y += 30;

  data.lineItems.forEach((item) => {
    const rowTop = y;
    pdfBodyFont(doc, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK_RGB);
    let contentBottom = writeWrappedText(
      doc,
      item.description,
      margin + 8,
      rowTop,
      descWidth,
      13,
      10,
    );

    if (item.detail) {
      pdfBodyFont(doc);
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED_RGB);
      const detailTop = contentBottom + 4;
      contentBottom = writeWrappedText(doc, item.detail, margin + 8, detailTop, descWidth, 11, 8.5);
    }

    pdfBodyFont(doc);
    doc.setFontSize(10);
    doc.setTextColor(...INK_RGB);
    doc.text(String(item.quantity), colQty + 28, rowTop, { align: "right" });
    doc.text(formatMoney(item.total, data.currency), colAmount, rowTop, { align: "right" });
    contentBottom = Math.max(contentBottom, rowTop + 12);

    const separatorY = contentBottom + 10;
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.5);
    doc.line(margin, separatorY, pageWidth - margin, separatorY);
    y = separatorY + 16;
  });

  y += 10;

  if (data.lineItems.length > 1) {
    pdfBodyFont(doc);
    doc.setFontSize(10);
    doc.setTextColor(...MUTED_RGB);
    doc.text("Subtotal", totalsAreaLeft, y);
    doc.text(formatMoney(data.subtotal, data.currency), colAmount, y, { align: "right" });
    y += 20;
  }

  pdfBodyFont(doc, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK_RGB);
  doc.text("Total due", totalsAreaLeft, y);
  pdfBodyFont(doc, "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_RGB);
  doc.text(formatMoney(data.total, data.currency), colAmount, y, { align: "right" });
  y += 28;

  if (data.notes?.trim()) {
    pdfBodyFont(doc, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_RGB);
    doc.text("Notes", margin, y);
    y += 12;
    pdfBodyFont(doc);
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED_RGB);
    y = writeWrappedText(doc, data.notes.trim(), margin, y, contentWidth, 12);
    y += 8;
  }

  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 48, pageWidth - margin, pageHeight - 48);
  pdfBodyFont(doc);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_RGB);
  doc.text("Thank you for your business.", margin, pageHeight - 30);
  pdfDisplayFont(doc, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK_RGB);
  doc.text(data.studio.companyName, pageWidth - margin, pageHeight - 30, { align: "right" });

  return doc.output("blob");
}

export async function downloadBookingInvoicePdf(data: BookingInvoiceData): Promise<void> {
  const blob = await generateBookingInvoicePdf(data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safePdfFilename(data.invoiceNumber);
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildInvoiceMailtoUrl(data: BookingInvoiceData): string | null {
  const to = data.client.email?.trim();
  if (!to) return null;

  const subject = `Invoice ${data.invoiceNumber} — ${data.booking.title}`;
  const body = [
    `Hi ${data.client.name},`,
    "",
    `Please find your invoice for ${data.booking.title} (${formatInvoiceDate(data.booking.date)}).`,
    "",
    `Invoice: ${data.invoiceNumber}`,
    `Amount due: ${formatMoney(data.total, data.currency)}`,
    `Due date: ${formatInvoiceDate(data.dueOn)}`,
    "",
    "The PDF invoice has been downloaded — please attach it to this email before sending.",
    "",
    `Thank you,`,
    data.studio.companyName,
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

export async function shareBookingInvoicePdf(
  data: BookingInvoiceData,
): Promise<"shared" | "downloaded" | "mailto"> {
  const blob = await generateBookingInvoicePdf(data);
  const file = new File([blob], safePdfFilename(data.invoiceNumber), { type: "application/pdf" });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: `Invoice ${data.invoiceNumber}`,
      text: `Invoice for ${data.booking.title}`,
    });
    return "shared";
  }

  const mailto = buildInvoiceMailtoUrl(data);
  await downloadBookingInvoicePdf(data);
  if (mailto) {
    window.location.href = mailto;
    return "mailto";
  }
  return "downloaded";
}
