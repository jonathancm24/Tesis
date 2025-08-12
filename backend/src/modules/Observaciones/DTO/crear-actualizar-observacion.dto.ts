import { 
  IsString, 
  IsInt, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsBoolean, 
  IsDateString,
  IsNumber,
  Min,
  Max,
  Length,
  ValidateIf,
  ArrayNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoObservacion } from '@prisma/client';

/**
 * DTO base para crear una observación
 * Maneja la naturaleza polimórfica de las observaciones
 */
export class CrearObservacionDto {
  @ApiProperty({
    description: 'Título de la observación',
    example: 'Seguimiento de tratamiento de endodoncia',
    minLength: 5,
    maxLength: 200
  })
  @IsString()
  @Length(5, 200, { message: 'El título debe tener entre 5 y 200 caracteres' })
  titulo: string;

  @ApiProperty({
    description: 'Descripción detallada de la observación',
    example: 'El paciente presenta mejoría en la sensibilidad dental. Se observa reducción significativa del dolor.',
    minLength: 10,
    maxLength: 2000
  })
  @IsString()
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres' })
  descripcion: string;

  @ApiProperty({
    description: 'ID del estudiante relacionado con la observación',
    example: 1
  })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  estudianteId: number;

  @ApiPropertyOptional({
    description: 'ID del docente que crea la observación (opcional para seguimientos de estudiantes)',
    example: 2
  })
  @IsOptional()
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  docenteId?: number;

  // Solo UNA de estas relaciones debe estar presente (validación polimórfica)
  
  @ApiPropertyOptional({
    description: 'ID del caso clínico relacionado (para retroalimentación de casos)',
    example: 1
  })
  @ValidateIf(o => !o.tratamientoId && !o.prescripcionId && !o.odontogramaId)
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @IsOptional()
  casoClinicoId?: number;

  @ApiPropertyOptional({
    description: 'ID del tratamiento relacionado (para seguimiento de tratamientos)',
    example: 1
  })
  @ValidateIf(o => !o.casoClinicoId && !o.prescripcionId && !o.odontogramaId)
  @IsInt({ message: 'El ID del tratamiento debe ser un número entero' })
  @IsOptional()
  tratamientoId?: number;

  @ApiPropertyOptional({
    description: 'ID de la prescripción relacionada (para seguimiento de prescripciones)',
    example: 1
  })
  @ValidateIf(o => !o.casoClinicoId && !o.tratamientoId && !o.odontogramaId)
  @IsInt({ message: 'El ID de la prescripción debe ser un número entero' })
  @IsOptional()
  prescripcionId?: number;

  @ApiPropertyOptional({
    description: 'ID del odontograma relacionado (para observaciones de odontogramas)',
    example: 1
  })
  @ValidateIf(o => !o.casoClinicoId && !o.tratamientoId && !o.prescripcionId)
  @IsInt({ message: 'El ID del odontograma debe ser un número entero' })
  @IsOptional()
  odontogramaId?: number;
}

/**
 * DTO específico para crear seguimiento de tratamiento (estudiantes)
 */
export class CrearSeguimientoTratamientoDto {
  @ApiProperty({
    description: 'ID del tratamiento a seguir',
    example: 1
  })
  @IsInt()
  tratamientoId: number;

  @ApiProperty({
    description: 'Descripción del progreso realizado',
    example: 'Se completó la primera sesión de endodoncia. Paciente tolera bien el procedimiento.'
  })
  @IsString()
  @Length(10, 1000)
  progreso: string;

