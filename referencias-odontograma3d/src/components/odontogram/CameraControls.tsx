import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface ViewTransform {
  position: [number, number, number];
  target: [number, number, number];
}

export const VIEW_TRANSFORMS: Record<string, ViewTransform> = {
  front: { position: [0, 5, 95], target: [0, 2, 0] },
  superior: { position: [0, -80, 3], target: [0, 14, 0] },
  inferior: { position: [0, 80, 3], target: [0, -14, 0] },
  left: { position: [-90, 4, 0], target: [0, 2, 0] },
  right: { position: [90, 4, 0], target: [0, 2, 0] },
  reset: { position: [0, 5, 95], target: [0, 2, 0] },
};

interface CameraControlsProps {
  view: string;
  resetToken: number;
}

interface Transition {
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  progress: number;
}

export function CameraControls({ view, resetToken }: CameraControlsProps) {
  const camera = useThree((state) => state.camera);
  const controls = useRef<any>(null);
  const transition = useRef<Transition | null>(null);

  useEffect(() => {
    const next = VIEW_TRANSFORMS[resetToken > 0 ? 'reset' : view] ?? VIEW_TRANSFORMS.front;
    transition.current = {
      fromPos: camera.position.clone(),
      toPos: new THREE.Vector3(next.position[0], next.position[1], next.position[2]),
      fromTarget: controls.current?.target.clone() ?? new THREE.Vector3(next.target[0], next.target[1], next.target[2]),
      toTarget: new THREE.Vector3(next.target[0], next.target[1], next.target[2]),
      progress: 0,
    };
  }, [view, resetToken, camera, controls]);

  useFrame((state, delta) => {
    const t = transition.current;
    if (!t) return;
    const dt = Math.min(delta, 0.05);
    t.progress = Math.min(1, t.progress + dt * 2.2);
    const eased = 1 - Math.pow(1 - t.progress, 2);
    state.camera.position.lerpVectors(t.fromPos, t.toPos, eased);
    if (controls.current) {
      controls.current.target.lerpVectors(t.fromTarget, t.toTarget, eased);
    }
    if (t.progress >= 1) transition.current = null;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={8}
      maxDistance={230}
      minPolarAngle={0.08}
      maxPolarAngle={1.45}
      target={[...VIEW_TRANSFORMS[resetToken > 0 ? 'reset' : view].target]}
    />
  );
}
