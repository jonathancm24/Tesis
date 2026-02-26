/*
  Warnings:

  - The values [NUMERICO,OPCION_MULTIPLE] on the enum `TipoPregunta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoPregunta_new" AS ENUM ('SI_NO', 'TEXTO', 'NUMERO', 'FECHA', 'MULTIPLE_SELECCION', 'TEXTAREA');
ALTER TABLE "PreguntaClinica" ALTER COLUMN "tipo" TYPE "TipoPregunta_new" USING ("tipo"::text::"TipoPregunta_new");
ALTER TABLE "PreguntaTamizaje" ALTER COLUMN "tipo" TYPE "TipoPregunta_new" USING ("tipo"::text::"TipoPregunta_new");
ALTER TYPE "TipoPregunta" RENAME TO "TipoPregunta_old";
ALTER TYPE "TipoPregunta_new" RENAME TO "TipoPregunta";
DROP TYPE "TipoPregunta_old";
COMMIT;
