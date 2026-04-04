import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertProducto(data) {
  const existing = await prisma.producto.findFirst({
    where: { nombre: data.nombre },
    select: { id: true },
  });

  if (existing) {
    return prisma.producto.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.producto.create({ data });
}

async function upsertContactoWhats(data) {
  const existing = await prisma.contactoWhats.findFirst({
    where: {
      nombre: data.nombre,
      cotizacion: data.cotizacion,
    },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.contactoWhats.create({
    data,
  });
}

async function main() {
  await prisma.contacto.upsert({
    where: { email: "ana@example.com" },
    update: {
      nombre: "Ana Perez",
      telefono: "+5215555555555",
      aceptaPromociones: true,
    },
    create: {
      nombre: "Ana Perez",
      email: "ana@example.com",
      telefono: "+5215555555555",
      aceptaPromociones: true,
    },
  });

  await prisma.contacto.upsert({
    where: { email: "luis@example.com" },
    update: {
      nombre: "Luis Ramirez",
      telefono: "+5215555555501",
      aceptaPromociones: false,
    },
    create: {
      nombre: "Luis Ramirez",
      email: "luis@example.com",
      telefono: "+5215555555501",
      aceptaPromociones: false,
    },
  });

  await upsertProducto({
    nombre: "Producto Base",
    categoria: "Electronica",
    descripcion: "Producto principal para pruebas del endpoint.",
    precio: "199.99",
    imagenUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    activo: true,
  });

  await upsertProducto({
    nombre: "Producto Promo",
    categoria: "Calzado",
    descripcion: "Producto alternativo con precio promocional.",
    precio: "149.90",
    imagenUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    activo: true,
  });

  await upsertProducto({
    nombre: "Producto Inactivo",
    categoria: "Audio",
    descripcion: "Registro de ejemplo para validar borrado logico.",
    precio: "89.50",
    imagenUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    activo: false,
  });

  await upsertContactoWhats({
    nombre: "Ana Perez",
    cotizacion: "Necesito una cotizacion para 50 piezas del Producto Base.",
  });

  console.log("Seed completado correctamente.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });