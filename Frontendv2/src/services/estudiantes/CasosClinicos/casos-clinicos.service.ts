/**
 * Servicio para gestion de casos clinicos
 */

import { apiClient } from '@/Config/api'
import type {
  CasoClinico,
  CrearCasoClinicoDto,
  UpdateEstadoCasoDto,
  CrearObservacionDto,
  Observacion,
  CasoClinicoListItem
} from '@/types/casosClinicos.types'

const BASE_URL = '/casos-clinicos'

export const casosClinicosService = {
  async create(data: CrearCasoClinicoDto): Promise<CasoClinico> {
    const response = await apiClient.post<CasoClinico>(BASE_URL, data)
    return response.data
  },

  async getById(id: number): Promise<CasoClinico> {
    const response = await apiClient.get<CasoClinico>(`${BASE_URL}/${id}`)
    return response.data
  },

  async getByPaciente(pacienteId: number): Promise<CasoClinico[]> {
    const response = await apiClient.get<CasoClinico[]>(`${BASE_URL}?pacienteId=${pacienteId}`)
    return response.data
  },

  async getByProfesor(profesorId: number, estado?: string): Promise<CasoClinicoListItem[]> {
    const params = new URLSearchParams()
    if (estado) {
      params.append('estado', estado)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await apiClient.get<CasoClinicoListItem[]>(`${BASE_URL}/profesor/${profesorId}${query}`)
    return response.data
  },

  async updateEstado(id: number, data: UpdateEstadoCasoDto): Promise<CasoClinico> {
    const response = await apiClient.patch<CasoClinico>(`${BASE_URL}/${id}/estado`, data)
    return response.data
  },

  async createObservacion(data: CrearObservacionDto): Promise<Observacion> {
    const response = await apiClient.post<Observacion>(`${BASE_URL}/observaciones`, data)
    return response.data
  }
}
