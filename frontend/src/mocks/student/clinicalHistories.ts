// src/mocks/student/clinicalHistories.ts
import { delay } from '../utils';

// —────────────────────────────────────────────────────────────────────────────—
// Types & Interfaces
// —────────────────────────────────────────────────────────────────────────────—

/** Historia clínica ampliada con datos de tamizaje */
export interface ClinicalHistory {
  id: number;
  patientId: number;

  // Datos principales
  generalData: string;
  dentalHistory: string;
  physicalExam: string;
  intraoralFindings: string;

  // Alergias y medicación
  allergies: string[];
  medications: string[];

  // Antecedentes sistémicos y familiares
  systemicHistory: string;
  familyHistory: string;

  // Tamizaje específico
  isPregnant?: boolean;
  smoker: boolean;
  alcoholUse: boolean;
  hospitalized?: boolean;
  disability?: boolean;

  // Observaciones libres
  observations?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// —────────────────────────────────────────────────────────────────────────────—
// Mock data (inicial)
// —────────────────────────────────────────────────────────────────────────────—

let histories: ClinicalHistory[] = [
  {
    id: 1,
    patientId: 1,
    generalData: 'Paciente femenina, 32 años, sin enfermedades crónicas relevantes.',
    dentalHistory: 'Obturaciones en piezas 14 y 15 hace 2 años.',
    physicalExam: 'Tensión arterial 120/80, frecuencia cardíaca 72 bpm.',
    intraoralFindings: 'Encías levemente inflamadas en sector anterior superior.',
    allergies: ['Penicilina'],
    medications: ['Ibuprofeno 400mg'],
    systemicHistory: 'Hipertensión controlada con dieta.',
    familyHistory: 'Padre diabético, madre con hipertensión.',
    isPregnant: false,
    smoker: false,
    alcoholUse: false,
    hospitalized: false,
    disability: false,
    observations: 'Recomendar limpieza dental profunda.',
    createdAt: '2025-07-10T09:30:00Z',
    updatedAt: '2025-07-10T09:30:00Z'
  },
  {
    id: 2,
    patientId: 2,
    generalData: 'Paciente masculino, 45 años, diabético tipo II.',
    dentalHistory: 'Extracción de molar 36 hace 1 año.',
    physicalExam: 'Glucemia en ayunas: 130 mg/dL, FC 78 bpm.',
    intraoralFindings: 'Recesión gingival en molares inferiores.',
    allergies: [],
    medications: ['Metformina'],
    systemicHistory: 'Diabetes tipo II desde hace 5 años.',
    familyHistory: 'Madre con diabetes.',
    isPregnant: false,
    smoker: true,
    alcoholUse: true,
    hospitalized: true,
    disability: false,
    observations: 'Control estricto de glucemia antes de cualquier procedimiento.',
    createdAt: '2025-07-12T11:15:00Z',
    updatedAt: '2025-07-12T11:15:00Z'
  }
];

// —────────────────────────────────────────────────────────────────────────────—
// CRUD simulations
// —────────────────────────────────────────────────────────────────────────────—

/** Obtiene todas las historias clínicas. */
export async function fetchHistoriesMock(): Promise<ClinicalHistory[]> {
  await delay();
  // clonamos para evitar mutaciones externas
  return histories.map(h => ({ ...h }));
}

/**
 * Crea o actualiza una historia clínica.
 * - Si `h.id` existe, actualiza.
 * - Si no, genera un nuevo id y agrega.
 */
export async function saveHistoryMock(
  h: Partial<ClinicalHistory> & Omit<ClinicalHistory, 'id'|'createdAt'|'updatedAt'> & { id?: number }
): Promise<ClinicalHistory> {
  await delay();
  const now = new Date().toISOString();

  if (h.id != null) {
    histories = histories.map(x =>
      x.id === h.id
        ? { ...x, ...h, updatedAt: now }
        : x
    );
    return histories.find(x => x.id === h.id)!;
  } else {
    const newId = histories.length ? Math.max(...histories.map(x => x.id)) + 1 : 1;
    const newEntry: ClinicalHistory = {
      id: newId,
      ...h,
      createdAt: now,
      updatedAt: now
    } as ClinicalHistory;
    histories.push(newEntry);
    return newEntry;
  }
}

/** Elimina una historia clínica por su id. */
export async function deleteHistoryMock(id: number): Promise<void> {
  await delay();
  histories = histories.filter(h => h.id !== id);
}
