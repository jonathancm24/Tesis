import { IsString, IsOptional, IsDateString, IsEnum, Matches } from 'class-validator';
import { EstadoCita } from '@prisma/client';

export class UpdateCitaDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  horainicio?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  horafin?: string;

  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
