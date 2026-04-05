const endpoints = [
  {
    method: "GET",
    path: "/api/contactos",
    description: "Lista todos los contactos.",
  },
  {
    method: "POST",
    path: "/api/contactos",
    description: "Crea un contacto nuevo.",
  },
  {
    method: "GET",
    path: "/api/productos",
    description: "Lista todos los productos.",
  },
  {
    method: "GET",
    path: "/api/productos/activos",
    description: "Lista solo los productos activos.",
  },
  {
    method: "POST",
    path: "/api/productos",
    description: "Crea un producto nuevo.",
  },
  {
    method: "PUT",
    path: "/api/productos/[id]",
    description: "Actualiza un producto existente.",
  },
  {
    method: "DELETE",
    path: "/api/productos/[id]",
    description: "Elimina logicamente un producto con activo=false.",
  },
  {
    method: "GET",
    path: "/api/contactos-whats",
    description: "Lista todas las solicitudes de cotizacion de WhatsApp.",
  },
  {
    method: "POST",
    path: "/api/contactos-whats",
    description: "Crea una nueva solicitud de cotizacion de WhatsApp con nombre, cotizacion y fecha estimada opcional.",
  },
];

const examples = [
  "PUT /api/productos/1",
  "DELETE /api/productos/2",
  "POST /api/contactos-whats",
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Next.js 16 + Prisma + Supabase</p>
        <h1>API RESTful lista para Vercel</h1>
        <p className="lead">
          Proyecto backend con App Router, PostgreSQL y migraciones de Prisma.
        </p>
        <div className="examples">
          {examples.map((example) => (
            <span key={example} className="example-chip">
              {example}
            </span>
          ))}
        </div>
      </section>

      <section className="card-grid">
        {endpoints.map((endpoint) => (
          <article key={`${endpoint.method}-${endpoint.path}`} className="card">
            <span className="badge">{endpoint.method}</span>
            <h2>{endpoint.path}</h2>
            <p>{endpoint.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
