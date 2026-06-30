import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: `Privacy Policy for ${APP_NAME} — how we collect, use, and protect personal information for photographers and their clients.`,
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
