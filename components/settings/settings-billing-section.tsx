"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  FolderOpen,
  HardDrive,
  Loader2,
} from "lucide-react";
import {
  FormModal,
  FormModalBody,
  FormModalFooter,
  FormModalHeader,
} from "@/components/ui/form-modal";
import { SettingsWorkflowSkeleton } from "@/components/ui/skeletons";
import {
  cancelBillingSubscription,
  clearBillingCheckoutReference,
  fetchBillingPageData,
  formatBillingDate,
  formatPlanPriceGhs,
  isBillingNotConfigured,
  isBillingPaymentConfirmed,
  readBillingCheckoutReference,
  readBillingErrorMessage,
  reconcilePendingBillingPayment,
  rememberBillingCheckoutReference,
  paystackReferenceFromSearchParams,
  startBillingCheckout,
  type BillingPlan,
  type BillingSubscription,
  type CheckoutPlanId,
} from "@/lib/billing-api";
import { galleriesOverviewDisplay, type ApiSettingsOverview } from "@/lib/settings-api";
import { cn } from "@/lib/utils";

type SettingsBillingSectionProps = {
  overview: ApiSettingsOverview | null;
  loading?: boolean;
  paymentSuccess?: boolean;
  onPaymentSuccessAcknowledged?: () => void;
  onBillingUpdated?: () => void | Promise<void>;
};

function subscriptionStatusLabel(subscription: BillingSubscription | null): {
  label: string;
  tone: "neutral" | "brand" | "warning" | "pending";
} {
  if (!subscription) return { label: "Free", tone: "neutral" };

  switch (subscription.status) {
    case "pending":
      return { label: "Awaiting payment", tone: "pending" };
    case "active":
      return { label: "Active", tone: "brand" };
    case "past_due":
      return { label: "Payment failed", tone: "warning" };
    case "non_renewing": {
      const expires = formatBillingDate(subscription.currentPeriodEnd);
      return {
        label: expires ? `Expires ${expires}` : "Expires soon",
        tone: "warning",
      };
    }
    case "cancelled":
      return { label: "Ended", tone: "neutral" };
    default:
      return { label: "Free tier", tone: "neutral" };
  }
}

function isPendingCheckoutPlan(
  plan: BillingPlan,
  subscription: BillingSubscription | null,
): boolean {
  return (
    subscription?.status === "pending" &&
    subscription.pendingPlanId === plan.id
  );
}

function planActionLabel(plan: BillingPlan, subscription: BillingSubscription | null): string {
  if (isPendingCheckoutPlan(plan, subscription)) return "Continue on Paystack";
  if (plan.current) return "Current plan";
  if (!plan.available) return "Coming soon";
  if (plan.id === "free") return "Included";
  return `Switch to ${plan.name}`;
}

function isCheckoutPlanId(id: string): id is CheckoutPlanId {
  return id === "starter" || id === "pro" || id === "studio";
}

