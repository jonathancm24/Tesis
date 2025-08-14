/**
 * Servicio para la gestión de datos específicos de estudiantes
 * Integra casos clínicos, tratamientos, citas y est      // Calcular estadísticas
      const casosActivos = casosClinicos.datos.filter(caso => 
        [EstadoCasoClinico.EN_REVISION, EstadoCasoClinico.EN_TRATAMIENTO].includes(caso.estado)
      ).length;

      const casosCompletados = casosClinicos.datos.filter(caso => 
        caso.estado === EstadoCasoClinico.FINALIZADO
      ).length;

      const tratamientosActivos = tratamientos.datos.filter(tratamiento => 
        tratamiento.estado === EstadoTratamiento.EN_PROCESO
      ).length;* Archivo: src/services/studentService.ts
 */

import api from '@/config/api';
import { authService } from '@/services/authService';
import { 
  type DashboardResponse,
  type EstadisticasEstudiante,
  type PacienteDashboard,
  type CasoClinicoBasico,
  type CasoClinicoDetalle,
  type TratamientoBasico,
  type CitaBasica,
  type EspecialidadBasica,
  type DocenteBasico,
  type FiltrosDashboard,
  type OpcionesCasosClinicos,
  type OpcionesTratamientos,
  type OpcionesCitas,
  type RespuestaPaginada,
  EstadoCasoClinico,
  EstadoTratamiento,
  EstadoCita
} from '@/types/student';

/**
 * Servicio principal para funcionalidades de estudiantes
 * Centraliza todas las operaciones relacionadas con el dashboard y gestión de estudiantes
 */
class StudentService {
    
  constructor() {
    // Verificar que haya token de sesión
    this.verificarAutenticacion();
  }

  /**
   * Verifica si hay token de autenticación
   */
  private verificarAutenticacion(): void {
    if (!authService.isAuthenticated()) {
      console.warn('⚠️ No hay usuario autenticado. Redirigiendo a login...');
      authService.logout();
      // Aquí podrías redirigir al usuario a la página de login
    } else {
      console.warn('⚠️ Usuario autenticado.');
      console.log('🔑 Sesión activa:', authService.getCurrentUser()?.email);
      console.log('👤 Usuario:', authService.getCurrentUser());
      console.log('👮 Rol:', authService.getCurrentUser()?.role);
      console.log('🔑 Token:', authService.getToken());
    }
  }

  // ========================================
  // DASHBOARD PRINCIPAL
  // ========================================

  /**
   * Obtiene todos los datos necesarios para el dashboard del estudiante
   * Incluye estadísticas, lista de pacientes y datos de referencia
   */
  async obtenerDashboard(): Promise<DashboardResponse> {
    try {
      // Obtener datos en paralelo para mejorar performance
      const [
        estadisticas,
        pacientes,
        especialidades,
        docentes
      ] = await Promise.all([
        this.obtenerEstadisticas(),
        this.obtenerPacientesDashboard(),
        this.obtenerEspecialidades(),
        this.obtenerDocentes()
      ]);

      return {
        estadisticas,
        pacientes,
        especialidades,
        docentes
      };
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw new Error('No se pudieron cargar los datos del dashboard');
    }
  }

