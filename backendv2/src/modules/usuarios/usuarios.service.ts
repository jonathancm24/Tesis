import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  UnauthorizedException 
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { 
  CreateUsuarioDto, 
  UpdateUsuarioDto, 
  ChangePasswordDto,
  UsuarioResponseDto,
  UsuariosPaginatedResponseDto,
  UsuarioFiltersDto
} from './dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

/**
 * Servicio para manejar operaciones CRUD de usuarios
 * Incluye validaciones de negocio y transformaciones de datos
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo usuario en el sistema
   * @param createUsuarioDto - Datos del usuario a crear
   * @returns Promise<UsuarioResponseDto> - Usuario creado (sin contraseña)
   */
  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Verificar que el email no esté en uso
    await this.validateUniqueEmail(createUsuarioDto.email);
    
    // Verificar que el documento no esté en uso
    await this.validateUniqueDocument(
      createUsuarioDto.tipoDocumento, 
      createUsuarioDto.numeroDocumento
    );
    
    // Verificar que el rol existe
    await this.validateRoleExists(createUsuarioDto.roleId);
    
    // Verificar que la parroquia existe (si se proporciona)
    if (createUsuarioDto.parroquiaId) {
      await this.validateParroquiaExists(createUsuarioDto.parroquiaId);
    }
    
    // Verificar que las especialidades existen (si se proporcionan)
    if (createUsuarioDto.especialidadIds?.length) {
      await this.validateEspecialidadesExist(createUsuarioDto.especialidadIds);
    }

    // Encriptar la contraseña
    const hashedPassword = await this.hashPassword(createUsuarioDto.password);

    try {
      // Crear el usuario con transacción para manejar las relaciones
      const usuario = await this.prisma.$transaction(async (prisma) => {
        // Crear el usuario base
        const newUsuario = await prisma.usuario.create({
          data: {
            nombre: createUsuarioDto.nombre,
            apellido: createUsuarioDto.apellido,
            email: createUsuarioDto.email,
            password: hashedPassword,
            fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
            telefono: createUsuarioDto.telefono,
            direccion: createUsuarioDto.direccion,
            NotasAdicionales: createUsuarioDto.NotasAdicionales,
            parroquiaId: createUsuarioDto.parroquiaId,
            roleId: createUsuarioDto.roleId,
            activo: createUsuarioDto.activo ?? true,
            tipoDocumento: createUsuarioDto.tipoDocumento,
            numeroDocumento: createUsuarioDto.numeroDocumento,
          },
        });

        // Asociar especialidades si se proporcionan
        if (createUsuarioDto.especialidadIds?.length) {
          await prisma.usuarioEspecialidad.createMany({
            data: createUsuarioDto.especialidadIds.map(especialidadId => ({
              usuarioId: newUsuario.id,
              especialidadId,
            })),
          });
        }

        return newUsuario;
      });

      // Obtener el usuario completo con sus relaciones
      return this.findOneWithRelations(usuario.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Manejar errores específicos de Prisma
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un usuario con estos datos únicos');
        }
      }
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con filtros y paginación
   * @param filters - Filtros de búsqueda y paginación
   * @returns Promise<UsuariosPaginatedResponseDto> - Lista paginada de usuarios
   */
  async findAll(filters: UsuarioFiltersDto): Promise<UsuariosPaginatedResponseDto> {
    const { page = 1, limit = 10, orderBy = 'fechaRegistro', orderDirection = 'desc' } = filters;
    
    // Construir las condiciones de filtrado
    const where = this.buildWhereConditions(filters);
    
    // Configurar inclusión de relaciones
    const include = {
      role: {
        select: {
          id: true,
          nombre: true,
          description: true,
        },
      },
      parroquia: {
        select: {
          id: true,
          nombre: true,
          canton: {
            select: {
              id: true,
              nombre: true,
              provincia: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
      especialidades: {
        select: {
          especialidad: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
            },
          },
        },
      },
    };

    // Ejecutar consultas en paralelo para obtener datos y conteo total
    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        include,
        orderBy: {
          [orderBy]: orderDirection,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.usuario.count({ where }),
    ]);

    // Transformar los datos para la respuesta
    const usuariosResponse = usuarios.map(usuario => 
      this.transformToResponseDto(usuario)
    );

    return new UsuariosPaginatedResponseDto(usuariosResponse, total, page, limit);
  }

  /**
   * Obtener un usuario por ID
   * @param id - ID del usuario
   * @returns Promise<UsuarioResponseDto> - Usuario encontrado
   */
  async findOne(id: number): Promise<UsuarioResponseDto> {
    return this.findOneWithRelations(id);
  }

  /**
   * Actualizar un usuario existente
   * @param id - ID del usuario a actualizar
   * @param updateUsuarioDto - Datos a actualizar
   * @returns Promise<UsuarioResponseDto> - Usuario actualizado
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    // Verificar que el usuario existe
    await this.findOneWithRelations(id);

    // Validar email único si se está actualizando
    if (updateUsuarioDto.email) {
      await this.validateUniqueEmail(updateUsuarioDto.email, id);
    }

    // Validar documento único si se está actualizando
    if (updateUsuarioDto.tipoDocumento && updateUsuarioDto.numeroDocumento) {
      await this.validateUniqueDocument(
        updateUsuarioDto.tipoDocumento,
        updateUsuarioDto.numeroDocumento,
        id
      );
    }

    // Validar referencias si se están actualizando
    if (updateUsuarioDto.roleId) {
      await this.validateRoleExists(updateUsuarioDto.roleId);
    }

    if (updateUsuarioDto.parroquiaId) {
      await this.validateParroquiaExists(updateUsuarioDto.parroquiaId);
    }

    try {
      // Actualizar con transacción para manejar especialidades
      await this.prisma.$transaction(async (prisma) => {
        // Actualizar datos básicos del usuario
        await prisma.usuario.update({
          where: { id },
          data: {
            ...updateUsuarioDto,
            fechaNacimiento: updateUsuarioDto.fechaNacimiento 
              ? new Date(updateUsuarioDto.fechaNacimiento) 
              : undefined,
          },
        });

        // Actualizar especialidades si se proporcionan
        if (updateUsuarioDto.especialidadIds !== undefined) {
          // Eliminar especialidades existentes
          await prisma.usuarioEspecialidad.deleteMany({
            where: { usuarioId: id },
          });

          // Agregar nuevas especialidades
          if (updateUsuarioDto.especialidadIds.length > 0) {
            await this.validateEspecialidadesExist(updateUsuarioDto.especialidadIds);
            await prisma.usuarioEspecialidad.createMany({
              data: updateUsuarioDto.especialidadIds.map(especialidadId => ({
                usuarioId: id,
                especialidadId,
              })),
            });
          }
        }
      });

      return this.findOneWithRelations(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un usuario con estos datos únicos');
        }
      }
      throw error;
    }
  }

  /**
   * Cambiar la contraseña de un usuario
   * @param id - ID del usuario
   * @param changePasswordDto - Datos para cambio de contraseña
   * @returns Promise<{ message: string }> - Confirmación del cambio
   */
  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    // Validar que las contraseñas coincidan
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Obtener el usuario con la contraseña actual
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, password: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword, 
      usuario.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Encriptar la nueva contraseña
    const hashedNewPassword = await this.hashPassword(changePasswordDto.newPassword);

    // Actualizar la contraseña
    await this.prisma.usuario.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Activar o desactivar un usuario
   * @param id - ID del usuario
   * @param activo - Estado activo (true/false)
   * @returns Promise<UsuarioResponseDto> - Usuario actualizado
   */
  async toggleActive(id: number, activo: boolean): Promise<UsuarioResponseDto> {
    await this.findOneWithRelations(id); // Verificar que existe

    await this.prisma.usuario.update({
      where: { id },
      data: { activo },
    });

    return this.findOneWithRelations(id);
  }

  /**
   * Eliminar un usuario (soft delete)
   * @param id - ID del usuario a eliminar
   * @returns Promise<{ message: string }> - Confirmación de eliminación
   */
  async remove(id: number): Promise<{ message: string }> {
    await this.findOneWithRelations(id); // Verificar que existe

    // Desactivar el usuario en lugar de eliminarlo físicamente
    await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });

    return { message: `Usuario con ID ${id} desactivado exitosamente` };
  }

  // MÉTODOS PRIVADOS PARA VALIDACIONES Y UTILIDADES

  /**
   * Obtener un usuario con todas sus relaciones
   */
  private async findOneWithRelations(id: number): Promise<UsuarioResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            nombre: true,
            description: true,
          },
        },
        parroquia: {
          select: {
            id: true,
            nombre: true,
            canton: {
              select: {
                id: true,
                nombre: true,
                provincia: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        especialidades: {
          select: {
            especialidad: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.transformToResponseDto(usuario);
  }

  /**
   * Construir condiciones WHERE para filtros de búsqueda
   */
  private buildWhereConditions(filters: UsuarioFiltersDto): Prisma.UsuarioWhereInput {
    const where: Prisma.UsuarioWhereInput = {};

    if (filters.nombre) {
      where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    }

    if (filters.apellido) {
      where.apellido = { contains: filters.apellido, mode: 'insensitive' };
    }

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters.roleId) {
      where.roleId = filters.roleId;
    }

    if (filters.parroquiaId) {
      where.parroquiaId = filters.parroquiaId;
    }

    if (filters.tipoDocumento) {
      where.tipoDocumento = filters.tipoDocumento;
    }

    // Filtros de fecha de nacimiento
    if (filters.fechaNacimientoDesde || filters.fechaNacimientoHasta) {
      where.fechaNacimiento = {};
      if (filters.fechaNacimientoDesde) {
        where.fechaNacimiento.gte = new Date(filters.fechaNacimientoDesde);
      }
      if (filters.fechaNacimientoHasta) {
        where.fechaNacimiento.lte = new Date(filters.fechaNacimientoHasta);
      }
    }

    // Filtros de fecha de registro
    if (filters.fechaCreacionDesde || filters.fechaCreacionHasta) {
      where.fechaRegistro = {};
      if (filters.fechaCreacionDesde) {
        where.fechaRegistro.gte = new Date(filters.fechaCreacionDesde);
      }
      if (filters.fechaCreacionHasta) {
        where.fechaRegistro.lte = new Date(filters.fechaCreacionHasta);
      }
    }

    return where;
  }

  /**
   * Transformar usuario de Prisma a DTO de respuesta
   */
  private transformToResponseDto(usuario: any): UsuarioResponseDto {
    return new UsuarioResponseDto({
      ...usuario,
      especialidades: usuario.especialidades?.map((ue: any) => ue.especialidad) || [],
    });
  }

  /**
   * Validar que un email es único
   */
  private async validateUniqueEmail(email: string, excludeId?: number): Promise<void> {
    const where: Prisma.UsuarioWhereInput = { email };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const existingUser = await this.prisma.usuario.findFirst({ where });
    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email: ${email}`);
    }
  }

  /**
   * Validar que un documento es único
   */
  private async validateUniqueDocument(
    tipoDocumento: any, 
    numeroDocumento: string, 
    excludeId?: number
  ): Promise<void> {
    const where: Prisma.UsuarioWhereInput = { 
      tipoDocumento, 
      numeroDocumento 
    };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const existingUser = await this.prisma.usuario.findFirst({ where });
    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario con el documento ${tipoDocumento}: ${numeroDocumento}`
      );
    }
  }

  /**
   * Validar que un rol existe
   */
  private async validateRoleExists(roleId: number): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }
  }

  /**
   * Validar que una parroquia existe
   */
  private async validateParroquiaExists(parroquiaId: number): Promise<void> {
    const parroquia = await this.prisma.parroquia.findUnique({ where: { id: parroquiaId } });
    if (!parroquia) {
      throw new NotFoundException(`Parroquia con ID ${parroquiaId} no encontrada`);
    }
  }

  /**
   * Validar que las especialidades existen
   */
  private async validateEspecialidadesExist(especialidadIds: number[]): Promise<void> {
    const especialidades = await this.prisma.especialidad.findMany({
      where: { id: { in: especialidadIds } },
    });

    const foundIds = especialidades.map(e => e.id);
    const missingIds = especialidadIds.filter(id => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Especialidades no encontradas con IDs: ${missingIds.join(', ')}`
      );
    }
  }

  /**
   * Encriptar contraseña
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}