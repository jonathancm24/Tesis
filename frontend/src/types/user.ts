// frontend/src/types/user.ts
export type UserRole = 'admin' | 'profesor' | 'estudiante' | 'secretario' | 'paciente'

// Usuario para mostrar en la tabla
export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  role: UserRole
  activo: boolean
  especialidades?: Especialidad[]
}

// ✅ AGREGAR INTERFAZ PARA ESPECIALIDADES DE LA BD
export interface Especialidad {
  id: number
  nombre: string
  descripcion?: string
}

// ✅ AGREGAR INTERFAZ PARA ROLES DE LA BD
export interface Role {
  id: number
  nombre: string
  description?: string
}

// ✅ AGREGAR INTERFAZ PARA PARROQUIAS
export interface Parroquia {
  id: number
  nombre: string
  canton?: {
    id: number
    nombre: string
    provincia?: {
      id: number
      nombre: string
      pais?: {
        id: number
        nombre: string
      }
    }
  }
}

// Datos para crear usuario (coincide exactamente con RegisterDto)
export interface CreateUserRequest {
  nombre: string
  apellido: string
  email: string
  cedula: string
  fechaNacimiento: string // Se convertirá a Date en el backend
  password: string
  NotasAdicionales?: string
  roleId: number
  especialidadIds?: number[]
  parroquiaId: number
}

// Datos para actualizar usuario
export interface UpdateUserRequest {
  nombre?: string
  apellido?: string
  email?: string
  NotasAdicionales?: string
  roleId?: number
  activo?: boolean
  especialidadIds?: number[]
  parroquiaId?: number
}

// Formulario (lo que maneja UserForm) - coincide con RegisterDto
export interface FormUser {
  id?: number
  nombre: string
  apellido: string
  email: string
  cedula: string
  fechaNacimiento: string
  password: string
  NotasAdicionales?: string
  role: UserRole // Para el frontend
  roleId?: number // Para el backend
  especialidades?: Especialidad[] // Para mostrar
  especialidadIds: number[] // Para enviar al backend
  parroquiaId: number
  activo: boolean
}