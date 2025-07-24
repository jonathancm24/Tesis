import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AsignarPermisoIndividualDto } from './dto/asignar-permiso-individual.dto';

/**
 * Servicio para gestionar permisos individuales de usuarios
 * 
 * Los permisos individuales son permisos especiales que se asignan a usuarios específicos
 * más allá de los permisos que ya tienen por su rol. Pueden ser temporales o permanentes.
 */
@Injectable()
export class PermisosUsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Asigna un permiso individual a un usuario específico
   * 
   * Este permiso se suma a los permisos que el usuario ya tiene por su rol
   * Puede ser temporal (con fecha de expiración) o permanente
   * 
   * @param usuarioId - ID del usuario al que se asignará el permiso
   * @param dto - Datos del permiso a asignar (permisoId, fechaExpiracion, justificacion)
   * @param otorgadoPor - ID del usuario que está otorgando el permiso
   * @returns El permiso individual creado
   * @throws NotFoundException si el usuario o el permiso no existen
   * @throws ConflictException si el usuario ya tiene ese permiso individual
   */
  async asignarPermisoIndividual(
    usuarioId: number,
    dto: AsignarPermisoIndividualDto,
    otorgadoPor: number
  ) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontró un usuario con ID ${usuarioId}`);
    }

    // Verificar que el permiso existe
    const permiso = await this.prisma.permiso.findUnique({
      where: { id: dto.permisoId }
    });

    if (!permiso) {
      throw new NotFoundException(`No se encontró un permiso con ID ${dto.permisoId}`);
    }

    // Verificar si el usuario ya tiene este permiso individual activo
    const permisoExistente = await this.prisma.usuarioPermiso.findUnique({
      where: {
        usuarioId_permisoId: {
          usuarioId,
          permisoId: dto.permisoId
        }
      }
    });

    if (permisoExistente && permisoExistente.activo) {
      throw new ConflictException(
        `El usuario ya tiene el permiso "${permiso.nombre}" asignado individualmente`
      );
    }

    // Si existe pero está inactivo, reactivarlo
    if (permisoExistente && !permisoExistente.activo) {
      return this.prisma.usuarioPermiso.update({
        where: { id: permisoExistente.id },
        data: {
          activo: true,
          otorgadoPor,
          fechaOtorgamiento: new Date(),
          fechaExpiracion: dto.fechaExpiracion ? new Date(dto.fechaExpiracion) : null,
          justificacion: dto.justificacion
        },
        include: {
          permiso: true,
          usuario: { select: { id: true, nombre: true, email: true } },
          otorgador: { select: { id: true, nombre: true, email: true } }
        }
      });
    }

    // Crear el nuevo permiso individual
    return this.prisma.usuarioPermiso.create({
      data: {
        usuarioId,
        permisoId: dto.permisoId,
        otorgadoPor,
        fechaExpiracion: dto.fechaExpiracion ? new Date(dto.fechaExpiracion) : null,
        justificacion: dto.justificacion
      },
      include: {
        permiso: true,
        usuario: { select: { id: true, nombre: true, email: true } },
        otorgador: { select: { id: true, nombre: true, email: true } }
      }
    });
  }

  /**
   * Revoca un permiso individual de un usuario
   * 
   * No elimina el registro, sino que lo marca como inactivo para mantener auditoría
   * 
   * @param usuarioId - ID del usuario al que se revocará el permiso
   * @param permisoId - ID del permiso a revocar
   * @returns El permiso individual desactivado
   * @throws NotFoundException si no se encuentra el permiso individual activo
   */
  async revocarPermisoIndividual(usuarioId: number, permisoId: number) {
    // Buscar el permiso individual activo
    const permisoIndividual = await this.prisma.usuarioPermiso.findFirst({
      where: {
        usuarioId,
        permisoId,
        activo: true
      }
    });

    if (!permisoIndividual) {
      throw new NotFoundException(
        'No se encontró un permiso individual activo para este usuario y permiso'
      );
    }

    // Desactivar el permiso (no eliminarlo para mantener auditoría)
    return this.prisma.usuarioPermiso.update({
      where: { id: permisoIndividual.id },
      data: { activo: false },
      include: {
        permiso: true,
        usuario: { select: { id: true, nombre: true, email: true } }
      }
    });
  }

  /**
   * Obtiene todos los permisos individuales de un usuario
   * 
   * Incluye tanto permisos activos como inactivos para auditoría completa
   * 
   * @param usuarioId - ID del usuario
   * @returns Lista de permisos individuales del usuario
   */
  async obtenerPermisosIndividualesDeUsuario(usuarioId: number) {
    return this.prisma.usuarioPermiso.findMany({
      where: { usuarioId },
      include: {
        permiso: true,
        otorgador: { select: { id: true, nombre: true, email: true } }
      },
      orderBy: { fechaOtorgamiento: 'desc' }
    });
  }

  /**
   * Obtiene todos los permisos individuales activos que están próximos a expirar
   * 
   * Útil para notificar a los administradores sobre permisos que necesitan renovación
   * 
   * @param diasAnticipacion - Número de días de anticipación para considerar "próximo a expirar"
   * @returns Lista de permisos próximos a expirar
   */
  async obtenerPermisosProximosAExpirar(diasAnticipacion: number = 7) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);

    return this.prisma.usuarioPermiso.findMany({
      where: {
        activo: true,
        fechaExpiracion: {
          lte: fechaLimite,
          gte: new Date() // Solo los que aún no han expirado
        }
      },
      include: {
        permiso: true,
        usuario: { select: { id: true, nombre: true, email: true } },
        otorgador: { select: { id: true, nombre: true, email: true } }
      },
      orderBy: { fechaExpiracion: 'asc' }
    });
  }

  /**
   * Limpia automáticamente permisos expirados
   * 
   * Desactiva permisos individuales que ya han expirado
   * Este método debería ejecutarse periódicamente (ej: mediante un cron job)
   * 
   * @returns Número de permisos que fueron desactivados
   */
  async limpiarPermisosExpirados() {
    const resultado = await this.prisma.usuarioPermiso.updateMany({
      where: {
        activo: true,
        fechaExpiracion: {
          lt: new Date() // Menor que la fecha actual = expirados
        }
      },
      data: { activo: false }
    });

    return resultado.count;
  }
}