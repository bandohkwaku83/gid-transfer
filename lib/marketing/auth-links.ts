import { authRedirectPath } from "@/lib/auth-api";
import { getAuth } from "@/lib/auth-demo";

/** True when the browser has a persisted photographer session (user + JWT). */
export function isPhotographerSignedIn(): boolean {
  const auth = getAuth();
  return Boolean(auth?.user?.email?.trim() && auth?.token?.trim());
}

function signedInDestination(): string | null {
  const auth = getAuth();
  if (!auth?.user?.email?.trim() || !auth?.token?.trim()) return null;
  return authRedirectPath(auth.user);
}

/** Sign-in CTAs — login first, or the studio when already authenticated. */
export function marketingSignInHref(): string {
  return signedInDestination() ?? "/login";
}

/** Start-free / get-started CTAs — signup first, or the studio when already authenticated. */
export function marketingSignUpHref(): string {
  return signedInDestination() ?? "/login?screen=signup";
}
