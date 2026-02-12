/**
 * Store de Usuarios con Pinia
 * Gestiona el estado global de usuarios en la aplicación
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usuariosService } from '@/services/usuarios.service'
import { getErrorMessage } from '@/utils/errorHandler'
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioFilters,
  UsuarioStats
} from '@/types/usuarios.types'

export const useUsuariosStore = defineStore('usuarios', () => {
  // Estado
  const usuarios = ref<Usuario[]>([])
  const usuarioActual = ref<Usuario | null>(null)
  const stats = ref<UsuarioStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Paginación
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Filtros actuales
  const currentFilters = ref<UsuarioFilters>({
    page: 1,
    limit: 10,
    orderBy: 'fechaRegistro',
    orderDirection: 'desc'
  })

  // Computed
  const usuariosActivos = computed(() => usuarios.value.filter(u => u.activo))
  const usuariosInactivos = computed(() => usuarios.value.filter(u => !u.activo))
  const totalUsuarios = computed(() => pagination.value.total)

  /**
   * Obtener todos los usuarios con filtros
   */
  const fetchUsuarios = async (filters?: UsuarioFilters) => {
    isLoading.value = true
    error.value = null

    try {
      // Actualizar filtros actuales
      if (filters) {
        currentFilters.value = { ...currentFilters.value, ...filters }
      }

      const response = await usuariosService.getAll(currentFilters.value)
      usuarios.value = response.data
      pagination.value = response.pagination
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error fetching usuarios:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener un usuario por ID
   */
  const fetchUsuarioById = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      usuarioActual.value = await usuariosService.getById(id)
      return usuarioActual.value
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error fetching usuario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crear un nuevo usuario
   */
  const createUsuario = async (data: CreateUsuarioDto) => {
    isLoading.value = true
    error.value = null

    try {
      const nuevoUsuario = await usuariosService.create(data)
      
      // Agregar al inicio de la lista
      usuarios.value.unshift(nuevoUsuario)
      pagination.value.total++

      return nuevoUsuario
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error creating usuario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualizar un usuario existente
   */
  const updateUsuario = async (id: number, data: UpdateUsuarioDto) => {
    isLoading.value = true
    error.value = null

    try {
      const usuarioActualizado = await usuariosService.update(id, data)
      
      // Actualizar en la lista
      const index = usuarios.value.findIndex(u => u.id === id)
      if (index !== -1) {
        usuarios.value[index] = usuarioActualizado
      }

      // Actualizar usuario actual si es el mismo
      if (usuarioActual.value?.id === id) {
        usuarioActual.value = usuarioActualizado
      }

      return usuarioActualizado
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error updating usuario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Eliminar un usuario
   */
  const deleteUsuario = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await usuariosService.delete(id)
      
      // Remover de la lista
      usuarios.value = usuarios.value.filter(u => u.id !== id)
      pagination.value.total--

      // Limpiar usuario actual si es el mismo
      if (usuarioActual.value?.id === id) {
        usuarioActual.value = null
      }
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error deleting usuario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Activar un usuario
   */
  const activateUsuario = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const usuarioActualizado = await usuariosService.activate(id)
      
      // Actualizar en la lista
      const index = usuarios.value.findIndex(u => u.id === id)
      if (index !== -1) {
        usuarios.value[index] = usuarioActualizado
      }

      return usuarioActualizado
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error activating usuario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Desactivar un usuario
   */
  const deactivateUsuario = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const usuarioActualizado = await usuariosService.deactivate(id)
      
      // Actualizar en la lista
      const index = usuarios.value.findIndex(u => u.id === id)
      if (index !== -1) {
        usuarios.value[index] = usuarioActualizado
      }

      return usuarioActualizado
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error deactivating usuario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cambiar contraseña de un usuario
   */
  const changePassword = async (id: number, data: ChangePasswordDto) => {
    isLoading.value = true
    error.value = null

    try {
      await usuariosService.changePassword(id, data)
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error changing password:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  const fetchStats = async () => {
    isLoading.value = true
    error.value = null

    try {
      stats.value = await usuariosService.getStats()
      return stats.value
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('Error fetching stats:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Aplicar filtros
   */
  const applyFilters = async (filters: UsuarioFilters) => {
    currentFilters.value = { ...currentFilters.value, ...filters, page: 1 }
    await fetchUsuarios()
  }

  /**
   * Cambiar página
   */
  const changePage = async (page: number) => {
    currentFilters.value.page = page
    await fetchUsuarios()
  }

  /**
   * Cambiar límite de resultados
   */
  const changeLimit = async (limit: number) => {
    currentFilters.value.limit = limit
    currentFilters.value.page = 1
    await fetchUsuarios()
  }

  /**
   * Limpiar filtros
   */
  const clearFilters = async () => {
    currentFilters.value = {
      page: 1,
      limit: 10,
      orderBy: 'fechaRegistro',
      orderDirection: 'desc'
    }
    await fetchUsuarios()
  }

  /**
   * Limpiar estado
   */
  const reset = () => {
    usuarios.value = []
    usuarioActual.value = null
    stats.value = null
    isLoading.value = false
    error.value = null
    pagination.value = {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
    currentFilters.value = {
      page: 1,
      limit: 10,
      orderBy: 'fechaRegistro',
      orderDirection: 'desc'
    }
  }

  return {
    // Estado
    usuarios,
    usuarioActual,
    stats,
    isLoading,
    error,
    pagination,
    currentFilters,

    // Computed
    usuariosActivos,
    usuariosInactivos,
    totalUsuarios,

    // Acciones
    fetchUsuarios,
    fetchUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    activateUsuario,
    deactivateUsuario,
    changePassword,
    fetchStats,
    applyFilters,
    changePage,
    changeLimit,
    clearFilters,
    reset
  }
})
