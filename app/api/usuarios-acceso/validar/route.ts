import { NextResponse } from "next/server";

import { serializeUsuarioAcceso } from "@/lib/serializers";
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
      return NextResponse.json(
        {
          autorizado: false,
          tienePermiso: false,
          message: "Credenciales invalidas.",
        },
        { status: 401 },
      );
    }

    if (!usuario.tienePermiso) {
      return NextResponse.json(
        {
          autorizado: true,
          tienePermiso: false,
          message: "El usuario no tiene permiso para acceder a la pagina administrativa.",
          usuario: serializeUsuarioAcceso(usuario),
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      autorizado: true,
      tienePermiso: true,
      message: "El usuario tiene permiso para acceder a la pagina administrativa.",
      usuario: serializeUsuarioAcceso(usuario),
    });
  } catch {
    return NextResponse.json({ message: "No fue posible validar el acceso del usuario." }, { status: 400 });
  }
}