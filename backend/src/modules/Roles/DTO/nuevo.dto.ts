import { IsString, IsOptional } from "class-validator";

export class NuevoRoleDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}