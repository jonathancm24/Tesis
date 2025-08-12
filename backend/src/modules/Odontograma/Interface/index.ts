/**
 * Interfaces para el módulo de Odontogramas
 * 
 * Define las estructuras de tipos TypeScript para el manejo de odontogramas,
 * incluyendo interfaces básicas, completas y especializadas para diferentes
 * casos de uso dentro del sistema odontológico académico.
 * 
 * @fileoverview Interfaces principales del módulo Odontogramas
 * @module OdontogramaInterfaces
 * @requires Prisma types
 */

/**
 * Interfaz básica para un odontograma
 * Estructura mínima requerida para representar un odontograma
 */
export interface IOdontograma {
  /** ID único del odontograma */
  id: number;
  
  /** Número identificador del diente (ej: 11, 12, 21, etc.) */
  diente: string;
  
  /** Objeto JSON con las condiciones dentales por cara */
  condicion: any;
  
  /** Conclusión diagnóstica del odontograma */
  conclusion: string | null;
  
  /** Fecha de creación del registro */
  fechaCreacion: Date;
  
  /** ID del caso clínico asociado */
  casoClinicoId: number | null;
  
  /** ID del docente supervisor asignado */
  docenteId: number | null;
  
  /** ID del estudiante que realizó el odontograma */
  estudianteId: number;
}

/**
 * Interfaz completa para un odontograma con relaciones
 * Incluye toda la información relacionada para uso en la aplicación
 */
export interface IOdontogramaCompleto extends IOdontograma {
  /** Información del caso clínico asociado */
  casoClinico: {
    id: number;
    estudiante: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
    };
    especialidad: {
      id: number;
      nombre: string;
    };
  } | null;
  
  /** Información del docente supervisor */
  docente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  
  /** Lista de observaciones relacionadas */
  observaciones?: IObservacionOdontograma[];
}

/**
 * Interfaz para condiciones dentales específicas
 * Representa el estado de una cara particular del diente
 */
export interface ICondicionDental {
  /** Cara del diente (distal, mesial, vestibular, etc.) */
  cara: string;
  
  /** Tipo de condición encontrada */
  tipo: string;
  
  /** Descripción detallada de la condición */
  descripcion: string;
  
  /** Nivel de severidad (1-5) */
  severidad: number;
  
  /** Indica si requiere tratamiento inmediato */
  requiereTratamiento: boolean;
  
  /** Observaciones adicionales específicas */
  observaciones?: string;
}

/**
 * Interfaz para observaciones de odontogramas
 * Representa retroalimentación y comentarios del docente
 */
export interface IObservacionOdontograma {
  /** ID único de la observación */
  id: number;
  
  /** Contenido de la observación */
  contenido: string;
  
  /** Fecha de creación de la observación */
  fechaCreacion: Date;
  
  /** ID del docente que realizó la observación */
  docenteId: number;
  
  /** Información del docente */
  docente: {
    id: number;
    nombre: string;
    apellido: string;
  };
  
  /** Tipo de observación */
  tipo: 'REVISION' | 'SUGERENCIA' | 'CORRECCION' | 'APROBACION';
  
  /** Prioridad de la observación */
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
}

/**
 * Interfaz para estadísticas de odontogramas
 * Métricas y análisis del sistema de odontogramas
 */
export interface IEstadisticasOdontograma {
  /** Total de odontogramas en el sistema */
  totalOdontogramas: number;
  
  /** Odontogramas con docente asignado */
  odontogramasConDocente: number;
  
  /** Odontogramas que han sido calificados */
  odontogramasCalificados: number;
  
  /** Odontogramas con observaciones pendientes */
  odontogramasConObservaciones: number;
  
  /** Porcentaje de supervisión docente */
  porcentajeSupervision: number;
  
  /** Porcentaje de odontogramas calificados */
  porcentajeCalificados: number;
  
  /** Promedio de calificaciones */
  promedioCalificacion: number;
  
  /** Promedio de severidad de condiciones */
  promedioSeveridad: number;
  
