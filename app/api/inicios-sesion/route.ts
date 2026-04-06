import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeInicioSesion, serializeUsuarioAcceso } from "@/lib/serializers";
import { validarCredencialesUsuario } from "@/lib/acceso";
import { validateCredencialesAccesoInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateCredencialesAccesoInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const usuario = await validarCredencialesUsuario(
      validation.data.nombreUsuario,
      validation.data.contrasena,
    );

    if (!usuario) {
      return NextResponse.json({ message: "Credenciales invalidas." }, { status: 401 });
    }

    if (!usuario.tienePermiso) {
      return NextResponse.json(
        { message: "El usuario no tiene permiso para acceder a la pagina administrativa." },
        { status: 403 },
      );
    }

    const inicioSesion = await prisma.inicioSesion.create({
      data: {
        idUsuario: usuario.id,
      },
    });

    return NextResponse.json(
      {
        message: "Inicio de sesion registrado correctamente.",
        usuario: serializeUsuarioAcceso(usuario),
        inicioSesion: serializeInicioSesion(inicioSesion),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "No fue posible registrar el inicio de sesion." }, { status: 400 });
  }
}