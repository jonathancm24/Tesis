import { PrismaService } from "../../prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "./DTO/registro.dto";
import { compare, hash } from "bcrypt";
import { Usuario } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";



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
// Método para encontrar un usuario por email
  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    return usuario;
  }
}