/**
 * Utilidades para validación de formularios
 */

import type { ValidationError, ErrorMessages } from '@/types/errors';

/**
 * Mensajes de error predeterminados en español
 */
export const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  required: 'Este campo es obligatorio',
  email: 'Ingrese un email válido',
  minLength: 'Debe tener al menos {min} caracteres',
  maxLength: 'No puede tener más de {max} caracteres',
  pattern: 'El formato ingresado no es válido',
  numeric: 'Debe ser un número válido',
  date: 'Ingrese una fecha válida',
  phone: 'Ingrese un número de teléfono válido',
  cedula: 'Ingrese una cédula válida',
  custom: {
    passwordMatch: 'Las contraseñas no coinciden',
    ageRange: 'La edad debe estar entre {min} y {max} años',
    futureDate: 'La fecha no puede ser en el futuro',
    pastDate: 'La fecha no puede ser en el pasado',
    fileSize: 'El archivo no puede ser mayor a {size}MB',
    fileType: 'Tipo de archivo no permitido'
  }
};

/**
 * Reglas de validación
 */
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'numeric' | 'date' | 'phone' | 'cedula' | 'custom' | 'async';
  value?: any;
  message?: string;
  validator?: (value: any, formData?: any) => boolean;
  asyncValidator?: (value: any, formData?: any) => Promise<boolean>;
}

export interface FieldValidation {
  field: string;
  rules: ValidationRule[];
}

/**
 * Clase para validar formularios
 */
export class FormValidator {
  private errors: ValidationError[] = [];
  private messages: ErrorMessages;

  constructor(customMessages?: Partial<ErrorMessages>) {
    this.messages = { ...DEFAULT_ERROR_MESSAGES, ...customMessages };
  }

  /**
   * Valida un formulario completo
   */
  validateForm(formData: Record<string, any>, validationRules: FieldValidation[]): ValidationError[] {
    this.errors = [];

    validationRules.forEach(fieldValidation => {
      const fieldErrors = this.validateField(
        fieldValidation.field,
        formData[fieldValidation.field],
        fieldValidation.rules,
        formData
      );
      this.errors.push(...fieldErrors);
    });

    return this.errors;
  }

  /**
   * Valida un campo individual
   */
  validateField(fieldName: string, value: any, rules: ValidationRule[], formData?: any): ValidationError[] {
    const fieldErrors: ValidationError[] = [];

    rules.forEach(rule => {
      const error = this.applyRule(fieldName, value, rule, formData);
      if (error) {
        fieldErrors.push(error);
      }
    });

    return fieldErrors;
  }

  /**
   * Valida un campo individual (ahora soporta async)
   */
  async validateFieldAsync(fieldName: string, value: any, rules: ValidationRule[], formData?: any): Promise<ValidationError[]> {
    const fieldErrors: ValidationError[] = [];

    for (const rule of rules) {
      const error = await this.applyRuleAsync(fieldName, value, rule, formData);
      if (error) {
        fieldErrors.push(error);
      }
    }

    return fieldErrors;
  }

  /**
   * Aplica una regla de validación (versión async)
   */
  private async applyRuleAsync(fieldName: string, value: any, rule: ValidationRule, formData?: any): Promise<ValidationError | null> {
    if (rule.type === 'async' && rule.asyncValidator) {
      const isValid = await rule.asyncValidator(value, formData);
      if (!isValid) {
        return {
          field: fieldName,
          message: rule.message || 'Validación asíncrona falló',
          value
        };
      }
      return null;
    }
    
    // Para reglas síncronas, usar el método existente
    return this.applyRule(fieldName, value, rule, formData);
  }

