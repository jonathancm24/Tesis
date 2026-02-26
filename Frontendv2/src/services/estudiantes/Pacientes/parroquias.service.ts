/**
 * Servicio HTTP para gestión de parroquias
 */

import { apiClient } from '@/Config/api'
import type { ParroquiaSimple, ParroquiaSearch } from '@/types/parroquias.types'

export const parroquiasService = {
  /**
   * Obtener todas las parroquias
   */
  async getAll(): Promise<ParroquiaSimple[]> {
    const response = await apiClient.get<{ data: ParroquiaSimple[] }>('/parroquia')
    return response.data.data || []
  },

  /**
   * Buscar parroquias por nombre
   */
  async search(query: string): Promise<ParroquiaSearch[]> {
    if (!query || query.length < 2) {
      return []
    }

    try {
      const response = await apiClient.get<{ data: ParroquiaSearch[] }>('/parroquia/buscar', {
        params: { q: query }
      })
      return response.data.data || []
    } catch (error) {
      console.error('Error en búsqueda de parroquias:', error)
      return []
    }
  }
}
