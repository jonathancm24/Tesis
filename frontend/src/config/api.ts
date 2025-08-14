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

// Función para obtener token de manera consistente
const getToken = (): string | null => {
  // Usar el mismo método que usas en authService
  return localStorage.getItem('token')
}

// Función para obtener usuario
const getUser = (): any | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    const user = getUser()
    
    // Logs para debugging
    console.log('🔄 API Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      userRole: user?.role,
      userId: user?.id
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token agregado a headers')
    } else {
      console.warn('⚠️ No hay token disponible para la request')
    }
    
    return config
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'no-array'
    })
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      console.log('🚨 Error 401: Token expirado o inválido - limpiando localStorage')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

// Agregar el endpoint que falta
export const API_CONFIG = {
  BASE_URL: environment.apiBaseUrl,
  TIMEOUT: environment.apiTimeout,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/registro',
      PROFILE: '/auth/perfil',
      LOGOUT: '/auth/logout'
    },
    USERS: {
      BASE: '/auth/usuarios',
      BY_ID: (id: number) => `/auth/usuarios/porId/${id}`,
      BY_EMAIL: (email: string) => `/auth/usuarios/porEmail/${email}`,
      TOGGLE_STATE: (id: number) => `/auth/usuarios/porId/${id}/estado`,
      DELETE: (id: number) => `/auth/usuarios/porId/${id}`
    },
    CASOS_CLINICOS: {
      BASE: '/casos-clinicos',
      PROFESORES_DISPONIBLES: '/casos-clinicos/profesores-disponibles' // ← Agregado
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
    },
    ENCUESTAS_TAMIZAJE: {
      BASE: '/encuestas-tamizaje',
      FORMULARIO: (pacienteId: number) => `/encuestas-tamizaje/formulario/${pacienteId}`,
      ANTECEDENTES: (pacienteId: number) => `/encuestas-tamizaje/antecedentes/${pacienteId}`,
      VERIFICAR: (pacienteId: number) => `/encuestas-tamizaje/verificar/${pacienteId}`,
      ADMIN_PREGUNTAS: '/encuestas-tamizaje/admin/preguntas'
    }
  }
}

// Headers por defecto
export const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Headers para archivos
export const getFileHeaders = () => {
  const token = getToken()
  return {
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

