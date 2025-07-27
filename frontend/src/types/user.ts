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
}

// ✅ AGREGAR INTERFAZ PARA ROLES DE LA BD
export interface Role {
  id: number
  nombre: string
  description?: string
}

// Datos para crear usuario (lo que envía el frontend al backend)
export interface CreateUserRequest {
  nombre: string
  apellido: string
  email: string
  cedula: string
  fechaNacimiento: string
  password: string
  roleId: number
  parroquiaId?: number
  especialidadIds: number[]
}

// Datos para actualizar usuario
export interface UpdateUserRequest {
  nombre?: string
  apellido?: string
  email?: string
  roleId?: number
  activo?: boolean
}

// Formulario (lo que maneja UserForm)
export interface FormUser {
  id?: number
  nombre: string
  apellido: string
  email: string
  role: UserRole
  activo: boolean
  // Campos adicionales solo para creación
  cedula?: string
  password?: string
  fechaNacimiento?: string
  roleId?: number
}