/**
 * Types para el módulo de especialidades
 */

export interface Especialidad {
  id: number
  nombre: string
  descripcion: string | null
}

export interface CreateEspecialidadDto {
  nombre: string
  descripcion?: string
}

export interface UpdateEspecialidadDto {
  nombre?: string
  descripcion?: string
}
