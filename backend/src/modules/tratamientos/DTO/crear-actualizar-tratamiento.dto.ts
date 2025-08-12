import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Length,
  Min,
  Matches,
  IsNumber
} from 'class-validator';
import { EstadoTratamiento, TipoDiagnostico } from '@prisma/client';

/**
 * DTO para crear un nuevo tratamiento
 * El estado por defecto será PENDIENTE según el schema de Prisma
 */
export class CrearTratamientoDto {
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
  descripcion: string;

  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId: number;

  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId: number;

  @IsString({ message: 'La frecuencia cardíaca debe ser una cadena' })
  @IsNotEmpty({ message: 'La frecuencia cardíaca es obligatoria' })
  @Matches(/^\d{2,3}\s?(bpm|lpm)?$/i, { 
    message: 'Formato de frecuencia cardíaca inválido (ej: 70 bpm)' 
  })
  frecuenciaCardiaca: string;

  @IsString({ message: 'La presión arterial debe ser una cadena' })
  @IsNotEmpty({ message: 'La presión arterial es obligatoria' })
  @Matches(/^\d{2,3}\/\d{2,3}\s?(mmHg)?$/i, { 
    message: 'Formato de presión arterial inválido (ej: 120/80 mmHg)' 
  })
  presArterial: string;

  @IsString({ message: 'La saturación de oxígeno debe ser una cadena' })
  @IsNotEmpty({ message: 'La saturación de oxígeno es obligatoria' })
  @Matches(/^\d{2,3}%?$/i, { 
    message: 'Formato de saturación de oxígeno inválido (ej: 98%)' 
  })
  saturacionOxigeno: string;

  @IsString({ message: 'La temperatura debe ser una cadena' })
  @IsNotEmpty({ message: 'La temperatura es obligatoria' })
  @Matches(/^\d{2}\.?\d?°?[CF]?$/i, { 
    message: 'Formato de temperatura inválido (ej: 36.5°C)' 
  })
  temperatura: string;

  @IsEnum(TipoDiagnostico, { message: 'Tipo de diagnóstico inválido' })
  @IsOptional()
  tipoDiagnostico?: TipoDiagnostico = TipoDiagnostico.Presuntivo;

  @IsString({ message: 'El código CIE-10 debe ser una cadena' })
  @IsOptional()
  @Length(3, 10, { message: 'El código CIE-10 debe tener entre 3 y 10 caracteres' })
  cie10Codigo?: string;

  @IsString({ message: 'El código de procedimiento debe ser una cadena' })
  @IsOptional()
  @Length(3, 10, { message: 'El código de procedimiento debe tener entre 3 y 10 caracteres' })
  procedimientoCodigo?: string;
}

/**
 * DTO para actualizar información básica del tratamiento
 * Solo permite cambios que no afecten el estado (para estudiantes)
 */
export class ActualizarTratamientoBasicoDto {
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
  descripcion?: string;

  @IsString({ message: 'La frecuencia cardíaca debe ser una cadena' })
  @IsOptional()
  @Matches(/^\d{2,3}\s?(bpm|lpm)?$/i, { 
    message: 'Formato de frecuencia cardíaca inválido (ej: 70 bpm)' 
  })
  frecuenciaCardiaca?: string;

  @IsString({ message: 'La presión arterial debe ser una cadena' })
  @IsOptional()
  @Matches(/^\d{2,3}\/\d{2,3}\s?(mmHg)?$/i, { 
    message: 'Formato de presión arterial inválido (ej: 120/80 mmHg)' 
  })
  presArterial?: string;

  @IsString({ message: 'La saturación de oxígeno debe ser una cadena' })
  @IsOptional()
  @Matches(/^\d{2,3}%?$/i, { 
    message: 'Formato de saturación de oxígeno inválido (ej: 98%)' 
  })
  saturacionOxigeno?: string;

  @IsString({ message: 'La temperatura debe ser una cadena' })
  @IsOptional()
  @Matches(/^\d{2}\.?\d?°?[CF]?$/i, { 
    message: 'Formato de temperatura inválido (ej: 36.5°C)' 
  })
  temperatura?: string;

  @IsEnum(TipoDiagnostico, { message: 'Tipo de diagnóstico inválido' })
  @IsOptional()
  tipoDiagnostico?: TipoDiagnostico;

  @IsString({ message: 'El código CIE-10 debe ser una cadena' })
  @IsOptional()
  @Length(3, 10, { message: 'El código CIE-10 debe tener entre 3 y 10 caracteres' })
  cie10Codigo?: string;

  @IsString({ message: 'El código de procedimiento debe ser una cadena' })
  @IsOptional()
  @Length(3, 10, { message: 'El código de procedimiento debe tener entre 3 y 10 caracteres' })
  procedimientoCodigo?: string;
}

/**
 * DTO para actualizar el estado del tratamiento (solo profesores)
 * Incluye validaciones específicas para cambios de estado
 */
export class ActualizarEstadoTratamientoDto {
  @IsEnum(EstadoTratamiento, { message: 'Estado de tratamiento inválido' })
  estado: EstadoTratamiento;

  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId: number;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 500, { message: 'El motivo debe tener entre 5 y 500 caracteres' })
  motivo?: string; // Especialmente importante para rechazos
}

/**
 * DTO para actualización completa del tratamiento (solo profesores)
 * Permite cambiar tanto información médica como estado
 */
export class ActualizarTratamientoCompletoDto extends ActualizarTratamientoBasicoDto {
  @IsEnum(EstadoTratamiento, { message: 'Estado de tratamiento inválido' })
  @IsOptional()
  estado?: EstadoTratamiento;

  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @IsOptional()
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 500, { message: 'El motivo debe tener entre 5 y 500 caracteres' })
  motivo?: string;
}
