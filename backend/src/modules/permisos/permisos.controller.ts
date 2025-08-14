import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermisoEnum } from '../../common/enums/permisos.enum';
import { PermisosService } from './permisos.service';

/**
 * Controlador para gestión de permisos del sistema
 * 
 * Proporciona endpoints para consultar los permisos disponibles
 * y su organización por módulos
 */
@Controller('permisos')
//@UseGuards(JwtAuthGuard, PermissionsGuard) // Comentado temporalmente para desarrollo
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  /**
   * Obtiene todos los permisos disponibles en el sistema
   * 
   * @returns Lista de todos los permisos con su información completa
   */
  @Get()
  //@RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerTodosLosPermisos() {
    return await this.permisosService.obtenerTodosLosPermisos();
  }

  /**
   * Obtiene permisos organizados por módulos
   * 
   * @returns Permisos agrupados por módulo para mejor visualización
   */
  @Get('organizados')
  //@RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerPermisosOrganizados() {
    return await this.permisosService.obtenerPermisosOrganizados();
  }

  /**
   * Obtiene la lista de módulos de permisos disponibles
   * 
   * @returns Lista de nombres de módulos únicos
   */
  @Get('modulos')
  //@RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerModulosDePermisos() {
    return await this.permisosService.obtenerModulosDePermisos();
  }
}
