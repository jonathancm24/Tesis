import * as THREE from 'three';
import type { Arch } from '@/types';
import { teethOfArch } from '@/data/fdi';
import { getAnatomy, profileFactor, type CuspPattern } from '@/models/anatomy';
import { getArchSamples, getPlacement, toothArcPosition } from '@/models/archLayout';
import { buildLoft, finalizeSolid } from '@/models/geometryUtils';

/**
 * Encía de cada arcada: masaContinua (semitransparente) que envuelve las raíces
 * y remata en un margen esculpido que sigue el contorno de los cuellos.
 *
 * El perfil transversal en cada punto del arco es:
 *   arco superior (papila interpapilar) → banda vestibular → fondo → banda lingual.
 * El pico de la papila interpapilar se coloca entre piezas y deja pasar el eje
 * del diente, de modo que la línea de encuentro encía/diente se genera sola.
 */

const TOP_ARC_POINTS = 13;

interface ToothProp {
  s: number;
  cejY: number;
  bl: number;
  crownHeight: number;
  rootLength: number;
  pattern: CuspPattern;
}

function toothProps(arch: Arch): ToothProp[] {
  return teethOfArch(arch)
    .map((tooth) => {
      const anatomy = getAnatomy(tooth.fdi);
      const placement = getPlacement(tooth.fdi);
      return {
        s: toothArcPosition(tooth.fdi),
        cejY: placement.cejY,
        bl: anatomy.bl,
        crownHeight: anatomy.crownHeight,
        rootLength: anatomy.rootLength,
        pattern: anatomy.pattern,
      };
    })
    .sort((a, b) => a.s - b.s);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Propiedades de la encía interpoladas a lo largo del arco. */
function sampleProps(props: ToothProp[], s: number) {
  if (s <= props[0].s) return { ...props[0] };
  const last = props[props.length - 1];
  if (s >= last.s) return { ...last };
  for (let i = 0; i < props.length - 1; i++) {
    const a = props[i];
    const b = props[i + 1];
    if (s >= a.s && s <= b.s) {
      const t = smoothstep((s - a.s) / (b.s - a.s));
      return {
        s,
        cejY: lerp(a.cejY, b.cejY, t),
        bl: lerp(a.bl, b.bl, t),
        crownHeight: lerp(a.crownHeight, b.crownHeight, t),
        rootLength: lerp(a.rootLength, b.rootLength, t),
        pattern: t < 0.5 ? a.pattern : b.pattern,
      };
    }
  }
  return { ...last };
}

/** Altura de la papila interpapilar en la posición de arco indicada. */
function papillaAt(props: ToothProp[], s: number): number {
  let height = 0;
  for (let i = 0; i < props.length - 1; i++) {
    const a = props[i];
    const b = props[i + 1];
    const boundary = (a.s + b.s) / 2;
    const sigma = (b.s - a.s) * 0.3;
    const peak = Math.min(6, ((a.crownHeight + b.crownHeight) / 2) * 0.72) - 0.8;
    const d = (s - boundary) / sigma;
    height = Math.max(height, peak * Math.exp(-d * d));
  }
  return Math.max(0, height);
}

export function buildGumGeometry(arch: Arch): THREE.BufferGeometry {
  const samples = getArchSamples(arch, 150);
  const props = toothProps(arch);
  const upper = arch === 'upper';
  const sign = upper ? -1 : 1; // dirección coronal respecto al ECJ
  const apical = -sign; // hacia la raíz
  const rings: THREE.Vector3[][] = [];

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const p = sampleProps(props, sample.s);
    const papilla = papillaAt(props, sample.s);
    const margin = p.cejY + sign * 0.5;
    const depth = p.rootLength + 6;
    const cervical = (p.bl / 2) * profileFactor(p.pattern, 'bl', 0.06);
    const rTopB = cervical + 0.3;
    const rTopL = cervical + 0.3;
    const rB = (p.bl / 2) * 1.03 + 2.4;
    const rL = (p.bl / 2) + 3.2;

    const ring: THREE.Vector3[] = [];
    const push = (u: number, a: number) => {
      const pos = sample.position
        .clone()
        .addScaledVector(sample.normal, u)
        .add(new THREE.Vector3(0, margin + apical * a, 0));
      ring.push(pos);
    };

    // 1) Arco superior: de la papila lingual a la vestibular (pasa por la papila).
    for (let k = 0; k < TOP_ARC_POINTS; k++) {
      const q = k / (TOP_ARC_POINTS - 1);
      const u = lerp(-rTopL, rTopB, q);
      const a = -0.1 - papilla * Math.sin(Math.PI * q);
      push(u, a);
    }
    // 2) Banda vestibular hacia abajo.
    const sideProfile: [number, number][] = [
      [1.0, 0.42],
      [0.95, 0.68],
      [0.72, 0.9],
      [0.4, 0.985],
      [0, 1],
    ];
    for (const [fu, fa] of sideProfile) push(rB * fu, depth * fa);
    // 3) Banda lingual de vuelta arriba (evita la punta inferior en "V").
    const lingualProfile: [number, number][] = [
      [-0.4, 0.985],
      [-0.72, 0.9],
      [-0.95, 0.68],
      [-1.0, 0.42],
      [-rTopL / rL, 0.06],
    ];
    for (const [fu, fa] of lingualProfile) push(rL * fu, depth * fa);
    rings.push(ring);
  }

  const geometry = buildLoft(rings, true, true);
  return finalizeSolid(geometry);
}
