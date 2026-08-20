import { NextResponse } from "next/server";
import { contactEmailTemplate } from "@/lib/email-templates";
import { ownerEmail, sendMail } from "@/lib/mailer";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: "es" | "en";
  /** Honeypot: los bots rellenan campos ocultos, las personas no. */
  website: string;
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    const b = (await request.json()) as Record<string, unknown>;
    payload = {
      name: str(b.name, 120),
      email: str(b.email, 160).toLowerCase(),
      subject: str(b.subject, 160) || "Pregunta",
      message: str(b.message, 2000),
      lang: b.lang === "en" ? "en" : "es",
      website: str(b.website, 100),
    };
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  if (payload.website) return NextResponse.json({ ok: true }); // bot: fingimos éxito
  if (!payload.name || !EMAIL_RE.test(payload.email) || payload.message.length < 5) {
    return NextResponse.json({ ok: false, error: "invalid fields" }, { status: 400 });
  }

  // Se guarda primero: aunque el correo falle, la pregunta queda en /admin.
  // Sin DATABASE_URL seguimos igual, sólo que no queda registro.
  const db = getDb();
  let savedId: string | null = null;
  if (db) {
    try {
      const saved = await db.contactMessage.create({
        data: {
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          lang: payload.lang,
        },
      });
      savedId = saved.id;
    } catch (err) {
      console.error("No se pudo guardar la pregunta de contacto", err);
      return NextResponse.json({ ok: false, error: "db_failed" }, { status: 500 });
    }
  }

  const owner = ownerEmail();
  if (!owner) {
    console.warn("OWNER_EMAIL no está configurado: la pregunta sólo quedó en /admin.");
    return NextResponse.json({ ok: true });
  }

  const mail = contactEmailTemplate(payload);
  try {
    await sendMail({
      to: owner,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: payload.email,
    });
    if (db && savedId) {
      await db.contactMessage.update({ where: { id: savedId }, data: { emailed: true } });
    }
  } catch (err) {
    console.error("Fallo al enviar la pregunta de contacto", err);
  }

  return NextResponse.json({ ok: true });
}
