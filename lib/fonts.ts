import { Caveat, Fraunces, Questrial } from "next/font/google";

/** Body — UI labels, sub-headings, descriptions, and all body copy. */
export const questrial = Questrial({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-questrial",
  display: "swap",
});

/**
 * Display fallback until licensed Recoleta files are added under `public/fonts/`.
 * Fraunces is the closest open substitute for Recoleta Regular / Bold.
 */
export const recoletaFallback = Fraunces({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-recoleta-fallback",
  display: "swap",
});

/**
 * Script fallback until Photograph Signature is added under `public/fonts/`.
 */
export const scriptFallback = Caveat({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-script-fallback",
  display: "swap",
});

export const fontVariables = [
  questrial.variable,
  recoletaFallback.variable,
  scriptFallback.variable,
].join(" ");
