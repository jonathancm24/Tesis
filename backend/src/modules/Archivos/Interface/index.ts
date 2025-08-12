/**
 * Interfaces TypeScript para el módulo de Archivos
 * 
 * Define las estructuras de datos para el sistema de archivos polimórfico
 * que permite asociar archivos (estudios, radiografías, documentos, etc.)
 * a cualquier entidad del sistema académico odontológico.
 * 
 * El sistema permite:
 * - Gestión polimórfica de archivos
 * - Relaciones tipo-seguras con entidades
 * - Control de acceso basado en roles
 * - Categorización funcional de archivos
 * - Auditoría de operaciones
 * 
 * @fileoverview Interfaces para gestión de archivos polimórficos
 * @module ArchivosInterface
 */

import { TipoEntidadArchivo, CategoriaArchivo, RolArchivoUsuario } from '../DTO';

/**
 * Interface básica para un archivo
 * 
 * Representa la estructura fundamental de un archivo
 * según el modelo de Prisma en la base de datos.
 */
export interface IArchivo {
  /** ID único del archivo */
  id: number;
  
  /** Nombre del archivo con extensión */
  nombre: string;
  
  /** Tipo MIME del archivo */
  tipo: string;
  
  /** URL donde está almacenado el archivo */
  url: string;
  
  /** Fecha de subida del archivo */
  fechaSubida: Date;
  
  /** ID del usuario que subió el archivo */
  usuarioId: number;
  
  /** Descripción opcional del archivo */
  descripcion?: string;
}

/**
 * Interface para archivo con información del usuario
 * 
 * Extiende IArchivo incluyendo datos del usuario
 * que subió el archivo.
 */
export interface IArchivoConUsuario extends IArchivo {
  /** Información del usuario que subió el archivo */
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

/**
 * Interface para relación archivo-entidad
 * 
 * Representa la asociación polimórfica entre
 * un archivo y cualquier entidad del sistema.
 */
export interface IArchivoRelacion {
  /** ID único de la relación */
  id: number;
  
  /** ID del archivo relacionado */
  archivoId: number;
  
  /** Tipo de entidad relacionada */
  entidadTipo: TipoEntidadArchivo;
  
  /** ID específico de la entidad */
  entidadId: number;
  
  /** ID del usuario que creó la relación */
  usuarioId: number;
  
  /** Rol del usuario respecto al archivo */
  rol?: RolArchivoUsuario;
}

/**
 * Interface para archivo completo con relaciones
 * 
 * Incluye toda la información del archivo más
 * sus relaciones con entidades y metadatos.
 */
export interface IArchivoCompleto extends IArchivoConUsuario {
  /** Lista de relaciones del archivo con entidades */
  archivoRelacion: Array<{
    id: number;
    entidadTipo: TipoEntidadArchivo;
    entidadId: number;
    rol?: RolArchivoUsuario;
    usuario: {
      id: number;
      nombre: string;
      apellido: string;
    };
  }>;
  
  /** Categoría funcional del archivo (calculada) */
  categoria?: CategoriaArchivo;
  
  /** Tamaño del archivo en bytes (estimado) */
  tamañoBytes?: number;
  
  /** Indica si el archivo está accesible */
  accesible: boolean;
}

/**
 * Interface para respuesta paginada de archivos
 * 
 * Estructura estándar para consultas paginadas
 * del sistema de archivos.
 */
export interface IRespuestaPaginadaArchivos {
  /** Lista de archivos en la página actual */
  archivos: IArchivoCompleto[];
  
  /** Información de paginación */
  paginación: {
    total: number;
    página: number;
    límite: number;
    totalPáginas: number;
  };
}

/**
 * Interface para estadísticas del sistema de archivos
 * 
 * Proporciona métricas y análisis del uso
 * del sistema de gestión de archivos.
 */
export interface IEstadisticasArchivos {
  /** Total de archivos en el sistema */
  totalArchivos: number;
  
  /** Distribución por categorías funcionales */
  porCategoria: Record<CategoriaArchivo, number>;
  
  /** Distribución por tipos de entidad */
  porEntidad: Record<TipoEntidadArchivo, number>;
  
  /** Distribución por tipos MIME */
  porTipoMime: Record<string, number>;
  
  /** Tamaño total estimado en MB */
  tamañoTotalMB: number;
  
  /** Promedio de archivos por entidad */
  promedioArchivosPorEntidad: number;
  
  /** Usuarios más activos en subida de archivos */
  usuariosMasActivos: Array<{
    usuarioId: number;
    nombre: string;
    apellido: string;
    totalArchivos: number;
  }>;
  
  /** Crecimiento de archivos por mes */
  crecimientoPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
}

/**
 * Interface para resultado de operación de archivo
 * 
 * Estructura de respuesta estándar para operaciones
 * que pueden tener éxito parcial o total.
 */
export interface IResultadoOperacionArchivo {
  /** Indica si la operación fue exitosa */
  exitoso: boolean;
  
  /** Mensaje descriptivo del resultado */
  mensaje: string;
  
  /** Archivo creado/actualizado (si aplica) */
  archivo?: IArchivo;
  
