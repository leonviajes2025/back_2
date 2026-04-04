type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export type ContactoInput = {
  nombre: string;
  email: string;
  telefono: string;
  aceptaPromociones: boolean;
};

export type ProductoCreateInput = {
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  imagenUrl: string;
  activo: boolean;
};

export type ProductoUpdateInput = {
  nombre?: string;
  categoria?: string;
  descripcion?: string;
  precio?: string;
  imagenUrl?: string;
  activo?: boolean;
};

export type ContactoWhatsInput = {
  nombre: string | null;
  cotizacion: string;
};

export type CotizacionDetalleCreateInput = {
  idPedido: number;
  idProducto: number;
  numeroPiezas: number;
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

export function validateContactoInput(payload: unknown): ValidationResult<ContactoInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const aceptaPromociones = parseBoolean(body.aceptaPromociones);

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

  return {
    success: true,
    data: {
      nombre: body.nombre.trim(),
      email: body.email.trim().toLowerCase(),
      telefono: body.telefono.trim(),
      aceptaPromociones,
    },
  };
}

export function validateProductoCreateInput(payload: unknown): ValidationResult<ProductoCreateInput> {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const body = payload as Record<string, unknown>;
  const precio = parsePrecio(body.precio);
  const activo = parseBoolean(body.activo);

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

  return {
    success: true,
    data: {
      nombre: body.nombre.trim(),
      categoria: body.categoria.trim(),
      descripcion: body.descripcion.trim(),
      precio,
      imagenUrl: body.imagenUrl.trim(),
      activo,
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

  if ("nombre" in body && body.nombre !== null && body.nombre !== undefined) {
    if (!isNonEmptyString(body.nombre)) {
      return { success: false, message: "El nombre debe ser un texto no vacio o null." };
    }

    nombre = body.nombre.trim();
  }

  if (!isNonEmptyString(body.cotizacion)) {
    return { success: false, message: "La cotizacion es obligatoria." };
  }

  return {
    success: true,
    data: {
      nombre,
      cotizacion: body.cotizacion.trim(),
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
