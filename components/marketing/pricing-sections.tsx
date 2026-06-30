"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
} from "lucide-react";
import {
  ShowcaseCoverPreview,
  ShowcasePhonePreview,
} from "@/components/marketing/showcase-cover-preview";
import { MarketingFaqSection } from "@/components/marketing/faq-section";
import { APP_NAME } from "@/lib/branding";
import { usePhotographerSignedIn } from "@/lib/marketing/use-photographer-signed-in";
import { cn } from "@/lib/utils";

export const pricingHeroImage = {
  src: "/images/gallery-covers/website_3-min.jpg",
  alt: "Editorial portrait gallery",
} as const;

export const PRICING_HERO_BACKDROP_ID = "pricing-hero-backdrop";

/** Full-bleed hero image from the top of the page — sits behind the marketing header. */
export function PricingHeroBackdrop() {
  return (
    <div
      id={PRICING_HERO_BACKDROP_ID}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[max(32rem,calc(5.5rem+min(46vh,420px)))] sm:h-[max(36rem,calc(5.5rem+min(50vh,460px)))]"
    >
      <Image
        src={pricingHeroImage.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}

const ctaGalleryMain = {
  src: "/images/gallery-covers/website_3-min.jpg",
  alt: "Editorial portrait gallery cover",
  title: "Sarah & James",
} as const;

const ctaGallerySecondary = {
  src: "/images/gallery-covers/IMG_5566.JPG",
  alt: "Studio portrait session",
  title: "Studio Portraits",
} as const;

const pricingPlans = [
  {
    name: "Starter",
    audience: "Solo photographers",
    monthlyPrice: 79,
    description: "25 GB storage for growing studios.",
    features: [
      "25 GB media storage",
      "Branded share links & watermarks",
      "Client favourites & selection",
      "Print store with 0% commission",
      "Email support",
    ],
    cta: "Start with Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    audience: "Full-time studios",
    monthlyPrice: 199,
    description: "100 GB storage for busy photographers.",
    features: [
      "Everything in Starter, plus:",
      "100 GB storage",
      "Unlimited galleries",
      "Custom domain & full brand kit",
      "Contracts, e-signatures & invoicing",
      "Selection wizard + per-image comments",
      "Priority support",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    audience: "Teams & volume",
    monthlyPrice: 499,
    description: "500 GB storage for high-volume studios.",
    features: [
      "Everything in Pro, plus:",
      "500 GB storage",
      "Team seats (coming soon)",
      "Booking calendar & studio analytics",
      "Lightroom sync + Zapier / webhooks",
      "API access for custom integrations",
      "White-glove onboarding",
    ],
    cta: "Choose Studio",
    highlighted: false,
  },
] as const;

const comparisonRows = [
  { label: "Storage", starter: "25 GB", pro: "100 GB", studio: "500 GB" },
  { label: "Active galleries", starter: "Included", pro: "Unlimited", studio: "Unlimited" },
  { label: "Custom domain", starter: false, pro: true, studio: true },
  { label: "Contracts & invoicing", starter: false, pro: true, studio: true },
  { label: "Team seats", starter: "1", pro: "1", studio: "Coming soon" },
  { label: "Print commission", starter: "0%", pro: "0%", studio: "0%" },
  { label: "Support", starter: "Email", pro: "Priority", studio: "White-glove" },
] as const;

type PricingPlan = (typeof pricingPlans)[number];

function PricingCard({
  plan,
  price,
  ctaHref,
}: {
  plan: PricingPlan;
  price: number;
  ctaHref: string;
}) {
  const isFeatured = plan.highlighted;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white transition duration-300",
        isFeatured
          ? "z-10 p-8 shadow-[0_20px_50px_-20px_rgba(85,0,31,0.28)] ring-1 ring-[#55001F]/15 lg:-translate-y-2 lg:p-9"
          : "border border-slate-200/90 p-7 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)] sm:p-8",
      )}
    >
      {isFeatured ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D5AE65]/80 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 z-10 h-24 w-24 overflow-hidden"
          >
            <span className="absolute right-[-34px] top-[22px] block w-[140px] rotate-45 bg-[#55001F] py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-[#D5AE65] shadow-[0_4px_12px_-2px_rgba(85,0,31,0.4)]">
              Most popular
            </span>
          </div>
        </>
      ) : null}

      <header>
        <h2 className="font-display text-[1.35rem] font-semibold tracking-tight text-slate-900">
          {plan.name}
        </h2>
      </header>

      <div className="mt-6">
        <div className="flex items-baseline">
          <span className="font-display text-[3.25rem] font-semibold leading-none tracking-tight text-slate-900">
            GHS {price}
          </span>
          <span className="ml-1.5 text-sm text-slate-500">/month</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Billed monthly via Paystack · Free plan includes 5 GB
        </p>
      </div>

      <div className="my-6 h-px bg-slate-100" aria-hidden />

      <ul className="flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => {
          const isGroupHeader = feature.endsWith(":");

          return (
            <li
              key={feature}
              className={cn(
                "flex items-start gap-2.5 text-sm leading-snug",
                isGroupHeader ? "font-medium text-slate-800" : "text-slate-600",
              )}
            >
              {!isGroupHeader ? (
                <Check
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    isFeatured ? "text-[#55001F]" : "text-teal-600",
                  )}
                  aria-hidden
                  strokeWidth={2.5}
                />
              ) : (
                <span className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <span>{feature}</span>
            </li>
          );
        })}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
          isFeatured
            ? "bg-[#55001F] text-white shadow-[0_8px_24px_-8px_rgba(85,0,31,0.45)] hover:bg-[#6a0027]"
            : "bg-slate-50 text-slate-900 ring-1 ring-slate-200/80 hover:bg-slate-100 hover:ring-slate-300",
        )}
      >
        {plan.cta}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </article>
  );
}

