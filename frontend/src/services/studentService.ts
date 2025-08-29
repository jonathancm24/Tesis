
/*
 * Servicio para la gestión de datos específicos de estudiantes
 * Integra casos clínicos, tratamientos, citas y estadísticas
 * Archivo: src/services/studentService.ts
 */

import api from '@/config/api';
import { authService } from '@/services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

// Definir tipos básicos localmente para evitar dependencias
interface CasoClinicoBasico {
  id: number;
  titulo: string;
  descripcionProblema: string;
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  calificacion?: number;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDocumento: string;
    telefono: string;
    fechaNacimiento: Date;
    edad: number;
  };
  docente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  especialidad: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

interface OpcionesCasosClinicos {
  estado?: string;
  especialidadId?: number;
  docenteId?: number;
  pagina?: number;
  tamanoPagina?: number;
}

class StudentService {

  /**
   * Obtiene información completa de un paciente incluyendo su historial
   */
  async obtenerPacienteCompleto(pacienteId: number): Promise<any> {
    try {
      // Primero intentar obtener el historial completo
      const historialResponse = await api.get(`/pacientes/${pacienteId}/historial`);
      if (historialResponse.data && historialResponse.data.paciente) {
        return {
          ...historialResponse.data.paciente,
          historial: historialResponse.data
        };
      }
      
      // Si falla el historial, usar el endpoint básico
      const response = await api.get(`/pacientes/${pacienteId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del paciente:', error);
      return null;
    }
  }

  /**
   * Obtiene caso clínico detallado por ID
   */
  async obtenerCasoClinicoDetallado(casoId: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/casos-clinicos/${casoId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener caso clínico detallado:', error);
      return null;
    }
  }

  /**
   * Obtiene información completa para el modal del paciente
   */
  async obtenerInformacionCompletaPaciente(pacienteId: number, casoId?: number): Promise<any> {
    try {
      const [pacienteCompleto, casoDetallado] = await Promise.all([
        this.obtenerPacienteCompleto(pacienteId),
        casoId ? this.obtenerCasoClinicoDetallado(casoId) : null
      ]);

      return {
        paciente: pacienteCompleto,
        casoClinico: casoDetallado,
        // Información adicional que se podría agregar
        historialCitas: [], // Se podría obtener del servicio de citas
        tratamientos: casoDetallado?.tratamientos || [],
        archivos: casoDetallado?.archivos || [],
        hallazgos: casoDetallado?.hallazgos || []
      };
    } catch (error) {
      console.error('Error al obtener información completa del paciente:', error);
      return null;
    }
  }

  /**
   * Obtiene los casos clínicos del estudiante actual usando el endpoint directo
   */
  async obtenerCasosClinicos(opciones?: OpcionesCasosClinicos): Promise<RespuestaPaginada<CasoClinicoBasico>> {
    try {
      // Obtener el ID del usuario desde el token JWT
      const usuarioId = authService.getUserIdFromToken();
      if (!usuarioId) {
        throw new Error('Usuario no autenticado');
      }

      // Construir URL con filtros
      const url = new URL(`${API_URL}/casos-clinicos/estudiante/${usuarioId}`);
      
      if (opciones?.pagina) url.searchParams.append('pagina', opciones.pagina.toString());
      if (opciones?.tamanoPagina) url.searchParams.append('limite', Math.min(opciones.tamanoPagina, 100).toString());
      if (opciones?.estado) url.searchParams.append('estado', opciones.estado);
      if (opciones?.especialidadId) url.searchParams.append('especialidadId', opciones.especialidadId.toString());
      if (opciones?.docenteId) url.searchParams.append('profesorId', opciones.docenteId.toString());

      console.log('🔍 Obteniendo casos del estudiante:', url.toString());

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const respuesta = await response.json();
      console.log('📊 Respuesta del backend para estudiante:', respuesta);

      // Procesar casos de forma más simple para debuggear
      const casos: CasoClinicoBasico[] = (respuesta.data || []).map((caso: any) => {
        console.log('🔄 Procesando caso:', {
          id: caso.id,
          pacienteId: caso.paciente?.id,
          nombrePaciente: caso.paciente?.nombre,
          apellidoPaciente: caso.paciente?.apellido,
          documentoPaciente: caso.paciente?.numeroDocumento,
          fechaNacimiento: caso.paciente?.fechaNacimiento
        });

        // Usar los datos que vienen directamente del backend
        const fechaNacimiento = caso.paciente?.fechaNacimiento ? 
          new Date(caso.paciente.fechaNacimiento) : 
          new Date('1990-01-01'); // Fecha por defecto para evitar errores

        const edad = this.calcularEdad(fechaNacimiento);

        const pacienteData = {
          id: caso.paciente?.id || 0,
          nombre: caso.paciente?.nombre || 'Sin nombre',
          apellido: caso.paciente?.apellido || 'Sin apellido',
          numeroDocumento: caso.paciente?.numeroDocumento || 'Sin documento',
          telefono: caso.paciente?.telefono || '',
          fechaNacimiento,
          edad
        };

        console.log('🎯 Datos procesados del paciente:', pacienteData);

        return {
          id: caso.id,
          titulo: caso.motivoConsulta || 'Sin motivo especificado',
          descripcionProblema: caso.enfermedadActual || 'Sin descripción',
          estado: caso.estado,
          fechaCreacion: new Date(caso.fechaCreacion),
          fechaActualizacion: new Date(caso.fechaActualizacion),
          calificacion: caso.calificacion,
          paciente: pacienteData,
          docente: {
            id: caso.profesor?.id || caso.profesorId || 0,
            nombre: caso.profesor?.nombre || caso.nombreProfesor || 'N/A',
            apellido: caso.profesor?.apellido || caso.apellidoProfesor || 'N/A',
            email: caso.profesor?.email || caso.emailProfesor || 'N/A'
          },
          especialidad: {
            id: caso.especialidad?.id || caso.especialidadId || 0,
            nombre: caso.especialidad?.nombre || caso.nombreEspecialidad || 'N/A',
            descripcion: caso.especialidad?.descripcion || ''
          }
        };
      });

      console.log('✅ Casos procesados:', casos.length);

      return {
        datos: casos,
        total: respuesta.total || 0,
        pagina: respuesta.pagina || 1,
        tamanoPagina: respuesta.limite || 20,
        totalPaginas: respuesta.totalPaginas || 0
      };
    } catch (error) {
      console.error('❌ Error al obtener casos clínicos:', error);
      return {
        datos: [],
        total: 0,
        pagina: 1,
        tamanoPagina: 20,
        totalPaginas: 0
      };
    }
  }

  /**
   * Obtiene los datos del dashboard del estudiante
   */
  async obtenerDashboard(): Promise<any> {
    try {
      // Obtener datos en paralelo
      const [casosClinicos, especialidades, docentes] = await Promise.all([
        this.obtenerCasosClinicos({ tamanoPagina: 100 }),
        this.obtenerEspecialidades(),
        this.obtenerDocentes()
      ]);

      // Simular pacientes basados en casos clínicos
      const pacientes = casosClinicos.datos.map((caso: any) => ({
        id: caso.paciente.id,
        paciente: caso.paciente,
        casoActivo: {
          id: caso.id,
          titulo: caso.titulo,
          estado: caso.estado,
          especialidad: caso.especialidad.nombre,
          fechaCreacion: caso.fechaCreacion
        },
        docenteSupervisor: caso.docente,
        proximaCita: null, // Se podría obtener de un servicio de citas
        ultimaActividad: caso.fechaActualizacion,
        tratamientoActivo: null
      }));

      // Calcular estadísticas
      const casosActivos = casosClinicos.datos.filter((caso: any) => 
        ['EN_REVISION', 'EN_TRATAMIENTO'].includes(caso.estado)
      ).length;
      
      const casosCompletados = casosClinicos.datos.filter((caso: any) => 
        caso.estado === 'FINALIZADO'
      ).length;

      return {
        estadisticas: {
          totalPacientes: pacientes.length,
          citasHoy: 0, // Se podría obtener de un servicio de citas
          casosActivos,
          tratamientosEnCurso: 0, // Se podría obtener de un servicio de tratamientos
          casosCompletados,
          citasPendientes: 0
        },
        pacientes,
        especialidades,
        docentes,
        casosRecientes: casosClinicos.datos.slice(0, 5),
        actividadReciente: [],
        proximasCitas: []
      };
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene especialidades
   */
  async obtenerEspecialidades(): Promise<any[]> {
    try {
      const response = await api.get('/especialidades');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      return [];
    }
  }

  /**
   * Obtiene docentes (profesores) del sistema
   * @param especialidadId ID de la especialidad para filtrar profesores
   */
  async obtenerDocentes(especialidadId?: number): Promise<any[]> {
    try {
      // Usar el endpoint correcto que obtiene todos los usuarios
      const response = await api.get('/auth/usuarios');
      
      // Filtrar solo usuarios con rol de profesor/docente
      const usuarios = response.data || [];
      
      let profesores = usuarios.filter((usuario: any) => {
        // Buscar en el campo 'role' (singular) no 'roles' (plural)
        return usuario.role?.nombre?.toUpperCase() === 'PROFESOR';
      });

      // Si se proporciona especialidadId, filtrar por especialidad
      if (especialidadId) {
        profesores = profesores.filter((profesor: any) => {
          return profesor.especialidades?.some((esp: any) => {
            return esp.especialidadId === especialidadId || esp.id === especialidadId;
          });
        });
      }
      
      return profesores.map((profesor: any) => ({
        id: profesor.id,
        nombre: profesor.nombre,
        apellido: profesor.apellido,
        email: profesor.email,
        telefono: profesor.telefono,
        especialidades: profesor.especialidades || [],
        estado: profesor.estado
      }));
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      
      // Fallback: intentar obtener todos los docentes si falla el filtro
      if (especialidadId) {
        return this.obtenerDocentes(); // Llamada recursiva sin filtro
      }
      return [];
    }
  }

  /**
   * Obtiene pacientes para el dashboard con información completa
   */
  async obtenerPacientesDashboard(filtros: any): Promise<any[]> {
    try {
      // Obtener casos clínicos con filtros aplicados
      const opciones: OpcionesCasosClinicos = {
        tamanoPagina: 100
      };

      if (filtros.estadoCaso) opciones.estado = filtros.estadoCaso;
      if (filtros.especialidadId) opciones.especialidadId = filtros.especialidadId;
      if (filtros.docenteId) opciones.docenteId = filtros.docenteId;

      const casosClinicos = await this.obtenerCasosClinicos(opciones);

      // Enriquecer datos con información completa del paciente
      const pacientesPromises = casosClinicos.datos.map(async (caso: any) => {
        // Obtener información completa del paciente
        const pacienteCompleto = await this.obtenerPacienteCompleto(caso.paciente.id);
        
        return {
          id: caso.paciente.id,
          paciente: {
            ...caso.paciente,
            telefono: pacienteCompleto?.telefono || '',
            email: pacienteCompleto?.email || '',
            direccion: pacienteCompleto?.direccion || '',
            genero: pacienteCompleto?.genero || '',
            tipoDocumento: pacienteCompleto?.tipoDocumento || ''
          },
          casoActivo: {
            id: caso.id,
            titulo: caso.titulo,
            estado: caso.estado,
            especialidad: caso.especialidad.nombre,
            fechaCreacion: caso.fechaCreacion,
            descripcion: caso.descripcionProblema,
            calificacion: caso.calificacion
          },
          docenteSupervisor: caso.docente,
          proximaCita: null, // Se podría obtener de un servicio de citas
          ultimaActividad: caso.fechaActualizacion,
          tratamientoActivo: null // Se podría obtener de un servicio de tratamientos
        };
      });

      let pacientes = await Promise.all(pacientesPromises);

      // Aplicar filtro de búsqueda si existe
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        pacientes = pacientes.filter((p: any) => 
          p.paciente.nombre.toLowerCase().includes(busqueda) ||
          p.paciente.apellido.toLowerCase().includes(busqueda) ||
          p.paciente.numeroDocumento.toLowerCase().includes(busqueda) ||
          p.paciente.email.toLowerCase().includes(busqueda)
        );
      }

      return pacientes;
    } catch (error) {
      console.error('Error al obtener pacientes dashboard:', error);
      return [];
    }
  }

  /**
   * Obtiene la clase CSS para el estado de un caso clínico
   */
  obtenerClaseEstadoCaso(estado: string): string {
    const clases: Record<string, string> = {
      'EN_REVISION': 'badge-warning',
      'APROBADO': 'badge-success',
      'PENDIENTE_ESTUDIOS': 'badge-info',
      'EN_TRATAMIENTO': 'badge-primary',
      'FINALIZADO': 'badge-secondary',
      'CANCELADO': 'badge-danger'
    };
    
    return clases[estado] || 'badge-secondary';
  }

  /**
   * Obtiene la clase CSS para el estado de una cita
   */
  obtenerClaseEstadoCita(estado: string): string {
    const clases: Record<string, string> = {
      'DISPONIBLE': 'badge-light',
      'RESERVADA': 'badge-secondary',
      'CANCELADA': 'badge-danger',
      'FINALIZADA': 'badge-success',
      'NO_ASISTIO': 'badge-warning'
    };
    
    return clases[estado] || 'badge-secondary';
  }

  /**
   * Calcula la edad a partir de la fecha de nacimiento
   */
  private calcularEdad(fechaNacimiento: Date | string): number {
    const fecha = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    
    if (mesActual < fecha.getMonth() || 
        (mesActual === fecha.getMonth() && diaActual < fecha.getDate())) {
      edad--;
    }
    
    return edad;
  }
}

// Exportar instancia singleton
export const studentService = new StudentService();
export default studentService;
