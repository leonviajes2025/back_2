import { NextRequest, NextResponse } from "next/server";

// Rutas a proteger (no incluir rutas públicas como creación/login)
const PROTECTED = [
  { path: "/api/contactos", methods: ["GET"] },
  { path: "/api/productos/", methods: ["DELETE"] }, // match prefix + id
  { path: "/api/contactos-whats", methods: ["GET"] },
  { path: "/api/boton-whats", methods: ["GET"] },
  { path: "/api/usuarios-acceso", methods: ["GET"] },
  { path: "/api/usuarios-acceso/", methods: ["PUT"] }, // prefix for /[id]
  { path: "/api/logs-errores", methods: ["GET"] },
];

function isProtectedRoute(urlPath: string, method: string) {
  for (const r of PROTECTED) {
    if (r.path.endsWith("/")) {
      if (urlPath.startsWith(r.path) && r.methods.includes(method)) return true;
    } else {
      if (urlPath === r.path && r.methods.includes(method)) return true;
    }
  }
  return false;
}

function base64UrlToUint8Array(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  const padded = b64 + (pad ? "=".repeat(4 - pad) : "");
  const binary = atob(padded);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bufToBase64Url(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyJwtEdge(token: string, secret: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );

    const sig = await crypto.subtle.sign("HMAC", key, signingInput);
    const sigB64u = bufToBase64Url(sig);
    if (sigB64u !== signatureB64) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (!isProtectedRoute(pathname, method)) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return new NextResponse(JSON.stringify({ message: "No autorizado" }), { status: 401, headers: { "content-type": "application/json" } });

  const secret = process.env.JWT_SECRET || "";
  if (!secret) return new NextResponse(JSON.stringify({ message: "Server misconfigured" }), { status: 500, headers: { "content-type": "application/json" } });

  const payload = await verifyJwtEdge(token, secret);
  if (!payload || !payload.tienePermiso) {
    return new NextResponse(JSON.stringify({ message: "No autorizado" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  // usuario autorizado
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/contactos",
    "/api/contactos-whats",
    "/api/boton-whats",
    "/api/usuarios-acceso",
    "/api/usuarios-acceso/:path*",
    "/api/productos/:path*",
    "/api/logs-errores",
  ],
};
