import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermisoEnum } from '../../common/enums/permisos.enum';
import { PermisosService } from './permisos.service';

@Controller('permisos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerTodosLosPermisos() {
    return await this.permisosService.obtenerTodosLosPermisos();
  }

  @Get('organizados')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerPermisosOrganizados() {
    return await this.permisosService.obtenerPermisosOrganizados();
  }

  @Get('modulos')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerModulosDePermisos() {
    return await this.permisosService.obtenerModulosDePermisos();
  }
}