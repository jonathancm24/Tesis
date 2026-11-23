<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createDentalScene } from './modelo3d/dentalScene'
import { getToothInfo } from './modelo3d/fdi'
import type { FDI } from './modelo3d/types'
import type { DienteOdontogramaInput } from '@/types/odontograma.types'

const props = defineProps<{ seleccion?: FDI | null; dientes?: DienteOdontogramaInput[]; integrado?: boolean }>()
const emit = defineEmits<{ 'select-tooth': [fdi: FDI | null] }>()
const viewport = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const standaloneSelection = ref<FDI | null>(null)
const selectedFdi = computed(() => props.seleccion === undefined ? standaloneSelection.value : props.seleccion)
const selectedTooth = computed(() => selectedFdi.value ? getToothInfo(selectedFdi.value) : null)
const unavailable = ref(false)
const tituloId = useId()
let dispose: (() => void) | undefined

onMounted(() => {
  const container = viewport.value
  const surface = canvas.value
  if (!container || !surface) return

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas: surface, antialias: true })
  } catch {
    unavailable.value = true
    return
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#eaf1f5')
  const dental = createDentalScene()
  scene.add(dental.model)
  scene.add(new THREE.HemisphereLight('#ffffff', '#b1bfcc', 1.9))
  const light = new THREE.DirectionalLight('#ffffff', 2.2)
  light.position.set(20, 45, 45)
  scene.add(light)
  const fill = new THREE.DirectionalLight('#dae8ff', 0.85)
  fill.position.set(-32, 8, -28)
  scene.add(fill)

  const bounds = new THREE.Box3().setFromObject(dental.model)
  const center = bounds.getCenter(new THREE.Vector3())
  const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius
  const camera = new THREE.PerspectiveCamera(props.integrado ? 32 : 39, 1, 0.1, radius * 20)
  const direction = new THREE.Vector3(0, 0.12, 1).normalize()
  const verticalTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize()
  const up = new THREE.Vector3().crossVectors(direction, right)
  const vertex = new THREE.Vector3()
  const projectedMeshes = props.integrado
    ? dental.model.getObjectsByProperty('isMesh', true).map((object) => {
      const mesh = object as THREE.Mesh
      const positions = mesh.geometry.getAttribute('position')
      const projected = new Float32Array(positions.count * 3)
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld).sub(center)
        projected[i * 3] = Math.abs(vertex.dot(right))
        projected[i * 3 + 1] = Math.abs(vertex.dot(up))
        projected[i * 3 + 2] = vertex.dot(direction)
      }
      return projected
    })
    : []
  let fitDistance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.07
  let fittedAspect = 0
  camera.position.copy(center).addScaledVector(direction, fitDistance)

  const controls = new OrbitControls(camera, surface)
  controls.target.copy(center)
  controls.enablePan = false
  controls.minDistance = radius * 0.55
  controls.maxDistance = radius * 9
  controls.update()

  function render() {
    renderer.render(scene, camera)
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = container!
    if (!width || !height) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height, false)
    const aspect = width / height
    if (props.integrado && aspect !== fittedAspect) {
      // Ajusta el frustum a la silueta dental y deja un margen para sus indicadores.
      const vertical = 1.09 / verticalTangent
      const horizontal = vertical / aspect
      let nextDistance = 0
      for (const points of projectedMeshes) {
        for (let i = 0; i < points.length; i += 3) {
          const x = points[i]!
          const y = points[i + 1]!
          const depth = points[i + 2]!
          nextDistance = Math.max(nextDistance, depth + Math.max(x * horizontal, y * vertical))
        }
      }
      // Conserva la orientación y el zoom relativo al cambiar el ancho.
      camera.position.sub(controls.target).multiplyScalar(nextDistance / fitDistance).add(controls.target)
      fitDistance = nextDistance
      fittedAspect = aspect
      controls.maxDistance = Math.max(radius * 9, nextDistance * 2.5)
      camera.far = Math.max(radius * 20, controls.maxDistance + 2 * radius)
    } else if (!props.integrado) {
      camera.zoom = Math.min(1, aspect)
    }
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    render()
  }

  let press: { id: number; x: number; y: number } | undefined
  function pointerDown(event: PointerEvent) {
    press = event.isPrimary && event.button === 0
      ? { id: event.pointerId, x: event.clientX, y: event.clientY }
      : undefined
  }
  function pointerUp(event: PointerEvent) {
    const start = press
    press = undefined
    if (!start || start.id !== event.pointerId ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return

    const rect = surface!.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const pointer = new THREE.Vector2(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      1 - (event.clientY - rect.top) / rect.height * 2,
    )
    const fdi = dental.pick(pointer, camera)
    if (props.seleccion === undefined) standaloneSelection.value = fdi
    emit('select-tooth', fdi)
  }
  function pointerCancel() {
    press = undefined
  }

  controls.addEventListener('change', render)
  surface.addEventListener('pointerdown', pointerDown)
  surface.addEventListener('pointerup', pointerUp)
  surface.addEventListener('pointercancel', pointerCancel)
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  // A size change is handled by the observer; a window resize also covers device pixel ratio changes.
  window.addEventListener('resize', resize)
  const stopSelection = watch(selectedFdi, (fdi) => {
    dental.select(fdi)
    render()
  }, { immediate: true })
  const stopConditions = watch(() => props.dientes, (dientes) => {
    dental.showConditions(dientes ?? [])
    render()
  }, { deep: true, immediate: true })
  resize()

  dispose = () => {
    observer.disconnect()
    stopSelection()
    stopConditions()
    window.removeEventListener('resize', resize)
    surface.removeEventListener('pointerdown', pointerDown)
    surface.removeEventListener('pointerup', pointerUp)
    surface.removeEventListener('pointercancel', pointerCancel)
    controls.removeEventListener('change', render)
    controls.dispose()
    dental.dispose()
    scene.clear()
    renderer.dispose()
    renderer.forceContextLoss()
  }
})

