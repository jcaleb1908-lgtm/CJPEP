"use client";

import { useI18n } from "@/lib/i18n";
import { unitsFor, type Product } from "@/lib/catalog";
import { formatMg, formatUsd, lowestCyclePrice } from "@/lib/pricing";

export default function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  const { t, lang, pick } = useI18n();
  const low = lowestCyclePrice(product);
  const units = unitsFor(product);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="card group flex h-full w-full flex-col p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-2xl">{product.name}</h3>
          <p className="mt-1 text-xs text-muted">{product.brandNames}</p>
        </div>
        <span className="shrink-0 rounded-full bg-bone-dim px-2 py-1 text-[10px] font-semibold tracking-wide text-muted">
          {product.ref.split(" · ")[0]}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
        {pick(product.use)}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {units.map((u) => (
          <span
            key={u}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium capitalize text-muted"
          >
            {u === "vial" ? t("modal.vial") : t("modal.cartucho")}
          </span>
        ))}
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
          {product.weeklyDosesMg.length} {lang === "es" ? "dosis" : "doses"}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t("products.from")}
          </p>
          <p className="display mt-0.5 text-3xl text-brand-700">
            {low ? formatUsd(low.price, lang) : "—"}
          </p>
          <p className="text-[11px] text-muted">
            {t("products.cycle")}
            {low ? ` · ${formatMg(low.doseMg)}/sem` : ""}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          {t("products.open")}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </button>
  );
}
