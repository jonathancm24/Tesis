// frontend/src/services/userService.ts
import { API_CONFIG, getAuthHeaders } from '@/config/api'
import type { User, CreateUserRequest, UpdateUserRequest, UserRole, FormUser, Role, Especialidad, Parroquia } from '@/types/user'

class UserService {
  private baseUrl = API_CONFIG.BASE_URL

  /**
   * Obtener todos los usuarios
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BASE}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener usuarios')
      }

      const users = await response.json()
      return users.map((user: any) => this.mapBackendUserToFrontend(user))
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Obtener todos los roles disponibles desde la BD
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response = await fetch(`${this.baseUrl}/roles/todos`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al obtener roles')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Obtener todas las especialidades disponibles
   */
  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const response = await fetch(`${this.baseUrl}/especialidades`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al obtener especialidades')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Obtener todas las parroquias disponibles
   */
  async getParroquias(): Promise<Parroquia[]> {
    try {
      const response = await fetch(`${this.baseUrl}/parroquia`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al obtener parroquias')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Buscar parroquias por término de búsqueda
   */
  async buscarParroquias(query: string): Promise<Parroquia[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const response = await fetch(`${this.baseUrl}/parroquia/buscar?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al buscar parroquias')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Crear nuevo usuario
   */
  async createUser(formData: FormUser): Promise<User> {
    try {
      // Convertir FormUser a CreateUserRequest (coincide con RegisterDto)
      const userData: CreateUserRequest = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        cedula: formData.cedula,
        fechaNacimiento: formData.fechaNacimiento,
        password: formData.password,
        NotasAdicionales: formData.NotasAdicionales,
        roleId: formData.roleId || await this.getRoleIdByName(formData.role),
        especialidadIds: formData.especialidadIds || [],
        parroquiaId: formData.parroquiaId
      }

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear usuario')
      }

      const user = await response.json()
      return this.mapBackendUserToFrontend(user)
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Actualizar usuario existente
   */
  async updateUser(id: number, formData: FormUser): Promise<User> {
    try {
      // Convertir FormUser a UpdateUserRequest
      const userData: UpdateUserRequest = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        NotasAdicionales: formData.NotasAdicionales,
        roleId: formData.roleId || await this.getRoleIdByName(formData.role),
        activo: formData.activo,
        especialidadIds: formData.especialidadIds,
        parroquiaId: formData.parroquiaId
      }

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al actualizar usuario')
      }

      const user = await response.json()
      return this.mapBackendUserToFrontend(user)
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleUserActive(id: number): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.TOGGLE_STATE(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al cambiar estado del usuario')
      }

      const user = await response.json()
      return this.mapBackendUserToFrontend(user)
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.DELETE(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar usuario')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión')
    }
  }

  /**
   * Mapear usuario del backend al formato simple del frontend
   */
  private mapBackendUserToFrontend(backendUser: any): User {
    return {
      id: backendUser.id,
      nombre: backendUser.nombre,
      apellido: backendUser.apellido,
      email: backendUser.email,
      role: this.mapRoleToFrontend(backendUser.role?.nombre || 'ESTUDIANTE'),
      activo: backendUser.activo ?? true,
      especialidades: backendUser.especialidades?.map((e: any) => ({
        id: e.especialidad?.id || e.id,
        nombre: e.especialidad?.nombre || e.nombre,
        descripcion: e.especialidad?.descripcion || e.descripcion
      })) || []
    }
  }

  /**
   * Mapear roles del backend al frontend
   */
  private mapRoleToFrontend(backendRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'ADMIN': 'admin',
      'PROFESOR': 'profesor',
      'ESTUDIANTE': 'estudiante',
      'SECRETARIO': 'secretario',
      'PACIENTE': 'paciente'
    }
    return roleMap[backendRole] || 'estudiante'
  }

  /**
   * Mapear roles del frontend al ID del backend
   */
  async getRoleIdByName(roleName: UserRole): Promise<number> {
    try {
      const roles = await this.getRoles()
      const roleMap: Record<UserRole, string> = {
        'admin': 'ADMIN',
        'profesor': 'PROFESOR',
        'estudiante': 'ESTUDIANTE',
        'secretario': 'SECRETARIO',
        'paciente': 'PACIENTE'
      }
      
      const backendRoleName = roleMap[roleName]
      const role = roles.find(r => r.nombre === backendRoleName)
      
      return role?.id || 3
    } catch (error) {
      // Fallback estático
      const roleIdMap: Record<UserRole, number> = {
        'admin': 1,
        'profesor': 2,
        'estudiante': 3,
        'secretario': 4,
        'paciente': 5
      }
      return roleIdMap[roleName] || 3
    }
  }
}

export const userService = new UserService()