onBeforeUnmount(() => dispose?.())
</script>

<template>
  <section class="dental-viewer" :class="{ 'dental-viewer--integrado': integrado }" :aria-labelledby="tituloId">
    <header class="dental-viewer__header">
      <div class="dental-viewer__title">
        <span class="dental-viewer__icon" aria-hidden="true">3D</span>
        <div>
          <component :is="integrado ? 'h4' : 'h1'" :id="tituloId">Odontograma 3D</component>
          <p>Explora visualmente las arcadas dentales.</p>
        </div>
      </div>
      <div class="dental-viewer__tips" aria-label="Controles del visor">
        <span>Girar</span>
        <span>Zoom</span>
        <span>Seleccionar</span>
      </div>
    </header>
    <div v-if="unavailable" class="dental-viewer__error" role="status">
      El visor necesita un navegador con WebGL 2 disponible.
    </div>
    <div v-else ref="viewport" class="dental-viewer__viewport">
      <canvas ref="canvas" aria-label="Modelo interactivo de las arcadas dentales" />
      <span class="dental-viewer__viewport-label">Vista interactiva</span>
    </div>
    <p class="dental-viewer__selection" aria-live="polite">
      <template v-if="selectedTooth">
        <span class="dental-viewer__selection-label">Pieza seleccionada</span>
        <strong>FDI {{ selectedTooth.fdi }}</strong>
        <span>{{ selectedTooth.name }}</span>
      </template>
      <template v-else>
        <span class="dental-viewer__selection-dot" aria-hidden="true"></span>
        Selecciona una pieza para ver su código FDI.
      </template>
    </p>
  </section>
</template>

<style scoped>
.dental-viewer {
  box-sizing: border-box;
  width: 100%;
  max-width: 74rem;
  margin-inline: auto;
  padding: clamp(1rem, 3vw, 2rem);
}
.dental-viewer h1,
.dental-viewer h4 {
  margin: 0 0 0.15rem;
}
.dental-viewer p {
  margin: 0;
}
.dental-viewer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.dental-viewer__title {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.dental-viewer__title p {
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}
.dental-viewer__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 0.75rem;
  background: var(--gradient-primary);
  color: var(--btn-primary-text);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 8px 18px rgba(45, 90, 61, 0.22);
}
.dental-viewer__tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}
.dental-viewer__tips span {
  padding: 0.28rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-size: 0.68rem;
  font-weight: 700;
}
.dental-viewer__viewport,
.dental-viewer__error {
  position: relative;
  height: clamp(18rem, 64vh, 39rem);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  border-radius: 1rem;
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.95), transparent 38%),
    linear-gradient(145deg, #edf4f7, #dce8ee);
  box-shadow: inset 0 0 30px rgba(74, 124, 90, 0.08), 0 12px 28px rgba(35, 55, 43, 0.10);
}
.dental-viewer__viewport canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
.dental-viewer__viewport-label {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  padding: 0.28rem 0.55rem;
  border: 1px solid rgba(74, 124, 90, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  backdrop-filter: blur(8px);
  pointer-events: none;
}
.dental-viewer__error {
  display: grid;
  place-items: center;
  padding: 1rem;
  text-align: center;
}
.dental-viewer .dental-viewer__selection {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 42px;
  margin: 0.75rem 0 0;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}
.dental-viewer__selection strong {
  color: var(--color-primary);
}
.dental-viewer__selection-label {
  padding: 0.22rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.dental-viewer__selection-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.dental-viewer--integrado {
  padding: 0;
  max-width: none;
}
.dental-viewer--integrado .dental-viewer__viewport,
.dental-viewer--integrado .dental-viewer__error {
  height: clamp(29rem, 67svh, 46rem);
}
@media (max-width: 768px) {
  .dental-viewer__header {
    align-items: flex-start;
  }
  .dental-viewer__tips {
    display: none;
  }
  .dental-viewer--integrado .dental-viewer__viewport,
  .dental-viewer--integrado .dental-viewer__error {
    height: clamp(20rem, 61svh, 34rem);
  }
}
</style>
