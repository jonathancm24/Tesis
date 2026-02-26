import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator'
import { TipoPregunta } from '@prisma/client'

export class CreatePreguntaDto {
  @IsString()
  @MinLength(5, { message: 'El texto de la pregunta debe tener al menos 5 caracteres' })
  texto: string

  @IsEnum(TipoPregunta, { message: 'Tipo de pregunta inválido' })
  tipo: TipoPregunta

  @IsBoolean()
  obligatoria: boolean

  @IsOptional()
  @IsInt()
  especialidadId?: number
}
