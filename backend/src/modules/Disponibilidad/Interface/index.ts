/**
 * Interfaces TypeScript para Disponibilidad
 * 
 * Define las estructuras de tipos para la gestión de disponibilidad
 * horaria de estudiantes en el sistema académico. Proporciona tipado
 * fuerte para operaciones de CRUD, consultas y validaciones.
 * 
 * @fileoverview Interfaces TypeScript para disponibilidad horaria
 * @module DisponibilidadInterfaces
 * @requires TypeScript, Prisma
 */

import { DiaSemana } from '@prisma/client';

/**
 * Interface básica para Disponibilidad
 * 
 * Representa la estructura de datos de una disponibilidad horaria
 * según el modelo de Prisma.
 * 
 * @interface IDisponibilidad
 */
export interface IDisponibilidad {
  /** ID único de la disponibilidad */
  id: number;
  
  /** Día de la semana */
  dia: DiaSemana;
  
  /** Hora de inicio en formato HH:MM */
  horaInicio: string;
  
  /** Hora de fin en formato HH:MM */
  horaFin: string;
  
  /** ID del usuario (estudiante) propietario */
  usuarioId: number;
}

/**
 * Interface extendida de Disponibilidad con información del usuario
 * 
 * Incluye datos del usuario relacionado para consultas completas.
 * 
 * @interface IDisponibilidadCompleta
 * @extends IDisponibilidad
 */
export interface IDisponibilidadCompleta extends IDisponibilidad {
  /** Información del usuario (estudiante) */
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    activo: boolean;
  };
}

/**
 * Interface para crear nueva disponibilidad
 * 
 * Define los campos requeridos para crear una nueva disponibilidad.
 * 
 * @interface ICrearDisponibilidad
 */
export interface ICrearDisponibilidad {
  /** Día de la semana */
  dia: DiaSemana;
  
  /** Hora de inicio en formato HH:MM */
  horaInicio: string;
  
  /** Hora de fin en formato HH:MM */
  horaFin: string;
  
  /** ID del usuario (estudiante) propietario */
  usuarioId: number;
}

/**
 * Interface para actualizar disponibilidad existente
 * 
 * Todos los campos son opcionales para actualizaciones parciales.
 * 
 * @interface IActualizarDisponibilidad
 */
export interface IActualizarDisponibilidad {
  /** Día de la semana */
  dia?: DiaSemana;
  
  /** Hora de inicio en formato HH:MM */
  horaInicio?: string;
  
  /** Hora de fin en formato HH:MM */
  horaFin?: string;
  
  /** ID del usuario (estudiante) propietario */
  usuarioId?: number;
}

/**
 * Interface para filtros de búsqueda de disponibilidades
 * 
 * Define todos los criterios posibles para filtrar disponibilidades.
 * 
 * @interface IFiltrosDisponibilidad
 */
export interface IFiltrosDisponibilidad {
  /** ID del usuario para filtrar */
  usuarioId?: number;
  
  /** Día específico para filtrar */
  dia?: DiaSemana;
  
  /** Lista de días para filtrar */
  dias?: DiaSemana[];
  
  /** Hora mínima de inicio */
  horaMinima?: string;
  
  /** Hora máxima de fin */
  horaMaxima?: string;
  
  /** Solo disponibilidades activas */
  soloActivas?: boolean;
  
  /** Incluir información del usuario */
  incluirUsuario?: boolean;
  
  /** Número de página */
  página?: number;
  
  /** Elementos por página */
  límite?: number;
  
  /** Campo de ordenamiento */
  ordenarPor?: string;
  
  /** Dirección del ordenamiento */
  dirección?: 'asc' | 'desc';
}

/**
 * Interface para respuesta paginada de disponibilidades
 * 
 * Estructura estándar para respuestas de listas con paginación.
 * 
 * @interface IRespuestaPaginada
 */
export interface IRespuestaPaginadaDisponibilidad {
  /** Lista de disponibilidades */
  disponibilidades: IDisponibilidad[] | IDisponibilidadCompleta[];
  
  /** Número total de registros */
  total: number;
  
  /** Página actual */
  página: number;
  
  /** Elementos por página */
  límite: number;
  
  /** Número total de páginas */
  totalPáginas: number;
  
  /** Indica si hay página siguiente */
  tieneSiguiente: boolean;
  
