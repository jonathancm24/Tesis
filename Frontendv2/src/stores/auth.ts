import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginRequest, type User } from '@/Config/api'

/**
 * Store de Pinia para manejar el estado de autenticación
 * Maneja login, logout, estado de usuario y persistencia de sesión
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role?.nombre || null)

  /**
   * Inicializar el store con datos de localStorage si existen
   */
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth-token')
    const savedUser = localStorage.getItem('user-data')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Error al recuperar datos de autenticación:', error)
        clearAuth()
      }
    }
  }

  /**
   * Limpiar estado de autenticación
   */
  const clearAuth = () => {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
  }

  /**
   * Función para iniciar sesión
   * @param credentials - Credenciales de login
   */
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      
      // Guardar datos de autenticación
      token.value = response.access_token
      user.value = response.user
      
      // Persistir en localStorage
      authService.saveAuthData(response.access_token, response.user)
      
      return response
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      if (err.response?.status === 401) {
        error.value = 'Credenciales inválidas. Verifica tu email y contraseña.'
      } else if (err.response?.status >= 500) {
        error.value = 'Error del servidor. Intenta nuevamente más tarde.'
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        error.value = 'Error de conexión. Verifica tu conexión a internet.'
      } else {
        error.value = err.response?.data?.message || 'Error inesperado durante el login.'
      }
      
      console.error('Error en login:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Función para cerrar sesión
   */
  const logout = () => {
    authService.logout()
    clearAuth()
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param role - Nombre del rol a verificar
   */
  const hasRole = (role: string): boolean => {
    return userRole.value === role
  }

  /**
   * Verificar si el usuario es administrador
   */
  const isAdmin = computed(() => hasRole('admin') || hasRole('administrador'))

  /**
   * Obtener nombre completo del usuario
   */
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.nombre} ${user.value.apellido}`.trim()
  })

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    user,
    token,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    userRole,
    isAdmin,
    fullName,
    
    // Acciones
    initializeAuth,
    login,
    logout,
    clearAuth,
    hasRole,
    clearError
  }
})