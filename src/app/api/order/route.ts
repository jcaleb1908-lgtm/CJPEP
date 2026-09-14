import { NextResponse } from "next/server";
import {
  makeOrderNumber,
  OrderError,
  parseOrder,
  resolveOrder,
  type ResolvedOrder,
} from "@/lib/orders";
import { customerEmail, ownerEmailTemplate } from "@/lib/email-templates";
import { ownerEmail, sendMail } from "@/lib/mailer";
import { dbEnabled, getDb } from "@/lib/db";
import { PRICING } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1 · Validar y recalcular precios desde el catálogo (nunca se confía en el
  //     cliente: podría mandar un total inventado).
  let order: ResolvedOrder;
  try {
    const body = await request.json();
    const input = parseOrder(body);
    order = resolveOrder(input, makeOrderNumber());
  } catch (err) {
    const message = err instanceof OrderError ? err.message : "bad request";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  // 2 · Guardar en la base de datos ANTES de enviar correo. Si el correo falla,
  //     la orden ya está registrada y aparece en /admin.
  //     Sin DATABASE_URL corremos en modo sólo-correo (ver src/lib/db.ts).
  const db = getDb();
  if (!db) {
    console.warn(
      `Sin DATABASE_URL: la orden ${order.orderNumber} sólo existirá como correo.`
    );
  } else {
    try {
      await db.order.create({
        data: {
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone,
          notes: order.customer.notes || null,
          locationId: order.location.id,
          locationName: order.location.name,
          pickupDate: order.date,
          pickupTime: order.time,
          total: order.total,
          markup: PRICING.markup,
          lang: order.lang,
          items: {
            create: order.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              unit: i.unit,
              weeklyDoseMg: i.weeklyDoseMg,
              qty: i.qty,
              cyclePrice: i.plan.cycleTotal,
              lineTotal: i.lineTotal,
              suppliedMg: i.plan.suppliedMg,
              contents: JSON.stringify(
                i.plan.lines.map((l) => ({
                  sku: l.presentation.sku,
                  mg: l.presentation.mg,
                  qty: l.qty * i.qty,
                }))
              ),
            })),
          },
        },
      });
    } catch (err) {
      // La BD está configurada pero falló: es un error real, no seguimos.
      console.error("No se pudo guardar la orden", order.orderNumber, err);
      return NextResponse.json({ ok: false, error: "db_failed" }, { status: 500 });
    }
  }

  // 3 · Enviar los correos. Un fallo aquí NO invalida la orden.
  const owner = ownerEmail();
  let emailedOwner = false;
  let emailedCustomer = false;

  if (owner) {
    const mail = ownerEmailTemplate(order);
    try {
      await sendMail({
        to: owner,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: order.customer.email,
      });
      emailedOwner = true;
    } catch (err) {
      console.error("Falló el correo al dueño", order.orderNumber, err);
    }
  } else {
    console.warn("OWNER_EMAIL no está configurado: la orden no se copió al dueño.");
  }

  const mail = customerEmail(order);
  try {
    await sendMail({
      to: order.customer.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: owner || undefined,
    });
    emailedCustomer = true;
  } catch (err) {
    console.error("Falló el correo al cliente", order.orderNumber, err);
  }

  if (db) {
    await db.order
      .update({
        where: { orderNumber: order.orderNumber },
        data: { emailedOwner, emailedCustomer },
      })
      .catch((err) => console.error("No se pudo marcar el envío de correos", err));
  }

  return NextResponse.json({
    ok: true,
    orderNumber: order.orderNumber,
    total: order.total,
    // El cliente muestra un aviso suave si su confirmación no salió.
    emailWarning: !emailedCustomer,
    stored: dbEnabled(),
  });
}
