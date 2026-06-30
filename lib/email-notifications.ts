export type EmailNotificationKey =
  | "enabled"
  | "bookingReminders"
  | "galleryComments"
  | "galleryFlags"
  | "gallerySelections";

export type EmailNotifications = Record<EmailNotificationKey, boolean>;

export const EMAIL_NOTIFICATION_KEYS: EmailNotificationKey[] = [
  "enabled",
  "bookingReminders",
  "galleryComments",
  "galleryFlags",
  "gallerySelections",
];

export const DEFAULT_EMAIL_NOTIFICATIONS: EmailNotifications = {
  enabled: true,
  bookingReminders: true,
  galleryComments: true,
  galleryFlags: true,
  gallerySelections: true,
};

function parseBool(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === true || value === "true" || value === "1" || value === 1) return true;
  if (value === false || value === "false" || value === "0" || value === 0) return false;
  return fallback;
}

export function normalizeEmailNotifications(raw?: Partial<EmailNotifications> | null): EmailNotifications {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    enabled: parseBool(source.enabled, DEFAULT_EMAIL_NOTIFICATIONS.enabled),
    bookingReminders: parseBool(
      source.bookingReminders,
      DEFAULT_EMAIL_NOTIFICATIONS.bookingReminders,
    ),
    galleryComments: parseBool(
      source.galleryComments,
      DEFAULT_EMAIL_NOTIFICATIONS.galleryComments,
    ),
    galleryFlags: parseBool(source.galleryFlags, DEFAULT_EMAIL_NOTIFICATIONS.galleryFlags),
    gallerySelections: parseBool(
      source.gallerySelections,
      DEFAULT_EMAIL_NOTIFICATIONS.gallerySelections,
    ),
  };
}

export type EmailNotificationToggleMeta = {
  key: EmailNotificationKey;
  label: string;
  hint: string;
  /** Hidden when master switch is off (except the master toggle itself). */
  requiresEnabled?: boolean;
};

export const EMAIL_NOTIFICATION_TOGGLES: EmailNotificationToggleMeta[] = [
  {
    key: "enabled",
    label: "Email notifications",
    hint: "Receive email updates about your studio activity.",
  },
  {
    key: "bookingReminders",
    label: "Booking reminders",
    hint: "Reminders before upcoming scheduled shoots.",
    requiresEnabled: true,
  },
  {
    key: "galleryComments",
    label: "Gallery comments",
    hint: "When a client leaves a comment on a photo.",
    requiresEnabled: true,
  },
  {
    key: "galleryFlags",
    label: "Final revision flags",
    hint: "When a client flags a final for revision.",
    requiresEnabled: true,
  },
  {
    key: "gallerySelections",
    label: "Selection submissions",
    hint: "When a client submits their gallery picks.",
    requiresEnabled: true,
  },
];