export function SettingsBillingSection({
  overview,
  loading: pageLoading = false,
  paymentSuccess = false,
  onPaymentSuccessAcknowledged,
  onBillingUpdated,
}: SettingsBillingSectionProps) {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingUnavailable, setBillingUnavailable] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<CheckoutPlanId | null>(null);
  const [planErrors, setPlanErrors] = useState<Partial<Record<CheckoutPlanId, string>>>({});
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reconcilingPayment, setReconcilingPayment] = useState(false);
  const [storedCheckoutRef, setStoredCheckoutRef] = useState(false);

  const refreshStoredCheckoutRef = useCallback(() => {
    setStoredCheckoutRef(Boolean(readBillingCheckoutReference()));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reference = paystackReferenceFromSearchParams(
      new URLSearchParams(window.location.search),
    );
    if (reference) {
      rememberBillingCheckoutReference(reference);
      refreshStoredCheckoutRef();
    } else {
      refreshStoredCheckoutRef();
    }
  }, [refreshStoredCheckoutRef]);

  const loadBilling = useCallback(async () => {
    setBillingError(null);
    setBillingUnavailable(false);
    try {
      const data = await fetchBillingPageData();
      setPlans(data.plans);
      setSubscription(data.subscription);
    } catch (err) {
      if (isBillingNotConfigured(err)) {
        setBillingUnavailable(true);
        setPlans([]);
        setSubscription(null);
      } else {
        setBillingError(await readBillingErrorMessage(err, "Could not load billing."));
      }
    } finally {
      setBillingLoading(false);
    }
  }, []);

  const tryReconcilePendingPayment = useCallback(async () => {
    const reference = readBillingCheckoutReference();
    if (!reference) return false;

    setReconcilingPayment(true);
    try {
      const result = await reconcilePendingBillingPayment({ redirectOn401: false });
      if (result && isBillingPaymentConfirmed(result)) {
        clearBillingCheckoutReference();
        refreshStoredCheckoutRef();
        await loadBilling();
        await onBillingUpdated?.();
        return true;
      }
    } catch {
      /* verification may fail if webhook already processed or session expired */
    } finally {
      setReconcilingPayment(false);
    }
    return false;
  }, [loadBilling, onBillingUpdated, refreshStoredCheckoutRef]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  useEffect(() => {
    if (billingLoading || subscription?.status !== "pending") return;
    void tryReconcilePendingPayment();
  }, [billingLoading, subscription?.status, tryReconcilePendingPayment]);

  useEffect(() => {
    if (subscription?.status !== "pending") {
      clearBillingCheckoutReference();
      refreshStoredCheckoutRef();
    }
  }, [subscription?.status, refreshStoredCheckoutRef]);

  useEffect(() => {
    if (!paymentSuccess) return;

    void (async () => {
      setBillingLoading(true);
      await tryReconcilePendingPayment();
      await loadBilling();
      await onBillingUpdated?.();
    })();

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      if (attempts > 15) {
        window.clearInterval(intervalId);
        onPaymentSuccessAcknowledged?.();
        return;
      }
      void (async () => {
        await tryReconcilePendingPayment();
        const data = await fetchBillingPageData().catch(() => null);
        if (!data) return;
        setPlans(data.plans);
        setSubscription(data.subscription);
        if (data.subscription?.status !== "pending") {
          window.clearInterval(intervalId);
          await onBillingUpdated?.();
          onPaymentSuccessAcknowledged?.();
        }
      })();
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    paymentSuccess,
    loadBilling,
    tryReconcilePendingPayment,
    onBillingUpdated,
    onPaymentSuccessAcknowledged,
  ]);

  const activePlan =
    plans.find((p) => p.current) ??
    (subscription
      ? plans.find((p) => p.id === subscription.planId)
      : undefined);

  const displayPlanName =
    subscription?.planName?.replace(/\s+plan$/i, "") ??
    activePlan?.name ??
    "Free";
  const displayPrice = subscription
    ? formatPlanPriceGhs(subscription.priceGhs, subscription.interval)
    : activePlan
      ? formatPlanPriceGhs(activePlan.priceGhs, activePlan.interval)
      : "Free";
  const displayDescription = activePlan?.description ?? "Your current plan and usage limits.";
  const statusMeta = subscriptionStatusLabel(subscription);
  const renewLabel = formatBillingDate(subscription?.currentPeriodEnd);
  const pendingPlanName =
    plans.find((p) => p.id === subscription?.pendingPlanId)?.name ??
    subscription?.planName ??
    "a paid plan";
  const showPendingActivation =
    subscription?.status === "pending" &&
    (paymentSuccess || reconcilingPayment || storedCheckoutRef);

  const galleriesUsed = overview?.galleries.used;
  const galleryMax = overview?.galleries.limit;
  const galleriesLabel = galleriesOverviewDisplay(overview?.galleries);
  const galleryPct =
    galleryMax != null && galleryMax > 0 && galleriesUsed != null
      ? Math.min(100, Math.round((galleriesUsed / galleryMax) * 100))
      : null;
  const storageLabel =
    overview?.planStorage.label ??
    subscription?.storageLabel ??
    activePlan?.storageLabel ??
    "—";
  const storagePct =
    overview?.planStorage.percentOfPlan != null
      ? Math.min(100, Math.round(overview.planStorage.percentOfPlan))
      : null;

  async function handleCheckout(plan: BillingPlan) {
    if (!isCheckoutPlanId(plan.id) || !plan.available) return;
    const pendingCheckout = isPendingCheckoutPlan(plan, subscription);
    if (plan.current && !pendingCheckout) return;

    setCheckoutPlanId(plan.id);
    setPlanErrors((prev) => {
      if (!isCheckoutPlanId(plan.id)) return prev;
      const next = { ...prev };
      delete next[plan.id];
      return next;
    });

    try {
      await startBillingCheckout(plan.id);
    } catch (err) {
      const message = await readBillingErrorMessage(err, "Checkout failed.");
      if (isCheckoutPlanId(plan.id)) {
        setPlanErrors((prev) => ({ ...prev, [plan.id]: message }));
      }
      setCheckoutPlanId(null);
    }
  }

  async function handleCancelConfirm() {
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await cancelBillingSubscription();
      setSubscription(result.subscription);
      setCancelOpen(false);
      clearBillingCheckoutReference();
      setBillingLoading(true);
      await loadBilling();
      await onBillingUpdated?.();
    } catch (err) {
      setCancelError(await readBillingErrorMessage(err, "Could not cancel subscription."));
    } finally {
      setCancelling(false);
    }
  }

  if ((pageLoading || billingLoading) && !overview && plans.length === 0) {
    return <SettingsWorkflowSkeleton />;
  }

  return (
    <div className="space-y-6">
      {paymentSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          Payment confirmed. Your plan is updating — refresh may take a moment if limits have not
          changed yet.
        </div>
      ) : null}

      {billingUnavailable ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          Billing is unavailable right now. Plan limits still apply from your account settings.
        </div>
      ) : null}

      {billingError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {billingError}
          <button
            type="button"
            className="ml-3 font-semibold underline"
            onClick={() => {
              setBillingLoading(true);
              void loadBilling();
            }}
          >
            Reload billing
          </button>
        </div>
      ) : null}

      {subscription?.status === "pending" ? (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          {showPendingActivation ? (
            <>
              <p className="font-semibold">Activating your plan</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                Paystack confirmed your payment for {pendingPlanName}. We are updating your account
                now — this usually takes a few seconds.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {reconcilingPayment ? (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Confirming payment…
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setBillingLoading(true);
                      void (async () => {
                        await tryReconcilePendingPayment();
                        await loadBilling();
                      })();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover"
                  >
                    Refresh status
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold">Checkout not finished</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                You started upgrading to {pendingPlanName}, but Paystack has not received payment
                yet. Use the button below to open the Paystack payment page — that is the normal next
                step.
              </p>
              {subscription.pendingPlanId && isCheckoutPlanId(subscription.pendingPlanId) ? (
                <button
                  type="button"
                  disabled={checkoutPlanId === subscription.pendingPlanId}
                  onClick={() => {
                    const pendingPlan = plans.find((p) => p.id === subscription.pendingPlanId);
                    if (pendingPlan) void handleCheckout(pendingPlan);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:opacity-60"
                >
                  {checkoutPlanId === subscription.pendingPlanId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Opening Paystack…
                    </>
                  ) : (
                    "Continue on Paystack"
                  )}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {subscription?.status === "past_due" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Update payment method</p>
            <p className="mt-0.5 text-xs opacity-90">
              Your last renewal failed. Choose your plan again to update billing on Paystack.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-brand/5 p-5 dark:border-zinc-800 dark:from-zinc-900/80 dark:via-zinc-950 dark:to-brand/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Your plan
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {displayPlanName}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">{displayPrice}</p>
            {renewLabel && subscription?.status === "active" ? (
              <p className="mt-1 text-xs text-zinc-500">Renews {renewLabel}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              statusMeta.tone === "brand" && "bg-brand text-white",
              statusMeta.tone === "pending" && "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
              statusMeta.tone === "warning" && "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-100",
              statusMeta.tone === "neutral" && "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
            )}
          >
            {statusMeta.label}
          </span>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{displayDescription}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200/90 bg-white/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/60">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <FolderOpen className="h-3.5 w-3.5" aria-hidden />
              Galleries
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {galleriesLabel}
            </p>
            {galleryPct != null ? (
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                role="progressbar"
                aria-valuenow={galleryPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Galleries used"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    galleryPct >= 100 ? "bg-amber-500" : "bg-brand",
                  )}
                  style={{ width: `${galleryPct}%` }}
                />
              </div>
            ) : null}
          </div>
          <div className="rounded-xl border border-zinc-200/90 bg-white/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/60">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <HardDrive className="h-3.5 w-3.5" aria-hidden />
              Included storage
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {storageLabel}
            </p>
            {storagePct != null ? (
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                role="progressbar"
                aria-valuenow={storagePct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Storage used"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    storagePct >= 100 ? "bg-amber-500" : "bg-brand",
                  )}
                  style={{ width: `${storagePct}%` }}
                />
              </div>
            ) : null}
            <Link
              href="/dashboard/storage"
              className="mt-1 inline-block text-xs font-semibold text-brand hover:underline dark:text-brand-on-dark"
            >
              View usage
            </Link>
          </div>
        </div>

        {subscription?.canManage ? (
          <div className="mt-4 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              className="text-sm font-semibold text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Cancel subscription
            </button>
          </div>
        ) : null}
      </div>

      {!billingUnavailable && plans.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">All plans</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Upgrade or switch plans anytime. Checkout is handled securely on Paystack.
            </p>
          </div>

          <ul className="space-y-3">
            {plans.map((plan) => {
              const current = plan.current;
              const pendingCheckout = isPendingCheckoutPlan(plan, subscription);
              const checkoutBusy = checkoutPlanId === plan.id;
              const planError = isCheckoutPlanId(plan.id) ? planErrors[plan.id] : undefined;
              const showCheckout =
                plan.id !== "free" && plan.available && (!current || pendingCheckout);
              const disabled =
                (current && !pendingCheckout) ||
                !plan.available ||
                checkoutBusy;

              return (
                <li key={plan.id}>
                  <div
                    className={cn(
                      "rounded-2xl border p-4 transition sm:p-5",
                      current
                        ? "border-brand bg-brand/5 shadow-sm shadow-brand/10 ring-1 ring-brand/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700",
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            {plan.name}
                          </p>
                          {pendingCheckout ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
                              Awaiting payment
                            </span>
                          ) : current ? (
                            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Current
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-brand dark:text-brand-on-dark">
                          {formatPlanPriceGhs(plan.priceGhs, plan.interval)}
                        </p>
                        {plan.description ? (
                          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {plan.description}
                          </p>
                        ) : null}
                        {plan.storageLabel ? (
                          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
                              {plan.storageLabel} storage
                            </li>
                          </ul>
                        ) : null}
                        {planError ? (
                          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                            {planError}
                          </p>
                        ) : null}
                      </div>
                      {showCheckout ? (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => void handleCheckout(plan)}
                          className={cn(
                            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60",
                            "bg-brand text-white shadow-sm hover:bg-brand-hover",
                          )}
                        >
                          {checkoutBusy ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                              Redirecting…
                            </>
                          ) : (
                            planActionLabel(plan, subscription)
                          )}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
                            current
                              ? "border border-brand/30 bg-brand/10 text-brand dark:text-brand-on-dark"
                              : "border border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
                          )}
                        >
                          {planActionLabel(plan, subscription)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <FormModal
        open={cancelOpen}
        onClose={() => {
          if (cancelling) return;
          setCancelOpen(false);
          setCancelError(null);
        }}
        busy={cancelling}
        maxWidth="md"
        titleId="cancel-subscription-title"
      >
        <FormModalHeader
          icon={AlertTriangle}
          title="Cancel subscription?"
          titleId="cancel-subscription-title"
          description="You will be moved to the Free plan immediately. This cannot be undone for the current billing period."
        />
        <FormModalBody>
          {cancelError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{cancelError}</p>
          ) : null}
        </FormModalBody>
        <FormModalFooter
          onCancel={() => setCancelOpen(false)}
          submitLabel="Cancel subscription"
          busyLabel="Cancelling…"
          busy={cancelling}
          onSubmit={() => void handleCancelConfirm()}
        />
      </FormModal>
    </div>
  );
}
