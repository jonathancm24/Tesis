/**
 * Store de Pinia para gestión de estudiantes
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { estudiantesService } from '@/services/estudiantes/estudiantes.service'
import type { Usuario, PaginatedUsuarios } from '@/types/usuarios.types'

export const useEstudiantesStore = defineStore('estudiantes', () => {
  const estudiantes = ref<Usuario[]>([])
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtener todos los estudiantes con filtros
   */
  async function fetchEstudiantes(filters?: { search?: string; activo?: boolean }) {
    isLoading.value = true
    error.value = null
    try {
      const response: PaginatedUsuarios = await estudiantesService.getAll(filters)
      estudiantes.value = response.data
      pagination.value = {
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar estudiantes'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    estudiantes,
    pagination,
    isLoading,
    error,
    fetchEstudiantes
  }
})
