import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeProducto } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET() {
  const productos = await prisma.producto.findMany({
    where: {
      activo: true
    },
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return NextResponse.json(productos.map(serializeProducto));
}