export const FALLBACK_REPORT_ISSUE_TOPICS = [
  { id: "not_working", label: "Something isn't working" },
  { id: "billing", label: "Billing or plan" },
  { id: "feature_request", label: "Feature request" },
  { id: "account", label: "Account or login" },
  { id: "other", label: "Something else" },
] as const;

export type ReportIssueTopicId = (typeof FALLBACK_REPORT_ISSUE_TOPICS)[number]["id"];

export type HelpSupportAttachmentsConfig = {
  enabled: boolean;
  maxCount: number;
  maxSizeBytes: number;
  acceptedTypes: string[];
  hint: string;
};

export type HelpSupportFormConfig = {
  title: string;
  subtitle: string;
  topics: ReadonlyArray<{ id: string; label: string }>;
  descriptionPlaceholder: string;
  attachments: HelpSupportAttachmentsConfig;
};

export type HelpSupportSettings = {
  helpSupport: HelpSupportFormConfig;
  reportIssue: HelpSupportFormConfig;
};

const FALLBACK_ATTACHMENTS: HelpSupportAttachmentsConfig = {
  enabled: true,
  maxCount: 5,
  maxSizeBytes: 5_242_880,
  acceptedTypes: ["PNG", "JPG", "WebP", "GIF", "PDF"],
  hint: "Optional — attach up to 5 screenshots or files (5MB each).",
};

const FALLBACK_FORM: HelpSupportFormConfig = {
  title: "Report an issue",
  subtitle: "Tell us what happened. You can attach screenshots or files below.",
  topics: FALLBACK_REPORT_ISSUE_TOPICS,
  descriptionPlaceholder:
    "What were you trying to do? What did you expect? What happened instead?",
  attachments: FALLBACK_ATTACHMENTS,
};

export const FALLBACK_HELP_SUPPORT_SETTINGS: HelpSupportSettings = {
  helpSupport: FALLBACK_FORM,
  reportIssue: FALLBACK_FORM,
};

const ATTACHMENT_MIME_BY_LABEL: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

export function attachmentsAcceptAttribute(types: string[]): string {
  const values = types
    .map((type) => ATTACHMENT_MIME_BY_LABEL[type.trim().toLowerCase()] ?? type.trim())
    .filter(Boolean);
  return values.length > 0 ? values.join(",") : "image/*,application/pdf";
}

export function formatAttachmentSize(bytes: number): string {
  if (bytes >= 1_048_576) {
    const mb = bytes / 1_048_576;
    return Number.isInteger(mb) ? `${mb}MB` : `${mb.toFixed(1)}MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb}KB`;
}

export function fileMatchesAcceptedType(file: File, acceptedTypes: string[]): boolean {
  if (acceptedTypes.length === 0) return true;
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return acceptedTypes.some((raw) => {
    const type = raw.trim().toLowerCase();
    const mimeType = ATTACHMENT_MIME_BY_LABEL[type];
    if (mimeType && mime === mimeType) return true;
    if (name.endsWith(`.${type}`)) return true;
    return false;
  });
}
