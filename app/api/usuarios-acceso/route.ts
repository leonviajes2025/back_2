import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeUsuarioAcceso } from "@/lib/serializers";
import { generarHashContrasena } from "@/lib/seguridad";
import { validateUsuarioAccesoCreateInput } from "@/lib/validation";

export const runtime = "nodejs";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function GET() {
  const usuarios = await prisma.usuarioAcceso.findMany({
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return NextResponse.json(usuarios.map(serializeUsuarioAcceso));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateUsuarioAccesoCreateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const usuario = await prisma.usuarioAcceso.create({
      data: {
        nombreUsuario: validation.data.nombreUsuario,
        contrasenaHash: generarHashContrasena(validation.data.contrasena),
        nombreCompleto: validation.data.nombreCompleto,
        tienePermiso: validation.data.tienePermiso,
      },
    });

    return NextResponse.json(serializeUsuarioAcceso(usuario), { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ message: "Ya existe un usuario con ese nombreUsuario." }, { status: 409 });
    }

    return NextResponse.json({ message: "No fue posible crear el usuario de acceso." }, { status: 400 });
  }
}