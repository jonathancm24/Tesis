<template>
  <section class="odontograma-card">
    <div class="odontograma-header">
      <div>
        <h3>Odontograma detallado</h3>
        <p>Selecciona las caras por diente y registra observaciones específicas.</p>
      </div>
      <span class="odontograma-count">{{ filasSeleccionadas.length }} registros</span>
    </div>

    <div class="legend">
      <span v-for="cara in caras" :key="cara.codigo" class="legend-item">
        <strong>{{ cara.codigo }}</strong>
        <small>{{ cara.nombre }}</small>
      </span>
    </div>

    <div class="legend legend-condiciones">
      <span
        v-for="condicion in condiciones"
        :key="condicion.value"
        class="legend-item"
      >
        <span class="condicion-dot" :class="condicion.colorClass"></span>
        <small>{{ condicion.label }}</small>
      </span>
    </div>

    <div class="odontograma-grid">
      <article v-for="diente in dientesFDI" :key="diente" class="diente-card">
        <header>{{ diente }}</header>
        <div class="caras-grid">
          <button
            v-for="cara in caras"
            :key="`${diente}-${cara.codigo}`"
            type="button"
            class="cara-btn"
            :class="[
              { selected: tieneCaraSeleccionada(diente, cara.codigo) },
              getCaraConditionClass(diente, cara.codigo)
            ]"
            :disabled="disabled"
            :title="`${cara.nombre} (${cara.codigo})`"
            @click="toggleCara(diente, cara.codigo)"
          >
            {{ cara.codigo }}
          </button>
        </div>
      </article>
    </div>

    <div class="tabla-wrapper">
      <table v-if="filasSeleccionadas.length" class="odontograma-table">
        <thead>
          <tr>
            <th>Diente</th>
            <th>Cara</th>
            <th>Condición</th>
            <th>Observación clínica</th>
            <th class="actions-col">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in filasSeleccionadas" :key="`${fila.diente}-${fila.cara}`">
            <td>{{ fila.diente }}</td>
            <td>{{ fila.cara }}</td>
            <td>
              <select
                class="condicion-select"
                :value="fila.condicion"
                :disabled="disabled"
                @change="actualizarCondicion(fila.diente, fila.cara, ($event.target as HTMLSelectElement).value)"
              >
                <option
                  v-for="condicion in condiciones"
                  :key="condicion.value"
                  :value="condicion.value"
                >
                  {{ condicion.label }}
                </option>
              </select>
            </td>
            <td>
              <textarea
                :value="fila.observacion"
                rows="2"
                placeholder="Ej: caries, fractura, restauración, sensibilidad..."
                :disabled="disabled"
                @input="actualizarObservacion(fila.diente, fila.cara, ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </td>
            <td class="actions-col">
              <button
                type="button"
                class="btn btn-link"
                :disabled="disabled"
                @click="eliminarFila(fila.diente, fila.cara)"
              >
                Quitar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="tabla-empty">
        Presiona las caras de los dientes para comenzar a registrar hallazgos.
      </div>
    </div>

    <div class="general-obs">
      <label for="observacion-general">Observación general del odontograma</label>
      <textarea
        id="observacion-general"
        :value="generalObservacion"
        rows="3"
        placeholder="Conclusiones generales del estudiante sobre el odontograma..."
        :disabled="disabled"
        @input="updateGeneralObservacion(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DienteOdontogramaInput } from '@/types/odontograma.types'

interface Props {
  modelValue: DienteOdontogramaInput[]
  generalObservacion: string
  disabled?: boolean
}

interface FilaSeleccionada {
  diente: string
  cara: string
  condicion: string
  observacion: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  generalObservacion: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DienteOdontogramaInput[]): void
  (e: 'update:generalObservacion', value: string): void
}>()

const caras = [
  { codigo: 'V', nombre: 'Vestibular' },
  { codigo: 'L', nombre: 'Lingual / Palatina' },
  { codigo: 'M', nombre: 'Mesial' },
  { codigo: 'D', nombre: 'Distal' },
  { codigo: 'O', nombre: 'Oclusal / Incisal' }
]

