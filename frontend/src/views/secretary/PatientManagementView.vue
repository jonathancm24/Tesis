<!-- src/views/secretary/PatientManagementView.vue -->
<template>
  <section class="patient-management container py-4">
    <h1 class="mb-4">Gestión de Pacientes</h1>

    <!-- Tabs -->
    <div class="tabs mb-4">
      <button
        :class="['tab-btn', tab === 'list' ? 'active' : '']"
        @click="switchTab('list')"
      >
        📋 Listado
      </button>
      <button
        :class="['tab-btn', tab === 'form' ? 'active' : '']"
        @click="prepareForm()"
      >
        ✏️ {{ editMode ? 'Editar' : 'Registrar' }}
      </button>
      <button
        :class="['tab-btn', tab === 'search' ? 'active' : '']"
        @click="switchTab('search')"
      >
        🔍 Buscar
      </button>
    </div>

    <!-- Listado de pacientes -->
    <div v-if="tab === 'list'" class="tab-content">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead class="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Cantón</th>
              <th>Contacto</th>
              <th>Nº Afiliado</th>
              <th>Plan</th>
              <th>Inicio Afiliación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in store.patients" :key="p.id">
              <td>{{ p.nombre }}</td>
              <td>{{ p.cedula }}</td>
              <td>{{ p.canton }}</td>
              <td>{{ p.contacto }}</td>
              <td>{{ p.numAfiliado || '—' }}</td>
              <td>{{ p.planAfiliacion || '—' }}</td>
              <td>{{ p.fechaInicioAfiliacion || '—' }}</td>
              <td>
                <button class="btn btn-sm btn-primary me-1" @click="onEdit(p)">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger" @click="onDelete(p.id)">
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="!store.patients.length">
              <td colspan="8" class="text-center text-muted py-4">
                No hay pacientes registrados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulario de registro/edición -->
    <div v-else-if="tab === 'form'" class="tab-content">
      <div class="card mx-auto" style="max-width:700px;">
        <div class="card-header">
          {{ editMode ? 'Editar Paciente' : 'Registrar Nuevo Paciente' }}
        </div>
        <div class="card-body">
          <form @submit.prevent="onSave">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nombre completo</label>
                <input v-model="form.nombre" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Cédula</label>
                <input v-model="form.cedula" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Cantón</label>
                <input v-model="form.canton" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Contacto</label>
                <input v-model="form.contacto" type="text" class="form-control" required />
              </div>

              <!-- Datos de afiliación -->
              <div class="col-md-6">
                <label class="form-label">Nº Afiliado</label>
                <input v-model="form.numAfiliado" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Plan de Afiliación</label>
                <input v-model="form.planAfiliacion" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Inicio Afiliación</label>
                <input v-model="form.fechaInicioAfiliacion" type="date" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Fin Afiliación</label>
                <input v-model="form.fechaFinAfiliacion" type="date" class="form-control" />
              </div>

              <div class="col-12 d-flex justify-content-end mt-3">
                <button type="button" class="btn btn-secondary me-2" @click="switchTab('list')">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-success">
                  {{ editMode ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Búsqueda de pacientes -->
    <div v-else class="tab-content">
      <div class="mb-3" style="max-width:400px;">
        <input
          v-model="query"
          type="text"
          class="form-control"
          placeholder="Buscar por nombre o cédula..."
        />
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Cantón</th>
              <th>Contacto</th>
              <th>Afiliación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td>{{ p.nombre }}</td>
              <td>{{ p.cedula }}</td>
              <td>{{ p.canton }}</td>
              <td>{{ p.contacto }}</td>
              <td>
                {{ p.numAfiliado ? p.numAfiliado + ' / ' + (p.planAfiliacion||'') : '—' }}
              </td>
              <td>
                <button class="btn btn-sm btn-primary" @click="onEdit(p)">
                  Ver / Editar
                </button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="text-center text-muted py-4">
                No se encontraron resultados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { Patient } from '@/mocks/secretary/patients'

const store = useSecretaryStore()
const tab = ref<'list' | 'form' | 'search'>('list')
const editMode = ref(false)
const query = ref('')

// Formulario reactivo
const form = ref<Partial<Patient>>({
  nombre: '',
  cedula: '',
  canton: '',
  contacto: '',
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
    numAfiliado: '',
    planAfiliacion: '',
    fechaInicioAfiliacion: '',
    fechaFinAfiliacion: ''
  }
  tab.value = 'form'
}

// Editar paciente existente
function onEdit(p: Patient) {
  editMode.value = true
  form.value = { ...p }
  tab.value = 'form'
}

// Eliminar paciente
async function onDelete(id: number) {
  if (!confirm('¿Eliminar este paciente?')) return
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
  switchTab('list')
}

// Pacientes filtrados en búsqueda
const filtered = computed(() => {
  const q = query.value.toLowerCase()
  return store.patients.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.cedula.includes(q)
  )
})
</script>

<style scoped>
.patient-management .tabs {
  display: flex;
  gap: 1rem;
}
.patient-management .tab-btn {
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}
.patient-management .tab-btn.active {
  background: #0d6efd;
  color: #fff;
}
.tab-content {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
