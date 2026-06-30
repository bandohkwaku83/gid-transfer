"use client";

import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useDashboardUiTheme } from "@/components/dashboard-ui-theme";
import {
  buildIncomeKpiTrends,
  formatIncomeCompact,
  INCOME_STATUS_COLORS,
  type IncomeKpiTrend,
  type IncomeSummary,
  type MonthlyRevenueBar,
} from "@/lib/income-demo";
import type { IncomeStatusSlice } from "@/lib/income-api";
import { cn } from "@/lib/utils";

const KPI_ICONS = {
  Collected: CircleDollarSign,
  Pending: Clock3,
  Invoiced: FileText,
  "Paid bookings": CalendarDays,
} as const;

const TONE_STYLES: Record<
  IncomeKpiTrend["tone"],
  { icon: string; spark: string; delta: string }
> = {
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    spark: "#10b981",
    delta: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    spark: "#f59e0b",
    delta: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50",
  },
  brand: {
    icon: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-on-dark",
    spark: "#55001f",
    delta: "text-brand bg-brand-soft dark:text-brand-on-dark dark:bg-brand/15",
  },
  slate: {
    icon: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    spark: "#64748b",
    delta: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/80",
  },
};

function Sparkline({
  points,
  color,
  className,
}: {
  points: number[];
  color: string;
  className?: string;
}) {
  const width = 120;
  const height = 36;
  const max = Math.max(1, ...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);

  const coords = points.map((value, index) => {
    const x = (index / Math.max(1, points.length - 1)) * width;
    const y = height - 4 - ((value - min) / range) * (height - 8);
    return `${x},${y}`;
  });

  const linePath = coords.length > 0 ? `M ${coords.join(" L ")}` : "";
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${width},${height} L 0,${height} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("block h-9 w-full", className)}
      aria-hidden
    >
      {areaPath ? (
        <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
      ) : null}
      {linePath ? (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

function KpiCard({ kpi }: { kpi: IncomeKpiTrend }) {
  const Icon = KPI_ICONS[kpi.label as keyof typeof KPI_ICONS] ?? CircleDollarSign;
  const tone = TONE_STYLES[kpi.tone];
  const DeltaIcon = kpi.deltaPositive ? TrendingUp : TrendingDown;

  return (
    <article className="group relative overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50/80 p-4 transition hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {kpi.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {kpi.value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            tone.icon,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{kpi.hint}</p>
        {kpi.delta ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              tone.delta,
            )}
          >
            <DeltaIcon className="h-3 w-3" aria-hidden />
            {kpi.delta}
          </span>
        ) : null}
      </div>

      <div className="mt-3 -mx-4 -mb-4 opacity-80 transition group-hover:opacity-100">
        <Sparkline points={kpi.sparkline} color={tone.spark} />
      </div>
    </article>
  );
}

function RevenueBarChart({
  bars,
  currency,
}: {
  bars: MonthlyRevenueBar[];
  currency: string;
}) {
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  const chartH = 72;

  return (
    <div className="flex h-[96px] items-end justify-between gap-0.5 sm:gap-1">
      {bars.map((bar) => {
        const h = bar.value === 0 ? 4 : Math.max(8, (bar.value / max) * chartH);
        const formatted =
          bar.value > 0 ? formatIncomeCompact(bar.value, currency) : null;

        return (
          <div key={bar.dateKey} className="group flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className={cn(
                  "relative w-full max-w-[26px] rounded-t-md transition-all duration-300",
                  bar.value > 0
                    ? "bg-gradient-to-t from-brand/80 via-brand to-brand-hover group-hover:from-brand group-hover:to-brand-hover"
                    : "bg-zinc-100 dark:bg-zinc-800/70",
                )}
                style={{ height: h }}
                title={
                  bar.value > 0
                    ? `${bar.label}: ${formatted}`
                    : `${bar.label}: no revenue`
                }
              />
            </div>
            <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PaymentBreakdown({
  slices,
  totalValue,
}: {
  slices: { key: string; label: string; value: number; color: string }[];
  totalValue: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {totalValue}
        </p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">total</p>
      </div>

      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        role="img"
        aria-label="Payment status breakdown"
      >
        {slices.map((slice) => {
          const width = total > 0 ? (slice.value / total) * 100 : 0;
          if (width <= 0) return null;
          return (
            <div
              key={slice.key}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${width}%`, backgroundColor: slice.color }}
              title={`${slice.label}: ${formatIncomeCompact(slice.value)}`}
            />
          );
        })}
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {slices.map((slice) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <li key={slice.key} className="flex min-w-0 items-center gap-1.5 text-[11px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
                aria-hidden
              />
              <span className="truncate text-zinc-600 dark:text-zinc-400">{slice.label}</span>
              <span className="ml-auto shrink-0 font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatIncomeCompact(slice.value)}
              </span>
              <span className="w-7 shrink-0 text-right tabular-nums text-zinc-400">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type IncomeAnalyticsPanelProps = {
  summary: IncomeSummary;
  monthlyRevenue: MonthlyRevenueBar[];
  byStatus: IncomeStatusSlice[];
  loading?: boolean;
};

export function IncomeAnalyticsPanel({
  summary,
  monthlyRevenue,
  byStatus,
  loading = false,
}: IncomeAnalyticsPanelProps) {
  const { darkUi } = useDashboardUiTheme();

  const kpiTrends = useMemo(
    () => buildIncomeKpiTrends(summary, monthlyRevenue),
    [summary, monthlyRevenue],
  );

  const statusSlices = useMemo(
    () =>
      byStatus.map((slice) => {
        const colors = INCOME_STATUS_COLORS[slice.key] ?? INCOME_STATUS_COLORS.pending;
        return {
          key: slice.key,
          label: slice.label,
          value: slice.value,
          color: darkUi ? colors.darkColor : colors.color,
        };
      }),
    [byStatus, darkUi],
  );

  const totalStatusValue = statusSlices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <section
      className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-white to-brand-soft/35 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-brand/10"
      aria-label="Income analytics"
      aria-busy={loading}
    >
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
        {kpiTrends.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-3 border-t border-zinc-200/70 p-3 dark:border-zinc-800 sm:p-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Revenue trend</h3>
          <RevenueBarChart bars={monthlyRevenue} currency={summary.currency} />
        </div>

        <div className="lg:border-l lg:border-zinc-200/70 lg:pl-4 dark:lg:border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Payment status</h3>
          <div className="mt-2">
            <PaymentBreakdown
              slices={statusSlices}
              totalValue={formatIncomeCompact(totalStatusValue, summary.currency)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
