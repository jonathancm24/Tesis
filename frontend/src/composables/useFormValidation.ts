/**
 * Composable para manejo de errores y validaciones en formularios
 */

import { ref, reactive, computed } from 'vue';
import type { AppError } from '@/types/errors';
import { FormValidator, type FieldValidation } from '@/utils/formValidation';
import { processBackendError, getUserFriendlyMessage } from '@/utils/errorHandler';
import { useToast } from '@/composables/useToast';
import { validationService } from '@/services/validationService';

export interface UseFormValidationOptions {
  validationRules?: FieldValidation[];
  showToastOnError?: boolean;
  resetOnSuccess?: boolean;
  // Tiempo de debounce para validaciones asíncronas (en milisegundos)
  asyncDebounceMs?: number;
}

export function useFormValidation(options: UseFormValidationOptions = {}) {
  const { showToastOnError = true, resetOnSuccess = false, asyncDebounceMs = 500 } = options;
  
  // Estados reactivos
  const isSubmitting = ref(false);
  const hasSubmitted = ref(false);
  const fieldErrors = reactive<Record<string, string[]>>({});
  const apiError = ref<AppError | null>(null);
  const validator = new FormValidator();
  const { showToast } = useToast();
  
  // Estados para validación asíncrona
  const asyncValidating = ref<Record<string, boolean>>({});
  const debounceTimers = ref<Record<string, number>>({});

  // Estado computado
  const hasErrors = computed(() => {
    return Object.keys(fieldErrors).some(field => fieldErrors[field].length > 0) || apiError.value !== null;
  });
  
  // Verifica si algún campo está validando de forma asíncrona
  const isValidatingAsync = computed(() => {
    return Object.values(asyncValidating.value).some(validating => validating);
  });

  const isValid = computed(() => {
    return !hasErrors.value;
  });

  /**
   * Valida un formulario completo
   */
  const validateForm = (formData: Record<string, any>, validationRules?: FieldValidation[]): boolean => {
    clearErrors();
    
    const rules = validationRules || options.validationRules || [];
    const errors = validator.validateForm(formData, rules);
    
    // Agrupar errores por campo
    errors.forEach(error => {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error.message);
    });

    hasSubmitted.value = true;
    return errors.length === 0;
  };

  /**
   * Valida un campo individual
   */
  const validateField = (
    fieldName: string, 
    value: any, 
    rules: FieldValidation['rules'], 
    formData?: any
  ): boolean => {
    // Limpiar errores previos del campo
    fieldErrors[fieldName] = [];
    
    const errors = validator.validateField(fieldName, value, rules, formData);
    
    if (errors.length > 0) {
      fieldErrors[fieldName] = errors.map(error => error.message);
      return false;
    }
    
    return true;
  };

  /**
   * Maneja errores del backend
   */
  const handleApiError = (error: any): void => {
    const processedError = processBackendError(error);
    apiError.value = processedError;
    
    // Manejar errores específicos de campos duplicados
    if (processedError.code) {
      switch (processedError.code) {
        case 'CEDULA_ALREADY_EXISTS':
        case 'NUMERO_DOCUMENTO_ALREADY_EXISTS':
        case 'DOCUMENT_ALREADY_EXISTS':
          // Agregar error específico al campo numeroDocumento o cedula
          if (!fieldErrors['numeroDocumento']) {
            fieldErrors['numeroDocumento'] = [];
          }
          if (!fieldErrors['cedula']) {
            fieldErrors['cedula'] = [];
          }
          fieldErrors['numeroDocumento'].push(processedError.message);
          fieldErrors['cedula'].push(processedError.message);
          break;
          
        case 'EMAIL_ALREADY_EXISTS':
          // Agregar error específico al campo email
          if (!fieldErrors['email']) {
            fieldErrors['email'] = [];
          }
          fieldErrors['email'].push(processedError.message);
          break;
      }
    }
    
    if (showToastOnError) {
      const message = getUserFriendlyMessage(processedError);
      showToast(message, 'error');
    }

    // Si el error incluye errores de validación específicos por campo del backend
    if (error.response?.data?.details?.fieldErrors) {
      const backendFieldErrors = error.response.data.details.fieldErrors;
      Object.keys(backendFieldErrors).forEach(field => {
        fieldErrors[field] = Array.isArray(backendFieldErrors[field]) 
          ? backendFieldErrors[field] 
          : [backendFieldErrors[field]];
      });
    }
    
    // Buscar errores de validación en el mensaje del backend
    if (error.response?.data?.message) {
      const messages = Array.isArray(error.response.data.message) 
        ? error.response.data.message 
        : [error.response.data.message];
        
      messages.forEach((msg: string) => {
        // Detectar errores específicos de campos en el mensaje
        if (typeof msg === 'string') {
          if (msg.toLowerCase().includes('cedula') || msg.toLowerCase().includes('numero')) {
            if (!fieldErrors['numeroDocumento']) {
              fieldErrors['numeroDocumento'] = [];
            }
            fieldErrors['numeroDocumento'].push(getUserFriendlyMessage(processedError));
          }
          if (msg.toLowerCase().includes('email')) {
            if (!fieldErrors['email']) {
              fieldErrors['email'] = [];
            }
            fieldErrors['email'].push(getUserFriendlyMessage(processedError));
          }
        }
      });
    }
  };

  /**
   * Obtiene errores de un campo específico
   */
  const getFieldErrors = (fieldName: string): string[] => {
    return fieldErrors[fieldName] || [];
  };

  /**
   * Verifica si un campo tiene errores
   */
  const hasFieldError = (fieldName: string): boolean => {
    return (fieldErrors[fieldName]?.length || 0) > 0;
  };

  /**
   * Obtiene el primer error de un campo
   */
  const getFirstFieldError = (fieldName: string): string | null => {
    const errors = getFieldErrors(fieldName);
    return errors.length > 0 ? errors[0] : null;
  };

  /**
   * Limpia todos los errores
   */
  const clearErrors = (): void => {
    Object.keys(fieldErrors).forEach(field => {
      fieldErrors[field] = [];
    });
    apiError.value = null;
  };

  /**
   * Limpia errores de un campo específico
   */
  const clearFieldError = (fieldName: string): void => {
    fieldErrors[fieldName] = [];
  };

  /**
   * Resetea el estado del formulario
   */
  const resetForm = (): void => {
    clearErrors();
    hasSubmitted.value = false;
    isSubmitting.value = false;
  };

  /**
   * Maneja el envío del formulario con validación
   */
  const handleSubmit = async <T>(
    formData: Record<string, any>,
    submitFunction: () => Promise<T>,
    validationRules?: FieldValidation[]
  ): Promise<T | null> => {
    if (isSubmitting.value) return null;

    try {
      isSubmitting.value = true;
      
      // Validar formulario
      if (!validateForm(formData, validationRules)) {
        if (showToastOnError) {
          showToast('Por favor, corrija los errores en el formulario', 'warning');
        }
        return null;
      }

      // Ejecutar función de envío
      const result = await submitFunction();
      
      // Éxito
      if (resetOnSuccess) {
        resetForm();
      }
      
      return result;
      
    } catch (error) {
      handleApiError(error);
      return null;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Valida en tiempo real mientras el usuario escribe
   */
  const validateOnInput = (
    fieldName: string,
    value: any,
    rules: FieldValidation['rules'],
    formData?: any,
    debounceMs: number = 300
  ): void => {
    // Solo validar después de que el usuario haya intentado enviar el formulario
    if (!hasSubmitted.value) return;

    // Debounce para evitar validación excesiva
    setTimeout(() => {
      validateField(fieldName, value, rules, formData);
    }, debounceMs);
  };

  /**
   * Obtiene la clase CSS para un campo basado en su estado de validación
   */
  const getFieldClass = (fieldName: string, baseClass: string = 'form-control'): string => {
    if (!hasSubmitted.value) return baseClass;
    
    if (hasFieldError(fieldName)) {
      return `${baseClass} is-invalid`;
    } else if (fieldErrors[fieldName] !== undefined) {
      return `${baseClass} is-valid`;
    }
    
    return baseClass;
  };

  /**
   * Retorna un objeto con todas las propiedades necesarias para el template
   */
  const getFieldProps = (fieldName: string) => {
    return {
      errors: getFieldErrors(fieldName),
      hasError: hasFieldError(fieldName),
      firstError: getFirstFieldError(fieldName),
      class: getFieldClass(fieldName),
      'aria-invalid': hasFieldError(fieldName),
      'aria-describedby': hasFieldError(fieldName) ? `${fieldName}-error` : undefined
    };
  };

  /**
   * Valida un campo de forma asíncrona con debounce
   */
  const validateFieldAsync = async (
    fieldName: string,
    value: any,
    rules: FieldValidation['rules'],
    formData?: any
  ): Promise<void> => {
    // Limpiar timer anterior
    if (debounceTimers.value[fieldName]) {
      clearTimeout(debounceTimers.value[fieldName]);
    }

    // Configurar nuevo timer con debounce
    debounceTimers.value[fieldName] = setTimeout(async () => {
      try {
        asyncValidating.value[fieldName] = true;
        
        // Primero hacer validación síncrona
        const syncErrors = validator.validateField(fieldName, value, rules, formData);
        fieldErrors[fieldName] = syncErrors.map(error => error.message);
        
        // Si no hay errores síncronos, proceder con validación asíncrona
        if (syncErrors.length === 0) {
          const asyncErrors = await validator.validateFieldAsync(fieldName, value, rules, formData);
          fieldErrors[fieldName] = [...syncErrors, ...asyncErrors].map(error => error.message);
        }
        
      } catch (error) {
        console.error(`Error validating field ${fieldName}:`, error);
        fieldErrors[fieldName] = ['Error de validación'];
      } finally {
        asyncValidating.value[fieldName] = false;
      }
    }, asyncDebounceMs);
  };

  /**
   * Valida documentos únicos de forma asíncrona
   */
  const validateUniqueDocument = async (
    fieldName: string,
    numeroDocumento: string,
    tipoDocumento: string = 'CEDULA',
    excludeId?: number
  ): Promise<void> => {
    if (!numeroDocumento || numeroDocumento.trim() === '') {
      clearFieldError(fieldName);
      return;
    }

    try {
      asyncValidating.value[fieldName] = true;
      
      const exists = await validationService.checkDocumentExists(
        numeroDocumento.trim(),
        tipoDocumento,
        excludeId
      );
      
      if (exists) {
        fieldErrors[fieldName] = [`Ya existe un paciente registrado con este ${tipoDocumento.toLowerCase()}`];
      } else {
        clearFieldError(fieldName);
      }
      
    } catch (error) {
      console.error(`Error validating unique document:`, error);
      // No mostrar error de red al usuario en validación asíncrona
      clearFieldError(fieldName);
    } finally {
      asyncValidating.value[fieldName] = false;
    }
  };

  /**
   * Helper para validar cédula única
   */
  const validateUniqueCedula = (fieldName: string, cedula: string, excludeId?: number) => {
    return validateUniqueDocument(fieldName, cedula, 'CEDULA', excludeId);
  };

  return {
    // Estados
    isSubmitting,
    hasSubmitted,
    fieldErrors,
    apiError,
    hasErrors,
    isValid,
    asyncValidating,
    isValidatingAsync,

    // Métodos de validación
    validateForm,
    validateField,
    validateOnInput,
    validateFieldAsync,
    validateUniqueDocument,
    validateUniqueCedula,

    // Manejo de errores
    handleApiError,
    getFieldErrors,
    hasFieldError,
    getFirstFieldError,
    clearErrors,
    clearFieldError,

    // Utilidades
    resetForm,
    handleSubmit,
    getFieldClass,
    getFieldProps
  };
}
