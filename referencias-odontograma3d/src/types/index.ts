/**
 * Tipos de dominio del odontograma 3D.
 *
 * El modelo está pensado para migrar sin fricciones a una API REST + PostgreSQL:
 * cada registro clínico es autosuficiente, tiene identificador único y referencia
 * a la pieza dental mediante el número FDI (ISO 3950).
 */

/** Arcada: superior (maxilar) o inferior (mandibular). */
export type Arch = 'upper' | 'lower';

/** Lado de la cavidad oral respecto al paciente. */
export type Side = 'right' | 'left';

/** Clase anatómica de la pieza dental. */
export type ToothClass = 'incisor' | 'canine' | 'premolar' | 'molar';

/** Superficies dentales registrables. */
export type DentalSurface =
  | 'vestibular'
  | 'lingual'
  | 'mesial'
  | 'distal'
  | 'occlusal';

/** Naturaleza del registro clínico: condición detectada o procedimiento. */
export type RecordKind = 'condition' | 'procedure';

/** Estado de ejecución de un registro clínico. */
export type RecordStatus = 'planificado' | 'en_proceso' | 'realizado';

/** Identificador FDI (número de pieza) como cadena, p. ej. "16". */
export type FDI = string;

/** Catálogo unificado de condiciones clínicas y procedimientos. */
export interface CatalogItem {
  /** Código estable, usado en persistencia y en la API. */
  id: string;
  /** Etiqueta en español mostrada en la UI. */
  label: string;
  kind: RecordKind;
  /** Color de referencia para listados/etiquetas (no define el render 3D). */
  color: string;
  /** Descripción corta. */
  description: string;
  /** Superficie por defecto sugerida (null = no aplica, p. ej. pieza ausente). */
  defaultSurface: DentalSurface | null;
}

/** Registro clínico de una pieza dental. */
export interface TreatmentRecord {
  /** UUID único del registro. */
  id: string;
  /** Pieza dental según FDI. */
  toothFDI: FDI;
  /** Condición o procedimiento. */
  kind: RecordKind;
  /** Código del catálogo (CatalogItem.id). */
  code: string;
  /** Superficies afectadas (puede ser varias, p. ej. oclusal + distal). */
  surfaces: DentalSurface[];
  /** Fecha del registro ISO (yyyy-MM-dd). */
  date: string;
  status: RecordStatus;
  /** Observaciones clínicas libres. */
  notes: string;
  /** Piezas relacionadas, solo para prótesis/puentes/implantes unitarios. */
  linkedTeeth?: FDI[];
  createdAt: string;
  updatedAt: string;
}

/** Información de paciente (demo/local, nunca datos reales de producción). */
export interface PatientInfo {
  id: string;
  name: string;
  document: string;
  birthDate: string;
  notes: string;
}

/** Documento persistido en LocalStorage / exportado a JSON. */
export interface OdontogramDocument {
  version: 1;
  patient: PatientInfo;
  records: TreatmentRecord[];
  updatedAt: string;
}

/** Información anatómica resumida de una pieza. */
export interface ToothInfo {
  fdi: FDI;
  arch: Arch;
  side: Side;
  quadrant: 1 | 2 | 3 | 4;
  position: number;
  toothClass: ToothClass;
  /** Nombre anatómico en español. */
  name: string;
  /** Nombre corto (p. ej. "Primer molar superior derecho"). */
  shortName: string;
}

/** Estado clínico derivado de los registros de una pieza. */
export type ToothStatus =
  | 'sano'
  | 'ausente'
  | 'patologia'
  | 'planificado'
  | 'tratado';

/** Estado visual de la escena 3D para una pieza. */
export interface DisplayOptions {
  gums: boolean;
  roots: boolean;
  canals: boolean;
  labels: boolean;
  selected: boolean;
}

/** Vistas predefinidas de la cámara. */
export type CameraView =
  | 'front'
  | 'superior'
  | 'inferior'
  | 'left'
  | 'right'
  | 'reset';

/** Filtrado de arcadas visible. */
export type ArchVisibility = 'both' | 'upper' | 'lower';
