import type { Arch, ToothClass } from './types';

/**
 * Parámetros anatómicos de las32 piezas permanentes.
 *
 * Las medidas son valores medios publicados de odontología legal (mm):
 * diámetro mesiodistal (MD), diametro vestibulolingual (BL), altura de corona
 * y longitud radicular. A partir de ellos se genera la geometría paramétrica.
 */

export type CuspPattern = 'incisal' | 'canine' | 'bicuspid' | 'premolar' | 'molar';

/** Cúspide normalizada: x>0 mesial, z>0 vestibular; amp en mm. */
export interface CuspSpec {
  x: number;
  z: number;
  amp: number;
  su: number;
  sz: number;
}

export interface RootBranchSpec {
  /** Desplazamiento de la rama respecto al eje en la furcación (mm). */
  ox: number;
  oz: number;
  /** Divergencia hacia el ápice (mm). */
  splayX: number;
  splayZ: number;
  /** Radios de la sección en la furcación (mm). */
  rx: number;
  rz: number;
  /** Curvatura del ápice (mm). */
  bendX: number;
  bendZ: number;
  /** Longitud relativa al resto de ramas. */
  lengthScale: number;
}

export interface RootSpec {
  /** Fracción de la longitud radicular destinada al tronco (0 si es unitaria). */
  trunkFraction: number;
  branches: RootBranchSpec[];
}

export interface ToothAnatomy {
  fdi: string;
  arch: Arch;
  toothClass: ToothClass;
  /** Diámetro mesiodistal de la corona (mm). */
  md: number;
  /** Diámetro vestibulolingual de la corona (mm). */
  bl: number;
  /** Altura de la corona desde el ECJ (mm). */
  crownHeight: number;
  /** Longitud radicular (mm). */
  rootLength: number;
  /** Fracción de la altura de corona hasta la que llega la pared (canino < 1). */
  capBaseFraction: number;
  pattern: CuspPattern;
  cusps: CuspSpec[];
  /** Profundidad de surcos en mm. */
  grooves: { md: number; bl: number; fossa: number };
  /** Exponente de la superelipse:2 = elipse, mayor = más rectangular. */
  nCervical: number;
  nOcclusal: number;
  /** Inclinación de la pieza (grados): X = vestibulolingual, Z = mesiodistal. */
  tilt: { x: number; z: number };
  /** Curvatura radicular (mm) hacia el ápice. */
  rootBend: { x: number; z: number };
  roots: RootSpec;
}

/** Perfil [factor de altura, factor de anchura] interpolado con suavizado. */
type ProfileKey = [number, number];

function sampleProfile(keys: ProfileKey[], v: number): number {
  if (v <= keys[0]![0]) return keys[0]![1];
  const last = keys[keys.length - 1]!;
  if (v >= last[0]) return last[1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [v0, f0] = keys[i]!;
    const [v1, f1] = keys[i + 1]!;
    if (v >= v0 && v <= v1) {
      const t = (v - v0) / (v1 - v0);
      const s = t * t * (3 - 2 * t);
      return f0 + (f1 - f0) * s;
    }
  }
  return last[1];
}

/** Perfiles de anchura normalizados por clase anatómica. */
export const PROFILE_MD: Record<CuspPattern, ProfileKey[]> = {
  // incisivo: ancho máximo en el tercio incisal
  incisal: [[0, 0.82], [0.5, 0.95], [0.8, 1.0], [1, 1.0]],
  // canino: estrechamiento hacia el hombro (capBase = 0.72)
  canine: [[0, 0.84], [0.55, 1.0], [0.8, 0.78], [1, 0.6]],
  bicuspid: [[0, 0.85], [0.5, 1.0], [1, 0.93]],
  premolar: [[0, 0.85], [0.5, 1.0], [1, 0.93]],
  molar: [[0, 0.88], [0.45, 1.0], [1, 0.97]],
};

