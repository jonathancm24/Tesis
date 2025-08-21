import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/roles.enum';

/**
 * Guard que verifica si el usuario tiene uno de los roles requeridos
 * Funciona en conjunto con el decorador @RequireRoles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Verifica si el usuario tiene al menos uno de los roles requeridos
   * @param context - Contexto de ejecución
   * @returns true si tiene permisos, false si no
   */
  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos del decorador
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario de la request
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Verificar si el usuario tiene uno de los roles requeridos
    return user.role && requiredRoles.some(role => user.role.nombre === role);
  }
}
