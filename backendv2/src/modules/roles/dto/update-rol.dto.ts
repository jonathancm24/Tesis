import { IsOptional, IsString } from 'class-validator';

export class UpdateRolDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}