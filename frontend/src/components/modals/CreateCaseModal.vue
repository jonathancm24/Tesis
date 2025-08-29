<template>
  <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }" @click.self="closeModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header clinical-header">
          <h5 class="modal-title">
            <i class="fas fa-plus-circle me-2"></i>
            Crear Nuevo Caso Clínico
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <!-- Paso 1: Selección del paciente -->
          <div v-if="currentStep === 1" class="step-content">
            <div class="step-header mb-4">
              <h6 class="step-title">Paso 1: Seleccionar Paciente</h6>
              <p class="step-description">Selecciona un paciente con encuesta de tamisaje completada</p>
            </div>

            <div class="mb-3">
              <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  class="form-control clinical-input"
                  placeholder="Buscar paciente por nombre, cédula..."
                  v-model="patientSearch"
                  @input="searchPatients"
                >
              </div>
            </div>

            <div v-if="loadingPatients" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Buscando pacientes...</span>
              </div>
            </div>

            <div v-else-if="filteredPatients.length === 0" class="empty-state">
              <i class="fas fa-user-slash fa-2x text-muted mb-2"></i>
              <p class="text-muted">No se encontraron pacientes disponibles</p>
              <small class="text-muted">Los pacientes deben tener una encuesta de tamisaje completada</small>
            </div>

            <div v-else class="patients-list">
              <div 
                v-for="patient in filteredPatients" 
                :key="patient.id"
                class="patient-card"
                :class="{ selected: selectedPatient?.id === patient.id }"
                @click="selectPatient(patient)"
              >
                <div class="patient-info">
                  <h6 class="patient-name">{{ patient.nombres }} {{ patient.apellidos }}</h6>
                  <p class="patient-details mb-1">
                    <i class="fas fa-id-card me-1"></i>
                    {{ patient.cedula }}
                  </p>
                  <p class="patient-details mb-1">
                    <i class="fas fa-birthday-cake me-1"></i>
                    {{ calculateAge(patient.fechaNacimiento) }} años
                  </p>
                  <p class="patient-details mb-0">
                    <i class="fas fa-phone me-1"></i>
                    {{ patient.telefono || 'No disponible' }}
                  </p>
                </div>
                <div class="patient-status">
                  <span class="badge bg-success">
                    <i class="fas fa-check-circle me-1"></i>
                    Encuesta completada
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 2: Información del caso -->
          <div v-if="currentStep === 2" class="step-content">
            <div class="step-header mb-4">
              <h6 class="step-title">Paso 2: Información del Caso</h6>
              <p class="step-description">Completa los datos básicos del caso clínico</p>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label required">Especialidad</label>
                <select v-model="caseForm.especialidad" class="form-select clinical-select" required>
                  <option value="">Seleccionar especialidad</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Periodoncia">Periodoncia</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Cirugía Oral">Cirugía Oral</option>
                  <option value="Rehabilitación">Rehabilitación</option>
                  <option value="Operatoria">Operatoria Dental</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Motivo de Consulta</label>
                <input
                  type="text"
                  class="form-control clinical-input"
                  v-model="caseForm.motivoConsulta"
                  placeholder="Ej: Dolor en molar superior"
                >
              </div>

              <div class="col-12">
                <label class="form-label required">Diagnóstico Provisional</label>
                <textarea
                  v-model="caseForm.diagnostico"
                  class="form-control clinical-input"
                  rows="3"
                  placeholder="Describe el diagnóstico provisional del caso..."
                  required
                ></textarea>
              </div>

              <div class="col-12">
                <label class="form-label">Plan de Tratamiento</label>
                <textarea
                  v-model="caseForm.tratamiento"
                  class="form-control clinical-input"
                  rows="4"
                  placeholder="Describe el plan de tratamiento propuesto..."
                ></textarea>
              </div>

              <div class="col-12">
                <label class="form-label">Observaciones</label>
                <textarea
                  v-model="caseForm.observaciones"
                  class="form-control clinical-input"
                  rows="3"
                  placeholder="Observaciones adicionales..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Paso 3: Confirmación -->
          <div v-if="currentStep === 3" class="step-content">
            <div class="step-header mb-4">
              <h6 class="step-title">Paso 3: Confirmar Información</h6>
              <p class="step-description">Revisa todos los datos antes de crear el caso</p>
            </div>

            <div class="confirmation-summary">
              <div class="summary-section">
                <h6 class="summary-title">Paciente Seleccionado</h6>
                <div class="summary-content">
                  <p><strong>Nombre:</strong> {{ selectedPatient?.nombres }} {{ selectedPatient?.apellidos }}</p>
                  <p><strong>Cédula:</strong> {{ selectedPatient?.cedula }}</p>
                  <p><strong>Edad:</strong> {{ selectedPatient ? calculateAge(selectedPatient.fechaNacimiento) : '' }} años</p>
                </div>
              </div>

              <div class="summary-section">
                <h6 class="summary-title">Información del Caso</h6>
                <div class="summary-content">
                  <p><strong>Especialidad:</strong> {{ caseForm.especialidad }}</p>
                  <p v-if="caseForm.motivoConsulta"><strong>Motivo:</strong> {{ caseForm.motivoConsulta }}</p>
                  <p><strong>Diagnóstico:</strong> {{ caseForm.diagnostico }}</p>
                  <p v-if="caseForm.tratamiento"><strong>Tratamiento:</strong> {{ caseForm.tratamiento }}</p>
                  <p v-if="caseForm.observaciones"><strong>Observaciones:</strong> {{ caseForm.observaciones }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="step-indicators">
            <span 
              v-for="step in 3" 
              :key="step"
              class="step-indicator"
              :class="{ active: step === currentStep, completed: step < currentStep }"
            >
              {{ step }}
            </span>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cancelar
            </button>
            <button 
              v-if="currentStep > 1"
              type="button" 
              class="btn btn-outline-primary"
              @click="previousStep"
            >
              <i class="fas fa-chevron-left me-1"></i>
              Anterior
            </button>
            <button 
              v-if="currentStep < 3"
              type="button" 
              class="btn btn-primary"
              @click="nextStep"
              :disabled="!canProceed"
            >
              Siguiente
              <i class="fas fa-chevron-right ms-1"></i>
            </button>
            <button 
              v-if="currentStep === 3"
              type="button" 
              class="btn btn-success"
              @click="createCase"
              :disabled="creating"
            >
              <span v-if="creating">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Creando...
              </span>
              <span v-else>
                <i class="fas fa-plus me-1"></i>
                Crear Caso
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import * as clinicalService from '@/services/clinicalCasesService'

// Props y emits
interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  'case-created': []
}>()

