// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { compare } from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service'; // Asegúrate de importar el servicio Prisma si lo necesitas

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,// Inyectamos el servicio de usuarios
    private jwtService: JwtService, // Inyectamos el servicio de JWT
    private prisma: PrismaService, // Inyectamos el servicio de Prisma
  ) {}
 // Método para validar al usuario
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);
    
    if (user && user.activo && await compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role.nombre 
    }
    
    // ✅ ASEGURAR QUE RETORNE ESTA ESTRUCTURA
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: {
          id: user.role.id,
          nombre: user.role.nombre
        }
      }
    }
  }

  /**
   * Obtiene un usuario con toda la información necesaria para autenticación
   * Incluye rol, permisos del rol y permisos individuales
   * 
   * @param email - Email del usuario
   * @returns Usuario completo con permisos, o null si no existe
   */
  async obtenerUsuarioCompleto(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permisos: {
              include: {
                permiso: true // Incluir información completa de cada permiso del rol
              }
            }
          }
        },
        permisosIndividuales: {
          where: { activo: true }, // Solo permisos individuales activos
          include: {
            permiso: true // Incluir información completa de cada permiso individual
          }
        }
      }
    });
  }
}