  /** Relación creada (si aplica) */
  relacion?: IArchivoRelacion;
  
  /** Errores específicos (si los hay) */
  errores?: string[];
}

/**
 * Interface para resultado de operación masiva
 * 
 * Resultado de operaciones que afectan múltiples
 * archivos simultáneamente.
 */
export interface IResultadoOperacionMasiva {
  /** Total de archivos procesados */
  totalProcesados: number;
  
  /** Archivos procesados exitosamente */
  exitosos: number;
  
  /** Archivos con errores */
  fallidos: number;
  
  /** Lista de errores específicos */
  errores: Array<{
    archivoId: number;
    error: string;
  }>;
  
  /** Detalles de la operación realizada */
  operacion: string;
  
  /** Tiempo de procesamiento en ms */
  tiempoProcesamiento: number;
}

/**
 * Interface para validación de archivo
 * 
 * Resultado de la validación de integridad
 * y accesibilidad de archivos.
 */
export interface IValidacionArchivo {
  /** ID del archivo validado */
  archivoId: number;
  
  /** Indica si el archivo es válido */
  esValido: boolean;
  
  /** URL del archivo es accesible */
  urlAccesible: boolean;
  
  /** Tipo MIME coincide con el contenido */
  tipoCoincide: boolean;
  
  /** Tamaño del archivo en bytes */
  tamañoBytes?: number;
  
  /** Errores encontrados durante la validación */
  erroresValidacion: string[];
  
  /** Timestamp de la última validación */
  fechaValidacion: Date;
}

/**
 * Interface para permisos de archivo
 * 
 * Define los permisos que tiene un usuario
 * específico sobre un archivo determinado.
 */
export interface IPermisosArchivo {
  /** ID del archivo */
  archivoId: number;
  
  /** ID del usuario */
  usuarioId: number;
  
  /** Permisos específicos */
  permisos: {
    /** Puede ver el archivo */
    leer: boolean;
    
    /** Puede modificar metadatos */
    editar: boolean;
    
    /** Puede eliminar el archivo */
    eliminar: boolean;
    
    /** Puede descargar el archivo */
    descargar: boolean;
    
    /** Puede compartir con otros usuarios */
    compartir: boolean;
    
    /** Puede asociar a nuevas entidades */
    relacionar: boolean;
  };
  
  /** Rol del usuario en este archivo */
  rol: RolArchivoUsuario;
  
  /** Motivo de los permisos */
  motivo: string;
}

/**
 * Interface para consulta de archivos por entidad
 * 
 * Resultado de búsqueda de archivos asociados
 * a una entidad específica del sistema.
 */
export interface IArchivosEntidad {
  /** Tipo de entidad consultada */
  entidadTipo: TipoEntidadArchivo;
  
  /** ID de la entidad consultada */
  entidadId: number;
  
  /** Archivos asociados a la entidad */
  archivos: Array<{
    id: number;
    nombre: string;
    tipo: string;
    url: string;
    descripcion?: string;
    categoria?: CategoriaArchivo;
    fechaSubida: Date;
    usuario: {
      nombre: string;
      apellido: string;
    };
    rol?: RolArchivoUsuario;
  }>;
  
  /** Total de archivos asociados */
  totalArchivos: number;
  
  /** Distribución por categorías */
  porCategoria: Record<CategoriaArchivo, number>;
}

/**
 * Interface para auditoría de archivos
 * 
 * Registro de operaciones realizadas sobre
 * un archivo para trazabilidad.
 */
export interface IAuditoriaArchivo {
  /** ID del registro de auditoría */
  id: number;
  
  /** ID del archivo auditado */
  archivoId: number;
  
  /** ID del usuario que realizó la acción */
  usuarioId: number;
  
  /** Acción realizada */
  accion: 'CREADO' | 'ACTUALIZADO' | 'ELIMINADO' | 'DESCARGADO' | 'COMPARTIDO' | 'RELACIONADO';
  
  /** Detalles adicionales de la acción */
  detalles?: Record<string, any>;
  
  /** Timestamp de la acción */
  fechaAccion: Date;
  
  /** IP desde donde se realizó la acción */
  direccionIP?: string;
  
  /** User agent del cliente */
  userAgent?: string;
}

/**
 * Interface para configuración de almacenamiento
 * 
 * Configuraciones y límites del sistema
 * de almacenamiento de archivos.
 */
export interface IConfiguracionAlmacenamiento {
  /** Tamaño máximo por archivo en MB */
  tamañoMaximoMB: number;
  
  /** Tipos MIME permitidos */
  tiposPermitidos: string[];
  
  /** Categorías disponibles */
  categoriasDisponibles: CategoriaArchivo[];
  
  /** Ruta base para almacenamiento */
  rutaBase: string;
  
  /** Configuración de CDN */
  cdnConfig?: {
    habilitado: boolean;
    dominio: string;
    rutaPublica: string;
  };
  
  /** Configuración de respaldos */
  respaldos?: {
    habilitado: boolean;
    frecuenciaDias: number;
    mantenimiento: number;
  };
}
