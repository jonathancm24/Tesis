import { useMemo } from 'react';
import * as THREE from 'three';
import type { DisplayOptions, FDI, TreatmentRecord } from '@/types';
import { buildToothGeometry } from '@/models/toothGeometry';
import { buildCrownShell, buildFractureMark, buildImplantFixture, buildSocketMark, buildSurfaceMark } from '@/models/markerGeometry';
import { getAnatomy } from '@/models/anatomy';

export interface Tooth3DProps {
  fdi: FDI;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  mirror: boolean;
  selected: boolean;
  display: DisplayOptions;
  records: TreatmentRecord[];
  /** Oculta la pieza y la reemplaza por el marcador de ausencia. */
  absent: boolean;
  /** Selección clínica (indicador visual, no estado clínico). */
  onSelect?: (fdi: FDI) => void;
}

interface MarkerMesh {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

const COLORS = {
  enamel: '#f4efe6',
  enamelSelected: '#2f6fe0',
  cementum: '#e8dcc0',
  cementumSelected: '#7ea8e8',
  canal: '#d94f42',
  implant: '#cfd6dd',
  fracture: '#5a4636',
  socket: '#8a94a0',
  caries: '#6b4426',
  restoration: '#c7dbe6',
  desgaste: '#e2d6c2',
  sellante: '#8fd8e8',
  incrustacion: '#d9a066',
  movilidad: '#f59e0b',
};

export function Tooth3D({
  fdi,
  position,
  quaternion,
  mirror,
  selected,
  display,
  records,
  absent,
  onSelect,
}: Tooth3DProps) {
  const geometry = useMemo(() => buildToothGeometry(fdi), [fdi]);

  const enamelMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: selected ? COLORS.enamelSelected : COLORS.enamel,
        roughness: 0.24,
        metalness: 0.02,
        clearcoat: 0.85,
        clearcoatRoughness: 0.18,
        side: THREE.DoubleSide,
      }),
    [selected],
  );
  const cementumMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: selected ? COLORS.cementumSelected : COLORS.cementum,
        roughness: 0.7,
        metalness: 0.01,
        side: THREE.DoubleSide,
      }),
    [selected],
  );
  const implantMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: COLORS.implant, roughness: 0.28, metalness: 0.9, side: THREE.DoubleSide }),
    [],
  );
  const fractureMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.fracture, transparent: true, opacity: 0.95 }), []);
  const canalMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.canal, transparent: true, opacity: 0.85 }), []);

  const hasEndodoncia = useMemo(
    () => records.some((r) => (r.kind === 'procedure' || r.kind === 'condition') && r.code === 'endodoncia'),
    [records],
  );
  const hasImplante = useMemo(() => records.some((r) => r.kind === 'procedure' && r.code === 'implante'), [records]);

  const shell = useMemo(() => buildCrownShell(geometry.crown, 0.05), [geometry.crown]);
  const shellMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#f7f4ee', roughness: 0.18, metalness: 0.05, clearcoat: 0.9, side: THREE.DoubleSide }),
    [],
  );
  const implantGeometry = useMemo(() => buildImplantFixture(7.5, 1.7), []);
  const socketGeometry = useMemo(() => buildSocketMark(2.5, 2.5), []);

  const markers = useMemo<MarkerMesh[]>(() => {
    const list: MarkerMesh[] = [];
    const byCode = new Map<string, { kind: string; surfaces: Array<'vestibular' | 'lingual' | 'mesial' | 'distal' | 'occlusal'> }>();
    for (const r of records) {
      // Se procesan tanto condiciones (caries, fractura, desgaste, movilidad, ausente)
      // como procedimientos (corona, resina, endodoncia, implante...): ambos generan marcadores.
      if (r.kind !== 'condition' && r.kind !== 'procedure') continue;
      byCode.set(r.code, { kind: r.kind, surfaces: r.surfaces });
    }

    const caries = byCode.get('caries');
    if (caries) {
      const geo = buildSurfaceMark(geometry.crown, caries.surfaces[0], mirror, { radius: 1.35, offset: 0.05 });
      if (geo) list.push({ geometry: geo, material: new THREE.MeshBasicMaterial({ color: COLORS.caries }) });
    }
    const restoration = byCode.get('resina') ?? byCode.get('obturacion');
    if (restoration) {
      const geo = buildSurfaceMark(geometry.crown, restoration.surfaces[0], mirror, { radius: 3.2, offset: 0.07 });
      if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: COLORS.restoration, roughness: 0.4 }) });
    }
    if (byCode.has('corona')) list.push({ geometry: shell, material: shellMaterial });
    const fracture = byCode.get('fractura');
    if (fracture) {
      const geo = buildFractureMark(geometry.crown, fracture.surfaces[0], mirror);
      if (geo) list.push({ geometry: geo, material: fractureMaterial });
    }
    const desgaste = byCode.get('desgaste');
    if (desgaste) {
      const geo = buildSurfaceMark(geometry.crown, desgaste.surfaces[0], mirror, { radius: 3.4, offset: 0.06 });
      if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: COLORS.desgaste, roughness: 0.5 }) });
    }
    const sealante = byCode.get('sellante');
    if (sealante) {
      const geo = buildSurfaceMark(geometry.crown, sealante.surfaces[0], mirror, { radius: 3.1, scaleX: 1.7, scaleZ: 0.45, offset: 0.05 });
      if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: COLORS.sellante, roughness: 0.3 }) });
    }
    const incrustacion = byCode.get('incrustacion');
    if (incrustacion) {
      const geo = buildSurfaceMark(geometry.crown, incrustacion.surfaces[0], mirror, { radius: 3.8, offset: 0.06, scaleX: 0.55 });
      if (geo) list.push({ geometry: geo, material: new THREE.MeshPhysicalMaterial({ color: COLORS.incrustacion, roughness: 0.35 }) });
    }
    const movilidad = records.find((r) => r.kind === 'condition' && r.code === 'movilidad');
    if (movilidad) {
      list.push({ geometry: geometry.crown, material: new THREE.MeshBasicMaterial({ color: COLORS.movilidad }) });
    }
    return list;
  }, [geometry, mirror, records, shell, shellMaterial]);

  const showRoots = display.roots;
  const showCanals = display.canals && (hasEndodoncia || hasImplante);

  const anatomy = getAnatomy(fdi);
  const occlusalY = anatomy.crownHeight * anatomy.capBaseFraction;
  const selectionRing = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.55, 1.0, 0, Math.PI * 2);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 14; i++) {
      const p = curve.getPoint((i / 14) * Math.PI * 2);
      points.push(new THREE.Vector3(p.x, occlusalY, p.y));
    }
    const g = new THREE.BufferGeometry().setFromPoints(points);
    g.computeVertexNormals();
    return g;
  }, [occlusalY]);
  const selectionRingMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#1e6ff2', transparent: true, opacity: 0.9 }),
    [],
  );

  if (absent) {
    return (
      <group position={position} quaternion={quaternion}>
        <mesh geometry={socketGeometry} material={new THREE.MeshPhysicalMaterial({ color: COLORS.socket, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })} onClick={() => onSelect?.(fdi)} />
      </group>
    );
  }

  return (
    <group position={position} quaternion={quaternion}>
      <mesh geometry={geometry.crown} material={enamelMaterial} onClick={() => onSelect?.(fdi)} />
      {showRoots &&
        geometry.roots.map((root, index) => <mesh key={index} geometry={root} material={cementumMaterial} />)}
      {showCanals &&
        geometry.canals.map((canal, index) => <mesh key={index} geometry={canal} material={canalMaterial} />)}
      {hasImplante && <mesh geometry={implantGeometry} material={implantMaterial} />}
      {markers.map((mark, index) => (
        <mesh key={index} geometry={mark.geometry} material={mark.material} />
      ))}
      {selected && <mesh geometry={selectionRing} material={selectionRingMaterial} position={[0, occlusalY, 0]} />}
    </group>
  );
}
