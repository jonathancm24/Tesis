import * as THREE from 'three';

/**
 * Utilidades de geometría paramétrica para la generación de anatomía dental.
 *
 * Todas las piezas se construyen como superficies sólidas (mallas loftadas con
 * secciones superelípticas + campos de altura para cúspides/surcos), nunca como
 * combinación de primitivas (esferas, conos, cilindros...).
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Punto de una superelipse en el plano XZ.
 * @param p exponente forma: 1 = elipse, →0 = rectángulo redondeado.
 */
export function superellipsePoint(
  theta: number,
  a: number,
  b: number,
  p: number,
): { x: number; z: number } {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const sx = Math.sign(c) * Math.pow(Math.abs(c), p);
  const sz = Math.sign(s) * Math.pow(Math.abs(s), p);
  return { x: a * sx, z: b * sz };
}

export type Ring = THREE.Vector3[];

/**
 * Construye una malla loftada a partir de anillos de puntos (mismo número de
 * vértices por anillo). Opcionalmente cierra los extremos con abanicos.
 */
export function buildLoft(rings: Ring[], capStart = false, capEnd = false): THREE.BufferGeometry {
  const count = rings.length;
  if (count < 2) throw new Error('buildLoft: se requieren al menos 2 anillos');
  const n = rings[0].length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < count; i++) {
    const ring = rings[i];
    if (ring.length !== n) throw new Error('buildLoft: anillos con distinto número de puntos');
    for (let j = 0; j < n; j++) {
      const p = ring[j];
      positions.push(p.x, p.y, p.z);
      uvs.push(j / n, i / (count - 1));
    }
  }

  for (let i = 0; i < count - 1; i++) {
    const base = i * n;
    const next = (i + 1) * n;
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      indices.push(base + j, next + j, next + j2);
      indices.push(base + j, next + j2, base + j2);
    }
  }

  const addFan = (ringIndex: number, reverse: boolean) => {
    const ring = rings[ringIndex];
    const center = new THREE.Vector3();
    ring.forEach((p) => center.add(p));
    center.multiplyScalar(1 / n);
    const centerIndex = positions.length / 3;
    positions.push(center.x, center.y, center.z);
    uvs.push(0.5, 0.5);
    const base = ringIndex * n;
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      if (reverse) indices.push(centerIndex, base + j2, base + j);
      else indices.push(centerIndex, base + j, base + j2);
    }
  };

  if (capStart) addFan(0, true);
  if (capEnd) addFan(count - 1, false);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

/** Volumo con signo de una malla cerrada (teorema de la divergencia). */
export function signedVolume(geometry: THREE.BufferGeometry): number {
  const pos = geometry.getAttribute('position');
  const index = geometry.getIndex();
  if (!index) return 0;
  let volume = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cross = new THREE.Vector3();
  for (let i = 0; i < index.count; i += 3) {
    a.fromBufferAttribute(pos, index.getX(i));
    b.fromBufferAttribute(pos, index.getX(i + 1));
    c.fromBufferAttribute(pos, index.getX(i + 2));
    cross.crossVectors(b, c);
    volume += a.dot(cross);
  }
  return volume / 6;
}

/** Invierte el orden de las caras (orientación de la malla). */
export function flipWinding(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const index = geometry.getIndex();
  if (!index) return geometry;
  const arr = index.array as ArrayLike<number> & { [n: number]: number };
  for (let i = 0; i < index.count; i += 3) {
    const tmp = arr[i + 1];
    arr[i + 1] = arr[i + 2];
    arr[i + 2] = tmp;
  }
  index.needsUpdate = true;
  return geometry;
}

/**
 * Normaliza la orientación de una malla cerrada: si el volumen con signo es
 * negativo invierte las caras y recalcula normales hacia fuera.
 */
export function finalizeSolid(geometry: THREE.BufferGeometry, computeNormals = true): THREE.BufferGeometry {
  if (signedVolume(geometry) < 0) flipWinding(geometry);
  if (computeNormals) geometry.computeVertexNormals();
  return geometry;
}

/** Refleja la malla respecto al plano YZ (x → -x) manteniendo la orientación. */
export function mirrorX(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setX(i, -pos.getX(i));
  pos.needsUpdate = true;
  flipWinding(geometry);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/** ¿Contiene la malla coordenadas no finitas? (usado en validaciones/tests). */
export function hasInvalidValues(geometry: THREE.BufferGeometry): boolean {
  const pos = geometry.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    if (!Number.isFinite(pos.getX(i)) || !Number.isFinite(pos.getY(i)) || !Number.isFinite(pos.getZ(i))) {
      return true;
    }
  }
  const nor = geometry.getAttribute('normal');
  if (nor) {
    for (let i = 0; i < nor.count; i++) {
      if (!Number.isFinite(nor.getX(i)) || !Number.isFinite(nor.getY(i)) || !Number.isFinite(nor.getZ(i))) {
        return true;
      }
    }
  }
  return false;
}

export interface AnchorResult {
  point: THREE.Vector3;
  normal: THREE.Vector3;
}

/**
 * Localiza el punto representativo de una superficie dental (p. ej. "vestibular")
 * sobre la malla real de la corona: promedia los vértices cuya normal mejor se
 * alinea con la dirección buscada, dentro de un rango vertical opcional.
 */