// Interfaces
interface Patient {
  id: number | string
  nombres: string
  apellidos: string
  cedula: string
  fechaNacimiento: string
  telefono?: string
  tieneEncuesta?: boolean
}

interface CaseForm {
  especialidad: string
  motivoConsulta: string
  diagnostico: string
  tratamiento: string
  observaciones: string
}

// Estado del componente
const authStore = useAuthStore()
const currentStep = ref(1)
const creating = ref(false)

// Búsqueda y selección de pacientes
const patientSearch = ref('')
const loadingPatients = ref(false)
const availablePatients = ref<Patient[]>([])
const selectedPatient = ref<Patient | null>(null)

// Formulario del caso
const caseForm = ref<CaseForm>({
  especialidad: '',
  motivoConsulta: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: ''
})

// Computed properties
const filteredPatients = computed(() => {
  if (!patientSearch.value) return availablePatients.value
  
  const search = patientSearch.value.toLowerCase()
  return availablePatients.value.filter(patient =>
    patient.nombres.toLowerCase().includes(search) ||
    patient.apellidos.toLowerCase().includes(search) ||
    patient.cedula.includes(search)
  )
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return selectedPatient.value !== null
  }
  if (currentStep.value === 2) {
    return caseForm.value.especialidad && caseForm.value.diagnostico
  }
  return true
})

