import Image from "next/image";
import Link from "next/link";
import { APP_NAME, FOOTER_DESCRIPTION } from "@/lib/branding";
import { MarketingSocialIconLinks } from "@/components/marketing/marketing-social-links";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Client galleries", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/#benefits" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Start free", href: "/login?screen=signup" },
    ],
  },
];

function FooterNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a href={href} className="marketing-footer-link">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="marketing-footer-link">
      {children}
    </Link>
  );
}

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-10 bg-[#55001F] text-[#E5E7EB] sm:mt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-14 -translate-y-[calc(100%-1px)] overflow-hidden sm:h-20 lg:h-24"
      >
        <svg
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          className="block h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#55001F"
            d="M0,48 C240,96 480,0 720,48 C960,96 1200,0 1440,48 L1440,96 L0,96 Z"
          />
        </svg>
      </div>

      <div className="marketing-container pb-6 pt-4 sm:pb-8 sm:pt-5">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
          <div>
            <Image
              src="/svgs/main_logo.svg"
              alt={APP_NAME}
              width={341}
              height={90}
              className="h-8 w-auto sm:h-10"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60 sm:max-w-md">
              {FOOTER_DESCRIPTION}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
          <MarketingSocialIconLinks variant="footer" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-3 space-y-0.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <FooterNavLink href={link.href}>{link.label}</FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="marketing-container py-2 sm:py-3">
          <p className="text-right text-sm text-white/45">
            © {year} {APP_NAME}.
          </p>
        </div>
      </div>
    </footer>
  );
}
