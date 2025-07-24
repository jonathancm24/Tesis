/**
 * MOCK DE ODONTOGRAMA
 * Ubicación: src/mocks/student/odontogram.ts
 *
 * Este archivo contiene:
 * - Tipos y datos necesarios para simular un odontograma
 * - Opciones de daños y tratamientos odontológicos
 * - Datos de ejemplo por paciente y odontograma
 */

export type ToothStatus =
  | ''
  | 'Sano'
  | 'Caries'
  | 'Fractura'
  | 'Ausente'
  | 'Restaurado'
  | 'Extracción indicada';

export type ToothType =
  | 'Temporal'
  | 'Permanente';

export type TreatmentOption =
  | ''
  | 'Obturación'
  | 'Endodoncia'
  | 'Profilaxis'
  | 'Extracción'
  | 'Corona'
  | 'Sellante'
  | 'Ortodoncia'
  | 'Cirugía';

export interface Tooth {
  id: string;
  name: string;
  type: ToothType;
  status: ToothStatus;
  damage: string;
  treatment: TreatmentOption;
  notes?: string;
}

/**
 * Lista de posibles daños en un diente
 */
export const damageOptions: string[] = [
  'Ninguno',
  'Caries superficial',
  'Caries profunda',
  'Fractura coronal',
  'Fractura radicular',
  'Desgaste dental',
  'Diente ausente',
  'Manchas hipoplásicas'
];

/**
 * Opciones de tratamientos odontológicos
 */
export const treatmentOptions: TreatmentOption[] = [
  '',
  'Obturación',
  'Endodoncia',
  'Profilaxis',
  'Extracción',
  'Corona',
  'Sellante',
  'Ortodoncia',
  'Cirugía'
];

/**
 * Estructura de un odontograma por paciente
 */
export interface PatientOdontogram {
  patientId: number;
  patientName: string;
  odontogramType: 'Adulto' | 'Infantil' | 'Mixto';
  teeth: Tooth[];
}

/**
 * MOCK de pacientes con odontogramas
 */
export const odontogramsMock: PatientOdontogram[] = [
  {
    patientId: 1,
    patientName: 'María González',
    odontogramType: 'Adulto',
    teeth: Array.from({ length: 32 }, (_, i) => ({
      id: `D${i + 1}`,
      name: `Diente ${i + 1}`,
      type: 'Permanente' as ToothType,
      status: 'Sano' as ToothStatus,
      damage: 'Ninguno',
      treatment: '',
      notes: ''
    }))
  },
  {
    patientId: 2,
    patientName: 'Carlos López',
    odontogramType: 'Infantil',
    teeth: Array.from({ length: 20 }, (_, i) => ({
      id: `T${i + 1}`,
      name: `Diente Temporal ${i + 1}`,
      type: 'Temporal' as ToothType,
      status: '' as ToothStatus,
      damage: 'Ninguno',
      treatment: '',
      notes: ''
    }))
  }
];
