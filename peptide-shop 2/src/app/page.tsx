"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, productsByCategory } from "@/lib/catalog";

export default function HomePage() {
  const { t, pick } = useI18n();

  const features = [
    { t: "home.f1.t", b: "home.f1.b", n: "01" },
    { t: "home.f2.t", b: "home.f2.b", n: "02" },
    { t: "home.f3.t", b: "home.f3.b", n: "03" },
  ] as const;

  return (
    <>
      <section className="container-page pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl fade-up">
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <h1 className="display mt-5 text-[2.6rem] leading-[1.03] sm:text-6xl md:text-[4.25rem]">
            {t("home.title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            {t("home.lede")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/productos" className="btn btn-primary">
              {t("home.cta")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/rutas" className="btn btn-ghost">
              {t("home.cta2")}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {features.map((f) => (
            <div key={f.n} className="bg-surface p-7">
              <span className="display text-2xl text-brand-300">{f.n}</span>
              <h2 className="mt-3 text-base font-semibold">{t(f.t)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(f.b)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="display text-3xl md:text-4xl">{t("home.cats")}</h2>
          <p className="text-sm text-muted">{t("home.catsSub")}</p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const n = productsByCategory(cat.id).length;
            const live = n > 0;
            return (
              <li key={cat.id}>
                <Link
                  href={live ? `/productos#${cat.id}` : "/productos"}
                  className={`card block h-full p-6 transition-all ${
                    live
                      ? "hover:-translate-y-0.5 hover:shadow-lift hover:border-brand-300"
                      : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold leading-snug">{pick(cat.name)}</h3>
                    {live ? (
                      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                        {n}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-bone-dim px-2.5 py-1 text-[11px] font-semibold text-muted">
                        {t("products.soon")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {pick(cat.blurb)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
