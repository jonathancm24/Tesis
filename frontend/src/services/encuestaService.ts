import api from '@/config/api';

export interface PreguntaTamizaje {
  id: number;
  texto: string;
  tipo: string;
  categoria?: string;
  orden?: number;
  soloMujer: boolean;
  requiereDetalle: boolean;
}

export interface RespuestaTamizaje {
  id: number;
  preguntaId: number;
  respuesta?: string;
  detalle?: string;
  pregunta: PreguntaTamizaje;
}

export interface EncuestaTamizaje {
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
  respuestas: RespuestaTamizaje[];
}

export interface PreguntasPorCategoria {
  categoria: string;
  preguntas: PreguntaTamizaje[];
}

export interface FormularioTamizaje {
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    genero?: string;
  };
  preguntasPorCategoria: PreguntasPorCategoria[];
  tieneEncuestaPrevia: boolean;
  fechaUltimaEncuesta?: Date;
}

export interface AntecedentesMedicos {
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

export interface CrearRespuestaDto {
  preguntaId: number;
  respuesta?: string;
  detalle?: string;
}

export interface CrearEncuestaDto {
  pacienteId: number;
  respuestas: CrearRespuestaDto[];
}

class EncuestaService {
  private baseUrl = '/encuestas-tamizaje';

  /**
   * Obtiene el formulario de tamizaje para un paciente específico
   */
  async obtenerFormulario(pacienteId: number, genero?: string): Promise<FormularioTamizaje> {
    try {
      const params = genero ? `?genero=${genero}` : '';
      const response = await api.get(`${this.baseUrl}/formulario/${pacienteId}${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener formulario de tamizaje:', error);
      throw new Error('No se pudo cargar el formulario de tamizaje');
    }
  }

  /**
   * Crea una nueva encuesta con las respuestas del paciente
   */
  async crearEncuesta(encuestaData: CrearEncuestaDto): Promise<EncuestaTamizaje> {
    try {
      const response = await api.post(this.baseUrl, encuestaData);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear encuesta de tamizaje:', error);
      throw new Error('No se pudo guardar la encuesta de tamizaje');
    }
  }

  /**
   * Obtiene los antecedentes médicos organizados del paciente
   */
  async obtenerAntecedentes(pacienteId: number): Promise<AntecedentesMedicos> {
    try {
      const response = await api.get(`${this.baseUrl}/antecedentes/${pacienteId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener antecedentes médicos:', error);
      throw new Error('No se pudieron cargar los antecedentes médicos');
    }
  }

  /**
   * Verifica si un paciente ya tiene encuesta de tamizaje
   */
  async verificarEncuesta(pacienteId: number): Promise<{ tieneEncuesta: boolean; puedeCrearNueva: boolean }> {
    try {
      const response = await api.get(`${this.baseUrl}/verificar/${pacienteId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al verificar encuesta:', error);
      throw new Error('No se pudo verificar el estado de la encuesta');
    }
  }

  /**
   * Obtiene todas las preguntas organizadas (para administración)
   */
  async obtenerTodasLasPreguntas(): Promise<PreguntasPorCategoria[]> {
    try {
      const response = await api.get(`${this.baseUrl}/admin/preguntas`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      throw new Error('No se pudieron cargar las preguntas');
    }
  }
}

export const encuestaService = new EncuestaService();
