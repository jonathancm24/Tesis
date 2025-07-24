<template>
  <div class="odontogram-form">
    <!-- Selector de tipo -->
    <div class="selector-type">
      <label><input type="radio" value="adult" v-model="type" /> Adulto</label>
      <label><input type="radio" value="child" v-model="type" /> Infantil</label>
      <label><input type="radio" value="mixed" v-model="type" /> Mixto</label>
    </div>

    <!-- Leyenda de estados -->
    <div class="legend">
      <span><span class="legend-box healthy"></span> Sano</span>
      <span><span class="legend-box planned"></span> Planeado</span>
      <span><span class="legend-box treated"></span> Tratado</span>
      <span><span class="legend-box missing"></span> Ausente</span>
    </div>

    <!-- Grilla del odontograma -->
    <div class="chart">
      <div
        v-for="tooth in displayedTeeth"
        :key="tooth.id"
        class="tooth"
        :class="tooth.state"
        @click="toggleState(tooth)"
        :title="`${tooth.label} — ${tooth.state}`"
      >
        {{ tooth.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type ToothState = 'healthy' | 'planned' | 'treated' | 'missing';

interface Tooth {
  id: string;
  label: string;
  state: ToothState;
}

const type = ref<'adult' | 'child' | 'mixed'>('adult');

const teethData = ref<Record<string, Tooth[]>>({
  adult: Array.from({ length: 32 }, (_, i) => ({
    id: `A${i + 1}`, label: `${i + 1}`, state: 'healthy'
  })),
  child: Array.from({ length: 20 }, (_, i) => ({
    id: `C${i + 51}`, label: `${i + 51}`, state: 'healthy'
  })),
  mixed: []
});
// Construir mixto combinando infantil + adulto
teethData.value.mixed = [...teethData.value.child, ...teethData.value.adult];

const displayedTeeth = computed(() => teethData.value[type.value]);

function toggleState(tooth: Tooth) {
  const states: ToothState[] = ['healthy', 'planned', 'treated', 'missing'];
  const nextIndex = (states.indexOf(tooth.state) + 1) % states.length;
  tooth.state = states[nextIndex];
}
</script>

<style src="./OdontogramForm.css" scoped></style>
  