<!-- src/views/secretary/PatientManagementView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Gestión de Pacientes</h2>
        <p class="text-muted">Registra y administra información de pacientes</p>
      </div>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-primary" 
          @click="switchTab('search')"
          :class="{ 'active': tab === 'search' }"
        >
          <i class="fas fa-search me-2"></i>Buscar
        </button>
        <button 
          class="btn btn-primary" 
          @click="prepareForm()"
        >
          <i class="fas fa-user-plus me-2"></i>Registrar Paciente
        </button>
      </div>
    </div>

    <!-- Formulario de búsqueda -->
    <div v-if="tab === 'search'" class="card mb-4">
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-6">
            <label class="form-label">Buscar paciente</label>
            <input
              v-model="query"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre o cédula..."
            />
          </div>
          <div class="col-md-3">
            <button 
              class="btn btn-outline-secondary"
              @click="clearSearch"
            >
              <i class="fas fa-times me-2"></i>Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para formulario -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-plus me-2"></i>
              {{ editMode ? 'Editar Paciente' : 'Registrar Nuevo Paciente' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="onSave">
              <div class="row g-3">
                <!-- Información Personal -->
                <div class="col-12">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-user me-2"></i>Información Personal
                  </h6>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Nombre completo <span class="text-danger">*</span></label>
                  <input v-model="form.nombre" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Cédula <span class="text-danger">*</span></label>
                  <input v-model="form.cedula" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de Nacimiento</label>
                  <input v-model="form.fechaNacimiento" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Género</label>
                  <select v-model="form.genero" class="form-select">
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <!-- Información de Contacto -->
                <div class="col-12 mt-4">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-map-marker-alt me-2"></i>Información de Contacto
                  </h6>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Cantón <span class="text-danger">*</span></label>
                  <input v-model="form.canton" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Parroquia</label>
                  <input v-model="form.parroquia" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contacto <span class="text-danger">*</span></label>
                  <input v-model="form.contacto" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input v-model="form.telefono" type="tel" class="form-control" />
                </div>

                <!-- Información de Afiliación -->
                <div class="col-12 mt-4">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-id-card me-2"></i>Información de Afiliación
                  </h6>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Número de Afiliado</label>
                  <input v-model="form.numAfiliado" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Plan de Afiliación</label>
                  <input v-model="form.planAfiliacion" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Inicio de Afiliación</label>
                  <input v-model="form.fechaInicioAfiliacion" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fin de Afiliación</label>
                  <input v-model="form.fechaFinAfiliacion" type="date" class="form-control" />
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

    <!-- Lista de pacientes -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">
          <i class="fas fa-users me-2"></i>
          {{ filtered.length }} Paciente{{ filtered.length !== 1 ? 's' : '' }}
          {{ query ? ' (filtrados)' : '' }}
        </h5>
        <div class="d-flex gap-2">
          <small class="text-muted align-self-center">
            Total: {{ store.patients.length }} pacientes
          </small>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Paciente</th>
                <th>Contacto</th>
                <th>Ubicación</th>
                <th>Afiliación</th>
                <th>Fecha Registro</th>
                <th width="120">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtered" :key="p.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                         style="width: 40px; height: 40px; font-size: 16px;">
                      {{ p.nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-medium">{{ p.nombre }}</div>
                      <small class="text-muted">{{ p.cedula }}</small>
                      <div v-if="p.genero || p.fechaNacimiento">
                        <small class="text-muted">
                          <span v-if="p.genero">{{ p.genero === 'M' ? 'Masculino' : 'Femenino' }}</span>
                          <span v-if="p.fechaNacimiento">
                            {{ p.genero ? ' • ' : '' }}{{ calculateAge(p.fechaNacimiento) }} años
                          </span>
                        </small>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="fw-medium">{{ p.contacto }}</div>
                    <small v-if="p.telefono" class="text-muted">{{ p.telefono }}</small>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="fw-medium">{{ p.canton }}</div>
                    <small v-if="p.parroquia" class="text-muted">{{ p.parroquia }}</small>
                  </div>
                </td>
                <td>
                  <div v-if="p.numAfiliado">
                    <div class="fw-medium">{{ p.numAfiliado }}</div>
                    <small v-if="p.planAfiliacion" class="text-muted">{{ p.planAfiliacion }}</small>
                  </div>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <div>{{ formatDate(p.createdAt) }}</div>
                  <small class="text-muted">{{ formatTime(p.createdAt) }}</small>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="onEdit(p)"
                      title="Editar paciente"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-success"
                      @click="viewScreeningSurvey(p)"
                      title="Encuesta de tamizaje"
                    >
                      <i class="fas fa-file-alt"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="onDelete(p.id)"
                      title="Eliminar paciente"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Estado vacío -->
          <div v-if="!filtered.length" class="text-center py-5">
            <div class="mb-3">
              <i class="fas fa-users fa-3x text-muted opacity-50"></i>
            </div>
            <h5 class="text-muted">
              {{ query ? 'No se encontraron pacientes' : 'No hay pacientes registrados' }}
            </h5>
            <p class="text-muted mb-4">
              {{ query ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primer paciente' }}
            </p>
            <button v-if="!query" class="btn btn-primary" @click="prepareForm()">
              <i class="fas fa-user-plus me-2"></i>Registrar Primer Paciente
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
import type { Patient } from '@/mocks/secretary/patients'

const store = useSecretaryStore()
const router = useRouter()
const tab = ref<'list' | 'form' | 'search'>('list')
const editMode = ref(false)
const query = ref('')
const showModal = ref(false)

// Formulario reactivo
const form = ref<Partial<Patient>>({
  nombre: '',
  cedula: '',
  canton: '',
  contacto: '',
  parroquia: '',
  telefono: '',
  fechaNacimiento: '',
  genero: undefined,
  numAfiliado: '',
  planAfiliacion: '',
  fechaInicioAfiliacion: '',
  fechaFinAfiliacion: ''
})

// Carga inicial
onMounted(async () => {
  await store.loadPatients()
})

// Cambiar pestaña
function switchTab(t: 'list' | 'form' | 'search') {
  tab.value = t
}

// Preparar formulario para nuevo paciente
function prepareForm() {
  editMode.value = false
  form.value = {
    nombre: '',
    cedula: '',
    canton: '',
    contacto: '',
    parroquia: '',
    telefono: '',
    fechaNacimiento: '',
    genero: undefined,
    numAfiliado: '',
    planAfiliacion: '',
    fechaInicioAfiliacion: '',
    fechaFinAfiliacion: ''
  }
  showModal.value = true
}

// Cerrar modal
function closeModal() {
  showModal.value = false
}

// Limpiar búsqueda
function clearSearch() {
  query.value = ''
  tab.value = 'list'
}

// Editar paciente existente
function onEdit(p: Patient) {
  editMode.value = true
  form.value = { ...p }
  showModal.value = true
}

// Ver encuesta de tamizaje
function viewScreeningSurvey(p: Patient) {
  // Navegar a la encuesta de tamizaje del paciente
  router.push(`/secretary/screening-survey/${p.id}`)
}

// Eliminar paciente
async function onDelete(id: number) {
  if (!confirm('¿Está seguro de eliminar este paciente?')) return
  await store.removePatient(id)
}

// Guardar o actualizar
async function onSave() {
  const now = new Date().toISOString()
  const p: Patient = {
    id: form.value.id || Date.now(),
    nombre: form.value.nombre!.trim(),
    cedula: form.value.cedula!.trim(),
    canton: form.value.canton!.trim(),
    contacto: form.value.contacto!.trim(),
    parroquia: form.value.parroquia,
    telefono: form.value.telefono,
    fechaNacimiento: form.value.fechaNacimiento,
    genero: form.value.genero as 'M' | 'F' | undefined,
    numAfiliado: form.value.numAfiliado,
    planAfiliacion: form.value.planAfiliacion,
    fechaInicioAfiliacion: form.value.fechaInicioAfiliacion,
    fechaFinAfiliacion: form.value.fechaFinAfiliacion,
    // campos obligatorios del mock
    createdAt: (form.value.createdAt as string) || now,
    updatedAt: now
  }
  await store.addOrUpdatePatient(p)
  await store.loadPatients()
  closeModal()
}

// Calcular edad
function calculateAge(fechaNacimiento: string) {
  if (!fechaNacimiento) return ''
  const today = new Date()
  const birthDate = new Date(fechaNacimiento)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
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

// Pacientes filtrados en búsqueda
const filtered = computed(() => {
  if (!query.value) return store.patients
  
  const q = query.value.toLowerCase()
  return store.patients.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.cedula.includes(q)
  )
})
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

.text-primary {
  color: #0d6efd !important;
}
</style>
