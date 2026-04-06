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
npm run vercel-build
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
- Vercel ejecuta automaticamente `npm run vercel-build`.
- Ese flujo corre `prisma migrate deploy` antes de `next build`.
- El build local `npm run build` sigue sin aplicar migraciones automaticamente.

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
- GET `/api/productos/activos`
- POST `/api/productos`
- PUT `/api/productos/:id`
- DELETE `/api/productos/:id`

Los ids de las tablas son enteros autoincrementales.

Ejemplo de payload para crear producto:

```json
{
  "nombre": "Producto 1",
  "categoria": "Electronica",
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
  "categoria": "Hogar",
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
  "nombre": null,
  "cotizacion": "Necesito una cotizacion para 10 piezas del Producto Base",
  "clienteEstatus": "pendiente",
  "fechaEntregaEstimada": "2026-04-20"
}
```

El campo `nombre` es opcional y puede enviarse como `null`.
El campo `clienteEstatus` recibe texto, no admite `null` y si no se envia la API usa `pendiente`.
El campo `fechaEntregaEstimada` tambien es opcional y, si se envia, debe usar formato `YYYY-MM-DD`.

### Acceso administrativo

- GET `/api/usuarios-acceso`
- POST `/api/usuarios-acceso`
- PUT `/api/usuarios-acceso/:id`
- POST `/api/usuarios-acceso/validar`
- POST `/api/inicios-sesion`

Ambos endpoints reciben credenciales en JSON:

```json
{
  "nombreUsuario": "admin",
  "contrasena": "Admin123"
}
```

`/api/usuarios-acceso/validar` confirma si las credenciales son correctas y si el usuario tiene permiso para acceder al panel administrativo.

`/api/inicios-sesion` valida credenciales, verifica permiso y registra el inicio de sesion en la tabla `inicios_sesion`.

`\/api/usuarios-acceso` permite listar usuarios creados y registrar nuevos usuarios con permiso administrativo o sin el.

Ejemplo de payload para crear usuario de acceso:

```json
{
  "nombreUsuario": "supervisor",
  "contrasena": "Supervisor123",
  "nombreCompleto": "Supervisor Comercial",
  "tienePermiso": true
}
```

Ejemplo de payload para actualizar usuario de acceso:

```json
{
  "nombreCompleto": "Supervisor Ventas",
  "tienePermiso": false,
  "contrasena": "NuevaClave123"
}
```

El seed crea un usuario administrativo inicial:

```text
nombreUsuario: admin
contrasena: Admin123
```

### Logs de errores

- GET `/api/logs-errores`
- POST `/api/logs-errores`

Este recurso permite registrar errores reportados por distintos dominios o integraciones que consumen la API, dejando evidencia del dominio afectado, el mensaje, el contexto y la fecha exacta de ocurrencia.

Ejemplo de payload para crear un log de error:

```json
{
  "dominio": "frontend-web",
  "origen": "checkout",
  "metodo": "POST",
  "codigo": "PAYMENT_TIMEOUT",
  "mensaje": "No fue posible completar el cobro.",
  "detalle": "La pasarela no respondio dentro del tiempo esperado.",
  "contexto": {
    "pedidoId": 123,
    "traceId": "req-01HXYZ"
  },
  "fechaOcurrencia": "2026-04-05T18:45:12.000Z"
}
```

`fechaOcurrencia` es opcional. Si no se envia, la API registra la fecha y hora actuales.

## Postman

Se incluye una coleccion lista para importar en [postman/back_2.postman_collection.json](postman/back_2.postman_collection.json).
