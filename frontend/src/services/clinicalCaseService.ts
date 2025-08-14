/**
 * Servicio para la gestión de casos clínicos
 * Maneja todas las operaciones CRUD de casos clínicos, preguntas clínicas,
 * hallazgos odontológicos y gestión de archivos
 * 
 * @author Sistema Dental
 * @version 1.0
 */

import api from '@/config/api';
import { authService } from '@/services/authService';

// ============================================
// INTERFACES Y TIPOS
// ============================================

export interface CasoClinicoBasico {
  id: number;
  pacienteId: number;
  profesorId: number;
  estudianteId: number;
  especialidadId: number;
  estado: EstadoCasoClinico;
  motivoConsulta: string;
  enfermedadActual: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  calificacion?: number;
  
  // Información relacionada
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDocumento: string;
    fechaNacimiento: Date;
    edad: number;
  };
  
  profesor: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  
  especialidad: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface CasoClinicoDetalle extends CasoClinicoBasico {
  // Información física completa
  ATM: string;
  CarayCuello: string;
  PielyMucosa: string;
  craneo: string;
  facies: string;
  marcha: string;
  peso: number;
  talla: number;
  
  // Fechas adicionales
  fechaFinalizado?: Date;
  
  // Relaciones
  hallazgos: HallazgoClinico[];
  respuestasClinicas: RespuestaClinica[];
  archivos: ArchivoRelacionado[];
  tratamientos: TratamientoRelacionado[];
}

export interface CrearCasoClinicoRequest {
  pacienteId: number;
  profesorId: number;
  especialidadId: number;
  
  // Información básica requerida
  motivoConsulta: string;
  enfermedadActual: string;
  
  // Examen físico
  ATM: string;
  CarayCuello: string;
  PielyMucosa: string;
  craneo: string;
  facies: string;
  marcha: string;
  peso: number;
  talla: number;
  
  // Hallazgos y respuestas (opcionales al crear)
  hallazgos?: CrearHallazgoRequest[];
  respuestasClinicas?: CrearRespuestaClinicaRequest[];
}

export interface ActualizarCasoClinicoRequest {
  motivoConsulta?: string;
  enfermedadActual?: string;
  ATM?: string;
  CarayCuello?: string;
  PielyMucosa?: string;
  craneo?: string;
  facies?: string;
  marcha?: string;
  peso?: number;
  talla?: number;
}

export interface HallazgoClinico {
  id: number;
  casoClinicoId: number;
  diente?: string;
  superficie?: string;
  condicion: string;
  descripcion: string;
  fechaRegistro: Date;
  
  // Información de mucosa oral
  ubicacionMucosa?: string;
  caracteristicas?: string;
}

export interface CrearHallazgoRequest {
  diente?: string;
  superficie?: string;
  condicion: string;
  descripcion: string;
  ubicacionMucosa?: string;
  caracteristicas?: string;
}

export interface PreguntaClinica {
  id: number;
  especialidadId: number;
  pregunta: string;
  tipo: TipoPregunta;
  obligatoria: boolean;
  opciones?: string[]; // Para preguntas de opción múltiple
  orden: number;
}

export interface RespuestaClinica {
  id: number;
  preguntaId: number;
  casoClinicoId: number;
  respuesta: string;
  fechaRespuesta: Date;
  
  pregunta: PreguntaClinica;
}

export interface CrearRespuestaClinicaRequest {
  preguntaId: number;
  respuesta: string;
}

export interface ArchivoRelacionado {
  id: number;
  nombre: string;
  tipo: TipoArchivo;
  url: string;
  descripcion?: string;
  fechaSubida: Date;
  
  // Información del usuario que subió
  subidoPor: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface SolicitudEstudio {
  tipoEstudio: string;
  descripcion: string;
  urgente: boolean;
  observaciones?: string;
}

export interface TratamientoRelacionado {
  id: number;
  descripcion: string;
  estado: EstadoTratamiento;
  fechaCreacion: Date;
}

// Enums
export enum EstadoCasoClinico {
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  PENDIENTE_ESTUDIOS = 'PENDIENTE_ESTUDIOS',
  EN_TRATAMIENTO = 'EN_TRATAMIENTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

export enum TipoPregunta {
  TEXTO = 'TEXTO',
  NUMERO = 'NUMERO',
  OPCION_MULTIPLE = 'OPCION_MULTIPLE',
  VERDADERO_FALSO = 'VERDADERO_FALSO',
  FECHA = 'FECHA',
  TEXTO_LARGO = 'TEXTO_LARGO'
}

export enum TipoArchivo {
  RADIOGRAFIA = 'RADIOGRAFIA',
  FOTOGRAFIA_CLINICA = 'FOTOGRAFIA_CLINICA',
  DOCUMENTO = 'DOCUMENTO',
  ESTUDIO = 'ESTUDIO'
}

export enum EstadoTratamiento {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  EN_PROCESO = 'EN_PROCESO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

// Filtros y paginación
export interface FiltrosCasosClinico {
  pacienteId?: number;
  profesorId?: number;
  estudianteId?: number;
  especialidadId?: number;
  estado?: EstadoCasoClinico;
  busqueda?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  pagina?: number;
  limite?: number;
}

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

class ClinicalCaseService {

