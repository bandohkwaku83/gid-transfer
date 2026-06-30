"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  coverBackdropStyle,
  coverColorUsesLightText,
  coverColorWithAlpha,
  coverGradientDiagonal,
  coverGradientToTop,
  normalizeGalleryCoverColor,
  resolveGalleryCoverButtonColor,
  resolveGalleryCoverTextColor,
} from "@/lib/gallery-cover-color";
import {
  galleryCoverFrameLabel,
  isFramedGalleryCoverFrame,
  type GalleryCoverFrame,
} from "@/lib/gallery-cover-frame";
import { galleryFontStack } from "@/lib/gallery-typography";
import { studioLogoSrc as resolveStudioLogoSrc } from "@/lib/branding";
import { cn } from "@/lib/utils";

const SHARE_COVER_IMAGE_QUALITY = 100;

function heroViewportClass(preview?: boolean, variant: "full" | "overlay" = "full"): string {
  if (preview) {
    return variant === "overlay" ? "min-h-[460px]" : "min-h-[540px]";
  }
  return variant === "overlay"
    ? "min-h-[85svh] min-h-[85dvh]"
    : "min-h-[100svh] min-h-[100dvh]";
}

function cinematicBarClass(preview?: boolean): string {
  return preview ? "h-8 shrink-0" : "h-[8vh] min-h-8 shrink-0";
}

type GalleryCoverHeroProps = {
  coverImageUrl: string;
  coverFrame: GalleryCoverFrame;
  /** Compact fixed-height layout for the dashboard design-tab preview. */
  preview?: boolean;
  /** Backdrop for styles that use a solid hero color instead of black. */
  coverColor?: string;
  objectPosition: { objectPosition: string };
  displayTitle: string;
  selectionLocked?: boolean;
  onCoverClick: () => void;
  /** Studio logo shown at the top of full-bleed covers. */
  studioLogoSrc?: string;
  titleFont?: string;
  bodyFont?: string;
  /** Explicit hero title color (hex). Omitted = auto contrast from backdrop. */
  coverTextColor?: string;
  /** Explicit “View gallery” button color (hex). Omitted = auto contrast from backdrop. */
  coverButtonColor?: string;
};

type GalleryCoverHeroRenderProps = GalleryCoverHeroProps & {
  titleFamily?: string;
  bodyFamily?: string;
  textColor: string;
  buttonColor: string;
};

function resolveCoverTheme(coverColor?: string) {
  const color = normalizeGalleryCoverColor(coverColor);
  const lightText = coverColorUsesLightText(color);
  return { color, lightText };
}

function CoverImage({
  src,
  alt,
  className,
  style,
  sizes,
  priority = true,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes: string;
  priority?: boolean;
}) {
  if (!src.trim()) {
    return (
      <div
        className={cn("absolute inset-0 bg-zinc-800", className)}
        style={style}
        aria-hidden={!alt.trim()}
      />
    );
  }
  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      quality={SHARE_COVER_IMAGE_QUALITY}
      unoptimized
      className={className}
      style={style}
    />
  );
}

function SelectionLockedBanner({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "max-w-md rounded border border-amber-400/35 bg-amber-500/15 px-4 py-2 text-xs text-amber-50",
        className,
      )}
    >
      Selections are temporarily locked by your photographer.
    </p>
  );
}

function ViewGalleryCta({
  className,
  buttonClassName,
  variant = "bordered",
  fontFamily,
  accentColor,
}: {
  className?: string;
  buttonClassName?: string;
  variant?: "bordered" | "minimal";
  fontFamily?: string;
  accentColor?: string;
}) {
  return (
    <a
      href="#client-gallery-body"
      className={cn(
        variant === "minimal"
          ? "inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide transition"
          : "inline-flex items-center gap-2.5 border px-8 py-3 text-[11px] font-medium uppercase tracking-[0.22em] transition sm:px-10 sm:py-3.5 sm:text-xs",
        buttonClassName,
        className,
      )}
      style={{
        ...(fontFamily ? { fontFamily } : {}),
        ...(accentColor ? { color: accentColor, borderColor: accentColor } : {}),
      }}
    >
      {variant === "minimal" ? (
        <span className="h-2 w-2 rotate-45 border-b border-r border-current" aria-hidden />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" aria-hidden />
      )}
      View Gallery
    </a>
  );
}

