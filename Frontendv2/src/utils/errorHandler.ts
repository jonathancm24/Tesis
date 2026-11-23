/**
 * Utilidad para formatear y manejar errores de la API
 */

export interface ApiErrorResponse {
  message: string | string[]
  error?: string
  statusCode?: number
}

/**
 * Extrae un mensaje de error legible desde una respuesta de error de Axios
 */
type ErrorLike = {
  response?: { data?: ApiErrorResponse; status?: number }
  request?: unknown
  message?: string
}

const asErrorLike = (error: unknown): ErrorLike =>
  typeof error === 'object' && error !== null ? error as ErrorLike : {}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Error desconocido'
  const errorLike = asErrorLike(error)

  // Si es un error de Axios
  if (errorLike.response) {
    const data = errorLike.response.data ?? { message: '' }

    // Manejo de múltiples mensajes (validación)
    if (Array.isArray(data.message)) {
      return data.message.join(', ')
    }

    // Mensaje único
    if (data.message) {
      return data.message
    }

    // Mensaje genérico según código de estado
    switch (errorLike.response.status) {
      case 400:
        return 'Datos inválidos. Por favor verifica la información.'
      case 401:
        return 'No autorizado. Por favor inicia sesión nuevamente.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'Recurso no encontrado.'
      case 409:
        return 'Conflicto. El recurso ya existe.'
      case 500:
        return 'Error interno del servidor. Intenta más tarde.'
      default:
        return `Error del servidor (${errorLike.response.status})`
    }
  }

  // Error de red
  if (errorLike.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.'
  }

  // Otro tipo de error
  return errorLike.message || 'Error desconocido'
}

/**
 * Valida si un error es por token expirado
 */
export function isUnauthorizedError(error: unknown): boolean {
  return asErrorLike(error).response?.status === 401
}

/**
 * Valida si un error es por falta de permisos
 */
export function isForbiddenError(error: unknown): boolean {
  return asErrorLike(error).response?.status === 403
}

/**
 * Extrae errores de validación específicos por campo
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const errorLike = asErrorLike(error)

  if (errorLike.response?.data?.message && Array.isArray(errorLike.response.data.message)) {
    errorLike.response.data.message.forEach((msg: string) => {
      // Intentar extraer el campo del mensaje
      const match = msg.match(/^(\w+)\s/)
      if (match && match[1]) {
        const field = match[1].toLowerCase()
        if (!errors[field]) errors[field] = []
        errors[field].push(msg)
      } else {
        if (!errors.general) errors.general = []
        errors.general.push(msg)
      }
    })
  }

  return errors
}
