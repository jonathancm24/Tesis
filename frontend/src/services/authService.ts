// src/services/authService.ts
import { API_CONFIG, getAuthHeaders } from '@/config/api'
import type { User, FrontendUser, FrontendRole } from '@/types/auth'

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private baseUrl = API_CONFIG.BASE_URL

  /**
   * Mapea roles del backend al formato del frontend
   */
  private mapRoleToFrontend(backendRole: string): FrontendRole {
    const roleMap: Record<string, FrontendRole> = {
      'ADMIN': 'admin',
      'PROFESOR': 'profesor',
      'ESTUDIANTE': 'estudiante',
      'SECRETARIO': 'secretario'
    }
    return roleMap[backendRole] || 'estudiante'
  }

  /**
   * Convierte User del backend a FrontendUser
   */
  private mapUserToFrontend(backendUser: User): FrontendUser {
    return {
      id: backendUser.id,
      nombre: backendUser.nombre,
      apellido: backendUser.apellido,
      email: backendUser.email,
      role: this.mapRoleToFrontend(backendUser.role.nombre)
    }
  }

  async login(email: string, password: string): Promise<FrontendUser> {
    try {
      console.log('🔐 Intentando hacer login con:', email);
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password })
      })

      if (!response.ok) {
        const error = await response.json()
        
        if (response.status === 401) {
          throw new Error('Credenciales inválidas')
        } else if (response.status === 403) {
          throw new Error('Usuario inactivo o sin permisos')
        }
        
        throw new Error(error.message || 'Error al iniciar sesión')
      }

      const data = await response.json()
      
      console.log('✅ Respuesta del backend:', data)

      // Verificar que la respuesta tenga la estructura esperada
      if (!data.user || !data.access_token) {
        console.error('Error: Backend no devolvió estructura completa')
        throw new Error('Respuesta inválida del servidor')
      }

      // Guardar token
      localStorage.setItem('token', data.access_token)
      
      // Convertir y retornar usuario para el frontend
      const frontendUser = this.mapUserToFrontend(data.user)
      localStorage.setItem('user', JSON.stringify(frontendUser))
      
      console.log('✅ Login exitoso:', frontendUser.nombre);
      
      return frontendUser

    } catch (error: any) {
      console.error('❌ Error completo en login:', error)
      this.logout()
      throw new Error(error.message || 'Error de conexión')
    }
  }

  async getProfile(): Promise<FrontendUser> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Sesión expirada')
      }

      const backendUser: User = await response.json()
      const frontendUser = this.mapUserToFrontend(backendUser)
      
      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(frontendUser))
      
      return frontendUser

    } catch (error: any) {
      this.logout()
      throw new Error(error.message || 'Error al obtener perfil')
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('🔓 Sesión cerrada');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Obtiene los datos del usuario actual
   */
  getCurrentUser(): FrontendUser | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === roleName;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

}

export const authService = new AuthService()