<template>
  <DataTable
    :columns="columns"
    :rows="histories"
    :page="page"
    :per-page="perPage"
    @edit="onEdit"
    @delete="$emit('delete', $event)"
    @update:page="page = $event"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import type { ClinicalHistory } from '../../mocks/student/clinicalHistories'

// Props y emits
defineProps<{
  histories: ClinicalHistory[]
}>()

const emit = defineEmits<{
  (e: 'edit', h: ClinicalHistory): void
  (e: 'delete', id: number): void
}>()

// Estado de la paginación
const page = ref(1)
const perPage = ref(10)

// Definición de columnas
const columns = [
  { key: 'id',        label: 'ID' },
  { key: 'patientId', label: 'Paciente' },
  { key: 'createdAt', label: 'Creado' },
  { key: 'updatedAt', label: 'Actualizado' }
]

// Método para editar
function onEdit(row: Record<string, any>) {
  emit('edit', row as ClinicalHistory)
}
</script>

<style scoped>
/* Puedes agregar estilos si es necesario */
</style>
