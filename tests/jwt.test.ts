import { describe, it, expect, beforeAll } from "vitest";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_123";

import { generarTokenJWT, verificarTokenJWT } from "@/lib/seguridad";

describe("JWT generation and verification", () => {
  it("genera y verifica token correctamente", () => {
    const token = generarTokenJWT({ id: 1, nombreUsuario: "tester", tienePermiso: true }, 3600);

    const payload = verificarTokenJWT(token);

    expect(payload).not.toBeNull();
    expect(payload?.id).toBe(1);
    expect(payload?.nombreUsuario).toBe("tester");
    expect(payload?.tienePermiso).toBe(true);
  });

  it("detecta token expirado", () => {
    const token = generarTokenJWT({ id: 2, tienePermiso: true }, -10);
    const payload = verificarTokenJWT(token);

    expect(payload).toBeNull();
  });

  it("detecta token manipulado", () => {
    const token = generarTokenJWT({ id: 3, tienePermiso: true }, 3600);
    const parts = token.split(".");
    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const sig = parts[2];

    const payloadJson = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (payloadB64.length % 4)) % 4), "base64").toString("utf8");
    const obj = JSON.parse(payloadJson);
    obj.tienePermiso = false;

    const newPayloadB64 = Buffer.from(JSON.stringify(obj), "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const tampered = `${headerB64}.${newPayloadB64}.${sig}`;

    const result = verificarTokenJWT(tampered);
    expect(result).toBeNull();
  });
});
