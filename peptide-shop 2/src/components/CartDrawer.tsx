"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatMg, formatUsd } from "@/lib/pricing";
import { PRICING } from "@/lib/config";

export default function CartDrawer() {
  const { t, lang } = useI18n();
  const { isOpen, close, resolved, total, count, setQty, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t("cart.title")}>
      <button
        type="button"
        aria-label={t("modal.close")}
        onClick={close}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="display text-2xl">{t("cart.title")}</h2>
            {count > 0 && (
              <p className="text-xs text-muted">
                {count} {count === 1 ? t("cart.cycle") : t("cart.cycles")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("modal.close")}
            className="rounded-full border border-line p-2 text-muted hover:bg-bone-dim"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {resolved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-sm text-muted">{t("cart.empty")}</p>
            <Link href="/productos" onClick={close} className="btn btn-ghost">
              {t("cart.emptyCta")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {resolved.map((item) => (
                <li key={item.key} className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{item.productName}</h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatMg(item.weeklyDoseMg)} / {lang === "es" ? "semana" : "week"} ·{" "}
                        {item.unit === "vial"
                          ? t("modal.vial")
                          : t("modal.cartucho")}{" "}
                        · {PRICING.weeksPerCycle} {lang === "es" ? "semanas" : "weeks"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {item.plan.lines
                          .map((l) => `${l.qty}× ${l.presentation.sku}`)
                          .join(" + ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-brand-700">
                      {formatUsd(item.lineTotal, lang)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.qty - 1)}
                        className="px-3 py-1 text-muted hover:text-ink"
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-sm font-bold tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.qty + 1)}
                        className="px-3 py-1 text-muted hover:text-ink"
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      className="text-xs font-medium text-muted underline underline-offset-2 hover:text-[#b3261e]"
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-bone px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">{t("cart.total")}</span>
                <span className="display text-3xl text-brand-700">
                  {formatUsd(total, lang)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="btn btn-primary mt-4 w-full"
              >
                {t("cart.checkout")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
