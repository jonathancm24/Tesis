/**
 * Servicio para la gestión de datos base del sistema
 * Maneja especialidades médicas y ubicaciones geográficas
 * Archivo: src/services/baseDataService.ts
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api'
import type {
  Especialidad,
  Pais,
  Provincia, 
  Canton,
  Parroquia,
  CreateEspecialidadDTO,
  CreatePaisDTO,
  CreateProvinciaDTO,
  CreateCantonDTO,
  CreateParroquiaDTO
} from '@/types/baseData'

class BaseDataService {
  private readonly baseUrl = API_CONFIG.BASE_URL

  // ==========================================
  // ESPECIALIDADES MÉDICAS
  // ==========================================

  /**
   * Obtiene todas las especialidades médicas
   */
  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const response = await fetch(`${this.baseUrl}/especialidades`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo especialidades:', error)
      throw new Error('No se pudieron cargar las especialidades')
    }
  }

  /**
   * Obtiene una especialidad por ID
   */
  async getEspecialidadById(id: number): Promise<Especialidad> {
    try {
      const response = await fetch(`${this.baseUrl}/especialidades/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo especialidad:', error)
      throw new Error('No se pudo cargar la especialidad')
    }
  }

  /**
   * Crea una nueva especialidad médica
   */
  async createEspecialidad(especialidad: CreateEspecialidadDTO): Promise<Especialidad> {
    try {
      const response = await fetch(`${this.baseUrl}/especialidades`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(especialidad)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creando especialidad:', error)
      throw new Error('No se pudo crear la especialidad')
    }
  }

  // ==========================================
  // PAÍSES
  // ==========================================

  /**
   * Obtiene todos los países
   */
  async getPaises(): Promise<Pais[]> {
    try {
      const response = await fetch(`${this.baseUrl}/pais`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo países:', error)
      throw new Error('No se pudieron cargar los países')
    }
  }

  /**
   * Crea un nuevo país
   */
  async createPais(pais: CreatePaisDTO): Promise<Pais> {
    try {
      const response = await fetch(`${this.baseUrl}/pais`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: pais.nombre })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creando país:', error)
      throw new Error('No se pudo crear el país')
    }
  }

  // ==========================================
  // PROVINCIAS
  // ==========================================

  /**
   * Obtiene todas las provincias
   */
  async getProvincias(): Promise<Provincia[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provincia`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo provincias:', error)
      throw new Error('No se pudieron cargar las provincias')
    }
  }

  /**
   * Obtiene las provincias de un país específico
   */
  async getProvinciasByPais(paisId: number): Promise<Provincia[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provincia?paisId=${paisId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.filter((provincia: Provincia) => provincia.paisId === paisId)
    } catch (error) {
      console.error('Error obteniendo provincias por país:', error)
      throw new Error('No se pudieron cargar las provincias del país')
    }
  }

  /**
   * Crea una nueva provincia
   */
  async createProvincia(provincia: CreateProvinciaDTO): Promise<Provincia> {
    try {
      const response = await fetch(`${this.baseUrl}/provincia`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: provincia.nombre,
          paisId: provincia.paisId 
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creando provincia:', error)
      throw new Error('No se pudo crear la provincia')
    }
  }

  // ==========================================
  // CANTONES
  // ==========================================

  /**
   * Obtiene todos los cantones
   */
  async getCantones(): Promise<Canton[]> {
    try {
      const response = await fetch(`${this.baseUrl}/canton`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo cantones:', error)
      throw new Error('No se pudieron cargar los cantones')
    }
  }

  /**
   * Obtiene los cantones de una provincia específica
   */
  async getCantonesByProvincia(provinciaId: number): Promise<Canton[]> {
    try {
      const response = await fetch(`${this.baseUrl}/canton?provinciaId=${provinciaId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.filter((canton: Canton) => canton.provinciaId === provinciaId)
    } catch (error) {
      console.error('Error obteniendo cantones por provincia:', error)
      throw new Error('No se pudieron cargar los cantones de la provincia')
    }
  }

  /**
   * Crea un nuevo cantón
   */
  async createCanton(canton: CreateCantonDTO): Promise<Canton> {
    try {
      const response = await fetch(`${this.baseUrl}/canton`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: canton.nombre,
          provinciaId: canton.provinciaId
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creando cantón:', error)
      throw new Error('No se pudo crear el cantón')
    }
  }

  // ==========================================
  // PARROQUIAS
  // ==========================================

  /**
   * Obtiene todas las parroquias
   */
  async getParroquias(): Promise<Parroquia[]> {
    try {
      const response = await fetch(`${this.baseUrl}/parroquia`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo parroquias:', error)
      throw new Error('No se pudieron cargar las parroquias')
    }
  }

  /**
   * Obtiene las parroquias de un cantón específico
   */
  async getParroquiasByCanton(cantonId: number): Promise<Parroquia[]> {
    try {
      const response = await fetch(`${this.baseUrl}/parroquia?cantonId=${cantonId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.filter((parroquia: Parroquia) => parroquia.cantonId === cantonId)
    } catch (error) {
      console.error('Error obteniendo parroquias por cantón:', error)
      throw new Error('No se pudieron cargar las parroquias del cantón')
    }
  }

  /**
   * Crea una nueva parroquia
   */
  async createParroquia(parroquia: CreateParroquiaDTO): Promise<Parroquia> {
    try {
      const response = await fetch(`${this.baseUrl}/parroquia`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: parroquia.nombre,
          cantonId: parroquia.cantonId
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creando parroquia:', error)
      throw new Error('No se pudo crear la parroquia')
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Obtiene la jerarquía completa de ubicaciones para un país específico
   */
  async getUbicacionHierarchy(paisId: number) {
    try {
      const [pais, provincias] = await Promise.all([
        this.getPaises().then(paises => paises.find(p => p.id === paisId)),
        this.getProvinciasByPais(paisId)
      ])

      if (!pais) {
        throw new Error('País no encontrado')
      }

      const cantones = await Promise.all(
        provincias.map(provincia => this.getCantonesByProvincia(provincia.id))
      ).then(results => results.flat())

      const parroquias = await Promise.all(
        cantones.map(canton => this.getParroquiasByCanton(canton.id))
      ).then(results => results.flat())

      return {
        pais,
        provincias,
        cantones,
        parroquias
      }
    } catch (error) {
      console.error('Error obteniendo jerarquía de ubicaciones:', error)
      throw new Error('No se pudo cargar la jerarquía de ubicaciones')
    }
  }
}

// Exportar instancia singleton del servicio
export const baseDataService = new BaseDataService()
