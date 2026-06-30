import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Features | ${APP_NAME}`,
  description:
    "Client galleries, proofing, CRM, branding, delivery, and a commission-free print store — everything professional photographers need in one studio.",
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
