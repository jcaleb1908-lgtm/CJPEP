/**
 * Resolución y validación de órdenes en el servidor.
 * El cliente sólo manda SELECCIONES; los precios se recalculan aquí
 * desde el catálogo, para que nadie pueda inventar un total.
 */

import { getProduct, type Unit } from "./catalog";
import { planFor, round, type CyclePlan } from "./pricing";
import { getLocation, isValidPickup, type PickupLocation } from "./pickup";
import type { Lang } from "./i18n-types";

export interface OrderItemInput {
  productId: string;
  unit: Unit;
  weeklyDoseMg: number;
  qty: number;
}

export interface OrderInput {
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  pickup: { locationId: string; date: string; time: string };
  items: OrderItemInput[];
  lang: Lang;
}

export interface ResolvedOrderItem {
  productId: string;
  productName: string;
  unit: Unit;
  weeklyDoseMg: number;
  qty: number;
  plan: CyclePlan;
  lineTotal: number;
}

export interface ResolvedOrder {
  orderNumber: string;
  customer: OrderInput["customer"];
  location: PickupLocation;
  date: string;
  time: string;
  items: ResolvedOrderItem[];
  total: number;
  lang: Lang;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[\d\s()+.-]{7,20}$/;

export class OrderError extends Error {}

function str(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Parsea y valida el cuerpo crudo de la petición. */
export function parseOrder(body: unknown): OrderInput {
  if (typeof body !== "object" || body === null) throw new OrderError("invalid body");
  const b = body as Record<string, unknown>;

  const c = (b.customer ?? {}) as Record<string, unknown>;
  const customer = {
    name: str(c.name, 120),
    email: str(c.email, 160).toLowerCase(),
    phone: str(c.phone, 40),
    notes: str(c.notes, 800),
  };
  if (!customer.name) throw new OrderError("name required");
  if (!EMAIL_RE.test(customer.email)) throw new OrderError("invalid email");
  if (!PHONE_RE.test(customer.phone)) throw new OrderError("invalid phone");

  const p = (b.pickup ?? {}) as Record<string, unknown>;
  const pickup = {
    locationId: str(p.locationId, 60),
    date: str(p.date, 10),
    time: str(p.time, 5),
  };
  if (!isValidPickup(pickup.locationId, pickup.date, pickup.time)) {
    throw new OrderError("invalid pickup slot");
  }

  const rawItems = Array.isArray(b.items) ? b.items : [];
  if (rawItems.length === 0) throw new OrderError("empty cart");
  if (rawItems.length > 30) throw new OrderError("too many items");

  const items: OrderItemInput[] = rawItems.map((raw) => {
    const i = (raw ?? {}) as Record<string, unknown>;
    const unit = i.unit === "cartucho" ? "cartucho" : "vial";
    return {
      productId: str(i.productId, 60),
      unit,
      weeklyDoseMg: Number(i.weeklyDoseMg),
      qty: Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1))),
    };
  });

  const lang: Lang = b.lang === "en" ? "en" : "es";
  return { customer, pickup, items, lang };
}

/** Recalcula precios y produce la orden final. */
export function resolveOrder(input: OrderInput, orderNumber: string): ResolvedOrder {
  const location = getLocation(input.pickup.locationId);
  if (!location) throw new OrderError("unknown pickup location");

  const items: ResolvedOrderItem[] = [];
  for (const i of input.items) {
    const product = getProduct(i.productId);
    if (!product) throw new OrderError(`unknown product: ${i.productId}`);
    if (!product.weeklyDosesMg.includes(i.weeklyDoseMg)) {
      throw new OrderError(`unknown dose for ${product.name}`);
    }
    const plan = planFor(product, i.unit, i.weeklyDoseMg);
    if (!plan) throw new OrderError(`no plan for ${product.name}`);
    items.push({
      productId: product.id,
      productName: product.name,
      unit: i.unit,
      weeklyDoseMg: i.weeklyDoseMg,
      qty: i.qty,
      plan,
      lineTotal: plan.cycleTotal * i.qty,
    });
  }

  return {
    orderNumber,
    customer: input.customer,
    location,
    date: input.pickup.date,
    time: input.pickup.time,
    items,
    total: round(items.reduce((s, i) => s + i.lineTotal, 0)),
    lang: input.lang,
  };
}

/** Identificador legible: NP-260819-4F2A */
export function makeOrderNumber(now = new Date()): string {
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NP-${y}${m}${d}-${rand}`;
}
