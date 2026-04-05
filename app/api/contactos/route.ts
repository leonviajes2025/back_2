import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeContacto } from "@/lib/serializers";
import { validateContactoInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const contactos = await prisma.contacto.findMany({
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return NextResponse.json(contactos.map(serializeContacto));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateContactoInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const contacto = await prisma.contacto.create({
      data: validation.data,
    });

    return NextResponse.json(serializeContacto(contacto), { status: 201 });
  } catch {
    return NextResponse.json({ message: "No fue posible crear el contacto." }, { status: 400 });
  }
}
