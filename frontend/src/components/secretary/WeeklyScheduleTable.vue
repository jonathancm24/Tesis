<!--src/components/secretary/WeeklyScheduleTable.vue-->
<template>
  <div class="weekly-schedule-table">
    <h2>Agenda Semanal</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Paciente ID</th>
          <th>Estudiante ID</th>
          <th>Estado</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cita in appointments" :key="cita.id">
          <td>{{ cita.datetime.split('T')[0] }}</td>
          <td>{{ cita.datetime.split('T')[1].substring(0, 5) }}</td>
          <td>{{ cita.patientId }}</td>
          <td>{{ cita.studentId }}</td>
          <td>{{ cita.status }}</td>
          <td>{{ cita.notes }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useSecretaryStore } from '../../store/secretary';
import type { Appointment } from '../../mocks/api';

const store = useSecretaryStore();
const appointments = ref<Appointment[]>([]);

onMounted(async () => {
  await store.loadAppointments();
  appointments.value = store.appointments.map((cita: any) => ({
    id: cita.id,
    studentId: cita.estudianteId,
    patientId: cita.pacienteId,
    datetime: `${cita.fecha}T${cita.hora}`,
    status: cita.estado,
    notes: cita.notas
  }));
});
</script>

<style scoped src="@/assets/css/pages/secretary/WeeklyScheduleTable.css"></style>