  /** Indica si hay página anterior */
  tieneAnterior: boolean;
}

/**
 * Interface para verificación de disponibilidad específica
 * 
 * Define los parámetros para consultar disponibilidad en una fecha/hora.
 * 
 * @interface IConsultaDisponibilidad
 */
export interface IConsultaDisponibilidad {
  /** ID del usuario a consultar */
  usuarioId: number;
  
  /** Fecha en formato YYYY-MM-DD */
  fecha: string;
  
  /** Hora de inicio en formato HH:MM */
  horaInicio: string;
  
  /** Hora de fin en formato HH:MM */
  horaFin: string;
}

/**
 * Interface para respuesta de consulta de disponibilidad
 * 
 * Resultado de verificar disponibilidad de un usuario en fecha/hora específica.
 * 
 * @interface IRespuestaConsultaDisponibilidad
 */
export interface IRespuestaConsultaDisponibilidad {
  /** Usuario consultado */
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  
  /** Fecha consultada */
  fecha: string;
  
  /** Día de la semana correspondiente */
  diaSemana: DiaSemana;
  
  /** Horario solicitado */
  horarioSolicitado: {
    horaInicio: string;
    horaFin: string;
  };
  
  /** Indica si el usuario está disponible */
  estaDisponible: boolean;
  
  /** Motivo si no está disponible */
  motivo?: string;
  
  /** Disponibilidades configuradas para ese día */
  disponibilidadesConfiguradas: Array<{
    id: number;
    horaInicio: string;
    horaFin: string;
  }>;
  
  /** Citas existentes que pueden interferir */
  citasExistentes?: Array<{
    id: number;
    horaInicio: string;
    horaFin: string;
    estado: string;
    paciente: string;
  }>;
  
  /** Horarios alternativos disponibles */
  horariosAlternativos?: Array<{
    horaInicio: string;
    horaFin: string;
    disponible: boolean;
  }>;
}

/**
 * Interface para creación masiva de disponibilidades
 * 
 * Define la estructura para crear múltiples disponibilidades de una vez.
 * 
 * @interface ICrearDisponibilidadMasiva
 */
export interface ICrearDisponibilidadMasiva {
  /** ID del usuario propietario */
  usuarioId: number;
  
  /** Lista de disponibilidades a crear */
  disponibilidades: Array<{
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
  }>;
}

/**
 * Interface para resultado de creación masiva
 * 
 * Respuesta detallada de la operación de creación múltiple.
 * 
 * @interface IResultadoCreacionMasiva
 */
export interface IResultadoCreacionMasiva {
  /** Número total de disponibilidades procesadas */
  totalProcesadas: number;
  
  /** Número de disponibilidades creadas exitosamente */
  creadasExitosamente: number;
  
  /** Número de disponibilidades que fallaron */
  fallos: number;
  
  /** Lista de disponibilidades creadas */
  disponibilidadesCreadas: IDisponibilidad[];
  
  /** Lista de errores encontrados */
  errores: Array<{
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
    error: string;
  }>;
  
  /** Advertencias sobre solapamientos o conflictos */
  advertencias: string[];
}

/**
 * Interface para validación de horarios
 * 
 * Define la estructura para validar horarios de disponibilidad.
 * 
 * @interface IValidacionHorario
 */
export interface IValidacionHorario {
  /** Horario a validar */
  horario: {
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
    usuarioId: number;
  };
  
  /** ID a excluir de la validación (para updates) */
  excluirId?: number;
}

/**
 * Interface para resultado de validación de horarios
 * 
 * Respuesta de la validación de horarios con detalles.
 * 
 * @interface IResultadoValidacionHorario
 */
export interface IResultadoValidacionHorario {
  /** Indica si el horario es válido */
  esValido: boolean;
  
  /** Lista de errores encontrados */
  errores: string[];
  
  /** Lista de advertencias */
  advertencias: string[];
  
  /** Conflictos detectados */
  conflictos: Array<{
    id: number;
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
    tipoConflicto: 'solapamiento' | 'duplicado' | 'horario_invalido';
  }>;
  
  /** Sugerencias para resolver conflictos */
  sugerencias: string[];
}

/**
 * Interface para estadísticas de disponibilidad
 * 
 * Métricas y estadísticas del sistema de disponibilidad.
 * 
 * @interface IEstadisticasDisponibilidad
 */
