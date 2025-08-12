/**
 * Interfaces TypeScript para el módulo de Citas
 * 
 * Este archivo define todas las interfaces utilizadas para tipar
 * los datos relacionados con citas médicas/odontológicas y
 * disponibilidad de horarios en el sistema académico.
 * 
 * @fileoverview Interfaces para el módulo de citas médicas
 * @module CitaInterface
 */

/**
 * Interface básica para una cita médica
 * 
 * Define la estructura mínima de una cita según
 * el modelo de base de datos Prisma.
 */
export interface ICita {
  /** ID único de la cita */
  id: number;
  
  /** Fecha de la cita */
  fecha: Date;
  
  /** Estado actual de la cita */
  estado: string;
  
  /** Observaciones adicionales (opcional) */
  observaciones?: string;
  
  /** ID del paciente */
  pacienteId: number;
  
  /** ID de la especialidad médica */
  especialidadId: number;
  
  /** ID del estudiante que atiende */
  estudianteId: number;
  
  /** ID del docente supervisor (opcional) */
  docenteId?: number;
  
  /** Hora de inicio de la cita */
  horainicio: Date;
  
  /** Hora de fin de la cita */
  horafin: Date;
}

/**
 * Interface para cita médica con relaciones completas
 * 
 * Incluye toda la información relacionada de paciente,
 * estudiante, docente y especialidad.
 */
export interface ICitaCompleta extends ICita {
  /** Información del paciente */
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    numeroDocumento?: string;
    fechaNacimiento: Date;
  };
  
  /** Información del estudiante */
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  
  /** Información del docente supervisor (si existe) */
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  
  /** Información de la especialidad */
  especialidad: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  
  /** Información de clínicas asociadas (si existen) */
  clinicas?: Array<{
    id: number;
    nombre: string;
    tipo: string;
    estado: string;
  }>;
}

/**
 * Interface para datos de creación de cita
 * 
 * Define los campos requeridos y opcionales para
 * crear una nueva cita médica.
 */
export interface ICrearCita {
  /** ID del paciente (requerido) */
  pacienteId: number;
  
  /** ID del estudiante (requerido) */
  estudianteId: number;
  
  /** ID de la especialidad (requerido) */
  especialidadId: number;
  
  /** Fecha de la cita (requerido) */
  fecha: string;
  
  /** Hora de inicio (requerido) */
  horaInicio: string;
  
  /** Hora de fin (requerido) */
  horaFin: string;
  
  /** ID del docente supervisor (opcional) */
  docenteId?: number;
  
  /** Observaciones adicionales (opcional) */
  observaciones?: string;
}

/**
 * Interface para actualización de cita
 * 
 * Todos los campos son opcionales para permitir
 * actualizaciones parciales y cambios de estado.
 */
export interface IActualizarCita {
  /** ID del paciente (opcional) */
  pacienteId?: number;
  
  /** Nuevo estado de la cita (opcional) */
  estado?: string;
  
  /** Nueva fecha (reagendamiento) */
  fecha?: string;
  
  /** Nueva hora de inicio (reagendamiento) */
  horaInicio?: string;
  
  /** Nueva hora de fin (reagendamiento) */
  horaFin?: string;
  
  /** ID del docente supervisor (opcional) */
  docenteId?: number;
  
  /** Observaciones actualizadas (opcional) */
  observaciones?: string;
}

/**
 * Interface para filtros de búsqueda de citas
 * 
 * Define todos los criterios disponibles para filtrar
 * y paginar citas médicas.
 */
export interface IFiltrosCita {
  /** Filtrar por ID de paciente */
  pacienteId?: number;
  
  /** Filtrar por ID de estudiante */
  estudianteId?: number;
  
  /** Filtrar por ID de docente */
  docenteId?: number;
  
  /** Filtrar por ID de especialidad */
  especialidadId?: number;
  
  /** Filtrar por estado de cita */
  estado?: string;
  
  /** Fecha desde para rango */
  fechaDesde?: string;
  
  /** Fecha hasta para rango */
  fechaHasta?: string;
  
  /** Hora desde para filtrado */
  horaDesde?: string;
  
  /** Hora hasta para filtrado */
  horaHasta?: string;
  
  /** Búsqueda en observaciones */
  busqueda?: string;
  
