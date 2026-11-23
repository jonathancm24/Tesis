import type { ToothStatus, TreatmentRecord } from '@/types';

/**
 * Derivación del estado clínico actual de una pieza a partir de sus registros.
 * Regla de precedencia: ausente > patología > planificado > tratado > sano.
 */
export function deriveToothStatus(records: TreatmentRecord[], fdi: string): ToothStatus {
  const fdiRecords = records.filter((r) => r.toothFDI === fdi);
  if (fdiRecords.some((r) => r.kind === 'condition' && (r.code === 'ausente' || r.code === 'extraccion'))) {
    return 'ausente';
  }
  if (fdiRecords.some((r) => r.kind === 'condition')) return 'patologia';
  if (fdiRecords.some((r) => r.kind === 'procedure' && r.status === 'realizado')) return 'tratado';
  if (fdiRecords.some((r) => r.kind === 'procedure' && r.status === 'en_proceso')) return 'tratado';
  if (fdiRecords.some((r) => r.kind === 'procedure' && r.status === 'planificado')) return 'planificado';
  if (fdiRecords.length > 0) return 'tratado';
  return 'sano';
}

export const STATUS_META: Record<
  ToothStatus,
  { label: string; color: string; description: string }
> = {
  sano: { label: 'Sano', color: '#0e9f6e', description: 'Sin alteraciones registradas.' },
  ausente: { label: 'Ausente', color: '#64748b', description: 'Pieza ausente.' },
  patologia: { label: 'Con patología', color: '#d97706', description: 'Condición clínica detectada.' },
  planificado: { label: 'Planificado', color: '#0284c7', description: 'Procedimiento planificado.' },
  tratado: { label: 'Tratado', color: '#0e7490', description: 'Procedimiento realizado o en proceso.' },
};

export function recordsForFDI(records: TreatmentRecord[], fdi: string): TreatmentRecord[] {
  return records
    .filter((r) => r.toothFDI === fdi)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
