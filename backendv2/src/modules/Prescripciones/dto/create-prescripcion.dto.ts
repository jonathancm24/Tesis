import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreatePrescripcionDto {
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
