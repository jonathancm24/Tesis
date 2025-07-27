import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { AsignarPermisosDto } from './dto/asignar-permisos.dto';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PermisoEnum, PERMISOS_POR_MODULO } from '../../common/enums/permisos.enum';

/**
 * Servicio para gestionar roles y permisos del sistema
 * Permite crear roles dinámicamente y asignar permisos de forma flexible
 */
@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo rol en el sistema con permisos opcionales
   * 
   * @param dto - Datos del rol a crear (nombre, descripción, permisos)
   * @returns El rol creado con sus permisos asignados
   * @throws ConflictException si ya existe un rol con el mismo nombre
   */
  async crearRol(dto: CreateRolDto) {
    // Verificar si ya existe un rol con el mismo nombre
    const rolExistente = await this.prisma.role.findUnique({
      where: { nombre: dto.nombre }
    });

    if (rolExistente) {
      throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}"`);
    }

    // Usar transacción para asegurar consistencia de datos
    return this.prisma.$transaction(async (tx) => {
      // Crear el rol
      const nuevoRol = await tx.role.create({
        data: {
          nombre: dto.nombre,
          description: dto.descripcion,
        }
      });

      // Asignar permisos si se proporcionaron
      if (dto.permisos && dto.permisos.length > 0) {
        // Verificar que todos los permisos existan
        const permisosExistentes = await tx.permiso.findMany({
          where: { id: { in: dto.permisos } }
        });

        if (permisosExistentes.length !== dto.permisos.length) {
          throw new NotFoundException('Uno o más permisos especificados no existen');
        }

        // Crear las relaciones rol-permiso
        await tx.rolePermiso.createMany({
          data: dto.permisos.map(permisoId => ({
            roleId: nuevoRol.id,
            permisoId
          }))
        });
      }

      // Retornar el rol creado con sus permisos
      return this.obtenerRolPorId(nuevoRol.id);
    });
  }

  /**
   * Asigna permisos a un rol existente
   * Reemplaza todos los permisos actuales del rol con los nuevos especificados
   * 
   * @param rolId - ID del rol al que se asignarán los permisos
   * @param dto - Lista de IDs de permisos a asignar
   * @returns El rol actualizado con sus nuevos permisos
   * @throws NotFoundException si el rol no existe
   */
  async asignarPermisos(rolId: number, dto: AsignarPermisosDto) {
    // Verificar que el rol existe
    const rol = await this.prisma.role.findUnique({
      where: { id: rolId }
    });

    if (!rol) {
      throw new NotFoundException(`No se encontró un rol con ID ${rolId}`);
    }

    // Verificar que todos los permisos existen (si se proporcionaron)
    if (dto.permisos.length > 0) {
      const permisosExistentes = await this.prisma.permiso.findMany({
        where: { id: { in: dto.permisos } }
      });

      if (permisosExistentes.length !== dto.permisos.length) {
        throw new NotFoundException('Uno o más permisos especificados no existen');
      }
    }

    // Usar transacción para actualizar permisos
    return this.prisma.$transaction(async (tx) => {
      // Eliminar todos los permisos actuales del rol
      await tx.rolePermiso.deleteMany({
        where: { roleId: rolId } // ← CAMBIAR: era 'roleId' ahora es 'roleId: rolId'
      });

      // Asignar los nuevos permisos (si hay alguno)
      if (dto.permisos.length > 0) {
        await tx.rolePermiso.createMany({
          data: dto.permisos.map(permisoId => ({
            roleId: rolId, // ← CAMBIAR: era 'roleId' ahora es 'roleId: rolId'
            permisoId
          }))
        });
      }

      // Retornar el rol actualizado
      return this.obtenerRolPorId(rolId);
    });
  }

  /**
   * Obtiene todos los roles del sistema con sus permisos
   * 
   * @returns Lista de todos los roles con sus permisos incluidos
   */
  async obtenerTodos() {
    
    return this.prisma.role.findMany({
      include: {
        permisos: {
          include: {
            permiso: true // Incluir información completa de cada permiso
          }
        },
        _count: {
          select: { usuarios: true } // Contar cuántos usuarios tienen cada rol
        }
      },
      orderBy: { nombre: 'asc' } // Ordenar alfabéticamente
    });
  }

  /**
   * Obtiene un rol específico por su ID con toda su información
   * 
   * @param id - ID del rol a buscar
   * @returns El rol con sus permisos, o null si no existe
   */
  async obtenerRolPorId(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        },
        _count: {
          select: { usuarios: true }
        }
      }
    });
  }

  /**
   * Inicializa los roles base del sistema con sus permisos predefinidos
   * Este método se ejecuta al iniciar la aplicación para asegurar que los roles básicos existan
   * 
   * Solo crea roles que no existan, no modifica roles existentes
   */
  async inicializarRolesPredefinidos() {
    // Definir los permisos para cada rol base
    const rolesPredefinidos = [
      {
        nombre: RoleEnum.ADMIN,
        descripcion: 'Administrador del sistema con acceso completo',
        permisos: Object.values(PermisoEnum) // Todos los permisos disponibles
      },
      {
        nombre: RoleEnum.PROFESOR,
        descripcion: 'Docente de la facultad que supervisa estudiantes',
        permisos: [
          // Gestión de usuarios (solo ver y editar)
          PermisoEnum.VER_USUARIOS,
          PermisoEnum.EDITAR_USUARIOS,
          
          // Gestión completa de tratamientos
          PermisoEnum.VER_TODOS_TRATAMIENTOS,
          PermisoEnum.APROBAR_TRATAMIENTOS,
          PermisoEnum.EDITAR_TRATAMIENTOS,
          
          // Gestión de citas
          PermisoEnum.VER_TODAS_LAS_CITAS,
          PermisoEnum.CREAR_CITAS,
          PermisoEnum.EDITAR_CITAS,
          
          // Gestión de pacientes
          PermisoEnum.VER_PACIENTES,
          PermisoEnum.EDITAR_PACIENTES,
          
          // Aprobación de solicitudes
          PermisoEnum.VER_SOLICITUDES,
          PermisoEnum.APROBAR_SOLICITUDES,
          
          // Especialidades
          PermisoEnum.VER_ESPECIALIDADES,
        ]
      },
      {
        nombre: RoleEnum.ESTUDIANTE,
        descripcion: 'Estudiante de odontología que realiza tratamientos supervisados',
        permisos: [
          // Gestión básica de citas
          PermisoEnum.VER_CITAS,
          PermisoEnum.CREAR_CITAS,
          
          // Gestión de tratamientos (limitada)
          PermisoEnum.VER_TRATAMIENTOS,
          PermisoEnum.CREAR_TRATAMIENTOS,
          
          // Gestión básica de pacientes
          PermisoEnum.VER_PACIENTES,
          PermisoEnum.CREAR_PACIENTES,
          
          // Crear solicitudes para permisos adicionales
          PermisoEnum.CREAR_SOLICITUDES,
          
          // Ver especialidades disponibles
          PermisoEnum.VER_ESPECIALIDADES,
        ]
      },
      {
        nombre: RoleEnum.SECRETARIO,
        descripcion: 'Personal administrativo que gestiona citas y usuarios',
        permisos: [
          // Gestión de usuarios
          PermisoEnum.VER_USUARIOS,
          PermisoEnum.CREAR_USUARIOS,
          PermisoEnum.EDITAR_USUARIOS,
          
          // Gestión completa de citas
          PermisoEnum.VER_TODAS_LAS_CITAS,
          PermisoEnum.CREAR_CITAS,
          PermisoEnum.EDITAR_CITAS,
          PermisoEnum.CANCELAR_CITAS,
          
          // Gestión de pacientes
          PermisoEnum.VER_PACIENTES,
          PermisoEnum.CREAR_PACIENTES,
          PermisoEnum.EDITAR_PACIENTES,
          
          // Ver tratamientos (solo lectura)
          PermisoEnum.VER_TRATAMIENTOS,
          
          // Ver solicitudes
          PermisoEnum.VER_SOLICITUDES,
          
          // Especialidades
          PermisoEnum.VER_ESPECIALIDADES,
        ]
      }
    ];

    // Crear cada rol si no existe
    for (const rolData of rolesPredefinidos) {
      await this.crearRolSiNoExiste(rolData);
    }
  }

  /**
   * Método auxiliar para crear un rol solo si no existe
   * Utilizado durante la inicialización del sistema
   * 
   * @param rolData - Datos del rol a crear
   */
  private async crearRolSiNoExiste(rolData: {
    nombre: string;
    descripcion: string;
    permisos: string[];
  }) {
    // Verificar si el rol ya existe
    const rolExistente = await this.prisma.role.findUnique({
      where: { nombre: rolData.nombre }
    });

    if (rolExistente) {
      return; // El rol ya existe, no hacer nada
    }

    // Obtener los IDs de los permisos basándose en sus nombres
    const permisos = await this.prisma.permiso.findMany({
      where: { nombre: { in: rolData.permisos } }
    });

    // Crear el rol con sus permisos
    try {
      await this.crearRol({
        nombre: rolData.nombre,
        descripcion: rolData.descripcion,
        permisos: permisos.map(p => p.id)
      });
    } catch (error) {
      // Ignorar errores de conflicto (rol ya existe)
      if (!(error instanceof ConflictException)) {
        throw error;
      }
    }
  }
  /**
   * Obtiene todos los roles del sistema sin incluir permisos
   * 
   * @returns Lista de roles con solo ID, nombre y descripción
   */
  async findAll() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        nombre: true,
        description: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }
}