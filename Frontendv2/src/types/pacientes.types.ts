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

export interface HistorialResumenPaciente {
  totalCasosClinicos: number
  totalEncuestas: number
  totalObservaciones: number
  totalTratamientos: number
  totalPrescripciones: number
}

export interface HistorialObservacion {
  id: number
  fecha: string
  titulo: string
  descripcion: string
  contenidoDocente?: string | null
  contenidoEstudiante?: string | null
  estado: string
  docente?: {
    id: number
    nombre: string
    apellido: string
  } | null
  estudiante?: {
    id: number
    nombre: string
    apellido: string
  } | null
}

export interface HistorialTratamiento {
  id: number
  descripcion: string
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
  observaciones?: HistorialObservacion[]
}

export interface HistorialPrescripcion {
  id: number
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
  observaciones?: HistorialObservacion[]
}

export interface HistorialOdontogramaRegistro {
  id: number
  diente: string
  conclusion?: string | null
  condicion: {
    caras: Array<{
      cara: string
      observacion?: string | null
      condicion?: string | null
    }>
  }
  fechaCreacion: string
}

export interface HistorialCasoClinico {
  id: number
  fechaCreacion: string
  fechaActualizacion: string
  estado: string
  especialidad?: {
    id: number
    nombre: string
  } | null
  profesor?: {
    id: number
    nombre: string
    apellido: string
    email?: string
  } | null
  estudiante?: {
    id: number
    nombre: string
    apellido: string
    email?: string
  } | null
  ATM: string
  CarayCuello: string
  PielyMucosa: string
  craneo: string
  enfermedadActual: string
  facies: string
  marcha: string
  motivoConsulta: string
  peso: number
  talla: number
  observaciones: HistorialObservacion[]
  tratamientos: HistorialTratamiento[]
  prescripciones: HistorialPrescripcion[]
  odontograma: HistorialOdontogramaRegistro[]
}

export interface HistorialEncuesta {
  encuestaId: number
  pacienteId: number
  fecha: string
  totalPreguntas: number
  respuestasCompletadas: number
  porcentaje: number
  estado: 'PENDIENTE' | 'BORRADOR' | 'COMPLETADA'
  esUltimaVersion: boolean
  respuestas: Array<{
    id: number
    preguntaId: number
    respuesta: string | null
    detalle: string | null
    pregunta: {
      id: number
      texto: string
      tipo: string
      categoria?: string | null
    }
  }>
}

export interface HistorialCompletoPaciente {
  paciente: Paciente
  resumen: HistorialResumenPaciente
  encuestas: HistorialEncuesta[]
  casosClinicos: HistorialCasoClinico[]
  notaVersionado?: string
}
