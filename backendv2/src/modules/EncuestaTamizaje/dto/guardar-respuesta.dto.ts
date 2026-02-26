import { IsInt, IsString, IsOptional, IsArray } from 'class-validator'

export class GuardarRespuestaDto {
  @IsInt()
  preguntaId: number

  @IsOptional()
  @IsString()
  respuesta?: string

  @IsOptional()
  @IsString()
  detalle?: string
}

export class GuardarEncuestaDto {
  @IsInt()
  pacienteId: number

  @IsOptional()
  @IsInt()
  encuestaId?: number

  @IsArray()
  respuestas: GuardarRespuestaDto[]

  @IsOptional()
  @IsString()
  observaciones?: string
}
