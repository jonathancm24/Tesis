import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Instancia configurada de Axios para realizar peticiones HTTP
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

/**
 * Interceptor para agregar el token de autenticación a las peticiones
 */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    // Obtener token del localStorage
    const token = localStorage.getItem('auth-token')
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Interceptor para manejar respuestas y errores globalmente
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Si el token expiró (401), limpiar storage y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user-data')
      
      // Redirigir a login solo si no estamos ya allí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

/**
 * Tipos para las respuestas de la API
 */
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    nombre: string
    apellido: string
    email: string
    role: {
      id: number
      nombre: string
    }
  }
}

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  role: {
    id: number
    nombre: string
  }
}

/**
 * Servicios de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param credentials - Credenciales de login (email y password)
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  /**
   * Cerrar sesión (limpiar tokens locales)
   */
  logout(): void {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth-token')
    return !!token
  },

  /**
   * Obtener datos del usuario desde localStorage
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user-data')
    return userData ? JSON.parse(userData) : null
  },

  /**
   * Guardar token y datos del usuario en localStorage
   */
  saveAuthData(token: string, user: User): void {
    localStorage.setItem('auth-token', token)
    localStorage.setItem('user-data', JSON.stringify(user))
  }
}

export default apiClient