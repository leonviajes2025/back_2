import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeProducto } from "@/lib/serializers";
import { validateProductoCreateInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const productos = await prisma.producto.findMany({
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return NextResponse.json(productos.map(serializeProducto));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateProductoCreateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const producto = await prisma.producto.create({
      data: validation.data,
    });

    return NextResponse.json(serializeProducto(producto), { status: 201 });
  } catch {
    return NextResponse.json({ message: "No fue posible crear el producto." }, { status: 400 });
  }
}
