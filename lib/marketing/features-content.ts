export type FeatureSpotlight = {
  id: string;
  eyebrow: string;
  headline: string;
  description: string;
  bullets: readonly string[];
  moduleNames: readonly string[];
  visual:
    | {
        type: "gallery-cover";
        src: string;
        alt: string;
        title: string;
        coverFrame: "cinematic" | "minimal" | "editorial-card" | "overlay" | "collage" | "bento";
        coverColor?: string;
      }
    | {
        type: "phone";
        src: string;
        alt: string;
        title: string;
        coverColor?: string;
      }
    | {
        type: "photo";
        src: string;
        alt: string;
      };
};

export const featureSpotlights: readonly FeatureSpotlight[] = [
  {
    id: "galleries",
    eyebrow: "Client galleries",
    headline: "Every delivery feels like an exhibition",
    description:
      "Magazine layouts, cinematic covers, and a mobile lightbox your clients actually enjoy using — all on your domain, with your logo and colours.",
    bullets: [
      "Grid, masonry, bento & editorial layouts",
      "Full-bleed cover hero with your brand kit",
      "Favourites, sharing & passcode access",
      "Grandma-proof downloads — no client signup",
    ],
    moduleNames: ["Client Galleries", "Smart Delivery"],
    visual: {
      type: "gallery-cover",
      src: "/images/gallery-covers/WOED0075.JPG",
      alt: "Wedding ceremony gallery cover",
      title: "Sarah & James",
      coverFrame: "cinematic",
      coverColor: "#4c0519",
    },
  },
  {
    id: "proofing",
    eyebrow: "Selection & proofing",
    headline: "Approvals in one sitting, not ten emails",
    description:
      "Guided selection wizards, per-image comments, and a live dashboard so you always know where clients are in the process.",
    bullets: [
      "Selection limits & guided wizard flow",
      "Heart-rating with live progress tracking",
      "Per-image comments & timestamps",
      "Submit & lock selections with one click",
    ],
    moduleNames: ["Selection & Proofing"],
    visual: {
      type: "phone",
      src: "/images/gallery-covers/IMG_5261.JPG",
      alt: "Family portrait gallery on mobile",
      title: "The Mensah Family",
      coverColor: "#14532d",
    },
  },
  {
    id: "crm",
    eyebrow: "Studio CRM",
    headline: "Book, contract, and get paid — one dashboard",
    description:
      "Stop juggling Calendly, DocuSign, and QuickBooks. Bookings, contracts, invoices, and client timelines live in the same studio you deliver from.",
    bullets: [
      "Booking calendar with auto-confirmations",
      "Quotes, contracts & e-signatures",
      "Invoices, deposits & payment reminders",
      "Full client timeline in one view",
    ],
    moduleNames: ["Studio CRM"],
    visual: {
      type: "photo",
      src: "/images/appointment.png",
      alt: "Photographer scheduling a client session",
    },
  },
] as const;
