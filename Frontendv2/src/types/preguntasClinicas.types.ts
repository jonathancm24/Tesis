export type TipoPregunta = 'TEXTO' | 'TEXTAREA' | 'NUMERO' | 'FECHA' | 'SI_NO' | 'MULTIPLE_SELECCION'

export interface PreguntaClinica {
  id: number
  texto: string
  tipo: TipoPregunta
  obligatoria: boolean
  especialidadId?: number | null
  especialidad?: {
    id: number
    nombre: string
  } | null
}

export interface CreatePreguntaDto {
  texto: string
  tipo: TipoPregunta
  obligatoria: boolean
  especialidadId?: number | null
}

export interface UpdatePreguntaDto {
  texto?: string
  tipo?: TipoPregunta
  obligatoria?: boolean
  especialidadId?: number | null
}

export interface RespuestaClinicaInput {
  preguntaId: number
  respuesta: string
}

export interface RespuestaClinica {
  id: number
  casoClinicoId: number
  preguntaId: number
  respuesta: string
  pregunta: PreguntaClinica
}
