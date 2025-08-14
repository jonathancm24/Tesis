/**
 * Servicio para gestión de roles y permisos del sistema
 * 
 * Integra con el backend para gestionar:
 * - Roles del sistema (crear, editar, eliminar)
 * - Permisos por rol
 * - Asignación de permisos a roles
 * - Consulta de permisos disponibles organizados por módulos
 * 
 * @fileoverview Servicio de roles y permisos para AdminRoles
 * @module rolesService
 */

import api from '@/config/api'

/**
 * Representa un permiso individual del sistema
 */
export interface Permiso {
  id: number
  nombre: string
  descripcion: string
  modulo: string
  fechaCreacion: Date
  fechaActualizacion: Date
}

/**
 * Representa un rol del sistema con sus permisos
 */
export interface Rol {
  id: number
  nombre: string
  descripcion?: string
  fechaCreacion: Date
  fechaActualizacion: Date
  activo: boolean
  // Relaciones opcionales
  permisos?: Permiso[]
  _count?: {
    usuarios: number
    permisos: number
  }
}

/**
 * DTO para crear un nuevo rol
 */
export interface CrearRolDto {
  nombre: string
  descripcion?: string
  permisos?: number[] // IDs de permisos a asignar al crear el rol
}

/**
 * DTO para asignar permisos a un rol
 */
export interface AsignarPermisosDto {
  permisos: number[] // IDs de permisos que tendrá el rol
}

/**
 * Permisos organizados por módulos para el frontend
 */
export interface PermisosOrganizados {
  [modulo: string]: Permiso[]
}

/**
 * Resumen de roles con estadísticas
 */
export interface ResumenRoles {
  totalRoles: number
  rolesActivos: number
  rolesInactivos: number
  totalPermisos: number
  rolesRecientes: Rol[]
  distribucionPermisos: Array<{
    rolNombre: string
    totalPermisos: number
    totalUsuarios: number
  }>
}

class RolesService {
  private readonly baseUrl = '/roles'

  /**
   * Obtiene todos los roles sin incluir permisos (para listas simples)
   */
  async obtenerRolesSimples(): Promise<Rol[]> {
    try {
      const response = await api.get<Rol[]>(`${this.baseUrl}/todos`)
      return response.data
    } catch (error) {
      console.error('Error al obtener roles simples:', error)
      throw error
    }
  }

  /**
   * Obtiene todos los roles con sus permisos y estadísticas
   */
  async obtenerRolesCompletos(): Promise<Rol[]> {
    try {
      const response = await api.get<Rol[]>(`${this.baseUrl}/todos/con-permisos`)
      return response.data
    } catch (error) {
      console.error('Error al obtener roles completos:', error)
      // Fallback: obtener roles simples al menos
      try {
        return await this.obtenerRolesSimples()
      } catch (fallbackError) {
        console.error('Error en fallback de roles:', fallbackError)
        return this.obtenerRolesPorDefecto()
      }
    }
  }

