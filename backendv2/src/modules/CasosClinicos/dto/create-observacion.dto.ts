import { IsInt, IsString, Min, MinLength } from 'class-validator'

export class CreateObservacionDto {
  @IsInt()
  @Min(1)
  casoClinicoId: number

  @IsInt()
  @Min(1)
  docenteId: number

  @IsString()
  @MinLength(1)
  contenido: string
}
