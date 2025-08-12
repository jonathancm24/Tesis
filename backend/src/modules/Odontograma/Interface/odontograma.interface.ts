/**
 * Interfaces para el módulo de Odontograma
 * 
 * Define las estructuras de datos para el manejo de odontogramas digitales
 * en el sistema de gestión clínica odontológica. Los odontogramas representan
 * el estado dental de los pacientes y las condiciones específicas de cada diente.
 * 
 * @fileoverview Interfaces del sistema de odontogramas
 * @module OdontogramaInterfaces
 * @requires EstadoObservacion, Usuario, CasoClinico
 */

import { EstadoObservacion } from '@prisma/client';

/**
 * Estructura para las condiciones dentales específicas
 * Representa el estado de cada cara/sección del diente (distal, mesial, vestibular, etc.)
 */
export interface ICondicionDental {
  /** Identificador de la cara del diente (ej: 'distal', 'mesial', 'vestibular', 'lingual', 'oclusal') */
  cara: string;
  
  /** Tipo de condición encontrada (ej: 'caries', 'obturación', 'corona', 'normal') */
  tipoCondicion: string;
  
  /** Descripción detallada de la condición */
  descripcion?: string;
  
  /** Código de color para representación visual en UI */
  codigoColor?: string;
  
  /** Nivel de severidad (1-5, donde 1 es leve y 5 es severo) */
  severidad?: number;
  
  /** Indica si requiere tratamiento inmediato */
  requiereTratamiento?: boolean;
  
  /** Observaciones adicionales específicas de esta condición */
  observacionesCondicion?: string;
}

/**
 * Estructura básica de un odontograma
 * Representa el odontograma completo con información mínima
 */
export interface IOdontograma {
  /** Identificador único del odontograma */
  id: number;
  
  /** Fecha de creación del odontograma */
  fechaCreacion: Date;
  
  /** Conclusiones generales del odontograma */
  conclusion?: string;
  
  /** Número/código del diente evaluado */
  diente: string;
  
  /** 
   * Condiciones dentales en formato JSON 
   * Estructura: { [cara]: ICondicionDental }
   */
  condicion: Record<string, ICondicionDental>;
  
  /** ID del caso clínico asociado (opcional) */
  casoClinicoId?: number;
  
  /** ID del docente supervisor */
  docenteId?: number;
  
  /** ID del estudiante que realiza el odontograma */
  estudianteId: number;
}

/**
 * Odontograma completo con relaciones incluidas
 * Extiende la información básica con datos relacionados
 */
export interface IOdontogramaCompleto extends IOdontograma {
  /** Información del estudiante que realizó el odontograma */
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    numeroDocumento: string;
    telefono?: string;
  };
  
  /** Información del docente supervisor (si está asignado) */
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    especialidades: Array<{
      id: number;
      nombre: string;
    }>;
  };
  
  /** Información del caso clínico asociado (si existe) */
  casoClinico?: {
    id: number;
    fechaCreacion: Date;
    estado: string;
    paciente: {
      id: number;
      nombre: string;
      apellido: string;
      numeroDocumento?: string;
    };
    especialidad: {
      id: number;
      nombre: string;
    };
  };
  
  /** Lista de observaciones asociadas al odontograma */
  observaciones: Array<{
    id: number;
    titulo: string;
    fecha: Date;
    estado: EstadoObservacion;
    descripcion: string;
    estudianteId: number;
    docenteId?: number;
  }>;
}

/**
 * Versión resumida del odontograma para listados
 * Contiene información esencial para vistas de tabla
 */
export interface IOdontogramaResumen {
  /** Identificador único */
  id: number;
  
  /** Fecha de creación */
  fechaCreacion: Date;
  
  /** Nombre completo del estudiante */
  estudianteNombre: string;
  
  /** Nombre completo del docente supervisor */
  docenteNombre?: string;
  
  /** Número del diente evaluado */
  diente: string;
  
