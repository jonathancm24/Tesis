import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { AsignarPermisosDto } from './dto/asignar-permisos.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermisoEnum } from '../../common/enums/permisos.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('/todos')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async crearRol(@Body() dto: CreateRolDto) {
    return this.rolesService.crearRol(dto);
  }

  @Get('/todos/con-permisos')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerTodos() {
    return this.rolesService.obtenerTodos();
  }

  @Get(':id')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.obtenerRolPorId(id);
  }

  @Put(':id/permisos')
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async asignarPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarPermisosDto
  ) {
    return this.rolesService.asignarPermisos(id, dto);
  }

  @Put(':id')
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async actualizarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolDto
  ) {
    return this.rolesService.actualizarRol(id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async eliminarRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.eliminarRol(id);
  }
}