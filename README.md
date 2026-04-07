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

<!-- api-docs:start -->

## Endpoints

### Contactos

Alta y consulta de contactos generales enviados desde formularios.

- GET /api/contactos
  - Funcion: Lista todos los contactos ordenados por fecha de creacion descendente.
  - Request: Sin body. Consulta simple ordenada por fechaCreacion desc.
  - Responses: 200 OK

- POST /api/contactos
  - Funcion: Crea un contacto nuevo validando los datos recibidos.
  - Request: Body JSON con datos del contacto. Valida formato antes de insertar.
  - Responses: 201 Created, 400 Bad Request
  - Body:
    - nombre (string, obligatorio): Nombre completo del contacto.
    - email (string, obligatorio): Correo valido. Se normaliza a minusculas.
    - telefono (string, obligatorio): Telefono de contacto.
    - aceptaPromociones (boolean, obligatorio): Acepta true/false o equivalentes parseables.
    - pregunta (string | null, opcional): Consulta adicional. Puede enviarse null.
  - Ejemplo JSON:
```json
{
  "nombre": "Marta Soto",
  "email": "marta.duplicado.postman@example.com",
  "telefono": "+5215555555510",
  "aceptaPromociones": true,
  "pregunta": "Tienen disponibilidad inmediata?"
}
```
  - Notas: Devuelve mensaje de error si el body no cumple la validacion.

### Productos

Catalogo de productos con variantes para filtrar, crear, actualizar y desactivar.

- GET /api/productos
  - Funcion: Lista todos los productos registrados, sin filtrar por estado o visibilidad.
  - Request: Sin body. Devuelve catalogo completo.
  - Responses: 200 OK

- POST /api/productos
  - Funcion: Crea un producto nuevo despues de validar nombre, categoria, precios y banderas.
  - Request: Body JSON con datos del producto. Requiere validacion previa.
  - Responses: 201 Created, 400 Bad Request
  - Body:
    - nombre (string, obligatorio): Nombre comercial del producto.
    - categoria (string, obligatorio): Categoria visible o interna del producto.
    - descripcion (string, obligatorio): Descripcion del producto.
    - precio (string | number, obligatorio): Valor numerico con hasta 2 decimales.
    - imagenUrl (string, obligatorio): URL de la imagen principal.
    - activo (boolean, opcional): Si no se envia, toma true por defecto.
    - visible (boolean, opcional): Si no se envia, toma true por defecto.
  - Ejemplo JSON:
```json
{
  "nombre": "Producto Postman",
  "categoria": "Accesorios",
  "descripcion": "Creado desde la coleccion de Postman",
  "precio": "220.00",
  "imagenUrl": "https://example.com/postman.jpg",
  "activo": true,
  "visible": true
}
```
  - Notas: activo y visible son opcionales en create; si no llegan, ambos quedan en true.

- GET /api/productos/activos
  - Funcion: Devuelve solo productos activos y visibles para consumo publico.
  - Request: Sin body. Filtra por activo=true y visible=true.
  - Responses: 200 OK

- GET /api/productos/visibles
  - Funcion: Devuelve productos visibles, esten o no activos.
  - Request: Sin body. Filtra por visible=true.
  - Responses: 200 OK

- PUT /api/productos/[id]
  - Funcion: Actualiza un producto existente usando un id entero positivo.
  - Request: Body JSON parcial o completo. Requiere id entero positivo en ruta.
  - Responses: 200 OK, 400 Bad Request
  - Params:
    - id (integer, obligatorio): Identificador del producto. Debe ser entero positivo.
  - Body:
    - nombre (string, opcional): Nuevo nombre del producto.
    - categoria (string, opcional): Nueva categoria.
    - descripcion (string, opcional): Nueva descripcion.
    - precio (string | number, opcional): Nuevo precio con hasta 2 decimales.
    - imagenUrl (string, opcional): Nueva URL de imagen.
    - activo (boolean, opcional): Permite activar o desactivar explicitamente.
    - visible (boolean, opcional): Controla la visibilidad publica.
  - Ejemplo JSON:
```json
{
  "nombre": "Producto Actualizado Postman",
  "categoria": "Hogar",
  "precio": "180.00",
  "visible": false
}
```
  - Notas: El endpoint valida el parametro id antes de intentar actualizar. Debes enviar al menos un campo.

- DELETE /api/productos/[id]
  - Funcion: Realiza baja logica del producto cambiando activo a false.
  - Request: Sin body. Requiere id entero positivo en ruta.
  - Responses: 200 OK, 400 Bad Request
  - Params:
    - id (integer, obligatorio): Identificador del producto. Debe ser entero positivo.
  - Notas: No elimina el registro fisicamente; actualiza activo=false.

