"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import Logo from "./Logo";

const TABS = [
  { href: "/nosotros", key: "nav.about" },
  { href: "/productos", key: "nav.products" },
  { href: "/rutas", key: "nav.routes" },
  { href: "/contacto", key: "nav.contact" },
] as const;

export default function Header() {
  const { t, lang, toggle } = useI18n();
  const { count, open } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled
          ? "bg-bone/85 backdrop-blur-md border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      >
        {t("nav.skip")}
      </a>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={t("nav.home")} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-brand-700 bg-brand-50"
                        : "text-ink-soft hover:text-ink hover:bg-bone-dim"
                    }`}
                  >
                    {t(tab.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggle}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-700"
            aria-label={`${lang === "es" ? "Switch to English" : "Cambiar a español"}`}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>

          <button
            type="button"
            onClick={open}
            className="relative inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-transform active:translate-y-px"
            aria-label={t("nav.cart")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.55L21 8H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1.4" fill="currentColor" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" />
            </svg>
            <span className="hidden sm:inline">{t("nav.cart")}</span>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1.5 text-[11px] font-bold leading-none">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden rounded-full border border-line p-2"
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={mobileOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="mobile"
          className="md:hidden border-t border-line bg-surface"
        >
          <ul className="container-page py-2">
            {TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className="block rounded-lg px-3 py-3 text-[0.95rem] font-medium text-ink-soft hover:bg-bone-dim"
                >
                  {t(tab.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
