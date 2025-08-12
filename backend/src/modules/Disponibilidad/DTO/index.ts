/**
 * Data Transfer Objects (DTOs) para Disponibilidad
 * 
 * Define las estructuras de datos y validaciones para la gestión
 * de disponibilidad horaria de estudiantes en el sistema académico.
 * Los estudiantes pueden definir sus horarios de atención y los
 * secretarios solo pueden asignar citas en horarios disponibles.
 * 
 * @fileoverview DTOs con validación para gestión de disponibilidad
 * @module DisponibilidadDTOs
 * @requires class-validator, class-transformer, swagger, prisma
 */

import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  Matches,
  IsBoolean,
  ArrayNotEmpty,
  ArrayUnique
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType
} from '@nestjs/swagger';
import { DiaSemana } from '@prisma/client';

// Re-exportar el enum de Prisma para consistencia
export { DiaSemana } from '@prisma/client';

/**
 * DTO para crear una nueva disponibilidad horaria
 * 
 * Valida que un estudiante pueda definir su disponibilidad
 * para un día específico con horario de inicio y fin.
 * 
 * @example
 * {
 *   "dia": "LUNES",
 *   "horaInicio": "08:00",
 *   "horaFin": "12:00",
 *   "usuarioId": 2
 * }
 */
export class CrearDisponibilidadDto {
  @ApiProperty({
    description: 'Día de la semana para la disponibilidad',
    enum: DiaSemana,
    example: DiaSemana.LUNES
  })
  @IsNotEmpty({ message: 'El día de la semana es obligatorio' })
  @IsEnum(DiaSemana, { message: 'Debe ser un día de la semana válido' })
  dia: DiaSemana;

  @ApiProperty({
    description: 'Hora de inicio de disponibilidad (formato HH:MM)',
    example: '08:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe tener formato HH:MM (24 horas)'
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin de disponibilidad (formato HH:MM)',
    example: '12:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @IsString({ message: 'La hora de fin debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe tener formato HH:MM (24 horas)'
  })
  horaFin: string;

