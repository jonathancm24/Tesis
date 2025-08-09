/*
  Warnings:

  - You are about to drop the column `cedulaRep` on the `Pacientes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoDocumentoRepresentante" AS ENUM ('CEDULA', 'PASAPORTE', 'RUC', 'OTRO');

-- AlterTable
ALTER TABLE "Pacientes" DROP COLUMN "cedulaRep",
ADD COLUMN     "numero_documento_rep" TEXT,
ADD COLUMN     "tipoDocumentoRep" "TipoDocumentoRepresentante";