function HeroTitle({
  children,
  className,
  fontFamily,
  textColor,
}: {
  children: React.ReactNode;
  className?: string;
  fontFamily?: string;
  textColor?: string;
}) {
  return (
    <h1
      className={cn(
        "max-w-3xl text-balance text-2xl font-light uppercase tracking-[0.18em] sm:text-3xl md:text-4xl lg:text-[2.75rem]",
        className,
      )}
      style={{
        ...(fontFamily ? { fontFamily } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
      {children}
    </h1>
  );
}

function FullBleedHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  studioLogoSrc,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  const logoSrc = resolveStudioLogoSrc(studioLogoSrc);
  return (
    <section
      className={cn("relative isolate flex w-full flex-col", heroViewportClass(preview))}
      aria-label="Gallery cover"
    >
      <CoverImage
        src={coverImageUrl}
        alt={displayTitle ? `Cover — ${displayTitle}` : "Gallery cover"}
        className="absolute inset-0 object-cover"
        style={objectPosition}
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/55"
        aria-hidden
      />
      <button
        type="button"
        onClick={onCoverClick}
        className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent p-0"
        aria-label="View cover image full screen"
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 z-10 flex justify-center px-4",
          preview ? "top-4" : "top-6 sm:top-8",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          className={cn(
            "w-auto max-w-[140px] object-contain brightness-0 invert opacity-85 drop-shadow-[0_1px_5px_rgba(0,0,0,0.35)]",
            preview ? "h-6" : "h-7 sm:h-9",
          )}
        />
      </div>
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-[1920px] flex-1 flex-col items-center justify-end px-4 text-center sm:px-5",
          preview ? "pb-10 pt-16" : "pb-14 pt-24 sm:pb-20 sm:pt-28",
        )}
      >
        <div className="flex w-full max-w-3xl flex-col items-center gap-5 sm:gap-6">
          <h1
            className="text-balance font-serif text-3xl font-medium uppercase leading-tight tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-5xl"
            style={{
              ...(titleFamily ? { fontFamily: titleFamily } : {}),
              color: textColor,
            }}
          >
            {displayTitle}
          </h1>
          {selectionLocked ? (
            <p className="rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
              Selections are temporarily locked by your photographer.
            </p>
          ) : null}
          <ViewGalleryCta
            variant="minimal"
            fontFamily={bodyFamily}
            accentColor={buttonColor}
            buttonClassName="drop-shadow-[0_1px_5px_rgba(0,0,0,0.45)] hover:opacity-90"
          />
        </div>
      </div>
    </section>
  );
}

function CinematicHero(props: GalleryCoverHeroRenderProps) {
  const {
    coverImageUrl,
    coverColor,
    objectPosition,
    displayTitle,
    selectionLocked,
    onCoverClick,
    titleFamily,
    bodyFamily,
    textColor,
    buttonColor,
    preview,
  } = props;
  const { color, lightText } = resolveCoverTheme(coverColor);
  const barStyle = coverBackdropStyle(color);
  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col",
        heroViewportClass(preview),
        lightText ? "text-white" : "text-zinc-950",
      )}
      style={barStyle}
      aria-label={galleryCoverFrameLabel("cinematic")}
    >
      <div className="relative z-10 flex flex-1 flex-col">
        <div className={cinematicBarClass(preview)} style={barStyle} aria-hidden />
        <div
          className={cn(
            "relative mx-auto aspect-[21/9] w-full max-w-6xl flex-1",
            preview ? "px-3" : "px-4 sm:px-8",
          )}
        >
          <CoverImage
            src={coverImageUrl}
            alt={displayTitle ? `Cover — ${displayTitle}` : "Gallery cover"}
            className="object-cover"
            style={objectPosition}
            sizes="(max-width: 1280px) 100vw, 1152px"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />
          <button
            type="button"
            onClick={onCoverClick}
            className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
            aria-label="View cover image full screen"
          />
        </div>
        <div className={cinematicBarClass(preview)} style={barStyle} aria-hidden />
      </div>
      <div
        className={cn(
          "relative z-10 shrink-0 px-6 pt-2 text-center",
          preview ? "pb-8 sm:pb-10 sm:pt-3" : "pb-12 sm:pb-16 sm:pt-4",
        )}
      >
        <HeroTitle className="mx-auto" fontFamily={titleFamily} textColor={textColor}>
          {displayTitle}
        </HeroTitle>
        {selectionLocked ? <SelectionLockedBanner className="mx-auto mt-6" /> : null}
        <ViewGalleryCta
          className="mt-7 sm:mt-8"
          fontFamily={bodyFamily}
          accentColor={buttonColor}
          buttonClassName="hover:opacity-85"
        />
      </div>
    </section>
  );
}

function CollageHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  coverColor,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  const tiles = [
    { className: "left-[4%] top-[10%] z-20 h-[42%] w-[38%] -rotate-6", pos: "30% 40%" },
    { className: "right-[6%] top-[8%] z-30 h-[48%] w-[40%] rotate-5", pos: "70% 25%" },
    { className: "bottom-[12%] left-[18%] z-10 h-[38%] w-[44%] rotate-2", pos: "50% 75%" },
    { className: "bottom-[18%] right-[10%] z-0 h-[32%] w-[30%] -rotate-3 opacity-80", pos: "80% 60%" },
  ];
  const { color, lightText } = resolveCoverTheme(coverColor);
  return (
    <section
      className={cn(
        "relative isolate flex flex-col overflow-hidden",
        heroViewportClass(preview),
        preview ? "px-4 py-6 sm:py-8" : "px-4 py-10 sm:px-8 sm:py-12",
        lightText ? "text-white" : "text-zinc-950",
      )}
      style={coverBackdropStyle(color)}
      aria-label={galleryCoverFrameLabel("collage")}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: coverGradientDiagonal(color) }}
      />
      <div className="relative z-10 shrink-0 px-2 pt-2 text-center sm:pt-4">
        <HeroTitle className="mx-auto" fontFamily={titleFamily} textColor={textColor}>
          {displayTitle}
        </HeroTitle>
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 items-center justify-center py-6 sm:py-8">
        <div className="relative aspect-[4/3] w-full">
        {tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            onClick={onCoverClick}
            className={cn(
              "absolute overflow-hidden rounded-2xl border border-white/20 bg-zinc-800 shadow-2xl shadow-black/50 transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              tile.className,
            )}
            aria-label={i === 0 ? "View cover image full screen" : undefined}
          >
            <CoverImage
              src={coverImageUrl}
              alt=""
              className="object-cover"
              style={{ objectPosition: tile.pos }}
              sizes="(max-width: 1024px) 45vw, 320px"
              priority={i === 0}
            />
          </button>
        ))}
        </div>
      </div>
      <div
        className={cn(
          "relative z-10 mt-auto flex shrink-0 flex-col items-center gap-6",
          preview ? "pb-8 sm:pb-10" : "pb-10 sm:pb-14",
        )}
      >
        {selectionLocked ? <SelectionLockedBanner /> : null}
        <ViewGalleryCta fontFamily={bodyFamily} accentColor={buttonColor} buttonClassName="hover:opacity-85" />
      </div>
    </section>
  );
}

function MinimalHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  return (
    <section
      className={cn(
        "relative isolate flex flex-col bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white",
        heroViewportClass(preview),
        preview ? "px-6 py-8" : "px-6 py-12 sm:py-16",
      )}
      aria-label={galleryCoverFrameLabel("minimal")}
    >
      <div className="shrink-0 pt-2 text-center sm:pt-4">
        <HeroTitle className="mx-auto" fontFamily={titleFamily} textColor={textColor}>
          {displayTitle}
        </HeroTitle>
      </div>
      <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
        <button
          type="button"
          onClick={onCoverClick}
          className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-sm shadow-lg shadow-zinc-900/10 transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 dark:shadow-black/40"
          aria-label="View cover image full screen"
        >
          <CoverImage
            src={coverImageUrl}
            alt={displayTitle ? `Cover — ${displayTitle}` : "Gallery cover"}
            className="object-cover"
            style={objectPosition}
            sizes="(max-width: 768px) 90vw, 448px"
          />
        </button>
      </div>
      <div className="mt-auto flex shrink-0 flex-col items-center gap-6 pb-8 sm:pb-12">
        {selectionLocked ? <SelectionLockedBanner className="dark:text-amber-100" /> : null}
        <ViewGalleryCta fontFamily={bodyFamily} accentColor={buttonColor} buttonClassName="hover:opacity-85" />
      </div>
    </section>
  );
}

function BentoHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  coverColor,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  const cells = [
    { className: "col-span-2 row-span-2", pos: objectPosition.objectPosition },
    { className: "", pos: "75% 30%" },
    { className: "", pos: "20% 80%" },
    { className: "col-span-2", pos: "60% 55%" },
  ];
  const { color, lightText } = resolveCoverTheme(coverColor);
  return (
    <section
      className={cn(
        "relative isolate flex flex-col",
        heroViewportClass(preview),
        preview ? "px-4 py-6 sm:py-8" : "px-4 py-10 sm:px-8 sm:py-12",
        lightText ? "text-white" : "text-zinc-950",
      )}
      style={coverBackdropStyle(color)}
      aria-label={galleryCoverFrameLabel("bento")}
    >
      <div className="relative z-10 shrink-0 px-2 pt-2 text-center sm:pt-4">
        <HeroTitle className="mx-auto" fontFamily={titleFamily} textColor={textColor}>
          {displayTitle}
        </HeroTitle>
      </div>
      <div className="relative z-10 mx-auto mt-6 flex w-full max-w-5xl flex-1 items-center sm:mt-8">
        <div
          className={cn(
            "grid w-full grid-cols-3 gap-2 sm:gap-3",
            preview
              ? "auto-rows-[minmax(56px,1fr)]"
              : "auto-rows-[minmax(72px,1fr)] sm:auto-rows-[minmax(96px,1fr)]",
          )}
        >
        {cells.map((cell, i) => (
          <button
            key={i}
            type="button"
            onClick={onCoverClick}
            className={cn(
              "relative min-h-[72px] overflow-hidden rounded-xl border border-white/10 bg-zinc-800/80 transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
              cell.className,
            )}
            aria-label={i === 0 ? "View cover image full screen" : undefined}
          >
            <CoverImage
              src={coverImageUrl}
              alt=""
              className="object-cover"
              style={{ objectPosition: cell.pos }}
              sizes={i === 0 ? "(max-width: 1024px) 66vw, 480px" : "(max-width: 1024px) 33vw, 200px"}
              priority={i === 0}
            />
          </button>
        ))}
        </div>
      </div>
      <div
        className={cn(
          "relative z-10 mx-auto mt-auto flex shrink-0 flex-col items-center gap-6",
          preview ? "pb-8 sm:pb-10" : "pb-10 sm:pb-14",
        )}
      >
        {selectionLocked ? <SelectionLockedBanner /> : null}
        <ViewGalleryCta fontFamily={bodyFamily} accentColor={buttonColor} buttonClassName="hover:opacity-85" />
      </div>
    </section>
  );
}

function OverlayHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  coverColor,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col justify-end overflow-hidden",
        heroViewportClass(preview, "overlay"),
      )}
      aria-label={galleryCoverFrameLabel("overlay")}
    >
      <CoverImage
        src={coverImageUrl}
        alt={displayTitle ? `Cover — ${displayTitle}` : "Gallery cover"}
        className="absolute inset-0 object-cover"
        style={objectPosition}
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: coverGradientToTop(resolveCoverTheme(coverColor).color) }}
        aria-hidden
      />
      <button
        type="button"
        onClick={onCoverClick}
        className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
        aria-label="View cover image full screen"
      />
      <div
        className={cn(
          "relative z-10 max-w-3xl px-6 sm:px-10 lg:px-12",
          preview ? "pb-10 pt-16" : "pb-14 pt-24 sm:pb-16",
        )}
      >
        <HeroTitle fontFamily={titleFamily} textColor={textColor}>
          {displayTitle}
        </HeroTitle>
        {selectionLocked ? <SelectionLockedBanner className="mt-6" /> : null}
        <ViewGalleryCta
          className="mt-7 sm:mt-8"
          fontFamily={bodyFamily}
          accentColor={buttonColor}
          buttonClassName="hover:opacity-85"
        />
      </div>
    </section>
  );
}

function ParallaxHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  coverColor,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  const bgStyle = useMemo(
    () => ({
      backgroundImage: `url(${coverImageUrl})`,
      backgroundPosition: objectPosition.objectPosition.replace(" ", " "),
      backgroundSize: "cover",
      backgroundAttachment: "fixed" as const,
    }),
    [coverImageUrl, objectPosition.objectPosition],
  );
  const overlayColor = coverColorWithAlpha(resolveCoverTheme(coverColor).color, 0.5);
  return (
    <section
      className={cn("relative isolate flex w-full flex-col", heroViewportClass(preview))}
      aria-label={galleryCoverFrameLabel("parallax")}
    >
      {preview ? (
        <>
          <CoverImage
            src={coverImageUrl}
            alt=""
            className="absolute inset-0 object-cover"
            style={objectPosition}
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: overlayColor }}
            aria-hidden
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 scale-105" style={bgStyle} aria-hidden />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: overlayColor }}
            aria-hidden
          />
        </>
      )}
      <button
        type="button"
        onClick={onCoverClick}
        className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
        aria-label="View cover image full screen"
      />
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center",
          preview ? "py-12" : "py-16 sm:py-20",
        )}
      >
        <div className="flex max-w-3xl flex-col items-center gap-7 sm:gap-8">
          <HeroTitle fontFamily={titleFamily} textColor={textColor}>
            {displayTitle}
          </HeroTitle>
          {selectionLocked ? <SelectionLockedBanner /> : null}
          <ViewGalleryCta fontFamily={bodyFamily} accentColor={buttonColor} buttonClassName="hover:opacity-85" />
        </div>
      </div>
    </section>
  );
}

