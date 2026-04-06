CREATE TABLE "usuarios_acceso" (
    "id" SERIAL NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "tienePermiso" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_acceso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inicios_sesion" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inicios_sesion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_acceso_nombreUsuario_key" ON "usuarios_acceso"("nombreUsuario");

CREATE INDEX "inicios_sesion_idUsuario_idx" ON "inicios_sesion"("idUsuario");

ALTER TABLE "inicios_sesion"
ADD CONSTRAINT "inicios_sesion_idUsuario_fkey"
FOREIGN KEY ("idUsuario") REFERENCES "usuarios_acceso"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;