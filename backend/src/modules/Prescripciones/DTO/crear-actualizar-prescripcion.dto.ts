import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsEnum, 
  IsOptional, 
  Length, 
  Min, 
  Max, 
  IsPositive,
  Matches,
  IsNumber,
  IsBoolean
} from 'class-validator';
import { EstadoPrescripcion } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una nueva prescripción médica
 * El estado por defecto será PENDIENTE según el schema de Prisma
 * Aprovecha el GlobalValidationPipe existente para validaciones automáticas
 */
export class CrearPrescripcionDto {
  @ApiProperty({
    description: 'ID del caso clínico al que pertenece la prescripción',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId: number;

  @ApiProperty({
    description: 'Nombre del medicamento prescrito',
    example: 'Amoxicilina',
    minLength: 2,
    maxLength: 200
  })
  @IsString({ message: 'El medicamento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El medicamento es obligatorio' })
  @Length(2, 200, { message: 'El medicamento debe tener entre 2 y 200 caracteres' })
  medicamento: string;

  @ApiProperty({
    description: 'Dosis del medicamento',
    example: '500mg',
    minLength: 1,
    maxLength: 50
  })
  @IsString({ message: 'La dosis debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dosis es obligatoria' })
  @Length(1, 50, { message: 'La dosis debe tener entre 1 y 50 caracteres' })
  @Matches(/^[\d.,]+\s?(mg|g|ml|mcg|UI|%|cc|gotas).*$/i, { 
    message: 'La dosis debe incluir una unidad válida (mg, g, ml, mcg, UI, %, cc, gotas)' 
  })
  dosis: string;

  @ApiProperty({
    description: 'Frecuencia de administración',
    example: 'Cada 8 horas',
    minLength: 5,
    maxLength: 100
  })
  @IsString({ message: 'La frecuencia debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La frecuencia es obligatoria' })
  @Length(5, 100, { message: 'La frecuencia debe tener entre 5 y 100 caracteres' })
  frecuencia: string;

  @ApiProperty({
    description: 'Duración del tratamiento',
    example: '7 días',
    minLength: 3,
    maxLength: 100
  })
  @IsString({ message: 'La duración debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La duración es obligatoria' })
  @Length(3, 100, { message: 'La duración debe tener entre 3 y 100 caracteres' })
  duracion: string;

  @ApiProperty({
    description: 'Concentración del medicamento',
    example: '500mg/5ml',
    minLength: 1,
    maxLength: 50
  })
  @IsString({ message: 'La concentración debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La concentración es obligatoria' })
  @Length(1, 50, { message: 'La concentración debe tener entre 1 y 50 caracteres' })
  concentracion: string;

  @ApiProperty({
    description: 'Número de fármacos o unidades',
    example: 14,
    minimum: 1,
    maximum: 1000
  })
  @IsInt({ message: 'El número de fármacos debe ser un número entero' })
  @Min(1, { message: 'El número de fármacos debe ser mayor a 0' })
  @Max(1000, { message: 'El número de fármacos no puede exceder 1000 unidades' })
  Nrodefarmacos: number;

  @ApiProperty({
    description: 'Presentación del medicamento',
    example: 'Cápsulas',
    minLength: 3,
    maxLength: 100
  })
  @IsString({ message: 'La presentación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La presentación es obligatoria' })
  @Length(3, 100, { message: 'La presentación debe tener entre 3 y 100 caracteres' })
  presentacion: string;

  @ApiProperty({
    description: 'Vía de administración del medicamento',
    example: 'Oral',
    minLength: 3,
    maxLength: 50
  })
  @IsString({ message: 'La vía de administración debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La vía de administración es obligatoria' })
  @Length(3, 50, { message: 'La vía de administración debe tener entre 3 y 50 caracteres' })
  viadeadministracion: string;
}

/**
 * DTO para actualizar información básica de la prescripción
 * Disponible para estudiantes solo cuando el estado es PENDIENTE
 * El GlobalValidationPipe maneja automáticamente las validaciones
 */
export class ActualizarPrescripcionBasicaDto {
  @ApiPropertyOptional({
    description: 'Nombre del medicamento prescrito',
    example: 'Amoxicilina + Ácido Clavulánico',
    minLength: 2,
    maxLength: 200
  })
  @IsString({ message: 'El medicamento debe ser una cadena de texto' })
  @IsOptional()
  @Length(2, 200, { message: 'El medicamento debe tener entre 2 y 200 caracteres' })
  medicamento?: string;

  @ApiPropertyOptional({
    description: 'Dosis del medicamento',
    example: '875mg + 125mg',
    minLength: 1,
    maxLength: 50
  })
  @IsString({ message: 'La dosis debe ser una cadena de texto' })
  @IsOptional()
  @Length(1, 50, { message: 'La dosis debe tener entre 1 y 50 caracteres' })
  dosis?: string;

  @ApiPropertyOptional({
    description: 'Frecuencia de administración',
    example: 'Cada 12 horas',
    minLength: 5,
    maxLength: 100
  })
  @IsString({ message: 'La frecuencia debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 100, { message: 'La frecuencia debe tener entre 5 y 100 caracteres' })
  frecuencia?: string;

  @ApiPropertyOptional({
    description: 'Duración del tratamiento',
    example: '10 días',
    minLength: 3,
    maxLength: 100
  })
  @IsString({ message: 'La duración debe ser una cadena de texto' })
  @IsOptional()
  @Length(3, 100, { message: 'La duración debe tener entre 3 y 100 caracteres' })
  duracion?: string;

  @ApiPropertyOptional({
    description: 'Concentración del medicamento',
    example: '875mg + 125mg',
    minLength: 1,
    maxLength: 50
  })
  @IsString({ message: 'La concentración debe ser una cadena de texto' })
  @IsOptional()
  @Length(1, 50, { message: 'La concentración debe tener entre 1 y 50 caracteres' })
  concentracion?: string;

  @ApiPropertyOptional({
    description: 'Número de fármacos o unidades',
    example: 20,
    minimum: 1,
    maximum: 1000
  })
  @IsInt({ message: 'El número de fármacos debe ser un número entero' })
  @IsOptional()
  @Min(1, { message: 'El número de fármacos debe ser mayor a 0' })
  @Max(1000, { message: 'El número de fármacos no puede exceder 1000 unidades' })
  Nrodefarmacos?: number;

  @ApiPropertyOptional({
    description: 'Presentación del medicamento',
    example: 'Comprimidos',
    minLength: 3,
    maxLength: 100
  })
  @IsString({ message: 'La presentación debe ser una cadena de texto' })
  @IsOptional()
  @Length(3, 100, { message: 'La presentación debe tener entre 3 y 100 caracteres' })
  presentacion?: string;

  @ApiPropertyOptional({
    description: 'Vía de administración del medicamento',
    example: 'Oral',
    minLength: 3,
    maxLength: 50
  })
  @IsString({ message: 'La vía de administración debe ser una cadena de texto' })
  @IsOptional()
  @Length(3, 50, { message: 'La vía de administración debe tener entre 3 y 50 caracteres' })
  viadeadministracion?: string;
}

/**
 * DTO para actualizar el estado de la prescripción (solo profesores)
 * Incluye validaciones específicas para cambios de estado
 */
export class ActualizarEstadoPrescripcionDto {
  @ApiProperty({
    description: 'Nuevo estado de la prescripción',
    enum: EstadoPrescripcion,
    example: EstadoPrescripcion.APROBADO
  })
  @IsEnum(EstadoPrescripcion, { message: 'Estado de prescripción inválido' })
  estado: EstadoPrescripcion;

  @ApiPropertyOptional({
    description: 'Motivo del cambio de estado (especialmente importante para rechazos)',
    example: 'Dosis incorrecta para la edad del paciente',
    minLength: 5,
    maxLength: 500
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 500, { message: 'El motivo debe tener entre 5 y 500 caracteres' })
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del docente',
    example: 'Considerar ajustar dosis según peso del paciente',
    maxLength: 1000
  })
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @IsOptional()
  @Length(0, 1000, { message: 'Las observaciones no pueden exceder 1000 caracteres' })
  observaciones?: string;
}

/**
 * DTO para actualización completa de la prescripción (solo profesores)
 * Permite cambiar tanto información farmacológica como estado
 */
export class ActualizarPrescripcionCompletaDto extends ActualizarPrescripcionBasicaDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado de la prescripción',
    enum: EstadoPrescripcion,
    example: EstadoPrescripcion.APROBADO
  })
  @IsEnum(EstadoPrescripcion, { message: 'Estado de prescripción inválido' })
  @IsOptional()
  estado?: EstadoPrescripcion;

