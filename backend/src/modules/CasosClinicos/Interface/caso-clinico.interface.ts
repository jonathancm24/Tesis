import { EstadoCasoClinico } from '@prisma/client';

/**
 * Interface que define la estructura completa de un caso clínico
 * Incluye toda la información médica y académica del caso
 */
export interface ICasoClinico {
  id: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  pacienteId: number;
  profesorId: number;
  estudianteId: number;
  especialidadId: number;
  calificacion?: number;
  estado: EstadoCasoClinico;
  ATM: string; // Articulación Temporomandibular
  CarayCuello: string;
  PielyMucosa: string;
  craneo: string;
  enfermedadActual: string;
  facies: string;
  marcha: string;
  motivoConsulta: string;
  peso: number;
  talla: number;
}

/**
 * Interface para filtros de búsqueda de casos clínicos
 * Permite filtrar por diferentes criterios como estado, especialidad, etc.
 */
export interface IFiltrosCasosClinico {
  especialidadId?: number;
  estudianteId?: number;
  profesorId?: number;
  pacienteId?: number;
  estado?: EstadoCasoClinico;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string; // Para buscar en motivo consulta o enfermedad actual
  conTratamientos?: boolean; // Solo casos que tienen tratamientos
}

/**
 * Interface para estadísticas de casos clínicos
 * Proporciona métricas útiles para el panel de administración
 */
export interface IEstadisticasCasosClinico {
  total: number;
  porEstado: {
    [key in EstadoCasoClinico]: number;
  };
  porEspecialidad: {
    [key: string]: number; // nombre especialidad -> count
  };
  promedioCalificacion?: number;
  casosDelMes: number;
  tiempoPromedioFinalizacion?: number; // en días
  casosConTratamientos: number;
  casosSinTratamientos: number;
}

/**
 * Interface para el resumen de un caso clínico en listados
 * Versión simplificada para mejorar rendimiento en consultas masivas
 */
export interface ICasoClinicoResumen {
  id: number;
  fechaCreacion: Date;
  estado: EstadoCasoClinico;
  motivoConsulta: string;
  nombreEstudiante: string;
  nombreProfesor: string;
  nombrePaciente: string;
  nombreEspecialidad: string;
  calificacion?: number;
  totalTratamientos: number;
  tratamientosFinalizados: number;
}

/**
 * Interface para validar si un caso puede ser finalizado
 * Verifica que todos los tratamientos estén completos
 */
export interface IValidacionFinalizacion {
  puedeFinalizarse: boolean;
  tratamientosTotal: number;
  tratamientosFinalizados: number;
  tratamientosPendientes: number;
  motivo: string;
  tratamientosSinFinalizar?: Array<{
    id: number;
    descripcion: string;
    estado: string;
  }>;
}

/**
 * Interface para el historial académico de un caso
 * Incluye calificaciones y observaciones del profesor
 */
export interface IHistorialAcademico {
  id: number;
  casoClinicoId: number;
  fecha: Date;
  calificacionAnterior?: number;
  calificacionNueva?: number;
  observacion: string;
  profesorId: number;
  nombreProfesor: string;
  tipo: 'CALIFICACION' | 'OBSERVACION' | 'CAMBIO_ESTADO';
}

/**
 * Interface para datos del paciente en el contexto del caso clínico
 * Información relevante sin datos sensibles completos
 */
export interface IPacienteCasoClinico {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  edad: number;
  genero: string;
  numeroDocumento: string;
  tipoDocumento: string;
}
