<!-- src/components/secretary/SecretaryDashboard.vue -->
<!-- SecretaryDashboard.vue -->
<template>
  <div class="secretary-dashboard">
    <h1>Panel de Control del Secretario</h1>

    <div class="dashboard-cards">
      <div class="card">
        <h2>Pacientes Registrados</h2>
        <p>{{ patients.length }}</p>
      </div>
      <div class="card">
        <h2>Citas Agendadas</h2>
        <p>{{ appointments.length }}</p>
      </div>
      <div class="card">
        <h2>Asignaciones Activas</h2>
        <p>{{ activeAssignments.length }}</p>
      </div>
      <div class="card">
        <h2>Historias Clínicas</h2>
        <p>{{ histories.length }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useSecretaryStore } from '@/store/secretary';

const store = useSecretaryStore();

const patients = computed(() => store.patients);
const appointments = computed(() => store.appointments);
const assignments = computed(() => store.assignments);
const histories = computed(() => store.histories);

// Asignaciones activas
const activeAssignments = computed(() =>
  assignments.value.filter(a => a.estado === 'asignado')
);

// Cargar todos los datos al montar
onMounted(async () => {
  await store.loadAllData();
});
</script>

<style scoped>
.secretary-dashboard {
  padding: 2rem;
  background-color: #f9f9f9;
}

h1 {
  margin-bottom: 1.5rem;
  color: #153b50;
}

.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 200px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card h2 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}
</style>
