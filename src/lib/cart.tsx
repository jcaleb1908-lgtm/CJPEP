"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Unit } from "./catalog";
import { planFor, type CyclePlan } from "./pricing";

/**
 * Guardamos sólo la SELECCIÓN, nunca el precio. El precio se recalcula
 * en cada render desde el catálogo, así un carrito viejo en localStorage
 * nunca cotiza un precio obsoleto.
 */
export interface CartItem {
  productId: string;
  unit: Unit;
  weeklyDoseMg: number;
  /** cantidad de ciclos de 4 semanas */
  qty: number;
}

export interface ResolvedItem extends CartItem {
  key: string;
  productName: string;
  plan: CyclePlan;
  lineTotal: number;
}

interface CartValue {
  items: CartItem[];
  resolved: ResolvedItem[];
  count: number;
  total: number;
  add: (item: CartItem) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "np.cart.v1";

export function itemKey(i: CartItem): string {
  return `${i.productId}:${i.unit}:${i.weeklyDoseMg}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      // carrito corrupto: empezamos limpio
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const k = itemKey(item);
      const existing = prev.find((p) => itemKey(p) === k);
      if (existing) {
        return prev.map((p) =>
          itemKey(p) === k ? { ...p, qty: Math.min(99, p.qty + item.qty) } : p
        );
      }
      return [...prev, item];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => itemKey(p) !== key)
        : prev.map((p) => (itemKey(p) === key ? { ...p, qty: Math.min(99, qty) } : p))
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((p) => itemKey(p) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const resolved = useMemo<ResolvedItem[]>(() => {
    const out: ResolvedItem[] = [];
    for (const i of items) {
      const product = getProduct(i.productId);
      if (!product) continue; // producto retirado del catálogo
      const plan = planFor(product, i.unit, i.weeklyDoseMg);
      if (!plan) continue;
      out.push({
        ...i,
        key: itemKey(i),
        productName: product.name,
        plan,
        lineTotal: plan.cycleTotal * i.qty,
      });
    }
    return out;
  }, [items]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      resolved,
      count: resolved.reduce((s, i) => s + i.qty, 0),
      total: resolved.reduce((s, i) => s + i.lineTotal, 0),
      add,
      setQty,
      remove,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [items, resolved, add, setQty, remove, clear, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