function HeroCarouselHero({
  coverImageUrl,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  coverColor,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  const slides = useMemo(
    () => [
      { pos: objectPosition.objectPosition },
      { pos: "72% 38%" },
      { pos: "28% 62%" },
    ],
    [objectPosition.objectPosition],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (preview) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [preview, slides.length]);

  const { color, lightText } = resolveCoverTheme(coverColor);
  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col overflow-hidden",
        heroViewportClass(preview),
        lightText ? "text-white" : "text-zinc-950",
      )}
      style={coverBackdropStyle(color)}
      aria-label={galleryCoverFrameLabel("hero-carousel")}
      aria-roledescription="carousel"
    >
      <div className="relative flex-1">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== active}
          >
            <CoverImage
              src={coverImageUrl}
              alt={i === active && displayTitle ? `Cover — ${displayTitle}` : ""}
              className="object-cover"
              style={{ objectPosition: slide.pos }}
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: coverColorWithAlpha(color, 0.4) }}
        />
        <button
          type="button"
          onClick={onCoverClick}
          className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
          aria-label="View cover image full screen"
        />
      </div>
      <div
        className={cn(
          "relative z-10 shrink-0 px-6 pt-5 text-center",
          preview ? "pb-8 sm:pb-10 sm:pt-4" : "pb-12 sm:pb-14 sm:pt-6",
        )}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 sm:gap-6">
          <HeroTitle className="mx-auto" fontFamily={titleFamily} textColor={textColor}>
            {displayTitle}
          </HeroTitle>
          <div className="flex justify-center gap-2" role="tablist" aria-label="Cover slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-full transition",
                  preview ? "h-1.5 w-1.5" : "h-2 w-2",
                  lightText
                    ? i === active
                      ? "bg-white"
                      : "bg-white/35 hover:bg-white/55"
                    : i === active
                      ? "bg-zinc-900"
                      : "bg-zinc-900/30 hover:bg-zinc-900/50",
                )}
              />
            ))}
          </div>
          {selectionLocked ? <SelectionLockedBanner /> : null}
          <ViewGalleryCta fontFamily={bodyFamily} accentColor={buttonColor} buttonClassName="hover:opacity-85" />
        </div>
      </div>
    </section>
  );
}

