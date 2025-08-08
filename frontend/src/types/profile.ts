// Tipos para el perfil del usuario
export interface PerfilResponse {
  id: number
  nombre: string
  apellido: string
  email: string
  cedula: string
  fechaNacimiento: Date | string
  telefono?: string
  direccion?: string
  NotasAdicionales?: string
  fechaRegistro: Date | string
  parroquiaId?: number
  roleId: number
  activo: boolean
  
  // Información relacionada
  parroquia?: {
    id: number
    nombre: string
    canton: {
      id: number
      nombre: string
      provincia: {
        id: number
        nombre: string
        pais: {
          id: number
          nombre: string
        }
      }
    }
  }
  
  role?: {
    id: number
    nombre: string
    description?: string
  }
  
  especialidades?: {
    id: number
    especialidad: {
      id: number
      nombre: string
      descripcion?: string
    }
  }[]
}

export interface PerfilUpdateData {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  cedula?: string
  fechaNacimiento?: string
  direccion?: string
  NotasAdicionales?: string
  parroquiaId?: number
}
