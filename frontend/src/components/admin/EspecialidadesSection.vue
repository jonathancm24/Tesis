<!--
  Componente para gestionar especialidades médicas
  Permite crear y listar especialidades del sistema
  Archivo: src/components/admin/EspecialidadesSection.vue
-->
<template>
  <div class="especialidades-section">
    <!-- Encabezado de la sección -->
    <div class="section-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="section-title mb-1">
          <i class="fas fa-stethoscope me-2 text-primary"></i>
          Especialidades Médicas
        </h4>
        <p class="section-description text-muted mb-0">
          Gestiona las especialidades médicas disponibles en el sistema
        </p>
      </div>
      <button 
        class="btn btn-primary"
        @click="showCreateForm = true"
        :disabled="loading"
      >
        <i class="fas fa-plus me-2"></i>
        Nueva Especialidad
      </button>
    </div>

    <!-- Formulario de creación -->
    <div v-if="showCreateForm" class="create-form-container mb-4">
      <div class="card border-primary">
        <div class="card-header bg-primary text-white">
          <h6 class="mb-0">
            <i class="fas fa-plus-circle me-2"></i>
            Crear Nueva Especialidad
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmit" class="row g-3">
            <!-- Campo nombre -->
            <div class="col-md-6">
              <label for="especialidadNombre" class="form-label">
                Nombre de la Especialidad *
              </label>
              <input
                id="especialidadNombre"
                v-model="formData.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Ej: Odontología General"
                required
                maxlength="100"
              />
              <div v-if="errors.nombre" class="invalid-feedback">
                {{ errors.nombre }}
              </div>
            </div>

            <!-- Campo descripción -->
            <div class="col-md-6">
              <label for="especialidadDescripcion" class="form-label">
                Descripción
              </label>
              <textarea
                id="especialidadDescripcion"
                v-model="formData.descripcion"
                class="form-control"
                :class="{ 'is-invalid': errors.descripcion }"
                placeholder="Descripción opcional de la especialidad..."
                rows="3"
                maxlength="255"
              ></textarea>
              <div v-if="errors.descripcion" class="invalid-feedback">
                {{ errors.descripcion }}
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="col-12">
              <div class="d-flex gap-2 justify-content-end">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="cancelCreate"
                  :disabled="submitting"
                >
                  <i class="fas fa-times me-2"></i>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ submitting ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Lista de especialidades -->
    <div class="especialidades-list">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando especialidades...</span>
        </div>
        <p class="mt-2 text-muted">Cargando especialidades...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="especialidades.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="fas fa-stethoscope text-muted mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-muted">No hay especialidades registradas</h5>
          <p class="text-muted">Comienza agregando la primera especialidad médica</p>
        </div>
      </div>

      <!-- Lista con datos -->
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        <div 
          v-for="especialidad in especialidades" 
          :key="especialidad.id"
          class="col"
        >
          <div class="card h-100 shadow-sm especialidad-card">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="flex-grow-1">
                  <h6 class="card-title text-primary mb-2">
                    <i class="fas fa-stethoscope me-2"></i>
                    {{ especialidad.nombre }}
                  </h6>
                  <p 
                    v-if="especialidad.descripcion" 
                    class="card-text text-muted small mb-0"
                  >
                    {{ especialidad.descripcion }}
                  </p>
                  <span v-else class="text-muted fst-italic small">
                    Sin descripción
                  </span>
                </div>
                <div class="dropdown">
                  <button 
                    class="btn btn-sm btn-outline-secondary"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editEspecialidad(especialidad)">
                        <i class="fas fa-edit me-2"></i>
                        Editar
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" @click.prevent="deleteEspecialidad(especialidad)">
                        <i class="fas fa-trash me-2"></i>
                        Eliminar
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-footer bg-transparent small text-muted">
              <i class="fas fa-info-circle me-1"></i>
              ID: {{ especialidad.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-if="especialidades.length > 0" class="stats-footer mt-4 p-3 bg-light rounded">
      <div class="row text-center">
        <div class="col">
          <div class="stat-item">
            <h5 class="stat-number text-primary mb-1">{{ especialidades.length }}</h5>
            <span class="stat-label text-muted small">
              {{ especialidades.length === 1 ? 'Especialidad' : 'Especialidades' }} registrada{{ especialidades.length === 1 ? '' : 's' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Especialidad, CreateEspecialidadDTO } from '@/types/baseData'

// Props del componente
interface Props {
  especialidades: Especialidad[]
  loading: boolean
}

const props = defineProps<Props>()

// Eventos que emite el componente
const emit = defineEmits<{
  create: [data: CreateEspecialidadDTO]
  refresh: []
}>()

// Estado reactivo del componente
const showCreateForm = ref(false)
const submitting = ref(false)

// Datos del formulario
const formData = reactive<CreateEspecialidadDTO>({
  nombre: '',
  descripcion: ''
})

// Errores de validación
const errors = reactive<Record<string, string>>({})

/**
 * Valida los datos del formulario
 */
function validateForm(): boolean {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // Validar nombre
  if (!formData.nombre.trim()) {
    errors.nombre = 'El nombre de la especialidad es requerido'
    isValid = false
  } else if (formData.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres'
    isValid = false
  } else if (formData.nombre.trim().length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres'
    isValid = false
  }

  // Validar descripción (opcional)
  if (formData.descripcion && formData.descripcion.trim().length > 255) {
    errors.descripcion = 'La descripción no puede exceder 255 caracteres'
    isValid = false
  }

  // Validar que no exista duplicado
  const nombreExistente = props.especialidades.some(
    esp => esp.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim()
  )
  if (nombreExistente) {
    errors.nombre = 'Ya existe una especialidad con este nombre'
    isValid = false
  }

  return isValid
}

/**
 * Maneja el envío del formulario
 */
async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true
    
    // Preparar datos para envío
    const dataToSubmit: CreateEspecialidadDTO = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || undefined
    }

    // Emitir evento de creación
    emit('create', dataToSubmit)
    
    // Resetear formulario y cerrar
    resetForm()
    showCreateForm.value = false
  } catch (error) {
    console.error('Error en handleSubmit:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * Cancela la creación y cierra el formulario
 */
function cancelCreate(): void {
  resetForm()
  showCreateForm.value = false
}

/**
 * Resetea los datos del formulario
 */
function resetForm(): void {
  formData.nombre = ''
  formData.descripcion = ''
  Object.keys(errors).forEach(key => delete errors[key])
}

/**
 * Maneja la edición de una especialidad (placeholder)
 */
function editEspecialidad(especialidad: Especialidad): void {
  // TODO: Implementar edición
  console.log('Editar especialidad:', especialidad)
}

/**
 * Maneja la eliminación de una especialidad (placeholder)
 */
function deleteEspecialidad(especialidad: Especialidad): void {
  // TODO: Implementar eliminación con confirmación
  console.log('Eliminar especialidad:', especialidad)
}
</script>

<style scoped>
.section-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
}

.section-description {
  font-size: 0.9rem;
}

.create-form-container {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.especialidad-card {
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.especialidad-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: #007bff;
}

.empty-state {
  padding: 2rem;
}

.stat-item {
  padding: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch !important;
    gap: 1rem;
  }
  
  .create-form-container .row {
    margin: 0;
  }
  
  .create-form-container .col-md-6 {
    padding: 0.5rem;
  }
}
</style>
