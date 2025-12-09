import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../common/decorators/permissions.decorator';
import { PermisoEnum } from '../common/enums/permisos.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermisoEnum[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const permisosDelRol = this.obtenerPermisosDelRol(user);
    const permisosIndividuales = this.obtenerPermisosIndividuales(user);
    const todosLosPermisos = [...permisosDelRol, ...permisosIndividuales];

    return requiredPermissions.some(permission => 
      todosLosPermisos.includes(permission)
    );
  }

  private obtenerPermisosDelRol(user: any): string[] {
    if (!user.role || !user.role.permisos) {
      return [];
    }
    return user.role.permisos.map(rolePermiso => rolePermiso.permiso.nombre);
  }

  private obtenerPermisosIndividuales(user: any): string[] {
    if (!user.permisosIndividuales) {
      return [];
    }

    const fechaActual = new Date();
    return user.permisosIndividuales
      .filter(userPermiso => {
        if (!userPermiso.activo) return false;
        if (userPermiso.fechaExpiracion && userPermiso.fechaExpiracion <= fechaActual) {
          return false;
        }
        return true;
      })
      .map(userPermiso => userPermiso.permiso.nombre);
  }
}