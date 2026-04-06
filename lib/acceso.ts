import { prisma } from "@/lib/prisma";
import { verificarContrasena } from "@/lib/seguridad";

export async function validarCredencialesUsuario(nombreUsuario: string, contrasena: string) {
  const usuario = await prisma.usuarioAcceso.findUnique({
    where: {
      nombreUsuario,
    },
  });

  if (!usuario) {
    return null;
  }

  if (!verificarContrasena(contrasena, usuario.contrasenaHash)) {
    return null;
  }

  return usuario;
}