/**
 * Estados de una orden. Vive aparte de db.ts para que los componentes de
 * cliente puedan importarlo sin arrastrar Prisma al bundle del navegador.
 */
export type OrderStatus = "PENDIENTE" | "PREPARADA" | "ENTREGADA" | "CANCELADA";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDIENTE",
  "PREPARADA",
  "ENTREGADA",
  "CANCELADA",
];
