/**
 * Interfaces TypeScript para el módulo de Hallazgos Clínicos
 * 
 * Este archivo define todas las interfaces utilizadas para tipar
 * los datos relacionados con hallazgos clínicos en el sistema.
 * 
 * @fileoverview Interfaces para el módulo de hallazgos clínicos
 * @module HallazgoClinicoInterface
 */

/**
 * Interface básica para un hallazgo clínico
 * 
 * Define la estructura mínima de un hallazgo clínico
 * según el modelo de base de datos.
 */
export interface IHallazgoClinico {
  /** ID único del hallazgo clínico */
  id: number;
  
  /** ID del caso clínico al que pertenece */
  casoClinicoId: number;
  
  /** Tipo de hallazgo encontrado */
  tipo: string;
  
  /** Código de la zona anatómica */
  codigoZona: string;
  
  /** Descripción detallada del hallazgo (opcional) */
  descripcion?: string;
  
  /** ID del archivo asociado (opcional) */
  archivoId?: number;
}

/**
 * Interface para hallazgo clínico con relaciones completas
 * 
 * Incluye todas las relaciones del modelo de Prisma
 * para consultas que requieren datos relacionados.
 */
export interface IHallazgoClinicoCompleto extends IHallazgoClinico {
  /** Información del caso clínico relacionado */
  casoClinico: {
    id: number;
    fechaCreacion: Date;
    pacienteId: number;
    profesorId: number;
    estudianteId: number;
    especialidadId: number;
    estado: string;
    motivoConsulta: string;
    /** Información del paciente */
    paciente: {
      id: number;
      nombre: string;
      apellido: string;
      numeroDocumento?: string;
    };
    /** Información del estudiante */
    estudiante: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
    };
    /** Información del profesor */
    profesor: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
    };
    /** Información de la especialidad */
    especialidad: {
      id: number;
      nombre: string;
      descripcion?: string;
    };
  };
  
  /** Información del archivo asociado (si existe) */
  archivo?: {
    id: number;
    nombre: string;
    tipo: string;
    url: string;
    fechaSubida: Date;
    descripcion?: string;
  };
}

/**
 * Interface para los datos de creación de un hallazgo clínico
 * 
 * Define los campos requeridos y opcionales para crear
 * un nuevo hallazgo clínico.
 */
export interface ICrearHallazgoClinico {
  /** ID del caso clínico (requerido) */
  casoClinicoId: number;
  
  /** Tipo de hallazgo (requerido) */
  tipo: string;
  
  /** Código de zona anatómica (requerido) */
  codigoZona: string;
  
  /** Descripción detallada (opcional) */
  descripcion?: string;
  
  /** ID del archivo asociado (opcional) */
  archivoId?: number;
}

/**
 * Interface para los datos de actualización de un hallazgo clínico
 * 
 * Todos los campos son opcionales para permitir
 * actualizaciones parciales.
 */
export interface IActualizarHallazgoClinico {
  /** Tipo de hallazgo (opcional) */
  tipo?: string;
  
  /** Código de zona anatómica (opcional) */
  codigoZona?: string;
  
  /** Descripción detallada (opcional) */
  descripcion?: string;
  
  /** ID del archivo asociado (opcional) */
  archivoId?: number;
}

/**
 * Interface para filtros de búsqueda de hallazgos clínicos
 * 
 * Define todos los criterios disponibles para filtrar
 * y paginar hallazgos clínicos.
 */
export interface IFiltrosHallazgoClinico {
  /** Filtrar por ID de caso clínico */
  casoClinicoId?: number;
  
  /** Filtrar por tipo de hallazgo */
  tipo?: string;
  
  /** Filtrar por código de zona */
  codigoZona?: string;
  
  /** Filtrar solo hallazgos con archivos */
  conArchivos?: boolean;
  
  /** Búsqueda en descripción */
  busqueda?: string;
  
  /** Número de página para paginación */
  página?: number;
  
  /** Límite de elementos por página */
  límite?: number;
  
  /** Campo por el cual ordenar */
  ordenarPor?: 'id' | 'tipo' | 'codigoZona' | 'casoClinicoId';
  
  /** Dirección del ordenamiento */
  dirección?: 'asc' | 'desc';
}

/**
 * Interface para respuesta paginada de hallazgos clínicos
 * 
 * Estructura la respuesta de consultas con paginación
 * incluyendo metadatos de la consulta.
 */
export interface IRespuestaPaginadaHallazgos {
  /** Lista de hallazgos clínicos */
  hallazgos: IHallazgoClinico[] | IHallazgoClinicoCompleto[];
  
  /** Metadatos de paginación */
  paginación: {
    /** Total de registros encontrados */
    total: number;
    /** Página actual */
    página: number;
    /** Límite de elementos por página */
    límite: number;
    /** Total de páginas disponibles */
    totalPáginas: number;
  };
}