// Métodos
const closeModal = () => {
  emit('update:show', false)
  resetForm()
}

const resetForm = () => {
  currentStep.value = 1
  selectedPatient.value = null
  patientSearch.value = ''
  caseForm.value = {
    especialidad: '',
    motivoConsulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  }
}

const searchPatients = async () => {
  try {
    loadingPatients.value = true
    const response = await clinicalService.fetchAvailablePatients()
    availablePatients.value = response.data || []
  } catch (error) {
    console.error('Error searching patients:', error)
    // Datos simulados para desarrollo
    availablePatients.value = [
      {
        id: 1,
        nombres: 'María Elena',
        apellidos: 'García López',
        cedula: '1234567890',
        fechaNacimiento: '1990-05-15',
        telefono: '0987654321',
        tieneEncuesta: true
      },
      {
        id: 2,
        nombres: 'Carlos Alberto',
        apellidos: 'Ruiz Mendoza',
        cedula: '0987654321',
        fechaNacimiento: '1985-08-22',
        telefono: '0123456789',
        tieneEncuesta: true
      },
      {
        id: 3,
        nombres: 'Ana Sofía',
        apellidos: 'López Vargas',
        cedula: '1122334455',
        fechaNacimiento: '1992-12-03',
        telefono: '0999888777',
        tieneEncuesta: true
      }
    ]
  } finally {
    loadingPatients.value = false
  }
}

const selectPatient = (patient: Patient) => {
  selectedPatient.value = patient
}

const calculateAge = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const createCase = async () => {
  if (!selectedPatient.value || creating.value) return

  try {
    creating.value = true

    const caseData = {
      pacienteId: selectedPatient.value.id,
      estudianteId: authStore.user?.id,
      especialidad: caseForm.value.especialidad,
      motivoConsulta: caseForm.value.motivoConsulta,
      diagnostico: caseForm.value.diagnostico,
      tratamiento: caseForm.value.tratamiento,
      observaciones: caseForm.value.observaciones,
      estado: 'EN_REVISION'
    }

    await clinicalService.createClinicalCase(caseData)
    
    emit('case-created')
    closeModal()
    
    // Notificación de éxito (podrías usar una librería de notificaciones)
    alert('Caso clínico creado exitosamente')
  } catch (error) {
    console.error('Error creating case:', error)
    alert('Error al crear el caso clínico. Inténtalo nuevamente.')
  } finally {
    creating.value = false
  }
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow) {
    searchPatients()
  }
})
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.clinical-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.clinical-header .btn-close {
  filter: invert(1);
}

.clinical-input, .clinical-select {
  border: 2px solid #e8ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.clinical-input:focus, .clinical-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.step-content {
  min-height: 400px;
}

.step-header {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e8ecef;
}

.step-title {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6c757d;
  margin: 0;
}

/* Patient selection styles */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 3;
}

.search-container input {
  padding-left: 2.5rem;
}

.patients-list {
  max-height: 300px;
  overflow-y: auto;
}

.patient-card {
  border: 2px solid #e8ecef;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.patient-card.selected {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.patient-name {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.patient-details {
  color: #6c757d;
  font-size: 0.875rem;
}

.patient-status .badge {
  font-size: 0.75rem;
}

/* Confirmation styles */
.confirmation-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.summary-section:last-child {
  margin-bottom: 0;
}

.summary-title {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.summary-content p {
  margin-bottom: 0.5rem;
  color: #495057;
}

.summary-content p:last-child {
  margin-bottom: 0;
}

/* Step indicators */
.step-indicators {
  display: flex;
  gap: 0.5rem;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  color: #6c757d;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.step-indicator.active {
  background-color: #667eea;
  color: white;
}

.step-indicator.completed {
  background-color: #28a745;
  color: white;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.required::after {
  content: " *";
  color: #dc3545;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .patient-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .modal-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
