/**
 * Tipos TypeScript para el módulo de Usuarios
 * Coherentes con los DTOs del backend
 */

export enum TipoDocumento {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC',
  OTRO = 'OTRO'
}

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  fechaNacimiento: string
  telefono?: string
  direccion?: string
  NotasAdicionales?: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  activo: boolean
  fechaRegistro: string
  ultimaActualizacion: string
  parroquiaId?: number
  roleId: number
  role?: {
    id: number
    nombre: string
  }
  parroquia?: {
    id: number
    nombre: string
    municipio?: {
      id: number
      nombre: string
      estado?: {
        id: number
        nombre: string
      }
    }
  }
  especialidades?: Array<{
    id: number
    nombre: string
  }>
}

export interface CreateUsuarioDto {
  nombre: string
  apellido: string
  email: string
  fechaNacimiento: string
  password: string
  telefono?: string
  direccion?: string
  NotasAdicionales?: string
  parroquiaId?: number
  roleId: number
  activo?: boolean
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  especialidadIds?: number[]
}

export interface UpdateUsuarioDto {
  nombre?: string
  apellido?: string
  email?: string
  fechaNacimiento?: string
  telefono?: string
  direccion?: string
  NotasAdicionales?: string
  parroquiaId?: number
  roleId?: number
  activo?: boolean
  tipoDocumento?: TipoDocumento
  numeroDocumento?: string
  especialidadIds?: number[]
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UsuarioFilters {
  nombre?: string
  apellido?: string
  email?: string
  activo?: boolean
  roleId?: number
  parroquiaId?: number
  tipoDocumento?: TipoDocumento
  fechaNacimientoDesde?: string
  fechaNacimientoHasta?: string
  fechaCreacionDesde?: string
  fechaCreacionHasta?: string
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedUsuarios {
  data: Usuario[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface UsuarioStats {
  totalUsuarios: number
  usuariosActivos: number
  usuariosInactivos: number
  usuariosPorRol: Array<{
    roleName: string
    count: number
  }>
}
