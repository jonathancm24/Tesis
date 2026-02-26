import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

export class CaraSeleccionadaDto {
  @IsString()
  @MinLength(1)
  cara: string

  @IsOptional()
  @IsString()
  observacion?: string

  @IsOptional()
  @IsString()
  condicion?: string
}

export class OdontogramaDienteDto {
  @IsString()
  @MinLength(1)
  diente: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaraSeleccionadaDto)
  caras: CaraSeleccionadaDto[]
}

export class SaveOdontogramaDto {
  @IsInt()
  @Min(1)
  casoClinicoId: number

  @IsInt()
  @Min(1)
  estudianteId: number

  @IsOptional()
  @IsInt()
  @Min(1)
  docenteId?: number

  @IsOptional()
  @IsString()
  conclusion?: string

  @IsOptional()
  @IsString()
  observacionGeneral?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OdontogramaDienteDto)
  dientes: OdontogramaDienteDto[]
}