function FramedHero({
  coverImageUrl,
  coverColor,
  coverFrame,
  objectPosition,
  displayTitle,
  selectionLocked,
  onCoverClick,
  titleFamily,
  bodyFamily,
  textColor,
  buttonColor,
  preview,
}: GalleryCoverHeroRenderProps) {
  const isCard = coverFrame === "editorial-card" || coverFrame === "card-based";
  const isFilm = coverFrame === "film-border";
  const isSplit = coverFrame === "split-feature";
  const { color, lightText } = resolveCoverTheme(coverColor);
  const onLightBackdrop = isCard && !lightText;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        heroViewportClass(preview),
        lightText && !onLightBackdrop ? "text-white" : "text-zinc-950 dark:text-white",
        onLightBackdrop && "text-zinc-950",
      )}
      style={coverBackdropStyle(color)}
      aria-label={galleryCoverFrameLabel(coverFrame)}
    >
      <CoverImage
        src={coverImageUrl}
        alt=""
        className={cn(
          "absolute inset-0 object-cover opacity-20 blur-2xl scale-105",
          isCard && "opacity-30 dark:opacity-20",
        )}
        style={objectPosition}
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isCard
            ? `linear-gradient(to bottom right, ${coverColorWithAlpha(color, onLightBackdrop ? 0.35 : 0.9)}, ${coverColorWithAlpha(color, onLightBackdrop ? 0.2 : 0.55)}, ${coverColorWithAlpha(color, onLightBackdrop ? 0.45 : 0.88)})`
            : coverGradientDiagonal(color),
        }}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-6xl flex-col",
          preview ? "min-h-[540px] px-4 py-6 sm:px-6" : "min-h-[100svh] min-h-[100dvh] px-4 py-8 sm:px-8 lg:px-12",
          isSplit
            ? preview
              ? "justify-center gap-6 md:grid md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-8"
              : "justify-center gap-8 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-10"
            : "items-center gap-7 text-center sm:gap-8",
        )}
      >
        {isSplit ? (
          <>
            <div
              className="order-1 flex max-w-3xl flex-col lg:rounded-2xl lg:p-8 lg:text-left"
              style={coverBackdropStyle(color)}
            >
              <HeroTitle className="lg:text-left" fontFamily={titleFamily} textColor={textColor}>
                {displayTitle}
              </HeroTitle>
              {selectionLocked ? (
                <SelectionLockedBanner className="mt-6 lg:mx-0" />
              ) : null}
              <ViewGalleryCta
                className="mt-7 sm:mt-8 lg:justify-start"
                fontFamily={bodyFamily}
                accentColor={buttonColor}
                buttonClassName="hover:opacity-85"
              />
            </div>

            <button
              type="button"
              onClick={onCoverClick}
              className="relative order-2 block aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 text-left shadow-2xl shadow-black/40 transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:max-w-xl lg:justify-self-end"
              aria-label="View cover image full screen"
            >
              <CoverImage
                src={coverImageUrl}
                alt={displayTitle ? `Cover — ${displayTitle}` : "Gallery cover"}
                className="object-cover"
                style={objectPosition}
                sizes="(max-width: 1024px) 90vw, 48vw"
              />
            </button>
          </>
        ) : (
          <>
            <div className="order-1 shrink-0 pt-2 sm:pt-4">
              <HeroTitle className="mx-auto" fontFamily={titleFamily} textColor={textColor}>
                {displayTitle}
              </HeroTitle>
            </div>

            <button
              type="button"
              onClick={onCoverClick}
              className={cn(
                "relative order-2 block w-full overflow-hidden text-left shadow-2xl transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                isCard &&
                  "aspect-[16/10] max-w-4xl rounded-[2rem] border border-white/70 bg-white p-2 shadow-zinc-900/20 dark:border-white/15 dark:bg-white/10",
                isFilm &&
                  "aspect-[4/3] max-w-3xl rounded-sm border-[12px] border-white bg-white shadow-black/50 sm:border-[18px]",
              )}
              aria-label="View cover image full screen"
            >
              <CoverImage
                src={coverImageUrl}
                alt={displayTitle ? `Cover — ${displayTitle}` : "Gallery cover"}
                className={cn("object-cover", isCard && "rounded-[1.5rem]")}
                style={objectPosition}
                sizes="90vw"
              />
            </button>

            <div className="order-3 mt-auto flex shrink-0 flex-col items-center gap-6 pb-4 sm:pb-8">
              {selectionLocked ? (
                <SelectionLockedBanner className={cn(isCard && "dark:text-amber-100")} />
              ) : null}
              <ViewGalleryCta
                fontFamily={bodyFamily}
                accentColor={buttonColor}
                buttonClassName="hover:opacity-85"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function GalleryCoverHero(props: GalleryCoverHeroProps) {
  const backdrop = normalizeGalleryCoverColor(props.coverColor);
  const renderProps: GalleryCoverHeroRenderProps = {
    ...props,
    titleFamily: galleryFontStack(props.titleFont, "serif"),
    bodyFamily: galleryFontStack(props.bodyFont, "sans-serif"),
    textColor: resolveGalleryCoverTextColor(backdrop, props.coverTextColor),
    buttonColor: resolveGalleryCoverButtonColor(backdrop, props.coverButtonColor),
  };
  switch (renderProps.coverFrame) {
    case "cinematic":
      return <CinematicHero {...renderProps} />;
    case "collage":
      return <CollageHero {...renderProps} />;
    case "minimal":
      return <MinimalHero {...renderProps} />;
    case "bento":
      return <BentoHero {...renderProps} />;
    case "overlay":
      return <OverlayHero {...renderProps} />;
    case "parallax":
      return <ParallaxHero {...renderProps} />;
    case "hero-carousel":
      return <HeroCarouselHero {...renderProps} />;
    case "full-bleed":
      return <FullBleedHero {...renderProps} />;
    default:
      if (isFramedGalleryCoverFrame(renderProps.coverFrame)) {
        return <FramedHero {...renderProps} />;
      }
      return <FullBleedHero {...renderProps} />;
  }
}
