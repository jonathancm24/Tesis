import { describe, expect, it } from 'vitest';
import type { TreatmentRecord } from '@/types';
import { deriveToothStatus } from '@/utils/toothStatus';

function record(overrides: Partial<TreatmentRecord>): TreatmentRecord {
  return {
    id: 't-test',
    toothFDI: '14',
    kind: 'procedure',
    code: 'endodoncia',
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

describe('Derivación del estado clínico', () => {
  it('una pieza sin registros queda sana', () => {
    expect(deriveToothStatus([], '14')).toBe('sano');
  });

  it('una condición patológica la marca como patología', () => {
    const status = deriveToothStatus([record({ kind: 'condition', code: 'caries', status: 'realizado' })], '14');
    expect(status).toBe('patologia');
  });

  it('una endodoncia realizada la marca como tratada', () => {
    const status = deriveToothStatus([record({ kind: 'procedure', code: 'endodoncia' })], '14');
    expect(status).toBe('tratado');
  });

  it('una extracción la marca como ausente', () => {
    const status = deriveToothStatus(
      [record({ kind: 'condition', code: 'ausente' })],
      '14',
    );
    expect(status).toBe('ausente');
  });

  it('filtra los registros por FDI', () => {
    const all = [
      record({ id: 'a', toothFDI: '14', code: 'caries' }),
      record({ id: 'b', toothFDI: '25', code: 'corona' }),
    ];
    const for14 = all.filter((r) => r.toothFDI === '14');
    expect(for14).toHaveLength(1);
    expect(for14[0]?.code).toBe('caries');
  });
});
