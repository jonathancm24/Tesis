import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export const AUTH_EXPIRED_EVENT = 'auth:expired'

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
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Obtener token del localStorage
    const token = localStorage.getItem('auth-token')
    
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`)
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
    // Centralizar la expiración o invalidación de la sesión
    const isLoginRequest = typeof error.config?.url === 'string' &&
      error.config.url.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      authService.clearAuthData()
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    }
    
    return Promise.reject(error)
  }
)

/**
 * Tipos para las respuestas de la API
 */
export interface ApiResponse<T = unknown> {
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

const isStoredUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false

  const user = value as Partial<User>
  return (
    typeof user.id === 'number' &&
    typeof user.nombre === 'string' &&
    typeof user.apellido === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'object' &&
    user.role !== null &&
    typeof user.role.id === 'number' &&
    typeof user.role.nombre === 'string'
  )
}

const isJwtExpired = (token: string): boolean => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return false

    const payload = JSON.parse(
      decodeURIComponent(
        atob(
          payloadPart
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=')
        )
          .split('')
          .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      )
    ) as { exp?: unknown }

    return typeof payload.exp === 'number' &&
      payload.exp * 1000 <= Date.now()
  } catch {
    return false
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
    return Boolean(token && !isJwtExpired(token))
  },

  /**
   * Obtener datos del usuario desde localStorage
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user-data')
    if (!userData) return null

    try {
      const user = JSON.parse(userData) as unknown
      return isStoredUser(user) ? user : null
    } catch {
      return null
    }
  },

  /**
   * Guardar token y datos del usuario en localStorage
   */
  saveAuthData(token: string, user: User): void {
    if (!token || !isStoredUser(user)) return

    localStorage.setItem('auth-token', token)
    localStorage.setItem('user-data', JSON.stringify(user))
  },

  clearAuthData(): void {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
  }
}

export default apiClient