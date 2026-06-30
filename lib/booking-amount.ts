/** Parse optional GHS amount from a form field; `null` means invalid. */
export function parseAmountChargedInput(raw: string): number | undefined | null {
  const t = raw.trim().replace(/,/g, "");
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function formatAmountChargedInput(amount?: number): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  return String(amount);
}
