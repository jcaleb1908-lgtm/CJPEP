/** Plantillas HTML + texto plano de los correos. Bilingües. */

import type { ResolvedOrder } from "./orders";
import { formatMg, formatUsd } from "./pricing";
import { formatDate, formatTime, dayName } from "./pickup";
import { BUSINESS, PRICING } from "./config";

const S = {
  es: {
    hiCustomer: (n: string) => `¡Gracias, ${n}!`,
    received: "Recibimos tu orden. Aquí está el resumen.",
    order: "Orden",
    pickup: "Recogido",
    location: "Punto de entrega",
    date: "Fecha",
    time: "Hora",
    items: "Artículos",
    dose: "dosis semanal",
    cycle: "ciclo de 4 semanas",
    cycles: "ciclos de 4 semanas",
    includes: "Incluye",
    total: "Total a pagar en la entrega",
    payNote:
      "No se cobró nada en línea. El pago se realiza en el punto de entrega.",
    notes: "Notas",
    contact: "Contacto",
    questions: (e: string) => `¿Preguntas? Responde a este correo o escríbenos a ${e}.`,
    disclaimer:
      "Material exclusivamente para uso de investigación y laboratorio. No es un medicamento aprobado, no ha sido evaluado por la FDA y no está destinado al diagnóstico, tratamiento, cura ni prevención de enfermedad alguna. No para consumo humano ni veterinario.",
    ownerSubject: (n: string, name: string) => `🧾 Nueva orden ${n} — ${name}`,
    ownerTitle: "Nueva orden para procesar",
    customerSubject: (n: string) => `Tu orden ${n} está confirmada`,
    customerInfo: "Datos del cliente",
    name: "Nombre",
    email: "Correo",
    phone: "Teléfono",
    pickList: "Lista de preparación (viales/cartuchos)",
  },
  en: {
    hiCustomer: (n: string) => `Thank you, ${n}!`,
    received: "We received your order. Here's the summary.",
    order: "Order",
    pickup: "Pickup",
    location: "Pickup point",
    date: "Date",
    time: "Time",
    items: "Items",
    dose: "weekly dose",
    cycle: "4-week cycle",
    cycles: "4-week cycles",
    includes: "Includes",
    total: "Total due at pickup",
    payNote: "Nothing was charged online. Payment happens at the pickup point.",
    notes: "Notes",
    contact: "Contact",
    questions: (e: string) => `Questions? Reply to this email or write to ${e}.`,
    disclaimer:
      "Material strictly for research and laboratory use. Not an approved medicine, not evaluated by the FDA, and not intended to diagnose, treat, cure or prevent any disease. Not for human or veterinary consumption.",
    ownerSubject: (n: string, name: string) => `🧾 New order ${n} — ${name}`,
    ownerTitle: "New order to process",
    customerSubject: (n: string) => `Your order ${n} is confirmed`,
    customerInfo: "Customer details",
    name: "Name",
    email: "Email",
    phone: "Phone",
    pickList: "Pick list (vials/cartridges)",
  },
} as const;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

function unitWord(unit: string, n: number, lang: "es" | "en"): string {
  if (lang === "en") return unit === "vial" ? (n === 1 ? "vial" : "vials") : n === 1 ? "cartridge" : "cartridges";
  return unit === "vial" ? (n === 1 ? "vial" : "viales") : n === 1 ? "cartucho" : "cartuchos";
}

