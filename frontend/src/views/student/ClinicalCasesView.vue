<template>
  <div class="ccv">
    <!-- Header -->
    <div class="ccv-header">
      <div class="ccv-header__title">
        <i class="fas fa-file-medical-alt"></i>
        <h1>Casos Clínicos</h1>
      </div>
      <button class="btn ccv-btn ccv-btn--add" @click="openCreateModal">
        <i class="fas fa-plus"></i> Nuevo Caso
      </button>
    </div>

    <!-- Lista de casos -->
    <div v-if="cases.length" class="ccv-grid">
      <div v-for="c in cases" :key="c.id" class="ccv-card">
        <div class="ccv-card__body">
          <div class="ccv-card__header">
            <h2>#{{ c.id }} - {{ c.patientName }}</h2>
            <span class="ccv-badge" :class="badgeColor(c.status)">
              {{ c.status }}
            </span>
          </div>
          <p><strong>Motivo:</strong> {{ c.reason }}</p>
          <p><strong>Creado:</strong> {{ new Date(c.createdAt).toLocaleString() }}</p>

          <div class="ccv-card__actions">
            <button class="ccv-btn ccv-btn--small" @click="openCase(c, 'desc')">
              <i class="fas fa-eye"></i> Ver Descripción
            </button>
            <button class="ccv-btn ccv-btn--small" @click="openCase(c, 'treat')">
              <i class="fas fa-tooth"></i> Tratamiento
            </button>
            <button class="ccv-btn ccv-btn--small" @click="openCase(c, 'rx')">
              <i class="fas fa-pills"></i> Prescripción
            </button>
            <button class="ccv-btn ccv-btn--small" @click="openCase(c, 'appts')">
              <i class="fas fa-calendar-plus"></i> Agendar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="ccv-empty">
      <p>No hay casos clínicos registrados.</p>
    </div>

    <!-- Detalle de caso -->
    <CaseDetail
      v-if="selectedCase"
      :case-data="selectedCase"
      :active-tab="activeTab"
      @close="closeModal"
    />

    <!-- Modal de creación/edición -->
    <div
      class="ccv-modal-backdrop"
      v-if="showCreateModal"
      @click.self="closeCreateModal"
    ></div>
    <div class="ccv-modal" v-if="showCreateModal">
      <div class="ccv-modal__header">
        <h3>{{ editMode ? 'Editar Caso Clínico' : 'Nuevo Caso Clínico' }}</h3>
        <button class="ccv-modal__close" @click="closeCreateModal">&times;</button>
      </div>
      <div class="ccv-modal__body">
        <form @submit.prevent="saveCase">
          <!-- Datos básicos -->
          <div class="form-group mb-2">
            <label>Paciente</label>
            <input v-model="form.patientName" type="text" class="form-control" required />
          </div>
          <div class="form-group mb-2">
            <label>Título</label>
            <input v-model="form.title" type="text" class="form-control" required />
          </div>
          <div class="form-group mb-2">
            <label>Etapa</label>
            <select v-model="form.stage" class="form-select" required>
              <option value="presentacion">Presentación</option>
              <option value="diagnostico">Diagnóstico</option>
              <option value="plan">Plan de Tratamiento</option>
              <option value="procedimiento">Procedimiento</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </div>
          <div class="form-group mb-2">
            <label>Motivo</label>
            <input v-model="form.reason" type="text" class="form-control" required />
          </div>
          <div class="form-group mb-2">
            <label>Síntomas</label>
            <textarea v-model="form.symptoms" class="form-control" rows="2"></textarea>
          </div>

          <!-- Procedimientos -->
          <div class="form-group mb-2">
            <label>Procedimientos</label>
            <button type="button" @click="addProcedure" class="btn btn-sm btn-success mb-2">
              + Añadir Procedimiento
            </button>
            <div v-for="(p, i) in form.procedures" :key="i" class="mb-2">
              <input v-model="p.code" placeholder="Código" class="form-control mb-1" />
              <input v-model="p.teeth" placeholder="Dientes" class="form-control mb-1" />
              <input v-model="p.description" placeholder="Descripción" class="form-control mb-1" />
            </div>
          </div>

          <!-- Prescripciones -->
          <div class="form-group mb-2">
            <label>Prescripciones</label>
            <button type="button" @click="addPrescription" class="btn btn-sm btn-success mb-2">
              + Añadir Prescripción
            </button>
            <div v-for="(r, i) in form.prescriptions" :key="i" class="mb-2">
              <input v-model="r.drug" placeholder="Medicamento" class="form-control mb-1" />
              <input v-model="r.dose" placeholder="Dosis" class="form-control mb-1" />
            </div>
          </div>

          <!-- Citas -->
          <div class="form-group mb-2">
            <label>Citas</label>
            <button type="button" @click="addAppointment" class="btn btn-sm btn-success mb-2">
              + Añadir Cita
            </button>
            <div v-for="(a, i) in form.appointments" :key="i" class="mb-2">
              <input v-model="a.date" type="datetime-local" class="form-control mb-1" />
              <select v-model="a.status" class="form-select mb-1">
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <input v-model="a.notes" placeholder="Notas (opcional)" class="form-control" />
            </div>
          </div>

          <!-- Guardar -->
          <div class="text-end mt-3">
            <button class="btn btn-primary">{{ editMode ? 'Actualizar' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CaseDetail from '@/components/student/CaseDetail.vue'
import {
  fetchCasesMock,
  saveCaseMock,
  type ClinicalCase,
  type ClinicalCaseStatus
} from '@/mocks/student/clinicalCases'

// Estado
const cases = ref<ClinicalCase[]>([])
const selectedCase = ref<ClinicalCase | null>(null)
const activeTab = ref<'desc'|'treat'|'rx'|'appts'>('desc')
const showCreateModal = ref(false)
const editMode = ref(false)

// Formulario
const form = ref<ClinicalCase>({
  id: 0,
  patientName: '',
  title: '',
  stage: 'presentacion',
  reason: '',
  symptoms: '',
  notes: '',
  specialist: '',
  generalQuestions: [],
  specialistQuestions: [],
  procedures: [],
  prescriptions: [],
  appointments: [],
  comments: [],
  odontogram: [],
  periodontogram: [],
  status: 'pendiente_general',
  createdAt: '',
  updatedAt: ''
})

// Carga inicial
async function loadCases() {
  cases.value = await fetchCasesMock()
}
loadCases()

// Abrir detalle
function openCase(c: ClinicalCase, tab: typeof activeTab.value) {
  selectedCase.value = c
  activeTab.value = tab
}
function closeModal() {
  selectedCase.value = null
}

// Abrir modal creación/edición
function openCreateModal() {
  editMode.value = false
  Object.assign(form.value, {
    id: 0,
    patientName: '',
    title: '',
    stage: 'presentacion',
    reason: '',
    symptoms: '',
    notes: '',
    specialist: '',
    generalQuestions: [],
    specialistQuestions: [],
    procedures: [],
    prescriptions: [],
    appointments: [],
    comments: [],
    odontogram: [],
    periodontogram: [],
    status: 'pendiente_general',
    createdAt: '',
    updatedAt: ''
  })
  showCreateModal.value = true
}
function closeCreateModal() {
  showCreateModal.value = false
}

// Helpers para agregar ítems
function addProcedure() {
  form.value.procedures.push({ code: '', teeth: '', description: '' })
}
function addPrescription() {
  form.value.prescriptions.push({ id: Date.now(), drug: '', dose: '' })
}
function addAppointment() {
  form.value.appointments.push({
    id: Date.now(),
    date: '',
    status: 'pendiente',
    notes: ''
  })
}

// Guardar caso (crea o actualiza)
async function saveCase() {
  const now = new Date().toISOString()
  if (form.value.id && form.value.id > 0) {
    form.value.updatedAt = now
  } else {
    form.value.createdAt = now
    form.value.updatedAt = now
  }
  await saveCaseMock(form.value)
  await loadCases()
  showCreateModal.value = false
}

// Mapea estado a clase CSS
function badgeColor(status: ClinicalCaseStatus) {
  return {
    pendiente_general: 'ccv-badge--yellow',
    pendiente_especialidad: 'ccv-badge--blue',
    aprobado: 'ccv-badge--green',
    completado: 'ccv-badge--gray'
  }[status]!
}
</script>

<style scoped src="@/assets/css/pages/student/ClinicalCases.css"></style>
