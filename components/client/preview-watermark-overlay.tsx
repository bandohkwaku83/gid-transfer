"use client";

import { useId } from "react";

export function ClientPreviewWatermarkOverlay({ text }: { text: string }) {
  const patternId = useId().replace(/:/g, "");
  const label = text.trim() || "Preview";

  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden>
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="presentation">
        <defs>
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width="200"
            height="112"
            patternTransform="rotate(-24)"
          >
            <text
              x="8"
              y="64"
              fill="white"
              fillOpacity="0.38"
              fontSize="15"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
              letterSpacing="0.08em"
            >
              {label}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
