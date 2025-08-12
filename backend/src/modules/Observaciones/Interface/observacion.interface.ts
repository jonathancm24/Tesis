import { EstadoObservacion } from '@prisma/client';

/**
 * Interface principal para observaciones del sistema
 * Maneja tanto seguimiento de tratamientos como retroalimentación docente
 * Soporta relaciones polimórficas con múltiples entidades
 */
export interface IObservacion {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: Date;
  estado: EstadoObservacion;
  
  // Relaciones con usuarios
  estudianteId: number;
  docenteId?: number;
  
  // Relaciones polimórficas (solo una debe estar presente)
  casoClinicoId?: number;
  tratamientoId?: number;
  prescripcionId?: number;
  odontogramaId?: number;
  
  // Metadatos calculados
  tipoEntidad?: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';
  entidadId?: number;
}

/**
 * Interface extendida con información de relaciones
 * Incluye datos del estudiante, docente y entidad relacionada
 */
export interface IObservacionCompleta extends IObservacion {
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  entidadRelacionada?: {
    tipo: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';
    id: number;
    titulo: string;
    descripcion?: string;
  };
}

/**
 * Interface para observaciones agrupadas por entidad
 * Útil para mostrar todas las observaciones de un caso clínico, tratamiento, etc.
 */
export interface IObservacionesPorEntidad {
  casosClinicos: IObservacionCompleta[];
  tratamientos: IObservacionCompleta[];
  prescripciones: IObservacionCompleta[];
  odontogramas: IObservacionCompleta[];
  total: number;
}

/**
 * Interface para el resumen de una observación
 * Para listados y vistas compactas
 */
export interface IObservacionResumen {
  id: number;
  titulo: string;
  fecha: Date;
  estado: EstadoObservacion;
  nombreEstudiante: string;
  nombreDocente?: string;
  tipoEntidad: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';
  entidadId: number;
  tituloEntidad: string;
}

/**
 * Interface para estadísticas de observaciones
 * Métricas y análisis para profesores y administradores
 */
export interface IEstadisticasObservaciones {
  total: number;
  porEstado: Record<EstadoObservacion, number>;
  porTipoEntidad: {
    casosClinicos: number;
    tratamientos: number;
    prescripciones: number;
    odontogramas: number;
  };
  observacionesDelMes: number;
  tiempoPromedioRespuesta?: number; // En horas
  porcentajeFinalizadas: number;
  observacionesPorEstudiante: Array<{
    estudianteId: number;
    nombreEstudiante: string;
    total: number;
    pendientes: number;
    finalizadas: number;
  }>;
  observacionesPorDocente: Array<{
    docenteId: number;
    nombreDocente: string;
    total: number;
    pendientes: number;
    finalizadas: number;
  }>;
}

/**
 * Interface para seguimiento de tratamientos (estudiantes)
 * Observaciones específicas para registro de progreso
 */
export interface ISeguimientoTratamiento {
  observacionId: number;
  tratamientoId: number;
  fecha: Date;
  progreso: string;
  dificultadesEncontradas?: string;
  solucionesAplicadas?: string;
  proximosPasos?: string;
  necesitaAyuda: boolean;
  autoevaluacion?: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE';
}

/**
 * Interface para retroalimentación docente
 * Observaciones específicas para evaluación y guía
 */
export interface IRetroalimentacionDocente {
  observacionId: number;
  entidadTipo: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';
  entidadId: number;
  fecha: Date;
  calificacion?: number; // 1-10
  aspectosPositivos: string[];
  areasAMejorar: string[];
  recomendaciones: string[];
  requiereRevision: boolean;
  fechaProximaRevision?: Date;
}

/**
 * Interface para filtros de búsqueda de observaciones
 * Criterios de filtrado específicos para el dominio
 */
export interface IFiltrosObservaciones {
  estudianteId?: number;
  docenteId?: number;
  estado?: EstadoObservacion;
  tipoEntidad?: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';
  entidadId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string; // Búsqueda en título y descripción
  soloMisObservaciones?: boolean; // Para estudiantes
  pendientesDeRespuesta?: boolean; // Para docentes
  conCalificacion?: boolean;
  requiereRevision?: boolean;
}

/**
 * Interface para notificaciones de observaciones
 * Sistema de alertas para usuarios
 */
export interface INotificacionObservacion {
  id: number;
  observacionId: number;
  usuarioId: number;
  tipo: 'NUEVA_OBSERVACION' | 'RESPUESTA_DOCENTE' | 'RECORDATORIO' | 'REVISION_PENDIENTE';
  mensaje: string;
  leida: boolean;
  fecha: Date;
}

/**
 * Interface para validación de observaciones
 * Verificaciones antes de crear o actualizar
 */
export interface IValidacionObservacion {
  esValida: boolean;
  errores: string[];
  advertencias: string[];
  entidadExiste: boolean;
  usuarioTienePermisos: boolean;
  puedeEditarse: boolean;
  requiereAprobacion: boolean;
}

/**
 * Interface para el dashboard de observaciones
 * Vista resumida para estudiantes y docentes
 */
export interface IDashboardObservaciones {
  resumenGeneral: {
    totalObservaciones: number;
    pendientes: number;
    enProceso: number;
    finalizadas: number;
  };
  observacionesRecientes: IObservacionResumen[];
  observacionesPendientes: IObservacionResumen[];
  estadisticasPersonales: {
    observacionesEstesMes: number;
    tiempoPromedioRespuesta?: number;
    calificacionPromedio?: number;
  };
  alertas: {
    observacionesVencidas: number;
    revisionesPendientes: number;
    respuestasPendientes: number;
  };
}

/**
 * Interface para reportes de observaciones
 * Generación de reportes personalizados
 */
export interface IReporteObservaciones {
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  criterios: IFiltrosObservaciones;
  datos: {
    observaciones: IObservacionCompleta[];
    estadisticas: IEstadisticasObservaciones;
    graficos: {
      observacionesPorMes: Array<{ mes: string; cantidad: number }>;
      estadosPorPorcentaje: Array<{ estado: EstadoObservacion; porcentaje: number }>;
      rendimientoPorEstudiante: Array<{ 
        estudiante: string; 
        total: number; 
        promedio: number; 
      }>;
    };
  };
  metadatos: {
    fechaGeneracion: Date;
    generadoPor: string;
    totalRegistros: number;
  };
}
