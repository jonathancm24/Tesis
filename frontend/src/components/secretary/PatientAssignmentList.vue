<!--src/components/secretary/PatientAssignmentList.vue-->
<template>
  <div class="assignment-list">
    <h2>Listado de Asignaciones</h2>

    <table v-if="assignments.length > 0">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Estudiante</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Notas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="asignacion in assignments" :key="asignacion.id">
          <td>{{ getPatientName(asignacion.pacienteId) }}</td>
          <td>{{ getStudentName(asignacion.estudianteId) }}</td>
          <td>{{ asignacion.fechaAsignacion }}</td>
          <td>{{ asignacion.estado }}</td>
          <td>{{ asignacion.notas || '—' }}</td>
          <td>
            <button @click="eliminar(asignacion.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No hay asignaciones registradas.</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useSecretaryStore } from '@/store/secretary';
import { initialUsers } from '@/mocks/api';

const store = useSecretaryStore();

const assignments = computed(() => store.assignments);
const patients = computed(() => store.patients);
const students = computed(() => initialUsers.filter(u => u.role === 'estudiante'));

function getPatientName(id: number): string {
  const patient = patients.value.find(p => p.id === id);
  return patient ? patient.nombre : 'Desconocido';
}

function getStudentName(id: number): string {
  const student = students.value.find(s => s.id === id);
  return student ? student.nombre : 'Desconocido';
}

function eliminar(id: number) {
  if (confirm('¿Está seguro de eliminar esta asignación?')) {
    store.removeAssignment(id);
  }
}
</script>

<style scoped>
.assignment-list {
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  max-width: 900px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f5f5f5;
}

th,
td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

button {
  background-color: #dc3545;
  color: white;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
