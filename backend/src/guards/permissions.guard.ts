import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../common/decorators/permissions.decorator';
import { PermisoEnum } from '../common/enums/permisos.enum';

/**
 * Guard que verifica si el usuario tiene los permisos necesarios para acceder a un endpoint
 * 
 * Este guard combina dos fuentes de permisos:
 * 1. Permisos heredados del rol del usuario
 * 2. Permisos asignados individualmente al usuario
 * 
 * El usuario necesita tener AL MENOS UNO de los permisos requeridos para acceder
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Método principal que determina si el usuario puede acceder al recurso
   * 
   * @param context - Contexto de ejecución que contiene información sobre la solicitud
   * @returns true si el usuario tiene permisos, false si no los tiene
   */
  canActivate(context: ExecutionContext): boolean {
    // Obtener los permisos requeridos del decorador @RequirePermissions
    const requiredPermissions = this.reflector.getAllAndOverride<PermisoEnum[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se especifican permisos requeridos, permitir acceso libre
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Obtener el usuario de la solicitud (debe estar autenticado previamente)
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false; // No hay usuario autenticado
    }

    // Obtener permisos del rol del usuario
    const permisosDelRol = this.obtenerPermisosDelRol(user);
    
    // Obtener permisos individuales activos del usuario
    const permisosIndividuales = this.obtenerPermisosIndividuales(user);

    // Combinar ambos tipos de permisos en un solo array
    const todosLosPermisos = [...permisosDelRol, ...permisosIndividuales];

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return requiredPermissions.some(permission => 
      todosLosPermisos.includes(permission)
    );
  }

  /**
   * Extrae los permisos que el usuario tiene a través de su rol
   * 
   * @param user - Usuario autenticado con información de rol y permisos
   * @returns Array de nombres de permisos del rol
   */
  private obtenerPermisosDelRol(user: any): string[] {
    if (!user.role || !user.role.permisos) {
      return []; // El usuario no tiene rol o el rol no tiene permisos
    }

    // Mapear los permisos del rol a sus nombres
    return user.role.permisos.map(rolePermiso => rolePermiso.permiso.nombre);
  }

  /**
   * Extrae los permisos individuales activos del usuario
   * Solo considera permisos que estén activos y no hayan expirado
   * 
   * @param user - Usuario autenticado con información de permisos individuales
   * @returns Array de nombres de permisos individuales válidos
   */
  private obtenerPermisosIndividuales(user: any): string[] {
    if (!user.permisosIndividuales) {
      return []; // El usuario no tiene permisos individuales
    }

    const fechaActual = new Date();

    // Filtrar solo permisos activos y no expirados
    return user.permisosIndividuales
      .filter(userPermiso => {
        // El permiso debe estar activo
        if (!userPermiso.activo) return false;
        
        // Si tiene fecha de expiración, verificar que no haya expirado
        if (userPermiso.fechaExpiracion && userPermiso.fechaExpiracion <= fechaActual) {
          return false;
        }
        
        return true;
      })
      .map(userPermiso => userPermiso.permiso.nombre);
  }
}