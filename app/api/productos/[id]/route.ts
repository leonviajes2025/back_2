import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeProducto } from "@/lib/serializers";
import { validateProductoUpdateInput } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseProductoId(idParam: string) {
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseProductoId(idParam);

    if (id === null) {
      return NextResponse.json({ message: "El id del producto debe ser un entero positivo." }, { status: 400 });
    }

    const body = await request.json();
    const validation = validateProductoUpdateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(serializeProducto(producto));
  } catch {
    return NextResponse.json({ message: "No fue posible actualizar el producto." }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseProductoId(idParam);

    if (id === null) {
      return NextResponse.json({ message: "El id del producto debe ser un entero positivo." }, { status: 400 });
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        activo: false,
      },
    });

    return NextResponse.json({
      message: "Producto desactivado correctamente.",
      producto: serializeProducto(producto),
    });
  } catch {
    return NextResponse.json({ message: "No fue posible desactivar el producto." }, { status: 400 });
  }
}
