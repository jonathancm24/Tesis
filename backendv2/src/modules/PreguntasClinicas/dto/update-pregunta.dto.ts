import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator'
import { TipoPregunta } from '@prisma/client'

export class UpdatePreguntaDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El texto de la pregunta debe tener al menos 5 caracteres' })
  texto?: string

  @IsOptional()
  @IsEnum(TipoPregunta, { message: 'Tipo de pregunta inválido' })
  tipo?: TipoPregunta

  @IsOptional()
  @IsBoolean()
  obligatoria?: boolean

  @IsOptional()
  @IsInt()
  especialidadId?: number | null
}
