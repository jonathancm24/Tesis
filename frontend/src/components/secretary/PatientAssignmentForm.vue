<!-- src/components/secretary/PatientAssignmentForm.vue -->
<template>
  <div class="assignment-form">
    <h2>Asignar Paciente a Estudiante</h2>

    <form @submit.prevent="guardarAsignacion">
      <div>
        <label for="paciente">Paciente</label>
        <select v-model="nuevaAsignacion.pacienteId" required>
          <option disabled value="">Seleccione un paciente</option>
          <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
            {{ paciente.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label for="estudiante">Estudiante</label>
        <select v-model="nuevaAsignacion.estudianteId" required>
          <option disabled value="">Seleccione un estudiante</option>
          <option v-for="estudiante in estudiantes" :key="estudiante.id" :value="estudiante.id">
            {{ estudiante.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label for="fecha">Fecha de asignación</label>
        <input type="date" v-model="nuevaAsignacion.fechaAsignacion" required />
      </div>

      <div>
        <label for="notas">Notas</label>
        <textarea v-model="nuevaAsignacion.notas" placeholder="Notas adicionales..."></textarea>
      </div>

      <button type="submit">Guardar Asignación</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import type { PatientAssignment } from '@/mocks/secretary/patientAssignments';
import { fetchPatientsMock } from '@/mocks/secretary/patients';
import { addPatientAssignmentMock } from '@/mocks/secretary/patientAssignments';
import { initialUsers } from '@/mocks/api'; // recuerda exportarlo

const nuevaAsignacion = reactive<Partial<PatientAssignment>>({
  pacienteId: undefined,
  estudianteId: undefined,
  fechaAsignacion: '',
  notas: ''
});

const pacientes = ref<{ id: number; nombre: string }[]>([]);
const estudiantes = ref<{ id: number; nombre: string }[]>([]);

onMounted(async () => {
  pacientes.value = await fetchPatientsMock();

  // Filtrar usuarios con rol "estudiante"
  estudiantes.value = initialUsers.filter(u => u.role === 'estudiante');
});

async function guardarAsignacion() {
  if (
    nuevaAsignacion.pacienteId &&
    nuevaAsignacion.estudianteId &&
    nuevaAsignacion.fechaAsignacion
  ) {
    const nueva: PatientAssignment = {
      id: Date.now(),
      pacienteId: nuevaAsignacion.pacienteId,
      estudianteId: nuevaAsignacion.estudianteId,
      fechaAsignacion: nuevaAsignacion.fechaAsignacion,
      estado: 'asignado',
      notas: nuevaAsignacion.notas || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addPatientAssignmentMock(nueva);

    // Reset
    nuevaAsignacion.pacienteId = undefined;
    nuevaAsignacion.estudianteId = undefined;
    nuevaAsignacion.fechaAsignacion = '';
    nuevaAsignacion.notas = '';
    alert('Asignación guardada correctamente');
  }
}
</script>

<style scoped>
.assignment-form {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}

form > div {
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
  display: block;
}

select,
input[type="date"],
textarea {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  box-sizing: border-box;
}

button {
  padding: 0.5rem 1rem;
  font-weight: bold;
  background-color: #004080;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
