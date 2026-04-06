type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export type ContactoInput = {
  nombre: string;
  email: string;
  telefono: string;
  aceptaPromociones: boolean;
  pregunta: string | null;
};

export type ProductoCreateInput = {
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  imagenUrl: string;
  activo: boolean;
  visible: boolean;
};

export type ProductoUpdateInput = {
  nombre?: string;
  categoria?: string;
  descripcion?: string;
  precio?: string;
  imagenUrl?: string;
  activo?: boolean;
  visible?: boolean;
};

export type ContactoWhatsInput = {
  nombre: string | null;
  cotizacion: string;
  clienteEstatus: string;
  fechaEntregaEstimada: Date | null;
};

export type CotizacionDetalleCreateInput = {
  idPedido: number;
  idProducto: number;
  numeroPiezas: number;
};

export type CredencialesAccesoInput = {
  nombreUsuario: string;
  contrasena: string;
};

export type UsuarioAccesoCreateInput = {
  nombreUsuario: string;
  contrasena: string;
  nombreCompleto: string;
  tienePermiso: boolean;
};

export type UsuarioAccesoUpdateInput = {
  nombreUsuario?: string;
  contrasena?: string;
  nombreCompleto?: string;
  tienePermiso?: boolean;
};

export type LogErrorCreateInput = {
  dominio: string;
  origen: string | null;
  metodo: string | null;
  codigo: string | null;
  mensaje: string;
  detalle: string | null;
  contexto: string | null;
  fechaOcurrencia: Date;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1" || value === "true") {
    return true;
  }

  if (value === 0 || value === "0" || value === "false") {
    return false;
  }

  return null;
}

function parsePrecio(value: unknown): string | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const normalized = typeof value === "number" ? value.toFixed(2) : value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return Number(normalized).toFixed(2);
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);

  return parsed > 0 ? parsed : null;
}

function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function parseDateTime(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function parseOptionalString(value: unknown, fieldName: string): ValidationResult<string | null> {
  if (value === null || value === undefined) {
    return { success: true, data: null };
  }

  if (!isNonEmptyString(value)) {
    return { success: false, message: `${fieldName} debe ser un texto no vacio o null.` };
  }

  return { success: true, data: value.trim() };
}

function parseContexto(value: unknown): ValidationResult<string | null> {
  if (value === null || value === undefined) {
    return { success: true, data: null };
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (normalized.length === 0) {
      return { success: false, message: "contexto debe ser un texto no vacio, un JSON valido o null." };
    }

    return { success: true, data: normalized };
  }

  try {
    return { success: true, data: JSON.stringify(value) };
  } catch {
    return { success: false, message: "contexto debe ser serializable a JSON." };
  }
}

export function validateContactoInput(payload: unknown): ValidationResult<ContactoInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const aceptaPromociones = parseBoolean(body.aceptaPromociones);
  let pregunta: string | null = null;

  if (!isNonEmptyString(body.nombre)) {
    return { success: false, message: "El nombre es obligatorio." };
  }

  if (!isNonEmptyString(body.email) || !emailRegex.test(body.email.trim())) {
    return { success: false, message: "El email no es valido." };
  }

  if (!isNonEmptyString(body.telefono)) {
    return { success: false, message: "El telefono es obligatorio." };
  }

  if (aceptaPromociones === null) {
    return { success: false, message: "aceptaPromociones debe ser un valor booleano." };
  }

  if ("pregunta" in body && body.pregunta !== null && body.pregunta !== undefined) {
    if (!isNonEmptyString(body.pregunta)) {
      return { success: false, message: "pregunta debe ser un texto no vacio o null." };
    }

    pregunta = body.pregunta.trim();
  }

  return {
    success: true,
    data: {
      nombre: body.nombre.trim(),
      email: body.email.trim().toLowerCase(),
      telefono: body.telefono.trim(),
      aceptaPromociones,
      pregunta,
    },
  };
}

export function validateProductoCreateInput(payload: unknown): ValidationResult<ProductoCreateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const precio = parsePrecio(body.precio);
  const activo = "activo" in body ? parseBoolean(body.activo) : true;
  const visible = "visible" in body ? parseBoolean(body.visible) : true;

  if (!isNonEmptyString(body.nombre)) {
    return { success: false, message: "El nombre es obligatorio." };
  }

  if (!isNonEmptyString(body.categoria)) {
    return { success: false, message: "La categoria es obligatoria." };
  }

  if (!isNonEmptyString(body.descripcion)) {
    return { success: false, message: "La descripcion es obligatoria." };
  }

  if (precio === null) {
    return { success: false, message: "El precio debe ser numerico con hasta 2 decimales." };
  }

  if (!isNonEmptyString(body.imagenUrl)) {
    return { success: false, message: "La imagenUrl es obligatoria." };
  }

  if (activo === null) {
    return { success: false, message: "activo debe ser un valor booleano." };
  }

  if (visible === null) {
    return { success: false, message: "visible debe ser un valor booleano." };
  }

  return {
    success: true,
    data: {
      nombre: body.nombre.trim(),
      categoria: body.categoria.trim(),
      descripcion: body.descripcion.trim(),
      precio,
      imagenUrl: body.imagenUrl.trim(),
      activo,
      visible,
    },
  };
}

