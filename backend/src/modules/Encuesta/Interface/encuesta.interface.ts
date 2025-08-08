/**
 * Interface para una pregunta de tamizaje completa
 * Representa las preguntas médicas que se hacen a los pacientes
 */
export interface IPreguntaTamizaje {
  id: number;
  texto: string;
  tipo: string;
  categoria?: string;
  orden?: number;
  soloMujer: boolean;
  requiereDetalle: boolean;
}

/**
 * Interface para la respuesta de una pregunta individual
 * Representa la respuesta específica de un paciente a una pregunta
 */
export interface IRespuestaTamizaje {
  id: number;
  preguntaId: number;
  respuesta?: string;
  detalle?: string;
  pregunta: IPreguntaTamizaje;
}

/**
 * Interface para la encuesta completa de tamizaje de un paciente
 * Contiene toda la información médica recopilada
 */
export interface IEncuestaTamizaje {
  id: number;
  pacienteId: number;
  fecha: Date;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    email?: string;
    genero?: string;
  };
  respuestas: IRespuestaTamizaje[];
}

/**
 * Interface para las preguntas organizadas por categoría
 * Útil para mostrar el formulario organizado en el frontend
 */
export interface IPreguntasPorCategoria {
  categoria: string;
  preguntas: IPreguntaTamizaje[];
}

/**
 * Interface para el formulario de tamizaje
 * Incluye las preguntas filtradas según el género del paciente
 */
export interface IFormularioTamizaje {
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    genero?: string;
  };
  preguntasPorCategoria: IPreguntasPorCategoria[];
  tieneEncuestaPrevia: boolean;
  fechaUltimaEncuesta?: Date;
}

/**
 * Interface para el resumen de antecedentes médicos
 * Organiza las respuestas para facilitar la creación del caso clínico
 */
export interface IAntecedentesMedicos {
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    genero?: string;
  };
  fechaEncuesta: Date;
  antecedentesPorCategoria: {
    categoria: string;
    respuestas: Array<{
      pregunta: string;
      respuesta: string;
      detalle?: string;
    }>;
  }[];
}