/**
 * Interface para estadísticas de hallazgos clínicos
 * 
 * Define la estructura de datos estadísticos
 * del módulo de hallazgos clínicos.
 */
export interface IEstadisticasHallazgos {
  /** Total de hallazgos registrados */
  totalHallazgos: number;
  
  /** Distribución por tipo de hallazgo */
  porTipo: Record<string, number>;
  
  /** Cantidad de hallazgos con archivos adjuntos */
  conArchivos: number;
  
  /** Cantidad de hallazgos sin archivos adjuntos */
  sinArchivos: number;
  
  /** Promedio de hallazgos por caso clínico */
  promedioPorCaso: number;
  
  /** Tipos de hallazgos más frecuentes */
  tiposMasFrecuentes: Array<{
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  
  /** Zonas anatómicas más afectadas */
  zonasMasAfectadas: Array<{
    codigoZona: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

/**
 * Interface para información resumida de hallazgo clínico
 * 
 * Versión simplificada para listados y referencias
 * que no requieren todos los datos.
 */
export interface IHallazgoClinicoResumen {
  /** ID del hallazgo */
  id: number;
  
  /** Tipo de hallazgo */
  tipo: string;
  
  /** Código de zona */
  codigoZona: string;
  
  /** Descripción breve (primeros 100 caracteres) */
  descripcionBreve?: string;
  
  /** Indica si tiene archivo adjunto */
  tieneArchivo: boolean;
  
  /** ID del caso clínico */
  casoClinicoId: number;
  
  /** Información básica del paciente */
  paciente: {
    nombre: string;
    apellido: string;
  };
}

/**
 * Interface para validación de acceso a hallazgo clínico
 * 
 * Define la estructura de respuesta para verificación
 * de permisos de acceso a un hallazgo específico.
 */
export interface IAccesoHallazgoClinico {
  /** Indica si el usuario tiene acceso */
  tieneAcceso: boolean;
  
  /** Motivo del acceso o denegación */
  motivo: string;
  
  /** Rol del usuario en relación al hallazgo */
  rolEnCaso?: 'estudiante' | 'docente' | 'administrador';
  
  /** Permisos específicos sobre el hallazgo */
  permisos: {
    leer: boolean;
    editar: boolean;
    eliminar: boolean;
    verArchivos: boolean;
  };
}

/**
 * Enum para tipos de hallazgos clínicos predefinidos
 * 
 * Define los tipos de hallazgos más comunes en
 * la práctica odontológica.
 */
export enum TipoHallazgoClinico {
  CARIES = 'Caries',
  GINGIVITIS = 'Gingivitis',
  PERIODONTITIS = 'Periodontitis',
  ABSCESO = 'Absceso',
  FRACTURA = 'Fractura',
  DESGASTE = 'Desgaste',
  MALOCLUSION = 'Maloclusión',
  LESION_TEJIDOS_BLANDOS = 'Lesión de tejidos blandos',
  ANOMALIA_DENTAL = 'Anomalía dental',
  PATOLOGIA_PULPAR = 'Patología pulpar',
  OTRO = 'Otro'
}

/**
 * Enum para códigos de zonas anatómicas comunes
 * 
 * Define códigos estándar para la nomenclatura
 * dental y zonas anatómicas orales.
 */
export enum ZonaAnatomica {
  // Dientes superiores permanentes
  D_18 = 'D-18', D_17 = 'D-17', D_16 = 'D-16', D_15 = 'D-15', D_14 = 'D-14', D_13 = 'D-13', D_12 = 'D-12', D_11 = 'D-11',
  D_21 = 'D-21', D_22 = 'D-22', D_23 = 'D-23', D_24 = 'D-24', D_25 = 'D-25', D_26 = 'D-26', D_27 = 'D-27', D_28 = 'D-28',
  
  // Dientes inferiores permanentes  
  D_38 = 'D-38', D_37 = 'D-37', D_36 = 'D-36', D_35 = 'D-35', D_34 = 'D-34', D_33 = 'D-33', D_32 = 'D-32', D_31 = 'D-31',
  D_41 = 'D-41', D_42 = 'D-42', D_43 = 'D-43', D_44 = 'D-44', D_45 = 'D-45', D_46 = 'D-46', D_47 = 'D-47', D_48 = 'D-48',
  
  // Zonas de tejidos blandos
  ENCIA_SUPERIOR = 'ENC-SUP',
  ENCIA_INFERIOR = 'ENC-INF',
  LENGUA = 'LENGUA',
  PALADAR = 'PALADAR',
  MEJILLAS = 'MEJILLAS',
  LABIOS = 'LABIOS',
  SUELO_BOCA = 'SUELO-BOCA'
}