  @ApiPropertyOptional({
    description: 'ID del usuario (estudiante). Si no se proporciona, se usa el usuario autenticado',
    example: 2,
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  usuarioId?: number;
}

/**
 * DTO para actualizar disponibilidad existente
 * 
 * Permite modificar parcialmente los datos de una disponibilidad.
 * Todos los campos son opcionales para actualizaciones flexibles.
 * 
 * @example
 * {
 *   "horaInicio": "09:00",
 *   "horaFin": "13:00"
 * }
 */
export class ActualizarDisponibilidadDto extends PartialType(CrearDisponibilidadDto) {
  @ApiPropertyOptional({
    description: 'Día de la semana para la disponibilidad',
    enum: DiaSemana,
    example: DiaSemana.MARTES
  })
  @IsOptional()
  @IsEnum(DiaSemana, { message: 'Debe ser un día de la semana válido' })
  dia?: DiaSemana;

  @ApiPropertyOptional({
    description: 'Hora de inicio de disponibilidad (formato HH:MM)',
    example: '09:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora de inicio debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe tener formato HH:MM (24 horas)'
  })
  horaInicio?: string;

  @ApiPropertyOptional({
    description: 'Hora de fin de disponibilidad (formato HH:MM)',
    example: '13:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora de fin debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe tener formato HH:MM (24 horas)'
  })
  horaFin?: string;
}

/**
 * DTO para filtros de búsqueda de disponibilidades
 * 
 * Permite filtrar disponibilidades por múltiples criterios
 * con paginación y ordenamiento.
 * 
 * @example
 * {
 *   "usuarioId": 2,
 *   "dia": "LUNES",
 *   "soloActivas": true,
 *   "página": 1,
 *   "límite": 10
 * }
 */
export class FiltrosDisponibilidadDto {
  @ApiPropertyOptional({
    description: 'ID del usuario (estudiante) para filtrar',
    example: 2,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Día de la semana para filtrar',
    enum: DiaSemana,
    example: DiaSemana.LUNES
  })
  @IsOptional()
  @IsEnum(DiaSemana, { message: 'Debe ser un día de la semana válido' })
  dia?: DiaSemana;

  @ApiPropertyOptional({
    description: 'Filtrar por días específicos',
    type: [String],
    enum: DiaSemana,
    example: [DiaSemana.LUNES, DiaSemana.MARTES]
  })
  @IsOptional()
  @IsArray({ message: 'Los días deben ser un array' })
  @ArrayNotEmpty({ message: 'El array de días no puede estar vacío' })
  @IsEnum(DiaSemana, { each: true, message: 'Cada día debe ser válido' })
  @ArrayUnique({ message: 'No se permiten días duplicados' })
  dias?: DiaSemana[];

  @ApiPropertyOptional({
    description: 'Hora mínima de inicio para filtrar (formato HH:MM)',
    example: '08:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora mínima debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora mínima debe tener formato HH:MM'
  })
  horaMinima?: string;

  @ApiPropertyOptional({
    description: 'Hora máxima de fin para filtrar (formato HH:MM)',
    example: '18:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora máxima debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora máxima debe tener formato HH:MM'
  })
  horaMaxima?: string;

  @ApiPropertyOptional({
    description: 'Solo mostrar disponibilidades activas/válidas',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  soloActivas?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir información del usuario en la respuesta',
    example: true,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluirUsuario?: boolean = false;

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
    description: 'Número de elementos por página',
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
    description: 'Campo por el cual ordenar',
    enum: ['id', 'dia', 'horaInicio', 'horaFin', 'usuarioId'],
    example: 'dia',
    default: 'dia'
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser un string' })
  ordenarPor?: string = 'dia';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc'
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un string' })
  @IsEnum(['asc', 'desc'], { message: 'La dirección debe ser asc o desc' })
  dirección?: 'asc' | 'desc' = 'asc';
}

/**
 * DTO para crear múltiples disponibilidades en una sola operación
 * 
 * Permite definir disponibilidad para múltiples días de forma eficiente.
 * Útil para configuraciones semanales completas.
 * 
 * @example
 * {
 *   "usuarioId": 2,
 *   "disponibilidades": [
 *     { "dia": "LUNES", "horaInicio": "08:00", "horaFin": "12:00" },
 *     { "dia": "MARTES", "horaInicio": "08:00", "horaFin": "12:00" }
 *   ]
 * }
 */
export class CrearDisponibilidadMasivaDto {
  @ApiPropertyOptional({
    description: 'ID del usuario (estudiante). Si no se proporciona, se usa el usuario autenticado',
    example: 2,
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  usuarioId?: number;

  @ApiProperty({
    description: 'Array de disponibilidades a crear',
    type: [CrearDisponibilidadDto],
    example: [
      { dia: 'LUNES', horaInicio: '08:00', horaFin: '12:00' },
      { dia: 'MARTES', horaInicio: '08:00', horaFin: '12:00' }
    ]
  })
  @IsNotEmpty({ message: 'Las disponibilidades son obligatorias' })
  @IsArray({ message: 'Las disponibilidades deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos una disponibilidad' })
  @ValidateNested({ each: true })
  @Type(() => CrearDisponibilidadDto)
  disponibilidades: Omit<CrearDisponibilidadDto, 'usuarioId'>[];
}

/**
 * DTO para consultar disponibilidad de un usuario en una fecha específica
 * 
 * Permite verificar si un estudiante está disponible en una fecha
 * y hora específica para asignación de citas.
 * 
 * @example
 * {
 *   "usuarioId": 2,
 *   "fecha": "2025-01-15",
 *   "horaInicio": "09:00",
 *   "horaFin": "10:00"
 * }
 */
export class ConsultarDisponibilidadEspecificaDto {
  @ApiProperty({
    description: 'ID del usuario (estudiante) a consultar',
    example: 2,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  usuarioId: number;

  @ApiProperty({
    description: 'Fecha a consultar (formato YYYY-MM-DD)',
    example: '2025-01-15'
  })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsString({ message: 'La fecha debe ser un string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener formato YYYY-MM-DD'
  })
  fecha: string;

  @ApiProperty({
    description: 'Hora de inicio a verificar (formato HH:MM)',
    example: '09:00'
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe tener formato HH:MM'
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin a verificar (formato HH:MM)',
    example: '10:00'
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @IsString({ message: 'La hora de fin debe ser un string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe tener formato HH:MM'
  })
  horaFin: string;
}

/**
 * DTO para respuesta paginada de disponibilidades
 * 
 * Estructura estándar para respuestas de listas paginadas
 * con metadatos de paginación.
 */
export class RespuestaPaginadaDisponibilidadDto {
  @ApiProperty({
    description: 'Lista de disponibilidades',
    type: 'array'
  })
  disponibilidades: any[];

  @ApiProperty({
    description: 'Número total de registros',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1
  })
  página: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 10
  })
  límite: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 3
  })
  totalPáginas: number;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true
  })
  tieneSiguiente: boolean;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false
  })
  tieneAnterior: boolean;
}

/**
 * DTO para estadísticas de disponibilidad
 * 
 * Proporciona métricas básicas del sistema de disponibilidad
 * para dashboards y reportes.
 */
export class EstadisticasDisponibilidadDto {
  @ApiProperty({
    description: 'Total de disponibilidades registradas',
    example: 150
  })
  totalDisponibilidades: number;

  @ApiProperty({
    description: 'Número de estudiantes con disponibilidad configurada',
    example: 25
  })
  estudiantesConDisponibilidad: number;

  @ApiProperty({
    description: 'Día con más disponibilidades',
    example: 'LUNES'
  })
  diaMasPopular: string;

  @ApiProperty({
    description: 'Hora promedio de inicio',
    example: '08:30'
  })
  horaPromedioInicio: string;

  @ApiProperty({
    description: 'Hora promedio de fin',
    example: '17:00'
  })
  horaPromedioFin: string;

  @ApiProperty({
    description: 'Distribución por días de la semana',
    example: {
      LUNES: 30,
      MARTES: 28,
      MIERCOLES: 25,
      JUEVES: 27,
      VIERNES: 22,
      SABADO: 10,
      DOMINGO: 8
    }
  })
  distribucionPorDia: Record<string, number>;
}

/**
 * DTO para validar horarios de disponibilidad
 * 
 * Utilizado internamente para validaciones de negocio
 * y verificación de conflictos.
 */
export class ValidarHorarioDisponibilidadDto {
  @ApiProperty({
    description: 'Hora de inicio del horario',
    example: '08:00'
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin del horario',
    example: '12:00'
  })
  horaFin: string;

  @ApiProperty({
    description: 'Día de la semana',
    enum: DiaSemana,
    example: DiaSemana.LUNES
  })
  dia: DiaSemana;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 2
  })
  usuarioId: number;

  @ApiPropertyOptional({
    description: 'ID de disponibilidad a excluir de la validación (para actualizaciones)',
    example: 5
  })
  excluirId?: number;
}
