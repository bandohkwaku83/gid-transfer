"use client";

import { ChevronDown } from "lucide-react";
import type { BookingShootTypeMeta } from "@/lib/bookings-api";
import { bookingDotClass } from "@/lib/booking-shoot-types";
import { cn } from "@/lib/utils";

type Props = {
  items: BookingShootTypeMeta[];
  className?: string;
};

/** Collapsible color legend so 60+ types do not dominate the calendar. */
export function BookingShootTypeLegend({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <details
      className={cn(
        "group mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
        <span>Color legend ({items.length} types)</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3 max-h-40 overflow-y-auto overscroll-contain pr-1">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
            >
              <span
                className={cn("h-2 w-2 shrink-0 rounded-full", bookingDotClass(t.color))}
                aria-hidden
              />
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
