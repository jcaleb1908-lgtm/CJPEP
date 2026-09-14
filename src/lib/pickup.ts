/**
 * Puntos de entrega, días y horarios.
 * Para añadir un punto nuevo: agrega una entrada aquí y aparece
 * automáticamente en /rutas, en el mapa y en el checkout.
 */

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  municipality: string;
  /** Coordenadas aproximadas para el mapa. Ajústalas al punto exacto. */
  lat: number;
  lng: number;
  /** 0 = domingo … 6 = sábado */
  days: number[];
  /** Ventanas horarias en formato 24h "HH:MM" */
  slots: string[];
  note: { es: string; en: string };
}

export const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: "las-catalinas",
    name: "Las Catalinas Mall",
    address: "Ave. Rafael Cordero, Caguas, PR 00725",
    municipality: "Caguas",
    lat: 18.2497,
    lng: -66.0349,
    days: [2, 4], // martes y jueves
    slots: ["17:00", "17:30", "18:00", "18:30", "19:00"],
    note: {
      es: "Estacionamiento del área de food court, nivel principal.",
      en: "Food court parking area, main level.",
    },
  },
  {
    id: "plaza-las-americas",
    name: "Plaza Las Américas",
    address: "525 Ave. Franklin Delano Roosevelt, San Juan, PR 00918",
    municipality: "San Juan",
    lat: 18.4189,
    lng: -66.0742,
    days: [1, 3, 5], // lunes, miércoles, viernes
    slots: ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30"],
    note: {
      es: "Estacionamiento lateral cerca de la entrada de Sears.",
      en: "Side parking lot near the Sears entrance.",
    },
  },
  {
    id: "montehiedra",
    name: "Montehiedra — estacionamiento",
    address: "Ave. Los Romeros, San Juan, PR 00926",
    municipality: "San Juan",
    lat: 18.3346,
    lng: -66.0821,
    days: [6], // sábado
    slots: ["10:00", "10:30", "11:00", "11:30", "12:00"],
    note: {
      es: "Nivel abierto del estacionamiento, frente a la entrada principal.",
      en: "Open level of the parking lot, facing the main entrance.",
    },
  },
];

export function getLocation(id: string): PickupLocation | undefined {
  return PICKUP_LOCATIONS.find((l) => l.id === id);
}

const DAY_NAMES = {
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
} as const;

export function dayName(day: number, lang: "es" | "en" = "es"): string {
  return DAY_NAMES[lang][day] ?? "";
}

export function daysLabel(loc: PickupLocation, lang: "es" | "en" = "es"): string {
  return loc.days.map((d) => dayName(d, lang)).join(" · ");
}

export function hoursLabel(loc: PickupLocation): string {
  if (loc.slots.length === 0) return "—";
  return `${formatTime(loc.slots[0])} – ${formatTime(loc.slots[loc.slots.length - 1])}`;
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Cuántos días de antelación mínima antes de poder recoger. */
export const LEAD_DAYS = 2;
/** Cuántos días hacia adelante ofrecemos fechas. */
export const HORIZON_DAYS = 28;

export interface DateOption {
  /** "YYYY-MM-DD" */
  value: string;
  weekday: number;
}

/** Fechas disponibles para un punto, respetando sus días de servicio. */
export function availableDates(loc: PickupLocation, from = new Date()): DateOption[] {
  const out: DateOption[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = LEAD_DAYS; i <= HORIZON_DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (loc.days.includes(d.getDay())) {
      out.push({ value: toISODate(d), weekday: d.getDay() });
    }
  }
  return out;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function formatDate(iso: string, lang: "es" | "en" = "es"): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-PR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Valida que una combinación punto/fecha/hora sea realmente ofrecida. */
export function isValidPickup(locationId: string, dateIso: string, time: string): boolean {
  const loc = getLocation(locationId);
  if (!loc) return false;
  if (!loc.slots.includes(time)) return false;
  return availableDates(loc).some((d) => d.value === dateIso);
}
