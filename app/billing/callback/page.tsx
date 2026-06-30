"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  paystackReferenceFromSearchParams,
  clearBillingCheckoutReference,
  isBillingPaymentConfirmed,
  verifyBillingPayment,
} from "@/lib/billing-api";
import { getAuthToken } from "@/lib/auth-demo";
import { HttpError } from "@/lib/http";
import { photographerSignOutUrl } from "@/lib/studio-url";

type CallbackState =
  | { kind: "loading" }
  | { kind: "session_expired" }
  | { kind: "error"; message: string };

function BillingCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [state, setState] = useState<CallbackState>({ kind: "loading" });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const reference = paystackReferenceFromSearchParams(searchParams);
    if (!reference) {
      setState({
        kind: "error",
        message: "Payment reference missing. Return to billing and try again.",
      });
      return;
    }

    void (async () => {
      try {
        const result = await verifyBillingPayment(reference, { redirectOn401: false });
        if (!isBillingPaymentConfirmed(result)) {
          setState({
            kind: "error",
            message: result.message ?? "Payment could not be verified.",
          });
          return;
        }

        clearBillingCheckoutReference();

        if (!getAuthToken()) {
          setState({ kind: "session_expired" });
          return;
        }

        router.replace("/dashboard/settings?tab=billing&success=1");
      } catch (err) {
        if (err instanceof HttpError && err.status === 401) {
          setState({ kind: "session_expired" });
          return;
        }
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Payment verification failed.",
        });
      }
    })();
  }, [router, searchParams]);

  if (state.kind === "session_expired") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <h1 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Payment received
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your session expired while you were on Paystack. Log in again to see your updated plan
            on the billing page.
          </p>
          <Link
            href={photographerSignOutUrl()}
            className="mt-5 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <h1 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Could not confirm payment
          </h1>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">{state.message}</p>
          <Link
            href="/dashboard/settings?tab=billing"
            className="mt-5 inline-flex font-semibold text-brand underline underline-offset-2 dark:text-brand-on-dark"
          >
            Back to billing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 px-4 text-center dark:bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Confirming your payment…
      </p>
      <p className="max-w-sm text-xs text-zinc-500">
        This usually takes a few seconds. Please keep this tab open.
      </p>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-black">
          Loading…
        </div>
      }
    >
      <BillingCallbackContent />
    </Suspense>
  );
}
