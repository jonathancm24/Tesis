import { apiClient } from '@/Config/api'
import type { OdontogramaCasoResponse, SaveOdontogramaDto } from '@/types/odontograma.types'

const BASE_URL = '/odontograma'

export const odontogramaService = {
  async save(data: SaveOdontogramaDto): Promise<OdontogramaCasoResponse> {
    const response = await apiClient.post<OdontogramaCasoResponse>(BASE_URL, data)
    return response.data
  },

  async getByCaso(casoClinicoId: number): Promise<OdontogramaCasoResponse> {
    const response = await apiClient.get<OdontogramaCasoResponse>(`${BASE_URL}/caso/${casoClinicoId}`)
    return response.data
  }
}