  constructor() {
    console.log('🏥 ClinicalCaseService inicializado');
  }

  // ========================================
  // GESTIÓN BÁSICA DE CASOS CLÍNICOS
  // ========================================

  /**
   * Verifica si un paciente puede tener un caso clínico creado
   * Valida que tenga al menos una encuesta de tamizaje completada
   */
  async verificarElegibilidadPaciente(pacienteId: number): Promise<boolean> {
    try {
      const response = await api.get(`/pacientes/${pacienteId}/elegibilidad-caso-clinico`);
      return response.data.elegible || false;
    } catch (error) {
      console.error('Error al verificar elegibilidad del paciente:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo caso clínico
   * Valida elegibilidad del paciente antes de crear
   */
  async crearCasoClinico(datos: CrearCasoClinicoRequest): Promise<CasoClinicoDetalle> {
    try {
      // Verificar elegibilidad del paciente
      const esElegible = await this.verificarElegibilidadPaciente(datos.pacienteId);
      if (!esElegible) {
        throw new Error('El paciente debe tener al menos una encuesta de tamizaje completada');
      }

      // Obtener ID del estudiante actual
      const estudianteId = authService.getCurrentUserId();
      if (!estudianteId) {
        throw new Error('No se pudo identificar al estudiante actual');
      }

      const datosCompletos = {
        ...datos,
        estudianteId
      };

      console.log('🏥 Creando caso clínico:', datosCompletos);
      const response = await api.post<CasoClinicoDetalle>('/casos-clinicos', datosCompletos);
      
      console.log('✅ Caso clínico creado exitosamente:', response.data.id);
      return this.procesarCasoClinico(response.data);
    } catch (error: any) {
      console.error('❌ Error al crear caso clínico:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el caso clínico');
    }
  }

  /**
   * Obtiene casos clínicos con filtros
   */
  async obtenerCasosClinico(filtros: FiltrosCasosClinico = {}): Promise<RespuestaPaginada<CasoClinicoBasico>> {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId.toString());
      if (filtros.profesorId) params.append('profesorId', filtros.profesorId.toString());
      if (filtros.estudianteId) params.append('estudianteId', filtros.estudianteId.toString());
      if (filtros.especialidadId) params.append('especialidadId', filtros.especialidadId.toString());
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta.toISOString());
      if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
      if (filtros.limite) params.append('limite', filtros.limite.toString());

      const response = await api.get<any>('/casos-clinicos', { params });
      
      return {
        datos: response.data.datos.map((caso: any) => this.procesarCasoClinicoBasico(caso)),
        total: response.data.total,
        pagina: response.data.pagina,
        limite: response.data.limite,
        totalPaginas: response.data.totalPaginas
      };
    } catch (error) {
      console.error('Error al obtener casos clínicos:', error);
      return {
        datos: [],
        total: 0,
        pagina: 1,
        limite: 10,
        totalPaginas: 0
      };
    }
  }