### Contactos WhatsApp

Solicitudes de cotizacion iniciadas desde WhatsApp.

- GET /api/contactos-whats
  - Funcion: Lista las solicitudes de WhatsApp mas recientes primero.
  - Request: Sin body. Ordena por fechaCreacion desc.
  - Responses: 200 OK

- POST /api/contactos-whats
  - Funcion: Registra una nueva solicitud con nombre opcional, estatus y fecha estimada opcional.
  - Request: Body JSON con datos del pedido. Acepta nombre y fecha estimada opcionales.
  - Responses: 201 Created, 400 Bad Request
  - Body:
    - nombre (string | null, opcional): Nombre del cliente. Puede ser null.
    - cotizacion (string, obligatorio): Texto principal de la solicitud.
    - clienteEstatus (string, opcional): Si se omite, toma pendiente por defecto.
    - fechaEntregaEstimada (string | null, opcional): Fecha en formato YYYY-MM-DD o null.
  - Ejemplo JSON:
```json
{
  "nombre": null,
  "cotizacion": "Necesito una cotizacion para 20 piezas del Producto Base",
  "clienteEstatus": "pendiente",
  "fechaEntregaEstimada": "2026-04-20"
}
```

- PATCH /api/contactos-whats/[id]
  - Funcion: Actualiza unicamente el estatus del cliente de una solicitud de WhatsApp existente.
  - Request: Body JSON con solo clienteEstatus. Requiere id entero positivo en ruta.
  - Responses: 200 OK, 400 Bad Request, 404 Not Found
  - Params:
    - id (integer, obligatorio): Identificador de la solicitud. Debe ser entero positivo.
  - Body:
    - clienteEstatus (string, obligatorio): Nuevo estatus del cliente. Debe ser un texto no vacio.
  - Ejemplo JSON:
```json
{
  "clienteEstatus": "confirmado"
}
```
  - Notas: Rechaza cualquier campo distinto de clienteEstatus para mantener la actualizacion estrictamente acotada.

### Boton WhatsApp

Registro de clics del boton de mandar mensaje por WhatsApp.

- GET /api/boton-whats
  - Funcion: Lista todos los clics registrados del boton de WhatsApp, mostrando primero los mas recientes.
  - Request: Sin body. Ordena por fechaClick desc y luego por id desc.
  - Responses: 200 OK

- POST /api/boton-whats
  - Funcion: Registra un clic del boton de WhatsApp a partir de los headers de la peticion.
  - Request: Sin body obligatorio. Obtiene IP, dispositivo, navegador y fechaClick desde la peticion actual.
  - Responses: 201 Created
  - Ejemplo JSON:
```json
{}
```
  - Notas: La IP se toma de headers proxy comunes; dispositivo y navegador se derivan del user-agent. En Postman puedes simularlo añadiendo los headers 'x-forwarded-for' y 'user-agent'.

### Cotizacion Detalle

Detalle de piezas y productos vinculados a una cotizacion de WhatsApp.

- POST /api/cotizacion-detalle
  - Funcion: Crea un detalle de cotizacion validando que existan el pedido y el producto activo.
  - Request: Body JSON con idPedido, idProducto y numeroPiezas.
  - Responses: 201 Created, 400 Bad Request
  - Body:
    - idPedido (integer, obligatorio): Id del registro de contactoWhats.
    - idProducto (integer, obligatorio): Id del producto activo relacionado.
    - numeroPiezas (integer, obligatorio): Cantidad de piezas. Debe ser entero positivo.
  - Ejemplo JSON:
```json
{
  "idPedido": 1,
  "idProducto": 1,
  "numeroPiezas": 20
}
```
  - Notas: Comprueba que exista el contactoWhats y que el producto este activo.

### Acceso Administrativo

Gestion de usuarios administrativos y validacion de permisos.

- GET /api/usuarios-acceso
  - Funcion: Lista usuarios de acceso administrativo ordenados por creacion.
  - Request: Sin body. Consulta usuarios administrativos.
  - Responses: 200 OK

- POST /api/usuarios-acceso
  - Funcion: Crea un usuario administrativo y guarda la contrasena hasheada.
  - Request: Body JSON con nombreUsuario, contrasena, nombreCompleto y permiso.
  - Responses: 201 Created, 400 Bad Request, 409 Conflict
  - Body:
    - nombreUsuario (string, obligatorio): Minimo 3 caracteres. Se normaliza a minusculas.
    - contrasena (string, obligatorio): Minimo 6 caracteres.
    - nombreCompleto (string, obligatorio): Nombre descriptivo del usuario.
    - tienePermiso (boolean, obligatorio): Indica acceso a la pagina administrativa.
  - Ejemplo JSON:
