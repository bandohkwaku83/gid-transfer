import { getAuth } from "@/lib/auth-demo";
import { SEED_PROJECTS, loadAllProjects } from "@/lib/demo-data";
import { FoldersApiError } from "@/lib/folders/types";
import {
  computeDemoStorageTotalBytes,
  estimateDemoBytesForNewFinalAssets,
  estimateDemoBytesForNewRawAssets,
} from "@/lib/usage-api";

export type PlanId = "free" | "starter" | "studio" | "pro";

export type PlanDefinition = {
  id: PlanId;
  label: string;
  description: string;
  storageBytes: number;
  /** null = unlimited */
  maxGalleries: number | null;
  priceLabel: string;
  perks: string[];
};

const SUBSCRIPTION_BY_EMAIL_KEY = "gidostorage_subscription_by_email_v1";

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    label: "Free",
    description: "5 GB storage for getting started.",
    storageBytes: 5 * 1024 * 1024 * 1024,
    maxGalleries: 2,
    priceLabel: "Free",
    perks: ["5 GB storage", "2 galleries", "Share links & client selection"],
  },
  starter: {
    id: "starter",
    label: "Starter",
    description: "25 GB storage for growing studios.",
    storageBytes: 25 * 1024 * 1024 * 1024,
    maxGalleries: 3,
    priceLabel: "GHS 79 / mo",
    perks: ["25 GB storage", "3 galleries", "Share links & watermarks"],
  },
  pro: {
    id: "pro",
    label: "Pro",
    description: "100 GB storage for busy photographers.",
    storageBytes: 100 * 1024 * 1024 * 1024,
    maxGalleries: null,
    priceLabel: "GHS 199 / mo",
    perks: ["100 GB storage", "Unlimited galleries", "Priority support (coming soon)"],
  },
  studio: {
    id: "studio",
    label: "Studio",
    description: "500 GB storage for high-volume studios.",
    storageBytes: 500 * 1024 * 1024 * 1024,
    maxGalleries: null,
    priceLabel: "GHS 499 / mo",
    perks: ["500 GB storage", "Unlimited galleries", "Team seats (coming soon)"],
  },
};

const PLAN_IDS = new Set<PlanId>(["free", "starter", "studio", "pro"]);

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function readPlanMap(): Record<string, PlanId> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_BY_EMAIL_KEY);
    if (!raw) return {};
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" ? (v as Record<string, PlanId>) : {};
  } catch {
    return {};
  }
}

function writePlanMap(map: Record<string, PlanId>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBSCRIPTION_BY_EMAIL_KEY, JSON.stringify(map));
}

function accountEmail(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const a = getAuth();
  return a?.user?.email ?? a?.email;
}

export function getSubscriptionPlanIdForEmail(email: string | undefined | null): PlanId {
  if (!email?.trim()) return "free";
  if (typeof window === "undefined") return "free";
  const stored = readPlanMap()[normEmail(email)];
  return stored && PLAN_IDS.has(stored) ? stored : "free";
}

export function getSubscriptionPlanId(): PlanId {
  return getSubscriptionPlanIdForEmail(accountEmail());
}

export function getActivePlanDefinition(): PlanDefinition {
  return PLANS[getSubscriptionPlanId()];
}

export function setSubscriptionPlanIdForEmail(email: string, planId: PlanId): void {
  if (typeof window === "undefined") return;
  const key = normEmail(email);
  if (!key) return;
  const next = { ...readPlanMap(), [key]: planId };
  writePlanMap(next);
}

const _seedGalleryIds = new Set(SEED_PROJECTS.map((p) => p.id));

/** Galleries you created (demo seeds do not count toward limits). */
export function countGalleriesTowardQuota(): number {
  return loadAllProjects().filter((p) => !_seedGalleryIds.has(p.id)).length;
}

export function assertCanCreateGallery(): void {
  const plan = getActivePlanDefinition();
  if (plan.maxGalleries === null) return;
  const n = countGalleriesTowardQuota();
  if (n >= plan.maxGalleries) {
    throw new FoldersApiError(
      `${plan.label} includes up to ${plan.maxGalleries} galleries. Upgrade your plan in Settings to add more.`,
      400,
      null,
    );
  }
}

export function assertStorageAllowsDemoRawAdds(assetCount: number): void {
  assertStorageAllowsAdditionalBytes(estimateDemoBytesForNewRawAssets(assetCount));
}

export function assertStorageAllowsDemoFinalAdds(assetCount: number): void {
  assertStorageAllowsAdditionalBytes(estimateDemoBytesForNewFinalAssets(assetCount));
}

export function assertStorageAllowsAdditionalBytes(additionalBytes: number): void {
  if (additionalBytes <= 0) return;
  const plan = getActivePlanDefinition();
  const used = computeDemoStorageTotalBytes();
  if (used + additionalBytes > plan.storageBytes) {
    const g = plan.storageBytes / (1024 * 1024 * 1024);
    const cap =
      Math.abs(g - Math.round(g)) < 1e-6 ? `${Math.round(g)} GB` : `${g.toFixed(1)} GB`;
    throw new FoldersApiError(
      `Storage limit reached for ${plan.label} (${cap} included). Free up space or choose a larger plan in Settings.`,
      400,
      null,
    );
  }
}
