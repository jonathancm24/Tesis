/**
 * DTOs para el módulo de Horarios de Clínica
 * 
 * Define los objetos de transferencia de datos para gestionar
 * los horarios de atención de las clínicas del sistema universitario.
 * Incluye validaciones para crear, actualizar y consultar horarios.
 * 
 * @fileoverview DTOs del módulo de horarios de clínica
 * @module HorarioClinicaDTO
 */

import {
  IsInt,
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Enum para los días de la semana
 * Debe coincidir con el enum DiaSemana del schema de Prisma
 */
export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

/**
 * DTO para crear un nuevo horario de clínica
 * 
 * Valida todos los datos necesarios para registrar
 * un horario de atención en una clínica específica.
 */
export class CrearHorarioClinicaDto {
  @ApiProperty({
    description: 'ID de la clínica para la cual se define el horario',
    example: 1
  })
  @IsInt({ message: 'El ID de clínica debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  clinicaId: number;

  @ApiProperty({
    description: 'Día de la semana para el horario',
    enum: DiaSemana,
    example: DiaSemana.LUNES
  })
  @IsEnum(DiaSemana, { message: 'Debe seleccionar un día de la semana válido' })
  diaSemana: DiaSemana;

  @ApiProperty({
    description: 'Hora de apertura en formato HH:MM (24 horas)',
    example: '08:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'La hora de apertura debe ser una cadena de texto' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de apertura debe tener formato HH:MM (24 horas)'
  })
  horaApertura: string;

  @ApiProperty({
    description: 'Hora de cierre en formato HH:MM (24 horas)',
    example: '17:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'La hora de cierre debe ser una cadena de texto' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de cierre debe tener formato HH:MM (24 horas)'
  })
  horaCierre: string;

  @ApiPropertyOptional({
    description: 'Indica si el horario está activo',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  activo?: boolean;
}

/**
 * DTO para actualizar un horario de clínica existente
 * 
 * Permite modificación parcial de los datos del horario.
 * Todos los campos son opcionales excepto validaciones de negocio.
 */
export class ActualizarHorarioClinicaDto extends PartialType(CrearHorarioClinicaDto) {
  // Hereda todos los campos como opcionales del DTO de creación
}

/**
 * DTO para filtros de búsqueda de horarios de clínica
 * 
 * Permite consultar horarios aplicando diversos filtros
 * para facilitar la gestión y consulta.
 */
export class FiltrosHorarioClinicaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de clínica específica',
    example: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de clínica debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  clinicaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por día de la semana específico',
    enum: DiaSemana,
    example: DiaSemana.LUNES
  })
  @IsOptional()
  @IsEnum(DiaSemana, { message: 'Debe seleccionar un día de la semana válido' })
  diaSemana?: DiaSemana;

  @ApiPropertyOptional({
    description: 'Filtrar solo horarios activos',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro activo debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  soloActivos?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de clínica',
    example: 'MOVIL',
    enum: ['FIJA', 'MOVIL', 'TEMPORAL']
  })
  @IsOptional()
  @IsString()
  tipoClinica?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de clínica',
    example: 'ACTIVA',
    enum: ['ACTIVA', 'INACTIVA', 'MANTENIMIENTO', 'EN_RUTA', 'FUERA_SERVICIO']
  })
  @IsOptional()
  @IsString()
  estadoClinica?: string;

  @ApiPropertyOptional({
    description: 'Incluir información detallada de la clínica',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluirClinica?: boolean;
}

/**
 * DTO para respuesta de horario de clínica
 * 
 * Estructura de datos que se retorna al consultar horarios,
 * incluyendo información calculada y relaciones opcionales.
 */
export class HorarioClinicaRespuestaDto {
  @ApiProperty({ description: 'ID único del horario', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID de la clínica', example: 1 })
  clinicaId: number;

  @ApiProperty({ 
    description: 'Día de la semana',
    enum: DiaSemana,
    example: DiaSemana.LUNES
  })
  diaSemana: DiaSemana;

  @ApiProperty({ 
    description: 'Hora de apertura',
    example: '08:00'
  })
  horaApertura: string;

  @ApiProperty({ 
    description: 'Hora de cierre',
    example: '17:00'
  })
  horaCierre: string;

  @ApiProperty({ 
    description: 'Estado del horario (activo/inactivo)',
    example: true
  })
  activo: boolean;

  // Información calculada
  @ApiProperty({
    description: 'Duración del horario en horas',
    example: 9
  })
  duracionHoras: number;

  @ApiProperty({
    description: 'Número del día de la semana (1=Lunes, 7=Domingo)',
    example: 1
  })
  numeroDia: number;

  @ApiProperty({
    description: 'Indica si es fin de semana',
    example: false
  })
  esFinDeSemana: boolean;

  // Información de la clínica (opcional)
  @ApiPropertyOptional({
    description: 'Información de la clínica'
  })
  clinica?: {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
    estado: string;
    descripcion?: string;
    telefono?: string;
    email?: string;
    capacidadPacientes?: number;
    direccionBase?: string;
    placaVehiculo?: string;
    parroquiaBase?: {
      id: number;
      nombre: string;
      canton: {
        nombre: string;
        provincia: {
          nombre: string;
        };
      };
    };
  };
}

/**
 * DTO para horarios agrupados por clínica
 * 
 * Estructura para mostrar todos los horarios de una clínica
 * organizados de manera comprensible.
 */
export class HorariosClinicaAgrupadosDto {
  @ApiProperty({ description: 'ID de la clínica', example: 1 })
  clinicaId: number;

  @ApiProperty({ description: 'Nombre de la clínica', example: 'Clínica Central' })
  nombreClinica: string;

  @ApiProperty({ description: 'Código de la clínica', example: 'CC-001' })
  codigoClinica: string;

  @ApiProperty({ description: 'Tipo de clínica', example: 'FIJA' })
  tipoClinica: string;

  @ApiProperty({ description: 'Estado de la clínica', example: 'ACTIVA' })
  estadoClinica: string;

  @ApiProperty({
    description: 'Horarios organizados por día de la semana',
    example: {
      LUNES: { horaApertura: '08:00', horaCierre: '17:00', activo: true },
      MARTES: { horaApertura: '08:00', horaCierre: '17:00', activo: true },
      MIERCOLES: { horaApertura: '08:00', horaCierre: '17:00', activo: true }
    }
  })
  horariosPorDia: Record<string, {
    id: number;
    horaApertura: string;
    horaCierre: string;
    activo: boolean;
    duracionHoras: number;
  }>;

  @ApiProperty({
    description: 'Total de días con horarios definidos',
    example: 5
  })
  totalDiasDefinidos: number;

  @ApiProperty({
    description: 'Total de días activos',
    example: 5
  })
  diasActivos: number;

  @ApiProperty({
    description: 'Total de horas de atención por semana',
    example: 45
  })
  totalHorasSemanales: number;
}

/**
 * DTO para estadísticas de horarios de clínica
 * 
 * Estructura para datos estadísticos del sistema de horarios.
 */
export class EstadisticasHorarioClinicaDto {
  @ApiProperty({
    description: 'Total de horarios definidos en el sistema',
    example: 35
  })
  totalHorarios: number;

  @ApiProperty({
    description: 'Horarios activos',
    example: 30
  })
  horariosActivos: number;

  @ApiProperty({
    description: 'Horarios inactivos',
    example: 5
  })
  horariosInactivos: number;

  @ApiProperty({
    description: 'Distribución por día de la semana',
    example: {
      LUNES: 8,
      MARTES: 8,
      MIERCOLES: 7,
      JUEVES: 8,
      VIERNES: 7,
      SABADO: 2,
      DOMINGO: 1
    }
  })
  porDiaSemana: Record<DiaSemana, number>;

  @ApiProperty({
    description: 'Distribución por tipo de clínica',
    example: {
      FIJA: 20,
      MOVIL: 12,
      TEMPORAL: 3
    }
  })
  porTipoClinica: Record<string, number>;

  @ApiProperty({
    description: 'Promedio de horas de atención por día',
    example: 8.5
  })
  promedioHorasPorDia: number;

  @ApiProperty({
    description: 'Clínicas con más horas de atención semanal',
    example: [
      { clinicaId: 1, nombre: 'Clínica Central', horasSemanales: 45 },
      { clinicaId: 2, nombre: 'Clínica Norte', horasSemanales: 40 }
    ]
  })
  clinicasConMasHoras: Array<{
    clinicaId: number;
    nombre: string;
    horasSemanales: number;
  }>;

  @ApiProperty({
    description: 'Clínicas sin horarios definidos',
    example: [
      { clinicaId: 5, nombre: 'Clínica Temporal Sur', tipo: 'TEMPORAL' }
    ]
  })
  clinicasSinHorarios: Array<{
    clinicaId: number;
    nombre: string;
    tipo: string;
  }>;
}