  /** Dientes más frecuentemente tratados */
  dientesMasFrecuentes: Array<{
    diente: string;
    cantidad: number;
  }>;
  
  /** Fecha de generación de las estadísticas */
  fechaGeneracion: Date;
}

/**
 * Interfaz para dashboard de odontogramas
 * Vista personalizada según el rol del usuario
 */
export interface IDashboardOdontograma {
  /** Información del usuario */
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
  };
  
  /** Período de análisis */
  periodo: {
    inicio: Date;
    fin: Date;
    dias: number;
  };
  
  /** Métricas principales */
  metricas: {
    odontogramasCreados: number;
    odontogramasAsignados: number;
    pendientesRevision: number;
    alertasActivas: number;
  };
  
  /** Alertas activas */
  alertas: Array<{
    tipo: string;
    mensaje: string;
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
    cantidad?: number;
  }>;
  
  /** Actividad reciente */
  actividadReciente: Array<{
    id: number;
    diente: string;
    estudiante: string;
    docente: string | null;
    fechaActualizacion: Date;
  }>;
  
  /** Fecha de generación del dashboard */
  fechaGeneracion: Date;
}

/**
 * Interfaz para análisis comparativo
 * Comparación entre diferentes grupos o períodos
 */
export interface IAnalisisComparativo {
  /** Tipo de comparación realizada */
  tipoComparacion: string;
  
  /** Configuración del grupo A */
  grupoA: {
    nombre: string;
    criterios: any;
    metricas: IMetricasComparativas;
  };
  
  /** Configuración del grupo B */
  grupoB: {
    nombre: string;
    criterios: any;
    metricas: IMetricasComparativas;
  };
  
  /** Resultados del análisis */
  resultados: {
    diferencias: Array<{
      metrica: string;
      valorA: number;
      valorB: number;
      diferencia: number;
      porcentajeDiferencia: number;
    }>;
    significancia?: {
      valor: number;
      esSignificativo: boolean;
    };
  };
  
  /** Fecha de generación del análisis */
  fechaGeneracion: Date;
}

/**
 * Interfaz para métricas comparativas
 * Métricas específicas para análisis comparativo
 */
export interface IMetricasComparativas {
  /** Total de odontogramas */
  totalOdontogramas: number;
  
  /** Promedio de calificaciones */
  promedioCalificacion: number;
  
  /** Tiempo promedio de revisión (en días) */
  tiempoPromedioRevision: number;
  
  /** Porcentaje de aprobación */
  porcentajeAprobacion: number;
  
  /** Condiciones más frecuentes */
  condicionesFrecuentes: Array<{
    tipo: string;
    frecuencia: number;
  }>;
}

/**
 * Interfaz para notificaciones de odontogramas
 * Sistema de notificaciones para eventos del módulo
 */
export interface INotificacionOdontograma {
  /** ID único de la notificación */
  id: number;
  
  /** ID del usuario destinatario */
  usuarioId: number;
  
  /** Tipo de notificación */
  tipo: 'NUEVO_ODONTOGRAMA' | 'OBSERVACION_AGREGADA' | 'REVISION_COMPLETADA' | 'RECORDATORIO' | 'ASIGNACION_ODONTOGRAMA' | 'DOCENTE_ASIGNADO' | 'ODONTOGRAMA_ACTUALIZADO' | 'ODONTOGRAMA_ELIMINADO';
  
  /** Título de la notificación */
  titulo: string;
  
  /** Mensaje descriptivo */
  mensaje: string;
  
  /** ID del odontograma relacionado */
  odontogramaId?: number;
  
  /** Prioridad de la notificación */
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  
  /** Indica si la notificación ha sido leída */
  leida: boolean;
  
  /** Fecha de creación */
  fechaCreacion: Date;
  
  /** Fecha de lectura (si aplica) */
  fechaLectura?: Date;
}

/**
 * Interfaz para plantillas de odontogramas
 * Plantillas predefinidas para diferentes especialidades
 */
