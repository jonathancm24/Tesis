// src/store/auth.ts
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import type { FrontendUser, AuthState } from '@/types/auth'

// Store para manejar la autenticación
export const useAuthStore = defineStore('auth', { 
  state: (): AuthState => ({ 
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
// Getters para acceder a propiedades del usuario
  getters: {
    userName: (state) => state.user ? `${state.user.nombre} ${state.user.apellido}` : '',
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isProfesor: (state) => state.user?.role === 'profesor',
    isEstudiante: (state) => state.user?.role === 'estudiante',
    isSecretario: (state) => state.user?.role === 'secretario'
  },
// Acciones para manejar la lógica de autenticación
  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const user = await authService.login(email, password)
        this.user = user
        this.token = localStorage.getItem('token')
        this.isAuthenticated = true
        return user
      } catch (error: any) {
        this.error = error.message
        this.isAuthenticated = false
        throw error
      } finally {
        this.loading = false
      }
    },
    // Método para verificar si el usuario está autenticado
    async loadUserFromStorage() {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getProfile()
          this.user = user
          this.token = localStorage.getItem('token')
          this.isAuthenticated = true
        } catch (error) {
          this.logout()
        }
      }
    },
    // Método para cerrar sesión
    logout() {
      authService.logout()
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
    },
    
    // Método para manejar errores
    setError(error: string) {
      this.error = error
    },

    // Método para limpiar el error
    clearError() {
      this.error = null
    }
  }
})