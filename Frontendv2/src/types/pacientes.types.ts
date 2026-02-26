/**
 * Tipos TypeScript para el módulo de Pacientes
 * Coherentes con los DTOs del backend
 */

export enum TipoDocumentoPaciente {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC',
  OTRO = 'OTRO'
}

export enum TipoDocumentoRepresentante {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC',
  OTRO = 'OTRO'
}

export interface Paciente {
  id: number
  nombre: string
  apellido: string
  email?: string
  fechaNacimiento: string
  telefono?: string
  direccion?: string
  genero?: string
  Nacionalidad?: string
  parroquiaId?: number
  tipoDocumento: TipoDocumentoPaciente
  numeroDocumento: string
  activo: boolean
  fechaRegistro: string
  EmpresaLaboral?: string
  estadoCivil?: string
  ocupacion?: string
  relacionRep?: string
  representante?: string
  telefonoRep?: string
  numero_documento_rep?: string
  tipoDocumentoRep?: TipoDocumentoRepresentante
  parroquia?: {
    id: number
    nombre: string
  }
}

export interface CreatePacienteDto {
  nombre: string
  apellido: string
  email?: string
  fechaNacimiento: string
  telefono?: string
  direccion?: string
  genero?: string
  Nacionalidad?: string
  parroquiaId: number
  tipoDocumento: TipoDocumentoPaciente
  numeroDocumento: string
  EmpresaLaboral?: string
  estadoCivil?: string
  ocupacion?: string
  relacionRep?: string
  representante?: string
  telefonoRep?: string
  numero_documento_rep?: string
  tipoDocumentoRep?: TipoDocumentoRepresentante
}

export interface UpdatePacienteDto {
  nombre?: string
  apellido?: string
  email?: string
  fechaNacimiento?: string
  telefono?: string
  direccion?: string
  genero?: string
  Nacionalidad?: string
  parroquiaId?: number
  tipoDocumento?: TipoDocumentoPaciente
  numeroDocumento?: string
  EmpresaLaboral?: string
  estadoCivil?: string
  ocupacion?: string
  relacionRep?: string
  representante?: string
  telefonoRep?: string
  numero_documento_rep?: string
  tipoDocumentoRep?: TipoDocumentoRepresentante
  activo?: boolean
}

export interface PaginatedPacientes {
  data: Paciente[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface PacienteFilters {
  nombre?: string
  apellido?: string
  email?: string
  activo?: boolean
  parroquiaId?: number
  tipoDocumento?: TipoDocumentoPaciente
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}
