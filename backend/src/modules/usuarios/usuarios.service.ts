import { PrismaService } from "../../prisma/prisma.service";
import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { RegisterDto } from "./DTO/registro.dto";
import { compare, hash } from "bcrypt";
import { Usuario } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UpdateUsuarioDto } from "./DTO/update-usuario.dto";
import { PerfilDto } from "./DTO/perfil.dto";
import { IPerfilResponse } from './Interface/perfil.inerface';
import { ChangePasswordDto } from "./DTO/change-password.dto";



@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) { }
  async register(data: RegisterDto): Promise<Usuario> {
    // Verificar duplicados con mensajes específicos
    const [existingEmail, existingDocumento] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { email: data.email } }),
      this.prisma.usuario.findUnique({ where: { numeroDocumento: data.numeroDocumento } })
    ]);

    if (existingEmail) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    if (existingDocumento) {
      throw new ConflictException('Ya existe un usuario con este número de documento');
    }

    const hashedPassword = await hash(data.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        fechaNacimiento: new Date(data.fechaNacimiento),
        password: hashedPassword,
        roleId: data.roleId,
        parroquiaId: data.parroquiaId,
      },
    });
    // Crear relaciones con especialidades (solo si se proporcionaron)
    const especialidadIds = data.especialidadIds ?? [];
    if (especialidadIds.length > 0) {
      await this.prisma.usuarioEspecialidad.createMany({
        data: especialidadIds.map(especialidadId => ({
          usuarioId: usuario.id,
          especialidadId,
        })),
      });
    }

    return usuario;
  }

  // Método para obtener todos los usuarios
  async findAll(): Promise<Usuario[]> {
    return this.prisma.usuario.findMany({
      include: {
        especialidades: true,
        role: true,
      },
    });
  }

  // Método para actualizar un usuario
  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    // Verificar si el usuario existe
    const usuario = await this.findById(id);

    // ✅ CREAR OBJETO DE ACTUALIZACIÓN SIN MODIFICAR LA CONTRASEÑA AUTOMÁTICAMENTE
    const updateData: any = {};

    // Solo actualizar campos que se proporcionan
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.apellido !== undefined) updateData.apellido = data.apellido;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.tipoDocumento !== undefined) updateData.tipoDocumento = data.tipoDocumento;
    if (data.numeroDocumento !== undefined) updateData.numeroDocumento = data.numeroDocumento;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.parroquiaId !== undefined) updateData.parroquiaId = data.parroquiaId;
    if (data.NotasAdicionales !== undefined) updateData.NotasAdicionales = data.NotasAdicionales;

    // ✅ SOLO HASHEAR SI SE PROPORCIONA UNA NUEVA CONTRASEÑA
    if (data.password && data.password.trim() !== '') {
      updateData.password = await hash(data.password, 10);
    }

    // ✅ SOLO ACTUALIZAR FECHA SI SE PROPORCIONA
    if (data.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(data.fechaNacimiento);
    }

    // Actualizar el usuario
    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      include: {
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        role: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
    });

    // ✅ ACTUALIZAR ESPECIALIDADES SI SE PROPORCIONAN
    if (data.especialidadIds !== undefined) {
      // Eliminar especialidades existentes
      await this.prisma.usuarioEspecialidad.deleteMany({
        where: { usuarioId: id }
      });

      // Crear nuevas relaciones de especialidades
      if (data.especialidadIds.length > 0) {
        await this.prisma.usuarioEspecialidad.createMany({
          data: data.especialidadIds.map(especialidadId => ({
            usuarioId: id,
            especialidadId,
          })),
        });
      }
    }

    // Retornar usuario actualizado con especialidades
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        role: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
    });
  }

  // Método para encontrar un usuario por email
  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permisos: {
              include: {
                permiso: true
              }
            }
          }
        },
        permisosIndividuales: {
          where: { activo: true },
          include: {
            permiso: true
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    return usuario;
  }
  /**
    * Obtener usuario por ID
    */
  async findById(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        role: true,
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        parroquia: {
          include: {
            canton: {
              include: {
                provincia: {
                  include: { pais: true }
                }
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleActive(id: number) {
    const usuario = await this.findById(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: !usuario.activo },
      include: {
        role: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });
  }

  /**
   * Eliminar usuario (soft delete - solo desactivar)
   */
  async remove(id: number) {
    await this.findById(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Obtener perfil completo del usuario
   */
  async getProfile(userId: number): Promise<IPerfilResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        parroquia: {
          include: {
            canton: {
              include: {
                provincia: {
                  include: {
                    pais: true
                  }
                }
              }
            }
          }
        },
        role: true,
        especialidades: {
          include: {
            especialidad: true
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...usuarioSinPassword } = usuario;
    // Mapear numeroDocumento a cedula para compatibilidad con frontend
    const perfilResponse = {
      ...usuarioSinPassword,
      cedula: usuarioSinPassword.numeroDocumento
    };
    return perfilResponse as IPerfilResponse;
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userId: number, data: PerfilDto): Promise<IPerfilResponse> {
    // Verificar email único si se está actualizando
    if (data.email) {
      const existingUser = await this.prisma.usuario.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    // Actualizar usuario
    const updatedUser = await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        ...data,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined
      },
      include: {
        parroquia: {
          include: {
            canton: {
              include: {
                provincia: {
                  include: {
                    pais: true
                  }
                }
              }
            }
          }
        },
        role: true,
        especialidades: {
          include: {
            especialidad: true
          }
        }
      }
    });

    const { password, ...usuarioSinPassword } = updatedUser;
    // Mapear numeroDocumento a cedula para compatibilidad con frontend
    const perfilResponse = {
      ...usuarioSinPassword,
      cedula: usuarioSinPassword.numeroDocumento
    };
    return perfilResponse as IPerfilResponse;
  }
  /**
* Cambiar contraseña del usuario con validaciones completas
*/
  async changePassword(userId: number, data: ChangePasswordDto): Promise<{ message: string }> {
    // 1. Obtener usuario actual
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Validar que las nuevas contraseñas coincidan
    if (!ChangePasswordDto.validatePasswordsMatch(data)) {
      throw new BadRequestException('La nueva contraseña y su confirmación no coinciden');
    }

    // 3. Verificar contraseña actual
    const isCurrentPasswordValid = await compare(data.currentPassword, usuario.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // 4. Validar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await compare(data.newPassword, usuario.password);
    if (isSamePassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    // 5. Hashear nueva contraseña
    const hashedNewPassword = await hash(data.newPassword, 12); // Aumenté el salt rounds para mayor seguridad

    // 6. Actualizar contraseña en la base de datos
    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        // Opcionalmente puedes agregar un campo de última actualización de contraseña
        // passwordUpdatedAt: new Date()
      }
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Obtener especialidades del profesor autenticado
   */
  async getProfesorEspecialidades(userId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        especialidades: {
          include: {
            especialidad: true
          }
        },
        role: true
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que sea un profesor
    if (usuario.role.nombre !== 'Profesor') {
      throw new BadRequestException('Solo los profesores pueden acceder a esta información');
    }

    return {
      especialidades: usuario.especialidades.map(ue => ({
        id: ue.especialidad.id,
        nombre: ue.especialidad.nombre,
        descripcion: ue.especialidad.descripcion
      }))
    };
  }
  // Obtener usuarios por id de especialidad especifica
  async getUsuariosPorEspecialidad(especialidadId: number) {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        especialidades: {
          some: {
            especialidadId
          }
        }
      },
      include: {
        especialidades: {
          include: {
            especialidad: true
          }
        },
        role: true
      }
    });

    return usuarios.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      especialidades: usuario.especialidades.map(ue => ({
        id: ue.especialidad.id,
        nombre: ue.especialidad.nombre
      })),
      role: usuario.role.nombre
    }));
  }
}