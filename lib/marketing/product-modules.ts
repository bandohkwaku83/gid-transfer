export type ProductModuleIcon =
  | "layers"
  | "heart"
  | "calendar-days"
  | "palette"
  | "lock"
  | "shopping-bag"
  | "mail"
  | "video";

export const productModules = [
  {
    name: "Client Galleries",
    tagline: "Every delivery, a brand moment",
    icon: "layers",
    items: [
      "Custom layouts — grid, masonry, bento & more",
      "Mobile-perfect lightbox on any device",
      "Favourites, sharing & passcode access",
      "Your logo, fonts & colours on every page",
    ],
  },
  {
    name: "Selection & Proofing",
    tagline: "Approvals in one sitting",
    icon: "heart",
    items: [
      "Guided selection wizard with limits",
      "Per-image comments & timestamps",
      "Heart-rating with live dashboard progress",
      "Submit & lock selections with one click",
    ],
  },
  {
    name: "Studio CRM",
    tagline: "Book, contract, and get paid",
    icon: "calendar-days",
    items: [
      "Booking calendar + auto-confirmations",
      "Quotes, contracts & e-signatures",
      "Invoices, deposits & payment reminders",
      "Full client timeline in one view",
    ],
  },
  {
    name: "Brand & Portfolio",
    tagline: "A site that looks like you built it",
    icon: "palette",
    items: [
      "Custom domain — apex or subdomain",
      "Brand kit: logo, fonts, colour palette",
      "Portfolio & collection pages",
      "SEO-ready meta & social preview cards",
    ],
  },
  {
    name: "Smart Delivery",
    tagline: "Grandma-proof downloads",
    icon: "lock",
    items: [
      "Share-link galleries — no client signup",
      "Watermarked previews until purchase",
      "Pay-to-unlock high-res finals",
      "Download limits & expiring links",
    ],
  },
  {
    name: "Print Store",
    tagline: "Sell prints, keep every cent",
    icon: "shopping-bag",
    items: [
      "Lab-fulfilled prints, frames & albums",
      "0% commission — you set the markup",
      "Packages, upsells & crop preview",
      "Multi-currency checkout",
    ],
  },
  {
    name: "Marketing & Email",
    tagline: "Campaigns that run themselves",
    icon: "mail",
    items: [
      "Gallery-expiration & flash-sale reminders",
      "Abandoned-cart nudges for print orders",
      "Pre-written templates you can customise",
      "Seasonal campaigns to boost print revenue",
    ],
  },
  {
    name: "Video & Slideshows",
    tagline: "Motion alongside stills",
    icon: "video",
    items: [
      "HD video scenes in client galleries",
      "Cinematic slideshows for social & delivery",
      "Music-ready export for client sharing",
      "Same branded experience as your stills",
    ],
  },
] as const satisfies ReadonlyArray<{
  name: string;
  tagline: string;
  icon: ProductModuleIcon;
  items: readonly string[];
}>;
