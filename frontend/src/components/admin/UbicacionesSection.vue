<!--
  Componente para gestionar ubicaciones geográficas
  Permite crear países, provincias, cantones y parroquias con validación jerárquica
  Archivo: src/components/admin/UbicacionesSection.vue
-->
<template>
  <div class="ubicaciones-section">
    <!-- Encabezado de la sección -->
    <div class="section-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="section-title mb-1">
          <i class="fas fa-map-marker-alt me-2 text-success"></i>
          Ubicaciones Geográficas
        </h4>
        <p class="section-description text-muted mb-0">
          Gestiona la jerarquía de países, provincias, cantones y parroquias
        </p>
      </div>
      <div class="dropdown">
        <button 
          class="btn btn-success dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          :disabled="loading"
        >
          <i class="fas fa-plus me-2"></i>
          Agregar Ubicación
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="showForm('pais')">
              <i class="fas fa-globe me-2"></i>
              Nuevo País
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="showForm('provincia')">
              <i class="fas fa-map me-2"></i>
              Nueva Provincia
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="showForm('canton')">
              <i class="fas fa-map-pin me-2"></i>
              Nuevo Cantón
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="showForm('parroquia')">
              <i class="fas fa-location-dot me-2"></i>
              Nueva Parroquia
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Formularios de creación -->
    <div v-if="activeForm" class="create-form-container mb-4">
      <!-- Formulario de País -->
      <div v-if="activeForm === 'pais'" class="card border-success">
        <div class="card-header bg-success text-white">
          <h6 class="mb-0">
            <i class="fas fa-globe me-2"></i>
            Crear Nuevo País
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmitPais" class="row g-3">
            <div class="col-12">
              <label for="paisNombre" class="form-label">Nombre del País *</label>
              <input
                id="paisNombre"
                v-model="formData.pais.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Ej: Ecuador"
                required
                maxlength="100"
              />
              <div v-if="errors.nombre" class="invalid-feedback">
                {{ errors.nombre }}
              </div>
            </div>
            <div class="col-12">
              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-outline-secondary" @click="cancelForm" :disabled="submitting">
                  <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ submitting ? 'Guardando...' : 'Guardar País' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Formulario de Provincia -->
      <div v-if="activeForm === 'provincia'" class="card border-success">
        <div class="card-header bg-success text-white">
          <h6 class="mb-0">
            <i class="fas fa-map me-2"></i>
            Crear Nueva Provincia
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmitProvincia" class="row g-3">
            <div class="col-md-6">
              <label for="provinciaPais" class="form-label">País *</label>
              <select
                id="provinciaPais"
                v-model="formData.provincia.paisId"
                class="form-select"
                :class="{ 'is-invalid': errors.paisId }"
                required
              >
                <option value="">Seleccionar país...</option>
                <option v-for="pais in paises" :key="pais.id" :value="pais.id">
                  {{ pais.nombre }}
                </option>
              </select>
              <div v-if="errors.paisId" class="invalid-feedback">
                {{ errors.paisId }}
              </div>
            </div>
            <div class="col-md-6">
              <label for="provinciaNombre" class="form-label">Nombre de la Provincia *</label>
              <input
                id="provinciaNombre"
                v-model="formData.provincia.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Ej: Pichincha"
                required
                maxlength="100"
              />
              <div v-if="errors.nombre" class="invalid-feedback">
                {{ errors.nombre }}
              </div>
            </div>
            <div class="col-12">
              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-outline-secondary" @click="cancelForm" :disabled="submitting">
                  <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ submitting ? 'Guardando...' : 'Guardar Provincia' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Formulario de Cantón -->
      <div v-if="activeForm === 'canton'" class="card border-success">
        <div class="card-header bg-success text-white">
          <h6 class="mb-0">
            <i class="fas fa-map-pin me-2"></i>
            Crear Nuevo Cantón
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmitCanton" class="row g-3">
            <!-- Selección de País -->
            <div class="col-md-4">
              <label for="cantonPais" class="form-label">País *</label>
              <select
                id="cantonPais"
                v-model="formData.canton.paisId"
                class="form-select"
                :class="{ 'is-invalid': errors.paisId }"
                required
                @change="onCantonPaisChange"
              >
                <option value="">Seleccionar país...</option>
                <option v-for="pais in paises" :key="pais.id" :value="pais.id">
                  {{ pais.nombre }}
                </option>
              </select>
              <div v-if="errors.paisId" class="invalid-feedback">
                {{ errors.paisId }}
              </div>
            </div>
            
            <!-- Selección de Provincia (filtrada por país) -->
            <div class="col-md-4">
              <label for="cantonProvincia" class="form-label">Provincia *</label>
              <select
                id="cantonProvincia"
                v-model="formData.canton.provinciaId"
                class="form-select"
                :class="{ 'is-invalid': errors.provinciaId }"
                :disabled="!formData.canton.paisId"
                required
              >
                <option value="">{{ formData.canton.paisId ? 'Seleccionar provincia...' : 'Primero seleccione un país' }}</option>
                <option v-for="provincia in filteredProvinciasForCanton" :key="provincia.id" :value="provincia.id">
                  {{ provincia.nombre }}
                </option>
              </select>
              <div v-if="errors.provinciaId" class="invalid-feedback">
                {{ errors.provinciaId }}
              </div>
            </div>
            
            <!-- Nombre del Cantón -->
            <div class="col-md-4">
              <label for="cantonNombre" class="form-label">Nombre del Cantón *</label>
              <input
                id="cantonNombre"
                v-model="formData.canton.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Ej: Quito"
                required
                maxlength="100"
              />
              <div v-if="errors.nombre" class="invalid-feedback">
                {{ errors.nombre }}
              </div>
            </div>
            
            <!-- Información de ayuda -->
            <div class="col-12">
              <div class="alert alert-info d-flex align-items-center mb-3">
                <i class="fas fa-info-circle me-2"></i>
                <small>
                  <strong>Ayuda:</strong> Selecciona primero el país, luego la provincia correspondiente y finalmente ingresa el nombre del cantón.
                </small>
              </div>
            </div>
            
            <div class="col-12">
              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-outline-secondary" @click="cancelForm" :disabled="submitting">
                  <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ submitting ? 'Guardando...' : 'Guardar Cantón' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Formulario de Parroquia -->
      <div v-if="activeForm === 'parroquia'" class="card border-success">
        <div class="card-header bg-success text-white">
          <h6 class="mb-0">
            <i class="fas fa-location-dot me-2"></i>
            Crear Nueva Parroquia
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmitParroquia" class="row g-3">
            <!-- Selección de País -->
            <div class="col-md-3">
              <label for="parroquiaPais" class="form-label">País *</label>
              <select
                id="parroquiaPais"
                v-model="formData.parroquia.paisId"
                class="form-select"
                :class="{ 'is-invalid': errors.paisId }"
                required
                @change="onParroquiaPaisChange"
              >
                <option value="">Seleccionar país...</option>
                <option v-for="pais in paises" :key="pais.id" :value="pais.id">
                  {{ pais.nombre }}
                </option>
              </select>
              <div v-if="errors.paisId" class="invalid-feedback">
                {{ errors.paisId }}
              </div>
            </div>
            
            <!-- Selección de Provincia (filtrada por país) -->
            <div class="col-md-3">
              <label for="parroquiaProvincia" class="form-label">Provincia *</label>
              <select
                id="parroquiaProvincia"
                v-model="formData.parroquia.provinciaId"
                class="form-select"
                :class="{ 'is-invalid': errors.provinciaId }"
                :disabled="!formData.parroquia.paisId"
                required
                @change="onParroquiaProvinciaChange"
              >
                <option value="">{{ formData.parroquia.paisId ? 'Seleccionar provincia...' : 'Primero seleccione un país' }}</option>
                <option v-for="provincia in filteredProvinciasForParroquia" :key="provincia.id" :value="provincia.id">
                  {{ provincia.nombre }}
                </option>
              </select>
              <div v-if="errors.provinciaId" class="invalid-feedback">
                {{ errors.provinciaId }}
              </div>
            </div>
            
            <!-- Selección de Cantón (filtrado por provincia) -->
            <div class="col-md-3">
              <label for="parroquiaCanton" class="form-label">Cantón *</label>
              <select
                id="parroquiaCanton"
                v-model="formData.parroquia.cantonId"
                class="form-select"
                :class="{ 'is-invalid': errors.cantonId }"
                :disabled="!formData.parroquia.provinciaId"
                required
              >
                <option value="">{{ formData.parroquia.provinciaId ? 'Seleccionar cantón...' : 'Primero seleccione una provincia' }}</option>
                <option v-for="canton in filteredCantonesForParroquia" :key="canton.id" :value="canton.id">
                  {{ canton.nombre }}
                </option>
              </select>
              <div v-if="errors.cantonId" class="invalid-feedback">
                {{ errors.cantonId }}
              </div>
            </div>
            
            <!-- Nombre de la Parroquia -->
            <div class="col-md-3">
              <label for="parroquiaNombre" class="form-label">Nombre de la Parroquia *</label>
              <input
                id="parroquiaNombre"
                v-model="formData.parroquia.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Ej: Centro Histórico"
                required
                maxlength="100"
              />
              <div v-if="errors.nombre" class="invalid-feedback">
                {{ errors.nombre }}
              </div>
            </div>
            
            <!-- Información de ayuda -->
            <div class="col-12">
              <div class="alert alert-info d-flex align-items-center mb-3">
                <i class="fas fa-info-circle me-2"></i>
                <small>
                  <strong>Ayuda:</strong> Sigue la jerarquía: País → Provincia → Cantón → Parroquia. Los campos se habilitarán según tu selección.
                </small>
              </div>
            </div>
            
            <div class="col-12">
              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-outline-secondary" @click="cancelForm" :disabled="submitting">
                  <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ submitting ? 'Guardando...' : 'Guardar Parroquia' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Lista de ubicaciones organizadas -->
    <div class="ubicaciones-list">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Cargando ubicaciones...</span>
        </div>
        <p class="mt-2 text-muted">Cargando ubicaciones geográficas...</p>
      </div>

      <!-- Content -->
      <div v-else class="accordion" id="ubicacionesAccordion">
        <!-- Países -->
        <div 
          v-for="pais in paises" 
          :key="pais.id"
          class="accordion-item"
        >
          <h2 class="accordion-header">
            <button 
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="`#pais-${pais.id}`"
            >
              <i class="fas fa-globe me-3 text-primary"></i>
              <strong>{{ pais.nombre }}</strong>
              <span class="badge bg-primary ms-2">
                {{ getProvinciasByPais(pais.id).length }} provincias
              </span>
            </button>
          </h2>
          <div 
            :id="`pais-${pais.id}`"
            class="accordion-collapse collapse"
            data-bs-parent="#ubicacionesAccordion"
          >
            <div class="accordion-body">
              <!-- Provincias del país -->
              <div v-if="getProvinciasByPais(pais.id).length === 0" class="text-muted text-center py-3">
                <i class="fas fa-map me-2"></i>
                No hay provincias registradas para este país
              </div>
              <div v-else class="accordion" :id="`provincias-${pais.id}`">
                <div 
                  v-for="provincia in getProvinciasByPais(pais.id)"
                  :key="provincia.id"
                  class="accordion-item ms-3"
                >
                  <h3 class="accordion-header">
                    <button 
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      :data-bs-target="`#provincia-${provincia.id}`"
                    >
                      <i class="fas fa-map me-3 text-success"></i>
                      {{ provincia.nombre }}
                      <span class="badge bg-success ms-2">
                        {{ getCantonesByProvincia(provincia.id).length }} cantones
                      </span>
                    </button>
                  </h3>
                  <div 
                    :id="`provincia-${provincia.id}`"
                    class="accordion-collapse collapse"
                    :data-bs-parent="`#provincias-${pais.id}`"
                  >
                    <div class="accordion-body">
                      <!-- Cantones de la provincia -->
                      <div v-if="getCantonesByProvincia(provincia.id).length === 0" class="text-muted text-center py-3">
                        <i class="fas fa-map-pin me-2"></i>
                        No hay cantones registrados para esta provincia
                      </div>
                      <div v-else class="accordion" :id="`cantones-${provincia.id}`">
                        <div 
                          v-for="canton in getCantonesByProvincia(provincia.id)"
                          :key="canton.id"
                          class="accordion-item ms-3"
                        >
                          <h4 class="accordion-header">
                            <button 
                              class="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              :data-bs-target="`#canton-${canton.id}`"
                            >
                              <i class="fas fa-map-pin me-3 text-warning"></i>
                              {{ canton.nombre }}
                              <span class="badge bg-warning text-dark ms-2">
                                {{ getParroquiasByCanton(canton.id).length }} parroquias
                              </span>
                            </button>
                          </h4>
                          <div 
                            :id="`canton-${canton.id}`"
                            class="accordion-collapse collapse"
                            :data-bs-parent="`#cantones-${provincia.id}`"
                          >
                            <div class="accordion-body">
                              <!-- Parroquias del cantón -->
                              <div v-if="getParroquiasByCanton(canton.id).length === 0" class="text-muted text-center py-3">
                                <i class="fas fa-location-dot me-2"></i>
                                No hay parroquias registradas para este cantón
                              </div>
                              <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
                                <div 
                                  v-for="parroquia in getParroquiasByCanton(canton.id)"
                                  :key="parroquia.id"
                                  class="col"
                                >
                                  <div class="card card-sm">
                                    <div class="card-body p-2">
                                      <h6 class="card-title mb-1">
                                        <i class="fas fa-location-dot me-2 text-danger"></i>
                                        {{ parroquia.nombre }}
                                      </h6>
                                      <small class="text-muted">ID: {{ parroquia.id }}</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && paises.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="fas fa-map-marker-alt text-muted mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-muted">No hay ubicaciones registradas</h5>
          <p class="text-muted">Comienza agregando el primer país</p>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-if="paises.length > 0" class="stats-footer mt-4 p-3 bg-light rounded">
      <div class="row text-center">
        <div class="col-3">
          <div class="stat-item">
            <h6 class="stat-number text-primary mb-1">{{ paises.length }}</h6>
            <span class="stat-label text-muted small">Países</span>
          </div>
        </div>
        <div class="col-3">
          <div class="stat-item">
            <h6 class="stat-number text-success mb-1">{{ provincias.length }}</h6>
            <span class="stat-label text-muted small">Provincias</span>
          </div>
        </div>
        <div class="col-3">
          <div class="stat-item">
            <h6 class="stat-number text-warning mb-1">{{ cantones.length }}</h6>
            <span class="stat-label text-muted small">Cantones</span>
          </div>
        </div>
        <div class="col-3">
          <div class="stat-item">
            <h6 class="stat-number text-danger mb-1">{{ parroquias.length }}</h6>
            <span class="stat-label text-muted small">Parroquias</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { 
  Pais, 
  Provincia, 
  Canton, 
  Parroquia,
  CreatePaisDTO,
  CreateProvinciaDTO,
  CreateCantonDTO,
  CreateParroquiaDTO
} from '@/types/baseData'

