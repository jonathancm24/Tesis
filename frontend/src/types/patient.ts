// Tipos para la gestión de pacientes basados en los DTOs del backend

export interface Parroquia {
  id: number;
  nombre: string;
  canton: {
    id: number;
    nombre: string;
    provincia: {
      id: number;
      nombre: string;
      pais: {
        id: number;
        nombre: string;
      };
    };
  };
}

// Tipos de documento disponibles
export const TipoDocumento = {
  CEDULA: 'CEDULA',
  PASAPORTE: 'PASAPORTE',
  RUC: 'RUC',
  OTRO: 'OTRO'
} as const;

export type TipoDocumentoType = typeof TipoDocumento[keyof typeof TipoDocumento];

// Tipos de documento para representante (mismos valores, pero separado por claridad)
export const TipoDocumentoRepresentante = {
  CEDULA: 'CEDULA',
  PASAPORTE: 'PASAPORTE',
  RUC: 'RUC',
  OTRO: 'OTRO'
} as const;

export type TipoDocumentoRepresentanteType = typeof TipoDocumentoRepresentante[keyof typeof TipoDocumentoRepresentante];

// Labels amigables para el usuario
export const TipoDocumentoLabels = {
  [TipoDocumento.CEDULA]: 'Cédula Ecuatoriana',
  [TipoDocumento.PASAPORTE]: 'Pasaporte',
  [TipoDocumento.RUC]: 'RUC',
  [TipoDocumento.OTRO]: 'Otro Documento'
} as const;

// Labels para tipo de documento del representante (iguales pero separadas por claridad)
export const TipoDocumentoRepresentanteLabels = {
  [TipoDocumentoRepresentante.CEDULA]: 'Cédula Ecuatoriana',
  [TipoDocumentoRepresentante.PASAPORTE]: 'Pasaporte',
  [TipoDocumentoRepresentante.RUC]: 'RUC',
  [TipoDocumentoRepresentante.OTRO]: 'Otro Documento'
} as const;

export interface RegistroPaciente {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  tipoDocumento: TipoDocumentoType;
  numeroDocumento: string;
  parroquiaId: number;
  telefono?: string;
  direccion?: string;
  genero?: string;
  Nacionalidad?: string;
  email?: string;
  estadoCivil?: string;
  ocupacion?: string;
  EmpresaLaboral?: string;
  representante?: string;
  tipoDocumentoRep?: TipoDocumentoRepresentanteType;
  numeroDocumentoRep?: string;
  relacionRep?: string;
  telefonoRep?: string;
}

export interface PacienteBasico {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  telefono?: string;
  direccion?: string;
  genero?: string;
  Nacionalidad?: string;
  cedula: string;
  email?: string;
  estadoCivil?: string;
  ocupacion?: string;
  EmpresaLaboral?: string;
  activo: boolean;
  fechaRegistro: Date;
  representante?: string;
  tipoDocumentoRep?: string;
  numeroDocumentoRep?: string;
  relacionRep?: string;
  telefonoRep?: string;
  parroquia: Parroquia;
}

export interface PacienteLista {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  email?: string;
  fechaNacimiento: Date;
  edad: number;
  genero?: string;
  activo: boolean;
  fechaRegistro: Date;
  totalCasosClinicos: number;
  ultimaVisita?: Date;
  proximaCita?: Date;
  tieneEncuestaCompleta?: boolean;
  parroquia: {
    nombre: string;
    canton: {
      nombre: string;
    };
  };
}

export interface EncuestaTamizaje {
  id: number;
  fecha: Date;
  totalRespuestas: number;
  completada: boolean;
}

export interface CasoClinico {
  id: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: string;
  motivoConsulta: string;
  calificacion?: number;
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
  };
  profesor: {
    id: number;
    nombre: string;
    apellido: string;
  };
  especialidad: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  totalTratamientos: number;
  totalObservaciones: number;
  totalOdontogramas: number;
}

export interface Cita {
  id: number;
  fecha: Date;
  horainicio: Date;
  horafin: Date;
  estado: string;
  observaciones?: string;
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
  };
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  especialidad: {
    id: number;
    nombre: string;
  };
}

export interface Tratamiento {
  id: number;
  descripcion: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: string;
  tipoDiagnostico: string;
  cie10Codigo?: string;
  procedimientoCodigo?: string;
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
  };
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface HistorialCompleto {
  paciente: PacienteBasico;
  encuestasTamizaje: EncuestaTamizaje[];
  casosClinicos: CasoClinico[];
  citas: Cita[];
  tratamientos: Tratamiento[];
  resumen: {
    totalCasosClinicos: number;
    casosActivos: number;
    casosFinalizados: number;
    totalCitas: number;
    citasPendientes: number;
    totalEncuestas: number;
    encuestasCompletas: number;
    ultimaVisita?: Date;
    proximaCita?: Date;
  };
}

// Enums para selectores
export const EstadosCita = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  CANCELADA: 'Cancelada',
  FINALIZADA: 'Finalizada',
  NO_ASISTIO: 'No Asistió'
} as const;

export const EstadosCasoClinico = {
  EN_REVISION: 'En Revisión',
  APROBADO: 'Aprobado',
  PENDIENTE_ESTUDIOS: 'Pendiente Estudios',
  EN_TRATAMIENTO: 'En Tratamiento',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado'
} as const;

export const EstadosTratamiento = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  CANCELADO: 'Cancelado',
  EN_PROCESO: 'En Proceso',
  FINALIZADO: 'Finalizado'
} as const;

export const Generos = [
  'Masculino',
  'Femenino',
  'Otro'
] as const;

export const EstadosCiviles = [
  'Soltero',
  'Casado',
  'Divorciado',
  'Viudo',
  'Unión Libre'
] as const;

export const RelacionesRepresentante = [
  'Padre',
  'Madre',
  'Tutor',
  'Abuelo/a',
  'Tío/a',
  'Hermano/a',
  'Otro'
] as const;
