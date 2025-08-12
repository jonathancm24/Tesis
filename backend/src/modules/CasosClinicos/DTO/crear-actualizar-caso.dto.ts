import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  Length,
  Min,
  Max,
  IsPositive
} from 'class-validator';
import { EstadoCasoClinico } from '@prisma/client';

/**
 * DTO para crear un nuevo caso clínico
 * El estado por defecto será EN_REVISION según el schema de Prisma
 * Aprovecha el GlobalValidationPipe existente para validaciones automáticas
 */
export class CrearCasoClinicoDto {
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
  pacienteId: number;

  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @Min(1, { message: 'El ID del profesor debe ser mayor a 0' })
  profesorId: number;

  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId: number;

  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  especialidadId: number;

  @IsString({ message: 'La información de ATM debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La información de ATM es obligatoria' })
  @Length(10, 1000, { message: 'La información de ATM debe tener entre 10 y 1000 caracteres' })
  ATM: string;

  @IsString({ message: 'La información de cara y cuello debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La información de cara y cuello es obligatoria' })
  @Length(10, 1000, { message: 'La información de cara y cuello debe tener entre 10 y 1000 caracteres' })
  CarayCuello: string;

  @IsString({ message: 'La información de piel y mucosa debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La información de piel y mucosa es obligatoria' })
  @Length(10, 1000, { message: 'La información de piel y mucosa debe tener entre 10 y 1000 caracteres' })
  PielyMucosa: string;

  @IsString({ message: 'La información del cráneo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La información del cráneo es obligatoria' })
  @Length(10, 1000, { message: 'La información del cráneo debe tener entre 10 y 1000 caracteres' })
  craneo: string;

  @IsString({ message: 'La enfermedad actual debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La enfermedad actual es obligatoria' })
  @Length(20, 2000, { message: 'La enfermedad actual debe tener entre 20 y 2000 caracteres' })
  enfermedadActual: string;

  @IsString({ message: 'La información de facies debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La información de facies es obligatoria' })
  @Length(10, 500, { message: 'La información de facies debe tener entre 10 y 500 caracteres' })
  facies: string;

  @IsString({ message: 'La información de marcha debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La información de marcha es obligatoria' })
  @Length(10, 500, { message: 'La información de marcha debe tener entre 10 y 500 caracteres' })
  marcha: string;

  @IsString({ message: 'El motivo de consulta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo de consulta es obligatorio' })
  @Length(10, 1000, { message: 'El motivo de consulta debe tener entre 10 y 1000 caracteres' })
  motivoConsulta: string;

  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser un número positivo' })
  @Min(1, { message: 'El peso debe ser mayor a 1 kg' })
  @Max(300, { message: 'El peso debe ser menor a 300 kg' })
  peso: number;

  @IsNumber({}, { message: 'La talla debe ser un número' })
  @IsPositive({ message: 'La talla debe ser un número positivo' })
  @Min(0.3, { message: 'La talla debe ser mayor a 0.3 metros' })
  @Max(2.5, { message: 'La talla debe ser menor a 2.5 metros' })
  talla: number;
}

/**
 * DTO para actualizar información básica del caso clínico
 * Disponible para estudiantes solo cuando el estado es EN_REVISION
 * El GlobalValidationPipe maneja automáticamente las validaciones
 */
export class ActualizarCasoClinicoBasicoDto {
  @IsString({ message: 'La información de ATM debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'La información de ATM debe tener entre 10 y 1000 caracteres' })
  ATM?: string;

  @IsString({ message: 'La información de cara y cuello debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'La información de cara y cuello debe tener entre 10 y 1000 caracteres' })
  CarayCuello?: string;

  @IsString({ message: 'La información de piel y mucosa debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'La información de piel y mucosa debe tener entre 10 y 1000 caracteres' })
  PielyMucosa?: string;

  @IsString({ message: 'La información del cráneo debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'La información del cráneo debe tener entre 10 y 1000 caracteres' })
  craneo?: string;

  @IsString({ message: 'La enfermedad actual debe ser una cadena de texto' })
  @IsOptional()
  @Length(20, 2000, { message: 'La enfermedad actual debe tener entre 20 y 2000 caracteres' })
  enfermedadActual?: string;

  @IsString({ message: 'La información de facies debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 500, { message: 'La información de facies debe tener entre 10 y 500 caracteres' })
  facies?: string;

  @IsString({ message: 'La información de marcha debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 500, { message: 'La información de marcha debe tener entre 10 y 500 caracteres' })
  marcha?: string;

  @IsString({ message: 'El motivo de consulta debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'El motivo de consulta debe tener entre 10 y 1000 caracteres' })
  motivoConsulta?: string;

  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsOptional()
  @IsPositive({ message: 'El peso debe ser un número positivo' })
  @Min(1, { message: 'El peso debe ser mayor a 1 kg' })
  @Max(300, { message: 'El peso debe ser menor a 300 kg' })
  peso?: number;

  @IsNumber({}, { message: 'La talla debe ser un número' })
  @IsOptional()
  @IsPositive({ message: 'La talla debe ser un número positivo' })
  @Min(0.3, { message: 'La talla debe ser mayor a 0.3 metros' })
  @Max(2.5, { message: 'La talla debe ser menor a 2.5 metros' })
  talla?: number;
}

/**
 * DTO para actualizar el estado del caso clínico (solo profesores)
 * Incluye validaciones específicas para cambios de estado
 */
export class ActualizarEstadoCasoClinicoDto {
  @IsEnum(EstadoCasoClinico, { message: 'Estado de caso clínico inválido' })
  estado: EstadoCasoClinico;

  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @Min(1, { message: 'El ID del profesor debe ser mayor a 0' })
  profesorId: number;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 500, { message: 'El motivo debe tener entre 5 y 500 caracteres' })
  motivo?: string; // Requerido para ciertos cambios de estado

  @IsInt({ message: 'La calificación debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'La calificación debe ser mayor o igual a 0' })
  @Max(100, { message: 'La calificación debe ser menor o igual a 100' })
  calificacion?: number; // Solo para estados finales
}

/**
 * DTO para actualización completa del caso clínico (solo profesores)
 * Permite cambiar tanto información médica como estado y calificación
 */
export class ActualizarCasoClinicoCompletoDto extends ActualizarCasoClinicoBasicoDto {
  @IsEnum(EstadoCasoClinico, { message: 'Estado de caso clínico inválido' })
  @IsOptional()
  estado?: EstadoCasoClinico;

  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @IsOptional()
  @Min(1, { message: 'El ID del profesor debe ser mayor a 0' })
  profesorId?: number;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 500, { message: 'El motivo debe tener entre 5 y 500 caracteres' })
  motivo?: string;

  @IsInt({ message: 'La calificación debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'La calificación debe ser mayor o igual a 0' })
  @Max(100, { message: 'La calificación debe ser menor o igual a 100' })
  calificacion?: number;
}

/**
 * DTO para asignar/actualizar calificación
 * Solo disponible para profesores
 */
export class AsignarCalificacionDto {
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(0, { message: 'La calificación debe ser mayor o igual a 0' })
  @Max(100, { message: 'La calificación debe ser menor o igual a 100' })
  calificacion: number;

  @IsString({ message: 'La observación debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'La observación debe tener entre 10 y 1000 caracteres' })
  observacion?: string;

  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @Min(1, { message: 'El ID del profesor debe ser mayor a 0' })
  profesorId: number;
}
