/**
 * Types for Casos Clínicos (Clinical Cases)
 */

import type { RespuestaClinicaInput } from './preguntasClinicas.types'

export type EstadoCasoClinico = 'EN_REVISION' | 'EN_TRATAMIENTO' | 'FINALIZADO' | 'APROBADO' | 'RECHAZADO'

export interface CasoClinico {
  id: number
  fechaCreacion: Date | string
  fechaActualizacion: Date | string
  pacienteId: number
  profesorId: number
  estudianteId: number
  especialidadId: number
  calificacion?: number | null
  estado: EstadoCasoClinico
  
  // Hallazgos clínicos generales
  ATM: string
  CarayCuello: string
  PielyMucosa: string
  craneo: string
  enfermedadActual: string
  facies: string
  marcha: string
  motivoConsulta: string
  peso: number
  talla: number
  
  // Relaciones
  especialidad?: {
    id: number
    nombre: string
  }
  estudiante?: {
    id: number
    nombre: string
    apellido: string
    email?: string
    telefono?: string
  }
  profesor?: {
    id: number
    nombre: string
    apellido: string
    email?: string
  }
  paciente?: {
    id: number
    nombre: string
    apellido: string
    email?: string
    telefono?: string
    fechaNacimiento?: Date | string
    genero?: string
    numeroDocumento?: string
    tipoDocumento?: string
  }
  observaciones?: Observacion[]
}

export interface CasoClinicoListItem {
  id: number
  fechaCreacion: Date | string
  estado: EstadoCasoClinico
  especialidad: {
    nombre: string
  }
  profesor?: {
    nombre: string
    apellido: string
  }
  estudiante?: {
    id: number
    nombre: string
    apellido: string
    email?: string
  }
  paciente?: {
    id: number
    nombre: string
    apellido: string
    numeroDocumento?: string
    tipoDocumento?: string
  }
  observaciones?: { id: number }[]
  tratamientos?: { id: number }[]
  prescripciones?: { id: number }[]
}

export interface CrearCasoClinicoDto {
  pacienteId: number
  profesorId: number
  estudianteId: number
  especialidadId: number
  
  // Hallazgos clínicos
  ATM: string
  CarayCuello: string
  PielyMucosa: string
  craneo: string
  enfermedadActual: string
  facies: string
  marcha: string
  motivoConsulta: string
  peso: number
  talla: number

  // Respuestas a preguntas clínicas dinámicas
  respuestas?: RespuestaClinicaInput[]
}

export interface UpdateEstadoCasoDto {
  estado: EstadoCasoClinico
  calificacion?: number
}

export interface Observacion {
  id: number
  titulo: string
  descripcion: string
  contenidoDocente?: string
  contenidoEstudiante?: string
  fecha: Date | string
  estado: string
  docente?: {
    id: number
    nombre: string
    apellido: string
  }
  estudiante?: {
    id: number
    nombre: string
    apellido: string
  }
}

export interface CrearObservacionDto {
  casoClinicoId: number
  docenteId: number
  contenido: string
}
