/**
 * Data Transfer Objects para el módulo de Citas
 * 
 * Este archivo contiene todas las clases DTO utilizadas para validar
 * y estructurar los datos relacionados con citas médicas/odontológicas
 * en el sistema académico.
 * 
 * @fileoverview DTOs para validación de citas médicas
 * @module CitaDTO
 * @requires class-validator, class-transformer, swagger
 */

import { 
  IsInt, 
  IsString, 
  IsOptional, 
  IsNotEmpty,
  IsDateString,
  IsEnum,
  Min,
  Max,
  Length,
  IsBoolean,
  Matches,
  ArrayNotEmpty,
  IsArray
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * Estados posibles de una cita médica
 * Enum que define todos los estados que puede tener una cita
 */
export enum EstadoCita {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADA = 'RESERVADA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA',
  NO_ASISTIO = 'NO_ASISTIO'
}

// Re-exportar DiaSemana de Prisma para consistencia
export { DiaSemana } from '@prisma/client';

/**
 * DTO para crear una nueva cita médica
 * 
 * Valida todos los campos necesarios para agendar una cita,
 * incluyendo verificación de horarios y disponibilidad.
 * 
 * @example
 * {
 *   "pacienteId": 1,
 *   "estudianteId": 2,
 *   "especialidadId": 1,
 *   "fecha": "2025-01-15",
 *   "horaInicio": "09:00",
 *   "horaFin": "10:00",
 *   "docenteId": 3,
 *   "observaciones": "Primera consulta"
 * }
 */
export class CrearCitaDto {
  @ApiProperty({
    description: 'ID del paciente para la cita',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  pacienteId: number;

  @ApiProperty({
    description: 'ID del estudiante que atenderá la cita',
    example: 2,
    minimum: 1
  })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio' })
  estudianteId: number;

  @ApiProperty({
    description: 'ID de la especialidad médica',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El ID de la especialidad es obligatorio' })
  especialidadId: number;

  @ApiProperty({
    description: 'Fecha de la cita (formato YYYY-MM-DD)',
    example: '2025-01-15',
    format: 'date'
  })
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de la cita es obligatoria' })
  fecha: string;

  @ApiProperty({
    description: 'Hora de inicio de la cita (formato HH:MM)',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'La hora de inicio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe tener formato HH:MM (24 horas)'
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin de la cita (formato HH:MM)',
    example: '10:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'La hora de fin debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe tener formato HH:MM (24 horas)'
  })
  horaFin: string;

  @ApiPropertyOptional({
    description: 'ID del docente supervisor (opcional)',
    example: 3,
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre la cita',
    example: 'Primera consulta de ortodoncia',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @Length(0, 500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}

/**
 * DTO para actualizar una cita existente
 * 
 * Permite modificar campos específicos de una cita,
 * incluyendo cambio de estado y reagendamiento.
 */
export class ActualizarCitaDto extends PartialType(CrearCitaDto) {
  @ApiPropertyOptional({
    description: 'Nuevo estado de la cita',
    enum: EstadoCita,
    example: EstadoCita.FINALIZADA
  })
  @IsOptional()
  @IsEnum(EstadoCita, { message: 'Estado de cita no válido' })
  estado?: EstadoCita;

  @ApiPropertyOptional({
    description: 'Nueva fecha de la cita (reagendamiento)',
    example: '2025-01-16'
  })
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Nueva hora de inicio (reagendamiento)',
    example: '10:00'
  })
  horaInicio?: string;

  @ApiPropertyOptional({
    description: 'Nueva hora de fin (reagendamiento)',
    example: '11:00'
  })
  horaFin?: string;

  @ApiPropertyOptional({
    description: 'Observaciones actualizadas',
    example: 'Cita reagendada por solicitud del paciente'
  })
  observaciones?: string;
}

/**
 * DTO para filtros de búsqueda de citas
 * 
 * Permite filtrar citas por diversos criterios como
 * paciente, estudiante, fecha, estado, etc.
 */
export class FiltrosCitasDto {
  @ApiPropertyOptional({
    description: 'ID del paciente para filtrar citas',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
  pacienteId?: number;

  @ApiPropertyOptional({
    description: 'ID del estudiante para filtrar citas',
    example: 2,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'ID del docente para filtrar citas',
    example: 3,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'ID de la especialidad para filtrar',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  especialidadId?: number;

  @ApiPropertyOptional({
    description: 'Estado de la cita para filtrar',
    enum: EstadoCita,
    example: EstadoCita.RESERVADA
  })
  @IsOptional()
  @IsEnum(EstadoCita, { message: 'Estado de cita no válido' })
  estado?: EstadoCita;

  @ApiPropertyOptional({
    description: 'Fecha desde (formato YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha desde debe tener formato válido' })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (formato YYYY-MM-DD)',
    example: '2025-01-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha hasta debe tener formato válido' })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Hora desde (formato HH:MM)',
    example: '08:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora desde debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora desde debe tener formato HH:MM'
  })
  horaDesde?: string;

  @ApiPropertyOptional({
    description: 'Hora hasta (formato HH:MM)',
    example: '18:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora hasta debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora hasta debe tener formato HH:MM'
  })
  horaHasta?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda en observaciones',
    example: 'primera consulta'
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El término de búsqueda debe tener entre 2 y 100 caracteres' })
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  página?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  límite?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    example: 'fecha',
    enum: ['id', 'fecha', 'horaInicio', 'estado', 'pacienteId', 'estudianteId'],
    default: 'fecha'
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  @IsEnum(['id', 'fecha', 'horaInicio', 'estado', 'pacienteId', 'estudianteId'], { 
    message: 'Campo de ordenamiento no válido' 
  })
  ordenarPor?: string = 'fecha';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc'
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsEnum(['asc', 'desc'], { message: 'Dirección de ordenamiento no válida' })
  dirección?: string = 'asc';
}

/**
 * DTO para respuesta paginada de citas
 * 
 * Estructura la respuesta de consultas que incluyen paginación
 * y metadatos de la consulta.
 */
export class RespuestaPaginadaCitasDto {
  @ApiProperty({
    description: 'Lista de citas médicas',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        fecha: { type: 'string', format: 'date-time', example: '2025-01-15T09:00:00Z' },
        horaInicio: { type: 'string', format: 'date-time' },
        horaFin: { type: 'string', format: 'date-time' },
        estado: { type: 'string', enum: Object.values(EstadoCita) },
        observaciones: { type: 'string', nullable: true },
        paciente: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            apellido: { type: 'string' }
          }
        },
        estudiante: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            apellido: { type: 'string' }
          }
        },
        especialidad: {
          type: 'object',
          properties: {
            nombre: { type: 'string' }
          }
        }
      }
    }
  })
  citas: any[];

  @ApiProperty({
    description: 'Información de paginación',
    type: 'object',
    properties: {
      total: { type: 'number', example: 25 },
      página: { type: 'number', example: 1 },
      límite: { type: 'number', example: 10 },
      totalPáginas: { type: 'number', example: 3 }
    }
  })
  paginación: {
    total: number;
    página: number;
    límite: number;
    totalPáginas: number;
  };
}

