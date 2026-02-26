export type EstadoTratamiento =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'CANCELADO'
  | 'EN_PROCESO'
  | 'FINALIZADO'

export type EstadoPrescripcion =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'CANCELADO'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'INCOMPLETO'

export type TipoDiagnostico = 'Presuntivo' | 'Definitivo'

export interface TratamientoItem {
  id: number
  estudianteId: number
  docenteId?: number | null
  descripcion: string
  fechaCreacion: string
  fechaActualizacion: string
  casoClinicoId: number
  estado: EstadoTratamiento
  cie10Codigo?: string | null
  frecuenciaCardiaca: string
  presArterial: string
  procedimientoCodigo?: string | null
  saturacionOxigeno: string
  temperatura: string
  tipoDiagnostico: TipoDiagnostico
  cie10?: {
    codigo: string
    tipo: string
    descripcion: string
  } | null
  procedimiento?: {
    codigo: string
    tipo: string
    descripcion: string
  } | null
}

export interface PrescripcionItem {
  id: number
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  estado: EstadoPrescripcion
  fechaCreacion: string
  fechaActualizacion: string
  casoClinicoId: number
  concentracion: string
  Nrodefarmacos: number
  presentacion: string
  viadeadministracion: string
}

export interface CreatePrescripcionDto {
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  concentracion: string
  Nrodefarmacos: number
  presentacion: string
  viadeadministracion: string
}

export interface CreateTratamientoDto {
  descripcion: string
  frecuenciaCardiaca: string
  presArterial: string
  saturacionOxigeno: string
  temperatura: string
  cie10Codigo?: string
  procedimientoCodigo?: string
  tipoDiagnostico?: TipoDiagnostico
  crearPrescripcion?: boolean
  prescripcion?: CreatePrescripcionDto
}
