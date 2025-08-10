/**
 * Utilidades para manejo de errores de la aplicación
 */

import type { 
  AppError, 
  BackendErrorResponse, 
  ValidationError,
  DomainError
} from '@/types/errors';
import { HttpErrorType } from '@/types/errors';

/**
 * Mapeo de errores específicos del backend a mensajes amigables
 */
export const ERROR_MESSAGES: Record<string, DomainError> = {
  // Errores de autenticación
  'INVALID_CREDENTIALS': {
    code: 'INVALID_CREDENTIALS',
    message: 'Credenciales inválidas',
    userMessage: 'El email o contraseña son incorrectos. Por favor, verifique sus datos.'
  },
  'USER_NOT_FOUND': {
    code: 'USER_NOT_FOUND',
    message: 'Usuario no encontrado',
    userMessage: 'No se encontró un usuario con estos datos. Verifique su información.'
  },
  'UNAUTHORIZED': {
    code: 'UNAUTHORIZED',
    message: 'No autorizado',
    userMessage: 'No tiene permisos para realizar esta acción.'
  },
  'TOKEN_EXPIRED': {
    code: 'TOKEN_EXPIRED',
    message: 'Token expirado',
    userMessage: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
  },

  // Errores de usuario
  'EMAIL_ALREADY_EXISTS': {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'Email ya existe',
    userMessage: 'Ya existe un usuario registrado con este email.'
  },
  'CEDULA_ALREADY_EXISTS': {
    code: 'CEDULA_ALREADY_EXISTS',
    message: 'Cédula ya existe',
    userMessage: 'Ya existe un usuario registrado con esta cédula.'
  },
  'INVALID_USER_ROLE': {
    code: 'INVALID_USER_ROLE',
    message: 'Rol de usuario inválido',
    userMessage: 'El rol de usuario especificado no es válido.'
  },

  // Errores de pacientes
  'PATIENT_NOT_FOUND': {
    code: 'PATIENT_NOT_FOUND',
    message: 'Paciente no encontrado',
    userMessage: 'No se encontró el paciente solicitado. Verifique los datos.'
  },
  'PATIENT_ALREADY_ASSIGNED': {
    code: 'PATIENT_ALREADY_ASSIGNED',
    message: 'Paciente ya asignado',
    userMessage: 'Este paciente ya tiene un estudiante asignado.'
  },
  'INVALID_PATIENT_DATA': {
    code: 'INVALID_PATIENT_DATA',
    message: 'Datos de paciente inválidos',
    userMessage: 'Los datos del paciente contienen errores. Por favor, verifique la información.'
  },

  // Errores de encuestas
  'SURVEY_ALREADY_EXISTS': {
    code: 'SURVEY_ALREADY_EXISTS',
    message: 'Encuesta ya existe',
    userMessage: 'Este paciente ya tiene una encuesta de tamizaje completada.'
  },
  'INVALID_SURVEY_DATA': {
    code: 'INVALID_SURVEY_DATA',
    message: 'Datos de encuesta inválidos',
    userMessage: 'Los datos de la encuesta contienen errores. Complete todos los campos obligatorios.'
  },
  'QUESTION_NOT_FOUND': {
    code: 'QUESTION_NOT_FOUND',
    message: 'Pregunta no encontrada',
    userMessage: 'No se encontró la pregunta especificada.'
  },

  // Errores de casos clínicos
  'CASE_NOT_FOUND': {
    code: 'CASE_NOT_FOUND',
    message: 'Caso clínico no encontrado',
    userMessage: 'No se encontró el caso clínico solicitado.'
  },
  'CASE_ALREADY_SUBMITTED': {
    code: 'CASE_ALREADY_SUBMITTED',
    message: 'Caso ya enviado',
    userMessage: 'Este caso clínico ya ha sido enviado y no puede modificarse.'
  },
  'INVALID_CASE_STATUS': {
    code: 'INVALID_CASE_STATUS',
    message: 'Estado de caso inválido',
    userMessage: 'El estado del caso clínico no es válido para esta operación.'
  },

  // Errores de geografía
  'LOCATION_NOT_FOUND': {
    code: 'LOCATION_NOT_FOUND',
    message: 'Ubicación no encontrada',
    userMessage: 'No se encontró la ubicación especificada.'
  },
  'INVALID_GEOGRAPHIC_DATA': {
    code: 'INVALID_GEOGRAPHIC_DATA',
    message: 'Datos geográficos inválidos',
    userMessage: 'Los datos de ubicación son incorrectos. Seleccione una ubicación válida.'
  },

  // Errores de citas
  'APPOINTMENT_CONFLICT': {
    code: 'APPOINTMENT_CONFLICT',
    message: 'Conflicto de cita',
    userMessage: 'Ya existe una cita programada en este horario.'
  },
  'INVALID_APPOINTMENT_TIME': {
    code: 'INVALID_APPOINTMENT_TIME',
    message: 'Hora de cita inválida',
    userMessage: 'La hora seleccionada no está disponible o es inválida.'
  },

  // Errores generales
  'VALIDATION_FAILED': {
    code: 'VALIDATION_FAILED',
    message: 'Validación fallida',
    userMessage: 'Los datos proporcionados no son válidos. Verifique la información ingresada.'
  },
  'INTERNAL_SERVER_ERROR': {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
    userMessage: 'Ocurrió un error interno. Por favor, intente nuevamente o contacte al administrador.'
  },
  'NETWORK_ERROR': {
    code: 'NETWORK_ERROR',
    message: 'Error de red',
    userMessage: 'Error de conexión. Verifique su conexión a internet e intente nuevamente.'
  }
};

