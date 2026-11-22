import * as THREE from 'three';
import type { TreatmentRecord } from '@/types';
import { buildCrownShell, buildFractureMark, buildImplantFixture, buildSurfaceMark } from '@/models/markerGeometry';

export interface MarkerMesh {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

export interface ToothMarkerProps {
  geometry: THREE.BufferGeometry;
  records: TreatmentRecord[];
  mirror: boolean;
}

/**
 * Genera los marcadores tridimensionales de los tratamientos registrados para
 * una pieza: caries, restauraciones, corona protésica, fractura, desgaste,
 * sellante, incrustación, implantes y estado de movilidad.
 */
export function computeMarkers({ geometry, records, mirror }: ToothMarkerProps): MarkerMesh[] {
  const list: MarkerMesh[] = [];
  const byCode = new Map<string, { kind: string; surfaces: Array<'vestibular' | 'lingual' | 'mesial' | 'distal' | 'occlusal'> }>();
  for (const r of records) {
    if (r.kind !== 'procedure') continue;
    byCode.set(r.code, { kind: r.kind, surfaces: r.surfaces });
  }

  const caries = byCode.get('caries');
  if (caries) {
    const geo = buildSurfaceMark(geometry, caries.surfaces[0], mirror, { radius: 1.35, offset: 0.05 });
    if (geo) list.push({ geometry: geo, material: new THREE.MeshBasicMaterial({ color: '#6b4426' }) });
  }
  const restoration = byCode.get('resina') ?? byCode.get('obturacion');
  if (restoration) {
    const geo = buildSurfaceMark(geometry, restoration.surfaces[0], mirror, { radius: 3.2, offset: 0.07 });
    if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: '#c7dbe6', roughness: 0.4 }) });
  }
  const corona = byCode.get('corona');
  if (corona) {
    const geo = buildCrownShell(geometry, 0.05);
    list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: '#f7f4ee', roughness: 0.18, metalness: 0.05, clearcoat: 0.9, side: THREE.DoubleSide }) });
  }
  const fracture = byCode.get('fractura');
  if (fracture) {
    const geo = buildFractureMark(geometry, fracture.surfaces[0], mirror);
    if (geo) list.push({ geometry: geo, material: new THREE.MeshBasicMaterial({ color: '#5a4636' }) });
  }
  const desgaste = byCode.get('desgaste');
  if (desgaste) {
    const geo = buildSurfaceMark(geometry, desgaste.surfaces[0], mirror, { radius: 3.4, offset: 0.06 });
    if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: '#e2d6c2', roughness: 0.5 }) });
  }
  const sealante = byCode.get('sellante');
  if (sealante) {
    const geo = buildSurfaceMark(geometry, sealante.surfaces[0], mirror, { radius: 3.1, scaleX: 1.7, scaleZ: 0.45, offset: 0.05 });
    if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: '#8fd8e8', roughness: 0.3 }) });
  }
  const incrustacion = byCode.get('incrustacion');
  if (incrustacion) {
    const geo = buildSurfaceMark(geometry, incrustacion.surfaces[0], mirror, { radius: 3.8, offset: 0.06, scaleX: 0.55 });
    if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: '#d9a066', roughness: 0.35 }) });
  }
  const movilidad = records.find((r) => r.kind === 'condition' && r.code === 'movilidad');
  if (movilidad) {
    list.push({ geometry, material: new THREE.MeshBasicMaterial({ color: '#f59e0b' }) });
  }
  const implant = records.find((r) => r.kind === 'procedure' && r.code === 'implante');
  const implantMesh = implant ? buildImplantFixture(7.5, 1.7) : null;
  const markers: MarkerMesh[] = list;
  if (implantMesh) {
    markers.push({ geometry: implantMesh, material: new THREE.MeshPhysicalMaterial({ color: '#cfd6dd', roughness: 0.28, metalness: 0.9, side: THREE.DoubleSide }) });
  }
  return markers;
}

/** Mesh auxiliar del fixture implantario (reutilizable desde la UI 3D). */
export function implantFixtureGeometry() {
  return buildImplantFixture(7.5, 1.7);
}
