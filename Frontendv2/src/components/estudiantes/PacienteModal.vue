<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container paciente-modal" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar paciente' : 'Crear nuevo paciente' }}</h2>
            <button class="btn-close" @click="handleClose" aria-label="Cerrar">×</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="form-container">
              <!-- Sección 1: Datos personales -->
              <div class="form-section">
                <h3>👤 Datos personales</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="nombre">Nombre *</label>
                    <input
                      id="nombre"
                      v-model="formData.nombre"
                      type="text"
                      placeholder="Juan"
                      required
                    />
                    <small v-if="errors.nombre" class="error-text">{{ errors.nombre }}</small>
                  </div>

                  <div class="form-group">
                    <label for="apellido">Apellido *</label>
                    <input
                      id="apellido"
                      v-model="formData.apellido"
                      type="text"
                      placeholder="Pérez"
                      required
                    />
                    <small v-if="errors.apellido" class="error-text">{{ errors.apellido }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="email">Email</label>
                    <input
                      id="email"
                      v-model="formData.email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                    />
                    <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
                  </div>

                  <div class="form-group">
                    <label for="fechaNacimiento">Fecha de nacimiento *</label>
                    <input
                      id="fechaNacimiento"
                      v-model="formData.fechaNacimiento"
                      type="date"
                      required
                    />
                    <small v-if="errors.fechaNacimiento" class="error-text">{{ errors.fechaNacimiento }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="genero">Género</label>
                    <select id="genero" v-model="formData.genero">
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="Nacionalidad">Nacionalidad</label>
                    <input
                      id="Nacionalidad"
                      v-model="formData.Nacionalidad"
                      type="text"
                      placeholder="Ecuatoriano"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      v-model="formData.telefono"
                      type="tel"
                      placeholder="0999999999"
                    />
                  </div>

                  <div class="form-group">
                    <label for="estadoCivil">Estado civil</label>
                    <select id="estadoCivil" v-model="formData.estadoCivil">
                      <option value="">Seleccionar...</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                      <option value="Unión libre">Unión libre</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full-width">
                    <label for="direccion">Dirección</label>
                    <input
                      id="direccion"
                      v-model="formData.direccion"
                      type="text"
                      placeholder="Calle Principal 123"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="ocupacion">Ocupación</label>
                    <input
                      id="ocupacion"
                      v-model="formData.ocupacion"
                      type="text"
                      placeholder="Ingeniero"
                    />
                  </div>

                  <div class="form-group">
                    <label for="EmpresaLaboral">Empresa laboral</label>
                    <input
                      id="EmpresaLaboral"
                      v-model="formData.EmpresaLaboral"
                      type="text"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                </div>
              </div>

              <!-- Sección 2: Documento -->
              <div class="form-section">
                <h3>🆔 Información de documento</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label for="tipoDocumento">Tipo de documento *</label>
                    <select id="tipoDocumento" v-model="formData.tipoDocumento" required>
                      <option value="">Seleccionar...</option>
                      <option value="CEDULA">Cédula de ciudadanía</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUC">RUC</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    <small v-if="errors.tipoDocumento" class="error-text">{{ errors.tipoDocumento }}</small>
                  </div>

                  <div class="form-group">
                    <label for="numeroDocumento">Número de documento *</label>
                    <input
                      id="numeroDocumento"
                      v-model="formData.numeroDocumento"
                      type="text"
                      placeholder="1712345678"
                      required
                    />
                    <small v-if="errors.numeroDocumento" class="error-text">{{ errors.numeroDocumento }}</small>
                  </div>
                </div>
              </div>

              <!-- Sección 3: Parroquia -->
              <div class="form-section">
                <h3>📍 Ubicación</h3>

                <div class="form-row">
                  <div class="form-group full-width">
                    <label for="parroquiaSearch">Buscar parroquia *</label>
                    <div class="parroquias-search-wrapper">
                      <input
                        id="parroquiaSearch"
                        v-model="parroquiaSearchTerm"
                        type="text"
                        placeholder="Buscar por nombre de parroquia..."
                        class="parroquias-search-input"
                        @input="handleSearchParroquias"
                      />
                      
                      <div v-if="showParroquiasResults" class="parroquias-results">
                        <div
                          v-for="pq in searchResults"
                          :key="pq.id"
                          class="parroquias-result-item"
                          @click="handleSelectParroquia(pq)"
                        >
                          <div class="parroquias-result-main">{{ pq.nombre }}</div>
                          <div class="parroquias-result-meta">
                            <span>{{ pq.canton?.nombre }}</span>
                            <span>{{ pq.canton?.provincia?.nombre }}</span>
                            <span>{{ pq.canton?.provincia?.pais?.nombre }}</span>
                          </div>
                        </div>
                        
                        <div v-if="searchResults.length === 0 && parroquiaSearchTerm.length >= 2" class="parroquias-no-results">
                          No se encontraron parroquias
                        </div>
                      </div>
                    </div>
                    <small v-if="errors.parroquiaId" class="error-text">{{ errors.parroquiaId }}</small>
                  </div>
                </div>

                <!-- Información de ubicación seleccionada -->
                <div v-if="selectedParroquiaData" class="parroquias-location-display">
                  <div class="parroquias-location-item">
                    <label>País</label>
                    <span>{{ selectedParroquiaData.canton?.provincia?.pais?.nombre || '-' }}</span>
                  </div>
                  <div class="parroquias-location-item">
                    <label>Provincia</label>
                    <span>{{ selectedParroquiaData.canton?.provincia?.nombre || '-' }}</span>
                  </div>
                  <div class="parroquias-location-item">
                    <label>Cantón</label>
                    <span>{{ selectedParroquiaData.canton?.nombre || '-' }}</span>
                  </div>
                  <div class="parroquias-location-item">
                    <label>Parroquia</label>
                    <span>{{ selectedParroquiaData.nombre }}</span>
                  </div>
                </div>
              </div>

              <!-- Sección 4: Datos del representante (Opcional) -->
              <div class="form-section">
                <h3>👨‍👩‍👧 Datos del representante (Opcional)</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label for="representante">Nombre del representante</label>
                    <input
                      id="representante"
                      v-model="formData.representante"
                      type="text"
                      placeholder="Juan García"
                    />
                  </div>

                  <div class="form-group">
                    <label for="relacionRep">Relación</label>
                    <input
                      id="relacionRep"
                      v-model="formData.relacionRep"
                      type="text"
                      placeholder="Padre / Madre / Tutor"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="telefonoRep">Teléfono del representante</label>
                    <input
                      id="telefonoRep"
                      v-model="formData.telefonoRep"
                      type="tel"
                      placeholder="0999999999"
                    />
                  </div>

                  <div class="form-group">
                    <label for="tipoDocumentoRep">Tipo de documento rep.</label>
                    <select id="tipoDocumentoRep" v-model="formData.tipoDocumentoRep">
                      <option value="">Seleccionar...</option>
                      <option value="CEDULA">Cédula de ciudadanía</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUC">RUC</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full-width">
                    <label for="numero_documento_rep">Número de documento del representante</label>
                    <input
                      id="numero_documento_rep"
                      v-model="formData.numero_documento_rep"
                      type="text"
                      placeholder="1712345678"
                    />
                  </div>
                </div>
              </div>

              <!-- Estados -->
              <div v-if="submitting" class="loading-state">
                <div class="loading-spinner-small"></div>
                <p>{{ isEditing ? 'Actualizando paciente...' : 'Creando paciente...' }}</p>
              </div>

              <!-- Errores generales -->
              <div v-if="generalError" class="error-banner">
                <p>{{ generalError }}</p>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              @click="handleClose"
              :disabled="submitting"
            >
              Cancelar
            </button>

            <button
              class="btn btn-primary"
              @click="handleSubmit"
              :disabled="submitting"
            >
              {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar paciente' : 'Crear paciente') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import { useParroquiasSearch } from '@/composables/useParroquiasSearch'
import { getErrorMessage } from '@/utils/errorHandler'
import { apiClient } from '@/Config/api'
import type {
  TipoDocumentoPaciente,
  TipoDocumentoRepresentante,
  Paciente
} from '@/types/pacientes.types'
import '@/assets/styles/Profesor/components/PacienteModal.css'

interface Props {
  isOpen: boolean
  paciente?: Paciente | null
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  paciente: null
})
const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.paciente)

const {
  parroquiaSearchTerm,
  parroquiasResultados: searchResults,
  showParroquiasResults,
  selectedParroquiaData,
  handleSearchParroquias,
  selectParroquia,
  loadParroquiaActual,
  reset: resetParroquiasSearch,
} = useParroquiasSearch()

// Formulario reactivo
const formData = reactive({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  genero: '',
  Nacionalidad: '',
  parroquiaId: 0 as number | null,
  tipoDocumento: '' as TipoDocumentoPaciente | '',
  numeroDocumento: '',
  EmpresaLaboral: '',
  estadoCivil: '',
  ocupacion: '',
  relacionRep: '',
  representante: '',
  telefonoRep: '',
  numero_documento_rep: '',
  tipoDocumentoRep: '' as TipoDocumentoRepresentante | ''
})

const errors = reactive({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  tipoDocumento: '',
  numeroDocumento: '',
  parroquiaId: ''
})

const submitting = ref(false)
const generalError = ref<string | null>(null)

// Cargar parroquias iniciales al abrir el modal (no se usa dropdown, pero podría ser útil)
onMounted(async () => {
  // No necesitamos cargar todas las parroquias, haremos búsqueda bajo demanda
})

// Cargar datos del paciente cuando cambia el prop
watch(
  () => props.paciente,
  (newPaciente) => {
    if (props.isOpen) {
      if (newPaciente) {
        loadPacienteData()
      } else {
        resetForm()
      }
    }
  },
  { deep: true }
)

// Cargar datos del paciente si está editando
const loadPacienteData = async () => {
  if (props.paciente) {
    formData.nombre = props.paciente.nombre
    formData.apellido = props.paciente.apellido
    formData.email = props.paciente.email || ''
    // Extraer solo la fecha (YYYY-MM-DD) para el input de tipo date
    formData.fechaNacimiento = props.paciente.fechaNacimiento?.split('T')[0] || ''
    formData.telefono = props.paciente.telefono || ''
    formData.direccion = props.paciente.direccion || ''
    formData.genero = props.paciente.genero || ''
    formData.Nacionalidad = props.paciente.Nacionalidad || ''
    formData.parroquiaId = props.paciente.parroquiaId || null
    formData.tipoDocumento = (props.paciente.tipoDocumento as TipoDocumentoPaciente) || ''
    formData.numeroDocumento = props.paciente.numeroDocumento
    formData.EmpresaLaboral = props.paciente.EmpresaLaboral || ''
    formData.estadoCivil = props.paciente.estadoCivil || ''
    formData.ocupacion = props.paciente.ocupacion || ''
    formData.relacionRep = props.paciente.relacionRep || ''
    formData.representante = props.paciente.representante || ''
    formData.telefonoRep = props.paciente.telefonoRep || ''
    formData.numero_documento_rep = props.paciente.numero_documento_rep || ''
    formData.tipoDocumentoRep = (props.paciente.tipoDocumentoRep as TipoDocumentoRepresentante) || ''
    
    // Si tiene parroquiaId, cargar la información de la parroquia
    if (props.paciente.parroquiaId && props.paciente.parroquia?.nombre) {
      await loadParroquiaActual(props.paciente.parroquiaId, props.paciente.parroquia.nombre)
    }
  }
}

// Envolvente para selectParroquia que actualiza formData
const handleSelectParroquia = (parroquia: any) => {
  selectParroquia(parroquia)
  formData.parroquiaId = parroquia.id
}

// Validar formulario
const validateForm = (): boolean => {
  let isValid = true
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  if (!formData.nombre || formData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  }

  if (!formData.apellido || formData.apellido.trim().length < 2) {
    errors.apellido = 'El apellido debe tener al menos 2 caracteres'
    isValid = false
  }

  if (formData.email && !formData.email.includes('@')) {
    errors.email = 'Por favor ingresa un email válido'
    isValid = false
  }

  if (!formData.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    isValid = false
  }

  if (!formData.tipoDocumento) {
    errors.tipoDocumento = 'Selecciona un tipo de documento'
    isValid = false
  }

  if (!formData.numeroDocumento || formData.numeroDocumento.length < 8) {
    errors.numeroDocumento = 'El número de documento debe tener al menos 8 caracteres'
    isValid = false
  }

  if (!formData.parroquiaId) {
    errors.parroquiaId = 'Selecciona una parroquia'
    isValid = false
  }

  return isValid
}

// Enviar formulario
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    submitting.value = true
    generalError.value = null

    // Ajustar fecha para evitar offset de timezone
    const fechaInput = formData.fechaNacimiento
    const fechaAjustada = new Date(fechaInput + 'T00:00:00Z').toISOString().split('T')[0]

    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim() || undefined,
      fechaNacimiento: fechaAjustada,
      telefono: formData.telefono.trim() || undefined,
      direccion: formData.direccion.trim() || undefined,
      genero: formData.genero || undefined,
      Nacionalidad: formData.Nacionalidad || undefined,
      parroquiaId: formData.parroquiaId!,
      tipoDocumento: formData.tipoDocumento as TipoDocumentoPaciente,
      numeroDocumento: formData.numeroDocumento.trim(),
      EmpresaLaboral: formData.EmpresaLaboral || undefined,
      estadoCivil: formData.estadoCivil || undefined,
      ocupacion: formData.ocupacion || undefined,
      relacionRep: formData.relacionRep || undefined,
      representante: formData.representante || undefined,
      telefonoRep: formData.telefonoRep || undefined,
      numero_documento_rep: formData.numero_documento_rep || undefined,
      tipoDocumentoRep: (formData.tipoDocumentoRep || undefined) as TipoDocumentoRepresentante | undefined
    } as const

    if (isEditing.value && props.paciente) {
      await pacientesService.update(props.paciente.id, payload as any)
    } else {
      await pacientesService.create(payload as any)
    }

    emit('success')
    handleClose()
  } catch (error) {
    generalError.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

// Cerrar modal
const handleClose = () => {
  if (!submitting.value) {
    resetForm()
    emit('close')
  }
}

// Resetear formulario
const resetForm = () => {
  formData.nombre = ''
  formData.apellido = ''
  formData.email = ''
  formData.fechaNacimiento = ''
  formData.telefono = ''
  formData.direccion = ''
  formData.genero = ''
  formData.Nacionalidad = ''
  formData.parroquiaId = null
  formData.tipoDocumento = ''
  formData.numeroDocumento = ''
  formData.EmpresaLaboral = ''
  formData.estadoCivil = ''
  formData.ocupacion = ''
  formData.relacionRep = ''
  formData.representante = ''
  formData.telefonoRep = ''
  formData.numero_documento_rep = ''
  formData.tipoDocumentoRep = ''
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  generalError.value = null
  resetParroquiasSearch()
}
</script>
