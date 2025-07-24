<!-- src/views/secretary/PatientAssignmentView.vue -->
<template>
  <section class="patient-assignment container py-4">
    <h1 class="mb-4">Asignación de Pacientes</h1>

    <!-- Pestañas -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'list' }"
          @click="switchTab('list')"
        >
          Listado
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'form' }"
          @click="prepareForm()"
        >
          {{ editMode ? 'Editar Asignación' : 'Nueva Asignación' }}
        </button>
      </li>
    </ul>

    <!-- LISTADO -->
    <div v-if="tab === 'list'">
      <!-- Filtros -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <label class="form-label">Estado</label>
          <select class="form-select" v-model="filterEstado">
            <option value="">Todos</option>
            <option value="asignado">Asignado</option>
            <option value="cancelado">Cancelado</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Estudiante ID</label>
          <select class="form-select" v-model.number="filterEstudianteId">
            <option :value="null">Todos</option>
            <option v-for="id in estudianteIds" :key="id" :value="id">
              {{ id }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Buscar (notas)</label>
          <input
            type="text"
            class="form-control"
            v-model="searchText"
            placeholder="Texto libre..."
          />
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Estudiante</th>
              <th>Paciente</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Notas</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in filteredAssignments" :key="a.id">
              <td>{{ a.id }}</td>
              <td>{{ a.estudianteId }}</td>
              <td>{{ a.pacienteId }}</td>
              <td>{{ a.fechaAsignacion }}</td>
              <td>
                <span :class="statusBadge(a.estado)">
                  {{ a.estado }}
                </span>
              </td>
              <td>{{ a.notas || '—' }}</td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-primary me-1"
                  @click="onEdit(a)"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="onDelete(a.id)"
                  title="Eliminar"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!filteredAssignments.length">
              <td colspan="7" class="text-center text-muted py-4">
                No hay asignaciones que mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FORMULARIO -->
    <div v-else class="tab-content">
      <div class="card mx-auto" style="max-width:600px;">
        <div class="card-header">
          {{ editMode ? 'Editar Asignación' : 'Registrar Asignación' }}
        </div>
        <div class="card-body">
          <form @submit.prevent="onSave" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Estudiante ID</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.estudianteId"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Paciente ID</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.pacienteId"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Fecha</label>
              <input
                type="date"
                class="form-control"
                v-model="form.fechaAsignacion"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Estado</label>
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
                rows="2"
              ></textarea>
            </div>
            <div class="col-12 d-flex justify-content-end mt-3">
              <button
                type="button"
                class="btn btn-secondary me-2"
                @click="switchTab('list')"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-success">
                {{ editMode ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { PatientAssignment } from '@/mocks/secretary/patientAssignments'

const store = useSecretaryStore()
const tab = ref<'list' | 'form'>('list')
const editMode = ref(false)
const searchText = ref('')
const filterEstado = ref<string>('')
const filterEstudianteId = ref<number|null>(null)

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
  await Promise.all([ store.loadAssignments(), store.loadPatients() ])
})

// Cambiar pestaña
function switchTab(t: 'list' | 'form') {
  tab.value = t
}

// Preparar formulario nuevo
function prepareForm() {
  editMode.value = false
  form.value = {
    estudianteId: undefined,
    pacienteId: undefined,
    fechaAsignacion: '',
    estado: 'asignado',
    notas: ''
  }
  tab.value = 'form'
}

// Editar existente
function onEdit(a: PatientAssignment) {
  editMode.value = true
  form.value = { ...a }
  tab.value = 'form'
}

// Eliminar
async function onDelete(id: number) {
  if (!confirm('¿Eliminar esta asignación?')) return
  await store.removeAssignment(id)
}

// Guardar o actualizar
async function onSave() {
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
  switchTab('list')
}

// Filtrado lista
const estudianteIds = computed(() => {
  const ids = store.assignments.map(a => a.estudianteId)
  return Array.from(new Set(ids))
})
const filteredAssignments = computed(() => {
  return store.assignments.filter(a => {
    const byEstado = filterEstado.value ? a.estado === filterEstado.value : true
    const byEst = filterEstudianteId.value != null
      ? a.estudianteId === filterEstudianteId.value
      : true
    const bySearch = searchText.value
      ? (a.notas || '').toLowerCase().includes(searchText.value.toLowerCase())
      : true
    return byEstado && byEst && bySearch
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
.patient-assignment h1 {
  color: #153b50;
}
.nav-tabs .nav-link {
  cursor: pointer;
}
.nav-tabs .nav-link.active {
  background-color: #0d6efd;
  color: #fff;
}
.tab-content {
  animation: fadeIn .3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}
</style>