/**
 * Procesa errores del backend y los convierte a un formato estándar
 */
export const processBackendError = (error: any): AppError => {
  // Si es un error de red
  if (!error.response) {
    return {
      type: 'network',
      message: 'Error de conexión. Verifique su conexión a internet.',
      code: 'NETWORK_ERROR'
    };
  }

  const status = error.response?.status;
  const data: BackendErrorResponse = error.response?.data;

  // Convertir mensaje del backend a array si es string
  const messages = Array.isArray(data?.message) ? data.message : [data?.message || 'Error desconocido'];
  
  // Intentar extraer código de error del primer mensaje
  const firstMessage = messages[0];
  const errorCode = extractErrorCode(firstMessage);
  
  // Buscar mensaje amigable
  const domainError = ERROR_MESSAGES[errorCode];
  
  const appError: AppError = {
    type: getErrorType(status),
    message: domainError?.userMessage || firstMessage || 'Error desconocido',
    code: errorCode,
    details: {
      originalMessages: messages,
      statusCode: status,
      timestamp: new Date().toISOString()
    }
  };

  return appError;
};

/**
 * Extrae el código de error de un mensaje
 */
const extractErrorCode = (message: string): string => {
  // Buscar patrones comunes de códigos de error
  const patterns = [
    /Error: ([A-Z_]+)/,
    /([A-Z_]+):/,
    /code: ([A-Z_]+)/i,
    /\[([A-Z_]+)\]/
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // Si no se encuentra patrón, buscar en el mensaje completo
  for (const code of Object.keys(ERROR_MESSAGES)) {
    if (message.toUpperCase().includes(code)) {
      return code;
    }
  }

  return 'UNKNOWN_ERROR';
};

/**
 * Determina el tipo de error basado en el código HTTP
 */
const getErrorType = (statusCode: number): AppError['type'] => {
  switch (statusCode) {
    case HttpErrorType.BAD_REQUEST:
    case HttpErrorType.UNPROCESSABLE_ENTITY:
      return 'validation';
    case HttpErrorType.UNAUTHORIZED:
      return 'auth';
    case HttpErrorType.FORBIDDEN:
      return 'permission';
    case HttpErrorType.NOT_FOUND:
      return 'api';
    case HttpErrorType.CONFLICT:
      return 'business';
    default:
      return 'api';
  }
};

/**
 * Formatea errores de validación para mostrar al usuario
 */
export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach(error => {
    formattedErrors[error.field] = error.message;
  });
  
  return formattedErrors;
};

/**
 * Crea un error de validación
 */
export const createValidationError = (field: string, message: string, value?: any): ValidationError => {
  return {
    field,
    message,
    value
  };
};

/**
 * Verifica si un error es de un tipo específico
 */
export const isErrorType = (error: AppError, type: AppError['type']): boolean => {
  return error.type === type;
};

/**
 * Obtiene mensaje de error amigable para mostrar al usuario
 */
export const getUserFriendlyMessage = (error: AppError): string => {
  const domainError = ERROR_MESSAGES[error.code || ''];
  return domainError?.userMessage || error.message || 'Ocurrió un error inesperado';
};

/**
 * Maneja errores de forma global y muestra notificaciones
 */
export const handleGlobalError = (error: any, showToast: (message: string, type: 'error' | 'warning' | 'success') => void) => {
  const appError = processBackendError(error);
  const message = getUserFriendlyMessage(appError);
  
  // Mostrar notificación según el tipo de error
  if (appError.type === 'auth') {
    showToast(message, 'warning');
    // Redirigir al login si es necesario
    if (appError.code === 'TOKEN_EXPIRED') {
      // Lógica para redirigir al login
      window.location.href = '/login';
    }
  } else if (appError.type === 'validation') {
    showToast(message, 'warning');
  } else {
    showToast(message, 'error');
  }
  
  // Log del error para debugging
  console.error('Error procesado:', appError);
  
  return appError;
};