  @ApiPropertyOptional({
    description: 'Motivo del cambio (requerido para ciertos cambios de estado)',
    example: 'Ajuste de dosis según protocolo institucional',
    minLength: 5,
    maxLength: 500
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 500, { message: 'El motivo debe tener entre 5 y 500 caracteres' })
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Observaciones del docente sobre la prescripción',
    example: 'Prescripción adecuada, recordar seguimiento en 3 días',
    maxLength: 1000
  })
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @IsOptional()
  @Length(0, 1000, { message: 'Las observaciones no pueden exceder 1000 caracteres' })
  observacionesDocente?: string;
}

/**
 * DTO para validar interacciones medicamentosas
 * Permite verificar conflictos con otras prescripciones del paciente
 */
export class ValidarInteraccionesDto {
  @ApiProperty({
    description: 'ID de la prescripción a validar',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la prescripción debe ser un número entero' })
  @Min(1, { message: 'El ID de la prescripción debe ser mayor a 0' })
  prescripcionId: number;

  @ApiPropertyOptional({
    description: 'Incluir prescripciones de otros casos clínicos del mismo paciente',
    example: true,
    default: false
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  @IsOptional()
  incluirOtrosCasos?: boolean;

  @ApiPropertyOptional({
    description: 'Forzar validación aunque existan interacciones leves',
    example: false,
    default: false
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  @IsOptional()
  forzarValidacion?: boolean;
}

/**
 * DTO para validar dosificación de la prescripción
 * Verifica que la dosis sea apropiada según parámetros del paciente
 */
export class ValidarDosificacionDto {
  @ApiProperty({
    description: 'ID de la prescripción a validar',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la prescripción debe ser un número entero' })
  @Min(1, { message: 'El ID de la prescripción debe ser mayor a 0' })
  prescripcionId: number;

  @ApiPropertyOptional({
    description: 'Peso del paciente en kilogramos (si no está en el caso clínico)',
    example: 70.5,
    minimum: 1,
    maximum: 300
  })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'El peso debe ser mayor a 1 kg' })
  @Max(300, { message: 'El peso debe ser menor a 300 kg' })
  pesoKg?: number;

  @ApiPropertyOptional({
    description: 'Edad del paciente en años (si no se puede calcular de fecha nacimiento)',
    example: 35,
    minimum: 0,
    maximum: 120
  })
  @IsInt({ message: 'La edad debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'La edad debe ser mayor o igual a 0' })
  @Max(120, { message: 'La edad debe ser menor a 120 años' })
  edadAnios?: number;

  @ApiPropertyOptional({
    description: 'Considerar condiciones médicas especiales del paciente',
    example: true,
    default: true
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  @IsOptional()
  considerarCondicionesMedicas?: boolean;
}

/**
 * DTO para marcar prescripción como completada
 * Incluye información sobre el cumplimiento del tratamiento
 */
export class CompletarPrescripcionDto {
  @ApiProperty({
    description: 'ID de la prescripción a completar',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la prescripción debe ser un número entero' })
  @Min(1, { message: 'El ID de la prescripción debe ser mayor a 0' })
  prescripcionId: number;

  @ApiPropertyOptional({
    description: 'Observaciones sobre el cumplimiento del tratamiento',
    example: 'Paciente completó tratamiento satisfactoriamente, sin efectos adversos',
    maxLength: 1000
  })
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @IsOptional()
  @Length(0, 1000, { message: 'Las observaciones no pueden exceder 1000 caracteres' })
  observacionesCumplimiento?: string;

  @ApiPropertyOptional({
    description: 'Porcentaje de cumplimiento del tratamiento (0-100)',
    example: 100,
    minimum: 0,
    maximum: 100
  })
  @IsInt({ message: 'El porcentaje debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El porcentaje debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje debe ser menor o igual a 100' })
  porcentajeCumplimiento?: number;

  @ApiPropertyOptional({
    description: 'Se presentaron efectos adversos durante el tratamiento',
    example: false,
    default: false
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  @IsOptional()
  presentoEfectosAdversos?: boolean;

  @ApiPropertyOptional({
    description: 'Descripción de efectos adversos si los hubo',
    example: 'Leve malestar estomacal los primeros días',
    maxLength: 500
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcionEfectosAdversos?: string;
}
