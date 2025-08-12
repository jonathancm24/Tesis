import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Length,
  Min
} from 'class-validator';
import { TipoPregunta } from '@prisma/client';

/**
 * DTO para crear una nueva pregunta clínica
 * Valida los datos de entrada para la creación de preguntas específicas por especialidad
 */
export class CrearPreguntaClinicaDto {
  @IsString({ message: 'El texto de la pregunta debe ser una cadena' })
  @IsNotEmpty({ message: 'El texto de la pregunta es obligatorio' })
  @Length(10, 500, { message: 'El texto debe tener entre 10 y 500 caracteres' })
  texto: string;

  @IsEnum(TipoPregunta, { message: 'Tipo de pregunta inválido' })
  tipo: TipoPregunta;

  @IsBoolean({ message: 'El campo obligatoria debe ser un valor booleano' })
  @IsOptional()
  obligatoria?: boolean = false;

  @IsInt({ message: 'El ID de especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de especialidad debe ser mayor a 0' })
  @IsOptional()
  especialidadId?: number;
}

/**
 * DTO para actualizar una pregunta clínica existente
 * Permite modificar campos específicos de una pregunta
 */
export class ActualizarPreguntaClinicaDto {
  @IsString({ message: 'El texto de la pregunta debe ser una cadena' })
  @IsOptional()
  @Length(10, 500, { message: 'El texto debe tener entre 10 y 500 caracteres' })
  texto?: string;

  @IsEnum(TipoPregunta, { message: 'Tipo de pregunta inválido' })
  @IsOptional()
  tipo?: TipoPregunta;

  @IsBoolean({ message: 'El campo obligatoria debe ser un valor booleano' })
  @IsOptional()
  obligatoria?: boolean;

  @IsInt({ message: 'El ID de especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de especialidad debe ser mayor a 0' })
  @IsOptional()
  especialidadId?: number;
}

/**
 * DTO para crear múltiples preguntas en lote
 * Útil para importar cuestionarios completos por especialidad
 */
export class CrearPreguntasLoteDto {
  @IsInt({ message: 'El ID de especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de especialidad debe ser mayor a 0' })
  especialidadId: number;

  preguntas: CrearPreguntaClinicaDto[];
}
