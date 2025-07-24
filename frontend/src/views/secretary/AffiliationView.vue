<!-- src/views/secretary/AffiliationView.vue -->
<template>
  <section class="affiliation-view container py-4">
    <h1 class="mb-4 text-primary">Datos de Afiliación</h1>

    <div class="card shadow-sm">
      <div class="card-body">

        <!-- Selector de paciente -->
        <div class="row mb-4">
          <div class="col-md-5">
            <label class="form-label">Seleccionar Paciente</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-user"></i></span>
              <select v-model.number="selectedId" class="form-select">
                <option :value="0" disabled>-- Elige un paciente --</option>
                <option
                  v-for="p in store.patients"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.nombre }} ({{ p.cedula }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Datos del paciente seleccionado -->
        <div v-if="patient" class="patient-info mb-4 p-3 rounded bg-light border">
          <h5 class="mb-3"><i class="fas fa-id-card-alt me-2"></i>Paciente Seleccionado</h5>
          <div class="row">
            <div class="col-sm-6 mb-2"><strong>Nombre:</strong> {{ patient.nombre }}</div>
            <div class="col-sm-6 mb-2"><strong>Cédula:</strong> {{ patient.cedula }}</div>
            <div class="col-sm-6 mb-2"><strong>Plan:</strong> {{ patient.planAfiliacion || '—' }}</div>
            <div class="col-sm-6 mb-2"><strong>Afiliado nº:</strong> {{ patient.numAfiliado || '—' }}</div>
            <div class="col-sm-6 mb-2"><strong>Desde:</strong> {{ patient.fechaInicioAfiliacion || '—' }}</div>
            <div class="col-sm-6 mb-2"><strong>Hasta:</strong> {{ patient.fechaFinAfiliacion || '—' }}</div>
          </div>
        </div>

        <!-- Formulario de afiliación -->
        <AffiliationForm
          v-if="patient"
          v-model="affiliation"
          @save="onSave"
          @cancel="onCancel"
        />

        <!-- Mensaje si no hay paciente -->
        <p v-else class="text-center text-muted py-5 mb-0">
          Selecciona un paciente para ver o editar sus datos de afiliación.
        </p>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { Patient } from '@/mocks/secretary/patients'
import AffiliationForm from '@/components/secretary/AffiliationForm.vue'

// Type local para el formulario
interface Affiliation {
  numAfiliado?: string
  planAfiliacion?: string
  fechaInicioAfiliacion?: string
  fechaFinAfiliacion?: string
}

const store = useSecretaryStore()
const selectedId = ref(0)

// Carga inicial de pacientes
onMounted(() => store.loadPatients())

// Computed: paciente seleccionado
const patient = computed<Patient|undefined>(() =>
  store.patients.find(p => p.id === selectedId.value)
)

// Datos de afiliación para el formulario
const affiliation = ref<Affiliation>({
  numAfiliado: '',
  planAfiliacion: '',
  fechaInicioAfiliacion: '',
  fechaFinAfiliacion: ''
})

// Cuando cambia el paciente, rellenar el formulario
watch(patient, (p: Patient|undefined) => {
  if (p) {
    affiliation.value = {
      numAfiliado: p.numAfiliado || '',
      planAfiliacion: p.planAfiliacion || '',
      fechaInicioAfiliacion: p.fechaInicioAfiliacion || '',
      fechaFinAfiliacion: p.fechaFinAfiliacion || ''
    }
  } else {
    affiliation.value = { numAfiliado: '', planAfiliacion: '', fechaInicioAfiliacion: '', fechaFinAfiliacion: '' }
  }
})

// Guardar datos de afiliación
async function onSave(data: Affiliation) {
  if (!patient.value) return
  const updated: Patient = {
    ...patient.value,
    ...data,
    updatedAt: new Date().toISOString()
  }
  await store.addOrUpdatePatient(updated)
  alert('Datos de afiliación guardados.')
}

// Cancelar edición
function onCancel() {
  if (patient.value) {
    affiliation.value = {
      numAfiliado: patient.value.numAfiliado || '',
      planAfiliacion: patient.value.planAfiliacion || '',
      fechaInicioAfiliacion: patient.value.fechaInicioAfiliacion || '',
      fechaFinAfiliacion: patient.value.fechaFinAfiliacion || ''
    }
  }
}
</script>

<style scoped>
.affiliation-view h1 {
  font-weight: 700;
}
.card {
  border: none;
  border-radius: 0.75rem;
  overflow: hidden;
}
.card-body {
  background: #ffffff;
  padding: 2rem;
}
.input-group-text {
  background-color: var(--bs-primary);
  color: #fff;
  border: none;
}
.form-label {
  font-weight: 600;
}
.patient-info {
  background: var(--bs-light);
}
.patient-info h5 {
  font-size: 1.1rem;
  color: var(--bs-primary);
}
.patient-info .row > div {
  font-size: 0.95rem;
}
.text-primary {
  color: var(--bs-primary) !important;
}
/* Responsive */
@media (max-width: 576px) {
  .card-body {
    padding: 1.5rem;
  }
}
</style>
