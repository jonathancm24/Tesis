import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsInt, 
  IsEnum, 
  IsOptional, 
  Length, 
  Min,
  IsDateString,
  IsArray,
  ValidateIf,
  IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoSolicitud } from '@prisma/client';

/**
 * DTO para crear una nueva solicitud
 * Utilizado cuando un estudiante envía una solicitud de asignación a especialidad
 */
export class CrearSolicitudDto {
  @ApiProperty({
    description: 'ID del estudiante que realiza la solicitud',
    example: 123,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  estudianteId: number;

  @ApiProperty({
    description: 'ID de la especialidad solicitada',
    example: 5,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  especialidadId: number;

  @ApiPropertyOptional({
    description: 'Observaciones o comentarios adicionales del estudiante',
    example: 'Me interesa especialmente la ortodoncia preventiva en pacientes pediátricos',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Motivación del estudiante para solicitar esta especialidad',
    example: 'Deseo enfocar mi carrera en el tratamiento de pacientes infantiles',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(20, 1000)
  motivacion?: string;

  @ApiPropertyOptional({
    description: 'Experiencia previa relevante del estudiante',
    example: 'Voluntariado en clínica dental comunitaria por 6 meses',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  experienciaPrevia?: string;

  @ApiPropertyOptional({
    description: 'Disponibilidad horaria del estudiante',
    example: 'Mañanas de lunes a viernes, tardes de martes y jueves',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(10, 300)
  disponibilidadHoraria?: string;
}

/**
 * DTO para solicitud rápida
 * Versión simplificada para solicitudes básicas
 */
export class CrearSolicitudRapidaDto {
  @ApiProperty({
    description: 'ID de la especialidad solicitada',
    example: 5,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  especialidadId: number;

  @ApiPropertyOptional({
    description: 'Observaciones breves',
    example: 'Solicito asignación a esta especialidad',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  observaciones?: string;
}

/**
 * DTO para actualizar información básica de solicitud
 * Permite al estudiante modificar su solicitud antes de ser procesada
 */
export class ActualizarSolicitudBasicaDto {
  @ApiPropertyOptional({
    description: 'Nuevas observaciones o comentarios',
    example: 'Actualizo mi solicitud con información adicional sobre mi interés',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Motivación actualizada',
    example: 'He confirmado mi interés tras conversaciones con profesores del área',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(20, 1000)
  motivacion?: string;

  @ApiPropertyOptional({
    description: 'Experiencia previa actualizada',
    example: 'Agregando experiencia reciente en prácticas clínicas',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  experienciaPrevia?: string;

  @ApiPropertyOptional({
    description: 'Disponibilidad horaria actualizada',
    example: 'Modifico mi disponibilidad para adaptarme mejor a los horarios',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(10, 300)
  disponibilidadHoraria?: string;
}

/**
 * DTO para procesar solicitud por parte del docente
 * Incluye aprobación, rechazo y asignación de docente
 */
export class ProcesarSolicitudDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud',
    enum: EstadoSolicitud,
    example: 'APROBADA'
  })
  @IsEnum(EstadoSolicitud)
  nuevoEstado: EstadoSolicitud;

  @ApiProperty({
    description: 'ID del docente que procesa la solicitud',
    example: 456,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  docenteId: number;

  @ApiPropertyOptional({
    description: 'Comentarios del docente sobre la decisión',
    example: 'Solicitud aprobada. El estudiante muestra gran interés y preparación',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  comentariosDocente?: string;

  @ApiPropertyOptional({
    description: 'Motivo de rechazo (requerido si estado es RECHAZADA)',
    example: 'No cumple con los requisitos mínimos de experiencia previa',
    maxLength: 500
  })
  @ValidateIf(o => o.nuevoEstado === EstadoSolicitud.RECHAZADA)
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  motivoRechazo?: string;

  @ApiPropertyOptional({
    description: 'Recomendaciones para el estudiante',
    example: 'Se recomienda completar curso de actualización antes de nueva solicitud',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  recomendaciones?: string;

  @ApiPropertyOptional({
    description: 'Fecha propuesta para inicio de actividades (si es aprobada)',
    example: '2025-09-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicioActividades?: string;
}

/**
 * DTO para cancelar solicitud
 * Permite al estudiante cancelar su solicitud con justificación
 */
export class CancelarSolicitudDto {
  @ApiProperty({
    description: 'Motivo de cancelación',
    example: 'He decidido enfocarme en otra especialidad por el momento',
    maxLength: 500
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  motivoCancelacion: string;

  @ApiPropertyOptional({
    description: 'Indica si planea solicitar nuevamente en el futuro',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  planeaSolicitarNuevamente?: boolean;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales',
    example: 'Espero poder aplicar el próximo semestre',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  comentariosAdicionales?: string;
}

/**
 * DTO para asignar docente a solicitud
 * Permite asignar o cambiar el docente responsable de una solicitud
 */
export class AsignarDocenteDto {
  @ApiProperty({
    description: 'ID del docente a asignar',
    example: 789,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  docenteId: number;

  @ApiPropertyOptional({
    description: 'Comentarios sobre la asignación',
    example: 'Docente especializado en el área de interés del estudiante',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  comentariosAsignacion?: string;

  @ApiPropertyOptional({
    description: 'Fecha propuesta para primera reunión',
    example: '2025-08-20'
  })
  @IsOptional()
  @IsDateString()
  fechaPrimeraReunion?: string;
}

/**
 * DTO para solicitud masiva
 * Permite crear múltiples solicitudes para varios estudiantes
 */
export class CrearSolicitudMasivaDto {
  @ApiProperty({
    description: 'Lista de IDs de estudiantes',
    example: [123, 124, 125],
    type: [Number]
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  estudianteIds: number[];

  @ApiProperty({
    description: 'ID de la especialidad',
    example: 5,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  especialidadId: number;

  @ApiPropertyOptional({
    description: 'Observaciones comunes para todas las solicitudes',
    example: 'Solicitudes generadas por proceso de asignación semestral',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(10, 300)
  observacionesComunes?: string;

  @ApiPropertyOptional({
    description: 'ID del docente responsable del proceso',
    example: 456,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  docenteResponsableId?: number;
}

/**
 * DTO para solicitud con prioridad
 * Para solicitudes especiales que requieren procesamiento prioritario
 */
export class CrearSolicitudPrioritariaDto extends CrearSolicitudDto {
  @ApiProperty({
    description: 'Nivel de prioridad de la solicitud',
    enum: ['ALTA', 'MEDIA', 'BAJA'],
    example: 'ALTA'
  })
  @IsEnum(['ALTA', 'MEDIA', 'BAJA'])
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';

  @ApiProperty({
    description: 'Justificación de la prioridad',
    example: 'Estudiante en último semestre con necesidad urgente de completar especialización',
    maxLength: 500
  })
  @IsNotEmpty()
  @IsString()
  @Length(20, 500)
  justificacionPrioridad: string;

  @ApiPropertyOptional({
    description: 'Fecha límite para procesamiento',
    example: '2025-08-30'
  })
  @IsOptional()
  @IsDateString()
  fechaLimite?: string;

  @ApiPropertyOptional({
    description: 'ID del coordinador que autoriza la prioridad',
    example: 789,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  coordinadorAutorizaId?: number;
}

/**
 * DTO para respuesta a solicitud
 * Permite al docente enviar respuestas o solicitar información adicional
 */
export class ResponderSolicitudDto {
  @ApiProperty({
    description: 'ID de la solicitud a responder',
    example: 123,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  solicitudId: number;

  @ApiProperty({
    description: 'Mensaje de respuesta',
    example: 'Necesito información adicional sobre su experiencia en ortodoncia',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 1000)
  mensaje: string;

  @ApiPropertyOptional({
    description: 'Tipo de respuesta',
    enum: ['INFORMACION_ADICIONAL', 'ACLARACION', 'DECISION', 'SEGUIMIENTO'],
    example: 'INFORMACION_ADICIONAL'
  })
  @IsOptional()
  @IsEnum(['INFORMACION_ADICIONAL', 'ACLARACION', 'DECISION', 'SEGUIMIENTO'])
  tipoRespuesta?: 'INFORMACION_ADICIONAL' | 'ACLARACION' | 'DECISION' | 'SEGUIMIENTO';

  @ApiPropertyOptional({
    description: 'Requiere respuesta del estudiante',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  requiereRespuesta?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha límite para respuesta del estudiante',
    example: '2025-08-25'
  })
  @IsOptional()
  @IsDateString()
  fechaLimiteRespuesta?: string;
}

/**
 * DTO para programar entrevista
 * Permite programar entrevistas como parte del proceso de solicitud
 */
export class ProgramarEntrevistaDto {
  @ApiProperty({
    description: 'ID de la solicitud',
    example: 123,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  solicitudId: number;

  @ApiProperty({
    description: 'Fecha y hora de la entrevista',
    example: '2025-08-25T10:00:00Z'
  })
  @IsDateString()
  fechaHoraEntrevista: string;

  @ApiPropertyOptional({
    description: 'Modalidad de la entrevista',
    enum: ['PRESENCIAL', 'VIRTUAL', 'TELEFONICA'],
    example: 'PRESENCIAL'
  })
  @IsOptional()
  @IsEnum(['PRESENCIAL', 'VIRTUAL', 'TELEFONICA'])
  modalidad?: 'PRESENCIAL' | 'VIRTUAL' | 'TELEFONICA';

  @ApiPropertyOptional({
    description: 'Ubicación o enlace para la entrevista',
    example: 'Consultorio 205, Facultad de Odontología',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Duración estimada en minutos',
    example: 30,
    minimum: 15,
    maximum: 120
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Min(120)
  duracionMinutos?: number;

  @ApiPropertyOptional({
    description: 'Temas a tratar en la entrevista',
    example: 'Experiencia previa, expectativas, disponibilidad horaria',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  temasATratar?: string;

  @ApiPropertyOptional({
    description: 'Instrucciones adicionales para el estudiante',
    example: 'Traer portafolio de trabajos previos y certificados relevantes',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  instrucciones?: string;
}
