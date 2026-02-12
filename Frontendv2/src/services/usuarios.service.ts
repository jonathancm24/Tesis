/**
 * Servicio para gestión de usuarios
 * Maneja todas las peticiones HTTP al backend para el módulo de usuarios
 */

import { apiClient } from '@/Config/api'
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioFilters,
  PaginatedUsuarios,
  UsuarioStats
} from '@/types/usuarios.types'

const USUARIOS_BASE_URL = '/usuarios'

/**
 * Servicio de usuarios con todos los métodos CRUD
 */
export const usuariosService = {
  /**
   * Obtener todos los usuarios con filtros y paginación
   */
  async getAll(filters?: UsuarioFilters): Promise<PaginatedUsuarios> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const response = await apiClient.get<PaginatedUsuarios>(
      `${USUARIOS_BASE_URL}?${params.toString()}`
    )
    return response.data
  },

  /**
   * Obtener un usuario por ID
   */
  async getById(id: number): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`${USUARIOS_BASE_URL}/${id}`)
    return response.data
  },

  /**
   * Crear un nuevo usuario
   */
  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const response = await apiClient.post<Usuario>(USUARIOS_BASE_URL, data)
    return response.data
  },

  /**
   * Actualizar un usuario existente
   */
  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    const response = await apiClient.patch<Usuario>(`${USUARIOS_BASE_URL}/${id}`, data)
    return response.data
  },

  /**
   * Eliminar un usuario (soft delete)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${USUARIOS_BASE_URL}/${id}`)
  },

  /**
   * Activar un usuario
   */
  async activate(id: number): Promise<Usuario> {
    const response = await apiClient.patch<Usuario>(`${USUARIOS_BASE_URL}/${id}/activate`)
    return response.data
  },

  /**
   * Desactivar un usuario
   */
  async deactivate(id: number): Promise<Usuario> {
    const response = await apiClient.patch<Usuario>(`${USUARIOS_BASE_URL}/${id}/deactivate`)
    return response.data
  },

  /**
   * Cambiar contraseña de un usuario
   */
  async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
    await apiClient.patch(`${USUARIOS_BASE_URL}/${id}/password`, data)
  },

  /**
   * Obtener estadísticas de usuarios
   */
  async getStats(): Promise<UsuarioStats> {
    const response = await apiClient.get<UsuarioStats>(`${USUARIOS_BASE_URL}/stats`)
    return response.data
  },

  /**
   * Importar usuarios desde Excel
   */
  async importFromExcel(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<{ imported: number; errors: string[] }>(
      `${USUARIOS_BASE_URL}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  /**
   * Descargar plantilla de importación
   */
  async downloadTemplate(): Promise<Blob> {
    const response = await apiClient.get(
      `${USUARIOS_BASE_URL}/template`,
      {
        responseType: 'blob'
      }
    )
    return response.data
  },

  /**
   * Exportar usuarios a Excel
   */
  async exportToExcel(filters?: UsuarioFilters): Promise<Blob> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const response = await apiClient.get(
      `${USUARIOS_BASE_URL}/export?${params.toString()}`,
      {
        responseType: 'blob'
      }
    )
    return response.data
  }
}
