import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createHmac } from "node:crypto";

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

const DEFAULT_EXPIRATION_SECONDS = 60 * 60 * 24; // 24h

function base64UrlEncode(buffer: Buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(str: string) {
  return base64UrlEncode(Buffer.from(str, "utf8"));
}

export function generarTokenJWT(payload: Record<string, any>, expiresInSeconds = DEFAULT_EXPIRATION_SECONDS) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está configurado en las variables de entorno");

  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };

  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedBody = base64UrlEncodeString(JSON.stringify(body));

  const signingInput = `${encodedHeader}.${encodedBody}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest();

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

export function verificarTokenJWT(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const expectedSig = createHmac("sha256", secret).update(signingInput).digest();
    const providedSig = Buffer.from(
      signatureB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (signatureB64.length % 4)) % 4),
      "base64",
    );

    if (expectedSig.length !== providedSig.length) return null;

    if (!timingSafeEqual(expectedSig, providedSig)) return null;

    const payloadJson = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (payloadB64.length % 4)) % 4), "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function requireApiKey(request: Request) {
  const headerKey = request.headers.get("x-api-key") ?? null;

  const authHeader = request.headers.get("authorization");
  const bearerKey = authHeader && authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  const providedKey = headerKey ?? bearerKey;
  const serverKey = process.env.PRIVATE_API_KEY ?? "";

  // Si falta la key en producción es un error de configuración
  if (!serverKey && process.env.NODE_ENV === "production") {
    console.error("PRIVATE_API_KEY no configurada en el entorno");
    throw new Response("Server misconfiguration", { status: 500 });
  }

  try {
    // Si no se provee credencial
    if (!providedKey) {
      if (process.env.NODE_ENV === "production") {
        try {
          const { prisma } = await import("@/lib/prisma");
          prisma.logError.create({
            data: {
              dominio: "security",
              origen: request.url ?? undefined,
              metodo: request.method ?? undefined,
              codigo: "UNAUTHORIZED",
              mensaje: "Intento de acceso sin API key",
              contexto: JSON.stringify(Object.fromEntries(request.headers.entries())),
            },
          }).catch(() => {});
        } catch {}

        throw new Response("Unauthorized", { status: 401 });
      }

      // En desarrollo permitimos llamadas sin API key para facilitar pruebas locales
      console.warn("Dev: request sin API key, se permite para pruebas locales");
      return true;
    }

    // Si la credencial parece un JWT, intentar verificarlo
    if (providedKey.split(".").length === 3) {
      const payload = verificarTokenJWT(providedKey);
      if (payload) return true;
      // si el JWT no es válido, continuar y validar contra PRIVATE_API_KEY
    }

    // Si no hay serverKey pero no estamos en producción, permitir (dev)
    if (!serverKey && process.env.NODE_ENV !== "production") {
      console.warn("Dev: PRIVATE_API_KEY no configurada, permitiendo credencial para pruebas");
      return true;
    }

    const providedBuffer = Buffer.from(providedKey);
    const serverBuffer = Buffer.from(serverKey);

    if (providedBuffer.length !== serverBuffer.length || !timingSafeEqual(providedBuffer, serverBuffer)) {
      try {
        const { prisma } = await import("@/lib/prisma");
        prisma.logError.create({
          data: {
            dominio: "security",
            origen: request.url ?? undefined,
            metodo: request.method ?? undefined,
            codigo: "UNAUTHORIZED",
            mensaje: "API key inválida (timingSafeEqual)",
            contexto: JSON.stringify(Object.fromEntries(request.headers.entries())),
          },
        }).catch(() => {});
      } catch {}

      throw new Response("Unauthorized", { status: 401 });
    }

    return true;
  } catch (err) {
    if (err instanceof Response) throw err;
    throw new Response("Unauthorized", { status: 401 });
  }
}