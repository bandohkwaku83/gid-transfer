"use client";

import type { LucideIcon } from "lucide-react";

export type DashboardStatItem = {
  label: string;
  value: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
};

/** @deprecated Stats are rendered inside DashboardWelcomePanel hero. Kept for type export. */
export function DashboardStatStrip(_props: {
  items: DashboardStatItem[];
  loading?: boolean;
}) {
  return null;
}
