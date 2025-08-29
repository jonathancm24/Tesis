// src/services/professorDashboardService.ts
import type { 
  EstadisticasCasosClinico, 
  RespuestaPaginadaCasosClinico,
  FiltrosCasosClinico,
  ActividadReciente,
  EstadisticaCurso,
  ActualizarEstadoCasoDto,
  AsignarCalificacionDto,
  ValidacionFinalizacion
} from '@/types/clinicalCase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

// Obtener casos pendientes de revisión para el profesor logueado
export async function fetchPendingCases(): Promise<RespuestaPaginadaCasosClinico> {
  try {
    const response = await fetch(`${API_URL}/casos-clinicos/pendientes/atencion`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error('Error al obtener casos pendientes:', response.status);
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchPendingCases:', error);
    throw error;
  }
}

// Obtener casos del profesor con filtros
export async function fetchProfessorCases(profesorId: number, filtros: FiltrosCasosClinico = {}): Promise<RespuestaPaginadaCasosClinico> {
  try {
    const url = new URL(`${API_URL}/casos-clinicos/profesor/${profesorId}`);
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchProfessorCases:', error);
    throw error;
  }
}

// Obtener estadísticas del dashboard
export async function fetchDashboardStats(): Promise<EstadisticasCasosClinico> {
  try {
    const response = await fetch(`${API_URL}/casos-clinicos/estadisticas/resumen`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error('Error al obtener estadísticas:', response.status);
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchDashboardStats:', error);
    throw error;
  }
}

// Actualizar estado de un caso
export async function updateCaseStatus(casoId: number, updateDto: ActualizarEstadoCasoDto): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/casos-clinicos/${casoId}/estado`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateDto),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en updateCaseStatus:', error);
    throw error;
  }
}

// Asignar calificación a un caso
export async function assignGrade(casoId: number, gradeDto: AsignarCalificacionDto): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/casos-clinicos/${casoId}/calificacion`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(gradeDto),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en assignGrade:', error);
    throw error;
  }
}

// Validar finalización de caso
export async function validateCaseCompletion(casoId: number): Promise<ValidacionFinalizacion> {
  try {
    const response = await fetch(`${API_URL}/casos-clinicos/${casoId}/validar-finalizacion`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ casoClinicoId: casoId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en validateCaseCompletion:', error);
    throw error;
  }
}

// Obtener actividades recientes del profesor desde el backend
export async function fetchRecentActivities(): Promise<ActividadReciente[]> {
  try {
    // Para ahora usaremos casos recientes como actividades hasta que el backend implemente auditoria
    const professorId = getCurrentUserId();
    if (!professorId) {
      return [];
    }

    const response = await fetch(`${API_URL}/casos-clinicos/profesor/${professorId}?limite=10&pagina=1`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error('Error al obtener actividades recientes:', response.status);
      return [];
    }
    
    const casosResponse = await response.json();
    
    // Convertir casos recientes en actividades
    const activities: ActividadReciente[] = casosResponse.data.map((caso: any, index: number) => ({
      id: index + 1,
      tipo: caso.estado === 'APROBADO' ? 'approval' : caso.estado === 'EN_REVISION' ? 'review' : 'grade',
      titulo: getActivityTitle(caso.estado),
      descripcion: `${caso.nombreEspecialidad}: ${caso.nombreEstudiante} - ${caso.motivoConsulta?.substring(0, 50) || 'Caso clínico'}${caso.motivoConsulta?.length > 50 ? '...' : ''}`,
      timestamp: caso.fechaCreacion,
      casoId: caso.id,
      estudianteId: null,
      estudianteNombre: caso.nombreEstudiante
    }));

    return activities.slice(0, 5); // Solo las 5 más recientes
  } catch (error) {
    console.error('Error en fetchRecentActivities:', error);
    return [];
  }
}

function getActivityTitle(estado: string): string {
  const titles = {
    'EN_REVISION': 'Caso por revisar',
    'APROBADO': 'Caso aprobado',
    'PENDIENTE_ESTUDIOS': 'Pendiente estudios',
    'EN_TRATAMIENTO': 'En tratamiento',
    'FINALIZADO': 'Caso finalizado',
    'CANCELADO': 'Caso cancelado'
  };
  return titles[estado as keyof typeof titles] || 'Actividad en caso';
}

function getCurrentUserId(): number | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch (error) {
    console.error('Error obteniendo ID del usuario:', error);
    return null;
  }
}

// Obtener estadísticas de especialidades del profesor
export async function fetchCourseStats(): Promise<EstadisticaCurso[]> {
  try {
    const professorId = getCurrentUserId();
    if (!professorId) {
      return [];
    }

    // Obtener casos del profesor para calcular estadísticas específicas
    const casosResponse = await fetch(`${API_URL}/casos-clinicos/profesor/${professorId}`, {
      headers: getAuthHeaders(),
    });

    if (!casosResponse.ok) {
      console.error('Error al obtener casos del profesor:', casosResponse.status);
      return [];
    }

    const casosData = await casosResponse.json();
    const casos = casosData.data || [];

    // Agrupar por especialidad
    const especialidadesMap = new Map<string, any[]>();
    casos.forEach((caso: any) => {
      const especialidad = caso.nombreEspecialidad;
      if (!especialidadesMap.has(especialidad)) {
        especialidadesMap.set(especialidad, []);
      }
      especialidadesMap.get(especialidad)!.push(caso);
    });

    // Calcular estadísticas por especialidad
    const courseStats: EstadisticaCurso[] = Array.from(especialidadesMap.entries()).map(([nombre, casosEspecialidad]) => {
      const totalCasos = casosEspecialidad.length;
      const casosFinalizados = casosEspecialidad.filter(c => c.estado === 'FINALIZADO').length;
      const casosPendientes = casosEspecialidad.filter(c => c.estado === 'EN_REVISION').length;
      const casosConCalificacion = casosEspecialidad.filter(c => c.calificacion && c.calificacion > 0);
      
      // Obtener estudiantes únicos
      const estudiantesUnicos = new Set(casosEspecialidad.map(c => c.nombreEstudiante));
      
      const ultimaFecha = casosEspecialidad.reduce((latest, caso) => {
        const fecha = new Date(caso.fechaCreacion);
        return fecha > latest ? fecha : latest;
      }, new Date(0));

      return {
        nombre,
        totalEstudiantes: estudiantesUnicos.size,
        tasaCompleccion: totalCasos > 0 ? Math.round((casosFinalizados / totalCasos) * 100) : 0,
        casosPendientes,
        ultimaFechaCaso: ultimaFecha.toISOString(),
        promedioCalificacion: casosConCalificacion.length > 0 ? 
          casosConCalificacion.reduce((sum, c) => sum + c.calificacion, 0) / casosConCalificacion.length : 
          undefined
      };
    });

    return courseStats;
  } catch (error) {
    console.error('Error en fetchCourseStats:', error);
    return [];
  }
}

// Obtener caso específico por ID
export async function fetchCaseById(casoId: number): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/casos-clinicos/${casoId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchCaseById:', error);
    throw error;
  }
}
