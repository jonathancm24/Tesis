import { IsArray, IsInt } from 'class-validator';

export class AsignarPermisosDto {
  @IsArray()
  @IsInt({ each: true })
  permisos: number[];
}