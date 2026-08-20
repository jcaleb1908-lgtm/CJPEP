"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatMg, formatUsd } from "@/lib/pricing";
import { PRICING } from "@/lib/config";
import {
  PICKUP_LOCATIONS,
  availableDates,
  formatDate,
  formatTime,
  getLocation,
} from "@/lib/pickup";

type Status = "idle" | "sending" | "ok" | "error";

export default function CheckoutPage() {
  const { t, lang, pick } = useI18n();
  const { resolved, total, items, clear } = useCart();

  const [locationId, setLocationId] = useState(PICKUP_LOCATIONS[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", notes: "" });
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [emailWarning, setEmailWarning] = useState(false);

  const location = getLocation(locationId)!;
  const dates = useMemo(() => availableDates(location), [location]);

  const set = (k: keyof typeof customer) => (e: { target: { value: string } }) =>
    setCustomer((c) => ({ ...c, [k]: e.target.value }));

  const ready =
    resolved.length > 0 &&
    Boolean(date) &&
    Boolean(time) &&
    customer.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(customer.email) &&
    customer.phone.trim().length >= 7 &&
    agree;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          pickup: { locationId, date, time },
          items,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "failed");
      setOrderNumber(data.orderNumber);
      setEmailWarning(Boolean(data.emailWarning));
      setStatus("ok");
      clear();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-10 text-center fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                stroke="var(--color-brand-600)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="display mt-5 text-3xl">{t("checkout.okTitle")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t("checkout.okBody")}
          </p>
          <p className="mt-5 inline-block rounded-full bg-bone-dim px-4 py-2 text-sm font-bold tracking-wide">
            {t("checkout.orderNo")}: {orderNumber}
          </p>
          {emailWarning && (
            <p className="mt-4 rounded-md bg-copper-soft p-3 text-xs leading-relaxed text-ink-soft">
              {t("checkout.emailWarning")}
            </p>
          )}
          <div className="mt-7">
            <Link href="/productos" className="btn btn-primary">
              {t("checkout.okBack")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="display text-3xl">{t("cart.empty")}</h1>
        <Link href="/productos" className="btn btn-primary">
          {t("cart.emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-16 md:py-20">
      <header className="max-w-2xl fade-up">
        <p className="eyebrow">{t("checkout.title")}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{t("checkout.title")}</h1>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">
          {t("checkout.lede")}
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {/* Recogido */}
          <section className="card p-7">
            <h2 className="display text-2xl">{t("checkout.pickup")}</h2>

            <fieldset className="mt-5">
              <legend className="label">{t("checkout.location")}</legend>
              <div className="space-y-2">
                {PICKUP_LOCATIONS.map((loc) => (
                  <label
                    key={loc.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3.5 transition-all ${
                      locationId === loc.id
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : "border-line hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="location"
                      value={loc.id}
                      checked={locationId === loc.id}
                      onChange={() => {
                        setLocationId(loc.id);
                        setDate("");
                        setTime("");
                      }}
                      className="mt-1 accent-brand-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{loc.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {loc.address}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {pick(loc.note)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ck-date">
                  {t("checkout.date")}
                </label>
                <select
                  id="ck-date"
                  className="field"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  <option value="">{t("checkout.pickDate")}</option>
                  {dates.map((d) => (
                    <option key={d.value} value={d.value}>
                      {formatDate(d.value, lang)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="ck-time">
                  {t("checkout.time")}
                </label>
                <select
                  id="ck-time"
                  className="field"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="">{t("checkout.pickTime")}</option>
                  {location.slots.map((s) => (
                    <option key={s} value={s}>
                      {formatTime(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Datos del cliente */}
          <section className="card p-7">
            <h2 className="display text-2xl">{t("checkout.yourInfo")}</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ck-name">
                  {t("checkout.name")}
                </label>
                <input
                  id="ck-name"
                  className="field"
                  required
                  autoComplete="name"
                  value={customer.name}
                  onChange={set("name")}
                />
              </div>
              <div>
                <label className="label" htmlFor="ck-phone">
                  {t("checkout.phone")}
                </label>
                <input
                  id="ck-phone"
                  className="field"
                  required
                  type="tel"
                  autoComplete="tel"
                  placeholder="787-000-0000"
                  value={customer.phone}
                  onChange={set("phone")}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label" htmlFor="ck-email">
                {t("checkout.email")}
              </label>
              <input
                id="ck-email"
                className="field"
                required
                type="email"
                autoComplete="email"
                value={customer.email}
                onChange={set("email")}
              />
            </div>

            <div className="mt-4">
              <label className="label" htmlFor="ck-notes">
                {t("checkout.notes")}
              </label>
              <textarea
                id="ck-notes"
                className="field min-h-24 resize-y"
                value={customer.notes}
                onChange={set("notes")}
              />
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                required
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 accent-brand-600"
              />
              <span>{t("checkout.agree")}</span>
            </label>
          </section>
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-7">
            <h2 className="display text-2xl">{t("checkout.yourOrder")}</h2>

            <ul className="mt-5 divide-y divide-line">
              {resolved.map((i) => (
                <li key={i.key} className="flex items-start justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{i.productName}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatMg(i.weeklyDoseMg)} / {lang === "es" ? "semana" : "week"} ·{" "}
                      {i.qty} × {PRICING.weeksPerCycle} {lang === "es" ? "semanas" : "weeks"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-brand-700">
                    {formatUsd(i.lineTotal, lang)}
                  </span>
                </li>
              ))}
            </ul>

            {date && time && (
              <div className="mt-4 rounded-md bg-bone p-4 text-xs leading-relaxed text-ink-soft">
                <p className="font-semibold">{location.name}</p>
                <p className="mt-0.5">{formatDate(date, lang)}</p>
                <p>{formatTime(time)}</p>
              </div>
            )}

            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-sm font-semibold">{t("cart.total")}</span>
              <span className="display text-3xl text-brand-700">
                {formatUsd(total, lang)}
              </span>
            </div>

            <button
              type="submit"
              disabled={!ready || status === "sending"}
              className="btn btn-primary mt-5 w-full"
            >
              {status === "sending" ? t("checkout.submitting") : t("checkout.submit")}
            </button>

            {status === "error" && (
              <p className="mt-3 text-sm font-medium text-[#b3261e]">
                {t("checkout.err")} {errorMsg && <span className="opacity-70">({errorMsg})</span>}
              </p>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}
