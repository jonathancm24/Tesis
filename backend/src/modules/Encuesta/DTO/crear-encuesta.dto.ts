import { IsNotEmpty, IsInt, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear una respuesta individual de tamizaje
 * Cada respuesta corresponde a una pregunta específica respondida por el paciente
 */
export class CrearRespuestaTamizajeDto {
  /**
   * ID de la pregunta que se está respondiendo
   */
  @IsNotEmpty({ message: 'El ID de la pregunta es obligatorio' })
  @IsInt({ message: 'El ID de la pregunta debe ser un número entero' })
  preguntaId: number;

  /**
   * Respuesta del paciente a la pregunta
   * Puede ser: "SI", "NO", texto libre, número, etc. según el tipo de pregunta
   */
  @IsOptional()
  @IsString({ message: 'La respuesta debe ser texto' })
  respuesta?: string;

  /**
   * Detalle adicional cuando la pregunta lo requiere
   * Solo se usa cuando requiereDetalle = true en la pregunta
   * Ejemplo: Si responde "SI" a "¿Tiene alergias?", aquí especifica cuáles
   */
  @IsOptional()
  @IsString({ message: 'El detalle debe ser texto' })
  detalle?: string;
}

/**
 * DTO principal para crear una encuesta completa de tamizaje
 * Contiene todas las respuestas del paciente a las preguntas médicas
 */
export class CrearEncuestaTamizajeDto {
  /**
   * ID del paciente al que pertenece esta encuesta de tamizaje
   */
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  pacienteId: number;

  /**
   * Array de todas las respuestas del paciente
   * Debe incluir respuesta para todas las preguntas obligatorias
   * y las preguntas opcionales que el paciente haya respondido
   */
  @IsArray({ message: 'Las respuestas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearRespuestaTamizajeDto)
  respuestas: CrearRespuestaTamizajeDto[];
}
