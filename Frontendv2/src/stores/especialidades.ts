/**
 * Store de Pinia para gestión de especialidades
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { especialidadesService } from '@/services/especialidades.service'
import type {
  Especialidad,
  CreateEspecialidadDto,
  UpdateEspecialidadDto
} from '@/types/especialidades.types'

export const useEspecialidadesStore = defineStore('especialidades', () => {
  const especialidades = ref<Especialidad[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtener todas las especialidades
   */
  async function fetchEspecialidades() {
    isLoading.value = true
    error.value = null
    try {
      especialidades.value = await especialidadesService.getAll()
    } catch (err: any) {
      error.value = err.message || 'Error al cargar especialidades'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crear una nueva especialidad
   */
  async function createEspecialidad(data: CreateEspecialidadDto) {
    isLoading.value = true
    error.value = null
    try {
      const nuevaEspecialidad = await especialidadesService.create(data)
      especialidades.value.push(nuevaEspecialidad)
      return nuevaEspecialidad
    } catch (err: any) {
      error.value = err.message || 'Error al crear especialidad'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualizar una especialidad existente
   */
  async function updateEspecialidad(id: number, data: UpdateEspecialidadDto) {
    isLoading.value = true
    error.value = null
    try {
      const especialidadActualizada = await especialidadesService.update(id, data)
      const index = especialidades.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        especialidades.value[index] = especialidadActualizada
      }
      return especialidadActualizada
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar especialidad'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Eliminar una especialidad
   */
  async function deleteEspecialidad(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await especialidadesService.delete(id)
      especialidades.value = especialidades.value.filter((e) => e.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar especialidad'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    especialidades,
    isLoading,
    error,
    fetchEspecialidades,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad
  }
})
