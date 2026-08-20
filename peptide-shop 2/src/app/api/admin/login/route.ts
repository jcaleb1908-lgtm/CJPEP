import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  checkPassword,
  isAdminConfigured,
  makeToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

/** Retraso fijo para que un atacante no pueda medir intentos. */
const DELAY_MS = 400;

export async function POST(request: Request) {
  await new Promise((r) => setTimeout(r, DELAY_MS));

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Falta ADMIN_PASSWORD o ADMIN_SESSION_SECRET en .env.local" },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as Record<string, unknown>;
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
