import { IsString, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator'

/**
 * Tipos de preguntas disponibles en la encuesta de tamizaje
 */
export enum TipoPreguntaDTO {
  SI_NO = 'SI_NO',
  TEXTO = 'TEXTO',
  NUMERO = 'NUMERO',
  MULTIPLE_SELECCION = 'MULTIPLE_SELECCION',
  FECHA = 'FECHA',
  TEXTAREA = 'TEXTAREA'
}

export class CreatePreguntaTamizajeDto {
  @IsString()
  texto: string

  @IsEnum(TipoPreguntaDTO)
  tipo: TipoPreguntaDTO

  @IsOptional()
  @IsString()
  categoria?: string

  @IsOptional()
  @IsInt()
  orden?: number

  @IsOptional()
  @IsBoolean()
  soloMujer?: boolean

  @IsOptional()
  @IsBoolean()
  requiereDetalle?: boolean
}
