<!-- src/views/professor/ProfessorDashboardView.vue -->
<template>
  <section class="professor-dashboard container py-4">
    <!-- Sprint 6 – 2025-07-25 – Dashboard de Profesor -->
    <h2 class="mb-4">Panel de Control del Profesor</h2>

    <div class="row g-4 mb-5">
      <!-- Card de Asignaciones -->
      <div class="col-md-4">
        <div class="card text-white bg-primary h-100">
          <div class="card-body d-flex align-items-center">
            <i class="bi bi-journal-bookmark-fill display-4 me-3"></i>
            <div>
              <h5 class="card-title">Asignaciones</h5>
              <p class="card-text fs-3">{{ assignments.length }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Card de Cursos -->
      <div class="col-md-4">
        <div class="card text-white bg-success h-100">
          <div class="card-body d-flex align-items-center">
            <i class="bi bi-book-fill display-4 me-3"></i>
            <div>
              <h5 class="card-title">Cursos</h5>
              <p class="card-text fs-3">{{ courses.length }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Card de Estudiantes (ejemplo: total cursos × promedio) -->
      <div class="col-md-4">
        <div class="card text-white bg-warning h-100">
          <div class="card-body d-flex align-items-center">
            <i class="bi bi-people-fill display-4 me-3"></i>
            <div>
              <h5 class="card-title">Estudiantes</h5>
              <p class="card-text fs-3">{{ totalStudents }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de últimas asignaciones -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Título</th>
            <th>Curso</th>
            <th>Fecha Entrega</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="assign in assignments.slice(0, 5)"
            :key="assign.id"
          >
            <td>{{ assign.title }}</td>
            <td>{{ assign.course }}</td>
            <td>{{ assign.dueDate }}</td>
          </tr>
          <tr v-if="assignments.length === 0">
            <td colspan="3" class="text-center text-muted">
              No hay asignaciones disponibles.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Assignment } from '../../mocks/professor/assignments'
import { fetchAssignmentsMock } from '../../mocks/professor/assignments'
import { fetchCoursesMock } from '../../mocks/professor/studentsByCourse'

// Reactive state
const assignments = ref<Assignment[]>([])
const courses = ref<string[]>([])

// Simulación de total de estudiantes:
// por ahora, asumimos 20 alumnos por curso (ajusta según tu lógica real)
const totalStudents = computed(() => courses.value.length * 20)

onMounted(async () => {
  assignments.value = await fetchAssignmentsMock()
  courses.value = await fetchCoursesMock()
})
</script>

<style scoped>
.professor-dashboard h2 {
  color: var(--bs-primary);
}
.card-title {
  margin-bottom: 0.5rem;
}
.card-text {
  margin: 0;
}
.table {
  margin-top: 2rem;
}
</style>
