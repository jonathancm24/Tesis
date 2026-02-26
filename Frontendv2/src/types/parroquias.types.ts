/**
 * Tipos para el módulo de Parroquias
 */

export interface Pais {
  id: number
  nombre: string
}

export interface Provincia {
  id: number
  nombre: string
  pais?: Pais
}

export interface Canton {
  id: number
  nombre: string
  provincia?: Provincia
}

export interface ParroquiaSimple {
  id: number
  nombre: string
}

export interface ParroquiaCompleta {
  id: number
  nombre: string
  canton?: Canton
}

export interface ParroquiaSearch extends ParroquiaCompleta {
  canton: {
    id: number
    nombre: string
    provincia: {
      id: number
      nombre: string
      pais: {
        id: number
        nombre: string
      }
    }
  }
}
