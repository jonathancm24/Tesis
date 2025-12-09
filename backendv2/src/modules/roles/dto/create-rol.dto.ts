import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateRolDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permisos?: number[];
}