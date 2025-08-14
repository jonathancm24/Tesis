import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Servicio para gestión de permisos del sistema
 * 
 * Proporciona métodos para consultar permisos y organizarlos
 * por módulos para su visualización en el frontend
 */
@Injectable()
export class PermisosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los permisos disponibles en el sistema
   * 
   * @returns Lista completa de permisos con toda su información
   */
  async obtenerTodosLosPermisos() {
    return await this.prisma.permiso.findMany({
      orderBy: [
        { modulo: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtiene permisos organizados por módulos
   * 
   * @returns Objeto con permisos agrupados por módulo
   */
  async obtenerPermisosOrganizados() {
    const permisos = await this.obtenerTodosLosPermisos();
    
    // Agrupar permisos por módulo
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

  /**
   * Obtiene la lista de módulos de permisos únicos
   * 
   * @returns Array de nombres de módulos
   */
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

  /**
   * Obtiene permisos de un módulo específico
   * 
   * @param modulo - Nombre del módulo
   * @returns Lista de permisos del módulo especificado
   */
  async obtenerPermisosPorModulo(modulo: string) {
    return await this.prisma.permiso.findMany({
      where: {
        modulo: modulo
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  /**
   * Busca permisos por nombre o descripción
   * 
   * @param termino - Término de búsqueda
   * @returns Lista de permisos que coinciden con el término
   */
  async buscarPermisos(termino: string) {
    return await this.prisma.permiso.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: termino,
              mode: 'insensitive'
            }
          },
          {
            descripcion: {
              contains: termino,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: [
        { modulo: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }
}
