import { EstadoPrescripcion } from '@prisma/client';

/**
 * Interface principal para Prescripción Médica
 * Representa una prescripción completa con toda su información farmacológica
 * Integra con el sistema de casos clínicos y validaciones médicas
 */
export interface IPrescripcion {
  id: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  estado: EstadoPrescripcion;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  casoClinicoId: number;
  concentracion: string;
  Nrodefarmacos: number;
  presentacion: string;
  viadeadministracion: string;
}

/**
 * Interface para prescripción con información del caso clínico relacionado
 * Útil para listados y vistas que requieren contexto del paciente
 */
export interface IPrescripcionConCaso extends IPrescripcion {
  nombrePaciente: string;
  nombreEstudiante: string;
  nombreDocente?: string;
  especialidad: string;
  motivoConsulta: string;
  estadoCasoClinico: string;
}

/**
 * Interface para resumen de prescripción en listados
 * Optimizada para performance en consultas masivas
 */
export interface IPrescripcionResumen {
  id: number;
  medicamento: string;
  dosis: string;
  estado: EstadoPrescripcion;
  fechaCreacion: Date;
  nombrePaciente: string;
  nombreEstudiante: string;
  casoClinicoId: number;
  concentracion: string;
  presentacion: string;
}

/**
 * Interface para filtros de búsqueda de prescripciones
 * Permite filtrado avanzado por múltiples criterios
 */
export interface IFiltrosPrescripciones {
  casoClinicoId?: number;
  estudianteId?: number;
  docenteId?: number;
  estado?: EstadoPrescripcion;
  medicamento?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string; // Búsqueda por medicamento, dosis o concentración
  conObservaciones?: boolean;
  pagina?: number;
  limite?: number;
  ordenarPor?: 'fechaCreacion' | 'fechaActualizacion' | 'medicamento' | 'estado';
  direccion?: 'asc' | 'desc';
}

/**
 * Interface para estadísticas de prescripciones
 * Proporciona métricas útiles para análisis médico y administrativo
 */
export interface IEstadisticasPrescripciones {
  total: number;
  porEstado: Record<EstadoPrescripcion, number>;
  porMedicamento: { [medicamento: string]: number };
  porViaAdministracion: { [via: string]: number };
  porPresentacion: { [presentacion: string]: number };
  prescripcionesDelMes: number;
  tiempoPromedioAprobacion?: number; // En días
  porcentajeAprobacion: number;
  medicamentosMasPrescritos: Array<{
    medicamento: string;
    concentracion: string;
    cantidad: number;
    porcentaje: number;
  }>;
  prescripcionesPorEstudiante: Array<{
    estudianteId: number;
    nombreEstudiante: string;
    total: number;
    aprobadas: number;
    pendientes: number;
    rechazadas: number;
  }>;
}

/**
 * Interface para validación de interacciones medicamentosas
 * Permite validar conflictos entre medicamentos del mismo paciente
 */
export interface IValidacionInteracciones {
  prescripcionId: number;
  tieneInteracciones: boolean;
  interaccionesEncontradas: Array<{
    medicamentoConflicto: string;
    prescripcionConflictoId: number;
    tipoInteraccion: 'LEVE' | 'MODERADA' | 'SEVERA';
    descripcion: string;
    recomendacion?: string;
  }>;
  advertencias: string[];
  requiereAprobacionEspecial: boolean;
}

/**
 * Interface para validación de dosificación
 * Valida que la dosis sea apropiada según parámetros del paciente
 */
export interface IValidacionDosificacion {
  prescripcionId: number;
  dosisApropiada: boolean;
  dosisRecomendada?: string;
  factoresConsiderados: Array<{
    factor: string;
    valor: string;
    impacto: 'AUMENTA_DOSIS' | 'REDUCE_DOSIS' | 'SIN_EFECTO';
  }>;
  advertenciasDosis: string[];
  requiereAjuste: boolean;
  motivoAjuste?: string;
}

/**
 * Interface para historial de cambios de prescripción
 * Mantiene trazabilidad de todas las modificaciones
 */
export interface IHistorialPrescripcion {
  id: number;
  prescripcionId: number;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
  fechaCambio: Date;
  usuarioId: number;
  nombreUsuario: string;
  motivo?: string;
  tipoOperacion: 'CREACION' | 'MODIFICACION' | 'CAMBIO_ESTADO' | 'CANCELACION';
}

/**
 * Interface para reporte de prescripciones por período
 * Útil para análisis farmacológico y auditorías
 */
export interface IReportePrescripciones {
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  totalPrescripciones: number;
  prescripcionesPorEstado: Record<EstadoPrescripcion, number>;
  medicamentosMasPrescritos: Array<{
    medicamento: string;
    concentracion: string;
    cantidad: number;
    estudiantes: number; // Cuántos estudiantes diferentes lo prescribieron
  }>;
  estudiantes: Array<{
    id: number;
    nombre: string;
    apellido: string;
    totalPrescripciones: number;
    tasaAprobacion: number;
  }>;
  docentes: Array<{
    id: number;
    nombre: string;
    apellido: string;
    prescripcionesRevisadas: number;
    tasaAprobacion: number;
  }>;
}

/**
 * Interface para validación de finalización de prescripción
 * Verifica que todos los parámetros estén completos para finalizar
 */
export interface IValidacionFinalizacionPrescripcion {
  prescripcionId: number;
  puedeFinalizarse: boolean;
  camposFaltantes: string[];
  validacionesPendientes: string[];
  observacionesRequeridas: boolean;
  aprobacionDocenteRequerida: boolean;
  motivo: string;
}

/**
 * Interface para búsqueda inteligente de medicamentos
 * Ayuda en la creación de prescripciones con sugerencias
 */
export interface ISugerenciaMedicamento {
  medicamento: string;
  concentracion: string;
  presentacion: string;
  viasAdministracion: string[];
  dosisComunes: string[];
  frecuenciasComunes: string[];
  duracionesComunes: string[];
  indicacionesPrincipales: string[];
  contraindicacionesImportantes: string[];
  interaccionesComunes: string[];
}

/**
 * Interface para prescripción con información del paciente
 * Incluye datos necesarios para validaciones clínicas
 */
export interface IPrescripcionConPaciente extends IPrescripcion {
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
    edad: number;
    peso?: number;
    talla?: number;
    genero: string;
    alergias?: string[];
    condicionesMedicas?: string[];
  };
  casoClinico: {
    id: number;
    motivoConsulta: string;
    enfermedadActual: string;
    estado: string;
  };
}
