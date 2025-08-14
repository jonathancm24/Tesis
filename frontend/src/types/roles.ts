/**
 * Tipos TypeScript para el módulo de gestión de roles y permisos
 * 
 * Define las interfaces y tipos necesarios para gestionar
 * roles, permisos y sus relaciones en el sistema.
 * 
 * @fileoverview Tipos del módulo de roles y permisos
 * @module rolesTypes
 */

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

/**
 * Estado de formulario para crear/editar rol
 */
export interface FormularioRol {
  nombre: string
  descripcion: string
  permisosSeleccionados: number[]
}

/**
 * Filtros para búsqueda de roles
 */
export interface FiltrosRoles {
  activo?: boolean
  busqueda?: string
  modulo?: string
}

/**
 * Configuración de vista de permisos
 */
export interface ConfiguracionVistaPermisos {
  mostrarDescripciones: boolean
  agruparPorModulo: boolean
  soloPermisosAsignados: boolean
}

/**
 * Enums para estados y tipos
 */
export enum EstadoRol {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

export enum ModuloPermiso {
  USUARIOS = 'USUARIOS',
  ROLES = 'ROLES',
  CITAS = 'CITAS',
  TRATAMIENTOS = 'TRATAMIENTOS',
  PACIENTES = 'PACIENTES',
  SOLICITUDES = 'SOLICITUDES',
  ESPECIALIDADES = 'ESPECIALIDADES',
  ENCUESTAS = 'ENCUESTAS'
}
