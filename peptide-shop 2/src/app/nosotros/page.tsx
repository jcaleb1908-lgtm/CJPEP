"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  const values = [
    { t: "about.v1.t", b: "about.v1.b" },
    { t: "about.v2.t", b: "about.v2.b" },
    { t: "about.v3.t", b: "about.v3.b" },
  ] as const;

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl fade-up">
        <p className="eyebrow">{t("nav.about")}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{t("about.title")}</h1>
        <p className="mt-5 text-xl leading-relaxed text-ink-soft">
          {t("about.lede")}
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5 text-[0.975rem] leading-relaxed text-ink-soft">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <p>{t("about.p3")}</p>
          <div className="pt-4">
            <Link href="/productos" className="btn btn-primary">
              {t("home.cta")}
            </Link>
          </div>
        </div>

        <ul className="space-y-4">
          {values.map((v) => (
            <li key={v.t} className="card p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-700">
                {t(v.t)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(v.b)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
