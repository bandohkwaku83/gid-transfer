import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Pricing | ${APP_NAME}`,
  description:
    "Simple pricing for photographers. Start free, upgrade when your studio grows. No per-gallery fees, no commission on print sales.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
