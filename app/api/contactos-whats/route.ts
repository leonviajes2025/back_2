import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeContactoWhats } from "@/lib/serializers";
import { validateContactoWhatsInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const contactosWhats = await prisma.contactoWhats.findMany({
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return NextResponse.json(contactosWhats.map(serializeContactoWhats));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateContactoWhatsInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const contactoWhats = await prisma.contactoWhats.create({
      data: validation.data,
    });

    return NextResponse.json(serializeContactoWhats(contactoWhats), { status: 201 });
  } catch {
    return NextResponse.json({ message: "No fue posible crear la solicitud de WhatsApp." }, { status: 400 });
  }
}