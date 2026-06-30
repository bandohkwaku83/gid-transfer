import { authedJson, extractMessage, HttpError } from "@/lib/http";
import type { StudioSmsFields } from "@/lib/sms-sender";

export type SmsPlaceholder = {
  key: string;
  token: string;
  label: string;
};

export type SmsRecipientTypeOption = {
  id: string;
  label: string;
};

export type SmsMeta = {
  placeholders: SmsPlaceholder[];
  recipientTypes: SmsRecipientTypeOption[];
  configured: boolean;
};

export type SmsConfigResponse = {
  configured: boolean;
  defaultSender: string;
  studio: StudioSmsFields;
};

export type SmsMessageRow = {
  _id: string;
  recipientName: string;
  recipientPhone: string;
  recipientKind: string;
  message: string;
  messageLength: number;
  status: string;
  costGHS: number;
  errorMessage?: string;
  client?: string;
  folder?: string;
  recipientType?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ListSmsMessagesResponse = {
  messages: SmsMessageRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SendSmsInput = {
  recipientType: string;
  message: string;
  folderId?: string;
  clientId?: string;
};

export type SendSmsResponse = {
  message: string;
  summary: { sent: number; failed: number; skipped: number };
  results: Array<{ id: string; clientId: string; status: string }>;
  skipped: unknown[];
};

export type SendTestSmsInput = {
  phone: string;
  message?: string;
};

export type SendTestSmsResponse = {
  message?: string;
};

export class SmsApiError extends HttpError {}

async function delay(ms = 25) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function getSmsConfig(): Promise<SmsConfigResponse> {
  try {
    return await authedJson<SmsConfigResponse>(
      "/api/sms/config",
      { method: "GET" },
      "Failed to load SMS settings",
      SmsApiError,
    );
  } catch {
    await delay();
    return {
      configured: false,
      defaultSender: "Gidtransfer",
      studio: {
        smsSenderStatus: "none",
        smsBrandingReady: false,
      },
    };
  }
}

export async function sendTestSms(input: SendTestSmsInput): Promise<SendTestSmsResponse> {
  return authedJson<SendTestSmsResponse>(
    "/api/sms/test",
    {
      method: "POST",
      body: JSON.stringify({
        phone: input.phone.trim(),
        ...(input.message?.trim() ? { message: input.message.trim() } : {}),
      }),
    },
    "Failed to send test SMS",
    SmsApiError,
  );
}

export async function getSmsMeta(): Promise<SmsMeta> {
  try {
    const config = await getSmsConfig();
    return {
      placeholders: [{ key: "client", token: "{client}", label: "Client name" }],
      recipientTypes: [
        { id: "client", label: "Client" },
        { id: "custom", label: "Custom list" },
      ],
      configured: config.configured,
    };
  } catch {
    await delay();
    return {
      placeholders: [{ key: "client", token: "{client}", label: "Client name" }],
      recipientTypes: [
        { id: "client", label: "Client" },
        { id: "custom", label: "Custom list (demo)" },
      ],
      configured: false,
    };
  }
}

export async function listSmsMessages(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "sent" | "failed" | "skipped";
}): Promise<ListSmsMessagesResponse> {
  try {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search?.trim()) qs.set("search", params.search.trim());
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return await authedJson<ListSmsMessagesResponse>(
      `/api/sms/messages${query ? `?${query}` : ""}`,
      { method: "GET" },
      "Failed to load SMS messages",
      SmsApiError,
    );
  } catch {
    await delay();
    void params;
    return {
      messages: [],
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total: 0,
        totalPages: 1,
      },
    };
  }
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResponse> {
  try {
    return await authedJson<SendSmsResponse>(
      "/api/sms/send",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      "Failed to send SMS",
      SmsApiError,
    );
  } catch (err) {
    if (err instanceof SmsApiError && err.status === 503) {
      throw new SmsApiError(
        extractMessage(err.body, "SMS is not configured on the server."),
        err.status,
        err.body,
      );
    }
    await delay();
    return {
      message: "Demo mode: no SMS was sent.",
      summary: { sent: 0, failed: 0, skipped: 1 },
      results: [],
      skipped: [{ reason: "demo", recipientType: input.recipientType }],
    };
  }
}

export function smsApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof SmsApiError) {
    if (err.status === 503) {
      return extractMessage(err.body, "SMS is not configured on the server.");
    }
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
