import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { AsignarPermisosDto } from './dto/asignar-permisos.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermisoEnum } from '../../common/enums/permisos.enum';

/**
 * Controlador para la gestión de roles del sistema
 * 
 * Permite a los administradores:
 * - Crear nuevos roles dinámicamente
 * - Asignar permisos a roles existentes
 * - Consultar roles y sus permisos
 * 
 * Todos los endpoints requieren autenticación JWT y permisos específicos
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Proteger todas las rutas con autenticación y permisos
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Crea un nuevo rol en el sistema
   * 
   * Solo usuarios con permiso GESTIONAR_ROLES pueden crear roles
   * Útil para crear roles específicos como "PACIENTE", "BECARIO", "ASISTENTE", etc.
   * 
   * @param dto - Datos del rol a crear (nombre, descripción, permisos opcionales)
   * @returns El rol creado con sus permisos asignados
   */
  @Post()
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async crearRol(@Body() dto: CreateRolDto) {
    return this.rolesService.crearRol(dto);
  }

  /**
   * Obtiene todos los roles del sistema con sus permisos
   * 
   * Solo usuarios con permiso VER_ROLES pueden consultar la lista de roles
   * Incluye información de cuántos usuarios tienen cada rol
   * 
   * @returns Lista completa de roles con sus permisos y estadísticas
   */
  @Get('/todos/con-permisos')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerTodos() {
    return this.rolesService.obtenerTodos();
  }

  /**
   * Obtiene un rol específico por su ID
   * 
   * Solo usuarios con permiso VER_ROLES pueden consultar roles individuales
   * Útil para mostrar detalles de un rol en formularios de edición
   * 
   * @param id - ID del rol a consultar
   * @returns El rol con toda su información y permisos
   */
  @Get(':id')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.obtenerRolPorId(id);
  }

  /**
   * Asigna permisos a un rol existente
   * 
   * Solo usuarios con permiso GESTIONAR_ROLES pueden modificar permisos de roles
   * Reemplaza todos los permisos actuales del rol con los nuevos especificados
   * 
   * @param id - ID del rol al que se asignarán los permisos
   * @param dto - Lista de IDs de permisos a asignar
   * @returns El rol actualizado con sus nuevos permisos
   */
  @Put(':id/permisos')
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async asignarPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarPermisosDto
  ) {
    return this.rolesService.asignarPermisos(id, dto);
  }

  /**
   * Obtiene todos los roles del sistema sin incluir permisos
   * 
   * @returns Lista de roles con solo ID, nombre y descripción
   */
  @Get('/todos')
  @RequirePermissions(PermisoEnum.VER_ROLES)
  async findAll() {
    return this.rolesService.findAll();
  }
}