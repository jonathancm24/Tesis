import api from '@/Config/api'
import type { PreguntaClinica, CreatePreguntaDto, UpdatePreguntaDto } from '@/types/preguntasClinicas.types'

export const preguntasClinicasService = {
  async getAll(filters?: { especialidadId?: number; tipo?: string }): Promise<PreguntaClinica[]> {
    const params = new URLSearchParams()
    if (filters?.especialidadId) params.append('especialidadId', String(filters.especialidadId))
    if (filters?.tipo) params.append('tipo', filters.tipo)

    const { data } = await api.get(`/preguntas-clinicas?${params.toString()}`)
    return data
  },

  async getById(id: number): Promise<PreguntaClinica> {
    const { data } = await api.get(`/preguntas-clinicas/${id}`)
    return data
  },

  async create(dto: CreatePreguntaDto): Promise<PreguntaClinica> {
    const { data } = await api.post('/preguntas-clinicas', dto)
    return data
  },

  async update(id: number, dto: UpdatePreguntaDto): Promise<PreguntaClinica> {
    const { data } = await api.put(`/preguntas-clinicas/${id}`, dto)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/preguntas-clinicas/${id}`)
  }
}
