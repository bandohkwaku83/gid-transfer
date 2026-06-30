export const SETTINGS_PREREQUISITE_FOCUS = {
  watermarkPreview: "watermark-preview",
  brandWatermark: "brand-watermark",
} as const;

export type SettingsPrerequisiteFocus =
  (typeof SETTINGS_PREREQUISITE_FOCUS)[keyof typeof SETTINGS_PREREQUISITE_FOCUS];

export function folderEditorReturnUrl(
  folderId: string,
  tab: "uploads" | "finals",
): string {
  return `/dashboard/folder/${folderId}?tab=${tab}`;
}

export function settingsPrerequisiteUrl(input: {
  tab: "gallery" | "watermark";
  returnTo: string;
  focus?: SettingsPrerequisiteFocus;
}): string {
  const params = new URLSearchParams({ tab: input.tab, returnTo: input.returnTo });
  if (input.focus) params.set("focus", input.focus);
  return `/dashboard/settings?${params.toString()}`;
}

export function isSafeDashboardReturnTo(path: string): boolean {
  return path.startsWith("/dashboard/") && !path.startsWith("//");
}
