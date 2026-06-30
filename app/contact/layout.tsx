import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Contact | ${APP_NAME}`,
  description:
    `Contact ${APP_NAME} — send a message about galleries, proofing, pricing, and getting started.`,
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