export function validateProductoUpdateInput(payload: unknown): ValidationResult<ProductoUpdateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const data: ProductoUpdateInput = {};

  if ("nombre" in body) {
    if (!isNonEmptyString(body.nombre)) {
      return { success: false, message: "El nombre debe ser un texto no vacio." };
    }
    data.nombre = body.nombre.trim();
  }

  if ("categoria" in body) {
    if (!isNonEmptyString(body.categoria)) {
      return { success: false, message: "La categoria debe ser un texto no vacio." };
    }
    data.categoria = body.categoria.trim();
  }

  if ("descripcion" in body) {
    if (!isNonEmptyString(body.descripcion)) {
      return { success: false, message: "La descripcion debe ser un texto no vacio." };
    }
    data.descripcion = body.descripcion.trim();
  }

  if ("precio" in body) {
    const precio = parsePrecio(body.precio);
    if (precio === null) {
      return { success: false, message: "El precio debe ser numerico con hasta 2 decimales." };
    }
    data.precio = precio;
  }

  if ("imagenUrl" in body) {
    if (!isNonEmptyString(body.imagenUrl)) {
      return { success: false, message: "La imagenUrl debe ser un texto no vacio." };
    }
    data.imagenUrl = body.imagenUrl.trim();
  }

  if ("activo" in body) {
    const activo = parseBoolean(body.activo);
    if (activo === null) {
      return { success: false, message: "activo debe ser un valor booleano." };
    }
    data.activo = activo;
  }

  if ("visible" in body) {
    const visible = parseBoolean(body.visible);
    if (visible === null) {
      return { success: false, message: "visible debe ser un valor booleano." };
    }
    data.visible = visible;
  }

  if (Object.keys(data).length === 0) {
    return { success: false, message: "Debes enviar al menos un campo para actualizar." };
  }

  return { success: true, data };
}

export function validateContactoWhatsInput(payload: unknown): ValidationResult<ContactoWhatsInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  let nombre: string | null = null;
  let clienteEstatus = "pendiente";
  let fechaEntregaEstimada: Date | null = null;

  if ("nombre" in body && body.nombre !== null && body.nombre !== undefined) {
    if (!isNonEmptyString(body.nombre)) {
      return { success: false, message: "El nombre debe ser un texto no vacio o null." };
    }

    nombre = body.nombre.trim();
  }

  if (!isNonEmptyString(body.cotizacion)) {
    return { success: false, message: "La cotizacion es obligatoria." };
  }

  if ("clienteEstatus" in body) {
    if (!isNonEmptyString(body.clienteEstatus)) {
      return { success: false, message: "clienteEstatus debe ser un texto no vacio." };
    }

    clienteEstatus = body.clienteEstatus.trim();
  }

  if (
    "fechaEntregaEstimada" in body &&
    body.fechaEntregaEstimada !== null &&
    body.fechaEntregaEstimada !== undefined
  ) {
    fechaEntregaEstimada = parseDateOnly(body.fechaEntregaEstimada);

    if (fechaEntregaEstimada === null) {
      return { success: false, message: "fechaEntregaEstimada debe tener formato YYYY-MM-DD o null." };
    }
  }

  return {
    success: true,
    data: {
      nombre,
      cotizacion: body.cotizacion.trim(),
      clienteEstatus,
      fechaEntregaEstimada,
    },
  };
}

export function validateCotizacionDetalleCreateInput(
  payload: unknown,
): ValidationResult<CotizacionDetalleCreateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const idPedido = parsePositiveInt(body.idPedido);
  const idProducto = parsePositiveInt(body.idProducto);
  const numeroPiezas = parsePositiveInt(body.numeroPiezas);

  if (idPedido === null) {
    return { success: false, message: "idPedido debe ser un entero positivo." };
  }

  if (idProducto === null) {
    return { success: false, message: "idProducto debe ser un entero positivo." };
  }

  if (numeroPiezas === null) {
    return { success: false, message: "numeroPiezas debe ser un entero positivo." };
  }

  return {
    success: true,
    data: {
      idPedido,
      idProducto,
      numeroPiezas,
    },
  };
}

export function validateCredencialesAccesoInput(
  payload: unknown,
): ValidationResult<CredencialesAccesoInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;

  if (!isNonEmptyString(body.nombreUsuario)) {
    return { success: false, message: "El nombreUsuario es obligatorio." };
  }

  if (body.nombreUsuario.trim().length < 3) {
    return { success: false, message: "El nombreUsuario debe tener al menos 3 caracteres." };
  }

  if (!isNonEmptyString(body.contrasena)) {
    return { success: false, message: "La contrasena es obligatoria." };
  }

  if (body.contrasena.trim().length < 6) {
    return { success: false, message: "La contrasena debe tener al menos 6 caracteres." };
  }

  return {
    success: true,
    data: {
      nombreUsuario: body.nombreUsuario.trim().toLowerCase(),
      contrasena: body.contrasena.trim(),
    },
  };
}

