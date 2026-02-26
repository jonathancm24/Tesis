import { apiClient } from '@/Config/api'
import type { CreateTratamientoDto, TratamientoItem } from '@/types/tratamientosPrescripciones.types'
import type { PrescripcionItem } from '@/types/tratamientosPrescripciones.types'

const BASE_URL = '/tratamientos'

export const tratamientosService = {
  async getByCaso(casoId: number): Promise<TratamientoItem[]> {
    const response = await apiClient.get<TratamientoItem[]>(`${BASE_URL}/caso/${casoId}`)
    return response.data
  },

  async createByCaso(casoId: number, data: CreateTratamientoDto): Promise<{ tratamiento: TratamientoItem; prescripcion: PrescripcionItem | null }> {
    const response = await apiClient.post<{ tratamiento: TratamientoItem; prescripcion: PrescripcionItem | null }>(
      `${BASE_URL}/caso/${casoId}`,
      data
    )
    return response.data
  }
}
