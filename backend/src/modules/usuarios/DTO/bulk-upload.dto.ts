import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la respuesta de validación de archivo Excel
 * Contiene información sobre los usuarios válidos, inválidos y duplicados
 */
export class ExcelValidationResponseDto {
  /**
   * Lista de usuarios válidos que se pueden procesar
   */
  validUsers: any[];

  /**
   * Lista de usuarios con errores de validación
   */
  invalidUsers: {
    row: number;
    data: any;
    errors: string[];
  }[];

  /**
   * Lista de usuarios que ya existen en el sistema
   */
  duplicateUsers: {
    row: number;
    data: any;
    existingUser: any;
  }[];

  /**
   * Resumen de la validación
   */
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
  };

  /**
   * Indica si hay errores que impiden el procesamiento
   */
  hasErrors: boolean;
}

/**
 * DTO para la respuesta de procesamiento de usuarios masivo
 */
export class BulkProcessResponseDto {
  /**
   * Usuarios creados exitosamente
   */
  created: any[];

  /**
   * Usuarios actualizados (reactivados)
   */
  updated: any[];

  /**
   * Usuarios que fallaron al procesar
   */
  failed: {
    data: any;
    error: string;
  }[];

  /**
   * Resumen del procesamiento
   */
  summary: {
    totalProcessed: number;
    successfullyCreated: number;
    successfullyUpdated: number;
    failed: number;
  };
}

/**
 * DTO para desactivación masiva de usuarios
 */
export class BulkDeactivateDto {
  @IsArray()
  @IsNotEmpty({ message: 'La lista de IDs de usuarios no puede estar vacía' })
  userIds: number[];
}

/**
 * DTO para la respuesta de desactivación masiva
 */
export class BulkDeactivateResponseDto {
  /**
   * Usuarios desactivados exitosamente
   */
  deactivated: any[];

  /**
   * Usuarios que fallaron al desactivar
   */
  failed: {
    id: number;
    error: string;
  }[];

  /**
   * Resumen de la desactivación
   */
  summary: {
    totalRequested: number;
    successfullyDeactivated: number;
    failed: number;
  };
}
