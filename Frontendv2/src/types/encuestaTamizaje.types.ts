/**
 * Types for Encuesta de Tamizaje (Medical History Survey)
 */

export type EstadoEncuesta = 'PENDIENTE' | 'BORRADOR' | 'COMPLETADA'
export type TipoPregunta =
  | 'SI_NO'
  | 'TEXTO'
  | 'NUMERO'
  | 'MULTIPLE_SELECCION'
  | 'FECHA'
  | 'TEXTAREA'

export interface PreguntaTamizaje {
  id: number
  texto: string
  tipo: TipoPregunta
  obligatoria?: boolean
  categoria?: string
  orden?: number
  soloMujer?: boolean
  requiereDetalle?: boolean
}

export interface CategoriaTamizaje {
  id: number
  nombre: string
  icono?: string
  descripcion?: string
  orden: number
}

export interface RespuestaTamizaje {
  id?: number
  preguntaId: number
  pacienteId?: number
  respuesta: string | boolean | null
  detalle?: string | null
  pregunta?: PreguntaTamizaje
}

export interface EncuestaTamizaje {
  id: number
  pacienteId: number
  estado: EstadoEncuesta
  fechaCreacion: Date | string
  fechaActualizacion?: Date | string
  fechaCompletada?: Date | string | null

  respuestas?: RespuestaTamizaje[]

  // Calculados
  totalPreguntas?: number
  respuestasCompletadas?: number
  porcentajeCompletitud?: number
}

export interface EncuestaProgreso {
  totalPreguntas: number
  respuestasCompletadas: number
  porcentaje: number
  estado: EstadoEncuesta
  respuestas?: RespuestaTamizaje[]
  id?: number
  pacienteId?: number
  fechaCreacion?: Date | string
  encuestaId?: number // ID de la EncuestaTamizaje
  esUltimaVersion?: boolean
}

export interface GuardarRespuestaDto {
  preguntaId: number
  respuesta: string | boolean | null
  detalle?: string | null
}

export interface GuardarRespuestasDto {
  pacienteId: number
  respuestas: GuardarRespuestaDto[]
  observaciones?: string
  encuestaId?: number // Si se proporciona, actualiza; si no, crea nueva
}
