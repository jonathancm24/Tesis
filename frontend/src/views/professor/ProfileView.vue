<!-- src/views/professor/ProfileView.vue -->
<template>
  <section class="professor-profile container py-4">
    <!-- Sprint 6 – 2025-07-25 – Perfil de Profesor -->
    <h2 class="mb-4">Perfil de Profesor</h2>

    <div class="row mb-5">
      <!-- Datos personales -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Información Personal</div>
          <div class="card-body">
            <p><strong>Nombre:</strong> {{ user.nombre }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Rol:</strong> {{ user.role }}</p>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="col-md-6">
        <div class="row g-4">
          <div class="col-6">
            <div class="card text-white bg-primary h-100">
              <div class="card-body">
                <h5 class="card-title">Asignaciones</h5>
                <p class="card-text fs-2">{{ assignments.length }}</p>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card text-white bg-success h-100">
              <div class="card-body">
                <h5 class="card-title">Cursos</h5>
                <p class="card-text fs-2">{{ courses.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Últimas asignaciones -->
    <div class="card">
      <div class="card-header">Últimas Asignaciones</div>
      <div class="table-responsive">
        <table class="table mb-0">
          <thead class="table-light">
            <tr>
              <th>Título</th>
              <th>Curso</th>
              <th>Fecha de Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in assignments.slice(0, 5)" :key="a.id">
              <td>{{ a.title }}</td>
              <td>{{ a.course }}</td>
              <td>{{ a.dueDate }}</td>
            </tr>
            <tr v-if="assignments.length === 0">
              <td colspan="3" class="text-center text-muted">
                No hay asignaciones disponibles.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '../../mocks/admin/user'
import { fetchUsersMock } from '../../mocks/api'
import type { Assignment } from '../../mocks/professor/assignments'
import { fetchAssignmentsMock } from '../../mocks/professor/assignments'
import { fetchCoursesMock } from '../../mocks/professor/studentsByCourse'

// Estado reactivo
const user = ref<User>({
  id: 0,
  nombre: '',
  email: '',
  role: 'profesor'
})
const assignments = ref<Assignment[]>([])
const courses = ref<string[]>([])

onMounted(async () => {
  // 1) Obtener todos los usuarios y seleccionar al que tenga rol 'profesor'
  const users = await fetchUsersMock()
  const prof = users.find(u => u.role === 'profesor')
  if (prof) user.value = prof

  // 2) Obtener datos del dashboard
  assignments.value = await fetchAssignmentsMock()
  courses.value = await fetchCoursesMock()
})
</script>

<style scoped>
.professor-profile h2 {
  color: var(--bs-primary);
}
.card {
  margin-bottom: 1.5rem;
}
.card-title {
  margin-bottom: 0.5rem;
}
.card-text {
  margin: 0;
}
.table {
  margin-bottom: 0;
}
</style>
