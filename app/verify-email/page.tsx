"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SignupOtpInput } from "@/components/auth/signup-otp-input";
import {
  AuthApiError,
  fetchAuthMe,
  mapApiUserToAuthUser,
  navigateAfterAuth,
  persistAuthResponse,
  resendVerification,
  userNeedsEmailVerification,
  verifyEmail,
} from "@/lib/auth-api";
import { clearAuth, getAuth, getAuthToken, setAuthSession } from "@/lib/auth-demo";
import { APP_NAME } from "@/lib/branding";
import { redirectToApexAuthIfNeeded } from "@/lib/studio-url";

const OTP_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    redirectToApexAuthIfNeeded("/verify-email");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = getAuthToken();
      const auth = getAuth();
      if (!token || !auth?.user?.email?.trim()) {
        router.replace("/login?screen=signup");
        return;
      }

      setEmail(auth.user.email.trim());

      try {
        const { user: apiUser } = await fetchAuthMe();
        if (cancelled) return;
        const user = mapApiUserToAuthUser(apiUser);
        setAuthSession({ ...auth, token, user });
        setEmail(user.email);

        if (!userNeedsEmailVerification(user)) {
          navigateAfterAuth(user, router);
          return;
        }
      } catch {
        if (cancelled) return;
        if (!userNeedsEmailVerification(auth.user)) {
          navigateAfterAuth(auth.user, router);
          return;
        }
      }

      if (!cancelled) setReady(true);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  function authErrorMessage(err: unknown, fallback: string) {
    if (err instanceof AuthApiError) return err.message;
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  function startCountdown(seconds: number) {
    const next = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : DEFAULT_RESEND_SECONDS;
    setResendCooldown(next);
  }

  async function submitVerify(code = otp) {
    if (submitting) return;
    setError(null);

    const digits = code.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (digits.length < OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyEmail(digits);
      const user = persistAuthResponse(res);
      navigateAfterAuth(user, router);
    } catch (err) {
      setError(authErrorMessage(err, "That code is incorrect or expired. Try again."));
      setOtp("");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResend() {
    if (submitting || resendCooldown > 0) return;
    setError(null);

    setSubmitting(true);
    try {
      const res = await resendVerification();
      setStatusMessage(res.message);
      startCountdown(res.resendAfterSeconds);
      setOtp("");
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 429) {
        const seconds =
          err.body &&
          typeof err.body === "object" &&
          typeof (err.body as { resendAfterSeconds?: unknown }).resendAfterSeconds === "number"
            ? (err.body as { resendAfterSeconds: number }).resendAfterSeconds
            : DEFAULT_RESEND_SECONDS;
        startCountdown(seconds);
        setError(err.message);
        return;
      }
      setError(authErrorMessage(err, "Could not resend the verification code."));
    } finally {
      setSubmitting(false);
    }
  }

  function backToSignUp() {
    clearAuth();
    router.push("/login?screen=signup");
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-soft text-sm text-zinc-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-brand-soft/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,_rgba(85,0,31,0.06),transparent_42%),radial-gradient(circle_at_90%_85%,_rgba(213,174,101,0.12),transparent_38%)]" />

      <div className="relative z-[1] mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col justify-center">
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Home
              </Link>
              <Image
                src="/svgs/color_logo.svg"
                alt={`${APP_NAME} logo`}
                width={3965}
                height={1231}
                className="h-8 w-auto sm:h-9"
              />
              <span className="w-12" aria-hidden />
            </div>

            <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Verify your email
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Enter the {OTP_LENGTH}-digit code we sent to{" "}
              <span className="font-medium text-zinc-800">{email || "your email"}</span>.
            </p>

            <div className="mt-7 space-y-4">
              {statusMessage ? (
                <div
                  role="status"
                  className="rounded-xl border border-brand-muted bg-brand-soft px-4 py-3 text-sm text-brand-ink"
                >
                  <p>{statusMessage}</p>
                </div>
              ) : null}

              <SignupOtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError(null);
                }}
                disabled={submitting}
                error={Boolean(error)}
                autoFocus
                onComplete={(value) => void submitVerify(value)}
              />

              <p className="text-center text-xs text-zinc-500">
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  onClick={() => void submitResend()}
                  disabled={submitting || resendCooldown > 0}
                  className="font-semibold text-brand underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </p>

              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void submitVerify()}
                disabled={submitting}
                aria-busy={submitting}
                className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Verifying…" : "Verify & continue"}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={backToSignUp}
                  disabled={submitting}
                  className="font-semibold text-brand underline-offset-2 hover:underline disabled:opacity-50"
                >
                  Back to sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
