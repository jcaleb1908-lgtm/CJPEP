/**
 * Catálogo. Datos tomados del PDF "Catálogo Productos Disponibles".
 * Los precios del PDF son POR PAQUETE (ej. 10 viales). Aquí guardamos el
 * precio del paquete y el tamaño; el precio unitario se deriva.
 *
 * Catalog data. PDF prices are PER PACK (e.g. 10 vials). We store pack price
 * plus pack size and derive the per-unit price.
 */

export type Unit = "vial" | "cartucho";

export interface Presentation {
  /** SKU del catálogo, ej. "TR10" */
  sku: string;
  /** mg de péptido por vial/cartucho */
  mg: number;
  unit: Unit;
  /** unidades por paquete de catálogo */
  packSize: number;
  /** costo del paquete completo en USD, tal como aparece en el PDF */
  packPriceUsd: number;
}

export interface Product {
  id: string;
  /** número de referencia del catálogo, ej. "#087 · P087" */
  ref: string;
  name: string;
  brandNames: string;
  categoryId: CategoryId;
  use: { es: string; en: string };
  audience: { es: string; en: string };
  cadence: { es: string; en: string };
  /** Escalera de dosis semanales ofrecidas, en mg. */
  weeklyDosesMg: number[];
  presentations: Presentation[];
  /** Notas mostradas dentro del modal de selección. */
  notes?: { es: string; en: string };
}

export type CategoryId =
  | "peso"
  | "sexual"
  | "recuperacion"
  | "bienestar"
  | "general";

export interface Category {
  id: CategoryId;
  name: { es: string; en: string };
  blurb: { es: string; en: string };
}

