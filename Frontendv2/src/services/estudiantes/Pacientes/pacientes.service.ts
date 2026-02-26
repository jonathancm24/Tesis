/**
 * Servicio HTTP para gestión de pacientes
 */

import { apiClient } from '@/Config/api'
import type {
  Paciente,
  CreatePacienteDto,
  UpdatePacienteDto,
  PaginatedPacientes,
  PacienteFilters
} from '@/types/pacientes.types'

export const pacientesService = {
  /**
   * Obtener todos los pacientes
   */
  async getAll(filters?: PacienteFilters): Promise<PaginatedPacientes> {
    const params = new URLSearchParams()
    
    if (filters?.nombre) params.append('nombre', filters.nombre)
    if (filters?.apellido) params.append('apellido', filters.apellido)
    if (filters?.email) params.append('email', filters.email)
    if (filters?.activo !== undefined) params.append('activo', String(filters.activo))
    if (filters?.parroquiaId) params.append('parroquiaId', String(filters.parroquiaId))
    if (filters?.tipoDocumento) params.append('tipoDocumento', filters.tipoDocumento)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.orderBy) params.append('orderBy', filters.orderBy)
    if (filters?.orderDirection) params.append('orderDirection', filters.orderDirection)

    const queryString = params.toString()
    const url = queryString ? `/pacientes?${queryString}` : '/pacientes'
    
    const response = await apiClient.get<PaginatedPacientes>(url)
    return response.data
  },

  /**
   * Obtener un paciente por ID
   */
  async getById(id: number): Promise<Paciente> {
    const response = await apiClient.get<Paciente>(`/pacientes/${id}`)
    return response.data
  },

  /**
   * Crear un nuevo paciente
   */
  async create(data: CreatePacienteDto): Promise<Paciente> {
    const response = await apiClient.post<Paciente>('/pacientes', data)
    return response.data
  },

  /**
   * Actualizar un paciente
   */
  async update(id: number, data: UpdatePacienteDto): Promise<Paciente> {
    const response = await apiClient.patch<Paciente>(`/pacientes/${id}`, data)
    return response.data
  },

  /**
   * Eliminar un paciente (soft delete)
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/pacientes/${id}`)
    return response.data
  },

  /**
   * Activar un paciente
   */
  async activate(id: number): Promise<Paciente> {
    const response = await apiClient.patch<Paciente>(`/pacientes/${id}/activate`)
    return response.data
  }
}
