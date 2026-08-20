# CJ Peptides PR — tienda web

E-commerce de péptidos de investigación, **en español con interfaz conmutable a
inglés**. Todo se cotiza en **ciclos de 4 semanas**.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma + SQLite (opcional) · Leaflet + OpenStreetMap · Resend o SMTP.

---

## ⚠️ Antes de publicar: el margen de ganancia

Los precios del catálogo PDF son **por paquete de 10 viales**. El sitio los
divide entre 10 para el precio por vial. Por defecto vende **al costo**
(`markup: 1.0`), así que un ciclo de tirzepatide sale en **$9**.

Abre [`src/lib/config.ts`](src/lib/config.ts) y pon tu margen:

```ts
export const PRICING = {
  markup: 1.0,   // <-- CÁMBIALO. 4.0 = 4× el costo, 8.0 = 8× el costo…
  ...
}
```

Ese único número recalcula el grid, el modal, el carrito y los correos.

| markup | Tirzepatide 5 mg/sem (4 sem.) | Semaglutide 2.4 mg/sem (4 sem.) |
| ------ | ----------------------------- | ------------------------------- |
| 1.0    | $9                            | $7                              |
| 4.0    | $33                           | $26                             |
| 8.0    | $66                           | $52                             |
| 12.0   | $99                           | $78                             |

**Los otros dos pendientes:** cambiar `ADMIN_PASSWORD` (está en
`cambiame-por-favor`) y poner las credenciales de correo.

---

## Correr el sitio

Node.js 24 LTS ya está instalado en esta Mac, en `~/.local/node`.

```bash
npm install
npm run dev     # http://localhost:3000
```

`.env.local` ya viene configurado y la base de datos ya está creada. Sin
credenciales de correo el sitio **funciona igual**: los correos se imprimen en
la terminal en vez de enviarse. Perfecto para probar el flujo completo.

## Configurar el correo

Todo va a **CJpeptidesPR@gmail.com** (ya configurado). Falta elegir *cómo*
salen los correos:

