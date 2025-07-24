// src/mocks/student/assignments.ts
export type AssignmentStatus = 'Pendiente' | 'En progreso' | 'Completada';

export interface Assignment {
  id: number;
  subject: string;
  title: string;
  description: string;
  professor: string;
  deadline: string;
  status: AssignmentStatus;
  progress: number; // % de avance
  files: string[]; // rutas de archivos entregados
}

export const assignmentsMock: Assignment[] = [
  {
    id: 1,
    subject: 'Endodoncia',
    title: 'Informe de caso clínico',
    description: 'Desarrollar un informe detallado sobre un tratamiento de conducto.',
    professor: 'Dra. Pérez',
    deadline: '2025-07-30',
    status: 'Pendiente',
    progress: 0,
    files: []
  },
  {
    id: 2,
    subject: 'Ortodoncia',
    title: 'Presentación PowerPoint',
    description: 'Crear presentación sobre técnicas modernas de ortodoncia.',
    professor: 'Dr. García',
    deadline: '2025-07-20',
    status: 'En progreso',
    progress: 50,
    files: ['uploads/ppt_ortodoncia.pdf']
  },
  {
    id: 3,
    subject: 'Periodoncia',
    title: 'Registro fotográfico',
    description: 'Subir fotografías clínicas antes y después de limpieza profunda.',
    professor: 'Dra. Moreno',
    deadline: '2025-07-15',
    status: 'Completada',
    progress: 100,
    files: ['uploads/fotos_caso1.jpg']
  }
];
