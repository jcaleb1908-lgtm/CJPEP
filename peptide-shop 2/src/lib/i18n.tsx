"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Lang } from "./i18n-types";
export type { Lang };

/** Español primero: es el idioma por defecto del sitio. */
export const DICT = {
  es: {
    "nav.home": "Inicio",
    "nav.about": "Nosotros",
    "nav.products": "Productos",
    "nav.routes": "Rutas",
    "nav.contact": "Contacto",
    "nav.cart": "Carrito",
    "nav.skip": "Saltar al contenido",
    "lang.switch": "English",
    "lang.label": "Idioma",

    "home.eyebrow": "Péptidos de investigación · Puerto Rico",
    "home.title": "Todo cotizado en ciclos de 4 semanas.",
    "home.lede":
      "Elige tu compuesto, elige tu dosis semanal y ve el costo exacto de tu ciclo completo. Sin sorpresas, sin matemática de servilleta.",
    "home.cta": "Ver productos",
    "home.cta2": "Puntos de entrega",
    "home.f1.t": "Precio por dosis, no por vial",
    "home.f1.b":
      "Seleccionas los mg semanales y el sitio calcula la combinación más económica que cubre las 4 semanas.",
    "home.f2.t": "Entrega en mano",
    "home.f2.b":
      "Tres puntos fijos en el área metro. Escoges lugar, fecha y hora al momento de ordenar.",
    "home.f3.t": "Catálogo verificado",
    "home.f3.b":
      "Presentaciones y referencias tomadas directamente del catálogo del proveedor.",
    "home.cats": "Categorías",
    "home.catsSub": "El catálogo completo se abre por fases. Hoy activo:",

    "about.title": "Nosotros",
    "about.lede":
      "Somos un punto de distribución local de péptidos para investigación en Puerto Rico.",
    "about.p1":
      "Trabajamos con un catálogo de proveedor verificado y entregamos en mano en el área metro. No usamos intermediarios ni envíos de terceros: lo que ordenas es lo que recibes, de nuestra mano a la tuya.",
    "about.p2":
      "Cotizamos todo en ciclos de 4 semanas porque es como realmente se usa el producto. En vez de venderte un vial y dejarte calcular, tú eliges los mg por semana y nosotros armamos la combinación de viales más económica que cubre el mes completo.",
    "about.p3":
      "Las órdenes se confirman por correo. Al hacer checkout recibes un resumen con tu punto de entrega, fecha y hora; nosotros recibimos la misma orden para procesarla.",
    "about.v1.t": "Transparencia",
    "about.v1.b": "El costo por dosis y el costo del ciclo se muestran antes de añadir al carrito.",
    "about.v2.t": "Cadena corta",
    "about.v2.b": "Del proveedor a nosotros, de nosotros a ti. Sin pasos intermedios.",
    "about.v3.t": "Respuesta rápida",
    "about.v3.b": "Contestamos preguntas por correo o redes normalmente el mismo día.",

    "products.title": "Productos",
    "products.lede":
      "Precios mostrados como ciclo completo de 4 semanas. Presiona un producto para elegir concentración y dosis.",
    "products.from": "Desde",
    "products.cycle": "/ 4 semanas",
    "products.soon": "Próximamente",
    "products.soonBody": "Esta categoría se activa en la próxima fase.",
    "products.open": "Ver dosis y precios",
    "products.count_one": "producto",
    "products.count_other": "productos",

    "modal.presentation": "Presentación",
    "modal.dose": "Dosis semanal",
    "modal.chooseDose": "Selecciona tu dosis semanal",
    "modal.perDose": "por dosis",
    "modal.cycle": "ciclo de 4 semanas",
    "modal.includes": "Incluye",
    "modal.covers": "Cubre",
    "modal.required": "necesarios",
    "modal.cadence": "Frecuencia de referencia",
    "modal.audience": "Perfil de interés",
    "modal.add": "Añadir al carrito",
    "modal.added": "Añadido",
    "modal.close": "Cerrar",
    "modal.qty": "Ciclos",
    "modal.vial": "Vial",
    "modal.vial_other": "viales",
    "modal.cartucho": "Cartucho",
    "modal.cartucho_other": "cartuchos",

    "routes.title": "Rutas y puntos de entrega",
    "routes.lede":
      "Tres puntos fijos en el área metro. Escoges el tuyo al hacer checkout.",
    "routes.days": "Días",
    "routes.hours": "Horario",
    "routes.note": "Nota",
    "routes.mapNote":
      "Mapa de referencia. El punto exacto de encuentro se confirma en el correo de tu orden.",

    "contact.title": "Contáctanos",
    "contact.lede":
      "¿Preguntas sobre un compuesto, una dosis o tu orden? Escríbenos.",
    "contact.email": "Correo",
    "contact.social": "Redes",
    "contact.formTitle": "Buzón de preguntas",
    "contact.name": "Nombre",
    "contact.yourEmail": "Tu correo",
    "contact.subject": "Asunto",
    "contact.message": "Tu pregunta",
    "contact.send": "Enviar pregunta",
    "contact.sending": "Enviando…",
    "contact.ok": "Recibido. Te contestamos al correo que nos dejaste.",
    "contact.err": "No se pudo enviar. Intenta de nuevo o escríbenos directo al correo.",

    "cart.title": "Tu carrito",
    "cart.empty": "Tu carrito está vacío.",
    "cart.emptyCta": "Ver productos",
    "cart.remove": "Quitar",
    "cart.subtotal": "Subtotal",
    "cart.total": "Total",
    "cart.checkout": "Continuar al checkout",
    "cart.items_one": "artículo",
    "cart.items_other": "artículos",
    "cart.cycles": "ciclos de 4 semanas",
    "cart.cycle": "ciclo de 4 semanas",

    "checkout.title": "Checkout",
    "checkout.lede":
      "Confirma tu orden, punto de entrega y hora. No se cobra en línea: el pago se hace en la entrega.",
    "checkout.yourOrder": "Tu orden",
    "checkout.yourInfo": "Tus datos",
    "checkout.pickup": "Recogido",
    "checkout.location": "Punto de entrega",
    "checkout.date": "Fecha",
    "checkout.time": "Hora",
    "checkout.pickDate": "Selecciona una fecha",
    "checkout.pickTime": "Selecciona una hora",
    "checkout.name": "Nombre completo",
    "checkout.email": "Correo electrónico",
    "checkout.phone": "Teléfono",
    "checkout.notes": "Notas para la entrega (opcional)",
    "checkout.submit": "Confirmar orden",
    "checkout.submitting": "Enviando orden…",
    "checkout.agree":
      "Confirmo que este material es para uso de investigación y que soy mayor de 21 años.",
    "checkout.okTitle": "¡Orden recibida!",
    "checkout.okBody":
      "Te enviamos un correo con el resumen. Nos vemos en el punto de entrega.",
    "checkout.okBack": "Volver a productos",
    "checkout.err": "No se pudo procesar la orden.",
    "checkout.orderNo": "Número de orden",
    "checkout.emailWarning":
      "Tu orden quedó registrada, pero el correo de confirmación no pudo salir. Guarda tu número de orden; ya la recibimos y te contactaremos.",

    "err.required": "Campo requerido",
    "err.email": "Correo inválido",
    "err.phone": "Teléfono inválido",
    "err.agree": "Debes aceptar para continuar",
    "err.cartEmpty": "Tu carrito está vacío",

    "footer.rights": "Todos los derechos reservados.",
    "footer.disclaimerTitle": "Aviso importante",
    "footer.disclaimer":
      "Todos los materiales se ofrecen exclusivamente para uso de investigación y laboratorio. No son medicamentos aprobados, no han sido evaluados por la FDA y no están destinados al diagnóstico, tratamiento, cura ni prevención de enfermedad alguna. No para consumo humano ni veterinario. Consulta a un profesional de la salud licenciado antes de tomar cualquier decisión médica.",
    "footer.nav": "Navegación",
    "footer.contact": "Contacto",
  },

  en: {
    "nav.home": "Home",
    "nav.about": "About us",
    "nav.products": "Products",
    "nav.routes": "Routes",
    "nav.contact": "Contact us",
    "nav.cart": "Cart",
    "nav.skip": "Skip to content",
    "lang.switch": "Español",
    "lang.label": "Language",

    "home.eyebrow": "Research peptides · Puerto Rico",
    "home.title": "Everything quoted in 4-week cycles.",
    "home.lede":
      "Pick your compound, pick your weekly dose, and see the exact cost of a full cycle. No surprises, no napkin math.",
    "home.cta": "Browse products",
    "home.cta2": "Pickup points",
    "home.f1.t": "Priced per dose, not per vial",
    "home.f1.b":
      "You select weekly mg and the site computes the cheapest combination that covers all 4 weeks.",
    "home.f2.t": "Hand delivery",
    "home.f2.b":
      "Three fixed points in the metro area. You choose place, date and time at checkout.",
    "home.f3.t": "Verified catalog",
    "home.f3.b":
      "Presentations and references taken straight from the supplier catalog.",
    "home.cats": "Categories",
    "home.catsSub": "The full catalog opens in phases. Live today:",

    "about.title": "About us",
    "about.lede":
      "We're a local distribution point for research peptides in Puerto Rico.",
    "about.p1":
      "We work from a verified supplier catalog and hand-deliver in the metro area. No middlemen, no third-party shipping: what you order is what you get, from our hands to yours.",
    "about.p2":
      "We quote everything in 4-week cycles because that's how the product is actually used. Instead of selling you a vial and leaving you to do the math, you pick mg per week and we assemble the cheapest vial combination that covers the full month.",
    "about.p3":
      "Orders are confirmed by email. At checkout you get a summary with your pickup point, date and time; we receive the same order to process it.",
    "about.v1.t": "Transparency",
    "about.v1.b": "Cost per dose and cost per cycle are shown before you add to cart.",
    "about.v2.t": "Short chain",
    "about.v2.b": "Supplier to us, us to you. No steps in between.",
    "about.v3.t": "Fast replies",
    "about.v3.b": "We answer questions by email or social, usually the same day.",

    "products.title": "Products",
    "products.lede":
      "Prices shown as a full 4-week cycle. Tap a product to choose concentration and dose.",
    "products.from": "From",
    "products.cycle": "/ 4 weeks",
    "products.soon": "Coming soon",
    "products.soonBody": "This category goes live in the next phase.",
    "products.open": "See doses & pricing",
    "products.count_one": "product",
    "products.count_other": "products",

    "modal.presentation": "Presentation",
    "modal.dose": "Weekly dose",
    "modal.chooseDose": "Select your weekly dose",
    "modal.perDose": "per dose",
    "modal.cycle": "4-week cycle",
    "modal.includes": "Includes",
    "modal.covers": "Covers",
    "modal.required": "required",
    "modal.cadence": "Reference frequency",
    "modal.audience": "Interest profile",
    "modal.add": "Add to cart",
    "modal.added": "Added",
    "modal.close": "Close",
    "modal.qty": "Cycles",
    "modal.vial": "Vial",
    "modal.vial_other": "vials",
    "modal.cartucho": "Cartridge",
    "modal.cartucho_other": "cartridges",

    "routes.title": "Routes & pickup points",
    "routes.lede": "Three fixed points in the metro area. You pick yours at checkout.",
    "routes.days": "Days",
    "routes.hours": "Hours",
    "routes.note": "Note",
    "routes.mapNote":
      "Reference map. The exact meeting spot is confirmed in your order email.",

    "contact.title": "Contact us",
    "contact.lede": "Questions about a compound, a dose, or your order? Write to us.",
    "contact.email": "Email",
    "contact.social": "Social",
    "contact.formTitle": "Question box",
    "contact.name": "Name",
    "contact.yourEmail": "Your email",
    "contact.subject": "Subject",
    "contact.message": "Your question",
    "contact.send": "Send question",
    "contact.sending": "Sending…",
    "contact.ok": "Got it. We'll reply to the email you left us.",
    "contact.err": "Couldn't send. Try again or email us directly.",

    "cart.title": "Your cart",
    "cart.empty": "Your cart is empty.",
    "cart.emptyCta": "Browse products",
    "cart.remove": "Remove",
    "cart.subtotal": "Subtotal",
    "cart.total": "Total",
    "cart.checkout": "Continue to checkout",
    "cart.items_one": "item",
    "cart.items_other": "items",
    "cart.cycles": "4-week cycles",
    "cart.cycle": "4-week cycle",

    "checkout.title": "Checkout",
    "checkout.lede":
      "Confirm your order, pickup point and time. Nothing is charged online: payment happens at pickup.",
    "checkout.yourOrder": "Your order",
    "checkout.yourInfo": "Your info",
    "checkout.pickup": "Pickup",
    "checkout.location": "Pickup point",
    "checkout.date": "Date",
    "checkout.time": "Time",
    "checkout.pickDate": "Select a date",
    "checkout.pickTime": "Select a time",
    "checkout.name": "Full name",
    "checkout.email": "Email address",
    "checkout.phone": "Phone",
    "checkout.notes": "Delivery notes (optional)",
    "checkout.submit": "Confirm order",
    "checkout.submitting": "Sending order…",
    "checkout.agree":
      "I confirm this material is for research use and that I am 21 or older.",
    "checkout.okTitle": "Order received!",
    "checkout.okBody":
      "We emailed you the summary. See you at the pickup point.",
    "checkout.okBack": "Back to products",
    "checkout.err": "Couldn't process the order.",
    "checkout.orderNo": "Order number",
    "checkout.emailWarning":
      "Your order was recorded, but the confirmation email could not be sent. Save your order number; we already have it and will contact you.",

    "err.required": "Required field",
    "err.email": "Invalid email",
    "err.phone": "Invalid phone",
    "err.agree": "You must agree to continue",
    "err.cartEmpty": "Your cart is empty",

    "footer.rights": "All rights reserved.",
    "footer.disclaimerTitle": "Important notice",
    "footer.disclaimer":
      "All materials are offered strictly for research and laboratory use. They are not approved medicines, have not been evaluated by the FDA, and are not intended to diagnose, treat, cure or prevent any disease. Not for human or veterinary consumption. Consult a licensed healthcare professional before making any medical decision.",
    "footer.nav": "Navigation",
    "footer.contact": "Contact",
  },
} as const;

export type TKey = keyof (typeof DICT)["es"];

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TKey) => string;
  /** Escoge el campo del idioma actual en objetos {es, en} del catálogo. */
  pick: <T>(o: { es: T; en: T }) => T;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "np.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "es") setLangState(saved);
    else if (!navigator.language.toLowerCase().startsWith("es")) setLangState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === "es" ? "en" : "es"),
      t: (key) => DICT[lang][key] ?? DICT.es[key] ?? key,
      pick: (o) => o[lang],
    }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
