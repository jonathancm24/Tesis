import { apiClient } from '@/Config/api'
import type {
  Cie10Filters,
  Cie10ImportResult,
  Cie10Item,
  Cie10ListResponse,
  CreateCie10Dto,
  UpdateCie10Dto
} from '@/types/cie10.types'

const CIE10_BASE_URL = '/cie10'

export const cie10Service = {
  async getAll(filters?: Cie10Filters): Promise<Cie10ListResponse> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const query = params.toString()
    const response = await apiClient.get<Cie10ListResponse>(
      query ? `${CIE10_BASE_URL}?${query}` : CIE10_BASE_URL
    )

    return response.data
  },

  async getByCodigo(codigo: string): Promise<Cie10Item> {
    const response = await apiClient.get<Cie10Item>(`${CIE10_BASE_URL}/${encodeURIComponent(codigo)}`)
    return response.data
  },

  async create(data: CreateCie10Dto): Promise<Cie10Item> {
    const response = await apiClient.post<Cie10Item>(CIE10_BASE_URL, data)
    return response.data
  },

  async update(codigo: string, data: UpdateCie10Dto): Promise<Cie10Item> {
    const response = await apiClient.patch<Cie10Item>(
      `${CIE10_BASE_URL}/${encodeURIComponent(codigo)}`,
      data
    )
    return response.data
  },

  async delete(codigo: string): Promise<void> {
    await apiClient.delete(`${CIE10_BASE_URL}/${encodeURIComponent(codigo)}`)
  },

  async importExcel(file: File): Promise<Cie10ImportResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<Cie10ImportResult>(
      `${CIE10_BASE_URL}/import/excel`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return response.data
  },

  async downloadTemplate(): Promise<Blob> {
    try {
      const response = await apiClient.get(`${CIE10_BASE_URL}/template/excel`, {
        responseType: 'blob'
      })

      return response.data
    } catch {
      const fallback = await apiClient.get(`${CIE10_BASE_URL}/template`, {
        responseType: 'blob'
      })

      return fallback.data
    }
  }
}
