import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/** Marca una pregunta como atendida (o la reabre). */
export async function PATCH(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let id = "";
  let handled = true;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    id = typeof body.id === "string" ? body.id : "";
    handled = body.handled !== false;
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!id) return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });

  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "no database" }, { status: 503 });
  }

  try {
    await db.contactMessage.update({ where: { id }, data: { handled } });
  } catch {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
