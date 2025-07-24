import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

/**
 * DTO para crear un nuevo rol en el sistema
 * Permite definir el nombre, descripción y permisos iniciales del rol
 */
export class CreateRolDto {
  /**
   * Nombre único del rol (ej: "PACIENTE", "BECARIO", "ASISTENTE")
   * Debe ser único en todo el sistema
   */
  @IsString()
  nombre: string;

  /**
   * Descripción opcional que explica las responsabilidades del rol
   * Ayuda a los administradores a entender para qué sirve cada rol
   */
  @IsOptional()
  @IsString()
  descripcion?: string;

  /**
   * Array opcional de IDs de permisos que se asignarán al rol al crearlo
   * Si no se proporciona, el rol se crea sin permisos (se pueden asignar después)
   */
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permisos?: number[];
}