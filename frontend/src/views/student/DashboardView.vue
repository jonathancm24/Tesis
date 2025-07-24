<!-- odontologia-admin/src/views/student/DashboardView.vue -->
<template>
  <div class="dashboard-container">
    <!-- Título y estadísticas -->
    <header class="dashboard-header">
      <h1>Mis Pacientes</h1>
      <p>Gestiona tus pacientes asignados y sus tratamientos</p>
    </header>

    <section class="stats-cards">
      <div class="card stat-card green">
        <div class="stat-number">{{ stats.patients }}</div>
        <div class="stat-label">Total Pacientes</div>
      </div>
      <div class="card stat-card blue">
        <div class="stat-number">{{ stats.appointments }}</div>
        <div class="stat-label">Citas Hoy</div>
      </div>
      <div class="card stat-card purple">
        <div class="stat-number">{{ stats.activeTreatments }}</div>
        <div class="stat-label">Tratamientos Activos</div>
      </div>
      <div class="card stat-card orange">
        <div class="stat-number">{{ stats.completedCases }}</div>
        <div class="stat-label">Casos Completados</div>
      </div>
    </section>

    <!-- Filtro -->
    <section class="filter-bar">
      <input
        v-model="filterText"
        type="text"
        placeholder="Buscar pacientes..."
        class="filter-input"
      />
      <select v-model="filterState" class="filter-select">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Completado">Completado</option>
      </select>
      <select v-model="filterTreatment" class="filter-select">
        <option value="">Todos los tratamientos</option>
        <option v-for="t in treatments" :key="t" :value="t">{{ t }}</option>
      </select>
    </section>

    <!-- Tabla de pacientes -->
    <table class="patients-table">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Tratamiento</th>
          <th>Estado</th>
          <th>Próxima Cita</th>
          <th>Progreso</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filteredPatients" :key="p.id">
          <td class="patient-cell">
            <div class="avatar">{{ p.initials }}</div>
            <div>
              <div class="name">{{ p.name }}</div>
              <div class="email">{{ p.email }}</div>
            </div>
          </td>
          <td>
            <div class="treatment">{{ p.treatment }}</div>
            <div class="detail text-muted small">{{ p.detail }}</div>
          </td>
          <td>
            <span
              class="badge"
              :class="{
                'badge-active': p.state === 'Activo',
                'badge-pending': p.state === 'Pendiente',
                'badge-completed': p.state === 'Completado'
              }"
            >
              {{ p.state }}
            </span>
          </td>
          <td>{{ p.nextAppointment }}</td>
          <td>
            <div class="progress-bar">
              <div class="fill" :style="{ width: p.progress + '%' }"></div>
            </div>
            <span class="percent">{{ p.progress }}%</span>
          </td>
          <td class="text-end">
            <button class="btn-link" @click="openHistory(p)">
              <i class="fas fa-eye me-1"></i> Ver
            </button>
          </td>
        </tr>
        <tr v-if="filteredPatients.length === 0">
          <td colspan="6" class="text-center py-3 text-muted">
            No se encontraron pacientes.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div
      class="modal-backdrop fade show"
      v-if="selected"
      @click.self="closeModal"
    ></div>
    <div
      class="modal d-block"
      v-if="selected"
      style="padding-top: 3rem;"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">
              <i class="fas fa-user me-2 text-primary"></i>
              Historia de {{ selected.name }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <!-- Info personal -->
              <div class="col-md-6">
                <h6 class="fw-bold mb-3 text-primary">Información Personal</h6>
                <dl class="row small">
                  <dt class="col-sm-4">Nombre completo:</dt>
                  <dd class="col-sm-8">{{ selected.name }}</dd>
                  <dt class="col-sm-4">Edad:</dt>
                  <dd class="col-sm-8">{{ selected.age }} años</dd>
                  <dt class="col-sm-4">Cédula:</dt>
                  <dd class="col-sm-8">{{ selected.cedula }}</dd>
                  <dt class="col-sm-4">Teléfono:</dt>
                  <dd class="col-sm-8">{{ selected.phone }}</dd>
                </dl>
              </div>
              <!-- Info médica -->
              <div class="col-md-6">
                <h6 class="fw-bold mb-3 text-primary">Información Médica</h6>
                <dl class="row small">
                  <dt class="col-sm-4">Alergias:</dt>
                  <dd class="col-sm-8">{{ selected.allergies }}</dd>
                  <dt class="col-sm-4">Medicamentos:</dt>
                  <dd class="col-sm-8">{{ selected.medications }}</dd>
                  <dt class="col-sm-4">Condiciones:</dt>
                  <dd class="col-sm-8">{{ selected.conditions }}</dd>
                </dl>
              </div>
            </div>

            <div>
              <h6 class="fw-bold mb-3 text-primary">Historial de Tratamientos</h6>
              <ul class="list-group">
                <li
                  v-for="t in selected.history"
                  :key="t.id"
                  class="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div class="ms-2 me-auto">
                    <div class="fw-semibold">{{ t.title }}</div>
                    <small class="text-muted">{{ t.description }}</small>
                    <div><small>Supervisor: {{ t.supervisor }}</small></div>
                  </div>
                  <span class="badge bg-secondary rounded-pill">
                    {{ t.date }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-success" @click="startTreatment">
              <i class="fas fa-stethoscope me-1"></i> Iniciar caso clínico
            </button>
            <button class="btn btn-outline-secondary" @click="closeModal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchPatientsMock, type Patient } from '../../mocks/student/patients'

interface Stats {
  patients: number
  appointments: number
  activeTreatments: number
  completedCases: number
}

const patients = ref<Array<Patient & { initials: string }>>([])
const stats = ref<Stats>({
  patients: 0,
  appointments: 0,
  activeTreatments: 0,
  completedCases: 0
})

const filterText = ref<string>('')
const filterState = ref<string>('')
const filterTreatment = ref<string>('')

const treatments = ['Endodoncia', 'Ortodoncia', 'Limpieza', 'Periodoncia']

function todayString(): string {
  const d = new Date()
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

async function load(): Promise<void> {
  const data = await fetchPatientsMock()
  patients.value = data.map(p => ({
    ...p,
    initials: p.name
      .split(' ')
      .map(w => w[0])
      .join('')
  }))
  stats.value.patients = data.length
  stats.value.appointments = data.filter(p => p.nextAppointment.includes(todayString())).length
  stats.value.activeTreatments = data.filter(p => p.state === 'Activo').length
  stats.value.completedCases = data.filter(p => p.state === 'Completado').length
}

onMounted(load)

const filteredPatients = computed(() =>
  patients.value.filter(p =>
    p.name.toLowerCase().includes(filterText.value.toLowerCase()) &&
    (!filterState.value || p.state === filterState.value) &&
    (!filterTreatment.value || p.treatment === filterTreatment.value)
  )
)

const selected = ref<Patient | null>(null)

function openHistory(p: Patient) {
  selected.value = p
}

function closeModal() {
  selected.value = null
}

function startTreatment() {
  alert(`Iniciando tratamiento para ${selected.value?.name}`)
}
</script>

<style src="@/assets/css/pages/student/Dashboard.css" scoped></style>