  /** Resumen de las condiciones encontradas */
  resumenCondiciones: string;
  
  /** Número total de condiciones identificadas */
  totalCondiciones: number;
  
  /** Número de condiciones que requieren tratamiento */
  condicionesUrgentes: number;
  
  /** Conclusión breve */
  conclusion?: string;
  
  /** Indica si tiene observaciones pendientes */
  tieneObservacionesPendientes: boolean;
  
  /** ID del caso clínico asociado */
  casoClinicoId?: number;
}

/**
 * Odontogramas agrupados por caso clínico
 * Útil para ver el historial dental completo de un paciente
 */
export interface IOdontogramasPorCasoClinico {
  /** ID del caso clínico */
  casoClinicoId: number;
  
  /** Información básica del paciente */
  pacienteNombre: string;
  
  /** Información del caso clínico */
  casoClinicoEstado: string;
  
  /** Fecha del caso clínico */
  fechaCasoClinico: Date;
  
  /** Especialidad del caso */
  especialidadNombre: string;
  
  /** Total de odontogramas en este caso */
  totalOdontogramas: number;
  
  /** Lista de odontogramas del caso */
  odontogramas: IOdontogramaResumen[];
  
  /** Resumen general del estado dental */
  resumenEstadoDental: {
    /** Total de dientes evaluados */
    dientesEvaluados: number;
    
    /** Dientes sanos */
    dientesSanos: number;
    
    /** Dientes con condiciones */
    dientesConCondiciones: number;
    
    /** Condiciones más frecuentes */
    condicionesFrecuentes: Array<{
      tipo: string;
      cantidad: number;
    }>;
  };
}

/**
 * Odontogramas agrupados por estudiante
 * Para seguimiento del progreso académico
 */
export interface IOdontogramasPorEstudiante {
  /** ID del estudiante */
  estudianteId: number;
  
  /** Nombre completo del estudiante */
  estudianteNombre: string;
  
  /** Email del estudiante */
  estudianteEmail: string;
  
  /** Total de odontogramas realizados */
  totalOdontogramas: number;
  
  /** Odontogramas activos (en casos activos) */
  odontogramasActivos: number;
  
  /** Último odontograma realizado */
  ultimoOdontograma?: Date;
  
  /** Lista de odontogramas */
  odontogramas: IOdontogramaCompleto[];
  
  /** Estadísticas del estudiante */
  estadisticasEstudiante: {
    /** Promedio de condiciones por odontograma */
    promedioCondicionesPorOdontograma: number;
    
    /** Casos clínicos diferentes trabajados */
    casosClinicos: number;
    
    /** Observaciones recibidas */
    observacionesRecibidas: number;
    
    /** Observaciones pendientes */
    observacionesPendientes: number;
  };
}

/**
 * Odontogramas agrupados por docente
 * Para supervisión y evaluación académica
 */
export interface IOdontogramasPorDocente {
  /** ID del docente */
  docenteId: number;
  
  /** Nombre completo del docente */
  docenteNombre: string;
  
  /** Email del docente */
  docenteEmail: string;
  
  /** Especialidades del docente */
  especialidades: Array<{
    id: number;
    nombre: string;
  }>;
  
  /** Total de odontogramas supervisados */
  totalOdontogramasSupervision: number;
  
  /** Odontogramas pendientes de revisión */
  odontogramasPendientes: number;
  
  /** Lista de odontogramas bajo supervisión */
  odontogramas: IOdontogramaCompleto[];
  
  /** Estadísticas de supervisión */
  estadisticasSupervision: {
    /** Estudiantes únicos supervisados */
    estudiantesSupervisionados: number;
    
    /** Promedio de observaciones por odontograma */
    promedioObservaciones: number;
    
    /** Tiempo promedio de respuesta en días */
    tiempoPromedioRespuesta: number;
  };
}

/**
 * Estadísticas generales del sistema de odontogramas
 * Para reportes y análisis institucional
 */
