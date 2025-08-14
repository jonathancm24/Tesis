/**
 * Servicio para gestión de clínicas
 * 
 * Maneja las operaciones CRUD para clínicas y su integración
 * con el módulo de administración del sistema.
 * 
 * @fileoverview Servicio de clínicas para AdminSettings
 * @module clinicaService
 */

import api from '@/config/api';
import type { 
  CrearClinicaDto, 
  ActualizarClinicaDto, 
  FiltrosClinicaDto, 
  ClinicaRespuestaDto,
  TipoClinica,
  EstadoClinica 
} from '@/types/clinica'

export interface EstadisticasClinicas {
  totalClinicas: number
  clinicasActivas: number
  clinicasInactivas: number
  clinicasMoviles: number
  clinicasFijas: number
  clinicasTemporales: number
  capacidadTotalPacientes: number
  promedioCapacidadPorClinica: number
}

export interface ResumenClinicas {
  estadisticas: EstadisticasClinicas
  clinicasRecientes: ClinicaRespuestaDto[]
  clinicasPorTipo: Array<{
    tipo: TipoClinica
    cantidad: number
    porcentaje: number
  }>
  clinicasPorEstado: Array<{
    estado: EstadoClinica
    cantidad: number
    porcentaje: number
  }>
}

export interface ConfiguracionClinica {
  clinicaPrincipal?: ClinicaRespuestaDto
  configuracionGeneral: {
    nombreSistema: string
    direccionBase: string
    telefonoContacto: string
    emailContacto: string
    horariosDefault: string
    diasLaborales: string
    capacidadDefaultPacientes: number
    tiempoTurnoDefault: number
    permitirSolapamientoCitas: boolean
  }
  notificaciones: {
    email: {
      habilitado: boolean
      remitente: string
      servidor?: string
    }
    sms: {
      habilitado: boolean
      proveedor: string
      apiKey?: string
    }
    recordatorios: {
      horasAntes: number
      plantillaEmail: string
      plantillaSms: string
    }
  }
  seguridad: {
    tiempoSesion: string
    longitudMinimaPassword: number
    requiereMayuscula: boolean
    requiereNumero: boolean
    requiereSimbolo: boolean
    autenticacion2FA: boolean
  }
  interfaz: {
    tema: 'system' | 'light' | 'dark'
    idioma: 'es' | 'en'
    zonaHoraria: string
    mostrarLogo: boolean
    logoUrl?: string
  }
  mantenimiento: {
    modoMantenimiento: boolean
    mensajeMantenimiento: string
    fechaInicioMantenimiento?: Date
    fechaFinMantenimiento?: Date
  }
}

class ClinicaService {
  private readonly baseUrl = '/clinicas'

