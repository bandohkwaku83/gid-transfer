"use client";

import { GalleryCoverHero } from "@/components/client/gallery-cover-hero";
import type { GalleryCoverFrame } from "@/lib/gallery-cover-frame";

type GalleryCoverHeroPreviewProps = {
  coverSrc: string;
  hasCover: boolean;
  title: string;
  coverFrame: GalleryCoverFrame;
  coverColor?: string;
  focalX: number;
  focalY: number;
  titleFont?: string;
  bodyFont?: string;
  coverTextColor?: string;
  coverButtonColor?: string;
};

/** Dashboard design-tab preview — reuses the live client hero in compact mode. */
export function GalleryCoverHeroPreview({
  coverSrc,
  hasCover,
  title,
  coverFrame,
  coverColor,
  focalX,
  focalY,
  titleFont,
  bodyFont,
  coverTextColor,
  coverButtonColor,
}: GalleryCoverHeroPreviewProps) {
  return (
    <div className="pointer-events-none select-none">
      <GalleryCoverHero
        preview
        coverImageUrl={hasCover ? coverSrc : ""}
        coverFrame={coverFrame}
        coverColor={coverColor}
        coverTextColor={coverTextColor}
        coverButtonColor={coverButtonColor}
        objectPosition={{ objectPosition: `${focalX}% ${focalY}%` }}
        displayTitle={title}
        onCoverClick={() => {}}
        titleFont={titleFont}
        bodyFont={bodyFont}
      />
    </div>
  );
}