  /** Número de página para paginación */
  página?: number;
  
  /** Límite de elementos por página */
  límite?: number;
  
  /** Campo por el cual ordenar */
  ordenarPor?: 'id' | 'fecha' | 'horaInicio' | 'estado' | 'pacienteId' | 'estudianteId';
  
  /** Dirección del ordenamiento */
  dirección?: 'asc' | 'desc';
}

/**
 * Interface para respuesta paginada de citas
 * 
 * Estructura la respuesta de consultas con paginación
 * incluyendo metadatos de la consulta.
 */
export interface IRespuestaPaginadaCitas {
  /** Lista de citas médicas */
  citas: ICita[] | ICitaCompleta[];
  
  /** Metadatos de paginación */
  paginación: {
    /** Total de registros encontrados */
    total: number;
    /** Página actual */
    página: number;
    /** Límite de elementos por página */
    límite: number;
    /** Total de páginas disponibles */
    totalPáginas: number;
  };
}

/**
 * Interface para disponibilidad de horarios
 * 
 * Define los horarios disponibles de un estudiante
 * en un día específico.
 */
export interface IDisponibilidad {
  /** ID de la disponibilidad */
  id: number;
  
  /** Día de la semana */
  dia: string;
  
  /** Hora de inicio del turno */
  horaInicio: string;
  
  /** Hora de fin del turno */
  horaFin: string;
  
  /** ID del usuario (estudiante) */
  usuarioId: number;
  
  /** Información del usuario */
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

/**
 * Interface para horarios disponibles calculados
 * 
 * Representa los horarios libres de un estudiante
 * considerando sus citas existentes.
 */
export interface IHorarioDisponible {
  /** Hora de inicio del slot disponible */
  horaInicio: string;
  
  /** Hora de fin del slot disponible */
  horaFin: string;
  
  /** Duración del slot en minutos */
  duracionMinutos: number;
  
  /** Indica si está disponible */
  disponible: boolean;
  
  /** Motivo si no está disponible */
  motivo?: string;
}

/**
 * Interface para respuesta de consulta de disponibilidad
 * 
 * Estructura la respuesta cuando se consulta la disponibilidad
 * de un estudiante en una fecha específica.
 */
export interface IRespuestaDisponibilidad {
  /** Fecha consultada */
  fecha: string;
  
  /** ID del estudiante */
  estudianteId: number;
  
  /** Información del estudiante */
  estudiante: {
    nombre: string;
    apellido: string;
    email: string;
  };
  
  /** Día de la semana */
  diaSemana: string;
  
  /** Indica si el estudiante trabaja ese día */
  tieneDisponibilidad: boolean;
  
  /** Horarios configurados para ese día */
  horariosConfigurados: Array<{
    horaInicio: string;
    horaFin: string;
  }>;
  
  /** Citas ya agendadas */
  citasExistentes: Array<{
    horaInicio: string;
    horaFin: string;
    estado: string;
    paciente: string;
  }>;
  
  /** Horarios disponibles para nueva cita */
  horariosDisponibles: IHorarioDisponible[];
}

/**
 * Interface para estadísticas de citas
 * 
 * Define la estructura de datos estadísticos
 * del módulo de citas médicas.
 */
export interface IEstadisticasCitas {
  /** Total de citas registradas */
  totalCitas: number;
  
  /** Distribución por estado */
  porEstado: Record<string, number>;
  
  /** Distribución por especialidad */
  porEspecialidad: Record<string, number>;
  
  /** Promedio de citas por día */
  promedioPorDia: number;
  
  /** Tasa de cancelación (%) */
  tasaCancelacion: number;
  
  /** Tasa de no asistencia (%) */
  tasaNoAsistencia: number;
  
  /** Horarios más solicitados */
  horariosMasSolicitados: Array<{
    hora: string;
    cantidad: number;
    porcentaje: number;
  }>;
  
  /** Estudiantes más activos */
  estudiantesMasActivos: Array<{
    estudianteId: number;
    nombre: string;
    apellido: string;
    totalCitas: number;
    citasFinalizadas: number;
    tasaFinalizacion: number;
  }>;
  
