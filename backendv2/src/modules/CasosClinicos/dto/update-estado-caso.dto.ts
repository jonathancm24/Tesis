import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { EstadoCasoClinico } from '@prisma/client'

export class UpdateEstadoCasoDto {
  @IsEnum(EstadoCasoClinico)
  estado: EstadoCasoClinico

  @IsOptional()
  @IsInt()
  @Min(0)
  calificacion?: number
}