export const PROFILE_BL: Record<CuspPattern, ProfileKey[]> = {
  // incisivo: delgando hacia el borde incisal
  incisal: [[0, 0.78], [0.55, 1.0], [0.85, 0.6], [1, 0.42]],
  canine: [[0, 0.8], [0.45, 1.0], [0.8, 0.72], [1, 0.6]],
  bicuspid: [[0, 0.84], [0.5, 1.0], [1, 0.9]],
  premolar: [[0, 0.84], [0.5, 1.0], [1, 0.9]],
  molar: [[0, 0.86], [0.5, 1.0], [1, 0.95]],
};

export function profileFactor(pattern: CuspPattern, axis: 'md' | 'bl', v: number): number {
  return sampleProfile(axis === 'md' ? PROFILE_MD[pattern] : PROFILE_BL[pattern], v);
}

/** Medidas medias (mm) por posición y arcada: [md, bl, crownHeight, rootLength]. */
const MEASURES: Record<string, [number, number, number, number]> = {
  'upper-1': [8.5, 7.0, 10.5, 12.5],
  'upper-2': [6.5, 6.0, 9.5, 11.0],
  'upper-3': [7.5, 8.0, 10.5, 17.5],
  'upper-4': [7.0, 9.0, 8.5, 13.5],
  'upper-5': [7.0, 9.0, 8.5, 13.0],
  'upper-6': [10.0, 11.0, 7.5, 13.0],
  'upper-7': [9.5, 10.5, 7.5, 12.5],
  'upper-8': [8.5, 9.5, 7.0, 11.5],
  'lower-1': [5.0, 5.5, 9.0, 11.0],
  'lower-2': [5.5, 6.0, 9.5, 12.0],
  'lower-3': [6.5, 7.0, 11.0, 16.0],
  'lower-4': [7.0, 7.5, 8.5, 15.5],
  'lower-5': [7.0, 7.5, 8.5, 14.5],
  'lower-6': [10.5, 10.5, 7.5, 15.5],
  'lower-7': [10.0, 10.0, 7.5, 15.0],
  'lower-8': [9.0, 9.5, 7.0, 13.0],
};

function patternOf(position: number): CuspPattern {
  if (position <= 2) return 'incisal';
  if (position === 3) return 'canine';
  if (position <= 5) return 'bicuspid';
  return 'molar';
}

function cuspsFor(arch: Arch, position: number, pattern: CuspPattern): CuspSpec[] {
  if (pattern === 'incisal') {
    // Borde incisal ligeramente lobulado (restos de mamelones).
    return [
      { x: -0.45, z: 0, amp: 0.14, su: 0.2, sz: 0.55 },
      { x: 0, z: 0, amp: 0.16, su: 0.2, sz: 0.55 },
      { x: 0.45, z: 0, amp: 0.14, su: 0.2, sz: 0.55 },
    ];
  }
  if (pattern === 'canine') {
    const amp = arch === 'upper' ? 3.0 : 3.3;
    return [{ x: 0.04, z: 0.06, amp, su: 1.0, sz: 0.42 }];
  }
  if (pattern === 'bicuspid') {
    if (arch === 'upper') {
      return [
        { x: 0, z: 0.45, amp: 1.9, su: 0.5, sz: 0.34 }, // vestíbular (mayor)
        { x: 0, z: -0.45, amp: 1.35, su: 0.5, sz: 0.34 }, // palatina
      ];
    }
    return [
      { x: 0.05, z: 0.45, amp: 1.75, su: 0.5, sz: 0.34 }, // vestíbular
      { x: -0.05, z: -0.42, amp: 1.3, su: 0.48, sz: 0.34 }, // lingual
    ];
  }

  // Molar
  if (arch === 'upper') {
    const cusps: CuspSpec[] = [
      { x: 0.4, z: 0.42, amp: 1.9, su: 0.36, sz: 0.34 }, // mesiovestibular
      { x: -0.4, z: 0.42, amp: 1.5, su: 0.36, sz: 0.34 }, // distovestibular
      { x: 0.4, z: -0.42, amp: 1.7, su: 0.36, sz: 0.34 }, // mesiopalatina
      { x: -0.4, z: -0.42, amp: 1.3, su: 0.36, sz: 0.34 }, // distopalatina
    ];
    if (position === 6) {
      cusps.push({ x: 0.16, z: -0.72, amp: 0.6, su: 0.26, sz: 0.22 }); // Carabelli
    }
    return cusps;
  }
  const cusps: CuspSpec[] = [
    { x: 0.4, z: 0.42, amp: 1.6, su: 0.36, sz: 0.34 }, // mesiovestibular
    { x: 0.4, z: -0.42, amp: 1.9, su: 0.36, sz: 0.34 }, // mesiolingual (mayor)
    { x: -0.4, z: 0.42, amp: 1.4, su: 0.36, sz: 0.34 }, // distovestibular
    { x: -0.4, z: -0.42, amp: 1.2, su: 0.36, sz: 0.34 }, // distolingual
  ];
  if (position === 6) {
    cusps.push({ x: -0.66, z: -0.1, amp: 0.95, su: 0.26, sz: 0.3 }); //5ª cúspide (distolingual)
  }
  return cusps;
}

