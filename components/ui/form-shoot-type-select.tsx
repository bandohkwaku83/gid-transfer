"use client";

import { FormSelect } from "@/components/ui/form-select";
import type { BookingShootTypeMeta } from "@/lib/bookings-api";
import { bookingDotClass, findShootTypeMeta } from "@/lib/booking-shoot-types";
import { cn } from "@/lib/utils";

type FormShootTypeSelectProps = {
  shootTypes: BookingShootTypeMeta[];
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
  /** Colored dots beside labels (e.g. booking calendar legend). */
  showColorDots?: boolean;
};

/** Searchable shoot type picker driven by GET /api/bookings/meta. */
export function FormShootTypeSelect({
  shootTypes,
  value,
  onChange,
  disabled,
  id,
  className,
  placeholder = "Select shoot type",
  showColorDots = true,
}: FormShootTypeSelectProps) {
  const options = shootTypes.map((t) => ({
    value: t.id,
    label: t.label,
  }));

  return (
    <FormSelect
      id={id}
      appearance="onboarding"
      showSearch
      optionFilterProp="label"
      placeholder={placeholder}
      value={value || undefined}
      onChange={onChange}
      disabled={disabled}
      options={options}
      className={className}
      {...(showColorDots
        ? {
            optionRender: (opt) => {
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
            },
          }
        : {})}
    />
  );
}



// #55001F - RED
// #D5AE65 - YELLOW
// #FFFCF2 - CREAM
// #303030 - BLACK