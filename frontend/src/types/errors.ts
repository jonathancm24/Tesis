/**
 * Tipos para manejo de errores en la aplicación
 */

// Tipos de errores que puede devolver el backend
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

// Error personalizado para la aplicación
export interface AppError {
  type: 'validation' | 'api' | 'network' | 'auth' | 'permission' | 'business';
  message: string;
  field?: string;
  code?: string;
  details?: Record<string, any>;
}

// Errores de validación de formularios
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Respuesta de error del backend
export interface BackendErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

// Estados de error para componentes
export interface ErrorState {
  hasError: boolean;
  errors: ValidationError[];
  apiError: ApiError | null;
  loading: boolean;
}

// Tipos de errores HTTP comunes
export const HttpErrorType = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export type HttpErrorTypeKey = keyof typeof HttpErrorType;

// Mapeo de errores específicos del dominio
export interface DomainError {
  code: string;
  message: string;
  userMessage: string;
}

// Configuración de mensajes de error
export interface ErrorMessages {
  required: string;
  email: string;
  minLength: string;
  maxLength: string;
  pattern: string;
  numeric: string;
  date: string;
  phone: string;
  cedula: string;
  custom: Record<string, string>;
}