function rootsFor(arch: Arch, position: number, pattern: CuspPattern, md: number, bl: number, rootLength: number): RootSpec {
  void pattern
  void rootLength
  const trunk = (fraction: number, branches: RootBranchSpec[]): RootSpec => ({ trunkFraction: fraction, branches });

  if (arch === 'upper') {
    if (position <= 3) {
      return trunk(0, [
        { ox: 0, oz: 0, splayX: 0, splayZ: 0, rx: md * 0.34, rz: bl * 0.35, bendX: -0.7, bendZ: 0.2, lengthScale: 1 },
      ]);
    }
    if (position === 4) {
      // Primer premolar superior: dos raíces (vestibular y palatina).
      return trunk(0.4, [
        { ox: 0, oz: 1.3, splayX: 0, splayZ: 1.6, rx: md * 0.3, rz: bl * 0.24, bendX: -0.3, bendZ: 0.9, lengthScale: 1 },
        { ox: 0, oz: -1.3, splayX: 0, splayZ: -1.7, rx: md * 0.28, rz: bl * 0.24, bendX: -0.3, bendZ: -0.9, lengthScale: 0.98 },
      ]);
    }
    if (position === 5) {
      return trunk(0, [
        { ox: 0, oz: 0, splayX: 0, splayZ: 0, rx: md * 0.33, rz: bl * 0.33, bendX: -0.5, bendZ: 0.3, lengthScale: 1 },
      ]);
    }
    // Molares superiores: tres raíces (mesiovestibular, distovestibular, palatina).
    const spread = position === 8 ? 0.75 : 1;
    return trunk(0.34, [
      { ox: 1.7 * spread, oz: 1.1 * spread, splayX: 1.5 * spread, splayZ: 1.5 * spread, rx: md * 0.16, rz: bl * 0.19, bendX: -0.8, bendZ: 0.6, lengthScale: 1 },
      { ox: -1.7 * spread, oz: 1.1 * spread, splayX: -1.3 * spread, splayZ: 1.4 * spread, rx: md * 0.15, rz: bl * 0.18, bendX: -0.9, bendZ: 0.6, lengthScale: 0.93 },
      { ox: 0.2 * spread, oz: -1.7 * spread, splayX: 0.4 * spread, splayZ: -2.2 * spread, rx: md * 0.2, rz: bl * 0.2, bendX: -0.5, bendZ: -1.1, lengthScale: 1.02 },
    ]);
  }

  // Arcada inferior
  if (position <= 5) {
    return trunk(0, [
      { ox: 0, oz: 0, splayX: 0, splayZ: 0, rx: md * 0.33, rz: bl * 0.33, bendX: -0.5, bendZ: 0.1, lengthScale: 1 },
    ]);
  }
  // Molares inferiores: dos raíces (mesial y distal), aplanadas mesiodistalmente.
  const spread = position === 8 ? 0.75 : 1;
  return trunk(0.4, [
    { ox: 1.5 * spread, oz: 0.2, splayX: 1.4 * spread, splayZ: 0.7, rx: md * 0.13, rz: bl * 0.28, bendX: -0.7, bendZ: 0.4, lengthScale: 1 },
    { ox: -1.6 * spread, oz: 0.1, splayX: -1.4 * spread, splayZ: -0.5, rx: md * 0.12, rz: bl * 0.24, bendX: -0.9, bendZ: -0.3, lengthScale: 0.94 },
  ]);
}

