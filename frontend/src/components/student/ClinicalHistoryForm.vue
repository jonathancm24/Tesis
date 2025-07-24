<template>
  <HistoryForm
    :model-value="modelValue"
    :edit-mode="editMode"
    @save="$emit('save', $event)"
    @cancel="$emit('cancel')"
  />
</template>

<script setup lang="ts">
import HistoryForm from './HistoryForm.vue'
import type { ClinicalHistory } from '../../mocks/student/clinicalHistories'

// Declaración de props sin crear una variable innecesaria
defineProps<{
  modelValue: Partial<ClinicalHistory>
  editMode: boolean
}>()

// Declaración de eventos emitidos
defineEmits<{
  (e: 'save', data: ClinicalHistory): void
  (e: 'cancel'): void
}>()
</script>

<style scoped>
/* Puedes agregar estilos personalizados si lo necesitas */
</style>
