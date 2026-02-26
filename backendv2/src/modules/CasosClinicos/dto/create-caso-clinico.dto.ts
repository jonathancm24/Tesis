import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class RespuestaClinicaDto {
  @IsInt()
  preguntaId: number

  @IsString()
  respuesta: string
}

export class CreateCasoClinicoDto {
  @IsInt()
  @Min(1)
  pacienteId: number

  @IsInt()
  @Min(1)
  profesorId: number

  @IsInt()
  @Min(1)
  estudianteId: number

  @IsInt()
  @Min(1)
  especialidadId: number

  @IsString()
  @MinLength(1)
  ATM: string

  @IsString()
  @MinLength(1)
  CarayCuello: string

  @IsString()
  @MinLength(1)
  PielyMucosa: string

  @IsString()
  @MinLength(1)
  craneo: string

  @IsString()
  @MinLength(1)
  enfermedadActual: string

  @IsString()
  @MinLength(1)
  facies: string

  @IsString()
  @MinLength(1)
  marcha: string

  @IsString()
  @MinLength(1)
  motivoConsulta: string

  @IsNumber()
  @Min(0)
  peso: number

  @IsNumber()
  @Min(0)
  talla: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaClinicaDto)
  respuestas?: RespuestaClinicaDto[]
}
