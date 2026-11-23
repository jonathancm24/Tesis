import type { TreatmentRecord, ToothStatus } from '@/types';
import { isValidFDI, getToothInfo } from '@/data/fdi';
import { deriveToothStatus } from '@/utils/toothStatus';

/** Valida un FDI en el formato ISO 3950 (11-48). */
export function isFDIFormat(fdi: string): boolean {
  return isValidFDI(fdi);
}

/** Valida un registro clínico completo. */
export function isValidTreatmentRecord(record: TreatmentRecord): boolean {
  if (!isFDIFormat(record.toothFDI)) return false;
  if (!record.id || record.id.length < 6) return false;
  if (!record.code) return false;
  if (!record.date || Number.isNaN(Date.parse(record.date))) return false;
  if (!['condition', 'procedure'].includes(record.kind)) return false;
  if (!['planificado', 'en_proceso', 'realizado'].includes(record.status)) return false;
  if (!Array.isArray(record.surfaces) || record.surfaces.length === 0) return false;
  const allowedSurfaces = ['vestibular', 'lingual', 'mesial', 'distal', 'occlusal'];
  const okSurfaces = record.surfaces.every((s) => allowedSurfaces.includes(s));
  return okSurfaces;
}

/** Busca un diente por FDI en el catálogo oficial de 32 piezas. */
export function findToothByFDI(fdi: string) {
  return getToothInfo(fdi);
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
}

export function validateRecords(records: TreatmentRecord[]): ValidationReport {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenFDI = new Set<string>();
  for (const record of records) {
    if (seenIds.has(record.id)) errors.push(`ID duplicado: ${record.id}`);
    seenIds.add(record.id);
    if (!isFDIFormat(record.toothFDI)) errors.push(`FDI inválido en registro ${record.id}: ${record.toothFDI}`);
    else if (seenFDI.has(record.toothFDI)) errors.push(`FDI duplicado en registros: ${record.toothFDI}`);
    else seenFDI.add(record.toothFDI);
    if (!isValidTreatmentRecord(record)) errors.push(`Registro incompleto: ${record.id} (${record.code})`);
  }
  return { valid: errors.length === 0, errors };
}

export function statusCounts(records: TreatmentRecord[]): Record<ToothStatus, number> {
  const counts: Record<ToothStatus, number> = { sano: 0, ausente: 0, patologia: 0, planificado: 0, tratado: 0 };
  const presentFDI = new Set<string>();
  for (const record of records) {
    if (!presentFDI.has(record.toothFDI)) {
      presentFDI.add(record.toothFDI);
      const status = deriveToothStatus(records, record.toothFDI);
      if (status) counts[status] += 1;
    }
  }
  return counts;
}
