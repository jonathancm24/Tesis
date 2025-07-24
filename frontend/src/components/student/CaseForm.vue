<!-- src/components/student/CaseForm.vue -->
<template>
  <form @submit.prevent="onSave" class="row g-3">
    <div class="col-12 col-md-6">
      <label class="form-label">Título del Caso</label>
      <input
        v-model="local.title"
        type="text"
        class="form-control"
        required
      />
    </div>
    <div class="col-12 col-md-6">
      <label class="form-label">Etapa</label>
      <select v-model="local.stage" class="form-select" required>
        <option disabled value="">Selecciona...</option>
        <option value="presentacion">Presentación</option>
        <option value="diagnostico">Diagnóstico</option>
        <option value="plan">Plan de Tratamiento</option>
        <option value="procedimiento">Procedimiento</option>
        <option value="seguimiento">Seguimiento</option>
      </select>
    </div>

    <div class="col-12">
      <label class="form-label">Motivo</label>
      <textarea
        v-model="local.reason"
        class="form-control"
        rows="2"
        required
      />
    </div>

    <div class="col-12">
      <label class="form-label">Síntomas</label>
      <textarea
        v-model="local.symptoms"
        class="form-control"
        rows="2"
      />
    </div>

    <div class="col-12">
      <label class="form-label">Notas</label>
      <textarea
        v-model="local.notes"
        class="form-control"
        rows="2"
      />
    </div>

    <div class="col-12 d-flex justify-content-end mt-3">
      <button
        type="button"
        class="btn btn-secondary me-2"
        @click="onCancel"
      >
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary">
        {{ editMode ? 'Actualizar' : 'Crear' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ClinicalCase } from '@/mocks/student/clinicalCases'

interface FormModel extends Partial<ClinicalCase> {}

const props = defineProps<{
  modelValue: FormModel
  editMode: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: ClinicalCase): void
  (e: 'cancel'): void
}>()

// Creamos un local copy para editar
const local = ref<FormModel>({ ...props.modelValue })

// Sincronizamos si cambian las props
watch(
  () => props.modelValue,
  v => {
    local.value = { ...v }
  }
)

function onSave() {
  // El modelo completo se emite como ClinicalCase
  emit('save', local.value as ClinicalCase)
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.form-label {
  font-weight: 500;
}
</style>
