import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeUsuarioAcceso } from "@/lib/serializers";
import { generarHashContrasena } from "@/lib/seguridad";
import { validateUsuarioAccesoUpdateInput } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseUsuarioId(idParam: string) {
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id) || id <= 0) {
    return null;
  }

  return id;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseUsuarioId(idParam);

    if (id === null) {
      return NextResponse.json({ message: "El id del usuario debe ser un entero positivo." }, { status: 400 });
    }

    const body = await request.json();
    const validation = validateUsuarioAccesoUpdateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const data: {
      nombreUsuario?: string;
      nombreCompleto?: string;
      tienePermiso?: boolean;
      contrasenaHash?: string;
    } = {};

    if (validation.data.nombreUsuario !== undefined) {
      data.nombreUsuario = validation.data.nombreUsuario;
    }

    if (validation.data.nombreCompleto !== undefined) {
      data.nombreCompleto = validation.data.nombreCompleto;
    }

    if (validation.data.tienePermiso !== undefined) {
      data.tienePermiso = validation.data.tienePermiso;
    }

    if (validation.data.contrasena !== undefined) {
      data.contrasenaHash = generarHashContrasena(validation.data.contrasena);
    }

    const usuario = await prisma.usuarioAcceso.update({
      where: { id },
      data,
    });

    return NextResponse.json(serializeUsuarioAcceso(usuario));
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ message: "Ya existe un usuario con ese nombreUsuario." }, { status: 409 });
    }

    if (isNotFoundError(error)) {
      return NextResponse.json({ message: "No existe un usuario de acceso con ese id." }, { status: 404 });
    }

    return NextResponse.json({ message: "No fue posible actualizar el usuario de acceso." }, { status: 400 });
  }
}