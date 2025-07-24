import { SetMetadata } from '@nestjs/common';
import { PermisoEnum } from '../enums/permisos.enum';

/**
 * Clave utilizada internamente por NestJS para almacenar los metadatos de permisos
 * en los endpoints. Esta clave se usa en el Guard para recuperar los permisos requeridos
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para proteger endpoints con permisos específicos
 * 
 * @param permissions - Lista de permisos requeridos para acceder al endpoint
 * 
 * Uso:
 * @RequirePermissions(PermisoEnum.VER_USUARIOS, PermisoEnum.EDITAR_USUARIOS)
 * @Get('admin-only')
 * adminEndpoint() { ... }
 * 
 * El usuario debe tener AL MENOS UNO de los permisos especificados para acceder
 */
export const RequirePermissions = (...permissions: PermisoEnum[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);