// Props del componente
interface Props {
  paises: Pais[]
  provincias: Provincia[]
  cantones: Canton[]
  parroquias: Parroquia[]
  loading: boolean
}

const props = defineProps<Props>()

// Eventos que emite el componente
const emit = defineEmits<{
  'create-pais': [data: CreatePaisDTO]
  'create-provincia': [data: CreateProvinciaDTO]
  'create-canton': [data: CreateCantonDTO]
  'create-parroquia': [data: CreateParroquiaDTO]
  refresh: []
}>()

// Estado reactivo
const activeForm = ref<'pais' | 'provincia' | 'canton' | 'parroquia' | null>(null)
const submitting = ref(false)

// Datos de formularios
const formData = reactive({
  pais: { nombre: '' },
  provincia: { nombre: '', paisId: null as number | null },
  canton: { 
    nombre: '', 
    paisId: null as number | null,
    provinciaId: null as number | null 
  },
  parroquia: { 
    nombre: '', 
    paisId: null as number | null,
    provinciaId: null as number | null,
    cantonId: null as number | null 
  }
})

// Errores de validación
const errors = reactive<Record<string, string>>({})

// Computed properties para filtrar datos jerárquicos
const getProvinciasByPais = computed(() => (paisId: number) => 
  props.provincias.filter(p => p.paisId === paisId)
)

