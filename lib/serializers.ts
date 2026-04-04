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
  fechaCreacion: Date;
}) {
  return {
    id: contactoWhats.id,
    nombre: contactoWhats.nombre,
    cotizacion: contactoWhats.cotizacion,
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
