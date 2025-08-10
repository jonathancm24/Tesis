/**
 * Servicio para validaciones asíncronas
 */

import api from '@/config/api';

export interface ValidationService {
  checkDocumentExists(numeroDocumento: string, tipoDocumento?: string, excludeId?: number): Promise<boolean>;
  checkEmailExists(email: string, excludeId?: number): Promise<boolean>;
  checkCedulaExists(cedula: string, excludeId?: number): Promise<boolean>;
}

class AsyncValidationService implements ValidationService {
  
  /**
   * Verifica si un número de documento ya existe
   */
  async checkDocumentExists(
    numeroDocumento: string, 
    tipoDocumento: string = 'CEDULA', 
    excludeId?: number
  ): Promise<boolean> {
    try {
      if (!numeroDocumento || numeroDocumento.trim() === '') {
        return false;
      }

      const params: any = {
        numeroDocumento: numeroDocumento.trim(),
        tipoDocumento
      };

      if (excludeId) {
        params.excludeId = excludeId;
      }

      await api.get('/pacientes/validate/document', { params });
      
      // Si la respuesta es exitosa, significa que el documento NO existe (está disponible)
      return false;
      
    } catch (error: any) {
      // Si hay error 409 (Conflict), significa que el documento YA existe
      if (error.response?.status === 409) {
        return true;
      }
      
      // Para otros errores, no bloquear la validación
      console.warn('Error validating document:', error);
      return false;
    }
  }

  /**
   * Verifica si un email ya existe
   */
  async checkEmailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      if (!email || email.trim() === '') {
        return false;
      }

      const params: any = {
        email: email.trim()
      };

      if (excludeId) {
        params.excludeId = excludeId;
      }

      await api.get('/usuarios/validate/email', { params });
      
      // Si la respuesta es exitosa, significa que el email NO existe
      return false;
      
    } catch (error: any) {
      // Si hay error 409 (Conflict), significa que el email YA existe
      if (error.response?.status === 409) {
        return true;
      }
      
      // Para otros errores, no bloquear la validación
      console.warn('Error validating email:', error);
      return false;
    }
  }

  /**
   * Verifica si una cédula ya existe (alias para checkDocumentExists con tipo CEDULA)
   */
  async checkCedulaExists(cedula: string, excludeId?: number): Promise<boolean> {
    return this.checkDocumentExists(cedula, 'CEDULA', excludeId);
  }
}

// Instancia singleton del servicio
export const validationService = new AsyncValidationService();

/**
 * Función helper para crear reglas de validación asíncrona
 */
export const createAsyncValidationRules = {
  
  /**
   * Regla para validar que un documento no esté duplicado
   */
  uniqueDocument: (tipoDocumento: string = 'CEDULA', excludeId?: number) => ({
    type: 'async' as const,
    message: `Ya existe un paciente registrado con este ${tipoDocumento.toLowerCase()}`,
    asyncValidator: async (value: string) => {
      if (!value) return true; // No validar si está vacío (eso lo hace 'required')
      const exists = await validationService.checkDocumentExists(value, tipoDocumento, excludeId);
      return !exists; // Retorna true si NO existe (es válido)
    }
  }),

  /**
   * Regla para validar que un email no esté duplicado
   */
  uniqueEmail: (excludeId?: number) => ({
    type: 'async' as const,
    message: 'Ya existe un usuario registrado con este email',
    asyncValidator: async (value: string) => {
      if (!value) return true; // No validar si está vacío
      const exists = await validationService.checkEmailExists(value, excludeId);
      return !exists; // Retorna true si NO existe (es válido)
    }
  }),

  /**
   * Regla para validar que una cédula no esté duplicada
   */
  uniqueCedula: (excludeId?: number) => ({
    type: 'async' as const,
    message: 'Ya existe un paciente registrado con esta cédula',
    asyncValidator: async (value: string) => {
      if (!value) return true; // No validar si está vacío
      const exists = await validationService.checkCedulaExists(value, excludeId);
      return !exists; // Retorna true si NO existe (es válido)
    }
  })
};

/**
 * Hook para usar validación asíncrona en componentes
 */
export const useAsyncValidation = () => {
  const validateUnique = async (
    value: string, 
    type: 'document' | 'email' | 'cedula',
    options: { tipoDocumento?: string; excludeId?: number } = {}
  ): Promise<boolean> => {
    
    switch (type) {
      case 'document':
        return !(await validationService.checkDocumentExists(
          value, 
          options.tipoDocumento || 'CEDULA', 
          options.excludeId
        ));
        
      case 'email':
        return !(await validationService.checkEmailExists(value, options.excludeId));
        
      case 'cedula':
        return !(await validationService.checkCedulaExists(value, options.excludeId));
        
      default:
        return true;
    }
  };

  return {
    validateUnique,
    validationService
  };
};
