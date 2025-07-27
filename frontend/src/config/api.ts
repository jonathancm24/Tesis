// src/config/api.ts
import { environment } from './environment'

export const API_CONFIG = {
  BASE_URL: environment.apiBaseUrl,
  TIMEOUT: environment.apiTimeout,
  // Endpoints de la API 
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/registro', // ← Corregido según tu controller
      PROFILE: '/auth/profile',
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