export type CaraDentalCodigo = 'V' | 'L' | 'M' | 'D' | 'O' | 'I'

export interface CaraOdontogramaInput {
  cara: CaraDentalCodigo | string
  observacion?: string
  condicion?: string
}

export interface DienteOdontogramaInput {
  diente: string
  caras: CaraOdontogramaInput[]
}

export interface SaveOdontogramaDto {
  casoClinicoId: number
  estudianteId: number
  docenteId?: number
  conclusion?: string
  observacionGeneral?: string
  dientes: DienteOdontogramaInput[]
}

export interface OdontogramaRegistro {
  id: number
  diente: string
  conclusion?: string | null
  condicion: {
    caras: Array<{
      cara: string
      observacion?: string | null
      condicion?: string | null
    }>
  }
  casoClinicoId?: number | null
  estudianteId: number
  docenteId?: number | null
  fechaCreacion: Date | string
}

export interface OdontogramaCasoResponse {
  casoClinicoId: number
  registros: OdontogramaRegistro[]
  observacionGeneral:
    | {
        id: number
        descripcion: string
        contenidoEstudiante?: string | null
        contenidoDocente?: string | null
        fecha: Date | string
        docente?: {
          id: number
          nombre: string
          apellido: string
        } | null
      }
    | null
}
