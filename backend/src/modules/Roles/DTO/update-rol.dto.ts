import { IsOptional, IsString } from 'class-validator'

/**
 * DTO para actualizar datos básicos de un rol
 */
export class UpdateRolDto {
  @IsOptional()
  @IsString()
  nombre?: string

  @IsOptional()
  @IsString()
  descripcion?: string
}