**A · Gmail SMTP** — lo más rápido. Necesitas una *App Password*: Cuenta de
Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.
Te da 16 caracteres. En `.env.local`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=CJpeptidesPR@gmail.com
SMTP_PASS=xxxxxxxxxxxxxxxx        # los 16 caracteres, sin espacios
MAIL_FROM="CJ Peptides PR <CJpeptidesPR@gmail.com>"
```

Gmail limita a ~500 correos diarios. De sobra al principio.

**B · Resend** — mejor entregabilidad, gratis hasta 3,000/mes, requiere dominio
propio ([resend.com](https://resend.com)):

```
RESEND_API_KEY=re_xxxxxxxxxxxx
MAIL_FROM="CJ Peptides PR <pedidos@tudominio.com>"
```

`OWNER_EMAIL` es tu correo: recibe copia de cada orden con lista de preparación
de viales, y todas las preguntas del buzón de contacto.

---

## Cómo funciona el cálculo de 4 semanas

La pieza central del sitio, en [`src/lib/pricing.ts`](src/lib/pricing.ts).

1. El cliente elige un compuesto y una **dosis semanal** (ej. 5 mg).
2. El sitio calcula los mg del ciclo: `5 mg × 4 semanas = 20 mg`.
3. Busca la **combinación más barata** de viales que cubra esos 20 mg — es un
   *unbounded knapsack* resuelto con programación dinámica en pasos de 0.1 mg,
   así que encuentra el óptimo, no una aproximación.
4. Muestra el precio del ciclo y el precio por dosis (`ciclo ÷ 4`).

Ejemplos reales con `markup: 1.0`:

```
Tirzepatide  2.5 mg/sem →  10 mg → 1× TR10 → $5   ($1.25 por dosis)
Tirzepatide   15 mg/sem →  60 mg → 1× TR60 → $18  ($4.50 por dosis)
Semaglutide  2.4 mg/sem → 9.6 mg → 1× SM10 → $7   ($1.75 por dosis)
Semaglutide  1.7 mg/sem cartucho → 1× SMK2 + 1× SMK5 → $34
```

En el grid cada producto muestra el ciclo más barato ("Desde $X"). En el modal
se ve la lista completa de dosis con su costo específico.

---

## Base de datos

Cada orden y cada pregunta se guardan **antes** de intentar enviar el correo,
así que un fallo de correo nunca pierde una orden.

**La base de datos es opcional.** Sin `DATABASE_URL` el sitio corre en *modo
sólo-correo*: todo funciona y los correos salen igual, sólo que nada se guarda
y `/admin` lo avisa. Eso permite desplegar una prueba en Netlify sin montar un
Postgres primero.

Con `DATABASE_URL` usa **SQLite** en `prisma/dev.db`: cero configuración.

```bash
npm run db:studio    # explorador visual de la base de datos
npm run db:migrate   # aplica cambios del esquema
npm run db:reset     # ⚠️ borra TODO
```

Tablas: `Order` · `OrderItem` · `ContactMessage`
(ver [`prisma/schema.prisma`](prisma/schema.prisma)).

### Para guardar órdenes en producción

Netlify y Vercel usan disco **efímero y de sólo lectura**: SQLite no funciona
allí. Para tener las órdenes guardadas de verdad:

1. Crea una base gratis en [neon.tech](https://neon.tech) (sin tarjeta).
2. En `prisma/schema.prisma` cambia `provider = "sqlite"` por
   `provider = "postgresql"`.
3. Pon `DATABASE_URL` con la string de Neon y corre `npx prisma migrate dev`.

Alternativa: despliega en Railway o Render con volumen persistente y SQLite
sigue funcionando tal cual.

---

## Panel de administración → `/admin`

Aquí procesas las órdenes (requiere `DATABASE_URL`). Muestra:

- Órdenes filtradas por estado, con datos del cliente, punto/fecha/hora y el
  desglose exacto de viales de cada línea.
- **Lista de preparación agregada**: cuántos viales de cada SKU sacar en total,
  ya sumados.
- Valor total de las órdenes mostradas.
- Aviso rojo en cualquier orden cuyo correo no haya salido.
- Botones de estado: PENDIENTE → PREPARADA → ENTREGADA (o CANCELADA).
- Pestaña de preguntas, con responder y marcar atendida.

Se entra con `ADMIN_PASSWORD` de `.env.local`. **Está en `cambiame-por-favor`;
cámbiala antes de publicar.** `ADMIN_SESSION_SECRET` ya viene generado al azar.

---

## Publicar en Netlify (prueba)

⚠️ **Arrastrar el zip a Netlify NO basta.** El drag-and-drop sólo sirve para
sitios estáticos: no ejecuta `npm run build`, así que las rutas `/api/*` —las
que mandan los correos— quedarían muertas. Dos caminos que sí funcionan:

### Camino A — Netlify CLI, sin Git (el más rápido)

Descomprime el zip, entra a la carpeta y:

```bash
npm install
npm install -g netlify-cli
netlify login                    # abre el navegador
netlify deploy --build --prod
```

`--build` compila localmente con el plugin de Next.js y sube también las
funciones. Acepta el directorio que sugiera.

### Camino B — GitHub → Netlify

Sube el contenido del zip a un repo y en Netlify usa
**Add new site → Import an existing project**. Detecta Next.js solo.

### Variables de entorno en Netlify

En **Site configuration → Environment variables**:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=CJpeptidesPR@gmail.com
SMTP_PASS=<App Password de 16 caracteres>
MAIL_FROM=CJ Peptides PR <CJpeptidesPR@gmail.com>
OWNER_EMAIL=CJpeptidesPR@gmail.com
NEXT_PUBLIC_CONTACT_EMAIL=CJpeptidesPR@gmail.com
```

**NO pongas `DATABASE_URL`** para la prueba. Sin ella el sitio corre en modo
sólo-correo, que es justo lo que quieres: las órdenes llegan a tu Gmail y nada
falla por el disco de sólo lectura de Netlify.

### Alternativa: Vercel

Un solo comando, sin zip: `npx vercel`

`metadata.robots` está en `noindex` en `src/app/layout.tsx`. Quítalo cuando
quieras que Google indexe el sitio.

---

## Estructura

```
src/
  app/
    page.tsx                Inicio (hero + categorías)
    nosotros/page.tsx       Nosotros
    productos/page.tsx      Grid por categorías → modal de dosis
    rutas/page.tsx          Puntos de entrega + mapa
    contacto/page.tsx       Correo, redes y buzón de preguntas
    checkout/page.tsx       Orden + punto/fecha/hora + datos
    admin/page.tsx          🔐 Panel para procesar órdenes
    api/order/route.ts      Recalcula precios, guarda y envía los 2 correos
    api/contact/route.ts    Buzón de preguntas (honeypot anti-spam)
    api/admin/*             Login, logout, cambio de estado
    globals.css             Sistema de diseño (tokens Tailwind v4)
  components/
    Header · Footer · Logo
    ProductCard · ProductModal
    CartDrawer · PickupMap
    AdminLogin · AdminDashboard
  lib/
    config.ts               ⚙️ Margen, negocio, redes  ← empieza aquí
    catalog.ts              📦 Productos, categorías, presentaciones
    pickup.ts               📍 Puntos, días, horarios
    pricing.ts              🧮 Matemática de los ciclos de 4 semanas
    cart.tsx                Carrito (context + localStorage)
    i18n.tsx                Español / inglés
    orders.ts               Validación y recálculo en el servidor
    db.ts                   Prisma (opcional)
    admin-auth.ts           Sesión del panel (cookie firmada)
    mailer.ts               Resend / SMTP / consola
    email-templates.ts      Correos HTML + texto, bilingües
```

## Tareas comunes

**Añadir un producto** — agrega una entrada a `PRODUCTS` en `src/lib/catalog.ts`
con sus `presentations` (SKU, mg, precio del paquete) y su escalera
`weeklyDosesMg`. Aparece solo en el grid, con el precio ya calculado.

**Activar otra categoría** — las 5 categorías del PDF ya existen. Las que no
tienen productos salen como "Próximamente"; se activan solas en cuanto les
asignes un producto con ese `categoryId`.

**Añadir un punto de entrega** — agrega una entrada a `PICKUP_LOCATIONS` en
`src/lib/pickup.ts`. Aparece automáticamente en /rutas, el mapa y el checkout.

**Ajustar el mapa** — las lat/lng son aproximadas al centro de cada centro
comercial. Haz clic derecho en el punto exacto en Google Maps y copia el par.

---

## Lo que este sitio NO hace todavía

- **No cobra en línea.** El pago ocurre en la entrega. Para Stripe o ATH Móvil
  hay que añadir una pasarela.
- **No verifica inventario.** Toda dosis se puede ordenar siempre.
- **No verifica edad ni identidad** más allá del checkbox del checkout.
- **No manda recordatorios** antes del recogido.
- **El panel es de un solo usuario** (contraseña compartida).

## Seguridad: lo que ya está cubierto

- Los precios se **recalculan siempre en el servidor** desde el catálogo. Un
  cliente que modifique el JavaScript y mande un total de $1 igual paga lo que
  dice el catálogo (verificado con una petición falsa).
- Sólo se aceptan combinaciones punto/fecha/hora que realmente ofreces, y sólo
  dosis que existen en el catálogo.
- El buzón de contacto tiene honeypot anti-bots.
- La sesión del panel es cookie httpOnly firmada con HMAC, expira a las 12
  horas; el login tiene retraso fijo y comparación en tiempo constante.
- `metadata.robots` está en `noindex`.

## Aviso legal

El sitio muestra en el pie de página, y en cada correo, un aviso de que el
material es exclusivamente para uso de investigación y laboratorio, no está
aprobado por la FDA y no es para consumo humano. Revisa con un abogado si esa
redacción cubre tu situación en Puerto Rico antes de publicar.
