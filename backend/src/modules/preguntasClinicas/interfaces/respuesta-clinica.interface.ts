/**
 * Interface que define la estructura completa de una respuesta clínica
 * Incluye la respuesta y sus relaciones con pregunta y caso clínico
 */
export interface IRespuestaClinica {
  id: number;
  casoClinicoId: number;
  preguntaId: number;
  respuesta: string;
  pregunta?: {
    id: number;
    texto: string;
    tipo: string;
    obligatoria: boolean;
  };
  casoClinico?: {
    id: number;
    paciente: {
      nombre: string;
      apellido: string;
    };
    estudiante: {
      nombre: string;
      apellido: string;
    };
  };
}

/**
 * Interface para crear una nueva respuesta clínica
 * Define los campos mínimos necesarios para la creación
 */
export interface ICrearRespuestaClinica {
  casoClinicoId: number;
  preguntaId: number;
  respuesta: string;
}

/**
 * Interface para respuestas agrupadas por caso clínico
 * Útil para mostrar todas las respuestas de un caso específico
 */
export interface IRespuestasPorCasoClinico {
  casoClinicoId: number;
  respuestas: {
    preguntaId: number;
    preguntaTexto: string;
    respuesta: string;
    obligatoria: boolean;
  }[];
  completitud: {
    totalPreguntas: number;
    preguntasRespondidas: number;
    porcentajeCompletitud: number;
    preguntasObligatoriasRespondidas: number;
    totalPreguntasObligatorias: number;
  };
}

/**
 * Interface para validar respuestas de un cuestionario
 * Incluye información sobre completitud y validez
 */
export interface IValidacionRespuestas {
  esValido: boolean;
  errores: string[];
  advertencias: string[];
  preguntasObligatoriasNoRespondidas: number[];
  completitudPorcentaje: number;
}

/**
 * Interface para estadísticas de respuestas
 * Útil para análisis y reportes de casos clínicos
 */
export interface IEstadisticasRespuestas {
  totalRespuestas: number;
  casosConRespuestas: number;
  promedioRespuestasPorCaso: number;
  respuestasPorEspecialidad: {
    especialidadId: number;
    especialidadNombre: string;
    totalRespuestas: number;
    casosCompletados: number;
  }[];
}

/**
 * Interfaz para definir los filtros de búsqueda de respuestas clínicas
 */
export interface IFiltrosRespuestasClinicas {
  /** ID del caso clínico para filtrar respuestas */
  casoClinicoId?: number;
  
  /** ID de la pregunta específica */
  preguntaId?: number;
  
  /** ID de la especialidad para filtrar por especialidad de la pregunta */
  especialidadId?: number;
  
  /** Fecha desde para filtrar respuestas por fecha de creación */
  fechaDesde?: string;
  
  /** Fecha hasta para filtrar respuestas por fecha de creación */
  fechaHasta?: string;
  
  /** Término de búsqueda en respuesta u observaciones */
  busqueda?: string;
}

/**
 * Interfaz para el resultado paginado de respuestas clínicas
 */
export interface IRespuestasClinicasPaginadas {
  /** Lista de respuestas en la página actual */
  respuestas: IRespuestaClinica[];
  
  /** Total de respuestas que coinciden con los filtros */
  total: number;
  
  /** Página actual */
  pagina: number;
  
  /** Total de páginas disponibles */
  totalPaginas: number;
  
  /** Número de elementos por página */
  limite: number;
}

/**
 * Interfaz para validación de respuestas clínicas
 */
export interface IValidacionRespuestaClinica {
  /** Indica si todas las validaciones pasaron */
  esValido: boolean;
  
  /** Lista de errores encontrados */
  errores: string[];
  
  /** Lista de advertencias no críticas */
  advertencias: string[];
  
  /** Total de preguntas que deberían tener respuesta */
  totalPreguntas: number;
  
  /** Número de preguntas que tienen respuesta */
  preguntasRespondidas: number;
  
  /** Número de preguntas obligatorias sin responder */
  preguntasFaltantes: number;
}
