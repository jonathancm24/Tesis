import * as THREE from 'three';
import type { DentalSurface } from '@/types';
import {
  buildLoft,
  extractPatch,
  extractPlaneBand,
  findSurfaceAnchor,
  finalizeSolid,
} from '@/models/geometryUtils';

/**
 * Marcadores tridimensionales de tratamientos.
 *
 * Todas las piezas visuales se generan a partir de la anatomía real de la
 * corona: las manchas de caries/restauraciones son trozos *conformados* a la
 * superficie, la corona es una cubierta obtenida de la propia corona y el
 * implante es un tornillo con rosca helicoidal.
 */

/** Dirección local de una superficie dental (se invierte en mesial/distal si la pieza es espejo). */
export function surfaceDirection(surface: DentalSurface, mirror: boolean): THREE.Vector3 {
  switch (surface) {
    case 'vestibular':
      return new THREE.Vector3(0, 0, 1);
    case 'lingual':
      return new THREE.Vector3(0, 0, -1);
    case 'mesial':
      return new THREE.Vector3(mirror ? -1 : 1, 0, 0);
    case 'distal':
      return new THREE.Vector3(mirror ? 1 : -1, 0, 0);
    case 'occlusal':
    default:
      return new THREE.Vector3(0, 1, 0);
  }
}

export interface SurfaceMarkOptions {
  radius: number;
  offset?: number;
  scaleX?: number;
  scaleZ?: number;
  aspect?: number;
}

/** Marca superficial conformada a la corona (caries, resinas, selladores...). */
export function buildSurfaceMark(
  crown: THREE.BufferGeometry,
  surface: DentalSurface,
  mirror: boolean,
  options: SurfaceMarkOptions,
): THREE.BufferGeometry | null {
  const dir = surfaceDirection(surface, mirror);
  const anchor = findSurfaceAnchor(crown, dir, { yMin: 0, topPercent: 0.12 });
  const geometry = extractPatch(crown, anchor.point, {
    radius: options.radius,
    offset: options.offset ?? 0.05,
    scaleX: options.scaleX ?? 1,
    scaleZ: options.scaleZ ?? 1,
    aspect: options.aspect ?? 1,
  });
  return geometry.getAttribute('position').count > 0 ? geometry : null;
}

/** Línea de fractura: banda fina de la superficie real atravesando la corona. */
export function buildFractureMark(
  crown: THREE.BufferGeometry,
  surface: DentalSurface,
  mirror: boolean,
): THREE.BufferGeometry | null {
  const dir = surfaceDirection(surface, mirror);
  const anchor = findSurfaceAnchor(crown, dir, { yMin: 0, topPercent: 0.1 });
  const planeNormal = new THREE.Vector3(1, 0.25, 0.15).normalize();
  const constant = anchor.point.dot(planeNormal);
  const geometry = extractPlaneBand(crown, planeNormal, constant, 0.42, anchor.point, 5.5, 0.06);
  return geometry.getAttribute('position').count > 0 ? geometry : null;
}

/**
 * Cubierta de prótesis (corona/capuchón): copia de la corona ligeramente
 * expandida y recortada en el margen, de modo que envuelve la anatomía.
 */
export function buildCrownShell(
  crown: THREE.BufferGeometry,
  marginY: number,
  offset = 0.22,
): THREE.BufferGeometry {
  const pos = crown.getAttribute('position');
  const nor = crown.getAttribute('normal');
  const index = crown.getIndex();
  const positions: number[] = [];
  const normals: number[] = [];
  if (!index || !nor) return new THREE.BufferGeometry();

  const centroid = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const push = (i: number) => {
    const nx = nor.getX(i);
    const ny = nor.getY(i);
    const nz = nor.getZ(i);
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    positions.push(x * 1.015 + nx * offset, y + ny * offset, z * 1.015 + nz * offset);
    normals.push(nx, ny, nz);
  };

  for (let i = 0; i < index.count; i += 3) {
    const i0 = index.getX(i);
    const i1 = index.getX(i + 1);
    const i2 = index.getX(i + 2);
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (centroid.y < marginY) continue;
    push(i0);
    push(i1);
    push(i2);
  }

  const shell = new THREE.BufferGeometry();
  shell.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  shell.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return shell;
}

/** Fixture implantario: cuerpo roscado con rosca helicoidal y ápice redondeado. */
export function buildImplantFixture(length: number, radius: number): THREE.BufferGeometry {
  const rings = 46;
  const segments = 34;
  const turns = 7;
  const loft: THREE.Vector3[][] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = -1.2 - t * (length - 1.2);
    const taper = 1 - 0.34 * t;
    const apical = 1 - 0.85 * Math.pow(Math.max(0, (t - 0.88) / 0.12), 1.6);
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j < segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const phase = 0.5 + 0.5 * Math.sin(t * turns * Math.PI * 2 - theta);
      const thread = 0.9 + 0.18 * Math.pow(phase, 1.4);
      const r = Math.max(0.12, radius * taper * thread * apical);
      ring.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    loft.push(ring);
  }
  return finalizeSolid(buildLoft(loft, true, true));
}

/** Piso protésico/abutment que asoma sobre el ECJ. */
export function buildAbutment(height: number, rBottom: number, rTop: number): THREE.BufferGeometry {
  const loft: THREE.Vector3[][] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = rBottom + (rTop - rBottom) * t;
    const y = -0.6 + t * (height + 0.6);
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j < 24; j++) {
      const theta = (j / 24) * Math.PI * 2;
      ring.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    loft.push(ring);
  }
  return finalizeSolid(buildLoft(loft, true, true));
}

/** Alvéolo cicatrizado de una pieza extraída (marcador de ausencia). */
export function buildSocketMark(rx: number, rz: number): THREE.BufferGeometry {
  const loft: THREE.Vector3[][] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const scale = Math.pow(1 - t, 0.7) * 0.95 + 0.05;
    const y = 0.4 - t * 5.5;
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j < 24; j++) {
      const theta = (j / 24) * Math.PI * 2;
      ring.push(new THREE.Vector3(Math.cos(theta) * rx * scale, y, Math.sin(theta) * rz * scale));
    }
    loft.push(ring);
  }
  return finalizeSolid(buildLoft(loft, true, true));
}

/** Conector de prótesis fija (puente) entre dos piezas, en coordenadas de mundo. */
export function buildBridgeBar(from: THREE.Vector3, to: THREE.Vector3, radius: number): THREE.BufferGeometry {
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const lift = Math.max(Math.abs(from.y), Math.abs(to.y)) * 0.08 + radius;
  mid.y += lift;
  const curve = new THREE.CatmullRomCurve3([from, mid, to]);
  const loft: THREE.Vector3[][] = [];  const steps = 14;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const normal = new THREE.Vector3().crossVectors(side, tangent).normalize();
    const r = radius * (0.85 + 0.3 * Math.sin(Math.PI * t));
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j < 16; j++) {
      const theta = (j / 16) * Math.PI * 2;
      ring.push(
        p.clone().addScaledVector(side, Math.cos(theta) * r).addScaledVector(normal, Math.sin(theta) * r * 0.8),
      );
    }
    loft.push(ring);
  }
  return finalizeSolid(buildLoft(loft, true, true));
}
