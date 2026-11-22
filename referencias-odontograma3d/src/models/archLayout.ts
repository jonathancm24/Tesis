import * as THREE from 'three';
import type { Arch, FDI } from '@/types';
import { getToothInfo, teethOfArch } from '@/data/fdi';
import { getAnatomy } from '@/models/anatomy';

/**
 * Layout de las arcadas dentarias.
 *
 * La arcada se describe con una superelipse en el plano XZ (parte posterior
 * ancha y giro marcado hacia los molares). Las piezas se disponen a lo largo de
 * la curva por longitud de arco, sumando exactamente los anchos mesiodistales,
 * de modo que los dientes quedan en contacto y sin solapes.
 *
 * Sistema de referencia del mundo:
 *  +X = izquierda del paciente · +Y = superior · +Z = cara (el paciente mira a +Z)
 */

interface ArchShape {
  A: number;
  B: number;
  n: number;
  tMax: number;
}

/** Forma base de la arcada antes de escalarla a la longitud dental exacta. */
const SHAPE: ArchShape = { A: 30, B: 40, n: 2.5, tMax: 1.95 };

/** Separación entre planos oclusales (mm) y elevación posterior de la curva de Spee. */
const OCCLUSAL_GAP = 3.0;
const SPEE_RISE = 1.0;

export interface Placement {
  fdi: FDI;
  /** Centro del ECJ en coordenadas de mundo. */
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  /** true si la geometría debe reflejarse en X (pieza espejo de la contralateral). */
  mirror: boolean;
  cejY: number;
  occlusalY: number;
  /** Dirección vestibular hacia fuera (normal del arco). */
  normal: THREE.Vector3;
  /** Dirección mesial hacia la línea media. */
  mesial: THREE.Vector3;
}

interface HalfArch {
  /** Puntos (x, z) del medio arco desde la línea media. */
  points: { x: number; z: number; tx: number; tz: number; s: number }[];
  length: number;
}

const halfArchCache = new Map<string, HalfArch>();

/** Media arcada (mitad izquierda, x ≥ 0) muestreada y escalada a la longitud objetivo. */
function getHalfArch(arch: Arch): HalfArch {
  const cached = halfArchCache.get(arch);
  if (cached) return cached;

  const teeth = teethOfArch(arch);
  const target = teeth.reduce((sum, t) => sum + getAnatomy(t.fdi).md, 0);

  const raw: { x: number; z: number }[] = [];
  const samples = 2000;
  const p = 2 / SHAPE.n;
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * SHAPE.tMax;
    const st = Math.sin(t);
    const ct = Math.cos(t);
    raw.push({
      x: SHAPE.A * Math.sign(st) * Math.pow(Math.abs(st), p),
      z: SHAPE.B * Math.sign(ct) * Math.pow(Math.abs(ct), p),
    });
  }

  // Longitud acumulada y escalado uniforme hasta igualar la suma de anchos MD.
  const cum: number[] = [0];
  for (let i = 1; i < raw.length; i++) {
    const dx = raw[i].x - raw[i - 1].x;
    const dz = raw[i].z - raw[i - 1].z;
    cum.push(cum[i - 1] + Math.hypot(dx, dz));
  }
  const scale = target / cum[cum.length - 1];
  const points = raw.map((pt, i) => ({ x: pt.x * scale, z: pt.z * scale, s: cum[i] * scale, tx: 0, tz: 0 }));
  for (let i = 0; i < points.length; i++) {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    points[i].tx = dx / len;
    points[i].tz = dz / len;
  }

  const half: HalfArch = { points, length: target };
  halfArchCache.set(arch, half);
  return half;
}

/** Interpola el punto de la media arcada a una distancia dada desde la línea media. */
function sampleHalf(half: HalfArch, distance: number) {
  const d = Math.min(Math.max(distance, 0), half.length);
  const pts = half.points;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (pts[mid].s <= d) lo = mid;
    else hi = mid;
  }
  const a = pts[lo];
  const b = pts[hi];
  const span = b.s - a.s || 1;
  const t = (d - a.s) / span;
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    tx: a.tx + (b.tx - a.tx) * t,
    tz: a.tz + (b.tz - a.tz) * t,
  };
}

const placementCache = new Map<FDI, Placement>();

function leftQuadrant(arch: Arch): 2 | 3 {
  return arch === 'upper' ? 2 : 3;
}

