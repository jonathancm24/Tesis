import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { AsignarPermisosDto } from './dto/asignar-permisos.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PermisoEnum } from '../../common/enums/permisos.enum';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async crearRol(dto: CreateRolDto) {
    const rolExistente = await this.prisma.role.findUnique({
      where: { nombre: dto.nombre }
    });

    if (rolExistente) {
      throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}"`);
    }

    return this.prisma.$transaction(async (tx) => {
      const nuevoRol = await tx.role.create({
        data: {
          nombre: dto.nombre,
          description: dto.descripcion,
        }
      });

      if (dto.permisos && dto.permisos.length > 0) {
        const permisosExistentes = await tx.permiso.findMany({
          where: { id: { in: dto.permisos } }
        });

        if (permisosExistentes.length !== dto.permisos.length) {
          throw new NotFoundException('Uno o más permisos especificados no existen');
        }

        await tx.rolePermiso.createMany({
          data: dto.permisos.map(permisoId => ({
            roleId: nuevoRol.id,
            permisoId
          }))
        });
      }

      return this.obtenerRolPorId(nuevoRol.id);
    });
  }

  async asignarPermisos(rolId: number, dto: AsignarPermisosDto) {
    const rol = await this.prisma.role.findUnique({
      where: { id: rolId }
    });

    if (!rol) {
      throw new NotFoundException(`No se encontró un rol con ID ${rolId}`);
    }

    if (dto.permisos.length > 0) {
      const permisosExistentes = await this.prisma.permiso.findMany({
        where: { id: { in: dto.permisos } }
      });

      if (permisosExistentes.length !== dto.permisos.length) {
        throw new NotFoundException('Uno o más permisos especificados no existen');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermiso.deleteMany({
        where: { roleId: rolId }
      });

      if (dto.permisos.length > 0) {
        await tx.rolePermiso.createMany({
          data: dto.permisos.map(permisoId => ({
            roleId: rolId,
            permisoId
          }))
        });
      }

      return this.obtenerRolPorId(rolId);
    });
  }

  async obtenerTodos() {
    return this.prisma.role.findMany({
      include: {
        permisos: {
          include: {
            permiso: true
          }
        },
        _count: {
          select: { usuarios: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

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

  async actualizarRol(id: number, dto: UpdateRolDto) {
    const rol = await this.prisma.role.findUnique({ where: { id } });
    if (!rol) throw new NotFoundException(`No se encontró un rol con ID ${id}`);

    if (dto.nombre && dto.nombre !== rol.nombre) {
      const conflicto = await this.prisma.role.findUnique({ where: { nombre: dto.nombre } });
      if (conflicto) {
        throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}"`);
      }
    }

    await this.prisma.role.update({
      where: { id },
      data: {
        nombre: dto.nombre ?? rol.nombre,
        description: dto.descripcion ?? rol.description,
      }
      });

    return this.obtenerRolPorId(id);
  }

  async eliminarRol(id: number) {
    const rol = await this.prisma.role.findUnique({ where: { id } });
    if (!rol) throw new NotFoundException(`No se encontró un rol con ID ${id}`);

    const protegidos = [RoleEnum.ADMIN, RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.SECRETARIO];
    if (protegidos.includes(rol.nombre as RoleEnum)) {
      throw new ConflictException('No se pueden eliminar los roles del sistema base');
    }

    const usuariosConRol = await this.prisma.usuario.count({ where: { roleId: id } });
    if (usuariosConRol > 0) {
      throw new ConflictException(`No se puede eliminar el rol; hay ${usuariosConRol} usuario(s) que lo usan`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermiso.deleteMany({ where: { roleId: id } });
      await tx.role.delete({ where: { id } });
    });

    return { id, eliminado: true };
  }

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

  async inicializarRolesPredefinidos() {
    const rolesPredefinidos = [
      {
        nombre: RoleEnum.ADMIN,
        descripcion: 'Administrador del sistema con acceso completo',
        permisos: Object.values(PermisoEnum)
      },
      {
        nombre: RoleEnum.PROFESOR,
        descripcion: 'Docente de la facultad que supervisa estudiantes',
        permisos: [
          PermisoEnum.VER_USUARIOS,
          PermisoEnum.EDITAR_USUARIOS,
          PermisoEnum.VER_TODOS_TRATAMIENTOS,
          PermisoEnum.APROBAR_TRATAMIENTOS,
          PermisoEnum.EDITAR_TRATAMIENTOS,
          PermisoEnum.VER_TODAS_LAS_CITAS,
          PermisoEnum.CREAR_CITAS,
          PermisoEnum.EDITAR_CITAS,
          PermisoEnum.VER_PACIENTES,
          PermisoEnum.EDITAR_PACIENTES,
          PermisoEnum.VER_SOLICITUDES,
          PermisoEnum.APROBAR_SOLICITUDES,
          PermisoEnum.VER_ESPECIALIDADES,
          PermisoEnum.VER_ENCUESTAS,
          PermisoEnum.CREAR_ENCUESTAS,
          PermisoEnum.VER_CONFIGURACION,
          PermisoEnum.VER_ESTADISTICAS,
        ]
      },
      {
        nombre: RoleEnum.ESTUDIANTE,
        descripcion: 'Estudiante de odontología que realiza tratamientos supervisados',
        permisos: [
          PermisoEnum.VER_CITAS,
          PermisoEnum.CREAR_CITAS,
          PermisoEnum.VER_TRATAMIENTOS,
          PermisoEnum.CREAR_TRATAMIENTOS,
          PermisoEnum.VER_PACIENTES,
          PermisoEnum.CREAR_PACIENTES,
          PermisoEnum.CREAR_SOLICITUDES,
          PermisoEnum.VER_ESPECIALIDADES,
          PermisoEnum.VER_ENCUESTAS,
          PermisoEnum.CREAR_ENCUESTAS,
        ]
      },
      {
        nombre: RoleEnum.SECRETARIO,
        descripcion: 'Personal administrativo que gestiona citas y usuarios',
        permisos: [
          PermisoEnum.VER_USUARIOS,
          PermisoEnum.CREAR_USUARIOS,
          PermisoEnum.EDITAR_USUARIOS,
          PermisoEnum.VER_TODAS_LAS_CITAS,
          PermisoEnum.CREAR_CITAS,
          PermisoEnum.EDITAR_CITAS,
          PermisoEnum.CANCELAR_CITAS,
          PermisoEnum.VER_PACIENTES,
          PermisoEnum.CREAR_PACIENTES,
          PermisoEnum.EDITAR_PACIENTES,
          PermisoEnum.VER_TRATAMIENTOS,
          PermisoEnum.VER_SOLICITUDES,
          PermisoEnum.VER_ESPECIALIDADES,
        ]
      }
    ];

    for (const rolData of rolesPredefinidos) {
      await this.crearRolSiNoExiste(rolData);
    }
  }

  private async crearRolSiNoExiste(rolData: {
    nombre: string;
    descripcion: string;
    permisos: string[];
  }) {
    const rolExistente = await this.prisma.role.findUnique({
      where: { nombre: rolData.nombre }
    });

    if (rolExistente) {
      return;
    }

    const permisos = await this.prisma.permiso.findMany({
      where: { nombre: { in: rolData.permisos } }
    });

    try {
      await this.crearRol({
        nombre: rolData.nombre,
        descripcion: rolData.descripcion,
        permisos: permisos.map(p => p.id)
      });
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        throw error;
      }
    }
  }
}