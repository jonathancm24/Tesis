import { IsString, IsOptional, IsDateString, IsInt, Matches } from 'class-validator';

export class CreateCitaDto {
  @IsDateString()
  fecha: string; // Formato ISO: YYYY-MM-DD

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horainicio debe estar en formato HH:mm (24 horas)',
  })
  horainicio: string; // Formato HH:mm

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horafin debe estar en formato HH:mm (24 horas)',
  })
  horafin: string; // Formato HH:mm

  @IsInt()
  pacienteId: number;

  @IsInt()
  especialidadId: number;

  @IsInt()
  estudianteId: number;

  @IsOptional()
  @IsInt()
  docenteId?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
