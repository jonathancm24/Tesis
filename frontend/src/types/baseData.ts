/**
 * Tipos de datos para la gestión de datos base del sistema
 * Incluye especialidades médicas y ubicaciones geográficas
 * Archivo: src/types/baseData.ts
 */

// ==========================================
// ESPECIALIDADES MÉDICAS
// ==========================================

/**
 * Interfaz para una especialidad médica
 */
export interface Especialidad {
  id: number
  nombre: string
  descripcion?: string
}

/**
 * DTO para crear una nueva especialidad
 */
export interface CreateEspecialidadDTO {
  nombre: string
  descripcion?: string
}

/**
 * DTO para actualizar una especialidad existente
 */
export interface UpdateEspecialidadDTO {
  nombre?: string
  descripcion?: string
}

// ==========================================
// UBICACIONES GEOGRÁFICAS
// ==========================================

/**
 * Interfaz para un país
 */
export interface Pais {
  id: number
  nombre: string
}

/**
 * DTO para crear un nuevo país
 */
export interface CreatePaisDTO {
  nombre: string
}

/**
 * Interfaz para una provincia
 */
export interface Provincia {
  id: number
  nombre: string
  paisId: number
  pais?: Pais // Relación opcional para mostrar datos del país
}

/**
 * DTO para crear una nueva provincia
 */
export interface CreateProvinciaDTO {
  nombre: string
  paisId: number
}

/**
 * Interfaz para un cantón
 */
export interface Canton {
  id: number
  nombre: string
  provinciaId: number
  provincia?: Provincia // Relación opcional para mostrar datos de la provincia
}

/**
 * DTO para crear un nuevo cantón
 */
export interface CreateCantonDTO {
  nombre: string
  provinciaId: number
}

/**
 * Interfaz para una parroquia
 */
export interface Parroquia {
  id: number
  nombre: string
  cantonId: number
  canton?: Canton // Relación opcional para mostrar datos del cantón
}

/**
 * DTO para crear una nueva parroquia
 */
export interface CreateParroquiaDTO {
  nombre: string
  cantonId: number
}

// ==========================================
// TIPOS DE RESPUESTA DE API
// ==========================================

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Respuesta paginada de la API
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==========================================
// TIPOS PARA FORMULARIOS
// ==========================================

/**
 * Estado de carga para formularios
 */
export interface FormState {
  loading: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

/**
 * Opciones para selects dependientes
 */
export interface SelectOption {
  value: number | string
  label: string
  disabled?: boolean
}

/**
 * Estructura jerárquica para ubicaciones
 */
export interface UbicacionHierarchy {
  pais: Pais
  provincias: Provincia[]
  cantones: Canton[]
  parroquias: Parroquia[]
}

// ==========================================
// TIPOS DE VALIDACIÓN
// ==========================================

/**
 * Reglas de validación para campos
 */
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

/**
 * Esquema de validación para formularios
 */
export interface ValidationSchema {
  [fieldName: string]: ValidationRule
}

// ==========================================
// TIPOS DE EVENTOS
// ==========================================

/**
 * Eventos emitidos por componentes de formulario
 */
export interface FormEvents {
  submit: (data: any) => void
  cancel: () => void
  reset: () => void
  fieldChange: (field: string, value: any) => void
}

/**
 * Eventos para gestión de datos base
 */
export interface BaseDataEvents {
  refresh: () => void
  create: (data: any) => void
  update: (id: number, data: any) => void
  delete: (id: number) => void
}
