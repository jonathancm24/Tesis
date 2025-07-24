// odontologia-admin/src/mocks/secretary/medicalHistories.ts
export interface MedicalHistory {
  id: number;
  patientId: number;
  enfermedades: string[];
  medicamentos: string[];
  alergias: string[];
  tipoSangre: string;
  condiciones: string[];

  // Nuevos campos
  estaEmbarazada?: boolean;
  fuma: boolean;
  consumeAlcohol: boolean;
  tieneDiscapacidad: boolean;
  haSidoHospitalizado: boolean;
  antecedentesFamiliares: string;
  observaciones: string;

  createdAt: string;
  updatedAt: string;
}

export const medicalHistories: MedicalHistory[] = [
  {
    id: 1,
    patientId: 1,
    enfermedades: ['Diabetes', 'Hipertensión'],
    medicamentos: ['Metformina', 'Losartán'],
    alergias: ['Penicilina'],
    tipoSangre: 'O+',
    condiciones: ['Problemas cardíacos'],

    // Nuevos datos
    estaEmbarazada: false,
    fuma: true,
    consumeAlcohol: false,
    tieneDiscapacidad: false,
    haSidoHospitalizado: true,
    antecedentesFamiliares: 'Padre con diabetes y madre con hipertensión.',
    observaciones: 'Paciente refiere mareos frecuentes.',

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    patientId: 2,
    enfermedades: [],
    medicamentos: [],
    alergias: [],
    tipoSangre: 'A-',
    condiciones: [],

    // Nuevos datos
    estaEmbarazada: true,
    fuma: false,
    consumeAlcohol: false,
    tieneDiscapacidad: false,
    haSidoHospitalizado: false,
    antecedentesFamiliares: '',
    observaciones: 'Sin antecedentes relevantes.',

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
