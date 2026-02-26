import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export enum EstadoCasoClinico {
  EN_REVISION = 'EN_REVISION',
  EN_TRATAMIENTO = 'EN_TRATAMIENTO',
  FINALIZADO = 'FINALIZADO',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO'
}

export class UpdateEstadoCasoDto {
  @IsEnum(EstadoCasoClinico)
  estado: EstadoCasoClinico

  @IsOptional()
  @IsInt()
  @Min(0)
  calificacion?: number
}
