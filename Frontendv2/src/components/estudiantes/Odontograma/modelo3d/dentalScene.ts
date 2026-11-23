import * as THREE from 'three'
import { getPlacement } from './archLayout'
import { teethOfArch } from './fdi'
import { buildGumGeometry } from './gumGeometry'
import { buildToothGeometry } from './toothGeometry'
import type { FDI } from './types'
import type { DienteOdontogramaInput } from '@/types/odontograma.types'
import { condiciones } from '../catalogoOdontograma'

export function createDentalScene() {
  const model = new THREE.Group()
  const crownMaterial = new THREE.MeshStandardMaterial({ color: '#fff4df', roughness: 0.29 })
  const rootMaterial = new THREE.MeshStandardMaterial({ color: '#dfc5a6', roughness: 0.62 })
  const gumMaterial = new THREE.MeshStandardMaterial({
    color: '#c97483', roughness: 0.64, transparent: true, opacity: 0.53,
    depthWrite: false, side: THREE.DoubleSide,
  })
  const selectedMaterial = new THREE.MeshStandardMaterial({
    color: '#3181db', emissive: '#164888', emissiveIntensity: 0.24, roughness: 0.29,
  })
  const crowns = new Map<FDI, THREE.Mesh>()
  const teeth = new Map<FDI, { group: THREE.Group; mirror: boolean; center: THREE.Vector3; size: THREE.Vector3 }>()
  const markers = new THREE.Group()
  const markerGeometry = new THREE.SphereGeometry(1.05, 12, 8)
  const markerMaterials = new Map(condiciones.map(({ value, color }) => [
    value, new THREE.MeshBasicMaterial({ color }),
  ]))
  const otherMarkerMaterial = new THREE.MeshBasicMaterial({ color: '#475569' })
  let signature = ''
  const pickableMeshes = new Map<THREE.Object3D, FDI>()
  const raycaster = new THREE.Raycaster()
  let selectedCrown: THREE.Mesh | undefined

  for (const arch of ['upper', 'lower'] as const) {
    const group = new THREE.Group()
    group.name = arch
    if (arch === 'upper') group.position.set(0, 20, -10)
    group.add(new THREE.Mesh(buildGumGeometry(arch), gumMaterial))
    model.add(group)

    for (const { fdi } of teethOfArch(arch)) {
      const tooth = new THREE.Group()
      tooth.name = `tooth_${fdi}`
      const placement = getPlacement(fdi)
      tooth.position.copy(placement.position)
      tooth.quaternion.copy(placement.quaternion)
      const { crown, roots } = buildToothGeometry(fdi)
      const crownMesh = new THREE.Mesh(crown, crownMaterial)
      const bounds = new THREE.Box3().setFromBufferAttribute(crown.getAttribute('position') as THREE.BufferAttribute)
      teeth.set(fdi, {
        group: tooth, mirror: placement.mirror,
        center: bounds.getCenter(new THREE.Vector3()), size: bounds.getSize(new THREE.Vector3()),
      })
      crowns.set(fdi, crownMesh)
      tooth.add(crownMesh, ...roots.map((geometry) => new THREE.Mesh(geometry, rootMaterial)))
      for (const mesh of tooth.children) pickableMeshes.set(mesh, fdi)
      group.add(tooth)
    }
  }
  model.add(markers)
  const targets = [...pickableMeshes.keys()]
  model.updateMatrixWorld(true)

  return {
    model,
    select(fdi: FDI | null) {
      if (selectedCrown) selectedCrown.material = crownMaterial
      selectedCrown = fdi ? crowns.get(fdi) : undefined
      if (selectedCrown) selectedCrown.material = selectedMaterial
    },
    showConditions(dientes: DienteOdontogramaInput[]) {
      const conditions = dientes.flatMap(({ diente, caras }) =>
        caras.map(({ cara, condicion }) => ({ diente, cara, condicion: condicion || 'SIN_HALLAZGO' })),
      )
      const nextSignature = JSON.stringify(conditions)
      if (nextSignature === signature) return
      signature = nextSignature
      markers.clear()

      for (const { diente, cara, condicion } of conditions) {
        const tooth = teeth.get(diente)
        if (!tooth) continue
        const offset = tooth.center.clone()
        const { size, mirror } = tooth
        if (cara === 'V' || cara === 'L') offset.z += (size.z / 2 + 0.65) * (cara === 'V' ? 1 : -1)
        else if (cara === 'M' || cara === 'D') offset.x += (size.x / 2 + 0.65) * ((cara === 'M') === mirror ? -1 : 1)
        else {
          offset.y += size.y / 2 + 0.65
          if (cara === 'I') offset.z += size.z / 4
        }
        const marker = new THREE.Mesh(markerGeometry, markerMaterials.get(condicion) ?? otherMarkerMaterial)
        marker.position.copy(markers.worldToLocal(tooth.group.localToWorld(offset)))
        markers.add(marker)
      }
    },
    pick(pointer: THREE.Vector2, camera: THREE.Camera): FDI | null {
      camera.updateMatrixWorld()
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(targets, false)[0]
      return hit ? pickableMeshes.get(hit.object) ?? null : null
    },
    dispose() {
      markers.clear()
      markerGeometry.dispose()
      for (const material of markerMaterials.values()) material.dispose()
      otherMarkerMaterial.dispose()
      for (const object of model.getObjectsByProperty('isMesh', true)) {
        (object as THREE.Mesh).geometry.dispose()
      }
      crownMaterial.dispose()
      rootMaterial.dispose()
      gumMaterial.dispose()
      selectedMaterial.dispose()
      model.clear()
      crowns.clear()
      teeth.clear()
      pickableMeshes.clear()
      targets.length = 0
      selectedCrown = undefined
    },
  }
}
