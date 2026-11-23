import * as THREE from 'three';
import { getAnatomy, profileFactor, type ToothAnatomy } from './anatomy';
import {
  buildLoft,
  finalizeSolid,
  superellipsePoint,
  smoothstep,
  type Ring,
} from './geometryUtils';

/**
 * Generador de anatomía dental paramétrica.
 *
 * La corona se construye como un sólido loftado (pared con secciones
 * superelípticas + campo de altura para cúspides, fosas y surcos), y las raíces
 * como haces loftados a lo largo de trayectorias curvas con divergencia y
 * curvatura apical. No se emplean primitivas (esferas/conos/cilindros).
 *
 * Espacio local de la pieza:
 *   origen = centro del ECJ · +Y oclusal/incisal · +X mesial · +Z vestibular
 */

const SEGMENTS = 44; // muestras por anillo
const WALL_RINGS = 15;
const CAP_RINGS = 10;
const ROOT_SEGMENTS = 26;
const ROOT_RINGS = 18;

/** Curva del ECJ: más coronal en las caras proximales que en vestibular/lingual. */
function cejOffset(theta: number): number {
  const proximal = (Math.cos(2 * theta) + 1) / 2; // 1 en mesial/distal, 0 en vestibular/lingual
  return 0.7 * proximal;
}

