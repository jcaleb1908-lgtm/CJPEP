"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { unitsFor, type Product, type Unit } from "@/lib/catalog";
import { formatMg, formatUsd, plansFor, type CyclePlan } from "@/lib/pricing";
import { PRICING } from "@/lib/config";

export default function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { t, lang, pick } = useI18n();
  const { add, open: openCart } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);

  const units = useMemo<Unit[]>(() => (product ? unitsFor(product) : []), [product]);
  const [unit, setUnit] = useState<Unit>("vial");
  const [doseMg, setDoseMg] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Al abrir un producto nuevo, reiniciamos la selección.
  useEffect(() => {
    if (!product) return;
    const first = unitsFor(product)[0] ?? "vial";
    setUnit(first);
    setDoseMg(null);
    setQty(1);
    setJustAdded(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, onClose]);

  const plans = useMemo<CyclePlan[]>(
    () => (product ? plansFor(product, unit) : []),
    [product, unit]
  );
  const selected = plans.find((p) => p.weeklyDoseMg === doseMg) ?? null;

  if (!product) return null;

  const unitLabel = (u: Unit, n: number) =>
    u === "vial"
      ? n === 1
        ? t("modal.vial")
        : t("modal.vial_other")
      : n === 1
        ? t("modal.cartucho")
        : t("modal.cartucho_other");

  const handleAdd = () => {
    if (!selected) return;
    add({ productId: product.id, unit, weeklyDoseMg: selected.weeklyDoseMg, qty });
    setJustAdded(true);
    window.setTimeout(() => {
      onClose();
      openCart();
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <button
        type="button"
        aria-label={t("modal.close")}
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-surface shadow-lift outline-none sm:rounded-xl fade-up"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <p className="eyebrow">{product.ref}</p>
            <h2 className="display mt-1.5 text-3xl">{product.name}</h2>
            <p className="mt-1 text-xs text-muted">
              {product.brandNames}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modal.close")}
            className="shrink-0 rounded-full border border-line p-2 text-muted transition-colors hover:bg-bone-dim"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <p className="text-sm leading-relaxed text-ink-soft">
            {pick(product.use)}
          </p>

          {units.length > 1 && (
            <div className="mt-6">
              <p className="label">{t("modal.presentation")}</p>
              <div
                role="tablist"
                aria-label={t("modal.presentation")}
                className="inline-flex rounded-full bg-bone-dim p-1"
              >
                {units.map((u) => (
                  <button
                    key={u}
                    role="tab"
                    aria-selected={unit === u}
                    type="button"
                    onClick={() => {
                      setUnit(u);
                      setDoseMg(null);
                    }}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                      unit === u
                        ? "bg-surface text-brand-700 shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {unitLabel(u, 1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="label">{t("modal.chooseDose")}</p>
            <ul className="space-y-2">
              {plans.map((plan) => {
                const active = plan.weeklyDoseMg === doseMg;
                return (
                  <li key={plan.weeklyDoseMg}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDoseMg(plan.weeklyDoseMg)}
                      className={`flex w-full items-center justify-between gap-4 rounded-md border px-4 py-3.5 text-left transition-all ${
                        active
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                          : "border-line hover:border-brand-300 hover:bg-bone"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-semibold">
                          {formatMg(plan.weeklyDoseMg)}
                          <span className="ml-1 text-xs font-normal text-muted">
                            / {lang === "es" ? "semana" : "week"}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {plan.lines
                            .map(
                              (l) =>
                                `${l.qty}× ${l.presentation.sku} (${formatMg(
                                  l.presentation.mg
                                )})`
                            )
                            .join(" + ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-lg font-bold text-brand-700">
                          {formatUsd(plan.cycleTotal, lang)}
                        </span>
                        <span className="block text-[11px] text-muted">
                          {formatUsd(plan.perDose, lang)} {t("modal.perDose")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {selected && (
            <div className="mt-5 rounded-md bg-bone p-4 text-xs leading-relaxed text-ink-soft">
              <p>
                <strong>{t("modal.includes")}:</strong>{" "}
                {selected.lines
                  .map(
                    (l) =>
                      `${l.qty} ${unitLabel(selected.unit, l.qty)} ${formatMg(
                        l.presentation.mg
                      )} · ${l.presentation.sku}`
                  )
                  .join(" + ")}
              </p>
              <p className="mt-1">
                <strong>{t("modal.covers")}:</strong> {formatMg(selected.suppliedMg)} (
                {formatMg(selected.requiredMg)} {t("modal.required")} ·{" "}
                {PRICING.weeksPerCycle} {lang === "es" ? "semanas" : "weeks"})
              </p>
            </div>
          )}

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {t("modal.cadence")}
              </dt>
              <dd className="mt-1 text-xs leading-relaxed text-ink-soft">
                {pick(product.cadence)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {t("modal.audience")}
              </dt>
              <dd className="mt-1 text-xs leading-relaxed text-ink-soft">
                {pick(product.audience)}
              </dd>
            </div>
          </dl>

          {product.notes && (
            <p className="mt-4 text-xs italic leading-relaxed text-muted">
              {pick(product.notes)}
            </p>
          )}
        </div>

        {/* Pie: cantidad + añadir */}
        <div className="border-t border-line bg-bone px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-ink-soft">
                {t("modal.qty")}
              </span>
              <div className="inline-flex items-center rounded-full border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-lg leading-none text-muted hover:text-ink"
                  aria-label="-"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-bold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(12, q + 1))}
                  className="px-3.5 py-1.5 text-lg leading-none text-muted hover:text-ink"
                  aria-label="+"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selected && (
                <span className="display text-2xl text-brand-700">
                  {formatUsd(selected.cycleTotal * qty, lang)}
                </span>
              )}
              <button
                type="button"
                disabled={!selected}
                onClick={handleAdd}
                className="btn btn-primary"
              >
                {justAdded ? t("modal.added") : t("modal.add")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