export interface IEstadisticasOdontogramas {
  /** Total de odontogramas en el sistema */
  totalOdontogramas: number;
  
  /** Odontogramas por estado */
  odontogramasPorEstado: {
    /** Con observaciones pendientes */
    pendientes: number;
    
    /** Revisados por docente */
    revisados: number;
    
    /** Finalizados */
    finalizados: number;
  };
  
  /** Estadísticas por especialidad */
  estadisticasPorEspecialidad: Array<{
    especialidadId: number;
    especialidadNombre: string;
    totalOdontogramas: number;
    promedioCondicionesPorOdontograma: number;
  }>;
  
  /** Condiciones más frecuentes en el sistema */
  condicionesFrecuentes: Array<{
    tipoCondicion: string;
    totalOcurrencias: number;
    porcentaje: number;
  }>;
  
  /** Dientes más afectados */
  dientesMasAfectados: Array<{
    numeroDiente: string;
    totalCondiciones: number;
    condicionPrincipal: string;
  }>;
  
  /** Tendencias mensuales */
  tendenciasMensuales: Array<{
    mes: string;
    año: number;
    totalOdontogramas: number;
    condicionesPromedio: number;
  }>;
  
  /** Métricas de calidad */
  metricasCalidad: {
    /** Tiempo promedio de creación de odontograma */
    tiempoPromedioCreacion: number;
    
    /** Porcentaje de odontogramas con observaciones */
    porcentajeConObservaciones: number;
    
    /** Tiempo promedio de revisión por docentes */
    tiempoPromedioRevision: number;
  };
}

/**
 * Dashboard personalizado para odontogramas
 * Vista resumida según el rol del usuario
 */
export interface IDashboardOdontogramas {
  /** Resumen general adaptado al rol */
  resumenGeneral: {
    /** Total relevante para el usuario */
    totalRelevante: number;
    
    /** Pendientes de acción del usuario */
    pendientesAccion: number;
    
    /** Completados en el período */
    completadosRecientes: number;
    
    /** Alertas importantes */
    alertas: number;
  };
  
  /** Alertas específicas para el usuario */
  alertas: Array<{
    tipo: 'OBSERVACION_PENDIENTE' | 'REVISION_URGENTE' | 'ODONTOGRAMA_INCOMPLETO';
    mensaje: string;
    odontogramaId: number;
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
    fechaCreacion: Date;
  }>;
  
  /** Estadísticas rápidas */
  estadisticasRapidas: {
    /** Métrica principal del rol */
    metricaPrincipal: number;
    
    /** Descripción de la métrica */
    descripcionMetrica: string;
    
    /** Tendencia (positiva/negativa) */
    tendencia: 'ASCENDENTE' | 'DESCENDENTE' | 'ESTABLE';
    
    /** Porcentaje de cambio */
    porcentajeCambio: number;
  };
  
  /** Odontogramas recientes relevantes */
  odontogramasRecientes: IOdontogramaResumen[];
  
  /** Gráficos de tendencias (últimos 30 días) */
  tendenciaUltimos30Dias: Array<{
    fecha: Date;
    cantidad: number;
    tipo: 'CREADOS' | 'REVISADOS' | 'OBSERVACIONES';
  }>;
}

/**
 * Notificación relacionada con odontogramas
 * Para sistema de alertas y comunicación
 */
export interface INotificacionOdontograma {
  /** ID de la notificación */
  id: number;
  
  /** Tipo de notificación */
  tipo: 'NUEVO_ODONTOGRAMA' | 'OBSERVACION_AGREGADA' | 'REVISION_COMPLETADA' | 'RECORDATORIO';
  
  /** Título de la notificación */
  titulo: string;
  
  /** Mensaje descriptivo */
  mensaje: string;
  
  /** ID del odontograma relacionado */
  odontogramaId: number;
  
  /** Usuario destinatario */
  usuarioId: number;
  
