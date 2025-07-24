<!-- src/components/secretary/PatientList.vue -->
<template>
  <div class="patient-list">
    <h3>Lista de Pacientes</h3>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cédula</th>
          <th>Cantón</th>
          <th>Contacto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="paciente in store.patients" :key="paciente.id">
          <td>{{ paciente.nombre }}</td>
          <td>{{ paciente.cedula }}</td>
          <td>{{ paciente.canton }}</td>
          <td>{{ paciente.contacto }}</td>
          <td>
            <button class="btn-edit" @click="editPatient(paciente)">✏️</button>
            <button class="btn-delete" @click="removePatient(paciente.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useSecretaryStore } from '@/store/secretary'
import type { Patient } from '@/mocks/secretary/patients'

const store = useSecretaryStore()

function editPatient(p: Patient) {
  // Emitimos el evento para que el componente padre lo use
  emit('edit', p)
}

function removePatient(id: number) {
  if (confirm('¿Estás seguro de eliminar este paciente?')) {
    store.removePatient(id)
  }
}

const emit = defineEmits<{
  (e: 'edit', paciente: Patient): void
}>()
</script>

<style scoped>
.patient-list {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}
h3 {
  margin-bottom: 1rem;
  color: #2e7d32;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead {
  background-color: #e0f2f1;
}
th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 0.5rem;
}
.btn-edit:hover {
  color: #00796b;
}
.btn-delete:hover {
  color: #d32f2f;
}
</style>
