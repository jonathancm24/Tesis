/**
 * Servicio para gestión de preguntas clínicas por especialidad
 * Permite a los profesores administrar preguntas específicas para sus especialidades
 * @author Sistema de Gestión Clínica
 * @version 1.0
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtiene headers de autenticación con el token JWT
 * @returns Headers con autorización y tipo de contenido
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

/**
 * Interfaz para definir el tipo de pregunta
 */
export enum TipoPregunta {
  TEXTO = 'TEXTO',
  OPCION_MULTIPLE = 'OPCION_MULTIPLE',
  VERDADERO_FALSO = 'VERDADERO_FALSO',
  NUMERO = 'NUMERO',
  FECHA = 'FECHA',
  TEXTO_LARGO = 'TEXTO_LARGO'
}

/**
 * Interfaz para una pregunta clínica
 */
export interface PreguntaClinica {
  id?: number;
  texto: string;
  tipo: TipoPregunta;
  obligatoria: boolean;
  especialidadId?: number;
  especialidad?: {
    id: number;
    nombre: string;
  };
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

/**
 * Interfaz para los filtros de búsqueda
 */
export interface FiltrosPregunta {
  especialidadId?: number;
  tipo?: TipoPregunta;
  obligatoria?: boolean;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

/**
 * Interfaz para estadísticas de preguntas
 */
export interface EstadisticasPreguntas {
  totalPreguntas: number;
  preguntasObligatorias: number;
  preguntasOpcionales: number;
  distribuciunPorTipo: Record<string, number>;
}

/**
 * Obtiene todas las preguntas de una especialidad específica
 * @param especialidadId ID de la especialidad
 * @returns Lista de preguntas de la especialidad
 */
export async function fetchPreguntasPorEspecialidad(especialidadId: number): Promise<PreguntaClinica[]> {
  try {
    const response = await fetch(`${API_URL}/preguntas-clinicas/especialidad/${especialidadId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener preguntas por especialidad:', error);
    throw error;
  }
}

/**
 * Obtiene preguntas con filtros y paginación
 * @param filtros Filtros para la búsqueda
 * @returns Respuesta paginada con preguntas
 */
export async function fetchPreguntasConFiltros(filtros: FiltrosPregunta = {}): Promise<{
  data: PreguntaClinica[];
  total: number;
  pagina: number;
  limite: number;
}> {
  try {
    const url = new URL(`${API_URL}/preguntas-clinicas`);
    
    // Agregar parámetros de filtros
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener preguntas con filtros:', error);
    throw error;
  }
}

/**
 * Crea una nueva pregunta clínica
 * @param pregunta Datos de la pregunta a crear
 * @returns Pregunta creada
 */
export async function crearPregunta(pregunta: Omit<PreguntaClinica, 'id'>): Promise<PreguntaClinica> {
  try {
    const response = await fetch(`${API_URL}/preguntas-clinicas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pregunta),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    throw error;
  }
}

/**
 * Actualiza una pregunta clínica existente
 * @param id ID de la pregunta
 * @param pregunta Datos actualizados de la pregunta
 * @returns Pregunta actualizada
 */
export async function actualizarPregunta(id: number, pregunta: Partial<PreguntaClinica>): Promise<PreguntaClinica> {
  try {
    const response = await fetch(`${API_URL}/preguntas-clinicas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pregunta),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar pregunta:', error);
    throw error;
  }
}

/**
 * Elimina una pregunta clínica
 * @param id ID de la pregunta a eliminar
 */
export async function eliminarPregunta(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/preguntas-clinicas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error ${response.status}: ${errorData}`);
    }
  } catch (error) {
    console.error('Error al eliminar pregunta:', error);
    throw error;
  }
}

/**
 * Obtiene una pregunta por su ID
 * @param id ID de la pregunta
 * @returns Pregunta encontrada
 */
export async function fetchPreguntaPorId(id: number): Promise<PreguntaClinica> {
  try {
    const response = await fetch(`${API_URL}/preguntas-clinicas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener pregunta por ID:', error);
    throw error;
  }
}

/**
 * Crea múltiples preguntas en lote para una especialidad
 * @param especialidadId ID de la especialidad
 * @param preguntas Array de preguntas a crear
 * @returns Resultado de la operación en lote
 */
export async function crearPreguntasLote(
  especialidadId: number, 
  preguntas: Omit<PreguntaClinica, 'id' | 'especialidadId'>[]
): Promise<{ creadas: number; errores: any[] }> {
  try {
    const response = await fetch(`${API_URL}/preguntas-clinicas/lote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        especialidadId,
        preguntas
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear preguntas en lote:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de preguntas por especialidad
 * @param especialidadId ID de la especialidad (opcional)
 * @returns Estadísticas de preguntas
 */
export async function fetchEstadisticasPreguntas(especialidadId?: number): Promise<EstadisticasPreguntas> {
  try {
    const url = new URL(`${API_URL}/preguntas-clinicas/estadisticas/especialidad`);
    if (especialidadId) {
      url.searchParams.append('especialidadId', String(especialidadId));
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas de preguntas:', error);
    throw error;
  }
}

/**
 * Obtiene todas las especialidades disponibles
 * @returns Lista de especialidades
 */
export async function fetchEspecialidades(): Promise<{ id: number; nombre: string; descripcion?: string }[]> {
  try {
    const response = await fetch(`${API_URL}/especialidades`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    throw error;
  }
}

/**
 * Obtiene las especialidades asignadas al profesor autenticado
 * @returns Lista de especialidades del profesor
 */
export async function fetchEspecialidadesProfesor(id: number | undefined): Promise<{ id: number; nombre: string; descripcion?: string }[]> {
  try {
    const response = await fetch(`${API_URL}/auth/perfil/especialidades`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // Si no hay endpoint específico o hay error, usar el general como fallback
      if (response.status === 404 || response.status === 400) {
        console.warn('Fallback: usando todas las especialidades');
        return await fetchEspecialidades();
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.especialidades || [];
  } catch (error) {
    console.error('Error al obtener especialidades del profesor:', error);
    // Fallback a todas las especialidades si hay error
    return await fetchEspecialidades();
  }
}
