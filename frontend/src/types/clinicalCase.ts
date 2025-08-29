// frontend/src/types/clinicalCase.ts

export const EstadoCasoClinico = {
  EN_REVISION: 'EN_REVISION',
  APROBADO: 'APROBADO', 
  PENDIENTE_ESTUDIOS: 'PENDIENTE_ESTUDIOS',
  EN_TRATAMIENTO: 'EN_TRATAMIENTO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO'
} as const;

export type EstadoCasoClinicoType = typeof EstadoCasoClinico[keyof typeof EstadoCasoClinico];

// Interface principal para casos clínicos
export interface CasoClinico {
  id: number;
  fechaCreacion: Date | string;
  fechaActualizacion: Date | string;
  pacienteId: number;
  profesorId: number;
  estudianteId: number;
  especialidadId: number;
  calificacion?: number;
  estado: EstadoCasoClinicoType;
  ATM: string;
  CarayCuello: string;
  PielyMucosa: string;
  craneo: string;
  enfermedadActual: string;
  facies: string;
  marcha: string;
  motivoConsulta: string;
  peso: number;
  talla: number;
  // Datos relacionados
  paciente?: {
    id: number;
    nombre: string;
    apellido: string;
    fechaNacimiento: Date | string;
    genero: string;
    numeroDocumento: string;
    tipoDocumento: string;
  };
  estudiante?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  profesor?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  especialidad?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  tratamientos?: Tratamiento[];
}

// Interface simplificada para listados y dashboard
export interface CasoClinicoResumen {
  id: number;
  fechaCreacion: Date | string;
  estado: EstadoCasoClinicoType;
  motivoConsulta: string;
  nombreEstudiante: string;
  nombreProfesor: string;
  nombrePaciente: string;
  nombreEspecialidad: string;
  calificacion?: number;
  totalTratamientos: number;
  tratamientosFinalizados: number;
  prioridad?: 'Alta' | 'Media' | 'Baja';
}

// Interface para tratamientos
export interface Tratamiento {
  id: number;
  descripcion: string;
  estado: string;
  fechaCreacion: Date | string;
  fechaFinalizacion?: Date | string;
}

// Interface para estadísticas del dashboard
export interface EstadisticasCasosClinico {
  total: number;
  porEstado: {
    [key in EstadoCasoClinicoType]: number;
  };
  porEspecialidad: {
    [key: string]: number;
  };
  promedioCalificacion?: number;
  casosDelMes: number;
  tiempoPromedioFinalizacion?: number;
  casosConTratamientos: number;
  casosSinTratamientos: number;
}

// Interface para filtros
export interface FiltrosCasosClinico {
  especialidadId?: number;
  estudianteId?: number;
  profesorId?: number;
  pacienteId?: number;
  estado?: EstadoCasoClinicoType;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  conTratamientos?: boolean;
  pagina?: number;
  limite?: number;
  ordenarPor?: string;
  direccion?: 'asc' | 'desc';
}

// Interface para respuesta paginada
export interface RespuestaPaginadaCasosClinico {
  data: CasoClinicoResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  hayPaginaSiguiente: boolean;
  hayPaginaAnterior: boolean;
}

// Interface para actividades del dashboard
export interface ActividadReciente {
  id: number;
  tipo: 'approval' | 'submission' | 'review' | 'rejection' | 'grade';
  titulo: string;
  descripcion: string;
  timestamp: string;
  casoId?: number;
  estudianteId?: number;
  estudianteNombre?: string;
}

// Interface para estadísticas de cursos
export interface EstadisticaCurso {
  nombre: string;
  totalEstudiantes: number;
  tasaCompleccion: number;
  casosPendientes: number;
  ultimaFechaCaso: string;
  promedioCalificacion?: number;
}

// DTOs para crear/actualizar casos
export interface CrearCasoClinicoDto {
  pacienteId: number;
  profesorId: number;
  estudianteId: number;
  especialidadId: number;
  motivoConsulta: string;
  enfermedadActual: string;
  ATM: string;
  CarayCuello: string;
  PielyMucosa: string;
  craneo: string;
  facies: string;
  marcha: string;
  peso: number;
  talla: number;
}

export interface ActualizarEstadoCasoDto {
  estado: EstadoCasoClinicoType;
  motivo?: string;
  observaciones?: string;
}

export interface AsignarCalificacionDto {
  calificacion: number;
  observaciones?: string;
}

// Interface para validación de finalización
export interface ValidacionFinalizacion {
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
