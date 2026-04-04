ALTER TABLE "contactos_whats"
ADD COLUMN "nombre" TEXT;

UPDATE "contactos_whats"
SET "nombre" = 'Sin nombre'
WHERE "nombre" IS NULL;

ALTER TABLE "contactos_whats"
ALTER COLUMN "nombre" SET NOT NULL;