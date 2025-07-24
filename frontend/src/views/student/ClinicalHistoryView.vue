<!-- odontologia-admin/src/views/student/ClinicalHistoryView.vue -->
<template>
  <div class="container-fluid py-4 bg-light min-vh-100">
    <!-- HEADER -->
    <div class="mb-5">
      <h1 class="fw-bold">Historia Clínica</h1>
      <p class="text-muted">Accede y gestiona las historias clínicas de tus pacientes</p>
      <div class="input-group w-75 w-md-50">
        <input
          v-model="searchTerm"
          @keyup.enter="onSearch"
          type="text"
          class="form-control"
          placeholder="Buscar paciente por nombre o cédula…"
        />
      </div>
    </div>

    <!-- TARJETAS -->
    <div v-if="!filteredPatients.length" class="alert alert-warning">
      No se encontraron pacientes.
    </div>
    <div class="row gy-4">
      <div
        v-for="p in filteredPatients"
        :key="p.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex">
            <div
              class="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
            >
              {{ p.name.charAt(0) }}
            </div>
            <div class="flex-grow-1">
              <h5 class="card-title mb-1">{{ p.name }}</h5>
              <small class="text-secondary">{{ p.age }} años</small>
              <ul class="list-unstyled mt-3 mb-0 small text-secondary ps-0">
                <li><strong>Cédula:</strong> {{ p.cedula }}</li>
                <li><strong>Última visita:</strong> {{ p.lastVisit }}</li>
                <li><strong>Tratamientos:</strong> {{ p.history.length }}</li>
              </ul>
            </div>
          </div>
          <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
            <span class="badge bg-success">Activo</span>
            <button class="btn btn-link p-0" @click="openHistory(p)">
              <i class="fas fa-eye"></i> Ver historia
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL BACKDROP -->
    <div
      v-if="selected"
      class="modal-backdrop"
      @click.self="closeModal"
    ></div>

    <!-- MODAL WINDOW -->
    <div v-if="selected" class="modal-window">
      <div class="modal-content">
        <header class="modal-header">
          <h5>Historia de {{ selected.name }}</h5>
          <button class="btn-close" @click="closeModal">×</button>
        </header>

        <section class="modal-body">
          <div class="row">
            <div class="col">
              <h6>Información Personal</h6>
              <dl>
                <dt>Nombre completo:</dt><dd>{{ selected.name }}</dd>
                <dt>Edad:</dt><dd>{{ selected.age }} años</dd>
                <dt>Cédula:</dt><dd>{{ selected.cedula }}</dd>
                <dt>Teléfono:</dt><dd>{{ selected.phone }}</dd>
              </dl>
            </div>
            <div class="col">
              <h6>Información Médica</h6>
              <dl>
                <dt>Alergias:</dt><dd>{{ selected.allergies }}</dd>
                <dt>Medicamentos:</dt><dd>{{ selected.medications }}</dd>
                <dt>Condiciones:</dt><dd>{{ selected.conditions }}</dd>
              </dl>
            </div>
          </div>

          <div class="treatments">
            <h6>Historial de Tratamientos</h6>
            <ul class="treatments-list">
              <li v-for="t in selected.history" :key="t.id">
                <div class="title">{{ t.title }}</div>
                <div class="description">{{ t.description }}</div>
                <div class="details">Supervisor: {{ t.supervisor }}</div>
                <span class="badge bg-secondary">{{ t.date }}</span>
              </li>
            </ul>
          </div>
        </section>

        <footer class="modal-footer">
          <button class="btn btn-success" @click="startTreatment">
            <i class="fas fa-plus"></i> Iniciar caso clínico
          </button>
          <button class="btn btn-outline-secondary" @click="closeModal">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Treatment {
  id: number
  title: string
  description: string
  date: string
  supervisor: string
}
interface Patient {
  id: number
  name: string
  age: number
  cedula: string
  lastVisit: string
  phone: string
  allergies: string
  medications: string
  conditions: string
  history: Treatment[]
}

const searchTerm = ref('')
const patients = ref<Patient[]>([
  {
    id: 1,
    name: 'María González',
    age: 35,
    cedula: '1234567890',
    lastVisit: '9 de enero de 2024',
    phone: '0991234567',
    allergies: 'Penicilina',
    medications: 'Ibuprofeno 400 mg',
    conditions: 'Hipertensión',
    history: [
      {
        id: 1,
        title: 'Limpieza dental',
        description: 'Profilaxis completa con aplicación de flúor',
        date: '9 de enero de 2024',
        supervisor: 'Dr. García'
      },
      {
        id: 2,
        title: 'Obturación',
        description: 'Restauración de caries en molar superior derecho',
        date: '14 de diciembre de 2023',
        supervisor: 'Dr. García'
      }
    ]
  },
  {
    id: 2,
    name: 'Carlos López',
    age: 28,
    cedula: '0987654321',
    lastVisit: '7 de enero de 2024',
    phone: '0997654321',
    allergies: 'Ninguna',
    medications: 'Ninguno',
    conditions: 'Saludable',
    history: [
      {
        id: 1,
        title: 'Ortodoncia',
        description: 'Colocación de brackets metálicos',
        date: '7 de enero de 2024',
        supervisor: 'Dra. Pérez'
      }
    ]
  }
])

const filteredPatients = computed(() =>
  patients.value.filter(p =>
    p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    p.cedula.includes(searchTerm.value)
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
function onSearch() {
  /* búsqueda reactiva */
}
</script>

<style scoped src="@/assets/css/pages/student/ClinicalHistoryView.css"></style>
