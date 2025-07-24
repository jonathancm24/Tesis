import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums/roles.enum';

/**
 * Clave utilizada internamente por NestJS para almacenar los metadatos de roles
 * en los endpoints. Esta clave se usa en el Guard para recuperar los roles requeridos
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para proteger endpoints por roles específicos
 * 
 * @param roles - Lista de roles que pueden acceder al endpoint
 * 
 * Uso:
 * @RequireRoles(RoleEnum.ADMIN, RoleEnum.PROFESOR)
 * @Get('teachers-only')
 * teacherEndpoint() { ... }
 * 
 * El usuario debe tener AL MENOS UNO de los roles especificados para acceder
 * 
 * Nota: Es recomendable usar RequirePermissions en lugar de RequireRoles
 * para mayor flexibilidad en el sistema de autorización
 */
export const RequireRoles = (...roles: RoleEnum[]) => 
  SetMetadata(ROLES_KEY, roles);
