// src/mocks/professor/progress.ts

/**
 * Estado de progreso de un estudiante en una asignación
 */
export type StudentProgressStatus = 'pendiente' | 'entregado' | 'corregido'

/**
 * Representa un registro de progreso de un estudiante
 */
export interface StudentProgress {
  /** Identificador único de la asignación */
  assignmentId: number
  /** Identificador del estudiante */
  studentId: number
  /** Nombre completo del estudiante */
  studentName: string
  /** Curso o materia asociada */
  course: string
  /** Estado actual de la entrega */
  status: StudentProgressStatus
  /** Calificación obtenida (si corresponde) */
  grade?: number
  /** Timestamp de la última actualización */
  lastUpdated: string
}

// Base de datos en memoria para mocks
const _progressDB: StudentProgress[] = [
  {
    assignmentId: 1,
    studentId: 101,
    studentName: 'Ana Gómez',
    course: 'Anatomía Dental',
    status: 'pendiente',
    lastUpdated: '2025-07-01T10:15:00Z',
  },
  {
    assignmentId: 2,
    studentId: 102,
    studentName: 'Luis Pérez',
    course: 'Anatomía Dental',
    status: 'entregado',
    grade: 85,
    lastUpdated: '2025-07-02T14:30:00Z',
  },
  {
    assignmentId: 3,
    studentId: 103,
    studentName: 'María Ruiz',
    course: 'Fisiología Oral',
    status: 'corregido',
    grade: 92,
    lastUpdated: '2025-06-30T09:00:00Z',
  },
  // …más registros de ejemplo…
]

/**
 * Simula la obtención de todos los registros de progreso.
 */
export async function fetchProgressMock(): Promise<StudentProgress[]> {
  await delay(300)
  // devolvemos una copia para evitar mutaciones externas
  return _progressDB.map(item => ({ ...item }))
}

/**
 * Simula el borrado de un registro de progreso por assignmentId.
 */
export async function deleteProgressMock(assignmentId: number): Promise<void> {
  await delay(300)
  const idx = _progressDB.findIndex(p => p.assignmentId === assignmentId)
  if (idx >= 0) {
    _progressDB.splice(idx, 1)
  }
}

/**
 * Simula guardar o actualizar un registro de progreso.
 */
export async function saveProgressMock(progress: StudentProgress): Promise<StudentProgress> {
  await delay(300)
  const idx = _progressDB.findIndex(p => p.assignmentId === progress.assignmentId)
  if (idx >= 0) {
    // Actualizar existente
    _progressDB[idx] = { ...progress }
  } else {
    // Crear nuevo
    _progressDB.push({ ...progress })
  }
  return { ...progress }
}

/**
 * Retardo auxiliar para simular latencia.
 */
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
