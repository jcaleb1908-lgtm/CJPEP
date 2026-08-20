"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { BUSINESS } from "@/lib/config";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactPage() {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch {
      setStatus("error");
    }
  }

  const socials = [
    { label: "Instagram", href: BUSINESS.instagram, handle: "@" + BUSINESS.instagram.split("/").pop() },
    { label: "Facebook", href: BUSINESS.facebook, handle: BUSINESS.facebook.split("/").pop() },
  ];

  return (
    <div className="container-page py-16 md:py-20">
      <header className="max-w-2xl fade-up">
        <p className="eyebrow">{t("nav.contact")}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{t("contact.title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          {t("contact.lede")}
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {t("contact.email")}
            </h2>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="mt-2 block break-all text-lg font-semibold text-brand-700 hover:underline"
            >
              {BUSINESS.email}
            </a>
          </div>

          <div className="card p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {t("contact.social")}
            </h2>
            <ul className="mt-3 space-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-sm border border-line px-4 py-3 text-sm font-medium transition-colors hover:border-brand-300 hover:bg-bone"
                  >
                    <span>{s.label}</span>
                    <span className="text-xs text-muted">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card p-7">
          <h2 className="display text-2xl">{t("contact.formTitle")}</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-name">
                {t("contact.name")}
              </label>
              <input
                id="c-name"
                className="field"
                required
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label" htmlFor="c-email">
                {t("contact.yourEmail")}
              </label>
              <input
                id="c-email"
                type="email"
                className="field"
                required
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="c-subject">
              {t("contact.subject")}
            </label>
            <input
              id="c-subject"
              className="field"
              required
              value={form.subject}
              onChange={set("subject")}
            />
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="c-message">
              {t("contact.message")}
            </label>
            <textarea
              id="c-message"
              className="field min-h-36 resize-y"
              required
              minLength={5}
              value={form.message}
              onChange={set("message")}
            />
          </div>

          {/* Honeypot anti-spam: invisible para personas. */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label htmlFor="c-website">Website</label>
            <input
              id="c-website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={set("website")}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={status === "sending"} className="btn btn-primary">
              {status === "sending" ? t("contact.sending") : t("contact.send")}
            </button>
            {status === "ok" && (
              <p className="text-sm font-medium text-brand-700">
                {t("contact.ok")}
              </p>
            )}
            {status === "error" && (
              <p className="text-sm font-medium text-[#b3261e]">{t("contact.err")}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