const getCantonesByProvincia = computed(() => (provinciaId: number) => 
  props.cantones.filter(c => c.provinciaId === provinciaId)
)

const getParroquiasByCanton = computed(() => (cantonId: number) => 
  props.parroquias.filter(p => p.cantonId === cantonId)
)

// Computed properties para formularios jerárquicos
const filteredProvinciasForCanton = computed(() => 
  formData.canton.paisId ? props.provincias.filter(p => p.paisId === formData.canton.paisId) : []
)

const filteredProvinciasForParroquia = computed(() => 
  formData.parroquia.paisId ? props.provincias.filter(p => p.paisId === formData.parroquia.paisId) : []
)

const filteredCantonesForParroquia = computed(() => 
  formData.parroquia.provinciaId ? props.cantones.filter(c => c.provinciaId === formData.parroquia.provinciaId) : []
)

/**
 * Muestra el formulario correspondiente
 */
function showForm(type: 'pais' | 'provincia' | 'canton' | 'parroquia'): void {
  resetForm()
  activeForm.value = type
}

/**
 * Cancela el formulario activo
 */
function cancelForm(): void {
  resetForm()
  activeForm.value = null
}

/**
 * Resetea todos los formularios y errores
 */
function resetForm(): void {
  formData.pais.nombre = ''
  formData.provincia.nombre = ''
  formData.provincia.paisId = null
  formData.canton.nombre = ''
  formData.canton.paisId = null
  formData.canton.provinciaId = null
  formData.parroquia.nombre = ''
  formData.parroquia.paisId = null
  formData.parroquia.provinciaId = null
  formData.parroquia.cantonId = null
  
  Object.keys(errors).forEach(key => delete errors[key])
}

