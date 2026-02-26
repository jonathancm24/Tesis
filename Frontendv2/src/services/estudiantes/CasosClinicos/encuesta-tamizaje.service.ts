/**
 * Servicio para gestionar la Encuesta de Tamizaje
 * Realiza llamadas a la API backend para obtener/guardar encuestas
 */

import { apiClient } from '@/Config/api'
import type {
  EncuestaProgreso,
  PreguntaTamizaje,
  GuardarRespuestasDto
} from '@/types/encuestaTamizaje.types'

export const encuestaTamizajeService = {
  /**
   * Obtener todas las preguntas agrupadas por categoría
   */
  async obtenerTodasLasPreguntas(): Promise<Record<string, PreguntaTamizaje[]>> {
    try {
      const response = await apiClient.get('/encuesta-tamizaje/preguntas')
      return response.data.data
    } catch (error) {
      console.error('Error al obtener preguntas:', error)
      throw error
    }
  },

  /**
   * Obtener preguntas por categoría específica
   */
  async obtenerPreguntasPorCategoria(categoria: string): Promise<PreguntaTamizaje[]> {
    try {
      const response = await apiClient.get(`/encuesta-tamizaje/preguntas/${encodeURIComponent(categoria)}`)
      return response.data.data
    } catch (error) {
      console.error(`Error al obtener preguntas de ${categoria}:`, error)
      throw error
    }
  },

  /**
   * Obtener la encuesta de un paciente con su progreso
   */
  async obtenerEncuestaPaciente(pacienteId: number): Promise<EncuestaProgreso | null> {
    try {
      const response = await apiClient.get(`/encuesta-tamizaje/pacientes/${pacienteId}`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener encuesta del paciente:', error)
      return null
    }
  },

  /**
   * Obtener solo el progreso de la encuesta (endpoint ligero para widgets)
   */
  async obtenerProgresoEncuesta(pacienteId: number): Promise<Omit<EncuestaProgreso, 'respuestas'> | null> {
    try {
      const response = await apiClient.get(`/encuesta-tamizaje/pacientes/${pacienteId}/progreso`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener progreso del paciente:', error)
      return null
    }
  },

  /**
   * Obtener historial de encuestas de un paciente
   */
  async obtenerHistorialEncuestas(pacienteId: number): Promise<EncuestaProgreso[]> {
    try {
      const response = await apiClient.get(`/encuesta-tamizaje/pacientes/${pacienteId}/historial`)
      return response.data.data || []
    } catch (error) {
      console.error('Error al obtener historial de encuestas:', error)
      return []
    }
  },

  /**
   * Guardar respuestas de la encuesta
   */
  async guardarRespuestas(dto: GuardarRespuestasDto): Promise<EncuestaProgreso> {
    try {
      const response = await apiClient.post('/encuesta-tamizaje/respuestas', dto)
      return response.data.data
    } catch (error) {
      console.error('Error al guardar respuestas:', error)
      throw error
    }
  },

  /**
   * Crear una nueva versión de la encuesta
   */
  async crearNuevaVersion(pacienteId: number): Promise<EncuestaProgreso> {
    try {
      const response = await apiClient.post(`/encuesta-tamizaje/pacientes/${pacienteId}/nueva-version`)
      return response.data.data
    } catch (error) {
      console.error('Error al crear nueva versión:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas generales (Admin)
   */
  async obtenerEstadisticas() {
    try {
      const response = await apiClient.get('/encuesta-tamizaje/admin/estadisticas')
      return response.data.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  }
}
