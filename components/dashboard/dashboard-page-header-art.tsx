import { cn } from "@/lib/utils";
import { DashboardStackedCardsArt } from "@/components/dashboard/dashboard-stacked-cards-art";

export function DashboardPageHeaderArt({ className }: { className?: string }) {
  return <DashboardStackedCardsArt className={cn("dashboard-page-header-art", className)} />;
}
