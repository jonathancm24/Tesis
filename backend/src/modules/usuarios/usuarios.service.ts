import { PrismaService } from "../../prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "./DTO/registro.dto";
import { compare, hash } from "bcrypt";
import { Usuario } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UpdateUsuarioDto } from "./DTO/update-usuario.dto";



@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}
   async register(data: RegisterDto): Promise<Usuario> {
  const hashedPassword = await hash(data.password, 10);
  const usuario = await this.prisma.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      cedula: data.cedula,
      fechaNacimiento: new Date(data.fechaNacimiento), 
      password: hashedPassword,
      roleId: data.roleId,
      parroquiaId: data.parroquiaId,
    },
  });

  // Crear las relaciones en la tabla intermedia
  await this.prisma.usuarioEspecialidad.createMany({
    data: data.especialidadIds.map(especialidadId => ({
      usuarioId: usuario.id,
      especialidadId,
    })),
  });
try {
  return usuario;

        } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
            throw new Error('Email already exists');
            }
        }
        throw error;
        }
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
    const updateData: any = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      roleId: data.roleId,
      activo: data.activo,
      parroquiaId: data.parroquiaId,
    };

    // ✅ SOLO HASHEAR SI SE PROPORCIONA UNA NUEVA CONTRASEÑA
    if (data.password && data.password !== usuario.password) {
      updateData.password = await hash(data.password, 10);
    }

    // ✅ SOLO ACTUALIZAR FECHA SI SE PROPORCIONA
    if (data.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(data.fechaNacimiento);
    }

    // Actualizar el usuario
    return this.prisma.usuario.update({
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


}