  /** Usuario que generó la notificación */
  usuarioOrigenId: number;
  
  /** Fecha de creación */
  fechaCreacion: Date;
  
  /** Indica si fue leída */
  leida: boolean;
  
  /** Prioridad de la notificación */
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  
  /** Datos adicionales en JSON */
  datosAdicionales?: Record<string, any>;
}

/**
 * Validación para creación de odontograma
 * Verifica requisitos antes de crear
 */
export interface IValidacionOdontograma {
  /** Indica si es válido crear el odontograma */
  puedeCrear: boolean;
  
  /** Lista de errores de validación */
  errores: string[];
  
  /** Lista de advertencias */
  advertencias: string[];
  
  /** Requisitos faltantes */
  requisitosFaltantes: string[];
  
  /** Información del caso clínico */
  casoClinicoInfo?: {
    id: number;
    estado: string;
    pacienteNombre: string;
    especialidadNombre: string;
  };
  
  /** Odontogramas existentes para el mismo diente */
  odontogramasExistentes: Array<{
    id: number;
    fechaCreacion: Date;
    estudianteNombre: string;
  }>;
}

/**
 * Reporte de odontogramas
 * Para generación de documentos e informes
 */
export interface IReporteOdontogramas {
  /** Configuración del reporte */
  configuracion: {
    tipoReporte: 'INDIVIDUAL' | 'POR_CASO' | 'POR_ESTUDIANTE' | 'GENERAL';
    fechaInicio: Date;
    fechaFin: Date;
    incluirGraficos: boolean;
    formato: 'PDF' | 'EXCEL' | 'JSON';
  };
  
  /** Datos del reporte */
  datos: {
    /** Odontogramas incluidos */
    odontogramas: IOdontogramaCompleto[];
    
    /** Estadísticas calculadas */
    estadisticas: IEstadisticasOdontogramas;
    
    /** Resumen ejecutivo */
    resumenEjecutivo: string;
  };
  
  /** Metadatos del reporte */
  metadatos: {
    fechaGeneracion: Date;
    usuarioGenerador: string;
    totalRegistros: number;
    parametrosFiltro: Record<string, any>;
  };
}

/**
 * Configuración del sistema de odontogramas
 * Para administración y personalización
 */
export interface IConfiguracionOdontogramas {
  /** Configuración de dientes */
  configuracionDientes: {
    /** Numeración utilizada (FDI, Universal, etc.) */
    sistemaNumeracion: 'FDI' | 'UNIVERSAL' | 'PALMER';
    
    /** Dientes habilitados para evaluación */
    dientesHabilitados: string[];
    
    /** Caras dentales configuradas */
    carasDentales: string[];
  };
  
  /** Tipos de condiciones disponibles */
  tiposCondiciones: Array<{
    codigo: string;
    nombre: string;
    descripcion: string;
    codigoColor: string;
    requiereTratamiento: boolean;
  }>;
  
  /** Configuración de validaciones */
  validaciones: {
    /** Requiere supervisión docente */
    requiereSupervision: boolean;
    
    /** Tiempo límite para completar (días) */
    tiempoLimiteCompletado: number;
    
    /** Número máximo de condiciones por diente */
    maxCondicionesPorDiente: number;
  };
  
  /** Configuración de notificaciones */
  notificaciones: {
    /** Notificar a docente al crear odontograma */
    notificarDocente: boolean;
    
    /** Recordatorios automáticos */
    recordatoriosAutomaticos: boolean;
    
    /** Frecuencia de recordatorios (días) */
    frecuenciaRecordatorios: number;
  };
  
  /** Configuración de reportes */
  reportes: {
    /** Plantillas disponibles */
    plantillasDisponibles: string[];
    
    /** Formato por defecto */
    formatoDefecto: 'PDF' | 'EXCEL';
    
    /** Incluir gráficos por defecto */
    incluirGraficos: boolean;
  };
}