/**
 * Valida el formulario según el tipo activo
 */
function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key])
  let isValid = true

  if (activeForm.value === 'pais') {
    if (!formData.pais.nombre.trim()) {
      errors.nombre = 'El nombre del país es requerido'
      isValid = false
    }
  } else if (activeForm.value === 'provincia') {
    if (!formData.provincia.paisId) {
      errors.paisId = 'Debe seleccionar un país'
      isValid = false
    }
    if (!formData.provincia.nombre.trim()) {
      errors.nombre = 'El nombre de la provincia es requerido'
      isValid = false
    }
  } else if (activeForm.value === 'canton') {
    if (!formData.canton.paisId) {
      errors.paisId = 'Debe seleccionar un país'
      isValid = false
    }
    if (!formData.canton.provinciaId) {
      errors.provinciaId = 'Debe seleccionar una provincia'
      isValid = false
    }
    if (!formData.canton.nombre.trim()) {
      errors.nombre = 'El nombre del cantón es requerido'
      isValid = false
    }
  } else if (activeForm.value === 'parroquia') {
    if (!formData.parroquia.paisId) {
      errors.paisId = 'Debe seleccionar un país'
      isValid = false
    }
    if (!formData.parroquia.provinciaId) {
      errors.provinciaId = 'Debe seleccionar una provincia'
      isValid = false
    }
    if (!formData.parroquia.cantonId) {
      errors.cantonId = 'Debe seleccionar un cantón'
      isValid = false
    }
    if (!formData.parroquia.nombre.trim()) {
      errors.nombre = 'El nombre de la parroquia es requerido'
      isValid = false
    }
  }

  return isValid
}

