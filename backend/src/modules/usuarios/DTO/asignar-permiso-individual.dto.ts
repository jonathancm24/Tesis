import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * DTO para asignar un permiso individual a un usuario específico
 * Los permisos individuales se suman a los permisos que ya tiene por su rol
 */
export class AsignarPermisoIndividualDto {
  /**
   * ID del permiso que se va a asignar al usuario
   * Debe ser un permiso válido existente en la tabla Permisos
   */
  @IsInt()
  permisoId: number;

  /**
   * Fecha opcional de expiración del permiso
   * Si se especifica, el permiso será temporal y se desactivará automáticamente
   * Formato: "2024-12-31T23:59:59.000Z" (ISO 8601)
   */
  @IsOptional()
  @IsDateString()
  fechaExpiracion?: string;

  /**
   * Justificación opcional de por qué se otorga este permiso
   * Útil para auditorías y para recordar el motivo del permiso especial
   */
  @IsOptional()
  @IsString()
  justificacion?: string;
}