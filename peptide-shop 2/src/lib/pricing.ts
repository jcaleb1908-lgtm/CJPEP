/**
 * Toda la matemática de precios del sitio, en un solo lugar.
 * Regla de oro: TODO se cotiza como un ciclo de 4 semanas.
 *
 * All the site's price math in one place.
 * Golden rule: EVERYTHING is quoted as a 4-week cycle.
 */

import { PRICING } from "./config";
import type { Presentation, Product, Unit } from "./catalog";

/** Precio de una sola unidad (vial o cartucho) ya con margen aplicado. */
export function unitPrice(p: Presentation): number {
  return (p.packPriceUsd / p.packSize) * PRICING.markup;
}

export function round(amount: number): number {
  switch (PRICING.rounding) {
    case "up1":
      return Math.ceil(amount);
    case "up5":
      return Math.ceil(amount / 5) * 5;
    default:
      return Math.round(amount * 100) / 100;
  }
}

export function formatUsd(amount: number, locale = "es"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-PR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface PlanLine {
  presentation: Presentation;
  qty: number;
}

export interface CyclePlan {
  /** mg por administración semanal */
  weeklyDoseMg: number;
  /** mg totales necesarios para el ciclo completo (dosis × 4) */
  requiredMg: number;
  /** mg que realmente entrega la combinación elegida */
  suppliedMg: number;
  /** viales/cartuchos a entregar */
  lines: PlanLine[];
  /** precio del ciclo de 4 semanas, ya redondeado */
  cycleTotal: number;
  /** precio por dosis semanal (cycleTotal / 4) */
  perDose: number;
  unit: Unit;
}

const STEP = 0.1; // resolución de la búsqueda, en mg
const toSteps = (mg: number) => Math.round(mg / STEP);

/**
 * Encuentra la combinación más barata de presentaciones que cubra `requiredMg`.
 * Programación dinámica sobre pasos de 0.1 mg (unbounded knapsack de cobertura).
 */
function cheapestCombination(
  presentations: Presentation[],
  requiredMg: number
): PlanLine[] | null {
  const pool = presentations.filter((p) => p.mg > 0);
  if (pool.length === 0 || requiredMg <= 0) return null;

  const target = toSteps(requiredMg);
  const best = new Array<number>(target + 1).fill(Infinity);
  const pick = new Array<Presentation | null>(target + 1).fill(null);
  best[0] = 0;

  for (let i = 1; i <= target; i++) {
    for (const p of pool) {
      // Una presentación más grande que lo restante igual cubre el remanente.
      const prev = Math.max(0, i - toSteps(p.mg));
      const cost = best[prev] + unitPrice(p);
      if (cost < best[i]) {
        best[i] = cost;
        pick[i] = p;
      }
    }
  }

  if (!Number.isFinite(best[target])) return null;

  const counts = new Map<string, PlanLine>();
  let i = target;
  while (i > 0) {
    const p = pick[i];
    if (!p) break;
    const line = counts.get(p.sku);
    if (line) line.qty += 1;
    else counts.set(p.sku, { presentation: p, qty: 1 });
    i = Math.max(0, i - toSteps(p.mg));
  }
  return [...counts.values()].sort((a, b) => b.presentation.mg - a.presentation.mg);
}

/** Plan de 4 semanas para un producto, tipo de presentación y dosis semanal. */
export function planFor(
  product: Product,
  unit: Unit,
  weeklyDoseMg: number
): CyclePlan | null {
  const pool = product.presentations.filter((p) => p.unit === unit);
  const requiredMg = weeklyDoseMg * PRICING.weeksPerCycle;
  const lines = cheapestCombination(pool, requiredMg);
  if (!lines) return null;

  const suppliedMg = lines.reduce((s, l) => s + l.presentation.mg * l.qty, 0);
  const raw = lines.reduce((s, l) => s + unitPrice(l.presentation) * l.qty, 0);
  const cycleTotal = round(raw);

  return {
    weeklyDoseMg,
    requiredMg: Math.round(requiredMg * 100) / 100,
    suppliedMg: Math.round(suppliedMg * 100) / 100,
    lines,
    cycleTotal,
    perDose: Math.round((cycleTotal / PRICING.weeksPerCycle) * 100) / 100,
    unit,
  };
}

/** Todos los planes de un producto para un tipo de presentación. */
export function plansFor(product: Product, unit: Unit): CyclePlan[] {
  return product.weeklyDosesMg
    .map((d) => planFor(product, unit, d))
    .filter((p): p is CyclePlan => p !== null);
}

/**
 * Precio "desde": el ciclo de 4 semanas más barato del producto,
 * que es lo que se muestra en el grid.
 */
export function lowestCyclePrice(product: Product): { price: number; doseMg: number } | null {
  const all: CyclePlan[] = [];
  for (const unit of new Set(product.presentations.map((p) => p.unit))) {
    all.push(...plansFor(product, unit));
  }
  if (all.length === 0) return null;
  const min = all.reduce((a, b) => (b.cycleTotal < a.cycleTotal ? b : a));
  return { price: min.cycleTotal, doseMg: min.weeklyDoseMg };
}

export function formatMg(mg: number): string {
  return `${Number(mg.toFixed(2))} mg`;
}