```json
{
  "nombreUsuario": "supervisor",
  "contrasena": "Supervisor123",
  "nombreCompleto": "Supervisor Comercial",
  "tienePermiso": true
}
```
  - Notas: Si el nombreUsuario ya existe responde conflicto por restriccion unica.

- PUT /api/usuarios-acceso/[id]
  - Funcion: Actualiza usuario, permisos y contrasena de forma parcial usando id.
  - Request: Body JSON parcial. Requiere id entero positivo en ruta.
  - Responses: 200 OK, 400 Bad Request, 404 Not Found, 409 Conflict
  - Params:
    - id (integer, obligatorio): Identificador del usuario. Debe ser entero positivo.
  - Body:
    - nombreUsuario (string, opcional): Minimo 3 caracteres. Se normaliza a minusculas.
    - contrasena (string, opcional): Minimo 6 caracteres.
    - nombreCompleto (string, opcional): Nuevo nombre descriptivo del usuario.
    - tienePermiso (boolean, opcional): Actualiza el permiso administrativo.
  - Ejemplo JSON:
```json
{
  "nombreCompleto": "Supervisor Ventas",
  "tienePermiso": false,
  "contrasena": "NuevaClave123"
}
```
  - Notas: Todos los campos son opcionales, pero debes enviar al menos uno.

- POST /api/usuarios-acceso/validar
  - Funcion: Valida credenciales y confirma si el usuario tiene permiso administrativo.
  - Request: Body JSON con nombreUsuario y contrasena.
  - Responses: 200 OK, 401 Unauthorized, 403 Forbidden, 400 Bad Request
  - Body:
    - nombreUsuario (string, obligatorio): Minimo 3 caracteres.
    - contrasena (string, obligatorio): Minimo 6 caracteres.
  - Ejemplo JSON:
```json
{
  "nombreUsuario": "admin",
  "contrasena": "Admin123"
}
```

### Inicios de Sesion

Registro de accesos administrativos exitosos.

- POST /api/inicios-sesion
  - Funcion: Valida credenciales, verifica permisos y registra el inicio de sesion.
  - Request: Body JSON con nombreUsuario y contrasena.
  - Responses: 201 Created, 401 Unauthorized, 403 Forbidden, 400 Bad Request
  - Body:
    - nombreUsuario (string, obligatorio): Minimo 3 caracteres.
    - contrasena (string, obligatorio): Minimo 6 caracteres.
  - Ejemplo JSON:
```json
{
  "nombreUsuario": "admin",
  "contrasena": "Admin123"
}
```

### Logs de Errores

Consulta y registro de errores provenientes de dominios externos.

- GET /api/logs-errores
  - Funcion: Lista errores ordenados por fecha de ocurrencia y fecha de creacion.
  - Request: Sin body. Ordena por fechaOcurrencia y fechaCreacion descendentes.
  - Responses: 200 OK

- POST /api/logs-errores
  - Funcion: Registra un log de error con dominio, origen, metodo, codigo y contexto.
  - Request: Body JSON con datos del error y su contexto.
  - Responses: 201 Created, 400 Bad Request
  - Body:
    - dominio (string, obligatorio): Sistema o dominio que origino el error.
    - origen (string | null, opcional): Modulo o pantalla de origen.
    - metodo (string | null, opcional): Metodo HTTP o accion. Se normaliza a mayusculas.
    - codigo (string | null, opcional): Codigo interno del error.
    - mensaje (string, obligatorio): Mensaje principal del error.
    - detalle (string | null, opcional): Detalle ampliado del error.
    - contexto (string | object | null, opcional): Puede enviarse como JSON serializable o texto.
    - fechaOcurrencia (string | null, opcional): Fecha-hora valida. Si se omite, usa la fecha actual.
  - Ejemplo JSON:
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

## Postman

Se incluye una coleccion lista para importar en [postman/back_2.postman_collection.json](postman/back_2.postman_collection.json).

## Sincronizacion de endpoints

La fuente de verdad para la documentacion del front, el README y la coleccion de Postman es [data/api-docs.json](data/api-docs.json).

Cuando agregues, elimines o cambies un endpoint, actualiza ese archivo:

- La home consume esa metadata directamente.
- La coleccion de Postman se regenera con npm run sync:api-docs.
- El README tambien se regenera desde esa misma fuente.
- npm run check:api-docs falla si hay diferencias pendientes.

Con esto, el front, el README y Postman quedan alineados desde una sola definicion.

<!-- api-docs:end -->
