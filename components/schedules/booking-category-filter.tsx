"use client";

import { Filter } from "lucide-react";
import { FormSelect } from "@/components/ui/form-select";
import type { BookingShootTypeMeta } from "@/lib/bookings-api";
import { bookingDotClass, findShootTypeMeta } from "@/lib/booking-shoot-types";
import { cn } from "@/lib/utils";

type Props = {
  shootTypes: BookingShootTypeMeta[];
  value: string | "all";
  onChange: (next: string | "all") => void;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
};

/** Shoot-type filter as a searchable dropdown (for long meta lists). */
export function BookingCategoryFilter({
  shootTypes,
  value,
  onChange,
  className,
  disabled,
  showLabel = true,
}: Props) {
  const options = shootTypes.map((t) => ({ value: t.id, label: t.label }));

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showLabel ? (
        <div className="flex min-w-0 shrink-0 items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <Filter className="h-4 w-4 text-brand dark:text-brand-on-dark" aria-hidden />
          Filter by shoot type
        </div>
      ) : null}

      <FormSelect
        showSearch
        allowClear
        disabled={disabled || shootTypes.length === 0}
        placeholder="All shoot types"
        optionFilterProp="label"
        value={value === "all" ? undefined : value}
        onChange={(next) => onChange(next ?? "all")}
        options={options}
        className="w-full min-w-0 sm:max-w-xs"
        optionRender={(opt) => {
          const meta = findShootTypeMeta(shootTypes, String(opt.value ?? ""));
          return (
            <span className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 shrink-0 rounded-full", bookingDotClass(meta?.color))}
                aria-hidden
              />
              <span>{opt.label}</span>
            </span>
          );
        }}
      />
    </div>
  );
}
