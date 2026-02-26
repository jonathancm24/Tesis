import { apiClient } from '@/Config/api'
import type { ArchivoItem, UploadArchivoPayload } from '@/types/archivos.types'

const ARCHIVOS_BASE_URL = '/archivos'

export const AREA_ESTUDIANTES = {
  entidadTipo: 'AREA_ESTUDIANTES',
  entidadId: 1
} as const

export const archivosService = {
  async getAreaEstudiantes(): Promise<ArchivoItem[]> {
    const response = await apiClient.get<ArchivoItem[]>(`${ARCHIVOS_BASE_URL}/area-estudiantes`)

    return response.data
  },

  async uploadAreaEstudiantes(file: File, descripcion?: string): Promise<ArchivoItem> {
    const formData = new FormData()
    formData.append('file', file)

    if (descripcion?.trim()) {
      formData.append('descripcion', descripcion.trim())
    }

    const response = await apiClient.post<ArchivoItem>(
      `${ARCHIVOS_BASE_URL}/area-estudiantes/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return response.data
  },

  async upload(payload: UploadArchivoPayload): Promise<ArchivoItem> {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('entidadTipo', payload.entidadTipo)
    formData.append('entidadId', String(payload.entidadId))

    if (payload.descripcion?.trim()) {
      formData.append('descripcion', payload.descripcion.trim())
    }

    const response = await apiClient.post<ArchivoItem>(
      `${ARCHIVOS_BASE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return response.data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`${ARCHIVOS_BASE_URL}/${id}`)
  },

  async download(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ARCHIVOS_BASE_URL}/${id}/download`, {
      responseType: 'blob'
    })

    return response.data
  }
}
