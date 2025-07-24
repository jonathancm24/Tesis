// odontologia-admin/src/mocks/secretary/patientAssignments.ts
export interface PatientAssignment {
  id: number;
  pacienteId: number;
  estudianteId: number;
  fechaAsignacion: string;
  estado: 'asignado' | 'cancelado' | 'finalizado';
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// 🗂️ Datos simulados de asignaciones
const assignments: PatientAssignment[] = [
  {
    id: 1,
    pacienteId: 101,
    estudianteId: 201,
    fechaAsignacion: '2025-07-15',
    estado: 'asignado',
    notas: 'Primera evaluación clínica',
    createdAt: '2025-07-15T09:00:00Z',
    updatedAt: '2025-07-15T09:00:00Z'
  },
  {
    id: 2,
    pacienteId: 102,
    estudianteId: 202,
    fechaAsignacion: '2025-07-16',
    estado: 'cancelado',
    notas: 'El paciente no asistió',
    createdAt: '2025-07-16T10:00:00Z',
    updatedAt: '2025-07-17T08:00:00Z'
  },
  {
    id: 3,
    pacienteId: 103,
    estudianteId: 201,
    fechaAsignacion: '2025-07-17',
    estado: 'finalizado',
    notas: 'Tratamiento concluido con éxito',
    createdAt: '2025-07-17T08:30:00Z',
    updatedAt: '2025-07-18T13:45:00Z'
  }
];

// 📦 Funciones simuladas para trabajar con las asignaciones
export function fetchPatientAssignmentsMock(): Promise<PatientAssignment[]> {
  return Promise.resolve(assignments);
}

export function addPatientAssignmentMock(newAssignment: PatientAssignment): Promise<void> {
  assignments.push({ ...newAssignment, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return Promise.resolve();
}

export function updatePatientAssignmentMock(updated: PatientAssignment): Promise<void> {
  const index = assignments.findIndex(a => a.id === updated.id);
  if (index !== -1) {
    assignments[index] = {
      ...assignments[index],
      ...updated,
      updatedAt: new Date().toISOString()
    };
  }
  return Promise.resolve();
}

export function deletePatientAssignmentMock(id: number): Promise<void> {
  const index = assignments.findIndex(a => a.id === id);
  if (index !== -1) assignments.splice(index, 1);
  return Promise.resolve();
}
