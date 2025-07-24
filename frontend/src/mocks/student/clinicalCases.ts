// src/mocks/student/clinicalCases.ts

import { delay } from '../utils'

// —────────────────────────────────────────────────────────────────────────────—
// Types & Interfaces
// —────────────────────────────────────────────────────────────────────────────—

/** Estado global de un caso clínico */
export type ClinicalCaseStatus =
  | 'pendiente_general'
  | 'pendiente_especialidad'
  | 'aprobado'
  | 'completado'

/** Pregunta de cuestionario */
export interface CaseQuestion {
  id: string
  label: string
  answer?: string
  approved?: boolean
  feedback?: string
}

/** Procedimiento dentro de un caso clínico */
export interface Procedure {
  code: string
  teeth?: string
  description: string
}

/** Prescripción médica */
export interface Prescription {
  id: number
  drug: string
  dose: string
}

/** Cita vinculada al caso */
export interface CaseAppointment {
  id: number
  date: string    // ISO date o date-time
  status: 'pendiente' | 'confirmada' | 'cancelada'
  notes?: string
}

/** Comentario de revisión */
export interface CaseComment {
  by: string
  at: string      // timestamp ISO
  text: string
}

/** Entrada de odontograma */
export interface OdontogramEntry {
  tooth: string
  status: 'sano' | 'caries' | 'restaurado' | 'extraido'
  annotations?: string
}

/** Entrada de periodontograma */
export interface PeriodontogramEntry {
  tooth: string
  probingDepth: number      // mm de sondaje
  attachmentLevel: number   // mm de nivel de inserción
}

/** Modelo completo de un caso clínico */
export interface ClinicalCase {
  id: number
  patientName: string
  title: string
  stage:
    | 'presentacion'
    | 'diagnostico'
    | 'plan'
    | 'procedimiento'
    | 'seguimiento'
  reason: string
  symptoms: string
  notes?: string
  specialist?: string

  generalQuestions: CaseQuestion[]      // aprobadas por cualquier profesor
  specialistQuestions: CaseQuestion[]   // aprobadas solo por el profe de la especialidad

  procedures: Procedure[]
  prescriptions: Prescription[]
  appointments: CaseAppointment[]
  comments: CaseComment[]

  odontogram: OdontogramEntry[]
  periodontogram: PeriodontogramEntry[]

  status: ClinicalCaseStatus
  createdAt: string
  updatedAt: string
}

// —────────────────────────────────────────────────────────────────────────────—
// Mock data
// —────────────────────────────────────────────────────────────────────────────—

let cases: ClinicalCase[] = [
  {
    id: 1,
    patientName: 'María González',
    title: 'Dolor en molar superior derecho',
    stage: 'diagnostico',
    reason: 'Dolor agudo al masticar',
    symptoms: 'Sensibilidad al frío y calor, dolor espontáneo.',
    notes: 'Posible pulpitis irreversible.',
    specialist: 'Dr. Pérez',

    generalQuestions: [
      { id: 'g1', label: 'Motivo de consulta' },
      { id: 'g2', label: 'Pulso (lpm)' },
      { id: 'g3', label: 'Frecuencia respiratoria (rpm)' },
      { id: 'g4', label: 'Presión arterial (mmHg)' }
    ],

    specialistQuestions: [
      { id: 's1', label: 'Sensibilidad al frío' },
      { id: 's2', label: 'Sensibilidad al calor' },
      { id: 's3', label: 'Reacción a la percusión' }
    ],

    procedures: [
      { code: 'E123', teeth: '16', description: 'Endodoncia unirradicular' }
    ],

    prescriptions: [
      { id: 1, drug: 'Ibuprofeno 400mg', dose: 'Cada 8h por 3 días' }
    ],

    appointments: [
      { id: 1, date: '2025-07-22T09:00:00Z', status: 'confirmada' }
    ],

    comments: [
      { by: 'Prof. López', at: '2025-07-21T10:15:00Z', text: 'Revisar radiografía.' }
    ],

    odontogram: [
      { tooth: '16', status: 'caries', annotations: 'Lesión oclusal' }
    ],

    periodontogram: [
      { tooth: '16', probingDepth: 4, attachmentLevel: 3 }
    ],

    status: 'pendiente_general',
    createdAt: new Date('2025-07-20T08:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-20T08:00:00Z').toISOString()
  },
  {
    id: 2,
    patientName: 'Carlos López',
    title: 'Revisión de brackets',
    stage: 'seguimiento',
    reason: 'Ajuste mensual de ortodoncia',
    symptoms: 'Sin dolor, molestias leves.',
    notes: 'Paciente tolera bien la aparatología.',
    specialist: 'Dra. Gómez',

    generalQuestions: [
      { id: 'g1', label: '¿Ha tenido sangrado de encías?' }
    ],

    specialistQuestions: [
      { id: 's1', label: '¿Se siente presión en los alambres?' }
    ],

    procedures: [
      { code: 'O110', description: 'Ajuste de brackets' }
    ],

    prescriptions: [],

    appointments: [
      { id: 2, date: '2025-07-25T11:00:00Z', status: 'pendiente' }
    ],

    comments: [],

    odontogram: [],

    periodontogram: [],

    status: 'pendiente_especialidad',
    createdAt: new Date('2025-06-20T09:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-20T09:00:00Z').toISOString()
  }
]

// —────────────────────────────────────────────────────────────────────────────—
// CRUD simulations
// —────────────────────────────────────────────────────────────────────────────—

/** Recupera todos los casos clínicos */
export async function fetchCasesMock(): Promise<ClinicalCase[]> {
  await delay()
  return cases.map(c => ({ ...c }))
}

/**
 * Crea o actualiza un caso clínico.
 * - Si existe `c.id`, lo actualiza.
 * - Si no, asigna nuevo id y lo agrega.
 */
export async function saveCaseMock(c: ClinicalCase): Promise<ClinicalCase> {
  await delay()
  const now = new Date().toISOString()
  if (cases.some(x => x.id === c.id)) {
    cases = cases.map(x =>
      x.id === c.id ? { ...c, updatedAt: now } : x
    )
  } else {
    const newId = Math.max(0, ...cases.map(x => x.id)) + 1
    c.id = newId
    c.createdAt = now
    c.updatedAt = now
    cases.push({ ...c })
  }
  return { ...c }
}

/** Elimina un caso clínico por su id */
export async function deleteCaseMock(id: number): Promise<void> {
  await delay()
  cases = cases.filter(c => c.id !== id)
}
