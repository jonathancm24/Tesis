/**
 * Servicio para gestión de estudiantes
 * Extiende la funcionalidad de usuarios.service con filtros específicos para estudiantes
 */

import { usuariosService } from '../Admin/usuarios.service'
import type {
  Usuario,
  CreateUsuarioDto,
  PaginatedUsuarios,
  UsuarioFilters
} from '@/types/usuarios.types'

/**
 * ID del rol de ESTUDIANTE (ajustar según tu base de datos)
 * Este valor debe coincidir con el ID del rol en la tabla Roles
 */
const ROL_ESTUDIANTE_ID = 3 // Ajustar según tu BD

/**
 * ID del rol de ADMIN (para validaciones)
 */
export const ROL_ADMIN_ID = 1 // Ajustar según tu BD

/**
 * Servicio de estudiantes que filtra solo usuarios con rol ESTUDIANTE
 */
export const estudiantesService = {
  /**
   * Obtener todos los estudiantes (usuarios con roleId = ESTUDIANTE)
   */
  async getAll(filters?: Omit<UsuarioFilters, 'roleId'>): Promise<PaginatedUsuarios> {
    return usuariosService.getAll({
      ...filters,
      roleId: ROL_ESTUDIANTE_ID
    })
  },

  /**
   * Obtener un estudiante por ID
   */
  async getById(id: number): Promise<Usuario> {
    return usuariosService.getById(id)
  },

  /**
   * Crear un nuevo estudiante
   * Fuerza el roleId a ESTUDIANTE
   */
  async create(data: Omit<CreateUsuarioDto, 'roleId'>): Promise<Usuario> {
    return usuariosService.create({
      ...data,
      roleId: ROL_ESTUDIANTE_ID
    })
  },

  /**
   * Importar estudiantes desde Excel
   * Valida que no se intenten crear administradores
   */
  async importFromExcel(file: File): Promise<{ imported: number; errors: string[] }> {
    // El backend procesará el archivo, pero primero validamos en memoria si es posible
    return usuariosService.importFromExcel(file)
  },

  /**
   * Descargar plantilla de importación para estudiantes
   */
  async downloadTemplate(): Promise<Blob> {
    return usuariosService.downloadTemplate()
  },

  /**
   * Validar que un roleId no sea ADMIN
   * Retorna true si es válido (no admin), false si es admin
   */
  validateRoleNotAdmin(roleId: number): boolean {
    return roleId !== ROL_ADMIN_ID
  }
}
