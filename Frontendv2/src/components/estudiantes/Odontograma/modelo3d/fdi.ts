import type { Arch, FDI, Side, ToothClass, ToothInfo } from './types';

/**
 * Catálogo oficial de las 32 piezas permanentes según FDI (ISO 3950).
 *
 * Cuadrantes:
 *  1 = superior derecho   2 = superior izquierdo
 *  3 = inferior izquierdo 4 = inferior derecho
 */

const CLASS_NAMES: Record<ToothClass, string[]> = {
  // índice 0 = posición 1 ... índice 7 = posición 8
  incisor: ['incisivo central', 'incisivo lateral'],
  canine: ['canino'],
  premolar: ['primer premolar', 'segundo premolar'],
  molar: ['primer molar', 'segundo molar', 'tercer molar'],
};

function classForPosition(position: number): ToothClass {
  if (position <= 2) return 'incisor';
  if (position === 3) return 'canine';
  if (position <= 5) return 'premolar';
  return 'molar';
}

/** Devuelve el nombre anatómico para una posición (1-8) de la dentición permanente. */
function classLabel(position: number): string {
  const toothClass = classForPosition(position);
  if (toothClass === 'incisor') return CLASS_NAMES.incisor[position - 1]!;
  if (toothClass === 'canine') return CLASS_NAMES.canine[0]!;
  if (toothClass === 'premolar') return CLASS_NAMES.premolar[position - 4]!;
  return CLASS_NAMES.molar[position - 6]!;
}

const SIDE_LABEL: Record<Side, string> = { right: 'derecho', left: 'izquierdo' };
const ARCH_LABEL: Record<Arch, string> = { upper: 'superior', lower: 'inferior' };

function quadrantOf(fdi: FDI): 1 | 2 | 3 | 4 {
  const q = Number(fdi[0]);
  if (q < 1 || q > 4) throw new Error(`Cuadrante FDI inválido: ${fdi}`);
  return q as 1 | 2 | 3 | 4;
}

function archOf(quadrant: 1 | 2 | 3 | 4): Arch {
  return quadrant <= 2 ? 'upper' : 'lower';
}

function sideOf(quadrant: 1 | 2 | 3 | 4): Side {
  return quadrant === 1 || quadrant === 4 ? 'right' : 'left';
}

/** Construye la información anatómica completa de una pieza FDI. */
export function buildToothInfo(fdi: FDI): ToothInfo {
  if (!/^[1-4][1-8]$/.test(fdi)) throw new Error(`FDI inválido: ${fdi}`);
  const quadrant = quadrantOf(fdi);
  const position = Number(fdi[1]);
  const toothClass = classForPosition(position);
  const label = classLabel(position);
  const arch = archOf(quadrant);
  const side = sideOf(quadrant);
  const name = `${label.charAt(0).toUpperCase()}${label.slice(1)} ${ARCH_LABEL[arch]} ${SIDE_LABEL[side]}`;
  return {
    fdi,
    arch,
    side,
    quadrant,
    position,
    toothClass,
    name,
    shortName: `${label.charAt(0).toUpperCase()}${label.slice(1)} ${ARCH_LABEL[arch]}`,
  };
}

/** Las 32 piezas permanentes, ordenadas arcada por arcada (18→11, 21→28...). */
export const ALL_TEETH: ToothInfo[] = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '38', '37', '36', '35', '34', '33', '32', '31',
  '41', '42', '43', '44', '45', '46', '47', '48',
].map(buildToothInfo);

const BY_FDI = new Map<FDI, ToothInfo>(ALL_TEETH.map((t) => [t.fdi, t]));

export function getToothInfo(fdi: FDI): ToothInfo | undefined {
  return BY_FDI.get(fdi);
}

export function teethOfArch(arch: Arch): ToothInfo[] {
  return ALL_TEETH.filter((t) => t.arch === arch);
}
