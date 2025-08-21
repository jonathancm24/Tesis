import api from '@/config/api'
import type { AxiosResponse } from 'axios'

// Tipos para el odontograma
export interface CondicionDental {
  cara: string
  tipoCondicion: string
  descripcion?: string
  codigoColor?: string
  severidad?: number
  requiereTratamiento?: boolean
  observacionesCondicion?: string
}

export interface CrearOdontogramaDto {
  diente: string
  condiciones: CondicionDental[]
  conclusion?: string
  casoClinicoId?: number
}

export interface OdontogramaResponse {
  id: number
  diente: string
  condicion: any
  conclusion?: string
  fechaCreacion: string
  casoClinicoId?: number
  docenteId?: number
  estudianteId: number
}

export interface RespuestaPaginadaOdontogramas {
  odontogramas: OdontogramaResponse[]
  total: number
  totalPaginas: number
  paginaActual: number
  elementosPorPagina: number
  tieneAnterior: boolean
  tieneSiguiente: boolean
}

export interface FiltrosOdontogramas {
  page?: number
  limit?: number
  estudianteId?: number
  docenteId?: number
  casoClinicoId?: number
  diente?: string
  busqueda?: string
  fechaInicio?: string
  fechaFin?: string
  ordenarPor?: string
  direccion?: 'asc' | 'desc'
}

/**
 * Servicio para gestionar odontogramas
 * Conecta el frontend con los endpoints del backend
 */
export class OdontogramaService {
  private readonly baseUrl = '/odontogramas'

  /**
   * Crear un nuevo odontograma
   */
  async crearOdontograma(datos: CrearOdontogramaDto): Promise<OdontogramaResponse> {
    try {
      const response: AxiosResponse<OdontogramaResponse> = await api.post(this.baseUrl, datos)
      return response.data
    } catch (error: any) {
      console.error('Error al crear odontograma:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Obtener odontogramas con filtros
   */
  async obtenerOdontogramas(filtros: FiltrosOdontogramas = {}): Promise<RespuestaPaginadaOdontogramas> {
    try {
      const params = new URLSearchParams()
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response: AxiosResponse<RespuestaPaginadaOdontogramas> = await api.get(
        `${this.baseUrl}?${params.toString()}`
      )
      return response.data
    } catch (error: any) {
      console.error('Error al obtener odontogramas:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Obtener odontograma por ID
   */
  async obtenerOdontogramaPorId(id: number): Promise<OdontogramaResponse> {
    try {
      const response: AxiosResponse<OdontogramaResponse> = await api.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener odontograma:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Actualizar un odontograma
   */
  async actualizarOdontograma(id: number, datos: { conclusion?: string }): Promise<OdontogramaResponse> {
    try {
      const response: AxiosResponse<OdontogramaResponse> = await api.put(`${this.baseUrl}/${id}`, datos)
      return response.data
    } catch (error: any) {
      console.error('Error al actualizar odontograma:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Eliminar un odontograma
   */
  async eliminarOdontograma(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await api.delete(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error al eliminar odontograma:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Obtener mis odontogramas
   */
  async obtenerMisOdontogramas(filtros: Partial<FiltrosOdontogramas> = {}): Promise<RespuestaPaginadaOdontogramas> {
    try {
      const params = new URLSearchParams()
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response: AxiosResponse<RespuestaPaginadaOdontogramas> = await api.get(
        `${this.baseUrl}/mis-odontogramas?${params.toString()}`
      )
      return response.data
    } catch (error: any) {
      console.error('Error al obtener mis odontogramas:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Obtener estadísticas básicas
   */
  async obtenerEstadisticasBasicas(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.get(`${this.baseUrl}/estadisticas/basicas`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Verificar acceso a odontograma
   */
  async verificarAcceso(id: number): Promise<{ tieneAcceso: boolean; tipoAcceso: string; mensaje: string }> {
    try {
      const response: AxiosResponse<{ tieneAcceso: boolean; tipoAcceso: string; mensaje: string }> = 
        await api.get(`${this.baseUrl}/${id}/verificar-acceso`)
      return response.data
    } catch (error: any) {
      console.error('Error al verificar acceso:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Guardar odontograma completo desde el componente
   * Convierte el formato del componente al formato del backend
   */
  async guardarOdontogramaCompleto(
    dientesData: Map<string, any>, 
    casoClinicoId?: number
  ): Promise<OdontogramaResponse[]> {
    try {
      const resultados: OdontogramaResponse[] = []

      for (const [numeroMental, diente] of dientesData) {
        // Solo guardar dientes que tienen condiciones diferentes a "sano"
        const tieneCondiciones = Object.values(diente.superficies).some(
          (superficie: any) => superficie !== 'sano'
        )

        if (tieneCondiciones || diente.observacion) {
          // Convertir superficies a condiciones
          const condiciones: CondicionDental[] = []
          
          Object.entries(diente.superficies).forEach(([cara, tipoCondicion]) => {
            if (tipoCondicion !== 'sano') {
              condiciones.push({
                cara,
                tipoCondicion: tipoCondicion as string,
                descripcion: diente.observacion || undefined
              })
            }
          })

          // Si no hay condiciones específicas pero hay observación, agregar una condición general
          if (condiciones.length === 0 && diente.observacion) {
            condiciones.push({
              cara: 'general',
              tipoCondicion: 'observacion',
              descripcion: diente.observacion
            })
          }

          const odontogramaDto: CrearOdontogramaDto = {
            diente: numeroMental,
            condiciones,
            conclusion: diente.observacion,
            casoClinicoId
          }

          const resultado = await this.crearOdontograma(odontogramaDto)
          resultados.push(resultado)
        }
      }

      return resultados
    } catch (error: any) {
      console.error('Error al guardar odontograma completo:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Cargar odontograma por caso clínico
   */
  async cargarOdontogramaPorCaso(casoClinicoId: number): Promise<RespuestaPaginadaOdontogramas> {
    try {
      return await this.obtenerOdontogramas({ casoClinicoId, limit: 100 })
    } catch (error: any) {
      console.error('Error al cargar odontograma por caso:', error)
      throw this.manejarError(error)
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private manejarError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor
      const mensaje = error.response.data?.message || error.response.data?.error || 'Error del servidor'
      return new Error(`${mensaje} (${error.response.status})`)
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión con el servidor')
    } else {
      // Otro tipo de error
      return new Error(error.message || 'Error desconocido')
    }
  }
}

// Instancia singleton del servicio
export const odontogramaService = new OdontogramaService()
export default odontogramaService