  @ApiPropertyOptional({
    description: 'Dificultades encontradas durante el tratamiento',
    example: 'Dificultad para acceder al conducto mesio-vestibular'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  dificultadesEncontradas?: string;

  @ApiPropertyOptional({
    description: 'Soluciones aplicadas para resolver dificultades',
    example: 'Se utilizó lima PathFile para mejorar el acceso'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  solucionesAplicadas?: string;

  @ApiPropertyOptional({
    description: 'Próximos pasos planificados',
    example: 'Siguiente sesión: irrigación con hipoclorito y obturación'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  proximosPasos?: string;

  @ApiProperty({
    description: 'Indica si el estudiante necesita ayuda del docente',
    example: false
  })
  @IsBoolean()
  necesitaAyuda: boolean;

  @ApiPropertyOptional({
    description: 'Autoevaluación del estudiante sobre su desempeño',
    enum: ['EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'],
    example: 'BUENO'
  })
  @IsOptional()
  @IsEnum(['EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'])
  autoevaluacion?: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE';
}

/**
 * DTO específico para crear retroalimentación docente
 */
export class CrearRetroalimentacionDocenteDto {
  @ApiProperty({
    description: 'Tipo de entidad evaluada',
    enum: ['CASO_CLINICO', 'TRATAMIENTO', 'PRESCRIPCION', 'ODONTOGRAMA'],
    example: 'TRATAMIENTO'
  })
  @IsEnum(['CASO_CLINICO', 'TRATAMIENTO', 'PRESCRIPCION', 'ODONTOGRAMA'])
  entidadTipo: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';

  @ApiProperty({
    description: 'ID de la entidad evaluada',
    example: 1
  })
  @IsInt()
  entidadId: number;

  @ApiProperty({
    description: 'ID del estudiante que recibe la retroalimentación',
    example: 1
  })
  @IsInt()
  estudianteId: number;

  @ApiProperty({
    description: 'Observaciones y comentarios del docente',
    example: 'Excelente técnica de preparación. Mejorar la irrigación en próximas sesiones.'
  })
  @IsString()
  @Length(10, 2000)
  observaciones: string;

  @ApiPropertyOptional({
    description: 'Calificación numérica (1-10)',
    example: 8.5,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(10, { message: 'La calificación máxima es 10' })
  calificacion?: number;

  @ApiProperty({
    description: 'Aspectos positivos identificados',
    example: ['Técnica correcta', 'Buena comunicación con el paciente', 'Higiene adecuada'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe incluir al menos un aspecto positivo' })
  @IsString({ each: true })
  aspectosPositivos: string[];

  @ApiProperty({
    description: 'Áreas que necesitan mejora',
    example: ['Mejorar velocidad de trabajo', 'Perfeccionar técnica de irrigación'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  areasAMejorar: string[];

  @ApiProperty({
    description: 'Recomendaciones específicas para el estudiante',
    example: ['Practicar irrigación en laboratorio', 'Revisar protocolos de endodoncia'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe incluir al menos una recomendación' })
  @IsString({ each: true })
  recomendaciones: string[];

  @ApiProperty({
    description: 'Indica si requiere una revisión adicional',
    example: true
  })
  @IsBoolean()
  requiereRevision: boolean;

  @ApiPropertyOptional({
    description: 'Fecha programada para la próxima revisión (si aplica)',
    example: '2025-08-18T10:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  fechaProximaRevision?: string;
}

/**
 * DTO para actualizar una observación básica
 */
export class ActualizarObservacionBasicaDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la observación',
    example: 'Seguimiento de tratamiento - Sesión 2'
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la observación',
    example: 'Segunda sesión completada exitosamente. Paciente sin molestias.'
  })
  @IsOptional()
  @IsString()
  @Length(10, 2000)
  descripcion?: string;
}

/**
 * DTO para actualizar el estado de una observación
 */
export class ActualizarEstadoObservacionDto {
  @ApiProperty({
    description: 'Nuevo estado de la observación',
    enum: EstadoObservacion,
    example: 'FINALIZADO'
  })
  @IsEnum(EstadoObservacion)
  estado: EstadoObservacion;

  @ApiPropertyOptional({
    description: 'Comentario sobre el cambio de estado',
    example: 'Observación completada. Estudiante demostró progreso satisfactorio.'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  comentario?: string;
}

/**
 * DTO para responder a una observación (docentes)
 */
export class ResponderObservacionDto {
  @ApiProperty({
    description: 'ID de la observación a responder',
    example: 1
  })
  @IsInt()
  observacionId: number;

  @ApiProperty({
    description: 'Respuesta del docente',
    example: 'Excelente progreso. Continúa con el protocolo establecido.'
  })
  @IsString()
  @Length(10, 1000)
  respuesta: string;

  @ApiPropertyOptional({
    description: 'Calificación de la observación (1-10)',
    example: 9.0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(10)
  calificacion?: number;

  @ApiPropertyOptional({
    description: 'Recomendaciones adicionales',
    example: ['Mantener la técnica', 'Revisar irrigación final']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recomendaciones?: string[];

  @ApiProperty({
    description: 'Indica si la observación queda finalizada',
    example: true
  })
  @IsBoolean()
  finalizar: boolean;
}

/**
 * DTO para completar una observación
 */
export class CompletarObservacionDto {
  @ApiProperty({
    description: 'ID de la observación a completar',
    example: 1
  })
  @IsInt()
  observacionId: number;

  @ApiProperty({
    description: 'Resumen final de la observación',
    example: 'Tratamiento completado exitosamente. Paciente sin complicaciones.'
  })
  @IsString()
  @Length(10, 1000)
  resumenFinal: string;

  @ApiPropertyOptional({
    description: 'Resultados obtenidos',
    example: 'Eliminación completa de la infección. Paciente asintomático.'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  resultados?: string;

  @ApiPropertyOptional({
    description: 'Lecciones aprendidas',
    example: 'Importancia de la irrigación adecuada en el éxito del tratamiento.'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  leccionesAprendidas?: string;
}

/**
 * DTO para programar recordatorios de observaciones
 */
export class ProgramarRecordatorioDto {
  @ApiProperty({
    description: 'ID de la observación',
    example: 1
  })
  @IsInt()
  observacionId: number;

  @ApiProperty({
    description: 'Fecha y hora del recordatorio',
    example: '2025-08-15T14:00:00Z'
  })
  @IsDateString()
  fechaRecordatorio: string;

  @ApiProperty({
    description: 'Tipo de recordatorio',
    enum: ['SEGUIMIENTO', 'REVISION', 'RESPUESTA_PENDIENTE'],
    example: 'SEGUIMIENTO'
  })
  @IsEnum(['SEGUIMIENTO', 'REVISION', 'RESPUESTA_PENDIENTE'])
  tipoRecordatorio: 'SEGUIMIENTO' | 'REVISION' | 'RESPUESTA_PENDIENTE';

  @ApiPropertyOptional({
    description: 'Mensaje personalizado del recordatorio',
    example: 'Revisar progreso del tratamiento de endodoncia'
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  mensaje?: string;
}
