import type { PhotographerStudioProfile } from "@/lib/auth-demo";
import { BRAND_RGB } from "@/lib/branding";
import {
  formatPdfCurrency,
  pdfBodyFont,
  pdfDisplayFont,
  registerInvoicePdfFonts,
} from "@/lib/invoice-pdf-fonts";
import {
  incomeStatusLabel,
  type IncomeEntry,
  type IncomeStatus,
} from "@/lib/income-demo";
import {
  resolveStudioLogoDataUrl,
  studioFromProfile,
  type BookingInvoiceStudio,
} from "@/lib/booking-invoice";

export type IncomeReportPeriod = "monthly" | "quarterly" | "yearly";

export type IncomeReportSummary = {
  entryCount: number;
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  byStatus: Record<IncomeStatus, { count: number; billed: number; collected: number }>;
};

export type IncomeReportData = {
  period: IncomeReportPeriod;
  periodLabel: string;
  generatedOn: string;
  studio: BookingInvoiceStudio;
  currency: string;
  entries: IncomeEntry[];
  summary: IncomeReportSummary;
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

function formatReportDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function quarterLabel(d: Date): string {
  const quarter = Math.floor(d.getMonth() / 3) + 1;
  return `Q${quarter} ${d.getFullYear()}`;
}

function periodRange(
  period: IncomeReportPeriod,
  reference: Date,
  year?: number,
): { start: Date; end: Date; label: string } {
  if (period === "yearly") {
    const y = year ?? reference.getFullYear();
    return {
      start: new Date(y, 0, 1),
      end: new Date(y, 11, 31, 23, 59, 59, 999),
      label: String(y),
    };
  }

  if (period === "quarterly") {
    const q = Math.floor(reference.getMonth() / 3);
    return {
      start: new Date(reference.getFullYear(), q * 3, 1),
      end: new Date(reference.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999),
      label: quarterLabel(reference),
    };
  }

  return {
    start: new Date(reference.getFullYear(), reference.getMonth(), 1),
    end: new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999),
    label: monthLabel(reference),
  };
}

function entryInRange(entry: IncomeEntry, start: Date, end: Date): boolean {
  const d = new Date(entry.date);
  if (Number.isNaN(d.getTime())) return false;
  return d >= start && d <= end;
}

function emptyStatusSummary(): IncomeReportSummary["byStatus"] {
  return {
    paid: { count: 0, billed: 0, collected: 0 },
    pending: { count: 0, billed: 0, collected: 0 },
    partial: { count: 0, billed: 0, collected: 0 },
    invoiced: { count: 0, billed: 0, collected: 0 },
  };
}

export function computeIncomeReportSummary(entries: IncomeEntry[]): IncomeReportSummary {
  const byStatus = emptyStatusSummary();
  let totalBilled = 0;
  let totalCollected = 0;

  for (const entry of entries) {
    totalBilled += entry.totalAmount;
    totalCollected += entry.amountPaying;
    const bucket = byStatus[entry.status];
    bucket.count += 1;
    bucket.billed += entry.totalAmount;
    bucket.collected += entry.amountPaying;
  }

  return {
    entryCount: entries.length,
    totalBilled,
    totalCollected,
    outstanding: Math.max(0, totalBilled - totalCollected),
    byStatus,
  };
}

