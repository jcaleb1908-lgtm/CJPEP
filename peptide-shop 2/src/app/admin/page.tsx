import { isAdminConfigured, isLoggedIn } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="container-page py-24">
        <div className="card mx-auto max-w-lg p-8">
          <h1 className="display text-2xl">Panel sin configurar</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Añade estas dos líneas a <code className="font-mono">.env.local</code> y
            reinicia el servidor:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-bone p-4 text-xs leading-relaxed">
{`ADMIN_PASSWORD=una-contraseña-larga
ADMIN_SESSION_SECRET=<32+ caracteres al azar>`}
          </pre>
          <p className="mt-4 text-xs text-muted">
            Genera el secreto con:{" "}
            <code className="font-mono">
              node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;
            </code>
          </p>
        </div>
      </div>
    );
  }

  if (!(await isLoggedIn())) return <AdminLogin />;

  const db = getDb();
  if (!db) {
    return (
      <div className="container-page py-24">
        <div className="card mx-auto max-w-lg p-8">
          <h1 className="display text-2xl">Sin base de datos</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            El sitio está corriendo en <strong>modo sólo-correo</strong>: las
            órdenes se procesan y te llegan por correo, pero no se guardan, así
            que no hay nada que mostrar aquí.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Para activar el panel, configura <code className="font-mono">DATABASE_URL</code>{" "}
            (PostgreSQL en producción). Ver la sección{" "}
            <strong>Base de datos</strong> del README.
          </p>
        </div>
      </div>
    );
  }

  const [orders, messages] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 200,
    }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  // Serializamos las fechas: los componentes cliente no reciben objetos Date.
  return (
    <AdminDashboard
      orders={orders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }))}
      messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
    />
  );
}
