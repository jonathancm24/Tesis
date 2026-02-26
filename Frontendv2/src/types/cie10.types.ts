export interface Cie10Item {
  codigo: string
  tipo: string
  descripcion: string
}

export interface Cie10ListResponse {
  data: Cie10Item[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Cie10Filters {
  search?: string
  tipo?: string
  page?: number
  limit?: number
}

export interface CreateCie10Dto {
  codigo: string
  tipo: string
  descripcion: string
}

export interface UpdateCie10Dto {
  tipo?: string
  descripcion?: string
}

export interface Cie10ImportResult {
  totalFilas: number
  creados: number
  actualizados: number
  omitidos: number
  errores: Array<{
    fila: number
    mensaje: string
  }>
}