export function filterEntriesForIncomeReport(
  entries: IncomeEntry[],
  period: IncomeReportPeriod,
  reference = new Date(),
  year?: number,
): IncomeEntry[] {
  const { start, end } = periodRange(period, reference, year);
  return entries
    .filter((entry) => entryInRange(entry, start, end))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildIncomeReportData(
  entries: IncomeEntry[],
  period: IncomeReportPeriod,
  studioProfile?: PhotographerStudioProfile,
  accountEmail?: string,
  reference = new Date(),
  year?: number,
): IncomeReportData {
  const { label } = periodRange(period, reference, year);
  const filtered = filterEntriesForIncomeReport(entries, period, reference, year);
  const currency = filtered[0]?.currency ?? entries[0]?.currency ?? "GHS";

  return {
    period,
    periodLabel: label,
    generatedOn: isoTodayLocal(),
    studio: studioFromProfile(studioProfile, accountEmail),
    currency,
    entries: filtered,
    summary: computeIncomeReportSummary(filtered),
  };
}

function periodTitle(period: IncomeReportPeriod): string {
  switch (period) {
    case "monthly":
      return "Monthly income report";
    case "quarterly":
      return "Quarterly income report";
    case "yearly":
      return "Yearly income report";
  }
}

function formatMoney(amount: number, currency: string): string {
  return formatPdfCurrency(amount, currency);
}

function safeReportFilename(data: IncomeReportData): string {
  const slug = data.periodLabel.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `income-report-${data.period}-${slug || "period"}.pdf`;
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
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function imageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  const match = /^data:image\/(png|jpe?g|webp)/i.exec(dataUrl);
  if (!match) return "PNG";
  const type = match[1].toLowerCase();
  if (type === "jpg" || type === "jpeg") return "JPEG";
  if (type === "webp") return "WEBP";
  return "PNG";
}

function drawReportHeader(doc: JsPdfDoc, data: IncomeReportData, logoDataUrl: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;
  let studioTextX = margin;

  if (logoDataUrl) {
    try {
      const format = imageFormatFromDataUrl(logoDataUrl);
      doc.addImage(logoDataUrl, format, margin, y, 40, 40);
      studioTextX = margin + 52;
    } catch {
      // Continue without logo.
    }
  }

  pdfDisplayFont(doc, "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK_RGB);
  doc.text(data.studio.companyName, studioTextX, y + 14);

  pdfBodyFont(doc);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED_RGB);
  const studioContact = [data.studio.email, data.studio.phone, data.studio.website].filter(Boolean);
  studioContact.forEach((line, i) => {
    doc.text(String(line), studioTextX, y + 28 + i * 10);
  });

  pdfDisplayFont(doc, "normal");
  doc.setFontSize(24);
  doc.setTextColor(...INK_RGB);
  doc.text(periodTitle(data.period), pageWidth - margin, y + 14, { align: "right" });

  pdfBodyFont(doc);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_RGB);
  doc.text(data.periodLabel, pageWidth - margin, y + 30, { align: "right" });
  doc.text(`Generated ${formatReportDate(data.generatedOn)}`, pageWidth - margin, y + 42, {
    align: "right",
  });

  y += 58;
  doc.setDrawColor(...BRAND_RGB);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);

  return y + 22;
}

function drawSummaryCards(doc: JsPdfDoc, data: IncomeReportData, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const gap = 12;
  const cardW = (contentWidth - gap * 3) / 4;
  const cardH = 54;
  let y = startY;

  const cards = [
    { label: "Entries", value: String(data.summary.entryCount) },
    { label: "Total billed", value: formatMoney(data.summary.totalBilled, data.currency) },
    { label: "Collected", value: formatMoney(data.summary.totalCollected, data.currency) },
    { label: "Outstanding", value: formatMoney(data.summary.outstanding, data.currency) },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + gap);
    doc.setFillColor(...SOFT_RGB);
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardW, cardH, 4, 4, "FD");

    pdfBodyFont(doc, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_RGB);
    doc.text(card.label.toUpperCase(), x + 10, y + 16);

    pdfBodyFont(doc, "bold");
    doc.setFontSize(i === 0 ? 16 : 12);
    doc.setTextColor(...INK_RGB);
    doc.text(card.value, x + 10, y + 36);
  });

  y += cardH + 18;

  const statusItems = (["paid", "partial", "pending", "invoiced"] as IncomeStatus[]).map(
    (status) => {
      const bucket = data.summary.byStatus[status];
      return `${incomeStatusLabel(status)}: ${bucket.count} · ${formatMoney(bucket.collected, data.currency)}`;
    },
  );

  pdfBodyFont(doc);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED_RGB);
  doc.text(statusItems.join("   ·   "), margin, y);

  return y + 20;
}

