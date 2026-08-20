"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { BUSINESS } from "@/lib/config";
import Logo from "./Logo";

export default function Footer() {
  const { t, lang } = useI18n();
  const year = 2026;

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            {lang === "es" ? BUSINESS.tagline_es : BUSINESS.tagline_en}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
            {t("footer.nav")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/nosotros" className="hover:text-brand-700">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-brand-700">
                {t("nav.products")}
              </Link>
            </li>
            <li>
              <Link href="/rutas" className="hover:text-brand-700">
                {t("nav.routes")}
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-brand-700">
                {t("nav.contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
            {t("footer.contact")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="hover:text-brand-700"
              >
                {BUSINESS.email}
              </a>
            </li>
            <li>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-700"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={BUSINESS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-700"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line bg-bone-dim">
        <div className="container-page py-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-copper">
            {t("footer.disclaimerTitle")}
          </p>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed text-muted">
            {t("footer.disclaimer")}
          </p>
          <p className="mt-6 text-xs text-muted">
            © {year} {BUSINESS.name}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
