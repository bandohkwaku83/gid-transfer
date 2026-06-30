import { authedFormUpload, authedJson, HttpError } from "@/lib/http";
import {
  FALLBACK_HELP_SUPPORT_SETTINGS,
  type HelpSupportFormConfig,
  type HelpSupportSettings,
} from "@/lib/support-contact";

export class ReportIssueApiError extends HttpError {}

export type { HelpSupportFormConfig, HelpSupportSettings };

export type ReportIssueTopic = HelpSupportFormConfig["topics"][number];

export type ReportIssueAttachment = {
  id?: string;
  name?: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
};

export type ReportIssueReport = {
  id: string;
  topic: string;
  topicLabel: string;
  description: string;
  attachments: ReportIssueAttachment[];
  attachmentCount: number;
  status: string;
  createdAt: string;
};

export type SubmitReportIssueResponse = {
  message: string;
  report: ReportIssueReport;
};

function normalizeTopic(raw: unknown): ReportIssueTopic | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  const label = typeof o.label === "string" ? o.label.trim() : "";
  if (!id || !label) return null;
  return { id, label };
}

function normalizeAttachments(raw: unknown): HelpSupportFormConfig["attachments"] {
  const fallback = FALLBACK_HELP_SUPPORT_SETTINGS.reportIssue.attachments;
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const acceptedTypes = Array.isArray(o.acceptedTypes)
    ? o.acceptedTypes
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
    : fallback.acceptedTypes;

  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : fallback.enabled,
    maxCount:
      typeof o.maxCount === "number" && Number.isFinite(o.maxCount) && o.maxCount > 0
        ? Math.floor(o.maxCount)
        : fallback.maxCount,
    maxSizeBytes:
      typeof o.maxSizeBytes === "number" && Number.isFinite(o.maxSizeBytes) && o.maxSizeBytes > 0
        ? Math.floor(o.maxSizeBytes)
        : fallback.maxSizeBytes,
    acceptedTypes: acceptedTypes.length > 0 ? acceptedTypes : fallback.acceptedTypes,
    hint:
      typeof o.hint === "string" && o.hint.trim()
        ? o.hint.trim()
        : fallback.hint,
  };
}

function normalizeFormConfig(raw: unknown, fallback: HelpSupportFormConfig): HelpSupportFormConfig {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const topicsRaw = Array.isArray(obj.topics) ? obj.topics : [];
  const topics = topicsRaw
    .map(normalizeTopic)
    .filter((topic): topic is ReportIssueTopic => topic !== null);

  return {
    title:
      typeof obj.title === "string" && obj.title.trim()
        ? obj.title.trim()
        : fallback.title,
    subtitle:
      typeof obj.subtitle === "string" && obj.subtitle.trim()
        ? obj.subtitle.trim()
        : fallback.subtitle,
    topics: topics.length > 0 ? topics : fallback.topics,
    descriptionPlaceholder:
      typeof obj.descriptionPlaceholder === "string" && obj.descriptionPlaceholder.trim()
        ? obj.descriptionPlaceholder.trim()
        : fallback.descriptionPlaceholder,
    attachments: normalizeAttachments(obj.attachments),
  };
}

function normalizeHelpSupportSettings(raw: unknown): HelpSupportSettings {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const helpSupport = normalizeFormConfig(
    obj.helpSupport,
    FALLBACK_HELP_SUPPORT_SETTINGS.helpSupport,
  );
  const reportIssue = normalizeFormConfig(
    obj.reportIssue ?? obj.helpSupport,
    FALLBACK_HELP_SUPPORT_SETTINGS.reportIssue,
  );
  return { helpSupport, reportIssue };
}

export async function getHelpSupportSettings(): Promise<HelpSupportSettings> {
  try {
    const body = await authedJson<Record<string, unknown>>(
      "/api/settings/report-issue",
      { method: "GET" },
      "Failed to load help settings",
      ReportIssueApiError,
    );
    return normalizeHelpSupportSettings(body);
  } catch {
    return FALLBACK_HELP_SUPPORT_SETTINGS;
  }
}

export async function submitReportIssue(input: {
  topic: string;
  description: string;
  attachments?: File[];
}): Promise<SubmitReportIssueResponse> {
  const description = input.description.trim();
  const attachments = input.attachments ?? [];

  if (attachments.length > 0) {
    const form = new FormData();
    form.append("topic", input.topic);
    form.append("description", description);
    for (const file of attachments) {
      form.append("attachments", file);
    }
    return authedFormUpload<SubmitReportIssueResponse>(
      "/api/settings/report-issue",
      form,
      {
        method: "POST",
        fallbackError: "Failed to submit report",
        ErrorCtor: ReportIssueApiError,
      },
    );
  }

  return authedJson<SubmitReportIssueResponse>(
    "/api/settings/report-issue",
    {
      method: "POST",
      body: JSON.stringify({
        topic: input.topic,
        description,
      }),
    },
    "Failed to submit report",
    ReportIssueApiError,
  );
}
