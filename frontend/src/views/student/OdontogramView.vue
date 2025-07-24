<!-- src/views/student/OdontogramView.vue -->
<template>
  <div class="odontogram-view container py-4">
    <header class="odontogram-header d-flex flex-wrap align-items-end mb-4">
      <div class="me-auto mb-3">
        <h1 class="mb-1">Odontograma</h1>
        <label class="form-label">Paciente:</label>
        <select v-model.number="selectedPatientId" class="form-select">
          <option :value="0" disabled>-- Seleccione paciente --</option>
          <option
            v-for="p in students"
            :key="p.id"
            :value="p.id"
          >
            {{ p.name }}
          </option>
        </select>
      </div>

      <div class="me-3 mb-3">
        <label class="form-label">Dentición:</label>
        <select v-model="mode" class="form-select">
          <option value="Adulto">Adulto</option>
          <option value="Infantil">Infantil</option>
          <option value="Mixto">Mixto</option>
        </select>
      </div>

      <div class="estado-selector mb-3">
        <label class="form-label">Estado a aplicar:</label>
        <div class="btn-group flex-wrap">
          <button
            v-for="s in statuses"
            :key="s.value"
            type="button"
            class="btn status-btn"
            :class="{ active: current === s.value }"
            @click="current = s.value"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </header>

    <div v-if="!selectedPatientId" class="alert alert-warning">
      Por favor, selecciona un paciente para mostrar su odontograma.
    </div>

    <div
      v-else
      class="chart-grid"
      :style="`grid-template-columns: repeat(${columns}, 1fr)`"
    >
      <div
        v-for="tooth in teeth"
        :key="tooth.id"
        class="tooth"
        :class="tooth.status.toLowerCase()"
        @click="applyStatus(tooth)"
        :title="`Diente ${tooth.id}: ${tooth.status}`"
      >
        {{ tooth.id }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStudentStore } from '@/store/student'

type Mode = 'Adulto' | 'Infantil' | 'Mixto'
type Status = 'Libre' | 'Sano' | 'Caries' | 'Fractura' | 'Ausente' | 'Restaurado'

interface Tooth { id: string; status: Status }

// Store de estudiantes (pacientes)
const studentStore = useStudentStore()
studentStore.loadAssignments() // si tu store carga pacientes ahí; o usa fetchPatientsMock

// Lista de pacientes simulados para odontograma
const students = ref<{ id: number; name: string }[]>([
  { id: 1, name: 'María González' },
  { id: 2, name: 'Carlos López' },
  // …añade más o traelos del store
])

// Selección
const selectedPatientId = ref<number>(0)
const mode = ref<Mode>('Adulto')
const current = ref<Status>('Libre')

// Estados disponibles
const statuses = [
  { value: 'Libre',      label: 'Libre'      },
  { value: 'Sano',       label: 'Sano'       },
  { value: 'Caries',     label: 'Caries'     },
  { value: 'Fractura',   label: 'Fractura'   },
  { value: 'Ausente',    label: 'Ausente'    },
  { value: 'Restaurado', label: 'Restaurado' },
] as const

// Matriz de dientes reactiva
const teeth = ref<Tooth[]>([])

// Columnas para la grilla
const columns = ref<number>(16)

// Función para (re)generar dientes según modo
function generateTeeth() {
  let list: Tooth[] = []
  if (mode.value === 'Adulto' || mode.value === 'Mixto') {
    // 32 adultos numerados 1–32
    list = list.concat(
      Array.from({ length: 32 }, (_, i) => ({ id: String(i + 1), status: 'Libre' as Status }))
    )
  }
  if (mode.value === 'Infantil' || mode.value === 'Mixto') {
    // 20 infantiles A–T
    list = Array.from({ length: 20 }, (_, i) => ({ id: String.fromCharCode(65 + i), status: 'Libre' as Status })).concat(list)
  }
  teeth.value = list
  columns.value = mode.value === 'Infantil' ? 10 : 16
}

// Al cambiar modo o paciente, reinicia odontograma
watch([mode, selectedPatientId], () => {
  generateTeeth()
})

// Aplica estado al diente clicado
function applyStatus(tooth: Tooth) {
  tooth.status = current.value
}

// Inicializa al montar
generateTeeth()
</script>

<style scoped src="@/assets/css/pages/student/OdontogramView.css" />
