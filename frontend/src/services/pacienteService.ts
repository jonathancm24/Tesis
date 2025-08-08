import api from '@/config/api';
import type { 
  PacienteLista, 
  HistorialCompleto, 
  RegistroPaciente,
  PacienteBasico,
  Parroquia
} from '@/types/patient';

/**
 * Servicio para la gestión de pacientes
 * Interactúa con la API REST del backend
 */
class PacienteService {
  private readonly baseURL = '/pacientes';

  /**
   * Obtener lista de todos los pacientes
   */
  async obtenerPacientes(): Promise<PacienteLista[]> {
    try {
      const response = await api.get<PacienteLista[]>(this.baseURL);
      return response.data.map(paciente => ({
        ...paciente,
        fechaNacimiento: new Date(paciente.fechaNacimiento),
        fechaRegistro: new Date(paciente.fechaRegistro),
        ultimaVisita: paciente.ultimaVisita ? new Date(paciente.ultimaVisita) : undefined,
        proximaCita: paciente.proximaCita ? new Date(paciente.proximaCita) : undefined
      }));
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      throw new Error('No se pudieron cargar los pacientes');
    }
  }

  /**
   * Buscar pacientes por término de búsqueda
   */
  async buscarPacientes(termino: string): Promise<PacienteLista[]> {
    if (!termino || termino.trim().length < 2) {
      return [];
    }

    try {
      const response = await api.get<PacienteLista[]>(`${this.baseURL}/buscar`, {
        params: { termino: termino.trim() }
      });
      return response.data.map(paciente => ({
        ...paciente,
        fechaNacimiento: new Date(paciente.fechaNacimiento),
        fechaRegistro: new Date(paciente.fechaRegistro),
        ultimaVisita: paciente.ultimaVisita ? new Date(paciente.ultimaVisita) : undefined,
        proximaCita: paciente.proximaCita ? new Date(paciente.proximaCita) : undefined
      }));
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      return [];
    }
  }

  /**
   * Obtener historial completo de un paciente
   */
  async obtenerHistorialCompleto(pacienteId: number): Promise<HistorialCompleto> {
    try {
      const response = await api.get<HistorialCompleto>(`${this.baseURL}/${pacienteId}/historial`);
      const historial = response.data;
      
      // Convertir fechas de strings a Date objects
      return {
        ...historial,
        paciente: {
          ...historial.paciente,
          fechaNacimiento: new Date(historial.paciente.fechaNacimiento),
          fechaRegistro: new Date(historial.paciente.fechaRegistro)
        },
        encuestasTamizaje: historial.encuestasTamizaje.map(encuesta => ({
          ...encuesta,
          fecha: new Date(encuesta.fecha)
        })),
        casosClinicos: historial.casosClinicos.map(caso => ({
          ...caso,
          fechaCreacion: new Date(caso.fechaCreacion),
          fechaActualizacion: new Date(caso.fechaActualizacion)
        })),
        citas: historial.citas.map(cita => ({
          ...cita,
          fecha: new Date(cita.fecha),
          horainicio: new Date(cita.horainicio),
          horafin: new Date(cita.horafin)
        })),
        tratamientos: historial.tratamientos.map(tratamiento => ({
          ...tratamiento,
          fechaCreacion: new Date(tratamiento.fechaCreacion),
          fechaActualizacion: new Date(tratamiento.fechaActualizacion)
        })),
        resumen: {
          ...historial.resumen,
          ultimaVisita: historial.resumen.ultimaVisita ? new Date(historial.resumen.ultimaVisita) : undefined,
          proximaCita: historial.resumen.proximaCita ? new Date(historial.resumen.proximaCita) : undefined
        }
      };
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw new Error('No se pudo cargar el historial del paciente');
    }
  }

  /**
   * Obtener información básica de un paciente
   */
  async obtenerPaciente(pacienteId: number): Promise<PacienteBasico> {
    try {
      const response = await api.get<PacienteBasico>(`${this.baseURL}/${pacienteId}`);
      return {
        ...response.data,
        fechaNacimiento: new Date(response.data.fechaNacimiento),
        fechaRegistro: new Date(response.data.fechaRegistro)
      };
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      throw new Error('No se pudo cargar la información del paciente');
    }
  }

  /**
   * Crear un nuevo paciente
   */
  async crearPaciente(data: RegistroPaciente): Promise<PacienteBasico> {
    try {
      const response = await api.post<PacienteBasico>(this.baseURL, data);
      return {
        ...response.data,
        fechaNacimiento: new Date(response.data.fechaNacimiento),
        fechaRegistro: new Date(response.data.fechaRegistro)
      };
    } catch (error: any) {
      console.error('Error al crear paciente:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Datos inválidos';
        throw new Error(message);
      }
      
      throw new Error('No se pudo registrar el paciente');
    }
  }

  /**
   * Actualizar datos de un paciente
   */
  async actualizarPaciente(pacienteId: number, data: Partial<RegistroPaciente>): Promise<PacienteBasico> {
    try {
      const response = await api.put<PacienteBasico>(`${this.baseURL}/${pacienteId}`, data);
      return {
        ...response.data,
        fechaNacimiento: new Date(response.data.fechaNacimiento),
        fechaRegistro: new Date(response.data.fechaRegistro)
      };
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      throw new Error('No se pudo actualizar la información del paciente');
    }
  }

  /**
   * Desactivar un paciente
   */
  async desactivarPaciente(pacienteId: number): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${pacienteId}`);
    } catch (error) {
      console.error('Error al desactivar paciente:', error);
      throw new Error('No se pudo desactivar el paciente');
    }
  }

  /**
   * Obtener parroquias para el formulario de registro
   */
  async obtenerParroquias(): Promise<Parroquia[]> {
    try {
      const response = await api.get<Parroquia[]>('/parroquia');
      return response.data;
    } catch (error) {
      console.error('Error al obtener parroquias:', error);
      throw new Error('No se pudieron cargar las parroquias');
    }
  }

  /**
   * Buscar parroquias por término
   */
  async buscarParroquias(termino: string): Promise<Parroquia[]> {
    try {
      const response = await api.get<Parroquia[]>('/parroquia/buscar', {
        params: { q: termino }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar parroquias:', error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const pacienteService = new PacienteService();
export default pacienteService;