export interface IEstadisticasDisponibilidad {
  /** Total de disponibilidades registradas */
  totalDisponibilidades: number;
  
  /** Número de estudiantes con disponibilidad */
  estudiantesConDisponibilidad: number;
  
  /** Día más popular */
  diaMasPopular: DiaSemana;
  
  /** Estadísticas de horarios */
  estadisticasHorarios: {
    horaPromedioInicio: string;
    horaPromedioFin: string;
    duracionPromedio: number; // en minutos
  };
  
  /** Distribución por días */
  distribucionPorDia: Record<DiaSemana, number>;
  
  /** Distribución por rangos horarios */
  distribucionPorRango: Record<string, number>;
  
  /** Estudiantes más activos */
  estudiantesMasActivos: Array<{
    usuarioId: number;
    nombre: string;
    apellido: string;
    totalDisponibilidades: number;
  }>;
}

/**
 * Interface para configuración de horarios semanales
 * 
 * Permite definir un horario semanal completo de forma estructurada.
 * 
 * @interface IHorarioSemanal
 */
export interface IHorarioSemanal {
  /** ID del usuario propietario */
  usuarioId: number;
  
  /** Configuración por día de la semana */
  horariosPorDia: {
    [DiaSemana.LUNES]?: Array<{ horaInicio: string; horaFin: string }>;
    [DiaSemana.MARTES]?: Array<{ horaInicio: string; horaFin: string }>;
    [DiaSemana.MIERCOLES]?: Array<{ horaInicio: string; horaFin: string }>;
    [DiaSemana.JUEVES]?: Array<{ horaInicio: string; horaFin: string }>;
    [DiaSemana.VIERNES]?: Array<{ horaInicio: string; horaFin: string }>;
    [DiaSemana.SABADO]?: Array<{ horaInicio: string; horaFin: string }>;
    [DiaSemana.DOMINGO]?: Array<{ horaInicio: string; horaFin: string }>;
  };
  
  /** Configuración global */
  configuracion: {
    aplicarATodos: boolean;
    sobrescribirExistentes: boolean;
    validarConflictos: boolean;
  };
}

/**
 * Interface para slots de tiempo disponibles
 * 
 * Representa un slot de tiempo específico para citas.
 * 
 * @interface ISlotTiempo
 */
export interface ISlotTiempo {
  /** Hora de inicio del slot */
  horaInicio: string;
  
  /** Hora de fin del slot */
  horaFin: string;
  
  /** Duración en minutos */
  duracion: number;
  
  /** Indica si está disponible */
  disponible: boolean;
  
  /** Motivo si no está disponible */
  motivo?: string;
  
  /** ID de la cita que ocupa el slot (si aplica) */
  citaId?: number;
}

/**
 * Interface para respuesta de slots disponibles
 * 
 * Lista de slots de tiempo para un día específico.
 * 
 * @interface IRespuestaSlotsDisponibles
 */
export interface IRespuestaSlotsDisponibles {
  /** Usuario consultado */
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
  };
  
  /** Fecha consultada */
  fecha: string;
  
  /** Día de la semana */
  diaSemana: DiaSemana;
  
  /** Lista de slots de tiempo */
  slots: ISlotTiempo[];
  
  /** Resumen de disponibilidad */
  resumen: {
    totalSlots: number;
    slotsDisponibles: number;
    slotsOcupados: number;
    porcentajeDisponibilidad: number;
  };
}

/**
 * Tipo para operaciones de disponibilidad
 * 
 * Define las operaciones posibles en el sistema.
 */
export type OperacionDisponibilidad = 
  | 'crear' 
  | 'actualizar' 
  | 'eliminar' 
  | 'consultar' 
  | 'validar' 
  | 'crear_masivo';

/**
 * Tipo para estado de disponibilidad
 * 
 * Estados posibles de una disponibilidad.
 */
export type EstadoDisponibilidad = 
  | 'activa' 
  | 'inactiva' 
  | 'conflicto' 
  | 'pendiente_validacion';

/**
 * Tipo para rangos horarios predefinidos
 * 
 * Rangos comunes para facilitar la configuración.
 */
export type RangoHorario = 
  | 'mañana' 
  | 'tarde' 
  | 'noche' 
  | 'jornada_completa' 
  | 'personalizado';
