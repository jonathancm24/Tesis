// src/types/User.ts

export type Role = 'admin' | 'estudiante' | 'secretario' | 'paciente' | 'profesor'

export interface User {
  id: number
  nombre: string
  email: string
  password: string
  role: Role
  especialidad?: string    // Solo para 'estudiante' o 'profesor'
  historial?: string       // Solo para 'paciente'
}
