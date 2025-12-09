import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        role: true,
      }
    });
    
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
    };
    
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
    };
  }

  async obtenerUsuarioCompleto(email: string) {
    return this.prisma.usuario.findUnique({
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
  }
}