  /**
   * Obtiene un caso clínico por ID con toda la información detallada
   */
  async obtenerCasoClinicoPorId(id: number): Promise<CasoClinicoDetalle | null> {
    try {
      console.log(`🔍 Obteniendo caso clínico ${id}`);
      const response = await api.get<CasoClinicoDetalle>(`/casos-clinicos/${id}`);
      
      return this.procesarCasoClinico(response.data);
    } catch (error: any) {
      console.error('Error al obtener caso clínico:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error('Error al obtener el caso clínico');
    }
  }

  /**
   * Actualiza información básica de un caso clínico
   * Solo permite edición si el caso está EN_REVISION
   */
  async actualizarCasoClinico(id: number, datos: ActualizarCasoClinicoRequest): Promise<CasoClinicoDetalle> {
    try {
      console.log(`📝 Actualizando caso clínico ${id}`);
      const response = await api.put<CasoClinicoDetalle>(`/casos-clinicos/${id}/basico`, datos);
      
      return this.procesarCasoClinico(response.data);
    } catch (error: any) {
      console.error('Error al actualizar caso clínico:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el caso clínico');
    }
  }

  /**
   * Obtiene casos del estudiante actual
   */
  async obtenerMisCasos(filtros: Omit<FiltrosCasosClinico, 'estudianteId'> = {}): Promise<RespuestaPaginada<CasoClinicoBasico>> {
    const estudianteId = authService.getCurrentUserId();
    if (!estudianteId) {
      throw new Error('No se pudo identificar al estudiante actual');
    }

    return this.obtenerCasosClinico({
      ...filtros,
      estudianteId
    });
  }

  // ========================================
  // GESTIÓN DE PREGUNTAS CLÍNICAS
  // ========================================

  /**
   * Obtiene preguntas clínicas por especialidad
   */
  async obtenerPreguntasPorEspecialidad(especialidadId: number): Promise<PreguntaClinica[]> {
    try {
      console.log(`❓ Obteniendo preguntas para especialidad ${especialidadId}`);
      const response = await api.get<PreguntaClinica[]>(`/preguntas-clinicas/especialidad/${especialidadId}`);
      
      return response.data.sort((a, b) => a.orden - b.orden);
    } catch (error) {
      console.error('Error al obtener preguntas clínicas:', error);
      return [];
    }
  }

  /**
   * Guarda respuestas a preguntas clínicas
   */
  async guardarRespuestasClinicas(casoClinicoId: number, respuestas: CrearRespuestaClinicaRequest[]): Promise<RespuestaClinica[]> {
    try {
      console.log(`💬 Guardando ${respuestas.length} respuestas para caso ${casoClinicoId}`);
      
      const respuestasConCaso = respuestas.map(r => ({
        ...r,
        casoClinicoId
      }));

      const response = await api.post<RespuestaClinica[]>('/preguntas-clinicas/respuestas/lote', {
        casoClinicoId,
        respuestas: respuestasConCaso
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error al guardar respuestas clínicas:', error);
      throw new Error(error.response?.data?.message || 'Error al guardar las respuestas');
    }
  }

  /**
   * Obtiene respuestas de un caso clínico
   */
  async obtenerRespuestasPorCaso(casoClinicoId: number): Promise<RespuestaClinica[]> {
    try {
      const response = await api.get<RespuestaClinica[]>(`/preguntas-clinicas/respuestas/caso/${casoClinicoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener respuestas del caso:', error);
      return [];
    }
  }

  // ========================================
  // GESTIÓN DE HALLAZGOS CLÍNICOS
  // ========================================

  /**
   * Guarda hallazgos clínicos (odontograma y mucosa oral)
   */
  async guardarHallazgos(casoClinicoId: number, hallazgos: CrearHallazgoRequest[]): Promise<HallazgoClinico[]> {
    try {
      console.log(`🦷 Guardando ${hallazgos.length} hallazgos para caso ${casoClinicoId}`);
      
      const hallazgosConCaso = hallazgos.map(h => ({
        ...h,
        casoClinicoId
      }));

      const response = await api.post<HallazgoClinico[]>('/hallazgos-clinicos/lote', {
        casoClinicoId,
        hallazgos: hallazgosConCaso
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error al guardar hallazgos:', error);
      throw new Error(error.response?.data?.message || 'Error al guardar los hallazgos');
    }
  }

  /**
   * Obtiene hallazgos de un caso clínico
   */
  async obtenerHallazgosPorCaso(casoClinicoId: number): Promise<HallazgoClinico[]> {
    try {
      const response = await api.get<HallazgoClinico[]>(`/hallazgos-clinicos/caso/${casoClinicoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener hallazgos del caso:', error);
      return [];
    }
  }

  // ========================================
  // GESTIÓN DE ESTUDIOS Y ARCHIVOS
  // ========================================

  /**
   * Solicita estudios adicionales para un caso clínico
   * Esto creará una cita pendiente para los estudios
   */
  async solicitarEstudios(casoClinicoId: number, solicitud: SolicitudEstudio): Promise<boolean> {
    try {
      console.log(`📋 Solicitando estudios para caso ${casoClinicoId}`);
      
      await api.post(`/casos-clinicos/${casoClinicoId}/solicitar-estudios`, solicitud);
      
      // Cambiar estado del caso a PENDIENTE_ESTUDIOS
      await api.patch(`/casos-clinicos/${casoClinicoId}/estado`, {
        estado: EstadoCasoClinico.PENDIENTE_ESTUDIOS,
        profesorId: authService.getCurrentUserId(),
        motivo: `Estudios solicitados: ${solicitud.tipoEstudio}`
      });
      
      console.log('✅ Estudios solicitados exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error al solicitar estudios:', error);
      throw new Error(error.response?.data?.message || 'Error al solicitar estudios');
    }
  }

  /**
   * Sube un archivo relacionado al caso clínico
   */
  async subirArchivo(casoClinicoId: number, archivo: File, tipo: TipoArchivo, descripcion?: string): Promise<ArchivoRelacionado> {
    try {
      console.log(`📎 Subiendo archivo para caso ${casoClinicoId}`);
      
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('tipo', tipo);
      formData.append('casoClinicoId', casoClinicoId.toString());
      if (descripcion) {
        formData.append('descripcion', descripcion);
      }

      const response = await api.post<ArchivoRelacionado>('/archivos/caso-clinico', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Archivo subido exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      throw new Error(error.response?.data?.message || 'Error al subir el archivo');
    }
  }

  /**
   * Obtiene archivos de un caso clínico
   */
  async obtenerArchivosPorCaso(casoClinicoId: number): Promise<ArchivoRelacionado[]> {
    try {
      const response = await api.get<ArchivoRelacionado[]>(`/archivos/caso-clinico/${casoClinicoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener archivos del caso:', error);
      return [];
    }
  }

  // ========================================
  // MÉTODOS UTILITARIOS
  // ========================================

  /**
   * Procesa un caso clínico básico del backend
   */
  private procesarCasoClinicoBasico(caso: any): CasoClinicoBasico {
    return {
      ...caso,
      fechaCreacion: new Date(caso.fechaCreacion),
      fechaActualizacion: new Date(caso.fechaActualizacion),
      paciente: {
        ...caso.paciente,
        fechaNacimiento: new Date(caso.paciente.fechaNacimiento),
        edad: this.calcularEdad(new Date(caso.paciente.fechaNacimiento))
      }
    };
  }

  /**
   * Procesa un caso clínico detallado del backend
   */
  private procesarCasoClinico(caso: any): CasoClinicoDetalle {
    const casoBasico = this.procesarCasoClinicoBasico(caso);
    
    return {
      ...casoBasico,
      // Información física completa
      ATM: caso.ATM || '',
      CarayCuello: caso.CarayCuello || '',
      PielyMucosa: caso.PielyMucosa || '',
      craneo: caso.craneo || '',
      facies: caso.facies || '',
      marcha: caso.marcha || '',
      peso: caso.peso || 0,
      talla: caso.talla || 0,
      
      // Fechas adicionales
      fechaFinalizado: caso.fechaFinalizado ? new Date(caso.fechaFinalizado) : undefined,
      
      // Relaciones
      hallazgos: caso.hallazgos?.map((h: any) => ({
        ...h,
        fechaRegistro: new Date(h.fechaRegistro)
      })) || [],
      respuestasClinicas: caso.respuestasClinicas?.map((r: any) => ({
        ...r,
        fechaRespuesta: new Date(r.fechaRespuesta)
      })) || [],
      archivos: caso.archivos?.map((a: any) => ({
        ...a,
        fechaSubida: new Date(a.fechaSubida)
      })) || [],
      tratamientos: caso.tratamientos?.map((t: any) => ({
        ...t,
        fechaCreacion: new Date(t.fechaCreacion)
      })) || []
    };
  }

  /**
   * Calcula la edad a partir de la fecha de nacimiento
   */
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    
    if (mesActual < fechaNacimiento.getMonth() || 
        (mesActual === fechaNacimiento.getMonth() && diaActual < fechaNacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Obtiene la etiqueta legible para un estado
   */
  getEstadoLabel(estado: EstadoCasoClinico): string {
    const labels = {
      [EstadoCasoClinico.EN_REVISION]: 'En Revisión',
      [EstadoCasoClinico.APROBADO]: 'Aprobado',
      [EstadoCasoClinico.PENDIENTE_ESTUDIOS]: 'Pendiente Estudios',
      [EstadoCasoClinico.EN_TRATAMIENTO]: 'En Tratamiento',
      [EstadoCasoClinico.FINALIZADO]: 'Finalizado',
      [EstadoCasoClinico.CANCELADO]: 'Cancelado'
    };
    
    return labels[estado] || estado;
  }

  /**
   * Obtiene la clase CSS para un estado
   */
  getEstadoBadgeClass(estado: EstadoCasoClinico): string {
    const classes = {
      [EstadoCasoClinico.EN_REVISION]: 'badge-warning',
      [EstadoCasoClinico.APROBADO]: 'badge-success',
      [EstadoCasoClinico.PENDIENTE_ESTUDIOS]: 'badge-info',
      [EstadoCasoClinico.EN_TRATAMIENTO]: 'badge-primary',
      [EstadoCasoClinico.FINALIZADO]: 'badge-secondary',
      [EstadoCasoClinico.CANCELADO]: 'badge-danger'
    };
    
    return classes[estado] || 'badge-secondary';
  }

  /**
   * Valida si un caso puede ser editado por el estudiante
   */
  puedeEditarCaso(caso: CasoClinicoBasico): boolean {
    const usuarioActual = authService.getCurrentUserId();
    return caso.estudianteId === usuarioActual && caso.estado === EstadoCasoClinico.EN_REVISION;
  }
}

// Exportar instancia singleton
export const clinicalCaseService = new ClinicalCaseService();
export default clinicalCaseService;