  /**
   * Obtiene estadísticas generales del estudiante actual
   */
  async obtenerEstadisticas(): Promise<EstadisticasEstudiante> {
    try {
      // Obtener datos de múltiples endpoints
      const [
        casosClinicos,
        tratamientos,
        citasHoy,
        citasPendientes
      ] = await Promise.all([
        this.obtenerCasosClinicos({ tamanoPagina: 1000 }), // Obtener todos para estadísticas
        this.obtenerTratamientos({ tamanoPagina: 1000 }),
        this.obtenerCitasHoy(),
        this.obtenerCitasPendientes()
      ]);

      // Calcular estadísticas
      const casosActivos = casosClinicos.datos.filter(caso => 
        [EstadoCasoClinico.EN_TRATAMIENTO, EstadoCasoClinico.EN_REVISION].includes(caso.estado)
      ).length;

      const casosCompletados = casosClinicos.datos.filter(caso => 
        caso.estado === EstadoCasoClinico.FINALIZADO
      ).length;

      const tratamientosEnCurso = tratamientos.datos.filter(tratamiento => 
        tratamiento.estado === EstadoTratamiento.EN_PROCESO
      ).length;

      // Calcular promedio de calificaciones
      const casosConCalificacion = casosClinicos.datos.filter(caso => caso.calificacion !== undefined);
      const promedioCalificaciones = casosConCalificacion.length > 0 
        ? casosConCalificacion.reduce((sum, caso) => sum + (caso.calificacion || 0), 0) / casosConCalificacion.length
        : undefined;

      // Obtener pacientes únicos
      const pacientesUnicos = new Set(casosClinicos.datos.map(caso => caso.paciente.id));

      return {
        totalPacientes: pacientesUnicos.size,
        citasHoy: citasHoy.length,
        casosActivos,
        tratamientosEnCurso,
        casosCompletados,
        promedioCalificaciones: promedioCalificaciones ? Math.round(promedioCalificaciones * 100) / 100 : undefined,
        citasPendientes: citasPendientes.length
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      
      // Devolver estadísticas por defecto en caso de error
      return {
        totalPacientes: 0,
        citasHoy: 0,
        casosActivos: 0,
        tratamientosEnCurso: 0,
        casosCompletados: 0,
        citasPendientes: 0
      };
    }
  }

  /**
   * Obtiene la lista de pacientes para el dashboard con información resumida
   */
  async obtenerPacientesDashboard(filtros?: FiltrosDashboard): Promise<PacienteDashboard[]> {
    try {
      // Obtener casos clínicos del estudiante
      const casosClinicos = await this.obtenerCasosClinicos({
        estado: filtros?.estadoCaso,
        especialidadId: filtros?.especialidadId,
        docenteId: filtros?.docenteId,
        tamanoPagina: 100
      });

      // Agrupar por paciente y obtener información resumida
      const pacientesMap = new Map<number, PacienteDashboard>();

      for (const caso of casosClinicos.datos) {
        const pacienteId = caso.paciente.id;
        
        if (!pacientesMap.has(pacienteId)) {
          // Obtener próxima cita y tratamiento activo para este paciente
          const [proximaCita, tratamientoActivo] = await Promise.all([
            this.obtenerProximaCitaPaciente(pacienteId),
            this.obtenerTratamientoActivoPaciente(pacienteId)
          ]);

          pacientesMap.set(pacienteId, {
            id: pacienteId,
            paciente: caso.paciente,
            casoActivo: {
              id: caso.id,
              titulo: caso.titulo,
              estado: caso.estado,
              especialidad: caso.especialidad.nombre,
              fechaActualizacion: caso.fechaActualizacion
            },
            tratamientoActivo,
            proximaCita,
            ultimaActividad: caso.fechaActualizacion,
            docenteSupervisor: caso.docente
          });
        } else {
          // Actualizar con el caso más reciente si es necesario
          const pacienteExistente = pacientesMap.get(pacienteId)!;
          if (caso.fechaActualizacion > pacienteExistente.ultimaActividad) {
            pacienteExistente.casoActivo = {
              id: caso.id,
              titulo: caso.titulo,
              estado: caso.estado,
              especialidad: caso.especialidad.nombre,
              fechaActualizacion: caso.fechaActualizacion
            };
            pacienteExistente.ultimaActividad = caso.fechaActualizacion;
          }
        }
      }

      let resultado = Array.from(pacientesMap.values());

      // Aplicar filtros adicionales
      if (filtros?.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        resultado = resultado.filter(p => 
          p.paciente.nombre.toLowerCase().includes(busqueda) ||
          p.paciente.apellido.toLowerCase().includes(busqueda) ||
          p.paciente.numeroDocumento.includes(busqueda)
        );
      }

      // Ordenar por última actividad (más reciente primero)
      resultado.sort((a, b) => b.ultimaActividad.getTime() - a.ultimaActividad.getTime());

      return resultado;
    } catch (error) {
      console.error('Error al obtener pacientes del dashboard:', error);
      return [];
    }
  }

  // ========================================
  // CASOS CLÍNICOS
  // ========================================

  /**
   * Obtiene los casos clínicos del estudiante actual
   */
  async obtenerCasosClinicos(opciones?: OpcionesCasosClinicos): Promise<RespuestaPaginada<CasoClinicoBasico>> {
    try {
      const params = new URLSearchParams();
      
      if (opciones?.estado) params.append('estado', opciones.estado);
      if (opciones?.especialidadId) params.append('especialidadId', opciones.especialidadId.toString());
      if (opciones?.docenteId) params.append('docenteId', opciones.docenteId.toString());
      if (opciones?.pagina) params.append('pagina', opciones.pagina.toString());
      if (opciones?.tamanoPagina) params.append('tamanoPagina', opciones.tamanoPagina.toString());

      const response = await api.get<any>('/casos-clinicos', { params });
      
      // Verificar que response.data sea un array
      if (!Array.isArray(response.data)) {
        console.warn('Respuesta inesperada de casos clínicos:', response.data);
        return {
          datos: [],
          total: 0,
          pagina: 1,
          tamanoPagina: 20,
          totalPaginas: 0
        };
      }
      
      // Transformar datos y convertir fechas
      const casos: CasoClinicoBasico[] = response.data.map((caso: any) => ({
        id: caso.id,
        paciente: {
          id: caso.paciente.id,
          nombre: caso.paciente.nombre,
          apellido: caso.paciente.apellido,
          numeroDocumento: caso.paciente.numeroDocumento,
          telefono: caso.paciente.telefono,
          fechaNacimiento: new Date(caso.paciente.fechaNacimiento),
          edad: this.calcularEdad(new Date(caso.paciente.fechaNacimiento))
        },
        docente: {
          id: caso.docente.id,
          nombre: caso.docente.nombre,
          apellido: caso.docente.apellido,
          email: caso.docente.email
        },
        especialidad: {
          id: caso.especialidad.id,
          nombre: caso.especialidad.nombre,
          descripcion: caso.especialidad.descripcion
        },
        estado: caso.estado as EstadoCasoClinico,
        fechaCreacion: new Date(caso.fechaCreacion),
        fechaActualizacion: new Date(caso.fechaActualizacion),
        titulo: caso.titulo,
        descripcionProblema: caso.descripcionProblema,
        calificacion: caso.calificacion
      }));

      return {
        datos: casos,
        total: response.data.length,
        pagina: opciones?.pagina || 1,
        tamanoPagina: opciones?.tamanoPagina || 20,
        totalPaginas: Math.ceil(response.data.length / (opciones?.tamanoPagina || 20))
      };
    } catch (error) {
      console.error('Error al obtener casos clínicos:', error);
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
   * Obtiene el detalle completo de un caso clínico
   */
  async obtenerCasoClinicoDetalle(casoId: number): Promise<CasoClinicoDetalle | null> {
    try {
      const response = await api.get<any>(`/casos-clinicos/${casoId}`);
      const caso = response.data;
      
      return {
        id: caso.id,
        paciente: {
          id: caso.paciente.id,
          nombre: caso.paciente.nombre,
          apellido: caso.paciente.apellido,
          numeroDocumento: caso.paciente.numeroDocumento,
          telefono: caso.paciente.telefono,
          fechaNacimiento: new Date(caso.paciente.fechaNacimiento),
          edad: this.calcularEdad(new Date(caso.paciente.fechaNacimiento))
        },
        docente: {
          id: caso.docente.id,
          nombre: caso.docente.nombre,
          apellido: caso.docente.apellido,
          email: caso.docente.email
        },
        especialidad: {
          id: caso.especialidad.id,
          nombre: caso.especialidad.nombre,
          descripcion: caso.especialidad.descripcion
        },
        estado: caso.estado as EstadoCasoClinico,
        fechaCreacion: new Date(caso.fechaCreacion),
        fechaActualizacion: new Date(caso.fechaActualizacion),
        titulo: caso.titulo,
        descripcionProblema: caso.descripcionProblema,
        calificacion: caso.calificacion,
        motivoConsulta: caso.motivoConsulta,
        historialMedico: caso.historialMedico,
        examenClinico: caso.examenClinico,
        diagnostico: caso.diagnostico,
        planTratamiento: caso.planTratamiento,
        observacionesDocente: caso.observacionesDocente,
        fechaFinalizado: caso.fechaFinalizado ? new Date(caso.fechaFinalizado) : undefined
      };
    } catch (error) {
      console.error('Error al obtener detalle del caso clínico:', error);
      return null;
    }
  }

  // ========================================
  // TRATAMIENTOS
  // ========================================

  /**
   * Obtiene los tratamientos del estudiante actual
   */
  async obtenerTratamientos(opciones?: OpcionesTratamientos): Promise<RespuestaPaginada<TratamientoBasico>> {
    try {
      const params = new URLSearchParams();
      
      if (opciones?.estado) params.append('estado', opciones.estado);
      if (opciones?.especialidadId) params.append('especialidadId', opciones.especialidadId.toString());
      if (opciones?.docenteId) params.append('docenteId', opciones.docenteId.toString());
      if (opciones?.pagina) params.append('pagina', opciones.pagina.toString());
      if (opciones?.tamanoPagina) params.append('tamanoPagina', opciones.tamanoPagina.toString());

      const response = await api.get<any>('/tratamientos/mis-tratamientos/estudiante', { params });
      
      // Verificar que response.data sea un array
      if (!Array.isArray(response.data)) {
        console.warn('Respuesta inesperada de tratamientos:', response.data);
        return {
          datos: [],
          total: 0,
          pagina: 1,
          tamanoPagina: 20,
          totalPaginas: 0
        };
      }
      
      const tratamientos: TratamientoBasico[] = response.data.map((tratamiento: any) => ({
        id: tratamiento.id,
        casoClinico: {
          id: tratamiento.casoClinico.id,
          titulo: tratamiento.casoClinico.titulo,
          paciente: {
            id: tratamiento.casoClinico.paciente.id,
            nombre: tratamiento.casoClinico.paciente.nombre,
            apellido: tratamiento.casoClinico.paciente.apellido,
            numeroDocumento: tratamiento.casoClinico.paciente.numeroDocumento,
            telefono: tratamiento.casoClinico.paciente.telefono,
            fechaNacimiento: new Date(tratamiento.casoClinico.paciente.fechaNacimiento),
            edad: this.calcularEdad(new Date(tratamiento.casoClinico.paciente.fechaNacimiento))
          }
        },
        docente: {
          id: tratamiento.docente.id,
          nombre: tratamiento.docente.nombre,
          apellido: tratamiento.docente.apellido,
          email: tratamiento.docente.email
        },
        especialidad: {
          id: tratamiento.especialidad.id,
          nombre: tratamiento.especialidad.nombre,
          descripcion: tratamiento.especialidad.descripcion
        },
        estado: tratamiento.estado as EstadoTratamiento,
        fechaCreacion: new Date(tratamiento.fechaCreacion),
        fechaActualizacion: new Date(tratamiento.fechaActualizacion),
        descripcion: tratamiento.descripcion,
        observaciones: tratamiento.observaciones
      }));

      return {
        datos: tratamientos,
        total: response.data.length,
        pagina: opciones?.pagina || 1,
        tamanoPagina: opciones?.tamanoPagina || 20,
        totalPaginas: Math.ceil(response.data.length / (opciones?.tamanoPagina || 20))
      };
    } catch (error) {
      console.error('Error al obtener tratamientos:', error);
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
   * Obtiene el tratamiento activo más reciente para un paciente específico
   */
  async obtenerTratamientoActivoPaciente(pacienteId: number): Promise<PacienteDashboard['tratamientoActivo']> {
    try {
      const tratamientos = await this.obtenerTratamientos({ 
        estado: EstadoTratamiento.EN_PROCESO,
        tamanoPagina: 100
      });
      
      const tratamientoPaciente = tratamientos.datos.find(t => 
        t.casoClinico.paciente.id === pacienteId
      );
      
      if (!tratamientoPaciente) return undefined;
      
      return {
        id: tratamientoPaciente.id,
        descripcion: tratamientoPaciente.descripcion,
        estado: tratamientoPaciente.estado,
        fechaActualizacion: tratamientoPaciente.fechaActualizacion
      };
    } catch (error) {
      console.error('Error al obtener tratamiento activo del paciente:', error);
      return undefined;
    }
  }

  // ========================================
  // CITAS
  // ========================================

  /**
   * Obtiene las citas del estudiante actual
   */
  async obtenerCitas(opciones?: OpcionesCitas): Promise<RespuestaPaginada<CitaBasica>> {
    try {
      const params = new URLSearchParams();
      
      if (opciones?.estado) params.append('estado', opciones.estado);
      if (opciones?.especialidadId) params.append('especialidadId', opciones.especialidadId.toString());
      if (opciones?.docenteId) params.append('docenteId', opciones.docenteId.toString());
      
      // Validar fechas antes de enviarlas
      if (opciones?.fechaDesde && !isNaN(opciones.fechaDesde.getTime())) {
        params.append('fechaDesde', opciones.fechaDesde.toISOString());
      }
      if (opciones?.fechaHasta && !isNaN(opciones.fechaHasta.getTime())) {
        params.append('fechaHasta', opciones.fechaHasta.toISOString());
      }
      
      if (opciones?.pagina) params.append('pagina', opciones.pagina.toString());
      if (opciones?.tamanoPagina) params.append('tamanoPagina', opciones.tamanoPagina.toString());

      const response = await api.get<any>('/citas/mis-citas/usuario', { params });
      
      // Verificar que response.data sea un array
      if (!Array.isArray(response.data)) {
        console.warn('Respuesta inesperada de citas:', response.data);
        return {
          datos: [],
          total: 0,
          pagina: 1,
          tamanoPagina: 20,
          totalPaginas: 0
        };
      }
      
      const citas: CitaBasica[] = response.data.map((cita: any) => ({
        id: cita.id,
        paciente: {
          id: cita.paciente.id,
          nombre: cita.paciente.nombre,
          apellido: cita.paciente.apellido,
          numeroDocumento: cita.paciente.numeroDocumento,
          telefono: cita.paciente.telefono,
          fechaNacimiento: new Date(cita.paciente.fechaNacimiento),
          edad: this.calcularEdad(new Date(cita.paciente.fechaNacimiento))
        },
        docente: {
          id: cita.docente.id,
          nombre: cita.docente.nombre,
          apellido: cita.docente.apellido,
          email: cita.docente.email
        },
        especialidad: {
          id: cita.especialidad.id,
          nombre: cita.especialidad.nombre,
          descripcion: cita.especialidad.descripcion
        },
        estado: cita.estado as EstadoCita,
        fecha: new Date(cita.fecha),
        horaInicio: new Date(cita.horaInicio),
        horaFin: new Date(cita.horaFin),
        motivo: cita.motivo,
        observaciones: cita.observaciones
      }));

      return {
        datos: citas,
        total: response.data.length,
        pagina: opciones?.pagina || 1,
        tamanoPagina: opciones?.tamanoPagina || 20,
        totalPaginas: Math.ceil(response.data.length / (opciones?.tamanoPagina || 20))
      };
    } catch (error) {
      console.error('Error al obtener citas:', error);
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
   * Obtiene las citas programadas para hoy
   */
  async obtenerCitasHoy(): Promise<CitaBasica[]> {
    try {
      const hoy = new Date();
      const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

      // Validar que las fechas sean válidas
      if (isNaN(inicioDelDia.getTime()) || isNaN(finDelDia.getTime())) {
        console.error('Fechas inválidas para citas de hoy');
        return [];
      }

      const resultado = await this.obtenerCitas({
        fechaDesde: inicioDelDia,
        fechaHasta: finDelDia,
        tamanoPagina: 100
      });

      return resultado.datos;
    } catch (error) {
      console.error('Error al obtener citas de hoy:', error);
      return [];
    }
  }

  /**
   * Obtiene las citas pendientes de confirmación
   */
  async obtenerCitasPendientes(): Promise<CitaBasica[]> {
    const resultado = await this.obtenerCitas({
      estado: EstadoCita.RESERVADA, // Cambio de PROGRAMADA a RESERVADA
      tamanoPagina: 100
    });

    return resultado.datos;
  }

  /**
   * Obtiene la próxima cita para un paciente específico
   */
  async obtenerProximaCitaPaciente(pacienteId: number): Promise<PacienteDashboard['proximaCita']> {
    try {
      const ahora = new Date();
      
      // Validar que la fecha actual sea válida
      if (isNaN(ahora.getTime())) {
        console.error('Fecha actual inválida');
        return undefined;
      }
      
      const citas = await this.obtenerCitas({
        fechaDesde: ahora,
        tamanoPagina: 100
      });
      
      const citasPaciente = citas.datos
        .filter(c => c.paciente.id === pacienteId && c.fecha > ahora)
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
      
      if (citasPaciente.length === 0) return undefined;
      
      const proximaCita = citasPaciente[0];
      
      return {
        id: proximaCita.id,
        fecha: proximaCita.fecha,
        hora: proximaCita.horaInicio.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        estado: proximaCita.estado,
        motivo: proximaCita.motivo
      };
    } catch (error) {
      console.error('Error al obtener próxima cita del paciente:', error);
      return undefined;
    }
  }

  // ========================================
  // DATOS DE REFERENCIA
  // ========================================

  /**
   * Obtiene la lista de especialidades disponibles
   */
  async obtenerEspecialidades(): Promise<EspecialidadBasica[]> {
    try {
      const response = await api.get<any[]>('/especialidades');
      return response.data.map(esp => ({
        id: esp.id,
        nombre: esp.nombre,
        descripcion: esp.descripcion
      }));
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      return [];
    }
  }

  /**
   * Obtiene la lista de docentes disponibles
   */
  async obtenerDocentes(): Promise<DocenteBasico[]> {
    try {
      console.log('🔄 Obteniendo docentes...')
      
      // Verificar estado de autenticación antes de hacer la request
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token) {
        console.error('❌ No hay token de autenticación')
        throw new Error('No autenticado')
      }
      
      if (!user) {
        console.error('❌ No hay información de usuario')
        throw new Error('No hay información de usuario')
      }
      
      const userData = JSON.parse(user)
      console.log('👤 Usuario actual:', {
        id: userData.id,
        nombre: userData.nombre,
        role: userData.role
      })
      
      // Usar el endpoint específico
      const response = await api.get<any[]>('/casos-clinicos/profesores-disponibles')
      
      console.log('✅ Respuesta recibida:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'N/A'
      })
      
      if (!Array.isArray(response.data)) {
        console.warn('⚠️ La respuesta no es un array:', response.data)
        return []
      }
      
      return response.data.map((docente: any) => ({
        id: docente.id,
        nombre: docente.nombre,
        apellido: docente.apellido,
        email: docente.email
      }))
    } catch (error: any) {
      console.error('❌ Error completo al obtener docentes:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers
      })
      
      return []
    }
  }

  // ========================================
  // MÉTODOS UTILITARIOS
  // ========================================

  /**
   * Calcula la edad basada en la fecha de nacimiento
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
   * Formatea una fecha para mostrar de manera amigable
   */
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Formatea una hora para mostrar de manera amigable
   */
  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene la clase CSS para el estado de un caso clínico
   */
  obtenerClaseEstadoCaso(estado: EstadoCasoClinico): string {
    const clases: Record<EstadoCasoClinico, string> = {
      [EstadoCasoClinico.EN_REVISION]: 'badge-warning',
      [EstadoCasoClinico.APROBADO]: 'badge-success',
      [EstadoCasoClinico.PENDIENTE_ESTUDIOS]: 'badge-info',
      [EstadoCasoClinico.EN_TRATAMIENTO]: 'badge-primary',
      [EstadoCasoClinico.FINALIZADO]: 'badge-secondary',
      [EstadoCasoClinico.CANCELADO]: 'badge-danger'
    };
    
    return clases[estado] || 'badge-secondary';
  }

  /**
   * Obtiene la clase CSS para el estado de un tratamiento
   */
  obtenerClaseEstadoTratamiento(estado: EstadoTratamiento): string {
    const clases: Record<EstadoTratamiento, string> = {
      [EstadoTratamiento.PENDIENTE]: 'badge-secondary',
      [EstadoTratamiento.APROBADO]: 'badge-success',
      [EstadoTratamiento.RECHAZADO]: 'badge-danger',
      [EstadoTratamiento.CANCELADO]: 'badge-dark',
      [EstadoTratamiento.EN_PROCESO]: 'badge-primary',
      [EstadoTratamiento.FINALIZADO]: 'badge-info'
    };
    
    return clases[estado] || 'badge-secondary';
  }

  /**
   * Obtiene la clase CSS para el estado de una cita
   */
  obtenerClaseEstadoCita(estado: EstadoCita): string {
    const clases = {
      [EstadoCita.DISPONIBLE]: 'badge-light',
      [EstadoCita.RESERVADA]: 'badge-secondary',
      [EstadoCita.CANCELADA]: 'badge-danger',
      [EstadoCita.FINALIZADA]: 'badge-success',
      [EstadoCita.NO_ASISTIO]: 'badge-warning'
    };
    
    return clases[estado] || 'badge-secondary';
  }
}

// Exportar instancia singleton
export const studentService = new StudentService();
export default studentService;
