<!-- src/views/secretary/SecretaryDashboardView.vue -->
<template>
  <div :class="['dashboard-view container py-4', { 'dark-mode': darkMode }]">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Panel de Control del Secretario</h2>
      <button @click="toggleDark" class="btn btn-outline-secondary">
        <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="row g-4 mb-4">
      <div class="col-6 col-md-3" v-for="stat in statsList" :key="stat.label">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-body text-center">
            <i :class="stat.icon + ' stat-icon mb-2'"></i>
            <h3 class="stat-number">{{ stat.value }}</h3>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y próximas citas -->
    <div class="row g-4">
      <!-- Distribución de asignaciones -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-header">Asignaciones por Estado</div>
          <div class="card-body">
            <canvas ref="statusChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Próximas citas -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-header">Próximas Citas</div>
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li
                v-for="appt in upcomingAppointments"
                :key="appt.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{{ appt.fecha }} {{ appt.hora }}</strong><br/>
                  Est: {{ appt.estudianteId }} — Pac: {{ appt.pacienteId }}
                </div>
                <span :class="statusBadge(appt.estado)">{{ appt.estado }}</span>
              </li>
              <li v-if="!upcomingAppointments.length" class="list-group-item text-center text-muted">
                No hay citas próximas.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import Chart from 'chart.js/auto'
import type { Appointment } from '@/mocks/secretary/appointments'

const store = useSecretaryStore()
const darkMode = ref(false)
const statusChartRef = ref<HTMLCanvasElement>()

// Cargar datos y dibujar gráfico al montar
onMounted(async () => {
  await store.loadAllData()
  renderStatusChart()
})

// Estadísticas rápidas
const statsList = computed(() => [
  { label: 'Pacientes',    value: store.patients.length,    icon: 'fas fa-users' },
  { label: 'Citas',        value: store.appointments.length,icon: 'fas fa-calendar-check' },
  { label: 'Asignaciones', value: store.assignments.length, icon: 'fas fa-user-check' },
  { label: 'Historias',    value: store.histories.length,   icon: 'fas fa-notes-medical' },
])

// Gráfico de pastel de estados de asignaciones
function renderStatusChart() {
  if (!statusChartRef.value) return
  const counts = store.assignments.reduce((acc, a) => {
    acc[a.estado] = (acc[a.estado] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  new Chart(statusChartRef.value, {
    type: 'pie',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#198754','#ffc107','#6c757d']
      }]
    }
  })
}

// Próximas 5 citas
const upcomingAppointments = computed<Appointment[]>(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.appointments
    .filter(a => a.fecha >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5)
})

// Mapear estado a badge
function statusBadge(status: Appointment['estado']) {
  switch (status) {
    case 'pendiente':  return 'badge bg-warning text-dark'
    case 'confirmada': return 'badge bg-success'
    case 'cancelada':  return 'badge bg-danger'
    default:           return 'badge bg-secondary'
  }
}

// Toggle modo oscuro
function toggleDark() {
  darkMode.value = !darkMode.value
}
</script>

<style scoped>
.dashboard-view {
  transition: background .3s, color .3s;
}
.dashboard-view.dark-mode {
  background: #1c1e21;
  color: #ccc;
}
/* Estadísticas */
.stat-icon {
  font-size: 1.8rem;
  color: #0d6efd;
}
.stat-number {
  margin: .5rem 0;
  font-size: 1.5rem;
}
.stat-label {
  text-transform: uppercase;
  font-size: .85rem;
  color: #666;
}
/* Cards */
.card-header {
  font-weight: 600;
  background: transparent;
  border-bottom: 1px solid #dee2e6;
}
.list-group-item {
  transition: background .2s;
}
</style>