export const CATEGORIES: Category[] = [
  {
    id: "peso",
    name: { es: "Control de peso y estética", en: "Weight control & aesthetics" },
    blurb: {
      es: "Agonistas GLP-1/GIP y compuestos relacionados con control de apetito y salud metabólica.",
      en: "GLP-1/GIP agonists and compounds related to appetite control and metabolic health.",
    },
  },
  {
    id: "sexual",
    name: { es: "Bienestar sexual", en: "Sexual wellness" },
    blurb: {
      es: "Compuestos asociados a deseo y función íntima.",
      en: "Compounds associated with desire and intimate function.",
    },
  },
  {
    id: "recuperacion",
    name: { es: "Recuperación y rendimiento", en: "Recovery & performance" },
    blurb: {
      es: "Reparación de tejido, articulaciones y rendimiento físico.",
      en: "Tissue repair, joints and physical performance.",
    },
  },
  {
    id: "bienestar",
    name: { es: "Bienestar, vitaminas y energía", en: "Wellness, vitamins & energy" },
    blurb: {
      es: "Soporte general, energía y micronutrientes.",
      en: "General support, energy and micronutrients.",
    },
  },
  {
    id: "general",
    name: { es: "Catálogo general", en: "General catalog" },
    blurb: {
      es: "Resto del catálogo disponible bajo pedido.",
      en: "Remainder of the catalog, available on request.",
    },
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "tirzepatide",
    ref: "#087 · P087",
    name: "Tirzepatide",
    brandNames: "Mounjaro® / Zepbound®",
    categoryId: "peso",
    use: {
      es: "Control crónico de peso; según producto, diabetes tipo 2 y apnea obstructiva del sueño con obesidad.",
      en: "Chronic weight management; depending on the product, type 2 diabetes and obstructive sleep apnea with obesity.",
    },
    audience: {
      es: "Adultos interesados en control de peso, apetito, glucosa y salud metabólica.",
      en: "Adults interested in weight, appetite, glucose and metabolic health.",
    },
    cadence: {
      es: "Una vez por semana para los productos inyectables aprobados de referencia.",
      en: "Once weekly for the approved reference injectable products.",
    },
    // Escalera de titulación típica de la referencia aprobada.
    weeklyDosesMg: [2.5, 5, 7.5, 10, 12.5, 15],
    presentations: [
      { sku: "TR5", mg: 5, unit: "vial", packSize: 10, packPriceUsd: 33 },
      { sku: "TR10", mg: 10, unit: "vial", packSize: 10, packPriceUsd: 48 },
      { sku: "TR15", mg: 15, unit: "vial", packSize: 10, packPriceUsd: 65 },
      { sku: "TR20", mg: 20, unit: "vial", packSize: 10, packPriceUsd: 82 },
      { sku: "TR25", mg: 25, unit: "vial", packSize: 10, packPriceUsd: 99 },
      { sku: "TR30", mg: 30, unit: "vial", packSize: 10, packPriceUsd: 116 },
      { sku: "TR40", mg: 40, unit: "vial", packSize: 10, packPriceUsd: 137 },
      { sku: "TR50", mg: 50, unit: "vial", packSize: 10, packPriceUsd: 159 },
      { sku: "TR60", mg: 60, unit: "vial", packSize: 10, packPriceUsd: 178 },
      { sku: "TR70", mg: 70, unit: "vial", packSize: 10, packPriceUsd: 202 },
      { sku: "TR80", mg: 80, unit: "vial", packSize: 10, packPriceUsd: 228 },
      { sku: "TR90", mg: 90, unit: "vial", packSize: 10, packPriceUsd: 245 },
      { sku: "TR100", mg: 100, unit: "vial", packSize: 10, packPriceUsd: 255 },
      { sku: "TR110", mg: 110, unit: "vial", packSize: 10, packPriceUsd: 275 },
      { sku: "TR120", mg: 120, unit: "vial", packSize: 10, packPriceUsd: 293 },
      { sku: "TRK2", mg: 2.5, unit: "cartucho", packSize: 10, packPriceUsd: 167 },
      { sku: "TRK5", mg: 5, unit: "cartucho", packSize: 10, packPriceUsd: 212 },
      { sku: "TRK10", mg: 10, unit: "cartucho", packSize: 10, packPriceUsd: 282 },
      { sku: "TRK15", mg: 15, unit: "cartucho", packSize: 10, packPriceUsd: 353 },
    ],
    notes: {
      es: "Los viales son polvo liofilizado y requieren reconstitución. Los cartuchos vienen pre-dosificados por concentración.",
      en: "Vials are lyophilized powder and require reconstitution. Cartridges come pre-dosed by concentration.",
    },
  },
  {
    id: "semaglutide",
    ref: "#078 · P078",
    name: "Semaglutide",
    brandNames: "Ozempic® / Wegovy®",
    categoryId: "peso",
    use: {
      es: "Control crónico de peso; según producto, diabetes tipo 2 y reducción de riesgo cardiovascular.",
      en: "Chronic weight management; depending on the product, type 2 diabetes and cardiovascular risk reduction.",
    },
    audience: {
      es: "Adultos interesados en control de peso, apetito y glucosa.",
      en: "Adults interested in weight, appetite and glucose control.",
    },
    cadence: {
      es: "Una vez por semana para las presentaciones inyectables aprobadas de referencia.",
      en: "Once weekly for the approved reference injectable presentations.",
    },
    weeklyDosesMg: [0.25, 0.5, 1, 1.7, 2.4],
    presentations: [
      { sku: "SM5", mg: 5, unit: "vial", packSize: 10, packPriceUsd: 42 },
      { sku: "SM10", mg: 10, unit: "vial", packSize: 10, packPriceUsd: 65 },
      { sku: "SM15", mg: 15, unit: "vial", packSize: 10, packPriceUsd: 84 },
      { sku: "SM20", mg: 20, unit: "vial", packSize: 10, packPriceUsd: 106 },
      { sku: "SM30", mg: 30, unit: "vial", packSize: 10, packPriceUsd: 129 },
      { sku: "SM40", mg: 40, unit: "vial", packSize: 10, packPriceUsd: 151 },
      { sku: "SM50", mg: 50, unit: "vial", packSize: 10, packPriceUsd: 167 },
      { sku: "SMK2", mg: 2, unit: "cartucho", packSize: 10, packPriceUsd: 148 },
      { sku: "SMK5", mg: 5, unit: "cartucho", packSize: 10, packPriceUsd: 186 },
    ],
    notes: {
      es: "Los viales son polvo liofilizado y requieren reconstitución. Los cartuchos vienen pre-dosificados por concentración.",
      en: "Vials are lyophilized powder and require reconstitution. Cartridges come pre-dosed by concentration.",
    },
  },
];

export function productsByCategory(categoryId: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Unidades de presentación realmente disponibles para un producto. */
export function unitsFor(product: Product): Unit[] {
  const seen: Unit[] = [];
  for (const p of product.presentations) if (!seen.includes(p.unit)) seen.push(p.unit);
  return seen;
}
