// src/config/api.ts
import axios from 'axios'
import { environment } from './environment'

// Crear instancia de axios
const api = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: environment.apiTimeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const API_CONFIG = {
  BASE_URL: environment.apiBaseUrl,
  TIMEOUT: environment.apiTimeout,
  // Endpoints de la API 
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/registro', // ← Corregido según tu controller
      PROFILE: '/auth/perfil',
      LOGOUT: '/auth/logout'
    },
    USERS: {
      BASE: '/auth/usuarios', // ← Cambiado según tu controller
      BY_ID: (id: number) => `/auth/usuarios/porId/${id}`,
      BY_EMAIL: (email: string) => `/auth/usuarios/porEmail/${email}`,
      TOGGLE_STATE: (id: number) => `/auth/usuarios/porId/${id}/estado`,
      DELETE: (id: number) => `/auth/usuarios/porId/${id}`
    },
    ROLES: {
      BASE: '/roles',
      PERMISSIONS: (id: number) => `/roles/${id}/permisos`
    },
    ESPECIALIDADES: {
      BASE: '/especialidades'
    },
    PAISES: {
      BASE: '/pais'
    },
    PROVINCIAS: {
      BASE: '/provincia'
    },
    CANTONES: {
      BASE: '/canton'
    },
    PARROQUIAS: {
      BASE: '/parroquia',
      SEARCH: '/parroquia/buscar' 
    }

  }
}

// Headers por defecto
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Headers para archivos
export const getFileHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    ...(token && { Authorization: `Bearer ${token}` })
    // No incluir Content-Type para FormData
  }
}