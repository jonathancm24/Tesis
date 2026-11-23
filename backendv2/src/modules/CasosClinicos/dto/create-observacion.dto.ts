import { IsInt, IsString, Min, MinLength } from 'class-validator'
import { IsOptional } from 'class-validator'

export class CreateObservacionDto {
  @IsInt()
  @Min(1)
  casoClinicoId: number

  @IsOptional()
  @IsInt()
  @Min(1)
  docenteId?: number

  @IsString()
  @MinLength(1)
  contenido: string
}