  /**
   * Aplica una regla de validación
   */
  private applyRule(fieldName: string, value: any, rule: ValidationRule, formData?: any): ValidationError | null {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(fieldName, value, rule.message);
      
      case 'email':
        return this.validateEmail(fieldName, value, rule.message);
      
      case 'minLength':
        return this.validateMinLength(fieldName, value, rule.value, rule.message);
      
      case 'maxLength':
        return this.validateMaxLength(fieldName, value, rule.value, rule.message);
      
      case 'pattern':
        return this.validatePattern(fieldName, value, rule.value, rule.message);
      
      case 'numeric':
        return this.validateNumeric(fieldName, value, rule.message);
      
      case 'date':
        return this.validateDate(fieldName, value, rule.message);
      
      case 'phone':
        return this.validatePhone(fieldName, value, rule.message);
      
      case 'cedula':
        return this.validateCedula(fieldName, value, rule.message);
      
      case 'custom':
        return this.validateCustom(fieldName, value, rule, formData);
      
      default:
        return null;
    }
  }

  /**
   * Validaciones específicas
   */
  private validateRequired(fieldName: string, value: any, customMessage?: string): ValidationError | null {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return {
        field: fieldName,
        message: customMessage || this.messages.required,
        value
      };
    }
    return null;
  }

  private validateEmail(fieldName: string, value: any, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          field: fieldName,
          message: customMessage || this.messages.email,
          value
        };
      }
    }
    return null;
  }

  private validateMinLength(fieldName: string, value: any, minLength: number, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string' && value.length < minLength) {
      return {
        field: fieldName,
        message: customMessage || this.messages.minLength.replace('{min}', minLength.toString()),
        value
      };
    }
    return null;
  }

  private validateMaxLength(fieldName: string, value: any, maxLength: number, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string' && value.length > maxLength) {
      return {
        field: fieldName,
        message: customMessage || this.messages.maxLength.replace('{max}', maxLength.toString()),
        value
      };
    }
    return null;
  }

  private validatePattern(fieldName: string, value: any, pattern: RegExp, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string' && !pattern.test(value)) {
      return {
        field: fieldName,
        message: customMessage || this.messages.pattern,
        value
      };
    }
    return null;
  }

  private validateNumeric(fieldName: string, value: any, customMessage?: string): ValidationError | null {
    if (value !== null && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return {
          field: fieldName,
          message: customMessage || this.messages.numeric,
          value
        };
      }
    }
    return null;
  }

  private validateDate(fieldName: string, value: any, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          field: fieldName,
          message: customMessage || this.messages.date,
          value
        };
      }
    }
    return null;
  }

  private validatePhone(fieldName: string, value: any, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string') {
      // Regex para teléfonos ecuatorianos (móviles y fijos)
      const phoneRegex = /^(\+593|0)[0-9]{8,9}$/;
      if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
        return {
          field: fieldName,
          message: customMessage || this.messages.phone,
          value
        };
      }
    }
    return null;
  }

  private validateCedula(fieldName: string, value: any, customMessage?: string): ValidationError | null {
    if (value && typeof value === 'string') {
      const cedula = value.replace(/\D/g, '');
      if (!this.isValidEcuadorianCedula(cedula)) {
        return {
          field: fieldName,
          message: customMessage || this.messages.cedula,
          value
        };
      }
    }
    return null;
  }

  private validateCustom(fieldName: string, value: any, rule: ValidationRule, formData?: any): ValidationError | null {
    if (rule.validator && !rule.validator(value, formData)) {
      return {
        field: fieldName,
        message: rule.message || this.messages.pattern,
        value
      };
    }
    return null;
  }

  /**
   * Valida cédula ecuatoriana
   */
  private isValidEcuadorianCedula(cedula: string): boolean {
    if (cedula.length !== 10) return false;
    
    const digits = cedula.split('').map(Number);
    const provinceCode = parseInt(cedula.substring(0, 2));
    
    // Verificar código de provincia válido
    if (provinceCode < 1 || provinceCode > 24) return false;
    
    // Algoritmo de validación de cédula ecuatoriana
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      let product = digits[i] * coefficients[i];
      if (product >= 10) product -= 9;
      sum += product;
    }
    
    const checkDigit = (Math.ceil(sum / 10) * 10) - sum;
    return checkDigit === digits[9];
  }

  /**
   * Obtiene errores para un campo específico
   */
  getFieldErrors(fieldName: string): string[] {
    return this.errors
      .filter(error => error.field === fieldName)
      .map(error => error.message);
  }

  /**
   * Verifica si hay errores
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Obtiene todos los errores
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * Limpia errores
   */
  clearErrors(): void {
    this.errors = [];
  }
}

/**
 * Funciones de utilidad para validaciones comunes
 */

/**
 * Validaciones para formularios de usuario
 */
export const getUserValidationRules = (): FieldValidation[] => [
  {
    field: 'nombre',
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 2 },
      { type: 'maxLength', value: 50 }
    ]
  },
  {
    field: 'apellido',
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 2 },
      { type: 'maxLength', value: 50 }
    ]
  },
  {
    field: 'email',
    rules: [
      { type: 'required' },
      { type: 'email' }
    ]
  },
  {
    field: 'cedula',
    rules: [
      { type: 'required' },
      { type: 'cedula' }
    ]
  },
  {
    field: 'telefono',
    rules: [
      { type: 'phone' }
    ]
  }
];

/**
 * Validaciones para formularios de paciente
 */
export const getPatientValidationRules = (): FieldValidation[] => [
  {
    field: 'nombre',
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 2 },
      { type: 'maxLength', value: 50 }
    ]
  },
  {
    field: 'apellido',
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 2 },
      { type: 'maxLength', value: 50 }
    ]
  },
  {
    field: 'numeroDocumento',
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 6 },
      { type: 'maxLength', value: 15 }
    ]
  },
  {
    field: 'fechaNacimiento',
    rules: [
      { type: 'required' },
      { type: 'date' }
    ]
  },
  {
    field: 'genero',
    rules: [
      { type: 'required' }
    ]
  },
  {
    field: 'telefono',
    rules: [
      { type: 'phone' }
    ]
  },
  {
    field: 'email',
    rules: [
      { type: 'email' }
    ]
  }
];

/**
 * Validaciones para login
 */
export const getLoginValidationRules = (): FieldValidation[] => [
  {
    field: 'email',
    rules: [
      { type: 'required' },
      { type: 'email' }
    ]
  },
  {
    field: 'password',
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 6 }
    ]
  }
];
