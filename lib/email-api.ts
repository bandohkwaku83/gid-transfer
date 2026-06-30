import { authedJson, extractMessage, HttpError } from "@/lib/http";
import {
  normalizeEmailNotifications,
  type EmailNotifications,
} from "@/lib/email-notifications";
import type { SettingsPayload } from "@/lib/settings-api";
import { persistSettingsSession } from "@/lib/settings-api";

export type EmailConfigResponse = {
  configured: boolean;
  notifications: EmailNotifications;
};

export class EmailApiError extends HttpError {}

export function emailApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof EmailApiError) {
    if (err.status === 503) {
      return extractMessage(err.body, "Email is not configured on the server.");
    }
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export async function getEmailConfig(): Promise<EmailConfigResponse> {
  const body = await authedJson<EmailConfigResponse>(
    "/api/email/config",
    { method: "GET" },
    "Failed to load email settings",
    EmailApiError,
  );
  return {
    configured: body.configured === true,
    notifications: normalizeEmailNotifications(body.notifications),
  };
}

export async function updateEmailNotifications(
  notifications: Partial<EmailNotifications>,
): Promise<EmailConfigResponse> {
  const body = await authedJson<SettingsPayload & { message?: string }>(
    "/api/settings",
    {
      method: "PUT",
      body: JSON.stringify({ emailNotifications: notifications }),
    },
    "Failed to save notification settings",
    EmailApiError,
  );

  if (body.settings || body.user) {
    persistSettingsSession(body);
  }

  try {
    return await getEmailConfig();
  } catch {
    const emailPrefs =
      body.settings?.notifications?.email ??
      body.user?.emailNotifications ??
      notifications;
    return {
      configured: false,
      notifications: normalizeEmailNotifications(emailPrefs),
    };
  }
}
