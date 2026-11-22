import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { Arch, ArchVisibility, DisplayOptions, TreatmentRecord } from '@/types';
import { teethOfArch } from '@/data/fdi';
import { getAnatomy } from '@/models/anatomy';
import { getPlacement } from '@/models/archLayout';
import { buildGumGeometry } from '@/models/gumGeometry';
import { Tooth3D } from '@/components/odontogram/Tooth3D';

interface DentalArchProps {
  arch: Arch;
  visibility: ArchVisibility;
  display: DisplayOptions;
  selectedFDI: string | null;
  recordsByFDI: Map<string, TreatmentRecord[]>;
  /** Apertura de arcadas (rad). */
  jawAngle: number;
  /** Selecciona la pieza pulsada en la escena. */
  onToothClick: (fdi: string) => void;
}

export function DentalArch({ arch, visibility, display, selectedFDI, recordsByFDI, jawAngle, onToothClick }: DentalArchProps) {
  const gumGeometry = useMemo(() => buildGumGeometry(arch), [arch]);
  const gumMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f2a3ae',
        roughness: 0.55,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        side: THREE.DoubleSide,
        clearcoat: 0.25,
      }),
    [],
  );

  const isUpper = arch === 'upper';
  const teeth = useMemo(() => {
    const all = teethOfArch(arch);
    if (visibility === 'both') return all;
    if (visibility === 'upper') return all.filter((t) => t.arch === 'upper');
    if (visibility === 'lower') return all.filter((t) => t.arch === 'lower');
    return all;
  }, [arch, visibility]);

  const occlusalYFor = (fdi: string) => {
    const anatomy = getAnatomy(fdi);
    return anatomy.crownHeight * anatomy.capBaseFraction;
  };

  return (
    <group position={isUpper ? [0, 20, -10] : [0, 0, 0]} rotation={isUpper ? ([jawAngle, 0, 0] as [number, number, number]) : ([0, 0, 0] as [number, number, number])}>
      {display.gums ? <mesh geometry={gumGeometry} material={gumMaterial} /> : null}
      {teeth.map((tooth) => {
        const placement = getPlacement(tooth.fdi);
        const toothRecords = recordsByFDI.get(tooth.fdi) ?? [];
        const isAbsent = toothRecords.some(
          (r) => (r.kind === 'condition' || r.kind === 'procedure') && (r.code === 'ausente' || r.code === 'extraccion'),
        );
        const labelY = occlusalYFor(tooth.fdi) + (isUpper ? -4.5 : 4.5);
        return (
          <group
            key={tooth.fdi}
            position={[placement.position.x, placement.position.y, placement.position.z]}
            quaternion={placement.quaternion}
          >
            <Tooth3D
              fdi={tooth.fdi}
              position={new THREE.Vector3(0, 0, 0)}
              quaternion={new THREE.Quaternion()}
              mirror={placement.mirror}
              selected={selectedFDI === tooth.fdi}
              display={display}
              records={toothRecords}
              absent={isAbsent}
              onSelect={(fdi) => onToothClick(fdi)}
            />
            {display.labels ? (
              <Html position={[0, labelY, 0]} center zIndexRange={[30, 0]}>
                <div className={`tooth-label ${selectedFDI === tooth.fdi ? 'tooth-label--active' : ''}`}>{tooth.fdi}</div>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