export function validateUsuarioAccesoCreateInput(
  payload: unknown,
): ValidationResult<UsuarioAccesoCreateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const tienePermiso = parseBoolean(body.tienePermiso);

  if (!isNonEmptyString(body.nombreUsuario)) {
    return { success: false, message: "El nombreUsuario es obligatorio." };
  }

  if (body.nombreUsuario.trim().length < 3) {
    return { success: false, message: "El nombreUsuario debe tener al menos 3 caracteres." };
  }

  if (!isNonEmptyString(body.nombreCompleto)) {
    return { success: false, message: "El nombreCompleto es obligatorio." };
  }

  if (!isNonEmptyString(body.contrasena)) {
    return { success: false, message: "La contrasena es obligatoria." };
  }

  if (body.contrasena.trim().length < 6) {
    return { success: false, message: "La contrasena debe tener al menos 6 caracteres." };
  }

  if (tienePermiso === null) {
    return { success: false, message: "tienePermiso debe ser un valor booleano." };
  }

  return {
    success: true,
    data: {
      nombreUsuario: body.nombreUsuario.trim().toLowerCase(),
      contrasena: body.contrasena.trim(),
      nombreCompleto: body.nombreCompleto.trim(),
      tienePermiso,
    },
  };
}

export function validateUsuarioAccesoUpdateInput(
  payload: unknown,
): ValidationResult<UsuarioAccesoUpdateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const data: UsuarioAccesoUpdateInput = {};

  if ("nombreUsuario" in body) {
    if (!isNonEmptyString(body.nombreUsuario)) {
      return { success: false, message: "El nombreUsuario debe ser un texto no vacio." };
    }

    if (body.nombreUsuario.trim().length < 3) {
      return { success: false, message: "El nombreUsuario debe tener al menos 3 caracteres." };
    }

    data.nombreUsuario = body.nombreUsuario.trim().toLowerCase();
  }

  if ("nombreCompleto" in body) {
    if (!isNonEmptyString(body.nombreCompleto)) {
      return { success: false, message: "El nombreCompleto debe ser un texto no vacio." };
    }

    data.nombreCompleto = body.nombreCompleto.trim();
  }

  if ("contrasena" in body) {
    if (!isNonEmptyString(body.contrasena)) {
      return { success: false, message: "La contrasena debe ser un texto no vacio." };
    }

    if (body.contrasena.trim().length < 6) {
      return { success: false, message: "La contrasena debe tener al menos 6 caracteres." };
    }

    data.contrasena = body.contrasena.trim();
  }

  if ("tienePermiso" in body) {
    const tienePermiso = parseBoolean(body.tienePermiso);

    if (tienePermiso === null) {
      return { success: false, message: "tienePermiso debe ser un valor booleano." };
    }

    data.tienePermiso = tienePermiso;
  }

  if (Object.keys(data).length === 0) {
    return { success: false, message: "Debes enviar al menos un campo para actualizar." };
  }

  return { success: true, data };
}

export function validateLogErrorCreateInput(payload: unknown): ValidationResult<LogErrorCreateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const origen = parseOptionalString(body.origen, "origen");
  const metodo = parseOptionalString(body.metodo, "metodo");
  const codigo = parseOptionalString(body.codigo, "codigo");
  const detalle = parseOptionalString(body.detalle, "detalle");
  const contexto = parseContexto(body.contexto);

  if (!isNonEmptyString(body.dominio)) {
    return { success: false, message: "El dominio es obligatorio." };
  }

  if (!isNonEmptyString(body.mensaje)) {
    return { success: false, message: "El mensaje es obligatorio." };
  }

  if (!origen.success) {
    return origen;
  }

  if (!metodo.success) {
    return metodo;
  }

  if (!codigo.success) {
    return codigo;
  }

  if (!detalle.success) {
    return detalle;
  }

  if (!contexto.success) {
    return contexto;
  }

  let fechaOcurrencia = new Date();

  if (body.fechaOcurrencia !== null && body.fechaOcurrencia !== undefined) {
    const parsedFechaOcurrencia = parseDateTime(body.fechaOcurrencia);

    if (parsedFechaOcurrencia === null) {
      return { success: false, message: "fechaOcurrencia debe tener formato de fecha-hora valido o null." };
    }

    fechaOcurrencia = parsedFechaOcurrencia;
  }

  return {
    success: true,
    data: {
      dominio: body.dominio.trim(),
      origen: origen.data,
      metodo: metodo.data?.toUpperCase() ?? null,
      codigo: codigo.data,
      mensaje: body.mensaje.trim(),
      detalle: detalle.data,
      contexto: contexto.data,
      fechaOcurrencia,
    },
  };
}
