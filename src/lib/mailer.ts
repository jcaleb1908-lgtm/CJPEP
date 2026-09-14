/**
 * Envío de correo con dos proveedores intercambiables:
 *  1. Resend  — si existe RESEND_API_KEY (recomendado en producción)
 *  2. SMTP    — si existen SMTP_HOST/SMTP_USER/SMTP_PASS (ej. Gmail app password)
 *  3. Consola — fallback en desarrollo: imprime el correo en la terminal.
 */

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type MailProvider = "resend" | "smtp" | "console";

export function activeProvider(): MailProvider {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  return "console";
}

function fromAddress(): string {
  return process.env.MAIL_FROM ?? "Pedidos <onboarding@resend.dev>";
}

export async function sendMail(mail: Mail): Promise<void> {
  const provider = activeProvider();

  if (provider === "resend") {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }

  if (provider === "smtp") {
    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });
    await transport.sendMail({
      from: fromAddress(),
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
    });
    return;
  }

  // Desarrollo: sin credenciales configuradas.
  console.log(
    `\n──────── ✉️  EMAIL (modo consola — configura RESEND_API_KEY o SMTP_*) ────────\n` +
      `Para:    ${mail.to}\n` +
      `Asunto:  ${mail.subject}\n\n${mail.text}\n` +
      `──────────────────────────────────────────────────────────────────────────\n`
  );
}

/** Dirección del dueño de la tienda, a donde llega copia de cada orden. */
export function ownerEmail(): string {
  return process.env.OWNER_EMAIL ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
}
