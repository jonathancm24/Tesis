<!-- src/views/secretary/SecretaryDashboardView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Panel de Control - Secretaría</h2>
        <p class="text-muted">Gestiona pacientes, asignaciones y agendamiento de citas</p>
      </div>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-primary" 
          @click="registrarPaciente"
        >
          <i class="fas fa-user-plus me-2"></i>Registrar Paciente
        </button>
        <button 
          class="btn btn-outline-success" 
          @click="agendarCita"
        >
          <i class="fas fa-calendar-plus me-2"></i>Agendar Cita
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ totalPacientes }}</h3>
                <p class="card-text">Total Pacientes</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ citasHoy }}</h3>
                <p class="card-text">Citas Hoy</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-calendar-day fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ asignacionesPendientes }}</h3>
                <p class="card-text">Asignaciones Pendientes</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-clock fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ encuestasCompletadas }}</h3>
                <p class="card-text">Encuestas Completadas</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-file-alt fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Pacientes Recientes -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="fas fa-user-friends me-2"></i>Pacientes Recientes
            </h5>
            <button class="btn btn-sm btn-outline-primary" @click="verTodosPacientes">
              Ver todos
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Paciente</th>
                    <th>Fecha Registro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="paciente in pacientesRecientes" :key="paciente.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                             style="width: 32px; height: 32px; font-size: 14px;">
                          {{ paciente.nombre.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="fw-medium">{{ paciente.nombre }}</div>
                          <small class="text-muted">{{ paciente.cedula }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ formatDate(paciente.createdAt) }}</td>
                    <td>
                      <span class="badge bg-success">
                        Activo
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-primary me-1"
                        @click="verPaciente(paciente)"
                        title="Ver detalles"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-success"
                        @click="agendarCitaPaciente(paciente)"
                        title="Agendar cita"
                      >
                        <i class="fas fa-calendar-plus"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Citas del Día -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="fas fa-calendar-day me-2"></i>Citas de Hoy
            </h5>
            <button class="btn btn-sm btn-outline-success" @click="agendarCita">
              <i class="fas fa-plus me-1"></i>Nueva Cita
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Estudiante</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cita in citasDelDia" :key="cita.id">
                    <td>{{ cita.hora }}</td>
                    <td>
                      <div>
                        <div class="fw-medium">Paciente {{ cita.pacienteId }}</div>
                        <small class="text-muted">ID: {{ cita.pacienteId }}</small>
                      </div>
                    </td>
                    <td>Estudiante {{ cita.estudianteId }}</td>
                    <td>
                      <span :class="getAppointmentStatusClass(cita.estado)">
                        {{ cita.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actividades Recientes -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-history me-2"></i>Actividades Recientes
            </h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div 
                v-for="actividad in actividadesRecientes" 
                :key="actividad.id"
                class="timeline-item d-flex mb-3"
              >
                <div class="timeline-marker">
                  <div :class="getActivityIconClass(actividad.tipo)">
                    <i :class="getActivityIcon(actividad.tipo)"></i>
                  </div>
                </div>
                <div class="timeline-content ms-3">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ actividad.titulo }}</h6>
                      <p class="text-muted mb-1">{{ actividad.descripcion }}</p>
                      <small class="text-muted">{{ formatDateTime(actividad.fecha) }}</small>
                    </div>
                    <span :class="getActivityTypeClass(actividad.tipo)">
                      {{ actividad.tipo }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import { useRouter } from 'vue-router'

const store = useSecretaryStore()
const router = useRouter()

// Estados reactivos con los datos reales del store
const pacientesRecientes = computed(() => store.patients.slice(-5).reverse() || [])
const citasDelDia = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.appointments.filter(cita => cita.fecha.startsWith(today)) || []
})

// Simulando actividades recientes basadas en datos reales
const actividadesRecientes = computed(() => {
  const actividades: Array<{
    id: string
    tipo: string
    titulo: string
    descripcion: string
    fecha: string
  }> = []
  
  // Agregar pacientes recientes como actividades
  store.patients.slice(-3).forEach(paciente => {
    actividades.push({
      id: `patient-${paciente.id}`,
      tipo: 'Registro',
      titulo: 'Nuevo paciente registrado',
      descripcion: `Paciente ${paciente.nombre} registrado en el sistema`,
      fecha: paciente.createdAt
    })
  })
  
  // Agregar citas como actividades
  store.appointments.slice(-2).forEach(cita => {
    actividades.push({
      id: `appointment-${cita.id}`,
      tipo: 'Cita',
      titulo: 'Cita programada',
      descripcion: `Cita programada para ${cita.fecha} a las ${cita.hora}`,
      fecha: cita.createdAt
    })
  })
  
  return actividades.slice(-5)
})

// Estadísticas basadas en datos reales
const totalPacientes = computed(() => store.patients.length || 0)
const citasHoy = computed(() => citasDelDia.value.length || 0)
const asignacionesPendientes = computed(() => store.assignments.filter(a => a.estado === 'asignado').length || 0)
const encuestasCompletadas = computed(() => store.histories.length || 0)

// Métodos
const registrarPaciente = () => {
  router.push('/secretary/patients/new')
}

const agendarCita = () => {
  router.push('/secretary/appointments/new')
}

const verTodosPacientes = () => {
  router.push('/secretary/patients')
}

const verPaciente = (paciente: any) => {
  router.push(`/secretary/patients/${paciente.id}`)
}

const agendarCitaPaciente = (paciente: any) => {
  router.push(`/secretary/appointments/new?patient=${paciente.id}`)
}

const formatDate = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

const formatDateTime = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES')
}

const getAppointmentStatusClass = (estado: string) => {
  const classes = {
    'pendiente': 'badge bg-warning',
    'confirmada': 'badge bg-success',
    'cancelada': 'badge bg-danger'
  }
  return classes[estado as keyof typeof classes] || 'badge bg-secondary'
}

const getActivityIconClass = (tipo: string) => {
  const classes = {
    'Registro': 'timeline-icon bg-primary',
    'Asignación': 'timeline-icon bg-success',
    'Cita': 'timeline-icon bg-info',
    'Encuesta': 'timeline-icon bg-warning'
  }
  return classes[tipo as keyof typeof classes] || 'timeline-icon bg-secondary'
}

const getActivityIcon = (tipo: string) => {
  const icons = {
    'Registro': 'fas fa-user-plus',
    'Asignación': 'fas fa-user-check',
    'Cita': 'fas fa-calendar',
    'Encuesta': 'fas fa-file-alt'
  }
  return icons[tipo as keyof typeof icons] || 'fas fa-info'
}

const getActivityTypeClass = (tipo: string) => {
  const classes = {
    'Registro': 'badge bg-primary',
    'Asignación': 'badge bg-success',
    'Cita': 'badge bg-info',
    'Encuesta': 'badge bg-warning'
  }
  return classes[tipo as keyof typeof classes] || 'badge bg-secondary'
}

// Cargar datos al montar
onMounted(async () => {
  await store.loadAllData()
})
</script>

<style scoped>
.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
}

.timeline-marker {
  position: relative;
  flex-shrink: 0;
}

.timeline-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-weight: 600;
}

.table th {
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #dee2e6;
}

.badge {
  font-size: 0.75rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.opacity-75 {
  opacity: 0.75;
}
</style>
