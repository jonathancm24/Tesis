/**
 * Tipos de datos específicos para el módulo de estudiantes
 * Archivo: src/types/student.ts
 */

// ========================================
// ENUMS
// ========================================

/**
 * Estados posibles de un caso clínico
 * Estos valores deben coincidir exactamente con el enum EstadoCasoClinico en Prisma
 */
export enum EstadoCasoClinico {
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  PENDIENTE_ESTUDIOS = 'PENDIENTE_ESTUDIOS',
  EN_TRATAMIENTO = 'EN_TRATAMIENTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

/**
 * Estados posibles de un tratamiento
 * Estos valores deben coincidir exactamente con el enum EstadoTratamiento en Prisma
 */
export enum EstadoTratamiento {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  EN_PROCESO = 'EN_PROCESO',
  FINALIZADO = 'FINALIZADO'
}

/**
 * Estados posibles de una cita
 * Estos valores deben coincidir exactamente con el enum EstadoCita en Prisma
 */
export enum EstadoCita {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADA = 'RESERVADA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA',
  NO_ASISTIO = 'NO_ASISTIO'
}

// ========================================
// INTERFACES BÁSICAS
// ========================================

/**
 * Información básica de un paciente para vistas de estudiante
 */
export interface PacienteEstudiante {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
  telefono?: string;
  fechaNacimiento: Date;
  edad: number;
}

/**
 * Información básica de un docente
 */
export interface DocenteBasico {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

/**
 * Información básica de una especialidad
 */
export interface EspecialidadBasica {
  id: number;
  nombre: string;
  descripcion?: string;
}

// ========================================
// CASOS CLÍNICOS
// ========================================

/**
 * Caso clínico básico para listados
 */
export interface CasoClinicoBasico {
  id: number;
  paciente: PacienteEstudiante;
  docente: DocenteBasico;
  especialidad: EspecialidadBasica;
  estado: EstadoCasoClinico;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  titulo?: string;
  descripcionProblema?: string;
  calificacion?: number;
}

/**
 * Caso clínico detallado
 */
export interface CasoClinicoDetalle extends CasoClinicoBasico {
  motivoConsulta?: string;
  historialMedico?: string;
  examenClinico?: string;
  diagnostico?: string;
  planTratamiento?: string;
  observacionesDocente?: string;
  fechaFinalizado?: Date;
}

// ========================================
// TRATAMIENTOS
// ========================================

/**
 * Tratamiento básico para listados
 */
export interface TratamientoBasico {
  id: number;
  casoClinico: {
    id: number;
    titulo?: string;
    paciente: PacienteEstudiante;
  };
  docente: DocenteBasico;
  especialidad: EspecialidadBasica;
  estado: EstadoTratamiento;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  descripcion?: string;
  observaciones?: string;
}

/**
 * Tratamiento detallado
 */
export interface TratamientoDetalle extends TratamientoBasico {
  procedimientos?: string;
  medicamentos?: string;
  recomendaciones?: string;
  fechaInicio?: Date;
  fechaFinalizacion?: Date;
  resultados?: string;
}

// ========================================
// CITAS
// ========================================

/**
 * Cita básica para listados
 */
export interface CitaBasica {
  id: number;
  paciente: PacienteEstudiante;
  docente: DocenteBasico;
  especialidad: EspecialidadBasica;
  estado: EstadoCita;
  fecha: Date;
  horaInicio: Date;
  horaFin: Date;
  motivo?: string;
  observaciones?: string;
}

/**
 * Cita detallada
 */
export interface CitaDetalle extends CitaBasica {
  casoClinico?: {
    id: number;
    titulo?: string;
  };
  tratamiento?: {
    id: number;
    descripcion?: string;
  };
  notas?: string;
  procedimientosRealizados?: string;
}

// ========================================
// ESTADÍSTICAS DEL DASHBOARD
// ========================================

/**
 * Estadísticas generales para el dashboard del estudiante
 */
export interface EstadisticasEstudiante {
  /** Total de pacientes asignados al estudiante */
  totalPacientes: number;
  
  /** Citas programadas para hoy */
  citasHoy: number;
  
  /** Casos clínicos activos (en progreso o en revisión) */
  casosActivos: number;
  
  /** Tratamientos en curso */
  tratamientosEnCurso: number;
  
  /** Casos clínicos completados */
  casosCompletados: number;
  
  /** Promedio de calificaciones obtenidas */
  promedioCalificaciones?: number;
  
  /** Citas pendientes de confirmación */
  citasPendientes: number;
}

// ========================================
// VISTA DASHBOARD
// ========================================

/**
 * Información resumida de un paciente para el dashboard
 */
export interface PacienteDashboard {
  id: number;
  paciente: PacienteEstudiante;
  
  /** Caso clínico activo más reciente */
  casoActivo?: {
    id: number;
    titulo?: string;
    estado: EstadoCasoClinico;
    especialidad: string;
    fechaActualizacion: Date;
  };
  
  /** Tratamiento activo más reciente */
  tratamientoActivo?: {
    id: number;
    descripcion?: string;
    estado: EstadoTratamiento;
    fechaActualizacion: Date;
  };
  
  /** Próxima cita programada */
  proximaCita?: {
    id: number;
    fecha: Date;
    hora: string;
    estado: EstadoCita;
    motivo?: string;
  };
  
  /** Última actividad registrada */
  ultimaActividad: Date;
  
  /** Docente supervisor actual */
  docenteSupervisor?: DocenteBasico;
}

// ========================================
// FILTROS Y BÚSQUEDA
// ========================================

/**
 * Filtros para la búsqueda en el dashboard
 */
export interface FiltrosDashboard {
  /** Término de búsqueda general */
  busqueda?: string;
  
  /** Filtrar por estado de caso clínico */
  estadoCaso?: EstadoCasoClinico;
  
  /** Filtrar por estado de tratamiento */
  estadoTratamiento?: EstadoTratamiento;
  
  /** Filtrar por especialidad */
  especialidadId?: number;
  
  /** Filtrar por docente */
  docenteId?: number;
  
  /** Filtrar por rango de fechas */
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// ========================================
// RESPUESTAS DE API
// ========================================

/**
 * Respuesta de la API para el dashboard del estudiante
 */
export interface DashboardResponse {
  estadisticas: EstadisticasEstudiante;
  pacientes: PacienteDashboard[];
  especialidades: EspecialidadBasica[];
  docentes: DocenteBasico[];
}

/**
 * Respuesta paginada para listados
 */
export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

// ========================================
// TIPOS UTILITARIOS
// ========================================

/**
 * Opciones para obtener casos clínicos
 */
export interface OpcionesCasosClinicos {
  estado?: EstadoCasoClinico;
  especialidadId?: number;
  docenteId?: number;
  pagina?: number;
  tamanoPagina?: number;
}

/**
 * Opciones para obtener tratamientos
 */
export interface OpcionesTratamientos {
  estado?: EstadoTratamiento;
  especialidadId?: number;
  docenteId?: number;
  pagina?: number;
  tamanoPagina?: number;
}

/**
 * Opciones para obtener citas
 */
export interface OpcionesCitas {
  estado?: EstadoCita;
  especialidadId?: number;
  docenteId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  pagina?: number;
  tamanoPagina?: number;
}