  /**
   * Obtiene un rol específico por ID con todos sus detalles
   */
  async obtenerRolPorId(id: number): Promise<Rol> {
    try {
      const response = await api.get<Rol>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error)
      throw error
    }
  }

  /**
   * Crea un nuevo rol en el sistema
   */
  async crearRol(datos: CrearRolDto): Promise<Rol> {
    try {
      const response = await api.post<Rol>(this.baseUrl, datos)
      return response.data
    } catch (error) {
      console.error('Error al crear rol:', error)
      throw error
    }
  }

  /**
   * Asigna permisos a un rol existente
   * Reemplaza todos los permisos actuales con los nuevos
   */
  async asignarPermisos(rolId: number, datos: AsignarPermisosDto): Promise<Rol> {
    try {
      const response = await api.put<Rol>(`${this.baseUrl}/${rolId}/permisos`, datos)
      return response.data
    } catch (error) {
      console.error(`Error al asignar permisos al rol ${rolId}:`, error)
      throw error
    }
  }

  /**
   * Obtiene todos los permisos disponibles en el sistema
   */
  async obtenerTodosLosPermisos(): Promise<Permiso[]> {
    try {
      // Como no hay endpoint específico de permisos, los obtenemos de un rol completo
      // o implementamos un endpoint /permisos en el backend
      const response = await api.get<Permiso[]>('/permisos')
      return response.data
    } catch (error) {
      console.warn('Error al obtener permisos del backend, usando permisos por defecto:', error)
      return this.obtenerPermisosPorDefecto()
    }
  }

  /**
   * Obtiene permisos organizados por módulos para mejor visualización
   */
  async obtenerPermisosOrganizados(): Promise<PermisosOrganizados> {
    try {
      const permisos = await this.obtenerTodosLosPermisos()
      
      // Organizar permisos por módulo
      const organizados: PermisosOrganizados = {}
      
      permisos.forEach(permiso => {
        if (!organizados[permiso.modulo]) {
          organizados[permiso.modulo] = []
        }
        organizados[permiso.modulo].push(permiso)
      })

      return organizados
    } catch (error) {
      console.error('Error al organizar permisos:', error)
      return this.obtenerPermisosOrganizadosPorDefecto()
    }
  }

  /**
   * Obtiene estadísticas resumidas de roles
   */
  async obtenerResumenRoles(): Promise<ResumenRoles> {
    try {
      const roles = await this.obtenerRolesCompletos()
      
      return {
        totalRoles: roles.length,
        rolesActivos: roles.filter(r => r.activo).length,
        rolesInactivos: roles.filter(r => !r.activo).length,
        totalPermisos: roles.reduce((sum, r) => sum + (r._count?.permisos || 0), 0),
        rolesRecientes: roles
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 5),
        distribucionPermisos: roles.map(rol => ({
          rolNombre: rol.nombre,
          totalPermisos: rol._count?.permisos || 0,
          totalUsuarios: rol._count?.usuarios || 0
        }))
      }
    } catch (error) {
      console.error('Error al obtener resumen de roles:', error)
      return this.obtenerResumenVacio()
    }
  }

  // Métodos privados de fallback

  private obtenerRolesPorDefecto(): Rol[] {
    return [
      {
        id: 1,
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema con acceso completo',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        _count: { usuarios: 1, permisos: 25 }
      },
      {
        id: 2,
        nombre: 'PROFESOR',
        descripcion: 'Profesor universitario con permisos de supervisión',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        _count: { usuarios: 5, permisos: 15 }
      },
      {
        id: 3,
        nombre: 'ESTUDIANTE',
        descripcion: 'Estudiante de odontología con permisos básicos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        _count: { usuarios: 50, permisos: 8 }
      },
      {
        id: 4,
        nombre: 'SECRETARIO',
        descripcion: 'Personal administrativo',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        _count: { usuarios: 3, permisos: 12 }
      }
    ]
  }

  private obtenerPermisosPorDefecto(): Permiso[] {
    return [
      // Usuarios
      { id: 1, nombre: 'VER_USUARIOS', descripcion: 'Permite ver la lista de usuarios del sistema', modulo: 'USUARIOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 2, nombre: 'CREAR_USUARIOS', descripcion: 'Permite registrar nuevos usuarios en el sistema', modulo: 'USUARIOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 3, nombre: 'EDITAR_USUARIOS', descripcion: 'Permite modificar información de usuarios existentes', modulo: 'USUARIOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 4, nombre: 'ELIMINAR_USUARIOS', descripcion: 'Permite eliminar usuarios del sistema', modulo: 'USUARIOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 5, nombre: 'ASIGNAR_ROLES', descripcion: 'Permite cambiar el rol asignado a los usuarios', modulo: 'USUARIOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      
      // Roles
      { id: 6, nombre: 'GESTIONAR_ROLES', descripcion: 'Permite crear, editar y eliminar roles del sistema', modulo: 'ROLES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 7, nombre: 'VER_ROLES', descripcion: 'Permite consultar los roles existentes y sus permisos', modulo: 'ROLES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 8, nombre: 'ASIGNAR_PERMISOS_INDIVIDUALES', descripcion: 'Permite otorgar permisos especiales a usuarios específicos', modulo: 'ROLES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 9, nombre: 'REVOCAR_PERMISOS_INDIVIDUALES', descripcion: 'Permite quitar permisos especiales de usuarios específicos', modulo: 'ROLES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      
      // Citas
      { id: 10, nombre: 'VER_CITAS', descripcion: 'Permite ver las citas propias o asignadas', modulo: 'CITAS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 11, nombre: 'CREAR_CITAS', descripcion: 'Permite agendar nuevas citas médicas', modulo: 'CITAS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 12, nombre: 'EDITAR_CITAS', descripcion: 'Permite modificar citas existentes', modulo: 'CITAS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 13, nombre: 'CANCELAR_CITAS', descripcion: 'Permite cancelar citas programadas', modulo: 'CITAS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 14, nombre: 'VER_TODAS_LAS_CITAS', descripcion: 'Permite ver todas las citas del sistema', modulo: 'CITAS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      
      // Tratamientos
      { id: 15, nombre: 'VER_TRATAMIENTOS', descripcion: 'Permite ver tratamientos propios o asignados', modulo: 'TRATAMIENTOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 16, nombre: 'CREAR_TRATAMIENTOS', descripcion: 'Permite crear nuevos planes de tratamiento', modulo: 'TRATAMIENTOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 17, nombre: 'EDITAR_TRATAMIENTOS', descripcion: 'Permite modificar tratamientos existentes', modulo: 'TRATAMIENTOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 18, nombre: 'APROBAR_TRATAMIENTOS', descripcion: 'Permite aprobar tratamientos realizados por estudiantes', modulo: 'TRATAMIENTOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 19, nombre: 'VER_TODOS_TRATAMIENTOS', descripcion: 'Permite ver todos los tratamientos del sistema', modulo: 'TRATAMIENTOS', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      
      // Pacientes
      { id: 20, nombre: 'VER_PACIENTES', descripcion: 'Permite acceder a información básica de pacientes', modulo: 'PACIENTES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 21, nombre: 'CREAR_PACIENTES', descripcion: 'Permite registrar nuevos pacientes en el sistema', modulo: 'PACIENTES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 22, nombre: 'EDITAR_PACIENTES', descripcion: 'Permite modificar información de pacientes existentes', modulo: 'PACIENTES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      
      // Solicitudes
      { id: 23, nombre: 'CREAR_SOLICITUDES', descripcion: 'Permite crear solicitudes de permisos especiales', modulo: 'SOLICITUDES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 24, nombre: 'VER_SOLICITUDES', descripcion: 'Permite ver solicitudes de permisos pendientes', modulo: 'SOLICITUDES', fechaCreacion: new Date(), fechaActualizacion: new Date() },
      { id: 25, nombre: 'APROBAR_SOLICITUDES', descripcion: 'Permite aprobar o rechazar solicitudes de permisos', modulo: 'SOLICITUDES', fechaCreacion: new Date(), fechaActualizacion: new Date() }
    ]
  }

  private obtenerPermisosOrganizadosPorDefecto(): PermisosOrganizados {
    const permisos = this.obtenerPermisosPorDefecto()
    const organizados: PermisosOrganizados = {}
    
    permisos.forEach(permiso => {
      if (!organizados[permiso.modulo]) {
        organizados[permiso.modulo] = []
      }
      organizados[permiso.modulo].push(permiso)
    })

    return organizados
  }

  private obtenerResumenVacio(): ResumenRoles {
    return {
      totalRoles: 0,
      rolesActivos: 0,
      rolesInactivos: 0,
      totalPermisos: 0,
      rolesRecientes: [],
      distribucionPermisos: []
    }
  }
}

// Instancia única del servicio
export const rolesService = new RolesService()
export default rolesService
