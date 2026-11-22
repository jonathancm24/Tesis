<script setup lang="ts">
import { computed, defineAsyncComponent, h, useId } from 'vue'
import type { useOdontograma } from '@/composables/useOdontograma'
import OdontogramaEditor from './OdontogramaEditor.vue'
import { caras, condiciones } from './catalogoOdontograma'

const props = defineProps<{ estado: ReturnType<typeof useOdontograma>; disabled?: boolean }>()
const Odontograma3DViewer = defineAsyncComponent({
  loader: () => import('./Odontograma3DViewer.vue'),
  errorComponent: {
    render: () => h('p', { role: 'status' }, 'No se pudo cargar el visor 3D. El editor 2D sigue disponible.'),
  },
})
const { dientes, observacionGeneral, conclusion, seleccion, pieza, caraActiva,
  seleccionar, editarCara, quitarCara } = props.estado
const carasDisponibles = computed(() => [
  ...caras,
  ...(pieza.value?.caras ?? [])
    .filter(({ cara }) => !caras.some(({ codigo }) => codigo === cara))
    .map(({ cara }) => ({ codigo: cara, nombre: cara })),
])
const condicionesPorCara = computed(() => new Map(
  pieza.value?.caras.map(({ cara, condicion }) => [cara, condicion || 'SIN_HALLAZGO']),
))
const colores = new Map(condiciones.map(({ value, color }) => [value, color]))
const camposId = useId()
</script>

<template>
  <div class="odontograma-contenedor">
    <div class="odontograma-sincronizado">
      <OdontogramaEditor
        v-model="dientes"
        v-model:general-observacion="observacionGeneral"
        :seleccion="seleccion"
        :disabled="disabled"
        sincronizado
        @seleccionar="seleccionar($event.diente, $event.cara)"
      />

      <aside class="panel-3d" aria-label="Controles del odontograma 3D">
        <Odontograma3DViewer
          :seleccion="seleccion?.diente ?? null"
          :dientes="dientes"
          integrado
          @select-tooth="seleccionar($event)"
        />
        <fieldset v-if="seleccion">
          <legend>Superficies · FDI {{ seleccion.diente }}</legend>
          <div class="superficies">
            <button v-for="cara in carasDisponibles" :key="cara.codigo" type="button"
              :aria-label="`Cara ${cara.nombre}`" :aria-pressed="seleccion.cara === cara.codigo"
              @click="seleccionar(seleccion.diente, cara.codigo)">
              <span
                v-if="condicionesPorCara.has(cara.codigo)"
                class="indicador" aria-hidden="true"
                :style="{ backgroundColor: colores.get(condicionesPorCara.get(cara.codigo) ?? '') ?? '#475569' }"
              />
              {{ cara.codigo }}
            </button>
          </div>
          <template v-if="seleccion.cara">
            <label :for="`${camposId}-condicion`">Condición de la cara {{ seleccion.cara }}</label>
            <select :id="`${camposId}-condicion`" :disabled="disabled" :value="caraActiva?.condicion || (caraActiva ? 'SIN_HALLAZGO' : '')"
              @change="editarCara({ condicion: ($event.target as HTMLSelectElement).value })">
              <option value="" disabled>Sin registro</option>
              <option v-if="caraActiva?.condicion && !condiciones.some((item) => item.value === caraActiva?.condicion)"
                :value="caraActiva.condicion">{{ caraActiva.condicion }}</option>
              <option v-for="condicion in condiciones" :key="condicion.value" :value="condicion.value">
                {{ condicion.label }}
              </option>
            </select>
            <label :for="`${camposId}-observacion`">Observación de la cara {{ seleccion.cara }}</label>
            <textarea :id="`${camposId}-observacion`" :value="caraActiva?.observacion ?? ''" rows="2" :readonly="disabled"
              @input="editarCara({ observacion: ($event.target as HTMLTextAreaElement).value })"></textarea>
            <button v-if="caraActiva && !disabled" type="button" @click="quitarCara">Quitar registro de la cara</button>
          </template>
        </fieldset>
      </aside>

      <div class="form-field conclusion">
        <label :for="`${camposId}-conclusion`">Conclusión del odontograma (opcional)</label>
        <textarea :id="`${camposId}-conclusion`" v-model.trim="conclusion" rows="2" :disabled="disabled"
          placeholder="Resumen general de hallazgos odontológicos"></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.odontograma-contenedor {
  container-type: inline-size;
  min-width: 0;
}
.odontograma-sincronizado {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 1rem;
}
.odontograma-sincronizado > :deep(.odontograma-card) {
  min-width: 0;
  margin-top: 0;
}
.panel-3d {
  min-width: 0;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
}
.panel-3d fieldset {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
  margin: 0.75rem 0 0;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}
.panel-3d select,
.panel-3d textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}
.superficies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.panel-3d button {
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 0.35rem;
  background: var(--color-surface);
  color: var(--color-text-primary);
}
.superficies button[aria-pressed='true'] {
  outline: 2px solid var(--color-primary);
}
.indicador {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}
.conclusion {
  grid-column: 1 / -1;
  display: grid;
  gap: 0.35rem;
}
@container (min-width: 54rem) {
  .odontograma-sincronizado {
    grid-template-columns: minmax(32rem, 1.35fr) minmax(20rem, 1fr);
  }
}
@media (max-width: 480px) {
  .odontograma-sincronizado :deep(.legend) {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
  }
  .panel-3d legend {
    max-width: 100%;
    overflow-wrap: anywhere;
  }
}
</style>
