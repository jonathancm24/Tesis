/**
 * Interfaces para el módulo de Logs del sistema
 * 
 * Define las estructuras de datos y tipos utilizados para
 * el monitoreo y análisis de actividades del sistema.
 * Estas interfaces proporcionan tipado estricto para
 * la gestión de logs de auditoría.
 * 
 * @fileoverview Interfaces del módulo de logs
 * @module LogInterfaces
 */

/**
 * Interface para filtros de búsqueda de logs
 * 
 * Permite definir criterios específicos para consultar
 * logs del sistema con diversos filtros temporales,
 * de usuario, acción y tabla afectada.
 */
export interface FiltrosLog {
  /** Filtrar por ID de usuario específico */
  usuarioId?: number;
  
  /** Filtrar por nombre de usuario (búsqueda parcial) */
  nombreUsuario?: string;
  
  /** Filtrar por email de usuario (búsqueda parcial) */
  emailUsuario?: string;
  
  /** Filtrar por acción específica realizada */
  accion?: string;
  
  /** Filtrar por tabla afectada en la acción */
  tabla?: string;
  
  /** Fecha de inicio del rango de búsqueda */
  fechaInicio?: Date;
  
  /** Fecha final del rango de búsqueda */
  fechaFin?: Date;
  
  /** Buscar en detalles JSON (búsqueda de texto) */
  buscarEnDetalles?: string;
  
  /** Filtrar por rol del usuario */
  rolUsuario?: string;
  
  /** Filtrar por estado activo del usuario */
  usuarioActivo?: boolean;
  
  /** Incluir información detallada del usuario */
  incluirUsuario?: boolean;
  
  /** Incluir detalles JSON parseados */
  incluirDetalles?: boolean;
}

/**
 * Interface para opciones de paginación
 * 
 * Define parámetros para controlar la paginación
 * de resultados en consultas de logs.
 */
export interface OpcionesPaginacion {
  /** Número de página (empezando desde 1) */
  pagina: number;
  
  /** Cantidad de elementos por página */
  limite: number;
  
  /** Campo por el cual ordenar */
  ordenarPor?: 'fecha' | 'usuarioId' | 'accion' | 'tabla';
  
  /** Dirección del ordenamiento */
  direccion?: 'asc' | 'desc';
}

/**
 * Interface para información de usuario en logs
 * 
 * Estructura simplificada de datos de usuario
 * para mostrar en el contexto de logs.
 */
export interface UsuarioLog {
  /** ID único del usuario */
  id: number;
  
  /** Nombre completo del usuario */
  nombre: string;
  
  /** Apellido del usuario */
  apellido: string;
  
  /** Email del usuario */
  email: string;
  
  /** Nombre del rol del usuario */
  rol: string;
  
  /** Estado activo del usuario */
  activo: boolean;
  
  /** Tipo de documento del usuario */
  tipoDocumento: string;
  
  /** Número de documento del usuario */
  numeroDocumento: string;
}

/**
 * Interface para detalles de log parseados
 * 
 * Estructura flexible para representar detalles
 * JSON de logs de manera tipada.
 */
export interface DetallesLog {
  /** Datos anteriores (para operaciones de actualización) */
  datosAnteriores?: Record<string, any>;
  
  /** Datos nuevos (para operaciones de creación/actualización) */
  datosNuevos?: Record<string, any>;
  
  /** ID del registro afectado */
  registroId?: number;
  
  /** Campos específicos modificados */
  camposModificados?: string[];
  
  /** Información adicional de contexto */
  contexto?: Record<string, any>;
  
  /** IP del usuario que realizó la acción */
  ipUsuario?: string;
  
  /** User Agent del navegador */
  userAgent?: string;
  
  /** Duración de la operación en milisegundos */
  duracionMs?: number;
  
  /** Resultado de la operación */
  resultado?: 'exito' | 'error' | 'advertencia';
  
  /** Mensaje adicional */
  mensaje?: string;
}

/**
 * Interface para estadísticas de logs
 * 
 * Estructura para métricas y análisis
 * estadístico de la actividad del sistema.
 */
export interface EstadisticasLog {
  /** Total de logs en el sistema */
  totalLogs: number;
  
  /** Logs del día actual */
  logsHoy: number;
  
  /** Logs de la semana actual */
  logsSemana: number;
  
  /** Logs del mes actual */
  logsMes: number;
  
  /** Distribución por acciones */
  porAccion: Array<{
    accion: string;
    cantidad: number;
    porcentaje: number;
  }>;
  
  /** Distribución por tablas */
  porTabla: Array<{
    tabla: string;
    cantidad: number;
    porcentaje: number;
  }>;
  
  /** Usuarios más activos */
  usuariosMasActivos: Array<{
    usuario: UsuarioLog;
    cantidadAcciones: number;
    ultimaActividad: Date;
  }>;
  
  /** Actividad por hora del día */
  actividadPorHora: Array<{
    hora: number;
    cantidad: number;
  }>;
  
  /** Actividad por día de la semana */
  actividadPorDia: Array<{
    dia: string;
    cantidad: number;
  }>;
  
  /** Tipos de documento más frecuentes */
  tiposDocumentoFrecuentes: Array<{
    tipoDocumento: string;
    cantidad: number;
  }>;
  
  /** Acciones por rol */
  accionesPorRol: Array<{
    rol: string;
    acciones: Array<{
      accion: string;
      cantidad: number;
    }>;
  }>;
}

/**
 * Interface para métricas de actividad en tiempo real
 * 
 * Datos para dashboard de monitoreo en tiempo real
 * del sistema.
 */
export interface MetricasActividad {
  /** Timestamp de la métrica */
  timestamp: Date;
  
  /** Usuarios conectados actualmente */
  usuariosConectados: number;
  
  /** Acciones en la última hora */
  accionesUltimaHora: number;
  
  /** Errores en la última hora */
  erroresUltimaHora: number;
  
  /** Acciones por minuto promedio */
  accionesPorMinuto: number;
  
  /** Tablas más consultadas hoy */
  tablasMasConsultadas: Array<{
    tabla: string;
    consultas: number;
  }>;
  
  /** Alertas de seguridad */
  alertasSeguridad: Array<{
    tipo: string;
    descripcion: string;
    gravedad: 'baja' | 'media' | 'alta' | 'critica';
    fecha: Date;
  }>;
}

/**
 * Interface para exportación de logs
 * 
 * Opciones para exportar logs en diferentes formatos
 * para análisis externo o respaldo.
 */
export interface OpcionesExportacion {
  /** Formato de exportación */
  formato: 'csv' | 'excel' | 'json' | 'pdf';
  
  /** Incluir detalles JSON en la exportación */
  incluirDetalles: boolean;
  
  /** Incluir información de usuario */
  incluirUsuario: boolean;
  
  /** Filtros aplicados a la exportación */
  filtros: FiltrosLog;
  
  /** Rango de fechas específico */
  rangoFechas?: {
    inicio: Date;
    fin: Date;
  };
  
  /** Columnas específicas a incluir */
  columnasIncluir?: string[];
  
  /** Nombre del archivo de exportación */
  nombreArchivo?: string;
}
