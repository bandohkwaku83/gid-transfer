import type { BookingShootTypeMeta } from "@/lib/bookings-api";
import { apiColorToDotClass } from "@/lib/bookings-api";

export function bookingDotClass(color?: string): string {
  return apiColorToDotClass(color) ?? "bg-zinc-400";
}

export function findShootTypeMeta(
  shootTypes: BookingShootTypeMeta[],
  id: string,
): BookingShootTypeMeta | undefined {
  const needle = id.trim().toLowerCase();
  return shootTypes.find((t) => t.id.toLowerCase() === needle);
}

/** Resolve category id from API booking fields. */
export function resolveShootCategoryFromApi(
  input: {
    category?: string;
    shootType?: string;
  },
  shootTypes: BookingShootTypeMeta[],
): { category: string; label: string; color: string } {
  const fromId = input.category?.trim()
    ? findShootTypeMeta(shootTypes, input.category)
    : undefined;
  if (fromId) {
    return { category: fromId.id, label: fromId.label, color: fromId.color };
  }

  const label = input.shootType?.trim() ?? "";
  if (label) {
    const fromLabel = shootTypes.find(
      (t) => t.label.toLowerCase() === label.toLowerCase(),
    );
    if (fromLabel) {
      return { category: fromLabel.id, label: fromLabel.label, color: fromLabel.color };
    }
    const fromSlug = findShootTypeMeta(shootTypes, label);
    if (fromSlug) {
      return { category: fromSlug.id, label: fromSlug.label, color: fromSlug.color };
    }
  }

  const fallback = findShootTypeMeta(shootTypes, "other") ?? {
    id: "other",
    label: "Other",
    color: "sky",
  };
  return {
    category: fallback.id,
    label: label || fallback.label,
    color: fallback.color,
  };
}

export const FALLBACK_SHOOT_TYPES: BookingShootTypeMeta[] = [
  { id: "wedding", label: "Wedding", color: "teal" },
  { id: "portraits", label: "Portraits", color: "teal" },
  { id: "other", label: "Other", color: "cyan" },
];

export function defaultShootTypeId(shootTypes: BookingShootTypeMeta[]): string {
  return (
    findShootTypeMeta(shootTypes, "portraits")?.id ??
    findShootTypeMeta(shootTypes, "wedding")?.id ??
    shootTypes[0]?.id ??
    "other"
  );
}
