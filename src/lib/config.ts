/**
 * Ajustes de negocio. Todo lo que probablemente quieras cambiar vive aquí.
 * Business knobs. Everything you'll likely want to tweak lives here.
 */

export const BUSINESS = {
  name: "CJ Peptides PR",
  tagline_es: "Péptidos de investigación · Puerto Rico",
  tagline_en: "Research peptides · Puerto Rico",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "CJpeptidesPR@gmail.com",
  facebook: "https://facebook.com/CJpeptidesPR",
  instagram: "https://instagram.com/cjpeptidespr",
  currency: "USD",
} as const;

export const PRICING = {
  /**
   * Margen sobre el costo de catálogo. 1.0 = vender al costo del catálogo.
   * 1.6 = 60% de margen. Cambia este número y TODOS los precios del sitio
   * se recalculan (grid, modal, carrito, correos).
   *
   * Markup over catalog cost. 1.0 = sell at catalog cost, 1.6 = 60% margin.
   * Change this one number and every price on the site recalculates.
   */
  markup: 1.0,

  /** El sitio entero cotiza ciclos de 4 semanas. / The whole site quotes 4-week cycles. */
  weeksPerCycle: 4,

  /** Redondeo del precio final mostrado. "none" | "up1" (al dólar) | "up5" (a $5) */
  rounding: "up1" as "none" | "up1" | "up5",
} as const;
