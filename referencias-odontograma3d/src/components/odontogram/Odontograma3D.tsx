import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Lightformer } from '@react-three/drei';
import { DentalArch } from '@/components/odontogram/DentalArch';
import { CameraControls } from '@/components/odontogram/CameraControls';
import type { ArchVisibility, CameraView, DisplayOptions, TreatmentRecord } from '@/types';

interface Odontograma3DProps {
  archVisibility: ArchVisibility;
  display: DisplayOptions;
  selectedFDI: string | null;
  recordsByFDI: Map<string, TreatmentRecord[]>;
  jawAngle: number;
  view: CameraView;
  resetToken: number;
  onToothClick: (fdi: string) => void;
}

function Lighting() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#b9c4cc', 0.6]} />
      <directionalLight
        position={[20, 32, 26]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-28, 12, -22]} intensity={0.45} color="#dbe7ff" />
      <Environment resolution={128}>
        <group rotation={[-Math.PI / 4, 0, Math.PI / 4]}>
          <Lightformer form="circle" intensity={5} position={[0, 5, 0]} scale={6} />
          <Lightformer form="rect" intensity={4} position={[-6, 2, 2]} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={4} position={[6, 2, -2]} scale={[8, 3, 1]} />
        </group>
      </Environment>
    </>
  );
}

export function Odontograma3D({
  archVisibility,
  display,
  selectedFDI,
  recordsByFDI,
  jawAngle,
  view,
  resetToken,
  onToothClick,
}: Odontograma3DProps) {
  const visibleArches: ('upper' | 'lower')[] =
    archVisibility === 'upper' ? ['upper'] : archVisibility === 'lower' ? ['lower'] : ['upper', 'lower'];

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 95], fov: 38, near: 0.5, far: 700 }} gl={{ antialias: true }}>
      <color attach="background" args={['#f6f9fb']} />
      <Lighting />
      {visibleArches.map((arch) => (
        <DentalArch
          key={arch}
          arch={arch}
          visibility={archVisibility}
          display={display}
          selectedFDI={selectedFDI}
          recordsByFDI={recordsByFDI}
          jawAngle={arch === 'upper' ? jawAngle : 0}
          onToothClick={onToothClick}
        />
      ))}
      <ContactShadows position={[0, -4, 0]} opacity={0.22} scale={55} blur={2.2} far={35} resolution={512} color="#0c4a6e" />
      <CameraControls view={view} resetToken={resetToken} />
    </Canvas>
  );
}
