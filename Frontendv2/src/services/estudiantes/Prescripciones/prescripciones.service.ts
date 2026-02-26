import { apiClient } from '@/Config/api'
import type { CreatePrescripcionDto, PrescripcionItem } from '@/types/tratamientosPrescripciones.types'

const BASE_URL = '/prescripciones'

export const prescripcionesService = {
  async getByCaso(casoId: number): Promise<PrescripcionItem[]> {
    const response = await apiClient.get<PrescripcionItem[]>(`${BASE_URL}/caso/${casoId}`)
    return response.data
  },

  async createByCaso(casoId: number, data: CreatePrescripcionDto): Promise<PrescripcionItem> {
    const response = await apiClient.post<PrescripcionItem>(`${BASE_URL}/caso/${casoId}`, data)
    return response.data
  }
}
