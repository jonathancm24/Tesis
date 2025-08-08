import api from '@/config/api'
import type { PerfilResponse, PerfilUpdateData } from '@//types/profile'

export const profileService = {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<PerfilResponse> {
    try {
      const response = await api.get('/auth/perfil')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener perfil:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil')
    }
  },

  /**
   * Actualizar perfil del usuario autenticado
   */
  async updateProfile(data: PerfilUpdateData): Promise<PerfilResponse> {
    try {
      const response = await api.patch('/auth/perfil', data)
      return response.data
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error)
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil')
    }
  },

  /**
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<{ message: string }> {
    try {
      const response = await api.patch('/auth/change-password', data)
      return response.data
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error)
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña')
    }
  }
}
