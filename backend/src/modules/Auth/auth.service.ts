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
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);
    if (user && (await compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Generamos el payload del JWT
    const payload = {
      sub: user.id,
      nombre: user.nombre,
      role: user.role.nombre, // Incluimos el nombre del rol en el payload
    };
    return {
      access_token: this.jwtService.sign(payload),// Firmamos el token con el payload
    };
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
