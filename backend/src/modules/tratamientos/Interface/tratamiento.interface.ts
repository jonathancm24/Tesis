import { EstadoTratamiento, TipoDiagnostico } from '@prisma/client';

/**
 * Interface que define la estructura de un tratamiento completo
 * Incluye toda la información médica y de estado del tratamiento
 */
export interface ITratamiento {
  id: number;
  estudianteId: number;
  docenteId?: number;
  descripcion: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  casoClinicoId: number;
  estado: EstadoTratamiento;
  cie10Codigo?: string;
  frecuenciaCardiaca: string;
  presArterial: string;
  procedimientoCodigo?: string;
  saturacionOxigeno: string;
  temperatura: string;
  tipoDiagnostico: TipoDiagnostico;
}

/**
 * Interface para filtros de búsqueda de tratamientos
 * Permite filtrar por diferentes criterios como estado, fecha, etc.
 */
export interface IFiltrosTratamientos {
  casoClinicoId?: number;
  estudianteId?: number;
  docenteId?: number;
  estado?: EstadoTratamiento;
  tipoDiagnostico?: TipoDiagnostico;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string; // Para buscar en descripción
}

/**
 * Interface para estadísticas de tratamientos
 * Proporciona métricas útiles para el panel de administración
 */
export interface IEstadisticasTratamientos {
  total: number;
  porEstado: {
    [key in EstadoTratamiento]: number;
  };
  porTipoDiagnostico: {
    [key in TipoDiagnostico]: number;
  };
  promedioTiempoAprobacion?: number; // en días
  tratamientosDelMes: number;
}

/**
 * Interface para el historial de cambios de estado
 * Registra quién y cuándo cambió el estado de un tratamiento
 */
export interface IHistorialEstado {
  id: number;
  tratamientoId: number;
  estadoAnterior: EstadoTratamiento;
  estadoNuevo: EstadoTratamiento;
  usuarioId: number;
  fechaCambio: Date;
  motivo?: string;
}

/**
 * Interface para datos básicos de un tratamiento en listados
 * Versión simplificada para mejorar rendimiento en consultas masivas
 */
export interface ITratamientoResumen {
  id: number;
  descripcion: string;
  estado: EstadoTratamiento;
  fechaCreacion: Date;
  nombreEstudiante: string;
  nombreDocente?: string;
  casoClinicoId: number;
  tipoDiagnostico: TipoDiagnostico;
}
