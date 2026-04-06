type TimestampedEntity = {
  fechaCreacion: Date;
  fechaActualizacion?: Date;
};

function serializeDates<T extends TimestampedEntity>(entity: T) {
  return {
    ...entity,
    fechaCreacion: entity.fechaCreacion.toISOString(),
    ...(entity.fechaActualizacion
      ? { fechaActualizacion: entity.fechaActualizacion.toISOString() }
      : {}),
  };
}

export function serializeContacto(contacto: {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  aceptaPromociones: boolean;
  pregunta: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}) {
  return serializeDates(contacto);
}

export function serializeProducto(producto: {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: { toString(): string };
  imagenUrl: string;
  activo: boolean;
  visible: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}) {
  const serialized = serializeDates(producto);

  return {
    ...serialized,
    precio: producto.precio.toString(),
  };
}

export function serializeContactoWhats(contactoWhats: {
  id: number;
  nombre: string | null;
  cotizacion: string;
  clienteEstatus: string;
  fechaEntregaEstimada?: Date | null;
  fechaCreacion: Date;
}) {
  return {
    id: contactoWhats.id,
    nombre: contactoWhats.nombre,
    cotizacion: contactoWhats.cotizacion,
    clienteEstatus: contactoWhats.clienteEstatus,
    fechaEntregaEstimada: contactoWhats.fechaEntregaEstimada?.toISOString().slice(0, 10) ?? null,
    fechaCreacion: contactoWhats.fechaCreacion.toISOString(),
  };
}

export function serializeCotizacionDetalle(cotizacionDetalle: {
  id: number;
  idPedido: number;
  idProducto: number;
  numeroPiezas: number;
}) {
  return {
    id: cotizacionDetalle.id,
    idPedido: cotizacionDetalle.idPedido,
    idProducto: cotizacionDetalle.idProducto,
    numeroPiezas: cotizacionDetalle.numeroPiezas,
  };
}

export function serializeUsuarioAcceso(usuarioAcceso: {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  tienePermiso: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}) {
  return serializeDates(usuarioAcceso);
}

export function serializeInicioSesion(inicioSesion: {
  id: number;
  idUsuario: number;
  fechaCreacion: Date;
}) {
  return {
    id: inicioSesion.id,
    idUsuario: inicioSesion.idUsuario,
    fechaCreacion: inicioSesion.fechaCreacion.toISOString(),
  };
}

function deserializeContexto(contexto: string | null) {
  if (contexto === null) {
    return null;
  }

  try {
    return JSON.parse(contexto);
  } catch {
    return contexto;
  }
}

export function serializeLogError(logError: {
  id: number;
  dominio: string;
  origen: string | null;
  metodo: string | null;
  codigo: string | null;
  mensaje: string;
  detalle: string | null;
  contexto: string | null;
  fechaOcurrencia: Date;
  fechaCreacion: Date;
}) {
  return {
    id: logError.id,
    dominio: logError.dominio,
    origen: logError.origen,
    metodo: logError.metodo,
    codigo: logError.codigo,
    mensaje: logError.mensaje,
    detalle: logError.detalle,
    contexto: deserializeContexto(logError.contexto),
    fechaOcurrencia: logError.fechaOcurrencia.toISOString(),
    fechaCreacion: logError.fechaCreacion.toISOString(),
  };
}