function itemRows(order: ResolvedOrder): string {
  const s = S[order.lang];
  return order.items
    .map((i) => {
      const contents = i.plan.lines
        .map(
          (l) =>
            `${l.qty * i.qty} × ${l.presentation.sku} (${formatMg(l.presentation.mg)} ${unitWord(
              i.unit,
              l.qty * i.qty,
              order.lang
            )})`
        )
        .join(" + ");
      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e2ded4;">
          <div style="font:600 15px/1.3 -apple-system,Segoe UI,sans-serif;color:#101614;">${esc(
            i.productName
          )}</div>
          <div style="font:400 12px/1.5 -apple-system,Segoe UI,sans-serif;color:#6f7b78;margin-top:3px;">
            ${formatMg(i.weeklyDoseMg)} ${s.dose} · ${i.qty} ${
              i.qty === 1 ? s.cycle : s.cycles
            }
          </div>
          <div style="font:400 12px/1.5 -apple-system,Segoe UI,sans-serif;color:#6f7b78;margin-top:3px;">
            <strong>${s.includes}:</strong> ${esc(contents)}
          </div>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #e2ded4;text-align:right;vertical-align:top;font:700 15px/1.3 -apple-system,Segoe UI,sans-serif;color:#0b5044;white-space:nowrap;">
          ${formatUsd(i.lineTotal, order.lang)}
        </td>
      </tr>`;
    })
    .join("");
}

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f4ef;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e2ded4;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 32px 0;">
        <div style="font:700 12px/1 -apple-system,Segoe UI,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#0f6a59;">${esc(
          BUSINESS.name
        )}</div>
        <h1 style="margin:12px 0 0;font:400 26px/1.2 Georgia,serif;color:#101614;">${esc(title)}</h1>
      </td></tr>
      <tr><td style="padding:20px 32px 32px;">${body}</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function infoBlock(order: ResolvedOrder): string {
  const s = S[order.lang];
  return `
  <table role="presentation" width="100%" style="background:#f6f4ef;border-radius:12px;margin:20px 0;">
    <tr><td style="padding:16px 18px;font:400 13px/1.7 -apple-system,Segoe UI,sans-serif;color:#3a4442;">
      <strong style="color:#101614;">${s.pickup}</strong><br>
      ${s.location}: <strong>${esc(order.location.name)}</strong><br>
      ${esc(order.location.address)}<br>
      ${s.date}: <strong>${esc(formatDate(order.date, order.lang))}</strong><br>
      ${s.time}: <strong>${formatTime(order.time)}</strong><br>
      <span style="color:#6f7b78;">${esc(order.location.note[order.lang])}</span>
    </td></tr>
  </table>`;
}

function totalsBlock(order: ResolvedOrder): string {
  const s = S[order.lang];
  return `
  <table role="presentation" width="100%" style="margin-top:8px;">
    <tr>
      <td style="padding:16px 0 0;font:700 15px/1.3 -apple-system,Segoe UI,sans-serif;color:#101614;">${s.total}</td>
      <td style="padding:16px 0 0;text-align:right;font:400 28px/1 Georgia,serif;color:#0b5044;">${formatUsd(
        order.total,
        order.lang
      )}</td>
    </tr>
  </table>
  <p style="margin:8px 0 0;font:400 12px/1.6 -apple-system,Segoe UI,sans-serif;color:#6f7b78;">${s.payNote}</p>`;
}

function footer(order: ResolvedOrder): string {
  const s = S[order.lang];
  return `
  <hr style="border:none;border-top:1px solid #e2ded4;margin:26px 0 16px;">
  <p style="margin:0;font:400 12px/1.6 -apple-system,Segoe UI,sans-serif;color:#6f7b78;">${esc(
    s.questions(BUSINESS.email)
  )}</p>
  <p style="margin:14px 0 0;font:400 11px/1.6 -apple-system,Segoe UI,sans-serif;color:#9aa5a2;">${
    s.disclaimer
  }</p>`;
}

export function customerEmail(order: ResolvedOrder): { subject: string; html: string; text: string } {
  const s = S[order.lang];
  const html = shell(
    s.hiCustomer(order.customer.name.split(" ")[0]),
    `<p style="margin:0 0 4px;font:400 15px/1.6 -apple-system,Segoe UI,sans-serif;color:#3a4442;">${s.received}</p>
     <p style="margin:0;font:400 13px/1.6 -apple-system,Segoe UI,sans-serif;color:#6f7b78;">${s.order}: <strong style="color:#101614;">${esc(
       order.orderNumber
     )}</strong></p>
     ${infoBlock(order)}
     <h2 style="margin:24px 0 4px;font:700 12px/1 -apple-system,Segoe UI,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6f7b78;">${s.items}</h2>
     <table role="presentation" width="100%">${itemRows(order)}</table>
     ${totalsBlock(order)}
     ${order.customer.notes ? `<p style="margin:18px 0 0;font:400 13px/1.6 -apple-system,Segoe UI,sans-serif;color:#3a4442;"><strong>${s.notes}:</strong> ${esc(order.customer.notes)}</p>` : ""}
     ${footer(order)}`
  );

  return { subject: s.customerSubject(order.orderNumber), html, text: plainText(order, false) };
}

export function ownerEmailTemplate(order: ResolvedOrder): {
  subject: string;
  html: string;
  text: string;
} {
  const s = S[order.lang];

  // Lista agregada de viales a preparar, para no tener que sumar a mano.
  const pick = new Map<string, number>();
  for (const i of order.items) {
    for (const l of i.plan.lines) {
      pick.set(l.presentation.sku, (pick.get(l.presentation.sku) ?? 0) + l.qty * i.qty);
    }
  }
  const pickRows = [...pick.entries()]
    .map(
      ([sku, n]) =>
        `<li style="font:400 13px/1.8 -apple-system,Segoe UI,sans-serif;color:#101614;"><strong>${n} ×</strong> ${esc(
          sku
        )}</li>`
    )
    .join("");

  const html = shell(
    s.ownerTitle,
    `<p style="margin:0;font:400 13px/1.6 -apple-system,Segoe UI,sans-serif;color:#6f7b78;">${s.order}: <strong style="color:#101614;">${esc(
      order.orderNumber
    )}</strong></p>
     <table role="presentation" width="100%" style="background:#f6ecdf;border-radius:12px;margin:16px 0;">
       <tr><td style="padding:16px 18px;font:400 13px/1.7 -apple-system,Segoe UI,sans-serif;color:#3a4442;">
         <strong style="color:#101614;">${s.customerInfo}</strong><br>
         ${s.name}: ${esc(order.customer.name)}<br>
         ${s.email}: <a href="mailto:${esc(order.customer.email)}" style="color:#0b5044;">${esc(
           order.customer.email
         )}</a><br>
         ${s.phone}: ${esc(order.customer.phone)}
         ${order.customer.notes ? `<br>${s.notes}: ${esc(order.customer.notes)}` : ""}
       </td></tr>
     </table>
     ${infoBlock(order)}
     <h2 style="margin:24px 0 4px;font:700 12px/1 -apple-system,Segoe UI,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6f7b78;">${s.items}</h2>
     <table role="presentation" width="100%">${itemRows(order)}</table>
     ${totalsBlock(order)}
     <h2 style="margin:26px 0 6px;font:700 12px/1 -apple-system,Segoe UI,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6f7b78;">${s.pickList}</h2>
     <ul style="margin:0;padding-left:20px;">${pickRows}</ul>`
  );

  return {
    subject: s.ownerSubject(order.orderNumber, order.customer.name),
    html,
    text: plainText(order, true),
  };
}

function plainText(order: ResolvedOrder, forOwner: boolean): string {
  const s = S[order.lang];
  const lines: string[] = [];
  lines.push(`${BUSINESS.name}`);
  lines.push(`${s.order}: ${order.orderNumber}`);
  lines.push("");
  if (forOwner) {
    lines.push(`${s.customerInfo}`);
    lines.push(`  ${s.name}: ${order.customer.name}`);
    lines.push(`  ${s.email}: ${order.customer.email}`);
    lines.push(`  ${s.phone}: ${order.customer.phone}`);
    if (order.customer.notes) lines.push(`  ${s.notes}: ${order.customer.notes}`);
    lines.push("");
  }
  lines.push(`${s.pickup}`);
  lines.push(`  ${s.location}: ${order.location.name} — ${order.location.address}`);
  lines.push(
    `  ${s.date}: ${dayName(new Date(order.date + "T12:00:00").getDay(), order.lang)} ${order.date}`
  );
  lines.push(`  ${s.time}: ${formatTime(order.time)}`);
  lines.push("");
  lines.push(`${s.items}`);
  for (const i of order.items) {
    lines.push(
      `  - ${i.productName} · ${formatMg(i.weeklyDoseMg)} ${s.dose} · ${i.qty} ${
        i.qty === 1 ? s.cycle : s.cycles
      } — ${formatUsd(i.lineTotal, order.lang)}`
    );
    lines.push(
      `      ${s.includes}: ${i.plan.lines
        .map((l) => `${l.qty * i.qty}× ${l.presentation.sku} (${formatMg(l.presentation.mg)})`)
        .join(" + ")}`
    );
  }
  lines.push("");
  lines.push(`${s.total}: ${formatUsd(order.total, order.lang)}   (${PRICING.weeksPerCycle} ${
    order.lang === "es" ? "semanas por ciclo" : "weeks per cycle"
  })`);
  lines.push(s.payNote);
  lines.push("");
  lines.push(s.disclaimer);
  return lines.join("\n");
}

export function contactEmailTemplate(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: "es" | "en";
}): { subject: string; html: string; text: string } {
  const title = input.lang === "es" ? "Nueva pregunta del sitio" : "New question from the site";
  const html = shell(
    title,
    `<table role="presentation" width="100%" style="background:#f6f4ef;border-radius:12px;">
      <tr><td style="padding:16px 18px;font:400 13px/1.7 -apple-system,Segoe UI,sans-serif;color:#3a4442;">
        ${input.lang === "es" ? "Nombre" : "Name"}: <strong>${esc(input.name)}</strong><br>
        ${input.lang === "es" ? "Correo" : "Email"}: <a href="mailto:${esc(
          input.email
        )}" style="color:#0b5044;">${esc(input.email)}</a><br>
        ${input.lang === "es" ? "Asunto" : "Subject"}: ${esc(input.subject)}
      </td></tr></table>
     <p style="margin:20px 0 0;font:400 14px/1.7 -apple-system,Segoe UI,sans-serif;color:#101614;white-space:pre-wrap;">${esc(
       input.message
     )}</p>`
  );
  return {
    subject: `💬 ${input.subject} — ${input.name}`,
    html,
    text: `${input.name} <${input.email}>\n${input.subject}\n\n${input.message}`,
  };
}