function tiltFor(arch: Arch, _position: number, pattern: CuspPattern): { x: number; z: number } {
  // X: inclinación vestibulolingual (positiva = corona hacia vestibular).
  // Z: inclinación mesiodistal (la corona se inclina hacia la línea media).
  if (pattern === 'incisal') return { x: arch === 'upper' ? 6 : 9, z: -1.5 };
  if (pattern === 'canine') return { x: arch === 'upper' ? 3 : 5, z: -2 };
  if (pattern === 'bicuspid') return { x: -4, z: -3 };
  return { x: -6, z: -5 };
}

function rootBendFor(arch: Arch, pattern: CuspPattern): { x: number; z: number } {
  if (pattern === 'incisal') return { x: -0.7, z: arch === 'upper' ? 0.4 : 0.2 };
  if (pattern === 'canine') return { x: -0.5, z: 0.3 };
  if (pattern === 'bicuspid') return { x: -0.5, z: 0.3 };
  return { x: -0.9, z: 0 };
}

const cache = new Map<string, ToothAnatomy>();

/** Anatomía paramétrica de una pieza FDI (calculada perezosamente). */
export function getAnatomy(fdi: string): ToothAnatomy {
  const cached = cache.get(fdi);
  if (cached) return cached;

  const quadrant = Number(fdi[0]);
  const position = Number(fdi[1]);
  const arch: Arch = quadrant <= 2 ? 'upper' : 'lower';
  const measures = MEASURES[`${arch}-${position}`];
  if (!measures) throw new Error(`Pieza sin medidas anatómicas: ${fdi}`);
  const [md, bl, crownHeight, rootLength] = measures;
  const pattern = patternOf(position);
  const toothClass: ToothClass =
    position <= 2 ? 'incisor' : position === 3 ? 'canine' : position <= 5 ? 'premolar' : 'molar';

  const anatomy: ToothAnatomy = {
    fdi,
    arch,
    toothClass,
    md,
    bl,
    crownHeight,
    rootLength,
    capBaseFraction: pattern === 'canine' ? 0.72 : 1,
    pattern,
    cusps: cuspsFor(arch, position, pattern),
    grooves: {
      md: pattern === 'molar' ? 0.55 : pattern === 'bicuspid' ? 0.45 : 0,
      bl: pattern === 'molar' ? 0.4 : 0,
      fossa: pattern === 'molar' ? 1.15 : pattern === 'bicuspid' ? 0.8 : 0,
    },
    nCervical: pattern === 'molar' ? 2.9 : pattern === 'bicuspid' ? 2.6 : 2.4,
    nOcclusal: pattern === 'molar' ? 3.5 : pattern === 'bicuspid' ? 3.0 : 2.8,
    tilt: tiltFor(arch, position, pattern),
    rootBend: rootBendFor(arch, pattern),
    roots: rootsFor(arch, position, pattern, md, bl, rootLength),
  };
  cache.set(fdi, anatomy);
  return anatomy;
}
