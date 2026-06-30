"use client";

import { useEffect } from "react";

/** CSS `font-family` stack for gallery title/body fonts from design settings. */
export function galleryFontStack(
  name: string | undefined,
  fallback: string,
): string | undefined {
  if (!name?.trim()) return undefined;
  return `"${name.trim()}", ${fallback}`;
}

function googleFontsHref(families: string[]): string | null {
  const unique = [...new Set(families.map((f) => f.trim()).filter(Boolean))];
  if (unique.length === 0) return null;
  const query = unique
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

/** Load selected gallery fonts from Google Fonts (client gallery + customize preview). */
export function useGalleryGoogleFonts(titleFont?: string, bodyFont?: string): void {
  useEffect(() => {
    const href = googleFontsHref([titleFont ?? "", bodyFont ?? ""]);
    if (!href || typeof document === "undefined") return;

    const id = "gallery-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }, [titleFont, bodyFont]);
}