export interface IPlantillaOdontograma {
  /** ID único de la plantilla */
  id: number;
  
  /** Nombre descriptivo de la plantilla */
  nombre: string;
  
  /** Descripción de la plantilla */
  descripcion: string;
  
  /** Especialidad asociada */
  especialidadId: number;
  
  /** Configuración de dientes incluidos */
  dientesIncluidos: string[];
  
  /** Condiciones predeterminadas */
  condicionesPredeterminadas: ICondicionDental[];
  
  /** Campos obligatorios */
  camposObligatorios: string[];
  
  /** Indica si la plantilla está activa */
  activa: boolean;
  
  /** Fecha de creación */
  fechaCreacion: Date;
  
  /** ID del usuario creador */
  creadoPorId: number;
}

/**
 * Interfaz para configuración del sistema de odontogramas
 * Configuraciones globales y preferencias del usuario
 */
export interface IConfiguracionSistemaOdontograma {
  /** ID único de la configuración */
  id: number;
  
  /** ID del usuario propietario */
  usuarioId: number;
  
  /** Configuraciones de visualización */
  visualizacion: {
    esquemaColores: Record<string, string>;
    mostrarNumerosDiente: boolean;
    tamanoInterfaz: 'PEQUEÑO' | 'MEDIANO' | 'GRANDE';
    mostrarLeyenda: boolean;
  };
  
  /** Configuraciones de notificaciones */
  notificaciones: {
    recibirEmail: boolean;
    recibirNotificacionesApp: boolean;
    frecuenciaResumen: 'DIARIA' | 'SEMANAL' | 'MENSUAL';
    tiposHabilitados: string[];
  };
  
  /** Configuraciones de exportación */
  exportacion: {
    formatoPreferido: 'PDF' | 'EXCEL' | 'CSV';
    incluirImagenes: boolean;
    incluirEstadisticas: boolean;
    plantillaPersonalizada?: string;
  };
  
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * Interfaz para métricas de rendimiento
 * Métricas específicas de rendimiento del estudiante
 */
export interface IMetricasRendimientoEstudiante {
  /** ID del estudiante */
  estudianteId: number;
  
  /** Información del estudiante */
  estudiante: {
    nombre: string;
    apellido: string;
    email: string;
  };
  
  /** Período de análisis */
  periodo: {
    inicio: Date;
    fin: Date;
  };
  
  /** Métricas de actividad */
  actividad: {
    odontogramasRealizados: number;
    promedioCalificacion: number;
    tiempoPromedioComplecion: number;
    porcentajeRevisionPrimera: number;
  };
  
  /** Análisis por especialidad */
  porEspecialidad: Array<{
    especialidadId: number;
    especialidadNombre: string;
    cantidad: number;
    promedioCalificacion: number;
  }>;
  
  /** Tendencias temporales */
  tendencias: Array<{
    fecha: Date;
    cantidad: number;
    promedioCalificacion: number;
  }>;
  
  /** Áreas de mejora identificadas */
  areasMejora: string[];
  
  /** Fortalezas identificadas */
  fortalezas: string[];
}

/**
 * Interfaz para reporte de calidad
 * Análisis de calidad de los odontogramas
 */
export interface IReporteCalidadOdontograma {
  /** Período del reporte */
  periodo: {
    inicio: Date;
    fin: Date;
  };
  
  /** Métricas generales de calidad */
  metricas: {
    completitud: number;
    precision: number;
    consistencia: number;
    oportunidad: number;
    puntuacionGeneral: number;
  };
  
  /** Análisis por criterio */
  analisisCriterios: Array<{
    criterio: string;
    puntuacion: number;
    descripcion: string;
    recomendaciones: string[];
  }>;
  
  /** Comparación temporal */
  comparacionTemporal: Array<{
    periodo: string;
    puntuacion: number;
    cambio: number;
  }>;
  
  /** Recomendaciones principales */
  recomendaciones: string[];
  
  /** Fecha de generación */
  fechaGeneracion: Date;
}
