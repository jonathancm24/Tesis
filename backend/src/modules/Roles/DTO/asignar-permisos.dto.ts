import { IsArray, IsInt } from 'class-validator';

/**
 * DTO para asignar permisos a un rol existente
 * Reemplaza todos los permisos actuales del rol con los nuevos especificados
 */
export class AsignarPermisosDto {
  /**
   * Array de IDs de permisos que se asignarán al rol
   * Los permisos anteriores del rol se eliminarán y se reemplazarán por estos
   * 
   * Nota: Si se envía un array vacío, el rol quedará sin permisos
   */
  @IsArray()
  @IsInt({ each: true })
  permisos: number[];
}