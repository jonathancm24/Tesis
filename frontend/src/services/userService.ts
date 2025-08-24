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
   * Obtener un usuario por ID con datos completos
   */
  async getUserById(id: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener usuario')
      }

      const user = await response.json()
      console.log('userService.getUserById - Datos raw del backend:', user)
      
      // Formatear fecha de nacimiento para input type="date"
      let fechaNacimientoFormatted = ''
      if (user.fechaNacimiento) {
        const fecha = new Date(user.fechaNacimiento)
        if (!isNaN(fecha.getTime())) {
          fechaNacimientoFormatted = fecha.toISOString().split('T')[0]
        }
      }
      
      const mappedUser = {
        id: user.id,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        tipoDocumento: user.tipoDocumento || 'CEDULA',
        numeroDocumento: user.numeroDocumento || '',
        fechaNacimiento: fechaNacimientoFormatted,
        NotasAdicionales: user.NotasAdicionales || '',
        role: this.mapRoleToFrontend(user.role?.nombre || 'ESTUDIANTE'),
  roleId: user.roleId || user.role?.id,
        activo: user.activo ?? true,
        especialidades: user.especialidades?.map((e: any) => ({
          id: e.especialidad?.id || e.id,
          nombre: e.especialidad?.nombre || e.nombre,
          descripcion: e.especialidad?.descripcion || e.descripcion
        })) || [],
        parroquiaId: user.parroquiaId || 1
      }
      
      console.log('userService.getUserById - Datos mapeados para frontend:', mappedUser)
      return mappedUser
    } catch (error: any) {
      console.error('userService.getUserById - Error:', error)
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
      // Validar roleId requerido y numérico
      const roleIdNum = typeof formData.roleId === 'string' 
        ? parseInt(formData.roleId as unknown as string, 10) 
        : formData.roleId
      if (!roleIdNum || Number.isNaN(roleIdNum)) {
        throw new Error('Debe seleccionar un rol válido')
      }
      // Convertir FormUser a CreateUserRequest (coincide con RegisterDto)
      const userData: CreateUserRequest = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        password: formData.password,
        NotasAdicionales: formData.NotasAdicionales,
  roleId: roleIdNum as number,
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
      console.log('userService.updateUser - Datos recibidos:', formData)
      // Validar roleId presente y numérico
      const roleIdNum = typeof formData.roleId === 'string' ? parseInt(formData.roleId as unknown as string, 10) : formData.roleId
      if (!roleIdNum || Number.isNaN(roleIdNum)) {
        throw new Error('Debe seleccionar un rol válido')
      }
      
      // Convertir FormUser a UpdateUserRequest - solo campos que pueden ser actualizados
      const userData: UpdateUserRequest = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        NotasAdicionales: formData.NotasAdicionales,
        // roleId se añadirá solo si viene definido
        activo: formData.activo,
        especialidadIds: formData.especialidadIds,
        parroquiaId: formData.parroquiaId
      }

      if (roleIdNum !== undefined) {
        (userData as any).roleId = roleIdNum
      }

      // Si se proporciona una contraseña, incluirla en la actualización
      if (formData.password && formData.password.trim() !== '') {
        (userData as any).password = formData.password
      }

      console.log('userService.updateUser - Datos a enviar:', userData)

      // Si no se envió roleId, eliminarlo del payload para no forzar cambio
      if (userData.roleId === undefined) {
        delete (userData as any).roleId
      }

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('userService.updateUser - Error del backend:', error)
        throw new Error(error.message || 'Error al actualizar usuario')
      }

      const user = await response.json()
      console.log('userService.updateUser - Usuario actualizado:', user)
      return this.mapBackendUserToFrontend(user)
    } catch (error: any) {
      console.error('userService.updateUser - Error:', error)
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
  roleNombre: backendUser.role?.nombre,
  roleId: backendUser.roleId || backendUser.role?.id,
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
    if (!backendRole) return 'estudiante'
    const key = backendRole.toString().trim().toUpperCase()
    const roleMap: Record<string, UserRole> = {
      'ADMIN': 'admin',
      'PROFESOR': 'profesor',
      'ESTUDIANTE': 'estudiante',
      'SECRETARIO': 'secretario',
      'PACIENTE': 'paciente'
    }
    return roleMap[key] || 'estudiante'
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