function ComparisonCell({
  value,
  featured = false,
}: {
  value: string | boolean;
  featured?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full",
          featured
            ? "bg-[#55001F]/10 text-[#55001F] ring-1 ring-[#55001F]/15"
            : "bg-teal-700/10 text-teal-700",
        )}
      >
        <Check className="h-4 w-4" aria-hidden strokeWidth={2.5} />
      </span>
    ) : (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Minus className="h-4 w-4" aria-hidden />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-sm font-medium",
        featured ? "font-semibold text-[#55001F]" : "text-slate-800",
      )}
    >
      {value}
    </span>
  );
}

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2 sm:px-4">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5f57]" />
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#febc2e]" />
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#28c840]" />
      <span className="mx-auto min-w-0 truncate px-2 text-[9px] font-medium tracking-wide text-slate-400 sm:text-[10px]">
        {url}
      </span>
    </div>
  );
}

/** Layered browser + phone gallery covers — one proportional canvas scales on every breakpoint. */
function PricingCtaVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl md:max-w-none">
      <div className="relative aspect-[5/4] w-full">
        {/* Main browser */}
        <div className="absolute inset-x-0 top-0 flex h-[78%] flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_32px_64px_-32px_rgba(15,23,42,0.22)] sm:rounded-xl">
          <BrowserChrome url="yourstudio.com/gallery/sarah-james" />
          <div className="relative min-h-0 flex-1 bg-slate-100">
            <ShowcaseCoverPreview
              {...ctaGalleryMain}
              coverFrame="editorial-card"
              coverColor="#f4f1ea"
            />
          </div>
        </div>

        {/* Gallery phone — bottom left */}
        <div
          className="absolute bottom-0 left-0 z-20 w-[28%] overflow-hidden rounded-[1.35rem] border-[3px] border-white bg-white shadow-[0_20px_44px_-16px_rgba(15,23,42,0.38)]"
          aria-hidden
        >
          <div className="relative aspect-[9/19] bg-slate-950">
            <ShowcasePhonePreview
              src={ctaGalleryMain.src}
              alt={ctaGalleryMain.alt}
              title={ctaGalleryMain.title}
              coverColor="#1e3a5f"
            />
          </div>
        </div>

        {/* Secondary browser — bottom right */}
        <div
          className="absolute bottom-[4%] right-0 z-10 w-[38%] overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_24px_48px_-20px_rgba(15,23,42,0.28)]"
          aria-hidden
        >
          <BrowserChrome url="yourstudio.com/gallery/portraits" />
          <div className="relative aspect-[4/3] bg-slate-100">
            <ShowcaseCoverPreview {...ctaGallerySecondary} coverFrame="minimal" />
          </div>
        </div>
      </div>
    </div>
  );
}