function drawTableHeader(doc: JsPdfDoc, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...SOFT_RGB);
  doc.rect(margin, y, contentWidth, 20, "F");
  pdfBodyFont(doc, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED_RGB);

  const cols = [
    { label: "Date", x: margin + 6 },
    { label: "Client", x: margin + 78 },
    { label: "Title", x: margin + 178 },
    { label: "Type", x: margin + 338 },
    { label: "Total", x: pageWidth - margin - 148, align: "right" as const },
    { label: "Paid", x: pageWidth - margin - 78, align: "right" as const },
    { label: "Status", x: pageWidth - margin - 6, align: "right" as const },
  ];

  cols.forEach((col) => {
    doc.text(col.label, col.x, y + 13, col.align ? { align: col.align } : undefined);
  });

  return y + 28;
}

function drawTableRow(doc: JsPdfDoc, entry: IncomeEntry, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const rowTop = y;

  pdfBodyFont(doc);
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_RGB);
  doc.text(formatEntryDate(entry.date), margin + 6, rowTop);

  pdfBodyFont(doc, "bold");
  doc.setFontSize(8.5);
  const clientEndY = writeWrappedText(doc, entry.clientName, margin + 78, rowTop, 92, 10);

  pdfBodyFont(doc);
  const titleEndY = writeWrappedText(doc, entry.title, margin + 178, rowTop, 150, 10);
  doc.text(entry.shootType, margin + 338, rowTop);

  doc.text(formatMoney(entry.totalAmount, entry.currency), pageWidth - margin - 148, rowTop, {
    align: "right",
  });
  pdfBodyFont(doc, "bold");
  doc.text(formatMoney(entry.amountPaying, entry.currency), pageWidth - margin - 78, rowTop, {
    align: "right",
  });
  pdfBodyFont(doc);
  doc.text(incomeStatusLabel(entry.status), pageWidth - margin - 6, rowTop, { align: "right" });

  const rowEndY = Math.max(clientEndY, titleEndY, rowTop + 12);
  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.5);
  doc.line(margin, rowEndY + 4, pageWidth - margin, rowEndY + 4);

  return rowEndY + 12;
}

export async function generateIncomeReportPdf(data: IncomeReportData): Promise<Blob> {
  const jsPDF = await loadJsPdf();
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  await registerInvoicePdfFonts(doc);

  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const logoDataUrl = await resolveStudioLogoDataUrl(data.studio);

  let y = drawReportHeader(doc, data, logoDataUrl);
  y = drawSummaryCards(doc, data, y);
  y = drawTableHeader(doc, y);

  if (data.entries.length === 0) {
    pdfBodyFont(doc);
    doc.setFontSize(10);
    doc.setTextColor(...MUTED_RGB);
    doc.text("No income entries in this period.", margin, y + 4);
  } else {
    for (const entry of data.entries) {
      if (y > pageHeight - margin - 24) {
        doc.addPage();
        y = drawTableHeader(doc, margin);
      }
      y = drawTableRow(doc, entry, y);
    }
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 36, pageWidth - margin, pageHeight - 36);
    pdfBodyFont(doc);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_RGB);
    doc.text(`${data.studio.companyName} · Income report`, margin, pageHeight - 20);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 20, {
      align: "right",
    });
  }

  return doc.output("blob");
}

export async function downloadIncomeReportPdf(data: IncomeReportData): Promise<void> {
  const blob = await generateIncomeReportPdf(data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeReportFilename(data);
  anchor.click();
  URL.revokeObjectURL(url);
}

export function incomeReportMenuLabel(period: IncomeReportPeriod): string {
  switch (period) {
    case "monthly":
      return "Monthly report";
    case "quarterly":
      return "Quarterly report";
    case "yearly":
      return "Yearly report";
  }
}
