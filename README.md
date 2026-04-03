# API RESTful con Next.js, Prisma y Supabase

Proyecto preparado para desplegarse en Vercel usando Next.js App Router, Prisma ORM, PostgreSQL y Supabase.

## Stack

- Node.js 20+
- Next.js 16.2.2
- React 19.2.4
- React DOM 19.2.4
- TypeScript 5
- Prisma 6.18.0
- PostgreSQL / Supabase
- ESLint 9

Nota: en Prisma para PostgreSQL los campos tipo bandera se modelan como Boolean, que es el equivalente practico al uso de Bit en este caso.

## Variables de entorno

Copia `.env.example` a `.env` y completa las credenciales de Supabase/PostgreSQL.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
```

## Prisma

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Para producción en Vercel:

```bash
npm run prisma:deploy
npm run build
```

## Datos de ejemplo

El proyecto incluye un seed idempotente para cargar datos iniciales:

```bash
npm run prisma:seed
```

## Despliegue en Vercel

- Configura en Vercel las variables DATABASE_URL y DIRECT_URL.
- Usa DATABASE_URL con pooling por el puerto 6543.
- Usa DIRECT_URL con conexion directa por el puerto 5432 para migraciones.
- El build del proyecto ya ejecuta `prisma generate && next build`.
- Antes del primer despliegue productivo ejecuta `npm run prisma:deploy`.

## Endpoints

### Contactos

- GET `/api/contactos`
- POST `/api/contactos`

Ejemplo de payload para crear contacto:

```json
{
  "nombre": "Ana Perez",
  "email": "ana@example.com",
  "telefono": "+5215555555555",
  "aceptaPromociones": true
}
```

### Productos

- GET `/api/productos`
- POST `/api/productos`
- PUT `/api/productos/:id`
- DELETE `/api/productos/:id`

Los ids de las tablas son enteros autoincrementales.

Ejemplo de payload para crear producto:

```json
{
  "nombre": "Producto 1",
  "descripcion": "Descripcion del producto",
  "precio": "199.99",
  "imagenUrl": "https://example.com/imagen.jpg",
  "activo": true
}
```

Ejemplo de payload para actualizar producto:

```json
{
  "nombre": "Producto actualizado",
  "precio": "149.90"
}
```

El endpoint DELETE realiza borrado logico dejando `activo=false`.

### Contactos WhatsApp

- GET `/api/contactos-whats`
- POST `/api/contactos-whats`

Ejemplo de payload para crear una solicitud de WhatsApp:

```json
{
  "cotizacion": "Necesito una cotizacion para 10 piezas del Producto Base"
}
```

## Postman

Se incluye una coleccion lista para importar en [postman/back_2.postman_collection.json](postman/back_2.postman_collection.json).
