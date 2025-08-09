/*
  Warnings:

  - You are about to drop the column `cedula` on the `Pacientes` table. All the data in the column will be lost.
  - You are about to drop the column `cedula` on the `Usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `Pacientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroDocumento` to the `Pacientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `Pacientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDocumento` to the `Usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `Usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CEDULA', 'PASAPORTE', 'RUC', 'OTRO');

-- 1. Agregar columnas como OPCIONALES primero
ALTER TABLE "Usuarios" ADD COLUMN "tipoDocumento" "TipoDocumento";
ALTER TABLE "Usuarios" ADD COLUMN "numeroDocumento" TEXT;

ALTER TABLE "Pacientes" ADD COLUMN "tipoDocumento" "TipoDocumento";
ALTER TABLE "Pacientes" ADD COLUMN "numeroDocumento" TEXT;

-- 2. Migrar datos existentes
-- Para Usuarios: copiar cedula a numeroDocumento y asignar tipo CEDULA
UPDATE "Usuarios" 
SET "numeroDocumento" = "cedula", 
    "tipoDocumento" = 'CEDULA'
WHERE "cedula" IS NOT NULL;

-- Para Pacientes: copiar cedula a numeroDocumento y asignar tipo CEDULA  
UPDATE "Pacientes" 
SET "numeroDocumento" = "cedula",
    "tipoDocumento" = 'CEDULA'
WHERE "cedula" IS NOT NULL;

-- 3. Hacer campos obligatorios DESPUÉS de migrar datos
ALTER TABLE "Usuarios" ALTER COLUMN "tipoDocumento" SET NOT NULL;
ALTER TABLE "Usuarios" ALTER COLUMN "numeroDocumento" SET NOT NULL;

ALTER TABLE "Pacientes" ALTER COLUMN "tipoDocumento" SET NOT NULL;
ALTER TABLE "Pacientes" ALTER COLUMN "numeroDocumento" SET NOT NULL;

-- 4. Agregar índices únicos
CREATE UNIQUE INDEX "Usuarios_numeroDocumento_key" ON "Usuarios"("numeroDocumento");
CREATE UNIQUE INDEX "Pacientes_numeroDocumento_key" ON "Pacientes"("numeroDocumento");

-- 5. Eliminar columnas antiguas al final
ALTER TABLE "Usuarios" DROP COLUMN "cedula";
ALTER TABLE "Pacientes" DROP COLUMN "cedula";
