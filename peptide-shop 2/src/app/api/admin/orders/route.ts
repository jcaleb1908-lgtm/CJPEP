import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export const runtime = "nodejs";

/** Cambia el estado de una orden. */
export async function PATCH(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let orderNumber = "";
  let status = "";
  try {
    const body = (await request.json()) as Record<string, unknown>;
    orderNumber = typeof body.orderNumber === "string" ? body.orderNumber : "";
    status = typeof body.status === "string" ? body.status : "";
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  if (!orderNumber || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ ok: false, error: "invalid status" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "no database" }, { status: 503 });
  }

  try {
    await db.order.update({ where: { orderNumber }, data: { status } });
  } catch {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