  /** Especialidades más demandadas */
  especialidadesMasDemandadas: Array<{
    especialidadId: number;
    nombre: string;
    totalCitas: number;
    porcentaje: number;
  }>;
}

/**
 * Interface para validación de conflictos de horario
 * 
 * Define la estructura para verificar si un horario
 * está libre o tiene conflictos.
 */
export interface IVerificacionConflicto {
  /** Indica si hay conflicto */
  hayConflicto: boolean;
  
  /** Motivo del conflicto (si existe) */
  motivo?: string;
  
  /** Citas conflictivas */
  citasConflictivas?: Array<{
    id: number;
    horaInicio: string;
    horaFin: string;
    estado: string;
    paciente: string;
  }>;
  
  /** Horarios alternativos sugeridos */
  alternativasSugeridas?: Array<{
    horaInicio: string;
    horaFin: string;
    disponible: boolean;
  }>;
}

/**
 * Interface para información de acceso a cita
 * 
 * Define la estructura de respuesta para verificación
 * de permisos de acceso a una cita específica.
 */
export interface IAccesoCita {
  /** Indica si el usuario tiene acceso */
  tieneAcceso: boolean;
  
  /** Motivo del acceso o denegación */
  motivo: string;
  
  /** Rol del usuario en relación a la cita */
  rolEnCita?: 'estudiante' | 'docente' | 'secretario' | 'administrador';
  
  /** Permisos específicos sobre la cita */
  permisos: {
    leer: boolean;
    editar: boolean;
    cancelar: boolean;
    reagendar: boolean;
    cambiarEstado: boolean;
  };
}

/**
 * Interface para resumen de cita
 * 
 * Versión simplificada para listados y referencias
 * que no requieren todos los datos.
 */
export interface ICitaResumen {
  /** ID de la cita */
  id: number;
  
  /** Fecha de la cita */
  fecha: string;
  
  /** Hora de inicio */
  horaInicio: string;
  
  /** Hora de fin */
  horaFin: string;
  
  /** Estado de la cita */
  estado: string;
  
  /** Información básica del paciente */
  paciente: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
  
  /** Información básica del estudiante */
  estudiante: {
    nombre: string;
    apellido: string;
  };
  
  /** Nombre de la especialidad */
  especialidad: string;
  
  /** Indica si tiene docente asignado */
  tieneDocente: boolean;
  
  /** Observaciones breves (primeros 100 caracteres) */
  observacionesBreves?: string;
}

/**
 * Enum para estados de cita disponibles
 * 
 * Define todos los estados posibles que puede
 * tener una cita en el sistema.
 */
export enum EstadoCita {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADA = 'RESERVADA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA',
  NO_ASISTIO = 'NO_ASISTIO'
}

/**
 * Enum para días de la semana
 * 
 * Define los días laborables del sistema
 * para configuración de disponibilidad.
 */
export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

/**
 * Enum para tipos de operación en citas
 * 
 * Define las operaciones que se pueden realizar
 * sobre las citas para logging y auditoría.
 */
export enum TipoOperacionCita {
  CREAR = 'CREAR',
  ACTUALIZAR = 'ACTUALIZAR',
  CANCELAR = 'CANCELAR',
  REAGENDAR = 'REAGENDAR',
  FINALIZAR = 'FINALIZAR',
  MARCAR_NO_ASISTIO = 'MARCAR_NO_ASISTIO',
  RESTAURAR = 'RESTAURAR'
}

/**
 * Interface para historial de cambios de cita
 * 
 * Define la estructura para mantener un registro
 * de todos los cambios realizados a una cita.
 */
export interface IHistorialCambioCita {
  /** ID del cambio */
  id: number;
  
  /** ID de la cita modificada */
  citaId: number;
  
  /** Tipo de operación realizada */
  tipoOperacion: TipoOperacionCita;
  
  /** Fecha y hora del cambio */
  fechaCambio: Date;
  
  /** ID del usuario que realizó el cambio */
  usuarioId: number;
  
  /** Información del usuario */
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  
  /** Valores anteriores (JSON) */
  valoresAnteriores?: any;
  
  /** Valores nuevos (JSON) */
  valoresNuevos?: any;
  
  /** Motivo del cambio */
  motivo?: string;
  
  /** Observaciones adicionales */
  observaciones?: string;
}
