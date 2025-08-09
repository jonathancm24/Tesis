<!-- src/views/secretary/PatientAssignmentView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Asignación de Pacientes</h2>
        <p class="text-muted">Asigna pacientes a estudiantes para su atención</p>
      </div>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-primary" 
          @click="toggleFilters"
          :class="{ 'active': showFilters }"
        >
          <i class="fas fa-filter me-2"></i>Filtros
        </button>
        <button 
          class="btn btn-primary" 
          @click="prepareForm()"
        >
          <i class="fas fa-plus me-2"></i>Nueva Asignación
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div v-if="showFilters" class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Estado</label>
            <select class="form-select" v-model="filterEstado">
              <option value="">Todos los estados</option>
              <option value="asignado">Asignado</option>
              <option value="cancelado">Cancelado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Estudiante</label>
            <select class="form-select" v-model.number="filterEstudianteId">
              <option :value="null">Todos los estudiantes</option>
              <option v-for="id in estudianteIds" :key="id" :value="id">
                Estudiante {{ id }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Paciente</label>
            <select class="form-select" v-model.number="filterPacienteId">
              <option :value="null">Todos los pacientes</option>
              <option v-for="patient in store.patients" :key="patient.id" :value="patient.id">
                {{ patient.nombre }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Buscar en notas</label>
            <input
              type="text"
              class="form-control"
              v-model="searchText"
              placeholder="Buscar en notas..."
            />
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-12 d-flex justify-content-end">
            <button class="btn btn-outline-secondary" @click="clearFilters">
              <i class="fas fa-times me-2"></i>Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para formulario -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-check me-2"></i>
              {{ editMode ? 'Editar Asignación' : 'Nueva Asignación' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="onSave">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Estudiante <span class="text-danger">*</span></label>
                  <select class="form-select" v-model.number="form.estudianteId" required>
                    <option value="">Seleccionar estudiante...</option>
                    <option v-for="id in estudianteIds" :key="id" :value="id">
                      Estudiante {{ id }}
                    </option>
                  </select>
                  <div class="form-text">ID del estudiante que atenderá al paciente</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Paciente <span class="text-danger">*</span></label>
                  <select class="form-select" v-model.number="form.pacienteId" required>
                    <option value="">Seleccionar paciente...</option>
                    <option v-for="patient in store.patients" :key="patient.id" :value="patient.id">
                      {{ patient.nombre }} ({{ patient.cedula }})
                    </option>
                  </select>
                  <div class="form-text">Paciente que será asignado</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de Asignación <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="form.fechaAsignacion"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Estado <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="form.estado" required>
                    <option value="asignado">Asignado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Notas</label>
                  <textarea
                    class="form-control"
                    v-model="form.notas"
                    rows="3"
                    placeholder="Notas adicionales sobre la asignación..."
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click="onSave">
              <i class="fas fa-save me-2"></i>{{ editMode ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de asignaciones -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">
          <i class="fas fa-list me-2"></i>
          {{ filteredAssignments.length }} Asignación{{ filteredAssignments.length !== 1 ? 'es' : '' }}
          {{ hasActiveFilters ? ' (filtradas)' : '' }}
        </h5>
        <div class="d-flex gap-2">
          <small class="text-muted align-self-center">
            Total: {{ store.assignments.length }} asignaciones
          </small>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Asignación</th>
                <th>Estudiante</th>
                <th>Paciente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th width="120">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredAssignments" :key="a.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3" 
                         style="width: 32px; height: 32px; font-size: 14px;">
                      {{ a.id }}
                    </div>
                    <div>
                      <div class="fw-medium">Asignación #{{ a.id }}</div>
                      <small v-if="a.notas" class="text-muted">{{ truncateText(a.notas, 50) }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="fw-medium">Estudiante {{ a.estudianteId }}</div>
                    <small class="text-muted">ID: {{ a.estudianteId }}</small>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="fw-medium">{{ getPatientName(a.pacienteId) }}</div>
                    <small class="text-muted">ID: {{ a.pacienteId }}</small>
                  </div>
                </td>
                <td>
                  <div>{{ formatDate(a.fechaAsignacion) }}</div>
                  <small class="text-muted">{{ formatTime(a.createdAt) }}</small>
                </td>
                <td>
                  <span :class="statusBadge(a.estado)">
                    {{ getStatusText(a.estado) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="onEdit(a)"
                      title="Editar asignación"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-success"
                      @click="scheduleAppointment(a)"
                      title="Agendar cita"
                    >
                      <i class="fas fa-calendar-plus"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="onDelete(a.id)"
                      title="Eliminar asignación"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Estado vacío -->
          <div v-if="!filteredAssignments.length" class="text-center py-5">
            <div class="mb-3">
              <i class="fas fa-user-check fa-3x text-muted opacity-50"></i>
            </div>
            <h5 class="text-muted">
              {{ hasActiveFilters ? 'No se encontraron asignaciones' : 'No hay asignaciones registradas' }}
            </h5>
            <p class="text-muted mb-4">
              {{ hasActiveFilters ? 'Intenta con otros filtros de búsqueda' : 'Comienza asignando pacientes a estudiantes' }}
            </p>
            <button v-if="!hasActiveFilters" class="btn btn-primary" @click="prepareForm()">
              <i class="fas fa-plus me-2"></i>Crear Primera Asignación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import { useRouter } from 'vue-router'
import type { PatientAssignment } from '@/mocks/secretary/patientAssignments'

const store = useSecretaryStore()
const router = useRouter()
const editMode = ref(false)
const searchText = ref('')
const filterEstado = ref<string>('')
const filterEstudianteId = ref<number|null>(null)
const filterPacienteId = ref<number|null>(null)
const showFilters = ref(false)
const showModal = ref(false)

// Modelo del formulario
const form = ref<Partial<PatientAssignment>>({
  estudianteId: undefined,
  pacienteId: undefined,
  fechaAsignacion: '',
  estado: 'asignado',
  notas: ''
})

// Carga inicial
onMounted(async () => {
  await Promise.all([ 
    store.loadAssignments(), 
    store.loadPatients() 
  ])
})

// Toggle filtros
function toggleFilters() {
  showFilters.value = !showFilters.value
}

// Limpiar filtros
function clearFilters() {
  filterEstado.value = ''
  filterEstudianteId.value = null
  filterPacienteId.value = null
  searchText.value = ''
}

// Preparar formulario nuevo
function prepareForm() {
  editMode.value = false
  form.value = {
    estudianteId: undefined,
    pacienteId: undefined,
    fechaAsignacion: new Date().toISOString().split('T')[0],
    estado: 'asignado',
    notas: ''
  }
  showModal.value = true
}

// Cerrar modal
function closeModal() {
  showModal.value = false
}

// Editar existente
function onEdit(a: PatientAssignment) {
  editMode.value = true
  form.value = { ...a }
  showModal.value = true
}

// Agendar cita
function scheduleAppointment(assignment: PatientAssignment) {
  router.push(`/secretary/appointments/new?patient=${assignment.pacienteId}&student=${assignment.estudianteId}`)
}

// Eliminar
async function onDelete(id: number) {
  if (!confirm('¿Está seguro de eliminar esta asignación?')) return
  await store.removeAssignment(id)
}

// Guardar o actualizar
async function onSave() {
  if (!form.value.estudianteId || !form.value.pacienteId) {
    alert('Por favor selecciona estudiante y paciente')
    return
  }

  const payload: PatientAssignment = {
    id: form.value.id || Date.now(),
    estudianteId: form.value.estudianteId!,
    pacienteId: form.value.pacienteId!,
    fechaAsignacion: form.value.fechaAsignacion!,
    estado: form.value.estado as any,
    notas: form.value.notas,
    createdAt: (form.value.createdAt as string) || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  await store.addOrUpdateAssignment(payload)
  await store.loadAssignments()
  closeModal()
}

// Obtener nombre del paciente
function getPatientName(pacienteId: number) {
  const patient = store.patients.find(p => p.id === pacienteId)
  return patient ? patient.nombre : `Paciente ${pacienteId}`
}

// Formatear fecha
function formatDate(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES')
}

// Formatear hora
function formatTime(fecha: string) {
  return new Date(fecha).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Truncar texto
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Obtener texto del estado
function getStatusText(estado: string) {
  const texts = {
    'asignado': 'Asignado',
    'cancelado': 'Cancelado',
    'finalizado': 'Finalizado'
  }
  return texts[estado as keyof typeof texts] || estado
}

// Filtrado lista
const estudianteIds = computed(() => {
  const ids = store.assignments.map(a => a.estudianteId)
  return Array.from(new Set(ids)).sort()
})

const hasActiveFilters = computed(() => {
  return !!(filterEstado.value || filterEstudianteId.value || filterPacienteId.value || searchText.value)
})

const filteredAssignments = computed(() => {
  return store.assignments.filter(a => {
    const byEstado = filterEstado.value ? a.estado === filterEstado.value : true
    const byEst = filterEstudianteId.value != null
      ? a.estudianteId === filterEstudianteId.value
      : true
    const byPaciente = filterPacienteId.value != null
      ? a.pacienteId === filterPacienteId.value
      : true
    const bySearch = searchText.value
      ? (a.notas || '').toLowerCase().includes(searchText.value.toLowerCase())
      : true
    return byEstado && byEst && byPaciente && bySearch
  })
})

// Badge de estado
function statusBadge(status: string) {
  switch (status) {
    case 'asignado':   return 'badge bg-success'
    case 'cancelado':  return 'badge bg-warning text-dark'
    case 'finalizado': return 'badge bg-secondary'
    default:           return 'badge bg-light text-dark'
  }
}
</script>

<style scoped>
.modal {
  z-index: 1055;
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

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.card-title {
  font-weight: 600;
}

.text-danger {
  color: #dc3545 !important;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}
</style>
