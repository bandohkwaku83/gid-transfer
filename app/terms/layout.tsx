import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description: `Terms of Service for ${APP_NAME} — photographer workspace, client galleries, proofing, and studio tools.`,
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
