import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

class CreatePrescripcionInlineDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  medicamento: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  dosis: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  frecuencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  duracion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  concentracion: string;

  @IsInt()
  @Min(1)
  Nrodefarmacos: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  presentacion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  viadeadministracion: string;
}

export class CreateTratamientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  frecuenciaCardiaca: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  presArterial: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  saturacionOxigeno: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  temperatura: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cie10Codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  procedimientoCodigo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Presuntivo', 'Definitivo'])
  tipoDiagnostico?: 'Presuntivo' | 'Definitivo';

  @IsOptional()
  crearPrescripcion?: boolean;

  @IsOptional()
  prescripcion?: CreatePrescripcionInlineDto;
}
