/**
 * Composable para manejo de autenticación
 * Archivo: src/composables/useAuth.ts
 */

import { ref, computed } from 'vue'
import type { FrontendUser } from '@/types/auth'

// Estado global de autenticación
const user = ref<FrontendUser | null>(null)
const token = ref<string | null>(null)

export function useAuth() {
  /**
   * Inicializa la autenticación desde localStorage
   */
  const initializeAuth = () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        console.log('🔑 Autenticación inicializada:', { user: user.value?.email, role: user.value?.role })
      } else {
        console.log('⚠️ No hay sesión activa')
      }
    } catch (error) {
      console.error('Error al inicializar autenticación:', error)
      logout()
    }
  }

  /**
   * Inicia sesión guardando el usuario y token
   */
  const login = (userData: FrontendUser, userToken: string) => {
    user.value = userData
    token.value = userToken
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
    console.log('✅ Sesión iniciada:', { user: userData.email, role: userData.role })
  }

  /**
   * Cierra sesión limpiando el estado
   */
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    console.log('🚪 Sesión cerrada')
  }

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: string) => {
    return user.value?.role === role
  }

  /**
   * Verifica si el usuario es estudiante
   */
  const isStudent = computed(() => user.value?.role === 'estudiante')

  /**
   * Obtiene los datos del usuario actual
   */
  const getCurrentUser = () => user.value

  /**
   * Obtiene el token actual
   */
  const getToken = () => token.value

  // Inicializar al importar el composable
  if (!user.value) {
    initializeAuth()
  }

  return {
    // Estado
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    isStudent,
    
    // Métodos
    login,
    logout,
    hasRole,
    getCurrentUser,
    getToken,
    initializeAuth
  }
}
