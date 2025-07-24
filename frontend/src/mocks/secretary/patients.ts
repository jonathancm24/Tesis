// src/mocks/secretary/patients.ts

// --------------------------------------------------
// Tipos y datos de pacientes (incluye afiliación)
// --------------------------------------------------
export interface Patient {
  id: number;
  nombre: string;
  fechaNacimiento?: string;
  edad?: number;
  genero?: 'M' | 'F';
  cedula: string;
  canton: string;
  parroquia?: string;
  contacto: string;
  telefono?: string;
  enfermedades?: string[];
  medicamentos?: string[];
  alergias?: string[];
  tipoSangre?: string;
  condiciones?: string[];
  // Datos de afiliación
  numAfiliado?: string;
  planAfiliacion?: string;
  fechaInicioAfiliacion?: string;
  fechaFinAfiliacion?: string;
  // Tiempos de creación/actualización
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------
// Datos simulados iniciales
// --------------------------------------------------
export const mockPatients: Patient[] = [
  {
    id: 1,
    nombre: 'Carlos Martínez',
    fechaNacimiento: '1990-05-15',
    edad: 35,
    genero: 'M',
    cedula: '1304523123',
    canton: 'Manta',
    parroquia: 'Tarqui',
    contacto: 'carlos@gmail.com',
    telefono: '0999999999',
    enfermedades: ['Diabetes'],
    medicamentos: ['Metformina'],
    alergias: ['Penicilina'],
    tipoSangre: 'O+',
    condiciones: ['Hipertensión'],
    numAfiliado: 'AF-2025001',
    planAfiliacion: 'Plan Oro',
    fechaInicioAfiliacion: '2024-01-01',
    fechaFinAfiliacion: '2025-12-31',
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-10T12:00:00Z',
  }
]

// --------------------------------------------------
// Funciones mock asíncronas
// --------------------------------------------------
export async function fetchPatientsMock(): Promise<Patient[]> {
  // Simula latencia
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockPatients
}

export async function savePatientMock(newPatient: Patient): Promise<Patient> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const now = new Date().toISOString()
  const idx = mockPatients.findIndex(p => p.id === newPatient.id)

  if (idx >= 0) {
    // Actualiza paciente existente
    mockPatients[idx] = { ...newPatient, updatedAt: now }
    return mockPatients[idx]
  } else {
    // Crea nuevo paciente
    const newId = mockPatients.length
      ? Math.max(...mockPatients.map(p => p.id)) + 1
      : 1
    const patientToAdd: Patient = {
      ...newPatient,
      id: newId,
      createdAt: newPatient.createdAt ?? now,
      updatedAt: newPatient.updatedAt ?? now
    }
    mockPatients.push(patientToAdd)
    return patientToAdd
  }
}

export async function deletePatientMock(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const idx = mockPatients.findIndex(p => p.id === id)
  if (idx >= 0) {
    mockPatients.splice(idx, 1)
  }
}
