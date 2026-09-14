import { PrismaClient } from "@prisma/client";

/**
 * Acceso a la base de datos — OPCIONAL a propósito.
 *
 * Sin `DATABASE_URL` el sitio corre en "modo sin base de datos": las órdenes
 * se procesan y se envían por correo igual, sólo que no quedan guardadas.
 * Eso permite desplegar una prueba en Netlify (cuyo sistema de archivos es de
 * sólo lectura, así que SQLite no funciona allí) sin montar un Postgres antes.
 *
 * Con `DATABASE_URL` puesto, todo se guarda y /admin funciona.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function dbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Devuelve el cliente, o null si no hay base de datos configurada. */
export function getDb(): PrismaClient | null {
  if (!dbEnabled()) return null;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// SQLite en un servidor serverless (Netlify, Vercel) vive en un disco efímero y
// de sólo lectura: las escrituras fallan y las órdenes se perderían.
if (
  process.env.NODE_ENV === "production" &&
  (process.env.DATABASE_URL ?? "").startsWith("file:")
) {
  console.warn(
    "\n⚠️  ATENCIÓN: producción con SQLite (DATABASE_URL=file:…).\n" +
      "   En Netlify/Vercel el disco es efímero y de sólo lectura: las órdenes\n" +
      "   fallarán o se perderán. Usa PostgreSQL, o quita DATABASE_URL para\n" +
      "   correr en modo sin base de datos (sólo correo). Ver README.\n"
  );
}

export { ORDER_STATUSES, type OrderStatus } from "./order-status";
