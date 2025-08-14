/**
 * Tipos TypeScript para el módulo de clínicas
 * 
 * Define las interfaces y tipos necesarios para gestionar
 * las clínicas y su configuración en el sistema.
 * 
 * @fileoverview Tipos del módulo de clínicas
 * @module clinicaTypes
 */

export enum TipoClinica {
  FIJA = 'FIJA',
  MOVIL = 'MOVIL',
  TEMPORAL = 'TEMPORAL'
}

export enum EstadoClinica {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  MANTENIMIENTO = 'MANTENIMIENTO',
  EN_RUTA = 'EN_RUTA',
  FUERA_SERVICIO = 'FUERA_SERVICIO'
}

export interface CrearClinicaDto {
  nombre: string
  codigo: string
  tipo: TipoClinica
  descripcion?: string
  telefono?: string
  email?: string
  capacidadPacientes?: number
  direccionBase?: string
  parroquiaBaseId?: number
  // Campos específicos para clínicas móviles
  placaVehiculo?: string
  modeloVehiculo?: string
  anoVehiculo?: number
}

export interface ActualizarClinicaDto extends Partial<CrearClinicaDto> {
  estado?: EstadoClinica
}

export interface FiltrosClinicaDto {
  tipo?: TipoClinica
  estado?: EstadoClinica
  parroquiaBaseId?: number
  busqueda?: string
  incluirHorarios?: boolean
  incluirPersonal?: boolean
}

export interface ClinicaRespuestaDto {
  id: number
  nombre: string
  codigo: string
  tipo: TipoClinica
  estado: EstadoClinica
  descripcion?: string
  telefono?: string
  email?: string
  capacidadPacientes?: number
  fechaCreacion: Date
  fechaActualizacion: Date
  direccionBase?: string
  parroquiaBase?: {
    id: number
    nombre: string
    canton: {
      id: number
      nombre: string
      provincia: {
        id: number
        nombre: string
      }
    }
  }
  // Información del vehículo (solo para clínicas móviles)
  placaVehiculo?: string
  modeloVehiculo?: string
  anoVehiculo?: number
  // Relaciones opcionales
  horarios?: any[]
  personalAsignado?: any[]
  estadisticas?: {
    totalPersonal: number
    personalActivo: number
    totalHorarios: number
    horariosActivos: number
  }
}
