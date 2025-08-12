import { TipoPregunta } from '@prisma/client';

/**
 * Interface que define la estructura completa de una pregunta clínica
 * Incluye datos de la pregunta y su especialidad asociada
 */
export interface IPreguntaClinica {
  id: number;
  texto: string;
  tipo: TipoPregunta;
  obligatoria: boolean;
  especialidadId?: number;
  especialidad?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

/**
 * Interface para crear una nueva pregunta clínica
 * Define los campos mínimos necesarios para la creación
 */
export interface ICrearPreguntaClinica {
  texto: string;
  tipo: TipoPregunta;
  obligatoria?: boolean;
  especialidadId?: number;
}

/**
 * Interface para filtros de búsqueda de preguntas
 * Permite filtrar preguntas por diversos criterios
 */
export interface IFiltrosPreguntasClinicas {
  especialidadId?: number;
  tipo?: TipoPregunta;
  obligatoria?: boolean;
  busqueda?: string; // Búsqueda por texto
}

/**
 * Interface para paginación de preguntas
 * Estructura estándar para respuestas paginadas
 */
export interface IPreguntasClinicasPaginadas {
  preguntas: IPreguntaClinica[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limite: number;
}

/**
 * Interface para estadísticas de preguntas por especialidad
 * Útil para dashboards y reportes
 */
export interface IEstadisticasPreguntasEspecialidad {
  especialidadId: number;
  especialidadNombre: string;
  totalPreguntas: number;
  preguntasObligatorias: number;
  preguntasOpcionales: number;
  tiposPreguntas: {
    [key in TipoPregunta]: number;
  };
}
