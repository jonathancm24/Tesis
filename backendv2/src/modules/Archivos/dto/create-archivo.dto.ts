import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateArchivoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  entidadTipo: string;

  @Type(() => Number)
  @IsInt()
  entidadId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rol?: string;
}
