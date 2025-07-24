<!-- src/views/secretary/WeeklyScheduleView.vue -->
<template>
  <section class="weekly-schedule container py-4">
    <!-- Semana actual y navegación -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Horario Semanal de Citas</h2>
      <div class="week-nav d-flex align-items-center">
        <button class="btn btn-outline-primary me-2" @click="prevWeek">
          <i class="fas fa-angle-left"></i>
        </button>
        <span class="week-range">{{ weekRange }}</span>
        <button class="btn btn-outline-primary ms-2" @click="nextWeek">
          <i class="fas fa-angle-right"></i>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row g-3 mb-3">
      <div class="col-md-4">
        <label class="form-label">Estudiante (ID)</label>
        <select v-model.number="filterStudent" class="form-select">
          <option :value="null">Todos</option>
          <option v-for="id in studentIds" :key="id" :value="id">
            Est. {{ id }}
          </option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Paciente (ID)</label>
        <select v-model.number="filterPatient" class="form-select">
          <option :value="null">Todos</option>
          <option v-for="id in patientIds" :key="id" :value="id">
            Pac. {{ id }}
          </option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Buscar notas</label>
        <input
          type="text"
          v-model="searchText"
          class="form-control"
          placeholder="Texto libre..."
        />
      </div>
    </div>

    <!-- Tabla de citas filtradas -->
    <div class="table-responsive">
      <table class="table table-striped table-bordered align-middle weekly-table">
        <thead class="table-light">
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estudiante</th>
            <th>Paciente</th>
            <th>Estado</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in filteredAppointments" :key="appt.id">
            <td>{{ appt.fecha }}</td>
            <td>{{ appt.hora }}</td>
            <td>{{ appt.estudianteId }}</td>
            <td>{{ appt.pacienteId }}</td>
            <td>
              <span :class="statusBadge(appt.estado)">
                {{ appt.estado }}
              </span>
            </td>
            <td>{{ appt.notas || '—' }}</td>
          </tr>
          <tr v-if="!filteredAppointments.length">
            <td colspan="6" class="text-center text-muted py-4">
              No hay citas esta semana.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Appointment } from '@/mocks/secretary/appointments'
import { fetchAppointmentsMock } from '@/mocks/secretary/appointments'

// Helpers para fechas
function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = (day + 6) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
}
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Estado
const rawAppointments = ref<Appointment[]>([])
const currentMonday = ref(getMonday(new Date()))

const filterStudent = ref<number|null>(null)
const filterPatient = ref<number|null>(null)
const searchText = ref('')

// Cargar citas
onMounted(async () => {
  rawAppointments.value = await fetchAppointmentsMock()
})

// Rango de fechas de la semana
const weekDates = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday.value)
    d.setDate(d.getDate() + i)
    return formatDate(d)
  })
})
const weekRange = computed(() => {
  const [start, , , , , , end] = weekDates.value
  return `${start} → ${end}`
})
function prevWeek() {
  currentMonday.value.setDate(currentMonday.value.getDate() - 7)
  currentMonday.value = new Date(currentMonday.value)
}
function nextWeek() {
  currentMonday.value.setDate(currentMonday.value.getDate() + 7)
  currentMonday.value = new Date(currentMonday.value)
}

// IDs únicos para filtros
const studentIds = computed(() =>
  Array.from(new Set(rawAppointments.value.map(a => a.estudianteId)))
)
const patientIds = computed(() =>
  Array.from(new Set(rawAppointments.value.map(a => a.pacienteId)))
)

// Citas filtradas por semana y filtros de usuario
const filteredAppointments = computed(() =>
  rawAppointments.value.filter(a => {
    const inWeek = weekDates.value.includes(a.fecha)
    const byEst = filterStudent.value == null || a.estudianteId === filterStudent.value
    const byPac = filterPatient.value == null  || a.pacienteId === filterPatient.value
    const byText = !searchText.value
      || (a.notas || '').toLowerCase().includes(searchText.value.toLowerCase())
    return inWeek && byEst && byPac && byText
  })
)

// Badge de estado
function statusBadge(status: Appointment['estado']): string {
  switch (status) {
    case 'pendiente':  return 'badge bg-warning text-dark'
    case 'confirmada': return 'badge bg-success'
    case 'cancelada':  return 'badge bg-danger'
    default:           return 'badge bg-secondary'
  }
}
</script>

<style scoped>
.weekly-schedule {
  background: var(--bs-white);
  transition: background .3s, color .3s;
}

/* Navegación de semana */
.week-nav .btn {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}
.week-range {
  font-weight: 500;
  min-width: 10rem;
  text-align: center;
}

/* Filtros */
.row.g-3.mb-3 .form-label {
  font-weight: 500;
}

/* Tabla */
.weekly-table th,
.weekly-table td {
  vertical-align: middle;
}
.weekly-table .badge {
  font-size: .85rem;
  padding: .4em .65em;
}

/* Hover filas */
.weekly-table tbody tr:hover {
  background: var(--bs-gray-100);
}

/* Dark mode */
.dashboard-view.dark-mode .weekly-schedule {
  background: #1e1e1e;
  color: #ccc;
}
.dashboard-view.dark-mode .weekly-table tbody tr:hover {
  background: #2a2a2a;
}

/* Responsive */
@media (max-width: 768px) {
  .week-nav {
    flex-direction: column;
    gap: .5rem;
  }
}
</style>
