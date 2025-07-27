// src/types/auth.ts

// Tipos que coinciden con tu backend
export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  cedula: string
  role: {
    id: number
    nombre: string // 'ADMIN', 'PROFESOR', 'ESTUDIANTE', 'SECRETARIO'
  }
  // Otros campos opcionales del backend
  telefono?: string
  direccion?: string
}

// Para compatibilidad con frontend existente
export interface FrontendUser {
  id: number
  nombre: string
  apellido: string
  email: string
  role: FrontendRole // Mapeo para el frontend
}

export type FrontendRole = 'admin' | 'profesor' | 'estudiante' | 'secretario'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface AuthState {
  user: FrontendUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}