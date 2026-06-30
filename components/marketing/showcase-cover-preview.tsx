"use client";

import Image from "next/image";
import {
  coverBackdropStyle,
  coverColorUsesLightText,
  coverColorWithAlpha,
  coverGradientDiagonal,
  coverGradientToTop,
  normalizeGalleryCoverColor,
} from "@/lib/gallery-cover-color";
import type { GalleryCoverFrame } from "@/lib/gallery-cover-frame";
import { cn } from "@/lib/utils";

export type ShowcaseCoverPreviewProps = {
  src: string;
  alt: string;
  coverFrame: GalleryCoverFrame;
  coverColor?: string;
  title: string;
  priority?: boolean;
};

function CoverImg({
  src,
  alt,
  className,
  style,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      draggable={false}
      sizes="320px"
      priority={priority}
      className={cn("pointer-events-none object-cover", className)}
      style={style}
    />
  );
}

function MiniTitle({
  children,
  lightText,
  className,
}: {
  children: React.ReactNode;
  lightText?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "relative z-20 line-clamp-2 text-[9px] font-medium uppercase tracking-[0.14em] sm:text-[10px]",
        lightText ? "text-white/90" : "text-zinc-900",
        className,
      )}
    >
      {children}
    </p>
  );
}

function MiniViewGallery({
  lightText,
  className,
}: {
  lightText?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative z-20 inline-flex border px-2 py-0.5 text-[7px] font-medium uppercase tracking-[0.16em] sm:text-[8px]",
        lightText
          ? "border-white/80 text-white/90"
          : "border-zinc-900/70 text-zinc-900/80",
        className,
      )}
    >
      View gallery
    </span>
  );
}

const SHOWCASE_LOGO_SRC = "/svgs/main_logo.svg";

function ShowcaseLogo({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <Image
      src={SHOWCASE_LOGO_SRC}
      alt=""
      width={341}
      height={90}
      aria-hidden
      draggable={false}
      className={cn(
        "h-[11px] w-auto object-contain sm:h-3",
        dark ? "brightness-0" : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]",
        className,
      )}
    />
  );
}

function resolveShowcaseLogoDark(props: ShowcaseCoverPreviewProps): boolean {
  if (props.coverFrame === "minimal") return true;
  if (!props.coverColor) return false;
  return !coverColorUsesLightText(normalizeGalleryCoverColor(props.coverColor));
}

function showcaseLogoTopClass(coverFrame: GalleryCoverFrame): string {
  switch (coverFrame) {
    case "cinematic":
      return "top-[3%]";
    case "collage":
      return "top-[3%]";
    case "hero-carousel":
    case "overlay":
    case "parallax":
    case "full-bleed":
      return "top-2.5";
    default:
      return "top-2";
  }
}

function FullBleedPreview({ src, alt, title, priority }: ShowcaseCoverPreviewProps) {
  return (
    <div className="relative h-full w-full">
      <CoverImg src={src} alt={alt} priority={priority} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/55" />
      <div className="absolute inset-0 flex flex-col px-3 pb-4 pt-2">
        <div className="mt-auto flex flex-col items-center gap-1.5 text-center">
          <MiniTitle lightText className="text-center text-[9px] sm:text-[10px]">
            {title}
          </MiniTitle>
          <MiniViewGallery lightText />
        </div>
      </div>
    </div>
  );
}

function CinematicPreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  const barStyle = coverBackdropStyle(color);
  return (
    <div className="relative flex h-full w-full flex-col" style={barStyle}>
      <div className="h-[10%] shrink-0" style={barStyle} />
      <div className="relative min-h-0 flex-1">
        <CoverImg src={src} alt={alt} priority={priority} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
      </div>
      <div className="flex h-[18%] shrink-0 flex-col items-center justify-center gap-1 px-2" style={barStyle}>
        <MiniTitle lightText={lightText} className="text-center">
          {title}
        </MiniTitle>
        <MiniViewGallery lightText={lightText} />
      </div>
    </div>
  );
}

function CollagePreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  const tiles = [
    { className: "left-[6%] top-[18%] z-20 h-[34%] w-[38%] -rotate-6", pos: "30% 40%" },
    { className: "right-[5%] top-[14%] z-30 h-[38%] w-[40%] rotate-5", pos: "70% 25%" },
    { className: "bottom-[16%] left-[14%] z-10 h-[30%] w-[44%] rotate-2", pos: "50% 75%" },
  ];
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={coverBackdropStyle(color)}>
      <div className="absolute inset-0" style={{ background: coverGradientDiagonal(color) }} />
      <div className="relative z-40 shrink-0 px-3 pt-2 text-center">
        <MiniTitle lightText={lightText}>{title}</MiniTitle>
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={cn(
              "absolute overflow-hidden rounded-md border border-white/25 shadow-lg shadow-black/40",
              tile.className,
            )}
          >
            <CoverImg src={src} alt="" style={{ objectPosition: tile.pos }} priority={priority && i === 0} />
          </div>
        ))}
      </div>
      <div className="relative z-40 shrink-0 px-3 pb-2.5 text-center">
        <MiniViewGallery lightText={lightText} />
      </div>
    </div>
  );
}

function MinimalPreview({ src, alt, title, priority }: ShowcaseCoverPreviewProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-white px-3 py-4">
      <MiniTitle className="mb-1.5 text-center">{title}</MiniTitle>
      <div className="relative aspect-[3/4] w-[58%] overflow-hidden rounded-sm shadow-md shadow-zinc-900/15">
        <CoverImg src={src} alt={alt} priority={priority} />
      </div>
      <MiniViewGallery className="mt-1.5" />
    </div>
  );
}

function BentoPreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  const cells = [
    { className: "col-span-2 row-span-2", pos: "50% 35%" },
    { className: "", pos: "75% 30%" },
    { className: "", pos: "20% 80%" },
  ];
  return (
    <div className="relative flex h-full w-full flex-col p-2.5" style={coverBackdropStyle(color)}>
      <div className="mb-1.5 shrink-0 text-center">
        <MiniTitle lightText={lightText}>{title}</MiniTitle>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-1">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "relative min-h-0 overflow-hidden rounded-md border border-white/10",
              cell.className,
            )}
          >
            <CoverImg src={src} alt="" style={{ objectPosition: cell.pos }} priority={priority && i === 0} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 shrink-0 text-center">
        <MiniViewGallery lightText={lightText} />
      </div>
    </div>
  );
}

function OverlayPreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  return (
    <div className="relative h-full w-full">
      <CoverImg src={src} alt={alt} priority={priority} />
      <div className="absolute inset-0" style={{ background: coverGradientToTop(color) }} />
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 px-3 pb-3 pt-8">
        <MiniTitle lightText className="text-[9px] sm:text-[10px]">
          {title}
        </MiniTitle>
        <MiniViewGallery lightText />
      </div>
    </div>
  );
}

