<template>
  <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }" @click.self="closeModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header clinical-header">
          <h5 class="modal-title">
            <i class="fas fa-edit me-2"></i>
            Editar Caso Clínico
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="updateCase">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label required">Especialidad</label>
                <select v-model="form.especialidad" class="form-select clinical-select" required>
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
                  v-model="form.motivoConsulta"
                  placeholder="Ej: Dolor en molar superior"
                >
              </div>

              <div class="col-12">
                <label class="form-label required">Diagnóstico</label>
                <textarea
                  v-model="form.diagnostico"
                  class="form-control clinical-input"
                  rows="3"
                  placeholder="Diagnóstico del caso..."
                  required
                ></textarea>
              </div>

              <div class="col-12">
                <label class="form-label">Plan de Tratamiento</label>
                <textarea
                  v-model="form.tratamiento"
                  class="form-control clinical-input"
                  rows="4"
                  placeholder="Plan de tratamiento..."
                ></textarea>
              </div>

              <div class="col-12">
                <label class="form-label">Observaciones</label>
                <textarea
                  v-model="form.observaciones"
                  class="form-control clinical-input"
                  rows="3"
                  placeholder="Observaciones adicionales..."
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="updateCase"
            :disabled="updating || !isFormValid"
          >
            <span v-if="updating">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Actualizando...
            </span>
            <span v-else>
              <i class="fas fa-save me-1"></i>
              Guardar Cambios
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as clinicalService from '@/services/clinicalCasesService'

// Props y emits
interface Props {
  show: boolean
  caseData: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  'case-updated': []
}>()

// Estado del componente
const updating = ref(false)
const form = ref({
  especialidad: '',
  motivoConsulta: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: ''
})

// Computed properties
const isFormValid = computed(() => {
  return form.value.especialidad && form.value.diagnostico
})

// Métodos
const closeModal = () => {
  emit('update:show', false)
  resetForm()
}

const resetForm = () => {
  form.value = {
    especialidad: '',
    motivoConsulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  }
}

const loadFormData = () => {
  if (props.caseData) {
    form.value = {
      especialidad: props.caseData.especialidad || '',
      motivoConsulta: props.caseData.motivoConsulta || '',
      diagnostico: props.caseData.diagnostico || '',
      tratamiento: props.caseData.tratamiento || '',
      observaciones: props.caseData.observaciones || ''
    }
  }
}

const updateCase = async () => {
  if (!props.caseData?.id || updating.value || !isFormValid.value) return

  try {
    updating.value = true

    await clinicalService.updateClinicalCaseBasic(props.caseData.id, form.value)
    
    emit('case-updated')
    closeModal()
    
    // Notificación de éxito
    alert('Caso clínico actualizado exitosamente')
  } catch (error) {
    console.error('Error updating case:', error)
    alert('Error al actualizar el caso clínico. Inténtalo nuevamente.')
  } finally {
    updating.value = false
  }
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadFormData()
  }
})

watch(() => props.caseData, () => {
  if (props.show) {
    loadFormData()
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

.required::after {
  content: " *";
  color: #dc3545;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
}
</style>
