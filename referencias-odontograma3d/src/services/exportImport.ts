import type { OdontogramDocument, TreatmentRecord } from '@/types';

export const ODONTOGRAM_VERSION = 1;

export function createDocument(patient: Partial<import('@/types').PatientInfo>, records: TreatmentRecord[]): OdontogramDocument {
  return {
    version: ODONTOGRAM_VERSION,
    patient: {
      id: patient.id ?? 'patient-default',
      name: patient.name ?? 'Paciente',
      document: patient.document ?? '',
      birthDate: patient.birthDate ?? '',
      notes: patient.notes ?? '',
    },
    records,
    updatedAt: new Date().toISOString(),
  };
}

export function exportJson(doc: OdontogramDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function importJson(raw: string): OdontogramDocument {
  const parsed = JSON.parse(raw) as Partial<OdontogramDocument>;
  if (typeof parsed.version !== 'number') throw new Error('Documento con versión faltante');
  const version = parsed.version as number;
  if (version !== ODONTOGRAM_VERSION) throw new Error(`Versión de odontograma no soportada: ${version}`);
  if (!Array.isArray(parsed.records)) throw new Error('El documento requiere el campo "records" (array).');
  const records = parsed.records.filter(
    (r) => r && typeof r.toothFDI === 'string' && typeof r.id === 'string' && typeof r.code === 'string',
  );
  return {
    version: ODONTOGRAM_VERSION,
    patient: parsed.patient ?? { id: 'patient-default', name: 'Paciente', document: '', birthDate: '', notes: '' },
    records,
    updatedAt: new Date().toISOString(),
  };
}

export function downloadJson(doc: OdontogramDocument, filename = 'odontograma.json') {
  const blob = new Blob([exportJson(doc)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
