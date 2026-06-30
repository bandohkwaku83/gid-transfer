"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  authHandoffPayload,
  clearAuth,
  consumeAuthHandoffFromUrl,
  getAuth,
  getAuthToken,
  refreshAuthFromPersisted,
} from "@/lib/auth-demo";
import { userNeedsEmailVerification, verifyEmailPath } from "@/lib/auth-api";
import {
  photographerAuthUrl,
  redirectToTenantHostIfNeeded,
} from "@/lib/studio-url";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    consumeAuthHandoffFromUrl();

    const auth = getAuth();
    const token = getAuthToken();
    if (!auth?.user || !token) {
      window.location.replace(photographerAuthUrl("/login"));
      return;
    }
    refreshAuthFromPersisted();
    const next = getAuth()?.user;
    if (!next) {
      window.location.replace(photographerAuthUrl("/login"));
      return;
    }
    if (userNeedsEmailVerification(next)) {
      window.location.replace(photographerAuthUrl(verifyEmailPath()));
      return;
    }
    if (!next.onboardingComplete) {
      window.location.replace(photographerAuthUrl("/onboarding"));
      return;
    }
    const slug = next.studio?.companySlug?.trim();
    if (
      slug &&
      redirectToTenantHostIfNeeded(
        slug,
        "/dashboard",
        {
          studioUrl: next.studio?.studioUrl,
          studioUrlSuffix: next.studio?.studioUrlSuffix,
        },
        authHandoffPayload(),
        clearAuth,
      )
    ) {
      return;
    }
    queueMicrotask(() => setReady(true));
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-black">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
