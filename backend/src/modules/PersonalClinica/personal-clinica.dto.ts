/**
 * DTOs para el módulo de Personal de Clínica
 * 
 * Define los objetos de transferencia de datos para gestionar
 * la asignación de personal (docentes, estudiantes, coordinadores)
 * a las diferentes clínicas del sistema universitario.
 * 
 * @fileoverview DTOs del módulo de personal de clínica
 * @module PersonalClinicaDTO
 */

import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
  Length
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para asignar personal a una clínica
 * 
 * Valida los datos necesarios para crear una nueva
 * asignación de personal a una clínica específica.
 */
export class AsignarPersonalClinicaDto {
  @ApiProperty({
    description: 'ID de la clínica donde se asignará el personal',
    example: 1
  })
  @IsInt({ message: 'El ID de clínica debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  clinicaId: number;

  @ApiProperty({
    description: 'ID del usuario que será asignado a la clínica',
    example: 5
  })
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  usuarioId: number;

  @ApiPropertyOptional({
    description: 'Indica si el usuario será responsable de la clínica',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esResponsable debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  esResponsable?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre la asignación',
    example: 'Asignado como coordinador de turno matutino',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @Length(0, 500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}

/**
 * DTO para actualizar asignación de personal
 * 
 * Permite modificar los datos de una asignación existente,
 * incluyendo la posibilidad de finalizar la asignación.
 */
export class ActualizarPersonalClinicaDto extends PartialType(AsignarPersonalClinicaDto) {
  @ApiPropertyOptional({
    description: 'Fecha de fin de la asignación (ISO 8601). Si se proporciona, finaliza la asignación',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener formato ISO 8601' })
  fechaFin?: string;
}

/**
 * DTO para filtros de búsqueda de personal de clínica
 * 
 * Permite consultar asignaciones de personal aplicando
 * diversos filtros para facilitar la gestión.
 */
export class FiltrosPersonalClinicaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de clínica específica',
    example: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de clínica debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  clinicaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario específico',
    example: 5
  })
  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar solo personal responsable de clínicas',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro esResponsable debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  esResponsable?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo asignaciones activas (sin fecha de fin)',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro soloActivos debe ser verdadero o falso' })
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

  @ApiPropertyOptional({
    description: 'Incluir información detallada del usuario',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluirUsuario?: boolean;
}

/**
 * DTO para respuesta de personal de clínica
 * 
 * Estructura de datos que se retorna al consultar
 * asignaciones de personal, incluyendo relaciones opcionales.
 */
export class PersonalClinicaRespuestaDto {
  @ApiProperty({ description: 'ID único de la asignación', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID de la clínica', example: 1 })
  clinicaId: number;

  @ApiProperty({ description: 'ID del usuario asignado', example: 5 })
  usuarioId: number;

  @ApiProperty({ 
    description: 'Fecha de inicio de la asignación',
    example: '2024-01-15T09:00:00.000Z'
  })
  fechaAsignacion: Date;

  @ApiPropertyOptional({ 
    description: 'Fecha de fin de la asignación (null si está activa)',
    example: null
  })
  fechaFin?: Date;

  @ApiProperty({ 
    description: 'Indica si es responsable de la clínica',
    example: false
  })
  esResponsable: boolean;

  @ApiPropertyOptional({ 
    description: 'Observaciones sobre la asignación',
    example: 'Coordinador de turno matutino'
  })
  observaciones?: string;

  // Información de la clínica (opcional)
  @ApiPropertyOptional({
    description: 'Información de la clínica asignada'
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

  // Información del usuario (opcional)
  @ApiPropertyOptional({
    description: 'Información del usuario asignado'
  })
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    numeroDocumento: string;
    role: {
      id: number;
      nombre: string;
    };
    especialidades?: {
      id: number;
      nombre: string;
    }[];
  };

  // Estado calculado
  @ApiProperty({
    description: 'Estado calculado de la asignación',
    example: 'ACTIVA',
    enum: ['ACTIVA', 'FINALIZADA']
  })
  estado: 'ACTIVA' | 'FINALIZADA';

  @ApiPropertyOptional({
    description: 'Número de días desde la asignación',
    example: 45
  })
  diasAsignacion?: number;
}

/**
 * DTO para estadísticas de personal de clínica
 * 
 * Estructura para datos estadísticos del sistema
 * de asignaciones de personal.
 */
export class EstadisticasPersonalClinicaDto {
  @ApiProperty({
    description: 'Total de asignaciones en el sistema',
    example: 25
  })
  totalAsignaciones: number;

  @ApiProperty({
    description: 'Asignaciones activas (sin fecha de fin)',
    example: 18
  })
  asignacionesActivas: number;

  @ApiProperty({
    description: 'Asignaciones finalizadas',
    example: 7
  })
  asignacionesFinalizadas: number;

  @ApiProperty({
    description: 'Número de responsables de clínica activos',
    example: 5
  })
  responsablesActivos: number;

  @ApiProperty({
    description: 'Distribución por tipo de clínica',
    example: {
      FIJA: 12,
      MOVIL: 5,
      TEMPORAL: 1
    }
  })
  porTipoClinica: Record<string, number>;

  @ApiProperty({
    description: 'Distribución por rol de usuario',
    example: {
      'Docente': 8,
      'Estudiante': 7,
      'Coordinador': 3
    }
  })
  porRolUsuario: Record<string, number>;

  @ApiProperty({
    description: 'Clínicas con mayor personal asignado',
    example: [
      { clinicaId: 1, nombre: 'Clínica Central', totalPersonal: 5 },
      { clinicaId: 2, nombre: 'Clínica Móvil Norte', totalPersonal: 3 }
    ]
  })
  clinicasConMasPersonal: Array<{
    clinicaId: number;
    nombre: string;
    totalPersonal: number;
  }>;
}