export function findSurfaceAnchor(
  geometry: THREE.BufferGeometry,
  direction: THREE.Vector3,
  options: { yMin?: number; yMax?: number; topPercent?: number } = {},
): AnchorResult {
  const pos = geometry.getAttribute('position');
  const nor = geometry.getAttribute('normal');
  const dir = direction.clone().normalize();
  const { yMin = -Infinity, yMax = Infinity, topPercent = 0.08 } = options;

  type Candidate = { score: number; index: number };
  const candidates: Candidate[] = [];
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < yMin || y > yMax) continue;
    const score = nor.getX(i) * dir.x + nor.getY(i) * dir.y + nor.getZ(i) * dir.z;
    if (score > 0) candidates.push({ score, index: i });
  }
  if (candidates.length === 0) {
    for (let i = 0; i < pos.count; i++) {
      const score = nor.getX(i) * dir.x + nor.getY(i) * dir.y + nor.getZ(i) * dir.z;
      candidates.push({ score, index: i });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const k = Math.max(3, Math.floor(candidates.length * topPercent));
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let weightSum = 0;
  for (let i = 0; i < Math.min(k, candidates.length); i++) {
    const idx = candidates[i].index;
    const weight = candidates[i].score * candidates[i].score;
    tmp.set(pos.getX(idx), pos.getY(idx), pos.getZ(idx)).multiplyScalar(weight);
    point.add(tmp);
    tmp.set(nor.getX(idx), nor.getY(idx), nor.getZ(idx)).multiplyScalar(weight);
    normal.add(tmp);
    weightSum += weight;
  }
  if (weightSum > 0) point.multiplyScalar(1 / weightSum);
  if (normal.lengthSq() > 0) normal.normalize();
  else normal.copy(dir);
  return { point, normal };
}

export interface PatchOptions {
  /** Radio máximo (mm) alrededor del centro. */
  radius: number;
  /** Desplazamiento de la superficie resultante a lo largo de su normal. */
  offset?: number;
  /** Escalado del elipsoide de selección en el eje Y. */
  aspect?: number;
  /** Escalado del elipsoide de selección en X (p. ej. surco mesiodistal). */
  scaleX?: number;
  /** Escalado del elipsoide de selección en Z. */
  scaleZ?: number;
}

/**
 * Extrae un trozo de superficie de una malla (conformado a la anatomía real)
 * y lo desplaza levemente a lo largo de su normal. Se usa para caries,
 * restauraciones, carillas, selladores e incrustaciones localizadas.
 */
export function extractPatch(
  geometry: THREE.BufferGeometry,
  center: THREE.Vector3,
  options: PatchOptions,
): THREE.BufferGeometry {
  const { radius, offset = 0.03, aspect = 1, scaleX = 1, scaleZ = 1 } = options;
  const pos = geometry.getAttribute('position');
  const nor = geometry.getAttribute('normal');
  const index = geometry.getIndex();
  if (!index || !nor) return new THREE.BufferGeometry();

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const centroid = new THREE.Vector3();
  const positions: number[] = [];
  const normals: number[] = [];
  const rx = Math.max(0.01, radius * scaleX);
  const ry = Math.max(0.01, radius * aspect);
  const rz = Math.max(0.01, radius * scaleZ);

  const inside = (x: number, y: number, z: number) => {
    const dx = (x - center.x) / rx;
    const dy = (y - center.y) / ry;
    const dz = (z - center.z) / rz;
    return dx * dx + dy * dy + dz * dz <= 1;
  };

  for (let i = 0; i < index.count; i += 3) {
    const i0 = index.getX(i);
    const i1 = index.getX(i + 1);
    const i2 = index.getX(i + 2);
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (!inside(centroid.x, centroid.y, centroid.z)) continue;
    const push = (idx: number) => {
      const nx = nor.getX(idx);
      const ny = nor.getY(idx);
      const nz = nor.getZ(idx);
      positions.push(
        pos.getX(idx) + nx * offset,
        pos.getY(idx) + ny * offset,
        pos.getZ(idx) + nz * offset,
      );
      normals.push(nx, ny, nz);
    };
    push(i0);
    push(i1);
    push(i2);
  }

  const patch = new THREE.BufferGeometry();
  patch.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  patch.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return patch;
}

/**
 * Extrae una banda delgada contenida en un plano — se usa para representar una
 * línea de fractura que sigue la superficie real de la corona.
 */
export function extractPlaneBand(
  geometry: THREE.BufferGeometry,
  planeNormal: THREE.Vector3,
  planeConstant: number,
  thickness: number,
  center: THREE.Vector3,
  maxDistance: number,
  offset = 0.03,
): THREE.BufferGeometry {
  const pos = geometry.getAttribute('position');
  const nor = geometry.getAttribute('normal');
  const index = geometry.getIndex();
  if (!index || !nor) return new THREE.BufferGeometry();
  const n = planeNormal.clone().normalize();

  const positions: number[] = [];
  const normals: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  for (let i = 0; i < index.count; i += 3) {
    const i0 = index.getX(i);
    const i1 = index.getX(i + 1);
    const i2 = index.getX(i + 2);
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    const distToPlane = Math.abs(centroid.dot(n) - planeConstant);
    if (distToPlane > thickness) continue;
    if (centroid.distanceTo(center) > maxDistance) continue;
    const push = (idx: number) => {
      const nx = nor.getX(idx);
      const ny = nor.getY(idx);
      const nz = nor.getZ(idx);
      positions.push(pos.getX(idx) + nx * offset, pos.getY(idx) + ny * offset, pos.getZ(idx) + nz * offset);
      normals.push(nx, ny, nz);
    };
    push(i0);
    push(i1);
    push(i2);
  }

  const band = new THREE.BufferGeometry();
  band.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  band.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return band;
}
