import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListArchivosDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entidadTipo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entidadId?: number;
}
