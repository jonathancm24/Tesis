/**
 * Servicio para gestión de especialidades
 */

import { apiClient } from '@/Config/api'
import type {
  Especialidad,
  CreateEspecialidadDto,
  UpdateEspecialidadDto
} from '@/types/especialidades.types'

const ESPECIALIDADES_BASE_URL = '/especialidades'

export const especialidadesService = {
  /**
   * Obtener todas las especialidades
   */
  async getAll(): Promise<Especialidad[]> {
    const response = await apiClient.get<Especialidad[]>(ESPECIALIDADES_BASE_URL)
    return response.data
  },

  /**
   * Obtener una especialidad por ID
   */
  async getById(id: number): Promise<Especialidad> {
    const response = await apiClient.get<Especialidad>(`${ESPECIALIDADES_BASE_URL}/${id}`)
    return response.data
  },

  /**
   * Crear una nueva especialidad
   */
  async create(data: CreateEspecialidadDto): Promise<Especialidad> {
    const response = await apiClient.post<Especialidad>(ESPECIALIDADES_BASE_URL, data)
    return response.data
  },

  /**
   * Actualizar una especialidad existente
   */
  async update(id: number, data: UpdateEspecialidadDto): Promise<Especialidad> {
    const response = await apiClient.patch<Especialidad>(`${ESPECIALIDADES_BASE_URL}/${id}`, data)
    return response.data
  },

  /**
   * Eliminar una especialidad
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ESPECIALIDADES_BASE_URL}/${id}`)
  }
}
