import { describe, expect, it } from 'vitest';
import type { TreatmentRecord } from '@/types';
import { isFDIFormat, isValidTreatmentRecord, validateRecords } from '@/utils/validation';

function makeRecord(overrides: Partial<TreatmentRecord> = {}): TreatmentRecord {
  return {
    id: 't-0001',
    toothFDI: '14',
    kind: 'condition',
    code: 'caries',
    surfaces: ['occlusal'],
    date: '2026-10-01',
    status: 'realizado',
    notes: '',
    linkedTeeth: [],
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('Validación clínica', () => {
  it('acepta FDI en formato ISO 3950', () => {
    expect(isFDIFormat('11')).toBe(true);
    expect(isFDIFormat('48')).toBe(true);
    expect(isFDIFormat('8')).toBe(false);
    expect(isFDIFormat('0A')).toBe(false);
  });

  it('rechaza registros incompletos', () => {
    expect(isValidTreatmentRecord(makeRecord({ surfaces: [] }))).toBe(false);
    expect(isValidTreatmentRecord(makeRecord({ kind: 'invalid' as TreatmentRecord['kind'] }))).toBe(false);
  });

  it('detecta duplicados de FDI', () => {
    const report = validateRecords([
      makeRecord({ id: 't-001', toothFDI: '14' }),
      makeRecord({ id: 't-002', toothFDI: '14' }),
    ]);
    expect(report.valid).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it('acepta un documento con registros válidos', () => {
    const report = validateRecords([makeRecord()]);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });
});