function CardPreview({
  src,
  alt,
  title,
  coverColor,
  rounded = "rounded-xl",
  priority,
}: ShowcaseCoverPreviewProps & { rounded?: string }) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  const onLightBackdrop = !lightText;
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={coverBackdropStyle(color)}>
      <CoverImg src={src} alt="" className="scale-105 opacity-25 blur-sm" priority={priority} />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${coverColorWithAlpha(color, onLightBackdrop ? 0.35 : 0.88)}, ${coverColorWithAlpha(color, onLightBackdrop ? 0.2 : 0.55)})`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col items-center px-3 py-3">
        <MiniTitle lightText={!onLightBackdrop} className="shrink-0 text-center">
          {title}
        </MiniTitle>
        <div className="flex flex-1 items-center justify-center py-1.5">
          <div className={cn("relative aspect-[4/3] w-[78%] overflow-hidden border border-white/60 shadow-lg", rounded)}>
            <CoverImg src={src} alt={alt} priority={priority} />
          </div>
        </div>
        <MiniViewGallery lightText={!onLightBackdrop} className="shrink-0" />
      </div>
    </div>
  );
}

function ParallaxPreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <CoverImg src={src} alt={alt} className="scale-110" priority={priority} />
      <div className="absolute inset-0" style={{ backgroundColor: coverColorWithAlpha(color, 0.48) }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3">
        <MiniTitle lightText className="text-center">{title}</MiniTitle>
        <MiniViewGallery lightText />
      </div>
    </div>
  );
}

function HeroCarouselPreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  return (
    <div className="relative flex h-full w-full flex-col" style={coverBackdropStyle(color)}>
      <div className="relative min-h-0 flex-1">
        <CoverImg src={src} alt={alt} priority={priority} />
        <div className="absolute inset-0" style={{ backgroundColor: coverColorWithAlpha(color, 0.35) }} />
      </div>
      <div className="shrink-0 px-3 py-2 text-center">
        <MiniTitle lightText={lightText}>{title}</MiniTitle>
        <MiniViewGallery lightText={lightText} className="mt-1" />
      </div>
    </div>
  );
}

function FilmBorderPreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  return (
    <div className="relative flex h-full w-full flex-col items-center p-3" style={coverBackdropStyle(color)}>
      <MiniTitle lightText={lightText} className="mb-1.5 shrink-0 text-center">
        {title}
      </MiniTitle>
      <div className="flex flex-1 items-center justify-center">
        <div className="relative aspect-[4/5] w-[72%] overflow-hidden rounded-sm border-[5px] border-white bg-white shadow-lg shadow-black/30">
          <CoverImg src={src} alt={alt} priority={priority} />
        </div>
      </div>
      <MiniViewGallery lightText={lightText} className="mt-1.5 shrink-0" />
    </div>
  );
}

function SplitFeaturePreview({ src, alt, title, coverColor, priority }: ShowcaseCoverPreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  return (
    <div className="relative grid h-full w-full grid-cols-2 gap-1 p-1.5" style={coverBackdropStyle(color)}>
      <div className="flex flex-col justify-center gap-1 px-1.5">
        <MiniTitle lightText={lightText} className="leading-tight">
          {title}
        </MiniTitle>
        <MiniViewGallery lightText={lightText} />
      </div>
      <div className="relative overflow-hidden rounded-lg border border-white/15">
        <CoverImg src={src} alt={alt} priority={priority} />
      </div>
    </div>
  );
}

export function ShowcaseCoverPreview(props: ShowcaseCoverPreviewProps) {
  let preview: React.ReactNode;
  switch (props.coverFrame) {
    case "cinematic":
      preview = <CinematicPreview {...props} />;
      break;
    case "collage":
      preview = <CollagePreview {...props} />;
      break;
    case "minimal":
      preview = <MinimalPreview {...props} />;
      break;
    case "bento":
      preview = <BentoPreview {...props} />;
      break;
    case "overlay":
      preview = <OverlayPreview {...props} />;
      break;
    case "card-based":
      preview = <CardPreview {...props} rounded="rounded-xl" />;
      break;
    case "editorial-card":
      preview = <CardPreview {...props} rounded="rounded-2xl" />;
      break;
    case "parallax":
      preview = <ParallaxPreview {...props} />;
      break;
    case "hero-carousel":
      preview = <HeroCarouselPreview {...props} />;
      break;
    case "film-border":
      preview = <FilmBorderPreview {...props} />;
      break;
    case "split-feature":
      preview = <SplitFeaturePreview {...props} />;
      break;
    case "full-bleed":
    default:
      preview = <FullBleedPreview {...props} />;
      break;
  }

  return (
    <div className="relative h-full w-full">
      {preview}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 z-30 flex justify-center px-2",
          showcaseLogoTopClass(props.coverFrame),
        )}
      >
        <ShowcaseLogo dark={resolveShowcaseLogoDark(props)} />
      </div>
    </div>
  );
}

export type ShowcasePhonePreviewProps = {
  src: string;
  alt: string;
  title: string;
  coverColor?: string;
  priority?: boolean;
};

/** Compact overlay-style gallery hero tuned for narrow phone mockups in marketing. */
export function ShowcasePhonePreview({
  src,
  alt,
  title,
  coverColor = "#1e3a5f",
  priority,
}: ShowcasePhonePreviewProps) {
  const color = normalizeGalleryCoverColor(coverColor);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <Image
        src={src}
        alt={alt}
        fill
        draggable={false}
        sizes="(max-width: 640px) 180px, 160px"
        priority={priority}
        className="pointer-events-none object-cover object-[center_18%]"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[46%]"
        style={{ background: coverGradientToTop(color, 0.96, 0.58) }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-2.5 pb-1 pt-2">
        <span className="text-[8px] font-semibold tabular-nums text-white/85">9:41</span>
        <ShowcaseLogo dark className="h-3 w-auto" />
        <span className="text-[8px] font-semibold text-white/85" aria-hidden>
          ●●●
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-3.5 z-20 flex flex-col items-center gap-1.5 px-2.5 text-center">
        <p className="line-clamp-2 text-[9px] font-medium uppercase leading-snug tracking-[0.14em] text-white/95 sm:text-[10px]">
          {title}
        </p>
        <span className="inline-flex border border-white/90 px-2.5 py-1 text-[7px] font-medium uppercase tracking-[0.16em] text-white sm:text-[8px]">
          View gallery
        </span>
      </div>
    </div>
  );
}
