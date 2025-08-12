import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Length,
  IsOptional
} from 'class-validator';

/**
 * DTO para guardar una respuesta a una pregunta clínica
 * Valida la respuesta de un estudiante a una pregunta específica
 */
export class CrearRespuestaClinicaDto {
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId: number;

  @IsInt({ message: 'El ID de la pregunta debe ser un número entero' })
  @Min(1, { message: 'El ID de la pregunta debe ser mayor a 0' })
  preguntaId: number;

  @IsString({ message: 'La respuesta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La respuesta es obligatoria' })
  @Length(1, 2000, { message: 'La respuesta debe tener entre 1 y 2000 caracteres' })
  respuesta: string;
}

/**
 * DTO para actualizar una respuesta existente
 * Permite modificar la respuesta de un caso clínico
 */
export class ActualizarRespuestaClinicaDto {
  @IsString({ message: 'La respuesta debe ser una cadena de texto' })
  @IsOptional()
  @Length(1, 2000, { message: 'La respuesta debe tener entre 1 y 2000 caracteres' })
  respuesta?: string;
}

/**
 * DTO para guardar múltiples respuestas de un caso clínico
 * Permite enviar todas las respuestas de un cuestionario de una vez
 */
export class CrearRespuestasLoteDto {
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId: number;

  respuestas: {
    preguntaId: number;
    respuesta: string;
  }[];
}
