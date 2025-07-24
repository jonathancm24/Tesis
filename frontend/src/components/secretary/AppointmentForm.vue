<!--src/components/secretary/AppointmentForm.vue-->
<template>
  <div class="appointment-form">
    <h2>Agendar Cita</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="paciente">Paciente:</label>
        <select v-model="form.pacienteId" required>
          <option disabled value="">Seleccione un paciente</option>
          <option v-for="p in patients" :key="p.id" :value="p.id">
            {{ p.nombre }} - {{ p.cedula }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="estudiante">Estudiante:</label>
        <select v-model="form.estudianteId" required>
          <option disabled value="">Seleccione un estudiante</option>
          <option
            v-for="s in assignedStudents"
            :key="s.estudianteId"
            :value="s.estudianteId"
          >
            {{ getStudentName(s.estudianteId) }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="fecha">Fecha:</label>
        <input type="date" v-model="form.fecha" required />
      </div>

      <div class="form-group">
        <label for="hora">Hora:</label>
        <input type="time" v-model="form.hora" required />
      </div>

      <div class="form-group">
        <label for="estado">Estado:</label>
        <select v-model="form.estado" required>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div class="form-group">
        <label for="notas">Notas:</label>
        <textarea v-model="form.notas" rows="3" />
      </div>

      <button type="submit">Guardar Cita</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useSecretaryStore } from '@/store/secretary';
import type { Appointment } from '@/mocks/secretary/appointments';

const secretary = useSecretaryStore();

const form = ref<Appointment>({
  id: Date.now(),
  pacienteId: 0,
  estudianteId: 0,
  fecha: '',
  hora: '',
  estado: 'pendiente',
  notas: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const patients = computed(() => secretary.patients);
const assignments = computed(() => secretary.assignments);

// Filtra estudiantes asignados únicos
const assignedStudents = computed(() => {
  const unique: Record<number, boolean> = {};
  return assignments.value.filter((a) => {
    if (!unique[a.estudianteId]) {
      unique[a.estudianteId] = true;
      return true;
    }
    return false;
  });
});

// Extrae nombre desde la lista de asignaciones
function getStudentName(id: number): string {
  const found = assignments.value.find(a => a.estudianteId === id);
  if (found) {
    const student = secretary.assignments.find(s => s.estudianteId === id);
    return `Estudiante ${student?.estudianteId}`;
  }
  return 'Estudiante Desconocido';
}

function submitForm() {
  form.value.id = Date.now();
  form.value.createdAt = new Date().toISOString();
  form.value.updatedAt = new Date().toISOString();
  secretary.appointments.push({ ...form.value });
  alert('Cita registrada exitosamente.');
  resetForm();
}

function resetForm() {
  form.value = {
    id: Date.now(),
    pacienteId: 0,
    estudianteId: 0,
    fecha: '',
    hora: '',
    estado: 'pendiente',
    notas: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
</script>

<style scoped>
.appointment-form {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  max-width: 500px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.3rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #007bff;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}
</style>
