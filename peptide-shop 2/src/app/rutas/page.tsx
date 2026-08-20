"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PICKUP_LOCATIONS, daysLabel, hoursLabel, formatTime } from "@/lib/pickup";

const PickupMap = dynamic(() => import("@/components/PickupMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full animate-pulse rounded-lg bg-bone-dim md:h-[460px]" />
  ),
});

export default function RoutesPage() {
  const { t, lang, pick } = useI18n();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="container-page py-16 md:py-20">
      <header className="max-w-2xl fade-up">
        <p className="eyebrow">{t("nav.routes")}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{t("routes.title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          {t("routes.lede")}
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <ul className="space-y-4">
          {PICKUP_LOCATIONS.map((loc, i) => (
            <li key={loc.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(loc.id)}
                onFocus={() => setActive(loc.id)}
                onClick={() => setActive(loc.id)}
                className={`card w-full p-6 text-left transition-all ${
                  active === loc.id
                    ? "border-brand-500 shadow-lift"
                    : "hover:border-brand-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold">{loc.name}</h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {loc.address}
                    </p>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">
                          {t("routes.days")}
                        </dt>
                        <dd className="mt-0.5 font-medium">{daysLabel(loc, lang)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">
                          {t("routes.hours")}
                        </dt>
                        <dd className="mt-0.5 font-medium">{hoursLabel(loc)}</dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {loc.slots.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-bone-dim px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted"
                        >
                          {formatTime(s)}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-muted">
                      <span className="font-semibold">{t("routes.note")}:</span>{" "}
                      {pick(loc.note)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PickupMap activeId={active} />
          <p className="mt-3 text-xs text-muted">{t("routes.mapNote")}</p>
        </div>
      </div>
    </div>
  );
}
