"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildGalleryClientPathPrefix,
  normalizeStudioSlugInput,
  type StudioHostOptions,
} from "@/lib/studio-url";
import { onboardingFieldMt, onboardingFormTextClassName } from "@/lib/onboarding-field-styles";
import { cn } from "@/lib/utils";

export type GalleryAddressFieldProps = {
  companySlug: string;
  gallerySlug: string;
  /** Slug segment only — parent maps to event name. */
  onGallerySlugChange: (slug: string) => void;
  studioHostOptions?: StudioHostOptions;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/** Gallery URL row: read-only address + underlined Edit on the right to change the slug. */
export function GalleryAddressField({
  companySlug,
  gallerySlug,
  onGallerySlugChange,
  studioHostOptions,
  disabled,
  id,
  className,
}: GalleryAddressFieldProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pathPrefix = useMemo(
    () => buildGalleryClientPathPrefix(companySlug, studioHostOptions),
    [companySlug, studioHostOptions],
  );

  const displaySlug = gallerySlug.trim() || "event-name";
  const slugChars = Math.max(displaySlug.length, 10);

  useEffect(() => {
    if (!editing) return;
    const t = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(t);
  }, [editing]);

  function startEditing() {
    if (disabled) return;
    setEditing(true);
  }

  function stopEditing() {
    setEditing(false);
  }

  return (
    <div
      className={cn(
        onboardingFieldMt,
        "flex min-h-10 w-full items-center justify-between gap-4",
        onboardingFormTextClassName,
        disabled && "opacity-60",
        className,
      )}
    >
      <p className="min-w-0 flex-1 truncate text-sm leading-normal">
        <span className="text-zinc-400 dark:text-zinc-500">{pathPrefix}</span>
        {editing ? (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={gallerySlug}
            onChange={(e) => onGallerySlugChange(normalizeStudioSlugInput(e.target.value))}
            onBlur={stopEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                stopEditing();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                stopEditing();
              }
            }}
            placeholder="event-name"
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            style={{ width: `${slugChars}ch` }}
            className={cn(
              "m-0 inline-block min-w-[10ch] max-w-full border-0 bg-transparent p-0",
              "font-sans text-sm leading-normal text-zinc-900 outline-none ring-0",
              "placeholder:text-zinc-400 focus:outline-none focus:ring-0",
              "dark:text-zinc-50",
            )}
            aria-label="Gallery URL slug"
          />
        ) : (
          <span className="text-zinc-900 dark:text-zinc-50">{displaySlug}</span>
        )}
      </p>

      {!disabled ? (
        <button
          type="button"
          onClick={() => (editing ? stopEditing() : startEditing())}
          className="shrink-0 font-sans text-sm leading-normal text-zinc-900 underline underline-offset-2 transition hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
        >
          {editing ? "Done" : "Edit"}
        </button>
      ) : null}
    </div>
  );
}