const condiciones = [
  { value: 'SIN_HALLAZGO', label: 'Sin hallazgo', colorClass: 'condicion-ok' },
  { value: 'CARIES', label: 'Caries', colorClass: 'condicion-caries' },
  { value: 'RESTAURACION', label: 'Restauración', colorClass: 'condicion-restauracion' },
  { value: 'FRACTURA', label: 'Fractura', colorClass: 'condicion-fractura' },
  { value: 'MOVILIDAD', label: 'Movilidad', colorClass: 'condicion-movilidad' },
  { value: 'AUSENTE', label: 'Ausente', colorClass: 'condicion-ausente' }
]

const dientesFDI = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '38', '37', '36', '35', '34', '33', '32', '31',
  '41', '42', '43', '44', '45', '46', '47', '48'
]

const cloneModelValue = (): DienteOdontogramaInput[] => {
  return props.modelValue.map((diente) => ({
    diente: diente.diente,
    caras: diente.caras.map((cara) => ({
      cara: String(cara.cara),
      observacion: cara.observacion || '',
      condicion: cara.condicion || 'SIN_HALLAZGO'
    }))
  }))
}

const filasSeleccionadas = computed<FilaSeleccionada[]>(() => {
  const filas: FilaSeleccionada[] = []

  for (const dienteItem of props.modelValue) {
    for (const caraItem of dienteItem.caras) {
      filas.push({
        diente: dienteItem.diente,
        cara: String(caraItem.cara),
        condicion: caraItem.condicion || 'SIN_HALLAZGO',
        observacion: caraItem.observacion || ''
      })
    }
  }

  return filas.sort((a, b) => {
    const diffDiente = Number(a.diente) - Number(b.diente)
    if (diffDiente !== 0) return diffDiente

    const ordenCaras = ['V', 'L', 'M', 'D', 'O', 'I']
    return ordenCaras.indexOf(a.cara) - ordenCaras.indexOf(b.cara)
  })
})

const getCondicionColorClass = (condicionValue: string) => {
  const condicion = condiciones.find((item) => item.value === condicionValue)
  return condicion?.colorClass || 'condicion-ok'
}

const getCaraConditionClass = (diente: string, cara: string) => {
  const dienteItem = props.modelValue.find((item) => item.diente === diente)
  const caraItem = dienteItem?.caras.find((item) => item.cara === cara)
  if (!caraItem) return ''
  return getCondicionColorClass(caraItem.condicion || 'SIN_HALLAZGO')
}

const tieneCaraSeleccionada = (diente: string, cara: string) => {
  const dienteItem = props.modelValue.find((item) => item.diente === diente)
  return !!dienteItem?.caras.some((item) => item.cara === cara)
}

const toggleCara = (diente: string, cara: string) => {
  const nuevo = cloneModelValue()
  const indexDiente = nuevo.findIndex((item) => item.diente === diente)

  if (indexDiente === -1) {
    nuevo.push({ diente, caras: [{ cara, observacion: '', condicion: 'SIN_HALLAZGO' }] })
    emit('update:modelValue', nuevo)
    return
  }

  const dienteActual = nuevo[indexDiente]
  if (!dienteActual) return

  const indexCara = dienteActual.caras.findIndex((item) => item.cara === cara)

  if (indexCara === -1) {
    dienteActual.caras.push({ cara, observacion: '', condicion: 'SIN_HALLAZGO' })
  } else {
    dienteActual.caras.splice(indexCara, 1)
    if (dienteActual.caras.length === 0) {
      nuevo.splice(indexDiente, 1)
    }
  }

  emit('update:modelValue', nuevo)
}

const actualizarObservacion = (diente: string, cara: string, observacion: string) => {
  const nuevo = cloneModelValue()
  const dienteItem = nuevo.find((item) => item.diente === diente)
  const caraItem = dienteItem?.caras.find((item) => item.cara === cara)

  if (!dienteItem || !caraItem) return

  caraItem.observacion = observacion
  emit('update:modelValue', nuevo)
}

const actualizarCondicion = (diente: string, cara: string, condicion: string) => {
  const nuevo = cloneModelValue()
  const dienteItem = nuevo.find((item) => item.diente === diente)
  const caraItem = dienteItem?.caras.find((item) => item.cara === cara)

  if (!dienteItem || !caraItem) return

  caraItem.condicion = condicion
  emit('update:modelValue', nuevo)
}

const eliminarFila = (diente: string, cara: string) => {
  toggleCara(diente, cara)
}

const updateGeneralObservacion = (value: string) => {
  emit('update:generalObservacion', value)
}
</script>

<style scoped src="@/assets/styles/Estudiantes/Odontograma.css"></style>
