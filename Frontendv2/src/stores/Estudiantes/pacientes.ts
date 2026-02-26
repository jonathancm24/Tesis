/**
 * Store de Pinia para gestión de pacientes
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import type { Paciente, PaginatedPacientes, PacienteFilters } from '@/types/pacientes.types'

export const usePacientesStore = defineStore('pacientes', () => {
  const pacientes = ref<Paciente[]>([])
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtener todos los pacientes con filtros
   */
  async function fetchPacientes(filters?: PacienteFilters) {
    isLoading.value = true
    error.value = null
    try {
      const response: PaginatedPacientes = await pacientesService.getAll(filters)
      pacientes.value = response.data
      pagination.value = {
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages,
        hasNextPage: response.pagination.hasNextPage,
        hasPrevPage: response.pagination.hasPrevPage
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar pacientes'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener un paciente por ID
   */
  async function getPaciente(id: number): Promise<Paciente> {
    try {
      return await pacientesService.getById(id)
    } catch (err: any) {
      error.value = err.message || 'Error al obtener paciente'
      throw err
    }
  }

  /**
   * Actualizar la lista local cuando se crea o actualiza un paciente
   */
  function updateLocalPaciente(paciente: Paciente) {
    const index = pacientes.value.findIndex(p => p.id === paciente.id)
    if (index !== -1) {
      pacientes.value[index] = paciente
    } else {
      pacientes.value.unshift(paciente)
    }
  }

  /**
   * Eliminar un paciente de la lista local
   */
  function removePaciente(id: number) {
    pacientes.value = pacientes.value.filter(p => p.id !== id)
  }

  return {
    pacientes,
    pagination,
    isLoading,
    error,
    fetchPacientes,
    getPaciente,
    updateLocalPaciente,
    removePaciente
  }
})
