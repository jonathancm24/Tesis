/*
  Warnings:

  - The values [PENDIENTE,EN_PROCESO,REVISION_PROFESOR,RECHAZADO] on the enum `EstadoCasoClinico` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `descripcion` on the `CasosClinicos` table. All the data in the column will be lost.
  - You are about to drop the column `datos` on the `Odontogramas` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Odontogramas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_actualizacion` on the `Odontogramas` table. All the data in the column will be lost.
  - You are about to drop the column `paciente_id` on the `Odontogramas` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_sangre` on the `Pacientes` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_fin` on the `Tratamientos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `Tratamientos` table. All the data in the column will be lost.
  - You are about to drop the `HistorialMedico` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cedula]` on the table `Pacientes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ATM` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CarayCuello` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PielyMucosa` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `craneo` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enfermedadActual` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facies` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marcha` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivoConsulta` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peso` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `talla` to the `CasosClinicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condicion` to the `Odontogramas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diente` to the `Odontogramas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cedula` to the `Pacientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `concentracion` to the `Prescripciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nrodefarmacos` to the `Prescripciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentacion` to the `Prescripciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viadeadministracion` to the `Prescripciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frecuencia_cardiaca` to the `Tratamientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presArterial` to the `Tratamientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saturacion_oxigeno` to the `Tratamientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperatura` to the `Tratamientos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDiagnostico" AS ENUM ('Presuntivo', 'Definitivo');

-- CreateEnum
CREATE TYPE "TipoPregunta" AS ENUM ('SI_NO', 'TEXTO', 'NUMERICO', 'FECHA', 'OPCION_MULTIPLE');

-- CreateEnum
CREATE TYPE "TipoClinica" AS ENUM ('FIJA', 'MOVIL', 'TEMPORAL');

-- CreateEnum
CREATE TYPE "EstadoClinica" AS ENUM ('ACTIVA', 'INACTIVA', 'MANTENIMIENTO', 'EN_RUTA', 'FUERA_SERVICIO');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoCasoClinico_new" AS ENUM ('EN_REVISION', 'APROBADO', 'PENDIENTE_ESTUDIOS', 'EN_TRATAMIENTO', 'FINALIZADO', 'CANCELADO');
ALTER TABLE "CasosClinicos" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "CasosClinicos" ALTER COLUMN "estado" TYPE "EstadoCasoClinico_new" USING ("estado"::text::"EstadoCasoClinico_new");
ALTER TYPE "EstadoCasoClinico" RENAME TO "EstadoCasoClinico_old";
ALTER TYPE "EstadoCasoClinico_new" RENAME TO "EstadoCasoClinico";
DROP TYPE "EstadoCasoClinico_old";
ALTER TABLE "CasosClinicos" ALTER COLUMN "estado" SET DEFAULT 'EN_REVISION';
COMMIT;

-- DropForeignKey
ALTER TABLE "HistorialMedico" DROP CONSTRAINT "HistorialMedico_paciente_id_fkey";

-- DropForeignKey
ALTER TABLE "Odontogramas" DROP CONSTRAINT "Odontogramas_paciente_id_fkey";

-- AlterTable
ALTER TABLE "Archivos" ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "CasosClinicos" DROP COLUMN "descripcion",
ADD COLUMN     "ATM" TEXT NOT NULL,
ADD COLUMN     "CarayCuello" TEXT NOT NULL,
ADD COLUMN     "PielyMucosa" TEXT NOT NULL,
ADD COLUMN     "craneo" TEXT NOT NULL,
ADD COLUMN     "enfermedadActual" TEXT NOT NULL,
ADD COLUMN     "facies" TEXT NOT NULL,
ADD COLUMN     "marcha" TEXT NOT NULL,
ADD COLUMN     "motivoConsulta" TEXT NOT NULL,
ADD COLUMN     "peso" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "talla" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'EN_REVISION';

-- AlterTable
ALTER TABLE "Odontogramas" DROP COLUMN "datos",
DROP COLUMN "estado",
DROP COLUMN "fecha_actualizacion",
DROP COLUMN "paciente_id",
ADD COLUMN     "condicion" JSONB NOT NULL,
ADD COLUMN     "diente" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pacientes" DROP COLUMN "tipo_sangre",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cedula" TEXT NOT NULL,
ADD COLUMN     "cedulaRep" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "empresa_laboral" TEXT,
ADD COLUMN     "estado_civil" TEXT,
ADD COLUMN     "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ocupacion" TEXT,
ADD COLUMN     "relacionRep" TEXT,
ADD COLUMN     "representante" TEXT,
ADD COLUMN     "telefonoRep" TEXT;

-- AlterTable
ALTER TABLE "Prescripciones" ADD COLUMN     "concentracion" TEXT NOT NULL,
ADD COLUMN     "nrodefarmacos" INTEGER NOT NULL,
ADD COLUMN     "presentacion" TEXT NOT NULL,
ADD COLUMN     "viadeadministracion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tratamientos" DROP COLUMN "fecha_fin",
DROP COLUMN "fecha_inicio",
ADD COLUMN     "cie10_codigo" TEXT,
ADD COLUMN     "frecuencia_cardiaca" TEXT NOT NULL,
ADD COLUMN     "presArterial" TEXT NOT NULL,
ADD COLUMN     "procedimiento" TEXT,
ADD COLUMN     "saturacion_oxigeno" TEXT NOT NULL,
ADD COLUMN     "temperatura" TEXT NOT NULL,
ADD COLUMN     "tipoDiagnostico" "TipoDiagnostico" NOT NULL DEFAULT 'Presuntivo';

-- DropTable
DROP TABLE "HistorialMedico";

-- DropEnum
DROP TYPE "EstadoOdontograma";

-- CreateTable
CREATE TABLE "PreguntaClinica" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "TipoPregunta" NOT NULL,
    "obligatoria" BOOLEAN NOT NULL DEFAULT false,
    "especialidadId" INTEGER,

    CONSTRAINT "PreguntaClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaClinica" (
    "id" SERIAL NOT NULL,
    "casoClinicoId" INTEGER NOT NULL,
    "preguntaId" INTEGER NOT NULL,
    "respuesta" TEXT NOT NULL,

    CONSTRAINT "RespuestaClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CIE10yOtrasClasificaciones" (
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "CIE10yOtrasClasificaciones_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "HallazgoClinico" (
    "id" SERIAL NOT NULL,
    "casoClinicoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigoZona" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoId" INTEGER,

    CONSTRAINT "HallazgoClinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreguntaTamizaje" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "TipoPregunta" NOT NULL,
    "categoria" TEXT,
    "orden" INTEGER,
    "soloMujer" BOOLEAN NOT NULL DEFAULT false,
    "requiereDetalle" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PreguntaTamizaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaTamizaje" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "historialId" INTEGER,
    "preguntaId" INTEGER NOT NULL,
    "respuesta" TEXT,
    "detalle" TEXT,

    CONSTRAINT "RespuestaTamizaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncuestaTamizaje" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncuestaTamizaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinicas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoClinica" NOT NULL,
    "estado" "EstadoClinica" NOT NULL DEFAULT 'ACTIVA',
    "descripcion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "capacidad_pacientes" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "direccion_base" TEXT,
    "parroquia_base_id" INTEGER,
    "placa_vehiculo" TEXT,
    "modelo_vehiculo" TEXT,
    "ano_vehiculo" INTEGER,

    CONSTRAINT "Clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalClinicas" (
    "id" SERIAL NOT NULL,
    "clinica_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "es_responsable" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,

    CONSTRAINT "PersonalClinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorariosClinicas" (
    "id" SERIAL NOT NULL,
    "clinica_id" INTEGER NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_apertura" TEXT NOT NULL,
    "hora_cierre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HorariosClinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CasosClinicosPorClinica" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CasosClinicosPorClinica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EncuestaTamizajeToRespuestaTamizaje" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EncuestaTamizajeToRespuestaTamizaje_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CitasPorClinica" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CitasPorClinica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinicas_nombre_key" ON "Clinicas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Clinicas_codigo_key" ON "Clinicas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalClinicas_clinica_id_usuario_id_fecha_asignacion_key" ON "PersonalClinicas"("clinica_id", "usuario_id", "fecha_asignacion");

-- CreateIndex
CREATE INDEX "_CasosClinicosPorClinica_B_index" ON "_CasosClinicosPorClinica"("B");

-- CreateIndex
CREATE INDEX "_EncuestaTamizajeToRespuestaTamizaje_B_index" ON "_EncuestaTamizajeToRespuestaTamizaje"("B");

-- CreateIndex
CREATE INDEX "_CitasPorClinica_B_index" ON "_CitasPorClinica"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Pacientes_cedula_key" ON "Pacientes"("cedula");

-- AddForeignKey
ALTER TABLE "PreguntaClinica" ADD CONSTRAINT "PreguntaClinica_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaClinica" ADD CONSTRAINT "RespuestaClinica_casoClinicoId_fkey" FOREIGN KEY ("casoClinicoId") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaClinica" ADD CONSTRAINT "RespuestaClinica_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "PreguntaClinica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_cie10_codigo_fkey" FOREIGN KEY ("cie10_codigo") REFERENCES "CIE10yOtrasClasificaciones"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_procedimiento_fkey" FOREIGN KEY ("procedimiento") REFERENCES "CIE10yOtrasClasificaciones"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallazgoClinico" ADD CONSTRAINT "HallazgoClinico_casoClinicoId_fkey" FOREIGN KEY ("casoClinicoId") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallazgoClinico" ADD CONSTRAINT "HallazgoClinico_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaTamizaje" ADD CONSTRAINT "RespuestaTamizaje_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "PreguntaTamizaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaTamizaje" ADD CONSTRAINT "EncuestaTamizaje_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clinicas" ADD CONSTRAINT "Clinicas_parroquia_base_id_fkey" FOREIGN KEY ("parroquia_base_id") REFERENCES "Parroquias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalClinicas" ADD CONSTRAINT "PersonalClinicas_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "Clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalClinicas" ADD CONSTRAINT "PersonalClinicas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorariosClinicas" ADD CONSTRAINT "HorariosClinicas_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "Clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CasosClinicosPorClinica" ADD CONSTRAINT "_CasosClinicosPorClinica_A_fkey" FOREIGN KEY ("A") REFERENCES "CasosClinicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CasosClinicosPorClinica" ADD CONSTRAINT "_CasosClinicosPorClinica_B_fkey" FOREIGN KEY ("B") REFERENCES "Clinicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EncuestaTamizajeToRespuestaTamizaje" ADD CONSTRAINT "_EncuestaTamizajeToRespuestaTamizaje_A_fkey" FOREIGN KEY ("A") REFERENCES "EncuestaTamizaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EncuestaTamizajeToRespuestaTamizaje" ADD CONSTRAINT "_EncuestaTamizajeToRespuestaTamizaje_B_fkey" FOREIGN KEY ("B") REFERENCES "RespuestaTamizaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CitasPorClinica" ADD CONSTRAINT "_CitasPorClinica_A_fkey" FOREIGN KEY ("A") REFERENCES "Citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CitasPorClinica" ADD CONSTRAINT "_CitasPorClinica_B_fkey" FOREIGN KEY ("B") REFERENCES "Clinicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
