<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useOdontograma } from '@/composables/useOdontograma'
import type { HistorialOdontogramaRegistro, HistorialObservacion } from '@/types/pacientes.types'
import OdontogramaSincronizado from './OdontogramaSincronizado.vue'

const props = defineProps<{
  registros: HistorialOdontogramaRegistro[]
  observaciones: HistorialObservacion[]
}>()
const abierto = ref(false)
const estado = useOdontograma()
const nota = computed(() => props.observaciones.find(({ titulo }) =>
  titulo === 'Observación general odontograma',
))

watchEffect(() => {
  estado.dientes.value = props.registros.map(({ diente, condicion }) => ({
    diente,
    caras: (condicion?.caras ?? []).map(({ cara, observacion, condicion }) => ({
      cara, observacion: observacion ?? undefined, condicion: condicion ?? undefined,
    })),
  }))
  estado.observacionGeneral.value = nota.value?.descripcion ?? ''
  estado.conclusion.value = props.registros.find(({ conclusion }) => conclusion?.trim())?.conclusion ?? ''
})
</script>

<template>
  <details @toggle="abierto = ($event.currentTarget as HTMLDetailsElement).open">
    <summary>Odontograma ({{ registros.length }} registros)</summary>
    <template v-if="abierto">
      <OdontogramaSincronizado v-if="registros.length || nota" :estado="estado" disabled />
      <p v-else>Sin odontograma registrado.</p>
    </template>
  </details>
</template>
