// frontend/src/services/bulkUserService.ts

import { API_CONFIG, getAuthHeaders, getFileHeaders } from '@/config/api'

/**
 * Respuesta de validación de archivo Excel
 */
export interface ExcelValidationResponse {
  validUsers: any[]
  invalidUsers: {
    row: number
    data: any
    errors: string[]
  }[]
  duplicateUsers: {
    row: number
    data: any
    existingUser: any
  }[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    duplicateRows: number
  }
  hasErrors: boolean
}

/**
 * Respuesta de procesamiento masivo
 */
export interface BulkProcessResponse {
  created: any[]
  updated: any[]
  failed: {
    data: any
    error: string
  }[]
  summary: {
    totalProcessed: number
    successfullyCreated: number
    successfullyUpdated: number
    failed: number
  }
}

/**
 * Respuesta de desactivación masiva
 */
export interface BulkDeactivateResponse {
  deactivated: any[]
  failed: {
    id: number
    error: string
  }[]
  summary: {
    totalRequested: number
    successfullyDeactivated: number
    failed: number
  }
}

/**
 * Servicio para operaciones masivas de usuarios
 * Maneja carga desde Excel y desactivación por lotes
 */
class BulkUserService {
  private baseUrl = API_CONFIG.BASE_URL

  /**
   * Valida un archivo Excel antes de procesarlo
   * @param file Archivo Excel con datos de usuarios
   * @returns Resultado de la validación
   */
  async validateExcelFile(file: File): Promise<ExcelValidationResponse> {
    try {
      console.log('🔍 Validando archivo:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validar que sea un archivo Excel
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ]

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten archivos Excel (.xlsx, .xls)')
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo no puede ser mayor a 5MB')
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append('file', file)

      // Verificar token antes de enviar
      const token = localStorage.getItem('token')
      console.log('🔑 Token disponible:', !!token);
      if (token) {
        console.log('🔑 Token length:', token.length);
      }

      const headers = getFileHeaders();
      console.log('📤 Headers enviados:', headers);

      const response = await fetch(`${this.baseUrl}/usuarios/bulk/validate-excel`, {
        method: 'POST',
        headers: headers,
        body: formData
      })

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Error del servidor:', errorData);
        throw new Error(errorData.message || 'Error al validar el archivo Excel')
      }

      return await response.json()
    } catch (error: any) {
      console.error('❌ Error en validateExcelFile:', error);
      throw new Error(error.message || 'Error de conexión al validar archivo')
    }
  }

  /**
   * Procesa usuarios validados y los crea/actualiza en la base de datos
   * @param validUsers Lista de usuarios válidos para crear
   * @param duplicateUsers Lista de usuarios duplicados para reactivar
   * @returns Resultado del procesamiento
   */
  async processUsers(
    validUsers: any[], 
    duplicateUsers: any[]
  ): Promise<BulkProcessResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/bulk/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          validUsers,
          duplicateUsers
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al procesar usuarios')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión al procesar usuarios')
    }
  }

  /**
   * Desactiva múltiples usuarios por sus IDs
   * @param userIds Lista de IDs de usuarios a desactivar
   * @returns Resultado de la desactivación masiva
   */
  async bulkDeactivateUsers(userIds: number[]): Promise<BulkDeactivateResponse> {
    try {
      if (!userIds || userIds.length === 0) {
        throw new Error('Debe seleccionar al menos un usuario para desactivar')
      }

      const response = await fetch(`${this.baseUrl}/usuarios/bulk/deactivate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userIds
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al desactivar usuarios')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión al desactivar usuarios')
    }
  }

  /**
   * Descarga una plantilla Excel con el formato requerido
   * @returns Blob con el archivo Excel de plantilla
   */
  async downloadTemplate(): Promise<Blob> {
    try {
      // Crear datos de ejemplo para la plantilla
      const templateData = [
        {
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@ejemplo.com',
          tipoDocumento: 'CEDULA',
          numeroDocumento: '1234567890',
          fechaNacimiento: '1990-01-15',
          role: 'estudiante'
        },
        {
          nombre: 'María',
          apellido: 'González',
          email: 'maria.gonzalez@ejemplo.com',
          tipoDocumento: 'CEDULA', 
          numeroDocumento: '0987654321',
          fechaNacimiento: '1985-06-20',
          role: 'profesor'
        }
      ]

      // Crear workbook y worksheet
      const XLSX = await import('xlsx')
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(templateData)

      // Añadir worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios')

      // Generar archivo Excel como array buffer
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })

      // Convertir a Blob
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

    } catch (error: any) {
      throw new Error('Error al generar plantilla: ' + error.message)
    }
  }

  /**
   * Valida si un archivo tiene la extensión correcta
   * @param filename Nombre del archivo
   * @returns true si es un archivo Excel válido
   */
  isValidExcelFile(filename: string): boolean {
    const validExtensions = ['.xlsx', '.xls']
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return validExtensions.includes(extension)
  }

  /**
   * Formatea el tamaño de archivo para mostrar al usuario
   * @param bytes Tamaño en bytes
   * @returns Tamaño formateado (ej: "1.5 MB")
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const bulkUserService = new BulkUserService()
