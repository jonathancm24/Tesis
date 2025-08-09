<!-- src/components/secretary/PatientForm.vue -->
<template>
  <div class="patient-form">
    <h3>{{ editMode ? 'Editar Paciente' : 'Registrar Paciente' }}</h3>
    
    <form @submit.prevent="submitForm">
      <!-- Información Personal -->
      <fieldset class="fieldset">
        <legend>Información Personal</legend>
        
        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input 
              id="nombre"
              v-model="form.nombre" 
              type="text" 
              required 
              :class="{ error: errors.nombre }"
            />
            <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
          </div>
          
          <div class="form-group">
            <label for="apellido">Apellido *</label>
            <input 
              id="apellido"
              v-model="form.apellido" 
              type="text" 
              required 
              :class="{ error: errors.apellido }"
            />
            <span v-if="errors.apellido" class="error-text">{{ errors.apellido }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="fechaNacimiento">Fecha de Nacimiento *</label>
            <input 
              id="fechaNacimiento"
              v-model="form.fechaNacimiento" 
              type="date" 
              required 
              :class="{ error: errors.fechaNacimiento }"
            />
            <span v-if="errors.fechaNacimiento" class="error-text">{{ errors.fechaNacimiento }}</span>
          </div>
          
          <div class="form-group">
            <label for="genero">Género</label>
            <select id="genero" v-model="form.genero">
              <option value="">Seleccionar...</option>
              <option v-for="genero in Generos" :key="genero" :value="genero">
                {{ genero }}
              </option>
            </select>
          </div>
        </div>
      </fieldset>

      <!-- Información de Documento -->
      <fieldset class="fieldset">
        <legend>Documento de Identidad</legend>
        
        <div class="form-row">
          <div class="form-group">
            <label for="tipoDocumento">Tipo de Documento *</label>
            <select 
              id="tipoDocumento" 
              v-model="form.tipoDocumento" 
              required 
              :class="{ error: errors.tipoDocumento }"
            >
              <option value="">Seleccionar...</option>
              <option 
                v-for="(label, value) in TipoDocumentoLabels" 
                :key="value" 
                :value="value"
              >
                {{ label }}
              </option>
            </select>
            <span v-if="errors.tipoDocumento" class="error-text">{{ errors.tipoDocumento }}</span>
          </div>
          
          <div class="form-group">
            <label for="numeroDocumento">Número de Documento *</label>
            <input 
              id="numeroDocumento"
              v-model="form.numeroDocumento" 
              type="text" 
              required 
              :placeholder="getDocumentPlaceholder(form.tipoDocumento)"
              :class="{ error: errors.numeroDocumento }"
              @blur="validateDocument"
            />
            <span v-if="errors.numeroDocumento" class="error-text">{{ errors.numeroDocumento }}</span>
          </div>
        </div>
      </fieldset>

      <!-- Información de Contacto -->
      <fieldset class="fieldset">
        <legend>Información de Contacto</legend>
        
        <div class="form-row">
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input 
              id="telefono"
              v-model="form.telefono" 
              type="tel" 
              placeholder="0999999999"
              :class="{ error: errors.telefono }"
            />
            <span v-if="errors.telefono" class="error-text">{{ errors.telefono }}</span>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="form.email" 
              type="email" 
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="direccion">Dirección</label>
          <textarea 
            id="direccion"
            v-model="form.direccion" 
            rows="2"
            placeholder="Dirección completa"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="parroquiaId">Parroquia *</label>
          <AutocompleteParroquia 
            v-model="form.parroquiaId"
            :error="errors.parroquiaId"
            @update:modelValue="clearError('parroquiaId')"
          />
          <span v-if="errors.parroquiaId" class="error-text">{{ errors.parroquiaId }}</span>
        </div>
      </fieldset>

      <!-- Información Adicional -->
      <fieldset class="fieldset">
        <legend>Información Adicional</legend>
        
        <div class="form-row">
          <div class="form-group">
            <label for="nacionalidad">Nacionalidad</label>
            <input 
              id="nacionalidad"
              v-model="form.Nacionalidad" 
              type="text" 
              placeholder="Ecuatoriana"
            />
          </div>
          
          <div class="form-group">
            <label for="estadoCivil">Estado Civil</label>
            <select id="estadoCivil" v-model="form.estadoCivil">
              <option value="">Seleccionar...</option>
              <option v-for="estado in EstadosCiviles" :key="estado" :value="estado">
                {{ estado }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="ocupacion">Ocupación</label>
            <input 
              id="ocupacion"
              v-model="form.ocupacion" 
              type="text" 
              placeholder="Profesión u ocupación"
            />
          </div>
          
          <div class="form-group">
            <label for="empresaLaboral">Empresa/Lugar de Trabajo</label>
            <input 
              id="empresaLaboral"
              v-model="form.EmpresaLaboral" 
              type="text" 
              placeholder="Lugar de trabajo"
            />
          </div>
        </div>
      </fieldset>

      <!-- Información del Representante -->
      <fieldset class="fieldset">
        <legend>
          Información del Representante 
          <small>(Para menores de edad o cuando sea necesario)</small>
        </legend>
        
        <div class="form-group">
          <label for="representante">Nombre del Representante</label>
          <input 
            id="representante"
            v-model="form.representante" 
            type="text" 
            placeholder="Nombre completo del representante"
          />
        </div>

        <div class="form-row" v-if="form.representante">
          <div class="form-group">
            <label for="tipoDocumentoRep">Tipo de Documento del Representante</label>
            <select 
              id="tipoDocumentoRep" 
              v-model="form.tipoDocumentoRep"
            >
              <option value="">Seleccionar...</option>
              <option 
                v-for="(label, value) in TipoDocumentoRepresentanteLabels" 
                :key="value" 
                :value="value"
              >
                {{ label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="numeroDocumentoRep">Número de Documento del Representante</label>
            <input 
              id="numeroDocumentoRep"
              v-model="form.numeroDocumentoRep" 
              type="text" 
              :placeholder="getDocumentPlaceholder(form.tipoDocumentoRep || 'CEDULA')"
              :class="{ error: errors.numeroDocumentoRep }"
            />
            <span v-if="errors.numeroDocumentoRep" class="error-text">{{ errors.numeroDocumentoRep }}</span>
          </div>
        </div>

        <div class="form-row" v-if="form.representante">
          <div class="form-group">
            <label for="relacionRep">Relación con el Paciente</label>
            <select id="relacionRep" v-model="form.relacionRep">
              <option value="">Seleccionar...</option>
              <option v-for="relacion in RelacionesRepresentante" :key="relacion" :value="relacion">
                {{ relacion }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="telefonoRep">Teléfono del Representante</label>
            <input 
              id="telefonoRep"
              v-model="form.telefonoRep" 
              type="tel" 
              placeholder="0999999999"
              :class="{ error: errors.telefonoRep }"
            />
            <span v-if="errors.telefonoRep" class="error-text">{{ errors.telefonoRep }}</span>
          </div>
        </div>
      </fieldset>

      <!-- Botones -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          Limpiar
        </button>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Registrar') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { RegistroPaciente } from '@/types/patient'
import { 
  TipoDocumento, 
  TipoDocumentoRepresentante,
  TipoDocumentoLabels, 
  TipoDocumentoRepresentanteLabels,
  Generos, 
  EstadosCiviles, 
  RelacionesRepresentante 
} from '@/types/patient'
import { validateCedula, validateRUC } from '@/utils/validators'
import AutocompleteParroquia from '@/components/common/AutocompleteParroquia.vue'

// Props
interface Props {
  editMode?: boolean
  initialData?: Partial<RegistroPaciente>
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false,
  initialData: () => ({})
})

// Emits
const emit = defineEmits<{
  submit: [data: RegistroPaciente]
  cancel: []
}>()

// Estado del formulario
const form = reactive<RegistroPaciente>({
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  tipoDocumento: TipoDocumento.CEDULA,
  numeroDocumento: '',
  parroquiaId: 0,
  telefono: '',
  direccion: '',
  genero: '',
  Nacionalidad: 'Ecuatoriana',
  email: '',
  estadoCivil: '',
  ocupacion: '',
  EmpresaLaboral: '',
  representante: '',
  tipoDocumentoRep: undefined,
  numeroDocumentoRep: '',
  relacionRep: '',
  telefonoRep: '',
  ...props.initialData
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)

// Métodos de validación
const validateDocument = () => {
  if (!form.numeroDocumento) return

  switch (form.tipoDocumento) {
    case TipoDocumento.CEDULA:
      if (!validateCedula(form.numeroDocumento)) {
        errors.numeroDocumento = 'Cédula ecuatoriana inválida'
      } else {
        clearError('numeroDocumento')
      }
      break
    case TipoDocumento.RUC:
      if (!validateRUC(form.numeroDocumento)) {
        errors.numeroDocumento = 'RUC inválido'
      } else {
        clearError('numeroDocumento')
      }
      break
    case TipoDocumento.PASAPORTE:
      if (form.numeroDocumento.length < 6 || form.numeroDocumento.length > 20) {
        errors.numeroDocumento = 'El pasaporte debe tener entre 6 y 20 caracteres'
      } else {
        clearError('numeroDocumento')
      }
      break
    case TipoDocumento.OTRO:
      if (form.numeroDocumento.length < 5) {
        errors.numeroDocumento = 'El documento debe tener al menos 5 caracteres'
      } else {
        clearError('numeroDocumento')
      }
      break
  }
}

const getDocumentPlaceholder = (tipoDocumento: string): string => {
  switch (tipoDocumento) {
    case TipoDocumento.CEDULA:
      return '1234567890'
    case TipoDocumento.RUC:
      return '1234567890001'
    case TipoDocumento.PASAPORTE:
      return 'ABC123456'
    case TipoDocumento.OTRO:
      return 'Número de documento'
    default:
      return 'Número de documento'
  }
}

const clearError = (field: string) => {
  delete errors[field]
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  // Validaciones requeridas
  if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
  if (!form.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
  if (!form.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'
  if (!form.tipoDocumento) newErrors.tipoDocumento = 'El tipo de documento es requerido'
  if (!form.numeroDocumento.trim()) newErrors.numeroDocumento = 'El número de documento es requerido'
  if (!form.parroquiaId) newErrors.parroquiaId = 'La parroquia es requerida'

  // Validación del email si se proporciona
  if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = 'Email inválido'
  }

  // Validación del teléfono si se proporciona
  if (form.telefono && !/^[0-9]{9,10}$/.test(form.telefono)) {
    newErrors.telefono = 'El teléfono debe tener 9 o 10 dígitos'
  }

  // Validación del teléfono del representante si se proporciona
  if (form.telefonoRep && !/^[0-9]{9,10}$/.test(form.telefonoRep)) {
    newErrors.telefonoRep = 'El teléfono debe tener 9 o 10 dígitos'
  }

  // Validación del documento del representante si se proporciona
  if (form.representante && form.numeroDocumentoRep && form.tipoDocumentoRep) {
    switch (form.tipoDocumentoRep) {
      case TipoDocumentoRepresentante.CEDULA:
        if (!validateCedula(form.numeroDocumentoRep)) {
          newErrors.numeroDocumentoRep = 'Cédula del representante inválida'
        }
        break
      case TipoDocumentoRepresentante.RUC:
        if (!validateRUC(form.numeroDocumentoRep)) {
          newErrors.numeroDocumentoRep = 'RUC del representante inválido'
        }
        break
      case TipoDocumentoRepresentante.PASAPORTE:
        if (form.numeroDocumentoRep.length < 6 || form.numeroDocumentoRep.length > 20) {
          newErrors.numeroDocumentoRep = 'El pasaporte debe tener entre 6 y 20 caracteres'
        }
        break
      case TipoDocumentoRepresentante.OTRO:
        if (form.numeroDocumentoRep.length < 5) {
          newErrors.numeroDocumentoRep = 'El documento debe tener al menos 5 caracteres'
        }
        break
    }
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    emit('submit', { ...form })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: '',
    parroquiaId: 0,
    telefono: '',
    direccion: '',
    genero: '',
    Nacionalidad: 'Ecuatoriana',
    email: '',
    estadoCivil: '',
    ocupacion: '',
    EmpresaLaboral: '',
    representante: '',
    tipoDocumentoRep: undefined,
    numeroDocumentoRep: '',
    relacionRep: '',
    telefonoRep: ''
  })
  Object.keys(errors).forEach(key => delete errors[key])
}

// Watchers
watch(() => form.tipoDocumento, () => {
  clearError('numeroDocumento')
  if (form.numeroDocumento) {
    validateDocument()
  }
})

watch(() => form.representante, (newValue) => {
  if (!newValue) {
    form.tipoDocumentoRep = undefined
    form.numeroDocumentoRep = ''
    form.relacionRep = ''
    form.telefonoRep = ''
  }
})
</script>

<style scoped>
.patient-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

h3 {
  margin-bottom: 1.5rem;
  color: #2e7d32;
  font-size: 1.5rem;
  text-align: center;
}

.fieldset {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: #fafafa;
}

.fieldset legend {
  font-weight: 600;
  color: #2e7d32;
  padding: 0 0.5rem;
  background: white;
  border-radius: 4px;
}

.fieldset legend small {
  font-weight: normal;
  color: #666;
  font-style: italic;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.1);
}

input.error,
select.error {
  border-color: #d32f2f;
  background: #ffeaea;
}

.error-text {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background: #2e7d32;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1b5e20;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
  color: #333;
}

/* Responsive design */
@media (max-width: 768px) {
  .patient-form {
    padding: 1rem;
    margin: 0 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .fieldset {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
