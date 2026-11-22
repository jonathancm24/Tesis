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
  const n = rings[0]!.length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < count; i++) {
    const ring = rings[i]!;
    if (ring.length !== n) throw new Error('buildLoft: anillos con distinto número de puntos');
    for (let j = 0; j < n; j++) {
      const p = ring[j]!;
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
    const ring = rings[ringIndex]!;
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
    const tmp = arr[i + 1]!;
    arr[i + 1] = arr[i + 2]!;
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
