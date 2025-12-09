-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CEDULA', 'PASAPORTE', 'RUC', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCasoClinico" AS ENUM ('EN_REVISION', 'APROBADO', 'PENDIENTE_ESTUDIOS', 'EN_TRATAMIENTO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoTratamiento" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TipoDiagnostico" AS ENUM ('Presuntivo', 'Definitivo');

-- CreateEnum
CREATE TYPE "EstadoPrescripcion" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_PROCESO', 'COMPLETADO', 'INCOMPLETO');

-- CreateEnum
CREATE TYPE "TipoPregunta" AS ENUM ('SI_NO', 'TEXTO', 'NUMERICO', 'FECHA', 'OPCION_MULTIPLE');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('DISPONIBLE', 'RESERVADA', 'CANCELADA', 'FINALIZADA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "EstadoObservacion" AS ENUM ('PENDIENTE', 'REVISADO', 'FINALIZADO', 'INCOMPLETO');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "TipoClinica" AS ENUM ('FIJA', 'MOVIL', 'TEMPORAL');

-- CreateEnum
CREATE TYPE "EstadoClinica" AS ENUM ('ACTIVA', 'INACTIVA', 'MANTENIMIENTO', 'EN_RUTA', 'FUERA_SERVICIO');

-- CreateEnum
CREATE TYPE "TipoDocumentoRepresentante" AS ENUM ('CEDULA', 'PASAPORTE', 'RUC', 'OTRO');

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
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas_adicionales" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parroquia_id" INTEGER,
    "rol_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,

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
    "Nacionalidad" TEXT,
    "parroquia_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT,
    "empresa_laboral" TEXT,
    "estado_civil" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ocupacion" TEXT,
    "relacionRep" TEXT,
    "representante" TEXT,
    "telefonoRep" TEXT,
    "numero_documento_rep" TEXT,
    "tipoDocumentoRep" "TipoDocumentoRepresentante",
    "numeroDocumento" TEXT,
    "tipoDocumento" "TipoDocumento",

    CONSTRAINT "Pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasosClinicos" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "especialidad_id" INTEGER NOT NULL,
    "calificacion" INTEGER,
    "estado" "EstadoCasoClinico" NOT NULL DEFAULT 'EN_REVISION',
    "ATM" TEXT NOT NULL,
    "CarayCuello" TEXT NOT NULL,
    "PielyMucosa" TEXT NOT NULL,
    "craneo" TEXT NOT NULL,
    "enfermedadActual" TEXT NOT NULL,
    "facies" TEXT NOT NULL,
    "marcha" TEXT NOT NULL,
    "motivoConsulta" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "talla" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CasosClinicos_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Tratamientos" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "docente_id" INTEGER,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "caso_clinico_id" INTEGER NOT NULL,
    "estado" "EstadoTratamiento" NOT NULL DEFAULT 'PENDIENTE',
    "cie10_codigo" TEXT,
    "frecuencia_cardiaca" TEXT NOT NULL,
    "presArterial" TEXT NOT NULL,
    "procedimiento" TEXT,
    "saturacion_oxigeno" TEXT NOT NULL,
    "temperatura" TEXT NOT NULL,
    "tipoDiagnostico" "TipoDiagnostico" NOT NULL DEFAULT 'Presuntivo',

    CONSTRAINT "Tratamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CIE10yOtrasClasificaciones" (
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "CIE10yOtrasClasificaciones_pkey" PRIMARY KEY ("codigo")
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
    "concentracion" TEXT NOT NULL,
    "nrodefarmacos" INTEGER NOT NULL,
    "presentacion" TEXT NOT NULL,
    "viadeadministracion" TEXT NOT NULL,

    CONSTRAINT "Prescripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odontogramas" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conclusion" TEXT,
    "caso_clinico_id" INTEGER,
    "docente_id" INTEGER,
    "estudiante_id" INTEGER NOT NULL,
    "condicion" JSONB NOT NULL,
    "diente" TEXT NOT NULL,

    CONSTRAINT "Odontogramas_pkey" PRIMARY KEY ("id")
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
    "descripcion" TEXT,

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

-- CreateTable
CREATE TABLE "Permisos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,

    CONSTRAINT "Permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolesPermisos" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "RolesPermisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuariosPermisos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "otorgado_por" INTEGER,
    "fecha_otorgamiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "justificacion" TEXT,

    CONSTRAINT "UsuariosPermisos_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_numeroDocumento_key" ON "Usuarios"("numeroDocumento");

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

-- CreateIndex
CREATE UNIQUE INDEX "Pacientes_numeroDocumento_key" ON "Pacientes"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Permisos_nombre_key" ON "Permisos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "RolesPermisos_role_id_permiso_id_key" ON "RolesPermisos"("role_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsuariosPermisos_usuario_id_permiso_id_key" ON "UsuariosPermisos"("usuario_id", "permiso_id");

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

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_parroquia_id_fkey" FOREIGN KEY ("parroquia_id") REFERENCES "Parroquias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosEspecialidades" ADD CONSTRAINT "UsuariosEspecialidades_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosEspecialidades" ADD CONSTRAINT "UsuariosEspecialidades_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provincias" ADD CONSTRAINT "Provincias_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "Paises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cantones" ADD CONSTRAINT "Cantones_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "Provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parroquias" ADD CONSTRAINT "Parroquias_canton_id_fkey" FOREIGN KEY ("canton_id") REFERENCES "Cantones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacientes" ADD CONSTRAINT "Pacientes_parroquia_id_fkey" FOREIGN KEY ("parroquia_id") REFERENCES "Parroquias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasosClinicos" ADD CONSTRAINT "CasosClinicos_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreguntaClinica" ADD CONSTRAINT "PreguntaClinica_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaClinica" ADD CONSTRAINT "RespuestaClinica_casoClinicoId_fkey" FOREIGN KEY ("casoClinicoId") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaClinica" ADD CONSTRAINT "RespuestaClinica_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "PreguntaClinica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_cie10_codigo_fkey" FOREIGN KEY ("cie10_codigo") REFERENCES "CIE10yOtrasClasificaciones"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamientos" ADD CONSTRAINT "Tratamientos_procedimiento_fkey" FOREIGN KEY ("procedimiento") REFERENCES "CIE10yOtrasClasificaciones"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescripciones" ADD CONSTRAINT "Prescripciones_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odontogramas" ADD CONSTRAINT "Odontogramas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallazgoClinico" ADD CONSTRAINT "HallazgoClinico_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallazgoClinico" ADD CONSTRAINT "HallazgoClinico_casoClinicoId_fkey" FOREIGN KEY ("casoClinicoId") REFERENCES "CasosClinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaTamizaje" ADD CONSTRAINT "RespuestaTamizaje_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "PreguntaTamizaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaTamizaje" ADD CONSTRAINT "EncuestaTamizaje_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citas" ADD CONSTRAINT "Citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_caso_clinico_id_fkey" FOREIGN KEY ("caso_clinico_id") REFERENCES "CasosClinicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_odontograma_id_fkey" FOREIGN KEY ("odontograma_id") REFERENCES "Odontogramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_prescripcion_id_fkey" FOREIGN KEY ("prescripcion_id") REFERENCES "Prescripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observaciones" ADD CONSTRAINT "Observaciones_tratamiento_id_fkey" FOREIGN KEY ("tratamiento_id") REFERENCES "Tratamientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitudes" ADD CONSTRAINT "Solicitudes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitudes" ADD CONSTRAINT "Solicitudes_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "Especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitudes" ADD CONSTRAINT "Solicitudes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "RolesPermisos" ADD CONSTRAINT "RolesPermisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "Permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolesPermisos" ADD CONSTRAINT "RolesPermisos_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosPermisos" ADD CONSTRAINT "UsuariosPermisos_otorgado_por_fkey" FOREIGN KEY ("otorgado_por") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosPermisos" ADD CONSTRAINT "UsuariosPermisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "Permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosPermisos" ADD CONSTRAINT "UsuariosPermisos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