/** Distancia desde la línea media hasta el centro de una pieza (mm de arco). */
function midlineDistance(arch: Arch, position: number): number {
  const teeth = teethOfArch(arch)
    .filter((t) => t.quadrant === leftQuadrant(arch))
    .sort((a, b) => a.position - b.position);
  let distance = 0;
  for (const tooth of teeth) {
    const md = getAnatomy(tooth.fdi).md;
    if (tooth.position === position) return distance + md / 2;
    distance += md;
  }
  return distance;
}

/** Curva de Spee: leve elevación del plano oclusal hacia los posteriores. */
function speeRise(distance: number, halfLength: number): number {
  const t = distance / halfLength;
  return SPEE_RISE * t * t;
}

/** Posición y orientación completas de una pieza FDI. */
export function getPlacement(fdi: FDI): Placement {
  const cached = placementCache.get(fdi);
  if (cached) return cached;

  const info = getToothInfoOrThrow(fdi);
  const arch = info.arch;
  const half = getHalfArch(arch);
  const distance = midlineDistance(arch, info.position);
  const sample = sampleHalf(half, distance);
  const rise = speeRise(distance, half.length);
  const anatomy = getAnatomy(fdi);

  const upper = arch === 'upper';
  const occlusalY = (upper ? OCCLUSAL_GAP / 2 : -OCCLUSAL_GAP / 2) + rise;
  const cejY = upper ? occlusalY + anatomy.crownHeight : occlusalY - anatomy.crownHeight;

  const isLeft = info.side === 'left';
  const x = isLeft ? sample.x : -sample.x;
  const z = sample.z;
  // Normal vestibular: se calcula sobre la mitad izquierda y se refleja en X.
  const leftNx = -sample.tz;
  const leftNz = sample.tx;
  const nx = isLeft ? leftNx : -leftNx;
  const nz = leftNz;

  const yAxis = new THREE.Vector3(0, upper ? -1 : 1, 0);
  const zAxis = new THREE.Vector3(nx, 0, nz).normalize();
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();

  const basis = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);

  const mirror = info.quadrant === 1 || info.quadrant === 3;
  const tilt = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      THREE.MathUtils.degToRad(anatomy.tilt.x),
      0,
      THREE.MathUtils.degToRad(anatomy.tilt.z * (mirror ? -1 : 1)),
      'XYZ',
    ),
  );
  quaternion.multiply(tilt);

  const placement: Placement = {
    fdi,
    position: new THREE.Vector3(x, cejY, z),
    quaternion,
    mirror,
    cejY,
    occlusalY,
    normal: zAxis.clone(),
    mesial: xAxis.clone().multiplyScalar(mirror ? -1 : 1),
  };
  placementCache.set(fdi, placement);
  return placement;
}

function getToothInfoOrThrow(fdi: FDI) {
  const info = getToothInfo(fdi);
  if (!info) throw new Error(`Pieza FDI desconocida: ${fdi}`);
  return info;
}

export interface ArchSample {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  /** Longitud de arco acumulada desde el extremo derecho. */
  s: number;
}

/**
 * Muestrea la arcada completa (derecha + izquierda) para construir la encía.
 * La normal apunta siempre hacia vestibular (fórmula estable en ambos lados).
 */
export function getArchSamples(arch: Arch, count = 150): ArchSample[] {
  const half = getHalfArch(arch);
  const total = half.length * 2;
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const s = (i / (count - 1)) * total;
    const onRight = s <= half.length;
    const d = onRight ? half.length - s : s - half.length;
    const pt = sampleHalf(half, d);
    positions.push(new THREE.Vector3(onRight ? -pt.x : pt.x, 0, pt.z));
  }
  const samples: ArchSample[] = [];
  for (let i = 0; i < count; i++) {
    const prev = positions[Math.max(0, i - 1)];
    const next = positions[Math.min(count - 1, i + 1)];
    const tangent = new THREE.Vector3().subVectors(next, prev);
    tangent.y = 0;
    tangent.normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    samples.push({
      position: positions[i],
      tangent,
      normal,
      s: (i / (count - 1)) * total,
    });
  }
  return samples;
}

/** Distancia de arco total de una arcada (ida y vuelta). */
export function archLength(arch: Arch): number {
  return getHalfArch(arch).length;
}

/** Posición de arco de una pieza sobre la arcada completa (para la encía). */
export function toothArcPosition(fdi: FDI): number {
  const info = getToothInfoOrThrow(fdi);
  const half = getHalfArch(info.arch);
  const d = midlineDistance(info.arch, info.position);
  return info.side === 'right' ? half.length - d : half.length + d;
}
