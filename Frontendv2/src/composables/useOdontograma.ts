import { computed, ref } from 'vue'
import type { CaraOdontogramaInput, DienteOdontogramaInput } from '@/types/odontograma.types'

export interface SeleccionDental {
  diente: string
  cara?: string
}

export function useOdontograma() {
  const dientes = ref<DienteOdontogramaInput[]>([])
  const observacionGeneral = ref('')
  const conclusion = ref('')
  const seleccion = ref<SeleccionDental | null>(null)
  const pieza = computed(() => dientes.value.find((item) => item.diente === seleccion.value?.diente))
  const caraActiva = computed(() => pieza.value?.caras.find((item) => item.cara === seleccion.value?.cara))

  function seleccionar(diente: string | null, cara?: string) {
    seleccion.value = diente === null ? null : { diente, cara }
  }

  function editarCara(cambios: Partial<Omit<CaraOdontogramaInput, 'cara'>>) {
    const actual = seleccion.value
    if (!actual?.cara) return
    if (caraActiva.value) {
      Object.assign(caraActiva.value, cambios)
    } else {
      const cara = { cara: actual.cara, condicion: 'SIN_HALLAZGO', observacion: '', ...cambios }
      if (pieza.value) pieza.value.caras.push(cara)
      else dientes.value.push({ diente: actual.diente, caras: [cara] })
    }
  }

  function quitarCara() {
    const actual = seleccion.value
    if (!actual?.cara || !pieza.value) return
    pieza.value.caras = pieza.value.caras.filter((item) => item.cara !== actual.cara)
    if (!pieza.value.caras.length) dientes.value = dientes.value.filter((item) => item.diente !== actual.diente)
  }

  return { dientes, observacionGeneral, conclusion, seleccion, pieza, caraActiva, seleccionar, editarCara, quitarCara }
}