/**
 * Maneja el envío del formulario de país
 */
async function handleSubmitPais(): Promise<void> {
  if (!validateForm()) return

  try {
    submitting.value = true
    emit('create-pais', { nombre: formData.pais.nombre.trim() })
    cancelForm()
  } finally {
    submitting.value = false
  }
}

/**
 * Maneja el envío del formulario de provincia
 */
async function handleSubmitProvincia(): Promise<void> {
  if (!validateForm()) return

  try {
    submitting.value = true
    emit('create-provincia', {
      nombre: formData.provincia.nombre.trim(),
      paisId: formData.provincia.paisId!
    })
    cancelForm()
  } finally {
    submitting.value = false
  }
}

/**
 * Maneja el envío del formulario de cantón
 */
async function handleSubmitCanton(): Promise<void> {
  if (!validateForm()) return

  try {
    submitting.value = true
    emit('create-canton', {
      nombre: formData.canton.nombre.trim(),
      provinciaId: formData.canton.provinciaId!
    })
    cancelForm()
  } finally {
    submitting.value = false
  }
}

/**
 * Maneja el envío del formulario de parroquia
 */
async function handleSubmitParroquia(): Promise<void> {
  if (!validateForm()) return

  try {
    submitting.value = true
    emit('create-parroquia', {
      nombre: formData.parroquia.nombre.trim(),
      cantonId: formData.parroquia.cantonId!
    })
    cancelForm()
  } finally {
    submitting.value = false
  }
}

/**
 * Maneja el cambio de país en el formulario de cantón
 */
function onCantonPaisChange(): void {
  // Resetear la provincia seleccionada cuando cambia el país
  formData.canton.provinciaId = null
  // Limpiar errores relacionados
  delete errors.provinciaId
}

/**
 * Maneja el cambio de país en el formulario de parroquia
 */
function onParroquiaPaisChange(): void {
  // Resetear provincia y cantón cuando cambia el país
  formData.parroquia.provinciaId = null
  formData.parroquia.cantonId = null
  // Limpiar errores relacionados
  delete errors.provinciaId
  delete errors.cantonId
}

/**
 * Maneja el cambio de provincia en el formulario de parroquia
 */
function onParroquiaProvinciaChange(): void {
  // Resetear el cantón seleccionado cuando cambia la provincia
  formData.parroquia.cantonId = null
  // Limpiar errores relacionados
  delete errors.cantonId
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

.accordion-button {
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
}

.accordion-body {
  padding: 1rem;
}

.card-sm .card-body {
  padding: 0.5rem;
}

.stat-item {
  padding: 0.5rem;
}

.stat-number {
  font-weight: 700;
}

.stat-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-state {
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch !important;
    gap: 1rem;
  }
  
  .accordion-item.ms-3 {
    margin-left: 0.5rem !important;
  }
}
</style>
