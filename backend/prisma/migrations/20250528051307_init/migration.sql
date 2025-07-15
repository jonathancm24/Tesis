-- CreateEnum
CREATE TYPE "EstadoCasoClinico" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'REVISION_PROFESOR', 'APROBADO', 'RECHAZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoTratamiento" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "EstadoPrescripcion" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_PROCESO', 'COMPLETADO', 'INCOMPLETO');

-- CreateEnum
CREATE TYPE "EstadoOdontograma" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('DISPONIBLE', 'RESERVADA', 'CANCELADA', 'FINALIZADA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "EstadoObservacion" AS ENUM ('PENDIENTE', 'REVISADO', 'FINALIZADO', 'INCOMPLETO');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas_adicionales" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parroquia_id" INTEGER,
    "rol_id" INTEGER NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuariosEspecialidades" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "especialidad_id" INTEGER NOT NULL,

    CONSTRAINT "UsuariosEspecialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paises" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Paises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provincias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "pais_id" INTEGER NOT NULL,

    CONSTRAINT "Provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cantones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provincia_id" INTEGER NOT NULL,

    CONSTRAINT "Cantones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parroquias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "canton_id" INTEGER NOT NULL,

    CONSTRAINT "Parroquias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pacientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "genero" TEXT,
    "tipo_sangre" TEXT,
    "Nacionalidad" TEXT,
    "parroquia_id" INTEGER NOT NULL,

    CONSTRAINT "Pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasosClinicos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "especialidad_id" INTEGER NOT NULL,
    "calificacion" INTEGER,
    "estado" "EstadoCasoClinico" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "CasosClinicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tratamientos" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "docente_id" INTEGER,
    "descripcion" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "caso_clinico_id" INTEGER NOT NULL,
    "estado" "EstadoTratamiento" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "Tratamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescripciones" (
    "id" SERIAL NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dosis" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "duracion" TEXT NOT NULL,
    "estado" "EstadoPrescripcion" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "caso_clinico_id" INTEGER NOT NULL,

    CONSTRAINT "Prescripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odontogramas" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "datos" JSONB NOT NULL,
    "estado" "EstadoOdontograma" NOT NULL DEFAULT 'PENDIENTE',
    "conclusion" TEXT,
    "paciente_id" INTEGER NOT NULL,
    "caso_clinico_id" INTEGER,
    "docente_id" INTEGER,
    "estudiante_id" INTEGER NOT NULL,

    CONSTRAINT "Odontogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialMedico" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "medicamentos" TEXT,
    "alergias" TEXT,
    "enfermedades_importantes" TEXT,
    "observaciones_criticas" TEXT,
    "paciente_id" INTEGER NOT NULL,

    CONSTRAINT "HistorialMedico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citas" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'RESERVADA',
    "observaciones" TEXT,
    "paciente_id" INTEGER NOT NULL,
    "especialidad_id" INTEGER NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "docente_id" INTEGER,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observaciones" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoObservacion" NOT NULL DEFAULT 'PENDIENTE',
    "descripcion" TEXT NOT NULL,
    "contenido_estudiante" TEXT,
    "contenido_docente" TEXT,
    "estudiante_id" INTEGER NOT NULL,
    "docente_id" INTEGER,
    "odontograma_id" INTEGER,
    "tratamiento_id" INTEGER,
    "prescripcion_id" INTEGER,
    "caso_clinico_id" INTEGER,

    CONSTRAINT "Observaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitudes" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "estudiante_id" INTEGER NOT NULL,
    "docente_id" INTEGER,
    "especialidad_id" INTEGER NOT NULL,

    CONSTRAINT "Solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Archivos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "Archivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivosRelacionados" (
    "id" SERIAL NOT NULL,
    "archivo_id" INTEGER NOT NULL,
    "entidad_tipo" TEXT NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "rol" TEXT,

    CONSTRAINT "ArchivosRelacionados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disponibilidad" (
    "id" SERIAL NOT NULL,
    "dia" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "Disponibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logs" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "detalle" JSONB,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_cedula_key" ON "Usuarios"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidades_nombre_key" ON "Especialidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Paises_nombre_key" ON "Paises"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Provincias_nombre_key" ON "Provincias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cantones_nombre_key" ON "Cantones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Parroquias_nombre_key" ON "Parroquias"("nombre");

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_parroquia_id_fkey" FOREIGN KEY ("parroquia_id") REFERENCES "Parroquias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosEspecialidades" ADD CONSTRAINT "UsuariosEspecialidades_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosEspecialidades" ADD CONSTRAINT "UsuariosEspecialidades_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provincias" ADD CONSTRAINT "Provincias_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "Paises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cantones" ADD CONSTRAINT "Cantones_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "Provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parroquias" ADD CONSTRAINT "Parroquias_canton_id_fkey" FOREIGN KEY ("canton_id") REFERENCES "Cantones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacientes" ADD CONSTRAINT "Pacientes_parroquia_id_fkey" FOREIGN KEY ("parroquia_id") REFERENCES "Parroquias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescripciones" ADD CONSTRAINT "Prescripciones_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialMedico" ADD CONSTRAINT "HistorialMedico_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_odontograma_id_fkey" FOREIGN KEY ("odontograma_id") REFERENCES "Odontogramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_tratamiento_id_fkey" FOREIGN KEY ("tratamiento_id") REFERENCES "Tratamientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_prescripcion_id_fkey" FOREIGN KEY ("prescripcion_id") REFERENCES "Prescripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitudes" ADD CONSTRAINT "Solicitudes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitudes" ADD CONSTRAINT "Solicitudes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitudes" ADD CONSTRAINT "Solicitudes_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archivos" ADD CONSTRAINT "Archivos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivosRelacionados" ADD CONSTRAINT "ArchivosRelacionados_archivo_id_fkey" FOREIGN KEY ("archivo_id") REFERENCES "Archivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivosRelacionados" ADD CONSTRAINT "ArchivosRelacionados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilidad" ADD CONSTRAINT "Disponibilidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