function angleDist(a: number, b: number): number {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

/** Modulaciones de la pared (cingulum, lóbulos, depresión incisal). */
function wallModulation(anat: ToothAnatomy, theta: number, v: number): number {
  let delta = 0;
  if (anat.pattern === 'incisal' || anat.pattern === 'canine') {
    // Cingulum palatino/lingual en el tercio cervical.
    const lingual = Math.exp(-Math.pow(angleDist(theta, -Math.PI / 2) / 0.85, 2));
    const cingulum = anat.pattern === 'canine' ? 0.95 : 0.8;
    delta += cingulum * Math.exp(-Math.pow((v - 0.16) / 0.16, 2)) * lingual;
  }
  if (anat.pattern === 'incisal') {
    // Tres lóbulos de desarrollo en la cara vestibular.
    const labial = Math.exp(-Math.pow(angleDist(theta, Math.PI / 2) / 0.95, 2));
    delta += 0.13 * labial * Math.cos(3 * (theta - Math.PI / 2)) * smoothstep(0.4, 0.9, v);
    // Depresión de desarrollo vestibular cercana al borde incisal.
    delta -= 0.16 * labial * Math.exp(-Math.pow((v - 0.78) / 0.16, 2));
  }
  return delta;
}

/** Punto de la pared en (theta, v). */
function wallPoint(anat: ToothAnatomy, theta: number, v: number): THREE.Vector3 {
  const topY = anat.crownHeight * anat.capBaseFraction;
  const y0 = cejOffset(theta);
  const y = y0 + (topY - y0) * v;
  const a = (anat.md / 2) * profileFactor(anat.pattern, 'md', v);
  const b = (anat.bl / 2) * profileFactor(anat.pattern, 'bl', v);
  const n = anat.nCervical + (anat.nOcclusal - anat.nCervical) * smoothstep(0.15, 0.9, v);
  const p = 2 / n;
  const pt = superellipsePoint(theta, a, b, p);
  const radial = new THREE.Vector3(pt.x, 0, pt.z);
  const len = radial.length() || 1;
  const delta = wallModulation(anat, theta, v);
  radial.multiplyScalar((len + delta) / len);
  return new THREE.Vector3(radial.x, y, radial.z);
}

/** Campo oclusal: cúspides, fosa central y surcos de desarrollo. */
function occlusalField(anat: ToothAnatomy, x: number, z: number): number {
  const a1 = (anat.md / 2) * profileFactor(anat.pattern, 'md', 1);
  const b1 = (anat.bl / 2) * profileFactor(anat.pattern, 'bl', 1);
  const u = x / a1;
  const w = z / b1;
  let y = 0;
  for (const cusp of anat.cusps) {
    y += cusp.amp * Math.exp(-((Math.pow(u - cusp.x, 2) / (cusp.su * cusp.su) + Math.pow(w - cusp.z, 2) / (cusp.sz * cusp.sz))));
  }
  const g = anat.grooves;
  if (g.fossa > 0) y -= g.fossa * Math.exp(-(u * u + w * w) / 0.22);
  if (g.md > 0) y -= g.md * Math.exp(-Math.pow(w / 0.12, 2)) * Math.exp(-Math.pow(u / 0.85, 2));
  if (g.bl > 0) y -= g.bl * Math.exp(-Math.pow(u / 0.12, 2)) * Math.exp(-Math.pow(w / 0.65, 2));
  return y;
}

/** Corona: pared loftada + superficie oclusal/incisal integradas en una sola malla. */
function buildCrown(anat: ToothAnatomy): THREE.BufferGeometry {
  const topY = anat.crownHeight * anat.capBaseFraction;
  const rings: Ring[] = [];

  // 1) Pared: desde el ECJ hasta la línea oclusal (o el hombro en caninos).
  for (let i = 0; i <= WALL_RINGS; i++) {
    const v = i / WALL_RINGS;
    const ring: Ring = [];
    for (let j = 0; j < SEGMENTS; j++) {
      ring.push(wallPoint(anat, (j / SEGMENTS) * Math.PI * 2, v));
    }
    rings.push(ring);
  }

  // 2) Superficie oclusal: malla polar que converge al centro de la tabla.
  for (let k = 1; k <= CAP_RINGS; k++) {
    const s = 1 - k / (CAP_RINGS + 1);
    const blend = smoothstep(0.7, 1, s);
    const ring: Ring = [];
    for (let j = 0; j < SEGMENTS; j++) {
      const theta = (j / SEGMENTS) * Math.PI * 2;
      const edge = wallPoint(anat, theta, 1);
      const x = edge.x * s;
      const z = edge.z * s;
      const y = topY + occlusalField(anat, x, z) * (1 - blend);
      ring.push(new THREE.Vector3(x, y, z));
    }
    rings.push(ring);
  }

  return finalizeSolid(buildLoft(rings, true, true));
}

/** Punto sobre la trayectoria de una rama radicular (t ∈ [0,1]). */
function branchPoint(
  anat: ToothAnatomy,
  branch: { ox: number; oz: number; splayX: number; splayZ: number; bendX: number; bendZ: number },
  y0: number,
  length: number,
  t: number,
): THREE.Vector3 {
  const x = branch.ox * (0.5 + 0.5 * t) + branch.splayX * t + branch.bendX * smoothstep(0.3, 1, t);
  const z = branch.oz * (0.5 + 0.5 * t) + branch.splayZ * t + branch.bendZ * smoothstep(0.3, 1, t);
  const bend = anat.rootBend;
  return new THREE.Vector3(x + bend.x * smoothstep(0.35, 1, t), y0 - length * t, z + bend.z * smoothstep(0.35, 1, t));
}

/** Radio relativo de la raíz a lo largo de su eje. */
function rootShape(t: number, cervicalBulge: boolean): number {
  let s = Math.pow(Math.max(0.015, 1 - t * t * 0.985), 0.8);
  if (cervicalBulge) s *= 1 + 0.05 * Math.exp(-Math.pow((t - 0.1) / 0.11, 2));
  return s;
}

/** Hace una rama radicular (o raíz unitaria) como sólido loftado. */
function buildBranch(
  anat: ToothAnatomy,
  branch: { ox: number; oz: number; splayX: number; splayZ: number; bendX: number; bendZ: number },
  opts: { y0: number; length: number; rx: number; rz: number; cervicalBulge: boolean },
): THREE.BufferGeometry {
  const { y0, length, rx, rz, cervicalBulge } = opts;
  const rings: Ring[] = [];
  for (let i = 0; i <= ROOT_RINGS; i++) {
    const t = i / ROOT_RINGS;
    const c = branchPoint(anat, branch, y0, length, t);
    const shape = rootShape(t, cervicalBulge);
    const rX = Math.max(0.05, rx * shape);
    const rZ = Math.max(0.05, rz * shape);
    const ring: Ring = [];
    for (let j = 0; j < ROOT_SEGMENTS; j++) {
      const theta = (j / ROOT_SEGMENTS) * Math.PI * 2;
      const pt = superellipsePoint(theta, rX, rZ, 2 / 2.3);
      // Estrechamiento longitudinal (surcos radiculares) sutil.
      const flute = 1 + 0.045 * Math.cos(2 * theta);
      ring.push(new THREE.Vector3(c.x + pt.x * flute, c.y, c.z + pt.z * flute));
    }
    rings.push(ring);
  }
  return finalizeSolid(buildLoft(rings, true, true));
}

/** Radios de la corona en el ECJ (referencia para el inicio de la raíz). */
function cervicalRadiiOf(anat: ToothAnatomy): { rx: number; rz: number } {
  return {
    rx: (anat.md / 2) * profileFactor(anat.pattern, 'md', 0) * 0.94,
    rz: (anat.bl / 2) * profileFactor(anat.pattern, 'bl', 0) * 0.94,
  };
}

/** Tronco radicular compartido por piezas multi-radicular. */
function buildTrunk(anat: ToothAnatomy, length: number): THREE.BufferGeometry {
  const cerv = cervicalRadiiOf(anat);
  const rings: Ring[] = [];
  for (let i = 0; i <= ROOT_RINGS; i++) {
    const t = i / ROOT_RINGS;
    const x = anat.rootBend.x * 0.35 * smoothstep(0, 1, t);
    const z = anat.rootBend.z * 0.35 * smoothstep(0, 1, t);
    const rX = cerv.rx * (1 - 0.34 * t);
    const rZ = cerv.rz * (1 - 0.26 * t);
    const ring: Ring = [];
    for (let j = 0; j < ROOT_SEGMENTS; j++) {
      const theta = (j / ROOT_SEGMENTS) * Math.PI * 2;
      const pt = superellipsePoint(theta, rX, rZ, 2 / 2.6);
      ring.push(new THREE.Vector3(x + pt.x, -length * t, z + pt.z));
    }
    rings.push(ring);
  }
  return finalizeSolid(buildLoft(rings, true, true));
}

export interface ToothGeometrySet {
  crown: THREE.BufferGeometry;
  roots: THREE.BufferGeometry[];
}

export function buildToothGeometry(fdi: string): ToothGeometrySet {
  const anat = getAnatomy(fdi);
  const crown = buildCrown(anat);
  const roots: THREE.BufferGeometry[] = [];
  const spec = anat.roots;

  if (spec.trunkFraction > 0) {
    const trunkLength = anat.rootLength * spec.trunkFraction;
    roots.push(buildTrunk(anat, trunkLength));
    const branchStartY = -trunkLength * 0.65;
    for (const branch of spec.branches) {
      const length = (anat.rootLength - Math.abs(branchStartY)) * branch.lengthScale;
      roots.push(
        buildBranch(anat, branch, { y0: branchStartY, length, rx: branch.rx, rz: branch.rz, cervicalBulge: false }),
      );
    }
  } else {
    const branch = spec.branches[0]!;
    const length = anat.rootLength * branch.lengthScale;
    roots.push(
      buildBranch(anat, branch, { y0: 0, length, rx: branch.rx, rz: branch.rz, cervicalBulge: true }),
    );
  }

  return { crown, roots };
}
