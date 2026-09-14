import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Autenticación mínima del panel: una contraseña compartida y una cookie
 * httpOnly firmada con HMAC. Suficiente para un panel de una sola persona;
 * si algún día entran varios usuarios, cámbialo por auth real.
 */

const COOKIE = "np_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET no está configurado (mínimo 16 caracteres)");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 16
  );
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function makeToken(now = Date.now()): string {
  const expires = now + MAX_AGE_SECONDS * 1000;
  return `${expires}.${sign(String(expires))}`;
}

export function verifyToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expiresRaw, mac] = token.split(".");
  if (!expiresRaw || !mac) return false;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < now) return false;
  try {
    return safeEqual(mac, sign(expiresRaw));
  } catch {
    return false;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
