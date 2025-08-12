import { EstadoSolicitud } from '@prisma/client';

/**
 * Interface base para una solicitud del sistema
 * Representa la estructura básica de una solicitud académica
 */
export interface ISolicitud {
  id: number;
  fecha: Date;
  estado: EstadoSolicitud;
  observaciones?: string;
  estudianteId: number;
  docenteId?: number;
  especialidadId: number;
}

/**
 * Interface para solicitud completa con todas las relaciones
 * Incluye información detallada del estudiante, docente y especialidad
 */
export interface ISolicitudCompleta extends ISolicitud {
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    numeroDocumento: string;
    telefono?: string;
  };
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
  especialidad: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  fechaActualizacion?: Date;
  comentariosDocente?: string;
  motivoRechazo?: string;
}

/**
 * Interface para resumen de solicitud
 * Información básica para listados y vistas rápidas
 */
export interface ISolicitudResumen {
  id: number;
  fecha: Date;
  estado: EstadoSolicitud;
  estudianteNombre: string;
  docenteNombre?: string;
  especialidadNombre: string;
  observaciones?: string;
  diasPendientes?: number;
}

/**
 * Interface para solicitudes por especialidad
 * Agrupa solicitudes por especialidad con estadísticas
 */
export interface ISolicitudesPorEspecialidad {
  especialidadId: number;
  especialidadNombre: string;
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesAprobadas: number;
  solicitudesRechazadas: number;
  solicitudesCanceladas: number;
  solicitudes: ISolicitudResumen[];
  tiempoPromedioRespuesta?: number; // en días
}

/**
 * Interface para solicitudes por estudiante
 * Historial completo de solicitudes de un estudiante
 */
export interface ISolicitudesPorEstudiante {
  estudianteId: number;
  estudianteNombre: string;
  estudianteEmail: string;
  totalSolicitudes: number;
  solicitudesActivas: number;
  ultimaSolicitud?: Date;
  solicitudes: ISolicitudCompleta[];
  especialidadesSolicitadas: Array<{
    especialidadId: number;
    especialidadNombre: string;
    solicitudesCount: number;
    ultimaFecha: Date;
  }>;
}

/**
 * Interface para solicitudes por docente
 * Solicitudes asignadas o gestionadas por un docente
 */
export interface ISolicitudesPorDocente {
  docenteId: number;
  docenteNombre: string;
  docenteEmail: string;
  especialidades: Array<{
    especialidadId: number;
    especialidadNombre: string;
  }>;
  solicitudesPendientes: number;
  solicitudesGestionadas: number;
  solicitudes: ISolicitudCompleta[];
  tiempoPromedioRespuesta: number;
}

/**
 * Interface para estadísticas de solicitudes
 * Métricas y análisis del sistema de solicitudes
 */
export interface IEstadisticasSolicitudes {
  totalSolicitudes: number;
  solicitudesPorEstado: {
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    canceladas: number;
  };
  solicitudesPorEspecialidad: Array<{
    especialidadId: number;
    especialidadNombre: string;
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  }>;
  tendenciasMensuales: Array<{
    mes: string;
    año: number;
    totalSolicitudes: number;
    aprobadas: number;
    rechazadas: number;
  }>;
  tiemposRespuesta: {
    promedioGeneral: number;
    promedioPorEspecialidad: Array<{
      especialidadNombre: string;
      promedioDias: number;
    }>;
  };
  docentesMasActivos: Array<{
    docenteId: number;
    docenteNombre: string;
    solicitudesGestionadas: number;
    tiempoPromedioRespuesta: number;
  }>;
}

/**
 * Interface para dashboard de solicitudes
 * Vista general para administradores y coordinadores
 */
export interface IDashboardSolicitudes {
  resumenGeneral: {
    solicitudesHoy: number;
    solicitudesSemana: number;
    solicitudesMes: number;
    pendientesUrgentes: number; // más de 7 días
  };
  alertas: Array<{
    tipo: 'SOLICITUD_ANTIGUA' | 'SOBRECARGA_DOCENTE' | 'ESPECIALIDAD_SATURADA';
    mensaje: string;
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
    entidadId?: number;
    fechaDeteccion: Date;
  }>;
  estadisticasRapidas: {
    tasaAprobacion: number; // porcentaje
    tiempoPromedioRespuesta: number; // días
    especialidadMasSolicitada: string;
    docenteMasActivo: string;
  };
  solicitudesRecientes: ISolicitudResumen[];
  tendenciaUltimos30Dias: Array<{
    fecha: string;
    solicitudes: number;
    aprobadas: number;
    rechazadas: number;
  }>;
}

/**
 * Interface para notificaciones de solicitudes
 * Sistema de notificaciones relacionadas con solicitudes
 */
export interface INotificacionSolicitud {
  id: number;
  solicitudId: number;
  usuarioId: number;
  tipo: 'NUEVA_SOLICITUD' | 'SOLICITUD_APROBADA' | 'SOLICITUD_RECHAZADA' | 'SOLICITUD_CANCELADA' | 'RECORDATORIO_PENDIENTE';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  fechaLectura?: Date;
  datos?: {
    estudianteNombre?: string;
    docenteNombre?: string;
    especialidadNombre?: string;
    fechaSolicitud?: Date;
  };
}

/**
 * Interface para validación de solicitudes
 * Reglas de negocio y validaciones
 */
export interface IValidacionSolicitud {
  esValida: boolean;
  errores: string[];
  advertencias: string[];
  validaciones: {
    estudianteExiste: boolean;
    especialidadExiste: boolean;
    estudianteYaTieneSolicitudPendiente: boolean;
    estudianteYaAsignadoAEspecialidad: boolean;
    especialidadTieneCapacidadDisponible: boolean;
    estudianteCumpleRequisitos: boolean;
  };
  recomendaciones?: string[];
}

/**
 * Interface para reporte de solicitudes
 * Generación de reportes administrativos
 */
export interface IReporteSolicitudes {
  titulo: string;
  fechaGeneracion: Date;
  parametros: {
    fechaInicio: Date;
    fechaFin: Date;
    especialidadIds?: number[];
    docenteIds?: number[];
    estados?: EstadoSolicitud[];
  };
  resumenEjecutivo: {
    totalSolicitudes: number;
    tasaAprobacion: number;
    tiempoPromedioRespuesta: number;
    especialidadMasSolicitada: string;
  };
  detallesPorEspecialidad: Array<{
    especialidadNombre: string;
    solicitudes: number;
    aprobadas: number;
    rechazadas: number;
    pendientes: number;
    tiempoPromedio: number;
  }>;
  detallesPorDocente: Array<{
    docenteNombre: string;
    especialidades: string[];
    solicitudesGestionadas: number;
    tiempoPromedioRespuesta: number;
    tasaAprobacion: number;
  }>;
  recomendaciones: string[];
  graficos?: {
    solicitudesPorMes: any[];
    distribucionPorEspecialidad: any[];
    tiemposRespuesta: any[];
  };
}

/**
 * Interface para configuración del sistema de solicitudes
 * Parámetros configurables del módulo
 */
export interface IConfiguracionSolicitudes {
  id: number;
  maxSolicitudesPorEstudiante: number;
  maxSolicitudesPendientesPorEstudiante: number;
  diasLimiteRespuesta: number;
  requiereAprobacionDocente: boolean;
  permiteCancelacionEstudiante: boolean;
  notificacionesAutomaticas: boolean;
  recordatoriosAutomaticos: boolean;
  diasRecordatorio: number;
  fechaActualizacion: Date;
  usuarioActualizacion: number;
}
