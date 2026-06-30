"use client";

import type { ReactNode } from "react";
import { SETTINGS_TABS, type SettingsTabId } from "@/lib/settings-tabs";

type SettingsShellProps = {
  activeTab: SettingsTabId;
  children: ReactNode;
};

export function SettingsShell({ activeTab, children }: SettingsShellProps) {
  const meta = SETTINGS_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-white px-5 py-4 dark:border-zinc-800 dark:from-zinc-900/60 dark:to-zinc-950 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {meta.label}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{meta.description}</p>
        </div>
        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
