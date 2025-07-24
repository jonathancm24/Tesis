import {
  Controller,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PermisosUsuariosService } from './permisos-usuarios.service';
import { AsignarPermisoIndividualDto } from './dto/asignar-permiso-individual.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermisoEnum } from '../../common/enums/permisos.enum';

/**
 * Controlador para la gestión de permisos individuales de usuarios
 * 
 * Permite a los administradores asignar permisos especiales a usuarios específicos
 * más allá de los permisos que ya tienen por su rol asignado
 */
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermisosUsuariosController {
  constructor(private readonly permisosUsuariosService: PermisosUsuariosService) {}

  /**
   * Asigna un permiso individual a un usuario específico
   * 
   * Solo usuarios con permiso ASIGNAR_PERMISOS_INDIVIDUALES pueden usar este endpoint
   * El permiso se suma a los que el usuario ya tiene por su rol
   * 
   * @param usuarioId - ID del usuario al que se asignará el permiso
   * @param dto - Datos del permiso (ID, fecha de expiración, justificación)
   * @param req - Request object que contiene información del usuario autenticado
   * @returns El permiso individual creado
   */
  @Put(':id/permisos')
  @RequirePermissions(PermisoEnum.ASIGNAR_PERMISOS_INDIVIDUALES)
  async asignarPermisoIndividual(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Body() dto: AsignarPermisoIndividualDto,
    @Request() req
  ) {
    return this.permisosUsuariosService.asignarPermisoIndividual(
      usuarioId,
      dto,
      req.user.id // ID del usuario que está otorgando el permiso
    );
  }

  /**
   * Revoca un permiso individual de un usuario
   * 
   * Solo usuarios con permiso REVOCAR_PERMISOS_INDIVIDUALES pueden usar este endpoint
   * No elimina el registro, lo marca como inactivo para mantener auditoría
   * 
   * @param usuarioId - ID del usuario al que se revocará el permiso
   * @param permisoId - ID del permiso a revocar
   * @returns El permiso individual desactivado
   */
  @Delete(':usuarioId/permisos/:permisoId')
  @RequirePermissions(PermisoEnum.REVOCAR_PERMISOS_INDIVIDUALES)
  async revocarPermisoIndividual(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number
  ) {
    return this.permisosUsuariosService.revocarPermisoIndividual(usuarioId, permisoId);
  }

  /**
   * Obtiene todos los permisos individuales de un usuario
   * 
   * Solo usuarios con permiso VER_USUARIOS pueden consultar permisos individuales
   * Incluye historial completo (activos e inactivos) para auditoría
   * 
   * @param usuarioId - ID del usuario
   * @returns Lista de permisos individuales del usuario
   */
  @Get(':id/permisos')
  @RequirePermissions(PermisoEnum.VER_USUARIOS)
  async obtenerPermisosIndividuales(@Param('id', ParseIntPipe) usuarioId: number) {
    return this.permisosUsuariosService.obtenerPermisosIndividualesDeUsuario(usuarioId);
  }

  /**
   * Obtiene permisos próximos a expirar en todo el sistema
   * 
   * Solo usuarios con permiso GESTIONAR_ROLES pueden ver este reporte
   * Útil para notificar sobre permisos que necesitan renovación
   * 
   * @param dias - Número de días de anticipación (default: 7)
   * @returns Lista de permisos próximos a expirar
   */
  @Get('permisos/proximos-a-expirar')
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async obtenerPermisosProximosAExpirar(@Query('dias') dias?: string) {
    const diasAnticipacion = dias ? parseInt(dias) : 7;
    return this.permisosUsuariosService.obtenerPermisosProximosAExpirar(diasAnticipacion);
  }

  /**
   * Limpia permisos expirados del sistema
   * 
   * Solo usuarios con permiso GESTIONAR_ROLES pueden ejecutar esta limpieza
   * Desactiva automáticamente permisos individuales que ya expiraron
   * 
   * @returns Número de permisos que fueron desactivados
   */
  @Put('permisos/limpiar-expirados')
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  async limpiarPermisosExpirados() {
    const permisosLimpiados = await this.permisosUsuariosService.limpiarPermisosExpirados();
    return {
      mensaje: `Se desactivaron ${permisosLimpiados} permisos expirados`,
      permisosDesactivados: permisosLimpiados
    };
  }
}

