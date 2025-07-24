<!-- src/components/secretary/PatientSearch.vue -->
<template>
  <div class="patient-search">
    <h3>Buscar Paciente</h3>
    <input
      v-model="query"
      type="text"
      placeholder="Buscar por nombre o cédula..."
      class="search-input"
    />

    <table v-if="filtered.length > 0">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cédula</th>
          <th>Cantón</th>
          <th>Contacto</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="p.id">
          <td>{{ p.nombre }}</td>
          <td>{{ p.cedula }}</td>
          <td>{{ p.canton }}</td>
          <td>{{ p.contacto }}</td>
          <td>
            <button class="btn-view" @click="view(p)">🔍 Ver</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="no-results">No se encontraron resultados.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { Patient } from '@/mocks/secretary/patients'

const query = ref('')
const store = useSecretaryStore()

const filtered = computed(() =>
  store.patients.filter(p =>
    p.nombre.toLowerCase().includes(query.value.toLowerCase()) ||
    p.cedula.includes(query.value)
  )
)

const emit = defineEmits<{
  (e: 'view', paciente: Patient): void
}>()

function view(p: Patient) {
  emit('view', p)
}
</script>

<style scoped>
.patient-search {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}
h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
}
.search-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead {
  background-color: #f1f8e9;
}
th, td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}
button.btn-view {
  background: none;
  border: none;
  color: #2e7d32;
  cursor: pointer;
}
button.btn-view:hover {
  color: #1b5e20;
}
.no-results {
  text-align: center;
  color: #999;
  margin-top: 1rem;
}
</style>
