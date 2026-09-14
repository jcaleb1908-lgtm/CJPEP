"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/lib/pricing";
import { formatDate, formatTime } from "@/lib/pickup";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

interface Item {
  id: string;
  productName: string;
  unit: string;
  weeklyDoseMg: number;
  qty: number;
  cyclePrice: number;
  lineTotal: number;
  suppliedMg: number;
  contents: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
  locationName: string;
  pickupDate: string;
  pickupTime: string;
  total: number;
  emailedOwner: boolean;
  emailedCustomer: boolean;
  createdAt: string;
  items: Item[];
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDIENTE: "bg-copper-soft text-copper",
  PREPARADA: "bg-brand-50 text-brand-700",
  ENTREGADA: "bg-bone-dim text-muted",
  CANCELADA: "bg-[#fbe9e7] text-[#b3261e]",
};

export default function AdminDashboard({
  orders,
  messages,
}: {
  orders: AdminOrder[];
  messages: AdminMessage[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"ordenes" | "preguntas">("ordenes");
  const [filter, setFilter] = useState<"TODAS" | OrderStatus>("PENDIENTE");
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "TODAS" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { TODAS: orders.length };
    for (const s of ORDER_STATUSES) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  // Lista de preparación agregada de todas las órdenes visibles: qué viales
  // hay que sacar en total, sin sumarlos a mano.
  const pickList = useMemo(() => {
    const acc = new Map<string, number>();
    for (const o of visible) {
      if (o.status === "CANCELADA" || o.status === "ENTREGADA") continue;
      for (const i of o.items) {
        try {
          for (const c of JSON.parse(i.contents) as { sku: string; qty: number }[]) {
            acc.set(c.sku, (acc.get(c.sku) ?? 0) + c.qty);
          }
        } catch {
          // contenido corrupto: lo saltamos en vez de romper el panel
        }
      }
    }
    return [...acc.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const revenue = visible
    .filter((o) => o.status !== "CANCELADA")
    .reduce((s, o) => s + o.total, 0);

  async function setStatus(orderNumber: string, status: OrderStatus) {
    setBusyId(orderNumber);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, status }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function setHandled(id: string, handled: boolean) {
    setBusyId(id);
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handled }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const pendingMessages = messages.filter((m) => !m.handled).length;

  return (
    <div className="container-page py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Panel</p>
          <h1 className="display mt-2 text-4xl">Órdenes</h1>
        </div>
        <button type="button" onClick={logout} className="btn btn-ghost">
          Cerrar sesión
        </button>
      </header>

      <div className="mt-8 inline-flex rounded-full bg-bone-dim p-1">
        {(["ordenes", "preguntas"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === k ? "bg-surface text-brand-700 shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {k === "ordenes" ? "Órdenes" : "Preguntas"}
            {k === "preguntas" && pendingMessages > 0 && (
              <span className="ml-2 rounded-full bg-copper px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingMessages}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "ordenes" ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {(["TODAS", ...ORDER_STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === s
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-line text-muted hover:border-brand-300"
                }`}
              >
                {s} <span className="opacity-60">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>

          {pickList.length > 0 && (
            <section className="card mt-6 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Lista de preparación · {filter.toLowerCase()}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {pickList.map(([sku, n]) => (
                  <span
                    key={sku}
                    className="rounded-full bg-bone px-3 py-1.5 text-sm font-semibold tabular-nums"
                  >
                    {n}× <span className="text-brand-700">{sku}</span>
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted">
                Valor de las órdenes mostradas:{" "}
                <strong className="text-brand-700">{formatUsd(revenue)}</strong>
              </p>
            </section>
          )}

          {visible.length === 0 ? (
            <p className="mt-10 text-sm text-muted">No hay órdenes en este filtro.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {visible.map((o) => (
                <li key={o.id} className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold">{o.orderNumber}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            STATUS_STYLE[o.status] ?? "bg-bone-dim text-muted"
                          }`}
                        >
                          {o.status}
                        </span>
                        {(!o.emailedOwner || !o.emailedCustomer) && (
                          <span className="rounded-full bg-[#fbe9e7] px-2.5 py-0.5 text-[11px] font-bold text-[#b3261e]">
                            correo no enviado
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-base font-semibold">{o.customerName}</p>
                      <p className="text-xs text-muted">
                        <a href={`mailto:${o.customerEmail}`} className="hover:text-brand-700">
                          {o.customerEmail}
                        </a>{" "}
                        ·{" "}
                        <a href={`tel:${o.customerPhone}`} className="hover:text-brand-700">
                          {o.customerPhone}
                        </a>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="display text-2xl text-brand-700">{formatUsd(o.total)}</p>
                      <p className="text-xs text-muted">
                        {new Date(o.createdAt).toLocaleString("es-PR")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md bg-bone p-4 text-sm">
                    <p className="font-semibold">{o.locationName}</p>
                    <p className="text-xs text-ink-soft">
                      {formatDate(o.pickupDate)} · {formatTime(o.pickupTime)}
                    </p>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {o.items.map((i) => {
                      let contents = "";
                      try {
                        contents = (
                          JSON.parse(i.contents) as { sku: string; qty: number }[]
                        )
                          .map((c) => `${c.qty}× ${c.sku}`)
                          .join(" + ");
                      } catch {
                        contents = "—";
                      }
                      return (
                        <li
                          key={i.id}
                          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2 text-sm last:border-0"
                        >
                          <span>
                            <strong>{i.productName}</strong>{" "}
                            <span className="text-muted">
                              {i.weeklyDoseMg} mg/sem · {i.unit} · {i.qty} ciclo
                              {i.qty === 1 ? "" : "s"}
                            </span>
                            <span className="ml-2 font-mono text-xs text-brand-700">
                              {contents}
                            </span>
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatUsd(i.lineTotal)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {o.notes && (
                    <p className="mt-3 rounded-md bg-copper-soft p-3 text-xs text-ink-soft">
                      <strong>Nota del cliente:</strong> {o.notes}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {ORDER_STATUSES.filter((s) => s !== o.status).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busyId === o.orderNumber}
                        onClick={() => setStatus(o.orderNumber, s)}
                        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
                      >
                        → {s}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className="mt-6 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted">No hay preguntas todavía.</p>
          )}
          {messages.map((m) => (
            <li key={m.id} className={`card p-6 ${m.handled ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.subject}</p>
                  <p className="text-xs text-muted">
                    {m.name} ·{" "}
                    <a href={`mailto:${m.email}`} className="hover:text-brand-700">
                      {m.email}
                    </a>
                  </p>
                </div>
                <p className="text-xs text-muted">
                  {new Date(m.createdAt).toLocaleString("es-PR")}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="btn btn-ghost text-xs">
                  Responder
                </a>
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => setHandled(m.id, !m.handled)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand-500 hover:text-brand-700 disabled:opacity-40"
                >
                  {m.handled ? "Reabrir" : "Marcar atendida"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
