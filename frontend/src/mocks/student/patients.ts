// src/mocks/student/patients.ts
// ---------------------------------------------------
// MOCK DE PACIENTES ESTUDIANTES
// Genera datos ficticios para el Dashboard de Estudiantes
// ---------------------------------------------------

/**
 * Tipo Treatment
 * Representa un tratamiento clínico realizado a un paciente.
 */
export interface Treatment {
  id: number;
  title: string;
  description: string;
  date: string;
  supervisor: string;
}

/**
 * Tipo Patient
 * Representa un paciente en el sistema.
 */
export interface Patient {
  id: number;
  name: string;
  email: string;
  treatment: string;
  detail: string;
  state: 'Activo' | 'Pendiente' | 'Completado';
  nextAppointment: string;
  progress: number;

  // Campos clínicos adicionales
  age: number;
  cedula: string;
  phone: string;
  allergies: string;
  medications: string;
  conditions: string;
  history: Treatment[];
}

/**
 * Función simulada para obtener datos de pacientes.
 * Devuelve un array ficticio de Patient.
 */
export async function fetchPatientsMock(): Promise<Patient[]> {
  return [
    {
      id: 1,
      name: 'María González',
      email: 'maria.gonzalez@odontologia.com',
      treatment: 'Ortodoncia',
      detail: 'Ajuste mensual de brackets',
      state: 'Activo',
      nextAppointment: '20 jul 2025',
      progress: 40,
      age: 35,
      cedula: '1234567890',
      phone: '0991234567',
      allergies: 'Penicilina',
      medications: 'Ibuprofeno 400 mg',
      conditions: 'Hipertensión',
      history: [
        {
          id: 1,
          title: 'Limpieza dental',
          description: 'Profilaxis completa con flúor',
          date: '9 ene 2024',
          supervisor: 'Dr. García'
        },
        {
          id: 2,
          title: 'Obturación',
          description: 'Restauración de caries en molar superior derecho',
          date: '14 dic 2023',
          supervisor: 'Dr. García'
        }
      ]
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@odontologia.com',
      treatment: 'Endodoncia',
      detail: 'Tratamiento en pieza 26',
      state: 'Pendiente',
      nextAppointment: '25 jul 2025',
      progress: 20,
      age: 28,
      cedula: '0987654321',
      phone: '0997654321',
      allergies: 'Ninguna',
      medications: 'Ninguno',
      conditions: 'Saludable',
      history: [
        {
          id: 1,
          title: 'Ortodoncia',
          description: 'Colocación de brackets metálicos',
          date: '7 ene 2024',
          supervisor: 'Dra. Pérez'
        }
      ]
    },
    {
      id: 3,
      name: 'Ana Torres',
      email: 'ana.torres@odontologia.com',
      treatment: 'Limpieza',
      detail: 'Profilaxis cada 6 meses',
      state: 'Completado',
      nextAppointment: '10 dic 2025',
      progress: 100,
      age: 42,
      cedula: '1122334455',
      phone: '0987654322',
      allergies: 'Latex',
      medications: 'Paracetamol',
      conditions: 'Diabetes tipo II',
      history: [
        {
          id: 1,
          title: 'Limpieza dental',
          description: 'Profilaxis dental completa',
          date: '10 dic 2023',
          supervisor: 'Dr. López'
        }
      ]
    }
  ];
}
