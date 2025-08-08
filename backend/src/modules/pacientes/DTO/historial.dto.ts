/**
 * DTOs para el historial completo del paciente
 * Incluye información personal, encuestas de tamizaje, casos clínicos y citas
 */

// Información básica del paciente
export class PacienteBasicoDto {
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
  
  // Datos del representante
  representante?: string;
  cedulaRep?: string;
  relacionRep?: string;
  telefonoRep?: string;
  
  // Información de ubicación
  parroquia: {
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
  };
}

// Encuesta de tamizaje resumida
export class EncuestaTamizajeDto {
  id: number;
  fecha: Date;
  totalRespuestas: number;
  completada: boolean;
}

// Caso clínico resumido
export class CasoClinicoDto {
  id: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: string; // EstadoCasoClinico enum
  motivoConsulta: string;
  calificacion?: number;
  
  // Información del estudiante y profesor
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
  
  // Contadores de elementos relacionados
  totalTratamientos: number;
  totalObservaciones: number;
  totalOdontogramas: number;
}

// Cita resumida
export class CitaDto {
  id: number;
  fecha: Date;
  horainicio: Date;
  horafin: Date;
  estado: string; // EstadoCita enum
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

// Tratamiento resumido
export class TratamientoDto {
  id: number;
  descripcion: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: string; // EstadoTratamiento enum
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

/**
 * DTO principal del historial completo del paciente
 */
export class HistorialCompletoDto {
  // Información básica del paciente
  paciente: PacienteBasicoDto;
  
  // Encuestas de tamizaje
  encuestasTamizaje: EncuestaTamizajeDto[];
  
  // Casos clínicos
  casosClinicos: CasoClinicoDto[];
  
  // Citas médicas
  citas: CitaDto[];
  
  // Tratamientos (derivados de casos clínicos)
  tratamientos: TratamientoDto[];
  
  // Estadísticas resumidas
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

/**
 * DTO para listar pacientes con información resumida
 */
export class PacienteListaDto {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  email?: string;
  fechaNacimiento: Date;
  edad: number; // Calculada
  activo: boolean;
  fechaRegistro: Date;
  
  // Contadores rápidos
  totalCasosClinicos: number;
  ultimaVisita?: Date;
  proximaCita?: Date;
  
  parroquia: {
    nombre: string;
    canton: {
      nombre: string;
    };
  };
}
