import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { TipoPregunta } from '@prisma/client';

/**
 * DTO para crear nuevas preguntas de tamizaje
 * Solo profesores y administradores pueden usar este endpoint
 */
export class CrearPreguntaTamizajeDto {
  /**
   * Texto de la pregunta que verá el estudiante/paciente
   * Ejemplo: "¿Tiene antecedentes de diabetes?"
   */
  @IsNotEmpty({ message: 'El texto de la pregunta es obligatorio' })
  @IsString({ message: 'El texto debe ser una cadena de caracteres' })
  texto: string;

  /**
   * Tipo de respuesta esperada para esta pregunta
   */
  @IsNotEmpty({ message: 'El tipo de pregunta es obligatorio' })
  @IsEnum(TipoPregunta, { message: 'Tipo de pregunta inválido' })
  tipo: TipoPregunta;

  /**
   * Categoría para agrupar preguntas relacionadas
   * Ejemplo: "Antecedentes Médicos", "Medicamentos", "Alergias"
   */
  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  categoria?: string;

  /**
   * Orden de presentación de la pregunta
   * Permite organizar las preguntas en un orden lógico
   */
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  orden?: number;

  /**
   * Si es true, esta pregunta solo se muestra a pacientes mujeres
   * Útil para preguntas sobre embarazo, menstruación, etc.
   */
  @IsOptional()
  @IsBoolean({ message: 'soloMujer debe ser true o false' })
  soloMujer?: boolean;

  /**
   * Si es true, cuando la respuesta es afirmativa se pide detalle adicional
   * Ejemplo: "¿Toma medicamentos?" - Si dice "SI", pide cuáles
   */
  @IsOptional()
  @IsBoolean({ message: 'requiereDetalle debe ser true o false' })
  requiereDetalle?: boolean;
}