type PricingSectionsProps = {
  className?: string;
};

export function PricingSections({ className }: PricingSectionsProps) {
  const signedIn = usePhotographerSignedIn();
  const signUpHref = signedIn ? "/dashboard/settings?tab=billing" : "/login?screen=signup";

  return (
    <div className={className}>
      {/* Hero copy — image backdrop is rendered at page level behind the header */}
      <section className="relative">
        <div className="relative flex min-h-[min(46vh,420px)] flex-col items-center justify-center px-5 py-12 text-center sm:min-h-[min(50vh,460px)] sm:px-8 sm:py-16">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-medium tracking-tight text-white">
            Pricing
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
            Start free with 5 GB · Upgrade when you need more
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="relative -mt-6 pb-14 pt-2 sm:-mt-8 sm:pb-16">
        <div className="marketing-container">
          <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6 xl:gap-8">
            {pricingPlans.map((plan) => {
              const price = plan.monthlyPrice;
              const ctaHref = signUpHref;

              return (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  price={price}
                  ctaHref={ctaHref}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="relative py-16 sm:py-20">
        <div className="marketing-container">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">
              Compare plans
            </p>
            <h2 className="mt-4 max-w-lg font-display text-3xl font-normal leading-snug tracking-tight text-slate-900 sm:text-4xl">
              See what&apos;s included at a glance
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              Starter for solo shoots, Pro for full studios, Studio for teams at scale.
            </p>
            <div className="mt-5 h-px w-10 bg-slate-200" aria-hidden />
          </div>

          <div className="mt-6 sm:mt-8">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_28px_64px_-36px_rgba(15,23,42,0.22)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#fbf7ef]/80">
                    <th
                      scope="col"
                      className="sticky left-0 z-20 bg-[#fbf7ef]/95 px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 backdrop-blur-sm"
                    >
                      Feature
                    </th>
                    {(["Starter", "Pro", "Studio"] as const).map((name, i) => (
                      <th
                        key={name}
                        scope="col"
                        className={cn(
                          "px-4 py-5 text-center",
                          i === 1
                            ? "relative bg-[#55001F]/[0.06] text-[#55001F]"
                            : "text-slate-900",
                        )}
                      >
                        {i === 1 ? (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#D5AE65] to-transparent"
                          />
                        ) : null}
                        <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
                          {name}
                        </span>
                        {i === 1 ? (
                          <span className="mt-1.5 inline-flex rounded-full bg-[#55001F] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D5AE65]">
                            Popular
                          </span>
                        ) : (
                          <span className="mt-1.5 block text-[11px] font-medium text-slate-400">
                            {i === 0 ? "Solo" : "Teams"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, rowIndex) => (
                    <tr
                      key={row.label}
                      className={cn(
                        "group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80",
                        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                      )}
                    >
                      <td className="sticky left-0 z-10 bg-inherit px-6 py-4 text-sm font-medium text-slate-700 shadow-[4px_0_12px_-8px_rgba(15,23,42,0.12)] backdrop-blur-sm group-hover:bg-inherit">
                        {row.label}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ComparisonCell value={row.starter} />
                      </td>
                      <td className="bg-[#55001F]/[0.04] px-4 py-4 text-center group-hover:bg-[#55001F]/[0.06]">
                        <ComparisonCell value={row.pro} featured />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ComparisonCell value={row.studio} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFaqSection />

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#f5f6f7] py-16 sm:py-20 md:py-24">
        <div className="marketing-container">
          <div className="grid items-center gap-12 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-14 xl:gap-20">
            <div className="order-2 md:order-1">
              <h2 className="max-w-md font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:max-w-none md:text-[2.75rem] md:leading-[1.15]">
                Get started with {APP_NAME}
              </h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-500 sm:text-lg">
                Free forever. Upgrade when you need to.
              </p>
              <Link
                href={signUpHref}
                className="mt-8 inline-flex items-center justify-center rounded bg-[#55001F] px-8 py-3.5 text-sm font-semibold text-[#D5AE65] transition hover:bg-[#6a0027]"
              >
                Get started
              </Link>
            </div>

            <div className="order-1 md:order-2">
              <PricingCtaVisual />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