/**
 * DTO para verificar disponibilidad de horarios
 * 
 * Valida los parámetros necesarios para consultar
 * la disponibilidad de un estudiante en una fecha específica.
 */
export class ConsultarDisponibilidadDto {
  @ApiProperty({
    description: 'ID del estudiante para consultar disponibilidad',
    example: 2,
    minimum: 1
  })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio' })
  estudianteId: number;

  @ApiProperty({
    description: 'Fecha para consultar disponibilidad (formato YYYY-MM-DD)',
    example: '2025-01-15'
  })
  @IsDateString({}, { message: 'La fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  fecha: string;

  @ApiPropertyOptional({
    description: 'ID de especialidad para filtrar disponibilidad',
    example: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  especialidadId?: number;
}

/**
 * DTO para estadísticas de citas
 * 
 * Estructura los datos estadísticos del módulo de citas.
 */
export class EstadisticasCitasDto {
  @ApiProperty({
    description: 'Total de citas registradas',
    example: 150
  })
  totalCitas: number;

  @ApiProperty({
    description: 'Distribución por estado de cita',
    example: {
      'RESERVADA': 45,
      'FINALIZADA': 30,
      'CANCELADA': 20,
      'NO_ASISTIO': 15
    }
  })
  porEstado: Record<string, number>;

  @ApiProperty({
    description: 'Citas por especialidad',
    example: {
      'Ortodoncia': 40,
      'Endodoncia': 35,
      'Cirugía Oral': 25
    }
  })
  porEspecialidad: Record<string, number>;

  @ApiProperty({
    description: 'Promedio de citas por día',
    example: 8.5
  })
  promedioPorDia: number;

  @ApiProperty({
    description: 'Tasa de cancelación (%)',
    example: 15.2
  })
  tasaCancelacion: number;

  @ApiProperty({
    description: 'Tasa de no asistencia (%)',
    example: 8.7
  })
  tasaNoAsistencia: number;

  @ApiProperty({
    description: 'Horarios más solicitados',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        hora: { type: 'string', example: '09:00' },
        cantidad: { type: 'number', example: 25 },
        porcentaje: { type: 'number', example: 16.7 }
      }
    }
  })
  horariosMasSolicitados: Array<{
    hora: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

/**
 * DTO para cambiar estado masivo de citas
 * 
 * Permite cambiar el estado de múltiples citas simultáneamente,
 * útil para operaciones administrativas.
 */
export class CambiarEstadoMasivoCitasDto {
  @ApiProperty({
    description: 'Lista de IDs de citas a modificar',
    example: [1, 2, 3, 4],
    type: 'array',
    items: { type: 'number' }
  })
  @IsArray({ message: 'Los IDs de citas deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un ID de cita' })
  @IsInt({ each: true, message: 'Todos los IDs deben ser números enteros' })
  @Min(1, { each: true, message: 'Todos los IDs deben ser mayor a 0' })
  citaIds: number[];

  @ApiProperty({
    description: 'Nuevo estado para todas las citas',
    enum: EstadoCita,
    example: EstadoCita.CANCELADA
  })
  @IsEnum(EstadoCita, { message: 'Estado de cita no válido' })
  @IsNotEmpty({ message: 'El nuevo estado es obligatorio' })
  nuevoEstado: EstadoCita;

  @ApiPropertyOptional({
    description: 'Motivo del cambio de estado',
    example: 'Cancelación por emergencia sanitaria',
    maxLength: 300
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @Length(0, 300, { message: 'El motivo no puede exceder 300 caracteres' })
  motivo?: string;
}
