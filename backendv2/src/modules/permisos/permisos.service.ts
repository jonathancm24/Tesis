import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PermisosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodosLosPermisos() {
    return await this.prisma.permiso.findMany({
      orderBy: [
        { modulo: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  async obtenerPermisosOrganizados() {
    const permisos = await this.obtenerTodosLosPermisos();
    
    const permisosOrganizados = permisos.reduce((acc, permiso) => {
      const modulo = permiso.modulo;
      
      if (!acc[modulo]) {
        acc[modulo] = [];
      }
      
      acc[modulo].push(permiso);
      
      return acc;
    }, {} as Record<string, any[]>);

    return permisosOrganizados;
  }

  async obtenerModulosDePermisos() {
    const result = await this.prisma.permiso.findMany({
      select: {
        modulo: true
      },
      distinct: ['modulo'],
      orderBy: {
        modulo: 'asc'
      }
    });

    return result.map(item => item.modulo);
  }
}