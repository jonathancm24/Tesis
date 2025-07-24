// src/mocks/student/resources.ts

export type ResourceType = 'PDF' | 'Guía' | 'Retroalimentación' | 'Formulario';

export interface Resource {
  id: number;
  title: string;
  subject: string;
  type: ResourceType;
  file: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const resourcesMock: Resource[] = [
  {
    id: 1,
    title: 'Protocolo de Endodoncia',
    subject: 'Endodoncia',
    type: 'PDF',
    file: 'uploads/protocolo_endodoncia.pdf',
    description: 'Protocolo actualizado para tratamientos endodónticos.',
    uploadedBy: 'Dra. Pérez',
    uploadedAt: '2025-07-10'
  },
  {
    id: 2,
    title: 'Guía Clínica Ortodoncia',
    subject: 'Ortodoncia',
    type: 'Guía',
    file: 'uploads/guia_ortodoncia.pdf',
    description: 'Lineamientos para diagnóstico y planificación ortodóntica.',
    uploadedBy: 'Dr. García',
    uploadedAt: '2025-07-12'
  },
  {
    id: 3,
    title: 'Retroalimentación Caso Ana Torres',
    subject: 'Periodoncia',
    type: 'Retroalimentación',
    file: 'uploads/retro_ana_torres.txt',
    description: 'Observaciones y sugerencias sobre el caso clínico.',
    uploadedBy: 'Dra. Moreno',
    uploadedAt: '2025-07-13'
  },
  {
    id: 4,
    title: 'Formulario de Consentimiento',
    subject: 'Cirugía Bucal',
    type: 'Formulario',
    file: 'uploads/formulario_consentimiento.pdf',
    description: 'Documento para consentimiento informado antes de cirugía.',
    uploadedBy: 'Dr. Pérez',
    uploadedAt: '2025-07-09'
  }
];
