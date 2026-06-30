"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function DashboardStackedCardsArt({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const photoA = `stacked-cards-photo-a-${uid}`;
  const photoB = `stacked-cards-photo-b-${uid}`;
  const shadow = `stacked-cards-shadow-${uid}`;

  return (
    <div className={cn(className)} aria-hidden>
      <svg
        viewBox="0 0 220 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={photoA} x1="24" y1="28" x2="108" y2="112">
            <stop stopColor="#ecd5dc" />
            <stop offset="0.45" stopColor="#c97892" />
            <stop offset="1" stopColor="#55001f" />
          </linearGradient>
          <linearGradient id={photoB} x1="88" y1="42" x2="168" y2="118">
            <stop stopColor="#f8eef1" />
            <stop offset="0.55" stopColor="#e899b0" />
            <stop offset="1" stopColor="#420018" />
          </linearGradient>
          <filter id={shadow} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#55001f" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter={`url(#${shadow})`} transform="rotate(-14 118 98)">
          <rect x="28" y="54" width="88" height="108" rx="6" fill="#fff" stroke="#55001f" strokeOpacity="0.12" />
          <rect x="36" y="62" width="72" height="72" rx="3" fill={`url(#${photoA})`} />
          <rect x="36" y="140" width="42" height="5" rx="2.5" fill="#55001f" fillOpacity="0.12" />
        </g>

        <g filter={`url(#${shadow})`} transform="rotate(6 132 92)">
          <rect x="72" y="36" width="88" height="108" rx="6" fill="#fff" stroke="#55001f" strokeOpacity="0.14" />
          <rect x="80" y="44" width="72" height="72" rx="3" fill={`url(#${photoB})`} />
          <rect x="80" y="122" width="36" height="5" rx="2.5" fill="#55001f" fillOpacity="0.1" />
        </g>

        <g filter={`url(#${shadow})`} transform="rotate(18 156 88)">
          <rect x="108" y="24" width="88" height="108" rx="6" fill="#fff" stroke="#55001f" strokeOpacity="0.16" />
          <rect x="116" y="32" width="72" height="72" rx="3" fill="#f8eef1" />
          <path
            d="M116 86c10-14 18-20 28-20s18 6 28 20"
            stroke="#55001f"
            strokeOpacity="0.18"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="152" cy="52" r="7" fill="#e899b0" fillOpacity="0.55" />
          <rect x="116" y="110" width="48" height="5" rx="2.5" fill="#55001f" fillOpacity="0.12" />
        </g>

        <circle cx="182" cy="34" r="18" stroke="#55001f" strokeOpacity="0.18" strokeWidth="2" />
        <circle cx="182" cy="34" r="10" stroke="#55001f" strokeOpacity="0.28" strokeWidth="1.5" />
        <circle cx="182" cy="34" r="4" fill="#55001f" fillOpacity="0.35" />
      </svg>
    </div>
  );
}
