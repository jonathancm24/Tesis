<!-- src/components/professor/CaseReviewModal.vue -->
<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-clipboard-check me-2"></i>
          Revisar Caso Clínico
        </h3>
        <button type="button" class="btn-close" @click="close" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="caso">
        <div class="case-info-grid">
          <!-- Información del paciente -->
          <div class="info-card">
            <h5 class="info-title">
              <i class="fas fa-user me-2"></i>
              Información del Paciente
            </h5>
            <div class="info-content">
              <p><strong>Nombre:</strong> {{ caso.nombrePaciente }}</p>
              <p><strong>Especialidad:</strong> {{ caso.nombreEspecialidad }}</p>
              <p><strong>Fecha de envío:</strong> {{ formatDate(caso.fechaCreacion) }}</p>
            </div>
          </div>

          <!-- Información del estudiante -->
          <div class="info-card">
            <h5 class="info-title">
              <i class="fas fa-user-graduate me-2"></i>
              Estudiante
            </h5>
            <div class="info-content">
              <p><strong>Nombre:</strong> {{ caso.nombreEstudiante }}</p>
              <p><strong>Estado actual:</strong> 
                <span :class="getStatusClass(caso.estado)">
                  {{ getStatusLabel(caso.estado) }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Motivo de consulta -->
        <div class="info-card mt-3">
          <h5 class="info-title">
            <i class="fas fa-stethoscope me-2"></i>
            Motivo de Consulta
          </h5>
          <div class="info-content">
            <p>{{ caso.motivoConsulta }}</p>
          </div>
        </div>

        <!-- Formulario de revisión -->
        <div class="review-form mt-4">
          <h5 class="form-title">
            <i class="fas fa-edit me-2"></i>
            Revisión del Caso
          </h5>
          
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Calificación (0-100)</label>
              <input
                type="number"
                class="form-control"
                v-model="reviewForm.calificacion"
                min="0"
                max="100"
                placeholder="Ingrese la calificación"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select class="form-control" v-model="reviewForm.estado">
                <option value="APROBADO">Aprobar</option>
                <option value="EN_REVISION">Solicitar correcciones</option>
                <option value="CANCELADO">Rechazar</option>
              </select>
            </div>
          </div>

          <div class="mt-3">
            <label class="form-label">Observaciones</label>
            <textarea
              class="form-control"
              v-model="reviewForm.observaciones"
              rows="4"
              placeholder="Agregue sus comentarios y observaciones..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="close">
          Cancelar
        </button>
        <button 
          type="button" 
          class="btn btn-success" 
          @click="saveReview"
          :disabled="loading || !isValidReview"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
          <i v-else class="fas fa-save me-2"></i>
          {{ loading ? 'Guardando...' : 'Guardar Revisión' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CasoClinicoResumen, EstadoCasoClinicoType } from '@/types/clinicalCase'
import { updateCaseStatus, assignGrade } from '@/services/professorDashboardService'
import { showToast } from '@/utils/toast'

// Props
interface Props {
  visible: boolean
  caso: CasoClinicoResumen | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  saved: [caso: CasoClinicoResumen]
}>()

// Estado
const loading = ref(false)
const reviewForm = ref({
  calificacion: 80,
  estado: 'APROBADO' as EstadoCasoClinicoType,
  observaciones: ''
})

// Computed
const isValidReview = computed(() => {
  return reviewForm.value.observaciones.trim().length > 0 &&
         reviewForm.value.calificacion >= 0 &&
         reviewForm.value.calificacion <= 100
})

// Métodos
const close = () => {
  emit('close')
}

const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

const getStatusLabel = (estado: EstadoCasoClinicoType) => {
  const labels = {
    EN_REVISION: 'En Revisión',
    APROBADO: 'Aprobado',
    PENDIENTE_ESTUDIOS: 'Pendiente Estudios',
    EN_TRATAMIENTO: 'En Tratamiento',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado'
  }
  return labels[estado] || estado
}

const getStatusClass = (estado: EstadoCasoClinicoType) => {
  const classes = {
    EN_REVISION: 'badge bg-warning',
    APROBADO: 'badge bg-success',
    PENDIENTE_ESTUDIOS: 'badge bg-info',
    EN_TRATAMIENTO: 'badge bg-primary',
    FINALIZADO: 'badge bg-success',
    CANCELADO: 'badge bg-danger'
  }
  return classes[estado] || 'badge bg-secondary'
}

const saveReview = async () => {
  if (!props.caso || !isValidReview.value) return

  loading.value = true
  try {
    // Actualizar estado
    await updateCaseStatus(props.caso.id, {
      estado: reviewForm.value.estado,
      observaciones: reviewForm.value.observaciones
    })

    // Asignar calificación si está aprobado
    if (reviewForm.value.estado === 'APROBADO' && reviewForm.value.calificacion > 0) {
      await assignGrade(props.caso.id, {
        calificacion: reviewForm.value.calificacion,
        observaciones: reviewForm.value.observaciones
      })
    }

    showToast('Éxito', 'success', 'Revisión guardada correctamente')
    emit('saved', props.caso)
    close()
  } catch (error) {
    console.error('Error al guardar revisión:', error)
    showToast('Error', 'error', 'Error al guardar la revisión')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.case-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.info-content p {
  margin-bottom: 0.5rem;
  color: #64748b;
}

.info-content p:last-child {
  margin-bottom: 0;
}

.review-form {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-success {
  background: #059669;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #047857;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.bg-warning {
  background-color: #f59e0b !important;
}

.bg-success {
  background-color: #10b981 !important;
}

.bg-info {
  background-color: #3b82f6 !important;
}

.bg-primary {
  background-color: #8b5cf6 !important;
}

.bg-danger {
  background-color: #ef4444 !important;
}

.bg-secondary {
  background-color: #6b7280 !important;
}

@media (max-width: 768px) {
  .case-info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