  /**
   * Obtiene todas las clínicas con filtros opcionales
   */
  async obtenerClinicas(filtros?: FiltrosClinicaDto): Promise<ClinicaRespuestaDto[]> {
    try {
      const params = new URLSearchParams()
      
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
      }

      const response = await api.get<ClinicaRespuestaDto[]>(
        `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
      )
      return response.data
    } catch (error) {
      console.error('Error al obtener clínicas:', error)
      throw error
    }
  }

  /**
   * Obtiene una clínica por ID
   */
  async obtenerClinicaPorId(id: number): Promise<ClinicaRespuestaDto> {
    try {
      const response = await api.get<ClinicaRespuestaDto>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener clínica ${id}:`, error)
      throw error
    }
  }

  /**
   * Crea una nueva clínica
   */
  async crearClinica(datos: CrearClinicaDto): Promise<ClinicaRespuestaDto> {
    try {
      const response = await api.post<ClinicaRespuestaDto>(this.baseUrl, datos)
      return response.data
    } catch (error) {
      console.error('Error al crear clínica:', error)
      throw error
    }
  }

  /**
   * Actualiza una clínica existente
   */
  async actualizarClinica(id: number, datos: ActualizarClinicaDto): Promise<ClinicaRespuestaDto> {
    try {
      const response = await api.put<ClinicaRespuestaDto>(`${this.baseUrl}/${id}`, datos)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar clínica ${id}:`, error)
      throw error
    }
  }

  /**
   * Elimina una clínica
   */
  async eliminarClinica(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error(`Error al eliminar clínica ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas resumidas de clínicas
   */
  async obtenerEstadisticasResumen(): Promise<ResumenClinicas> {
    try {
      const response = await api.get<ResumenClinicas>(`${this.baseUrl}/estadisticas/resumen`)
      return response.data
    } catch (error) {
      console.warn('Error al obtener estadísticas de clínicas, usando datos por defecto:', error)
      
      // Fallback: obtener datos básicos y generar estadísticas
      try {
        const clinicas = await this.obtenerClinicas()
        return this.generarEstadisticasPorDefecto(clinicas)
      } catch (fallbackError) {
        console.error('Error en fallback de estadísticas:', fallbackError)
        return this.obtenerEstadisticasVacias()
      }
    }
  }

  /**
   * Obtiene la configuración general del sistema de clínicas
   */
  async obtenerConfiguracion(): Promise<ConfiguracionClinica> {
    try {
      const response = await api.get<ConfiguracionClinica>(`${this.baseUrl}/configuracion`)
      return response.data
    } catch (error) {
      console.warn('Error al obtener configuración, usando configuración por defecto:', error)
      return this.obtenerConfiguracionPorDefecto()
    }
  }

  /**
   * Guarda la configuración general del sistema
   */
  async guardarConfiguracion(configuracion: ConfiguracionClinica): Promise<ConfiguracionClinica> {
    try {
      const response = await api.put<ConfiguracionClinica>(`${this.baseUrl}/configuracion`, configuracion)
      return response.data
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      throw error
    }
  }

  /**
   * Sube el logo de la clínica
   */
  async subirLogo(archivo: File): Promise<{ url: string }> {
    try {
      const formData = new FormData()
      formData.append('logo', archivo)

      const response = await api.post<{ url: string }>(`${this.baseUrl}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al subir logo:', error)
      throw error
    }
  }

  /**
   * Obtiene las clínicas activas para selección
   */
  async obtenerClinicasActivas(): Promise<ClinicaRespuestaDto[]> {
    return this.obtenerClinicas({ estado: 'ACTIVA' as EstadoClinica })
  }

  /**
   * Busca clínicas por nombre o código
   */
  async buscarClinicas(termino: string): Promise<ClinicaRespuestaDto[]> {
    return this.obtenerClinicas({ busqueda: termino })
  }

  // Métodos privados de fallback

  private generarEstadisticasPorDefecto(clinicas: ClinicaRespuestaDto[]): ResumenClinicas {
    const estadisticas: EstadisticasClinicas = {
      totalClinicas: clinicas.length,
      clinicasActivas: clinicas.filter(c => c.estado === 'ACTIVA').length,
      clinicasInactivas: clinicas.filter(c => c.estado !== 'ACTIVA').length,
      clinicasMoviles: clinicas.filter(c => c.tipo === 'MOVIL').length,
      clinicasFijas: clinicas.filter(c => c.tipo === 'FIJA').length,
      clinicasTemporales: clinicas.filter(c => c.tipo === 'TEMPORAL').length,
      capacidadTotalPacientes: clinicas.reduce((sum, c) => sum + (c.capacidadPacientes || 0), 0),
      promedioCapacidadPorClinica: clinicas.length > 0 
        ? Math.round(clinicas.reduce((sum, c) => sum + (c.capacidadPacientes || 0), 0) / clinicas.length)
        : 0
    }

    const tiposCounts = {
      'MOVIL': estadisticas.clinicasMoviles,
      'FIJA': estadisticas.clinicasFijas,
      'TEMPORAL': estadisticas.clinicasTemporales
    }

    const estadosCounts = {
      'ACTIVA': estadisticas.clinicasActivas,
      'INACTIVA': estadisticas.clinicasInactivas,
      'MANTENIMIENTO': 0,
      'EN_RUTA': 0,
      'FUERA_SERVICIO': 0
    }

    return {
      estadisticas,
      clinicasRecientes: clinicas.slice(0, 5),
      clinicasPorTipo: Object.entries(tiposCounts).map(([tipo, cantidad]) => ({
        tipo: tipo as TipoClinica,
        cantidad,
        porcentaje: estadisticas.totalClinicas > 0 ? Math.round((cantidad / estadisticas.totalClinicas) * 100) : 0
      })),
      clinicasPorEstado: Object.entries(estadosCounts).map(([estado, cantidad]) => ({
        estado: estado as EstadoClinica,
        cantidad,
        porcentaje: estadisticas.totalClinicas > 0 ? Math.round((cantidad / estadisticas.totalClinicas) * 100) : 0
      }))
    }
  }

  private obtenerEstadisticasVacias(): ResumenClinicas {
    return {
      estadisticas: {
        totalClinicas: 0,
        clinicasActivas: 0,
        clinicasInactivas: 0,
        clinicasMoviles: 0,
        clinicasFijas: 0,
        clinicasTemporales: 0,
        capacidadTotalPacientes: 0,
        promedioCapacidadPorClinica: 0
      },
      clinicasRecientes: [],
      clinicasPorTipo: [],
      clinicasPorEstado: []
    }
  }

  private obtenerConfiguracionPorDefecto(): ConfiguracionClinica {
    return {
      configuracionGeneral: {
        nombreSistema: 'Sistema Odontológico Universitario',
        direccionBase: 'Campus Universitario',
        telefonoContacto: '+593 9 9999-9999',
        emailContacto: 'contacto@universidad.edu.ec',
        horariosDefault: 'Lun–Vie 08:00–17:00',
        diasLaborales: 'Lun, Mar, Mié, Jue, Vie',
        capacidadDefaultPacientes: 8,
        tiempoTurnoDefault: 30,
        permitirSolapamientoCitas: false
      },
      notificaciones: {
        email: {
          habilitado: true,
          remitente: 'no-reply@universidad.edu.ec'
        },
        sms: {
          habilitado: false,
          proveedor: ''
        },
        recordatorios: {
          horasAntes: 24,
          plantillaEmail: 'Hola {nombre}, te recordamos tu cita el {fecha} a las {hora}.',
          plantillaSms: 'Recordatorio: Cita {fecha} {hora}. {clinica}'
        }
      },
      seguridad: {
        tiempoSesion: '1d',
        longitudMinimaPassword: 8,
        requiereMayuscula: true,
        requiereNumero: true,
        requiereSimbolo: false,
        autenticacion2FA: false
      },
      interfaz: {
        tema: 'system',
        idioma: 'es',
        zonaHoraria: 'America/Guayaquil',
        mostrarLogo: true
      },
      mantenimiento: {
        modoMantenimiento: false,
        mensajeMantenimiento: 'Sistema en mantenimiento. Volvemos pronto.'
      }
    }
  }
}

// Instancia única del servicio
export const clinicaService = new ClinicaService()
export default clinicaService
