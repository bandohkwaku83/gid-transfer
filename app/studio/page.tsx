import { headers } from "next/headers";
import Link from "next/link";
import {
  buildStudioUrlPreview,
  parseTenantFromHostname,
  studioUrlSuffixFromHost,
} from "@/lib/studio-url";

export default async function StudioLandingPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const tenant =
    h.get("x-studio-tenant")?.trim() ||
    parseTenantFromHostname(host) ||
    "studio";

  const suffix = studioUrlSuffixFromHost(host);
  const studioHome = buildStudioUrlPreview(tenant, suffix);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-center dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Client gallery</p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {tenant.replace(/-/g, " ")}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Photo galleries shared by this studio open at links like{" "}
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
            /client/your-gallery
          </span>
          .
        </p>
        <p className="mt-4 truncate font-mono text-xs text-zinc-400">{studioHome}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Photographer sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
