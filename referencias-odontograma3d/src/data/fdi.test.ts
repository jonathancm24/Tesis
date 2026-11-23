import { describe, expect, it } from 'vitest';
import { ALL_TEETH, getToothInfo, isValidFDI, teethOfArch } from '@/data/fdi';

describe('Catálogo FDI (ISO 3950) — dentición permanente', () => {
  it('contiene las 32 piezas permanentes', () => {
    expect(ALL_TEETH).toHaveLength(32);
  });

  it('expone los FDI válidos entre 11 y 48', () => {
    for (let position = 1; position <= 8; position += 1) {
      for (let quadrant = 1; quadrant <= 4; quadrant += 1) {
        const fdi = `${quadrant}${position}`;
        expect(isValidFDI(fdi)).toBe(true);
        expect(getToothInfo(fdi)).toBeDefined();
      }
    }
    expect(isValidFDI('0A')).toBe(false);
    expect(isValidFDI('59')).toBe(false);
  });

  it('clasifica las arcadas y lados de forma correcta', () => {
    expect(getToothInfo('11')?.arch).toBe('upper');
    expect(getToothInfo('11')?.side).toBe('right');
    expect(getToothInfo('11')?.quadrant).toBe(1);

    expect(getToothInfo('38')?.arch).toBe('lower');
    expect(getToothInfo('38')?.side).toBe('left');
    expect(getToothInfo('38')?.quadrant).toBe(3);

    expect(getToothInfo('41')?.arch).toBe('lower');
    expect(getToothInfo('41')?.side).toBe('right');
    expect(getToothInfo('41')?.quadrant).toBe(4);
  });

  it('agrega 16 dientes por arcada', () => {
    expect(teethOfArch('upper')).toHaveLength(16);
    expect(teethOfArch('lower')).toHaveLength(16);
  });
});
