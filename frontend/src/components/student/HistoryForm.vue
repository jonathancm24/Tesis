<!-- src/components/student/HistoryForm.vue -->
<template>
  <form @submit.prevent="onSave" class="row g-3">
    <div class="col-12">
      <label class="form-label">Datos Médicos Generales</label>
      <textarea
        v-model="local.generalData"
        class="form-control"
        rows="2"
        required
      />
    </div>
    <div class="col-12">
      <label class="form-label">Antecedentes Dentales</label>
      <textarea
        v-model="local.dentalHistory"
        class="form-control"
        rows="2"
        required
      />
    </div>
    <div class="col-12">
      <label class="form-label">Hallazgos Intraorales</label>
      <textarea
        v-model="local.intraoralFindings"
        class="form-control"
        rows="2"
        required
      />
    </div>
    <div class="col-12 d-flex justify-content-end mt-3">
      <button
        type="button"
        class="btn btn-secondary me-2"
        @click="$emit('cancel')"
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
// 1. Importa el tipo
import type { ClinicalHistory } from '../../mocks/student/clinicalHistories';

// 2. Define props tipados
const props = defineProps<{
  modelValue: Partial<ClinicalHistory>;
  editMode: boolean;
}>();

// 3. Asigna el resultado de defineEmits a `emit`
const emit = defineEmits<{
  (e: 'save', data: ClinicalHistory): void;
  (e: 'cancel'): void;
}>();

// 4. Estado local del formulario
import { ref, watch } from 'vue';
const local = ref<Partial<ClinicalHistory>>({ ...props.modelValue });

// 5. Sincroniza si cambia el modelValue
watch(() => props.modelValue, v => (local.value = { ...v }));

// 6. Al enviar, emite el evento con `emit(...)`
function onSave() {
  emit('save', local.value as ClinicalHistory);
}
</script>

<style scoped>
.form-label {
  font-weight: 500;
}
</style>
