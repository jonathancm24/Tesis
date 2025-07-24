<!-- src/views/professor/StudentProgressView.vue -->
<template>
  <section class="student-progress container py-4">
    <!-- Sprint 3 – 2025-07-20 – Progreso de Estudiantes -->
    <h2 class="mb-4">Progreso de Mis Estudiantes</h2>

    <!-- Filtros -->
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">Curso</label>
        <select v-model="selectedCourse" class="form-select">
          <option value="">Todos</option>
          <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Estado</label>
        <select v-model="selectedStatus" class="form-select">
          <option value="">Todos</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <!-- Tabla de progreso -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Última Actualización</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in filteredProgress" :key="entry.assignmentId">
            <td>{{ entry.studentName }}</td>
            <td>{{ entry.course }}</td>
            <td>{{ formatDate(entry.lastUpdated) }}</td>
            <td>
              <span :class="statusBadge(entry.status)">
                {{ entry.status }}
              </span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-outline-primary me-2"
                @click="viewDetails(entry.assignmentId)"
              >
                ✏️
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="removeEntry(entry.assignmentId)"
              >
                🗑️
              </button>
            </td>
          </tr>
          <tr v-if="filteredProgress.length === 0">
            <td colspan="5" class="text-center text-muted">
              No hay registros que coincidan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
// Importa los mocks tal como están definidos en tu archivo
import type { StudentProgress } from '../../mocks/professor/progress';
import {
  fetchProgressMock,
  deleteProgressMock
} from '../../mocks/professor/progress';

const progress = ref<StudentProgress[]>([]);
const selectedCourse = ref<string>('');
const selectedStatus = ref<string>('');

// Carga datos al montar
onMounted(async () => {
  progress.value = await fetchProgressMock();
});

// Deriva las listas únicas de cursos y estados
const courses = computed(() =>
  Array.from(new Set(progress.value.map(p => p.course)))
);
const statuses = computed(() =>
  Array.from(new Set(progress.value.map(p => p.status)))
);

// Aplica filtros
const filteredProgress = computed(() =>
  progress.value.filter(p =>
    (!selectedCourse.value || p.course === selectedCourse.value) &&
    (!selectedStatus.value || p.status === selectedStatus.value)
  )
);

// Formatea fecha desde el string ISO
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

// Genera clases de badge según estado válido
function statusBadge(status: StudentProgress['status']): string {
  switch (status) {
    case 'entregado':
      return 'badge bg-success';
    case 'pendiente':
      return 'badge bg-warning text-dark';
    case 'corregido':
      return 'badge bg-info text-white';
    default:
      return 'badge bg-secondary';
  }
}

function viewDetails(id: number) {
  // lógica para detalles (p.ej. abrir modal)
  console.log('Ver detalles registro', id);
}

async function removeEntry(id: number) {
  await deleteProgressMock(id);
  progress.value = await fetchProgressMock();
}
</script>

<style scoped>
.student-progress h2 {
  color: var(--color-primary);
  font-weight: 600;
}
.student-progress .badge {
  font-size: 0.9em;
}
</style>
