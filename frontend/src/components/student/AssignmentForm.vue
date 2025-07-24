<!-- src/components/student/AssignmentForm.vue -->
<template>
  <form @submit.prevent="onSave" class="row g-3">
    <div class="col-12 col-md-6">
      <label class="form-label">Título de la Tarea</label>
      <input v-model="local.title" type="text" class="form-control" required />
    </div>
    <div class="col-12 col-md-6">
      <label class="form-label">Fecha Límite</label>
      <input v-model="local.dueDate" type="date" class="form-control" required />
    </div>
    <div class="col-12">
      <label class="form-label">Estado</label>
      <select v-model="local.status" class="form-select" required>
        <option disabled value="">Selecciona...</option>
        <option value="pendiente">Pendiente</option>
        <option value="entregado">Entregado</option>
        <option value="corregido">Corregido</option>
      </select>
    </div>
    <div class="col-12 d-flex justify-content-end mt-3">
      <button type="button" class="btn btn-secondary me-2" @click="onCancel">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary">
        {{ editMode ? 'Actualizar' : 'Crear' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Assignment } from '../../mocks/student/assignments';

interface FormModel extends Partial<Assignment> {}

const props = defineProps<{
  modelValue: FormModel;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: Assignment): void;
  (e: 'cancel'): void;
}>();

const local = ref<FormModel>({ ...props.modelValue });

watch(() => props.modelValue, v => (local.value = { ...v }));

function onSave() {
  emit('save', local.value as Assignment);
}

function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.form-label { font-weight: 500; }
</style>
