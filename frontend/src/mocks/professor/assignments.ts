// src/mocks/professor/assignments.ts

/** Representa una tarea académica asignada */
export interface Assignment {
  id: number
  title: string
  description: string
  course: string
  dueDate: string       // YYYY-MM-DD
  createdAt: string     // ISO timestamp
}

/** Base de datos mock de assignments */
const assignmentsDB: Assignment[] = [
  {
    id: 1,
    title: 'Caso Clínico #1',
    description: 'Descripción del caso clínico inicial...',
    course: 'Anatomía Dental',
    dueDate: '2025-08-01',
    createdAt: '2025-07-10T10:00:00Z'
  },
  {
    id: 2,
    title: 'Historia Clínica #2',
    description: 'Registrar historia clínica detallada...',
    course: 'Patología Oral',
    dueDate: '2025-08-05',
    createdAt: '2025-07-11T11:30:00Z'
  }
]

/** Simula latencia */
function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/** Trae todas las asignaciones */
export async function fetchAssignmentsMock(): Promise<Assignment[]> {
  await delay(200)
  return assignmentsDB.map(a => ({ ...a }))
}

/** Crea o actualiza una asignación */
export async function saveAssignmentMock(a: Assignment): Promise<Assignment> {
  await delay(200)
  const idx = assignmentsDB.findIndex(x => x.id === a.id)
  if (idx >= 0) {
    assignmentsDB[idx] = { ...a }
  } else {
    const nextId = Math.max(0, ...assignmentsDB.map(x => x.id)) + 1
    a.id = nextId
    assignmentsDB.push({ ...a })
  }
  return { ...a }
}

/** Elimina una asignación por ID */
export async function deleteAssignmentMock(id: number): Promise<void> {
  await delay(200)
  const idx = assignmentsDB.findIndex(x => x.id === id)
  if (idx >= 0) assignmentsDB.splice(idx, 1)
}
