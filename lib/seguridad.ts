import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const LONGITUD_HASH = 64;

export function generarHashContrasena(contrasena: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(contrasena, salt, LONGITUD_HASH).toString("hex");

  return `${salt}:${hash}`;
}

export function verificarContrasena(contrasena: string, contrasenaHash: string) {
  const [salt, hashGuardado] = contrasenaHash.split(":");

  if (!salt || !hashGuardado) {
    return false;
  }

  try {
    const hashBuffer = Buffer.from(hashGuardado, "hex");
    const hashCalculado = scryptSync(contrasena, salt, hashBuffer.length);

    return timingSafeEqual(hashBuffer, hashCalculado);
  } catch {
    return false;
  }
}