<!-- src/components/admin/UserForm.vue -->
<template>
  <form @submit.prevent="onSubmit" class="user-form row g-3">
    <!-- Nombre -->
    <div class="col-12 col-md-6">
      <FormField
        label="Nombre"
        :error="getFieldError('nombre')"
        :required="true"
      >
        <input
          v-model="local.nombre"
          type="text"
          :class="getFieldClass('nombre')"
          placeholder="Ingrese nombre"
          @blur="validateField('nombre', local.nombre, nameRules)"
        />
      </FormField>
    </div>

    <!-- Apellido -->
    <div class="col-12 col-md-6">
      <FormField
        label="Apellido"
        :error="getFieldError('apellido')"
        :required="true"
      >
        <input
          v-model="local.apellido"
          type="text"
          :class="getFieldClass('apellido')"
          placeholder="Ingrese apellido"
          @blur="validateField('apellido', local.apellido, nameRules)"
        />
      </FormField>
    </div>

    <!-- Email -->
    <div class="col-12 col-md-6">
      <FormField
        label="Email"
        :error="getFieldError('email')"
        :isValidating="asyncValidating.email"
        :required="true"
      >
        <input
          v-model="local.email"
          type="email"
          :class="getFieldClass('email')"
          placeholder="usuario@dominio.com"
          @input="onEmailInput"
          @blur="validateField('email', local.email, emailRules)"
        />
      </FormField>
    </div>

    <!-- Tipo de Documento -->
    <div class="col-12 col-md-6">
      <FormField
        label="Tipo de Documento"
        :error="getFieldError('tipoDocumento')"
        :required="true"
      >
        <select
          v-model="local.tipoDocumento"
          :class="getFieldClass('tipoDocumento')"
          @change="onDocumentTypeChange"
          @blur="validateField('tipoDocumento', local.tipoDocumento, documentTypeRules)"
        >
          <option value="">Seleccione tipo...</option>
          <option value="CEDULA">Cédula Ecuatoriana</option>
          <option value="PASAPORTE">Pasaporte</option>
          <option value="RUC">RUC</option>
          <option value="OTRO">Otro Documento</option>
        </select>
      </FormField>
    </div>

    <!-- Número de Documento -->
    <div class="col-12 col-md-6">
      <FormField
        :label="getDocumentoLabel(local.tipoDocumento)"
        :error="getFieldError('numeroDocumento')"
        :isValidating="asyncValidating.numeroDocumento"
        :required="true"
      >
        <input
          v-model="local.numeroDocumento"
          type="text"
          :class="getFieldClass('numeroDocumento')"
          :placeholder="getDocumentoPlaceholder(local.tipoDocumento)"
          @input="onDocumentInput"
          @blur="validateField('numeroDocumento', local.numeroDocumento, getDocumentRules())"
        />
      </FormField>
    </div>

    <!-- Fecha de Nacimiento -->
    <div class="col-12 col-md-6">
      <FormField
        label="Fecha de Nacimiento"
        :error="getFieldError('fechaNacimiento')"
        :required="true"
      >
        <input
          v-model="local.fechaNacimiento"
          type="date"
          :class="getFieldClass('fechaNacimiento')"
          @blur="validateField('fechaNacimiento', local.fechaNacimiento, dateRules)"
        />
      </FormField>
    </div>

    <!-- Contraseña -->
    <div class="col-12 col-md-6">
      <FormField
        label="Contraseña"
        :error="getFieldError('password')"
        :required="!editMode"
        :helpText="editMode ? 'Deja en blanco para mantener la contraseña actual.' : ''"
      >
        <input
          v-model="local.password"
          type="password"
          :class="getFieldClass('password')"
          placeholder="Mínimo 6 caracteres"
          @blur="validateField('password', local.password, getPasswordRules())"
        />
      </FormField>
    </div>

    <!-- Rol -->
    <div class="col-12 col-md-6">
      <FormField
        label="Rol"
        :error="getFieldError('role')"
        :required="true"
      >
        <select
          v-model="local.role"
          :class="getFieldClass('role')"
          @blur="validateField('role', local.role, roleRules)"
          :disabled="loadingRoles"
        >
          <option value="">Seleccione rol...</option>
          <option 
            v-for="role in availableRoles" 
            :key="role.id" 
            :value="mapRoleNameToFrontend(role.nombre)"
          >
            {{ getRoleLabel(role.nombre) }}
          </option>
        </select>
        <div v-if="loadingRoles" class="form-text">
          <i class="fas fa-spinner fa-spin me-1"></i> Cargando roles...
        </div>
      </FormField>
    </div>

    <!-- Parroquia -->
    <div class="col-12">
      <FormField
        label="Parroquia"
        :error="getFieldError('parroquiaId')"
        :required="true"
      >
        <AutocompleteParroquia
          :modelValue="local.parroquiaId"
          @update:modelValue="(id) => local.parroquiaId = id || 0"
          @change="onParroquiaChange"
        />
      </FormField>
    </div>

    <!-- Especialidades (Solo para profesores) -->
    <div v-if="local.role === 'profesor'" class="col-12">
      <FormField
        label="Especialidades"
        :error="getFieldError('especialidadIds')"
        :required="false"
      >
        <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
          <div v-if="loadingEspecialidades" class="text-center">
            <i class="fas fa-spinner fa-spin me-1"></i> Cargando especialidades...
          </div>
          <div v-else-if="!availableEspecialidades.length" class="text-muted">
            No hay especialidades disponibles
          </div>
          <div v-else class="form-check-group">
            <div
              v-for="esp in availableEspecialidades"
              :key="esp.id"
              class="form-check"
            >
              <input
                :id="`esp-${esp.id}`"
                v-model="local.especialidadIds"
                type="checkbox"
                class="form-check-input"
                :value="esp.id"
              />
              <label :for="`esp-${esp.id}`" class="form-check-label">
                {{ esp.nombre }}
                <small v-if="esp.descripcion" class="text-muted d-block">
                  {{ esp.descripcion }}
                </small>
              </label>
            </div>
          </div>
        </div>
      </FormField>
    </div>

    <!-- Notas Adicionales -->
    <div class="col-12">
      <FormField
        label="Notas Adicionales"
        :error="getFieldError('NotasAdicionales')"
        :required="false"
        helpText="Observaciones o notas adicionales sobre el usuario..."
      >
        <textarea
          v-model="local.NotasAdicionales"
          :class="getFieldClass('NotasAdicionales')"
          rows="3"
          placeholder="Observaciones o notas adicionales sobre el usuario..."
        ></textarea>
      </FormField>
    </div>

    <!-- Activo -->
    <div class="col-12">
      <div class="form-check form-switch">
        <input
          id="activo"
          v-model="local.activo"
          type="checkbox"
          class="form-check-input"
        />
        <label for="activo" class="form-check-label">
          Usuario activo
        </label>
      </div>
    </div>

    <!-- Botones -->
    <div class="col-12 d-flex justify-content-end mt-4">
      <button
        type="button"
        class="btn btn-secondary me-2"
        @click="$emit('cancel')"
        :disabled="isSubmitting"
      >
        Cancelar
      </button>
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="isSubmitting || isValidatingAsync || hasErrors"
      >
        <span v-if="isSubmitting">
          <i class="fas fa-spinner fa-spin me-1"></i> Guardando...
        </span>
        <span v-else-if="isValidatingAsync">
          <i class="fas fa-spinner fa-spin me-1"></i> Validando...
        </span>
        <span v-else>
          {{ editMode ? 'Actualizar' : 'Crear' }} Usuario
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FormUser, UserRole, Role, Especialidad, Parroquia } from '@/types/user'
import type { ValidationRule } from '@/utils/formValidation'
import { userService } from '@/services/userService'
import { useFormValidation } from '@/composables/useFormValidation'
import { useAsyncValidation } from '@/services/validationService'
import FormField from '@/components/common/FormField.vue'
import AutocompleteParroquia from '@/components/common/AutocompleteParroquia.vue'

interface Props {
  modelValue: Partial<FormUser>
  editMode: boolean
}

interface Emits {
  (e: 'save', data: FormUser): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Estados para cargar datos
const availableRoles = ref<Role[]>([])
const availableEspecialidades = ref<Especialidad[]>([])
const loadingRoles = ref(false)
const loadingEspecialidades = ref(false)

// Sistema de validación
const {
  isSubmitting,
  fieldErrors,
  hasErrors,
  asyncValidating,
  isValidatingAsync,
  validateField,
  getFirstFieldError,
  getFieldClass,
  clearFieldError,
  handleApiError
} = useFormValidation({
  asyncDebounceMs: 500
})

const { validateUnique } = useAsyncValidation()

// Helper para convertir null a undefined para compatibilidad con FormField
const getFieldError = (fieldName: string): string | undefined => {
  const error = getFirstFieldError(fieldName)
  return error === null ? undefined : error
}

// Formulario local
const local = ref<FormUser>({
  id: props.modelValue.id,
  nombre: props.modelValue.nombre ?? '',
  apellido: props.modelValue.apellido ?? '',
  email: props.modelValue.email ?? '',
  tipoDocumento: props.modelValue.tipoDocumento ?? 'CEDULA',
  numeroDocumento: props.modelValue.numeroDocumento ?? '',
  fechaNacimiento: props.modelValue.fechaNacimiento ?? '',
  password: props.modelValue.password ?? '',
  NotasAdicionales: props.modelValue.NotasAdicionales ?? '',
  role: props.modelValue.role ?? ('estudiante' as UserRole),
  roleId: props.modelValue.roleId,
  especialidadIds: props.modelValue.especialidadIds ?? [],
  parroquiaId: props.modelValue.parroquiaId ?? 0,
  activo: props.modelValue.activo ?? true
})

// Reglas de validación
const nameRules: ValidationRule[] = [
  { type: 'required', message: 'Este campo es obligatorio' },
  { type: 'minLength', value: 2, message: 'Debe tener al menos 2 caracteres' },
  { type: 'maxLength', value: 50, message: 'No puede tener más de 50 caracteres' }
]

const emailRules: ValidationRule[] = [
  { type: 'required', message: 'El email es obligatorio' },
  { type: 'email', message: 'Debe ser un email válido' }
]

const documentTypeRules: ValidationRule[] = [
  { type: 'required', message: 'Debe seleccionar un tipo de documento' }
]

const dateRules: ValidationRule[] = [
  { type: 'required', message: 'La fecha de nacimiento es obligatoria' },
  { type: 'date', message: 'Debe ser una fecha válida' }
]

const roleRules: ValidationRule[] = [
  { type: 'required', message: 'Debe seleccionar un rol' }
]

// Reglas dinámicas
const getDocumentRules = (): ValidationRule[] => {
  const baseRules: ValidationRule[] = [
    { type: 'required', message: 'El número de documento es obligatorio' }
  ]

  switch (local.value.tipoDocumento) {
    case 'CEDULA':
      baseRules.push(
        { type: 'minLength', value: 10, message: 'La cédula debe tener 10 dígitos' },
        { type: 'maxLength', value: 10, message: 'La cédula debe tener 10 dígitos' },
        { type: 'pattern', value: /^\d{10}$/, message: 'La cédula debe contener solo números' }
      )
      break
    case 'PASAPORTE':
      baseRules.push(
        { type: 'minLength', value: 6, message: 'El pasaporte debe tener al menos 6 caracteres' },
        { type: 'maxLength', value: 15, message: 'El pasaporte no puede tener más de 15 caracteres' }
      )
      break
    case 'RUC':
      baseRules.push(
        { type: 'minLength', value: 13, message: 'El RUC debe tener 13 dígitos' },
        { type: 'maxLength', value: 13, message: 'El RUC debe tener 13 dígitos' },
        { type: 'pattern', value: /^\d{13}$/, message: 'El RUC debe contener solo números' }
      )
      break
    default:
      baseRules.push(
        { type: 'minLength', value: 5, message: 'El documento debe tener al menos 5 caracteres' },
        { type: 'maxLength', value: 20, message: 'El documento no puede tener más de 20 caracteres' }
      )
  }

  return baseRules
}

const getPasswordRules = (): ValidationRule[] => {
  if (props.editMode && !local.value.password) {
    return [] // No validar si estamos editando y la contraseña está vacía
  }
  
  return [
    { type: 'required', message: 'La contraseña es obligatoria' },
    { type: 'minLength', value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
  ]
}

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([
    loadRoles(),
    loadEspecialidades()
  ])
})

async function loadRoles() {
  loadingRoles.value = true
  try {
    availableRoles.value = await userService.getRoles()
  } catch (error) {
    console.error('Error al cargar roles:', error)
    // Fallback
    availableRoles.value = [
      { id: 1, nombre: 'ADMIN', description: 'Administrador' },
      { id: 2, nombre: 'PROFESOR', description: 'Profesor' },
      { id: 3, nombre: 'ESTUDIANTE', description: 'Estudiante' },
      { id: 4, nombre: 'SECRETARIO', description: 'Secretario' }
    ]
  } finally {
    loadingRoles.value = false
  }
}

async function loadEspecialidades() {
  loadingEspecialidades.value = true
  try {
    availableEspecialidades.value = await userService.getEspecialidades()
  } catch (error) {
    console.error('Error al cargar especialidades:', error)
    // Fallback
    availableEspecialidades.value = [
      { id: 1, nombre: 'Odontología General', descripcion: 'Atención dental general' },
      { id: 2, nombre: 'Ortodoncia', descripcion: 'Corrección de dientes y mordida' },
      { id: 3, nombre: 'Endodoncia', descripcion: 'Tratamiento de conductos' },
      { id: 4, nombre: 'Periodoncia', descripcion: 'Tratamiento de encías' }
    ]
  } finally {
    loadingEspecialidades.value = false
  }
}

// Validaciones asíncronas con debounce
const onEmailInput = async () => {
  if (local.value.email && local.value.email.includes('@')) {
    asyncValidating.value.email = true
    
    try {
      const isUnique = await validateUnique(
        local.value.email,
        'email',
        { excludeId: local.value.id }
      )
      
      if (!isUnique) {
        fieldErrors.email = ['Ya existe un usuario registrado con este email']
      } else {
        clearFieldError('email')
      }
    } catch (error) {
      console.error('Error validating email:', error)
    } finally {
      asyncValidating.value.email = false
    }
  }
}

const onDocumentInput = async () => {
  if (local.value.numeroDocumento && local.value.tipoDocumento) {
    asyncValidating.value.numeroDocumento = true
    
    try {
      const isUnique = await validateUnique(
        local.value.numeroDocumento,
        'document',
        { 
          tipoDocumento: local.value.tipoDocumento,
          excludeId: local.value.id 
        }
      )
      
      if (!isUnique) {
        fieldErrors.numeroDocumento = [`Ya existe un usuario registrado con este ${local.value.tipoDocumento.toLowerCase()}`]
      } else {
        clearFieldError('numeroDocumento')
      }
    } catch (error) {
      console.error('Error validating document:', error)
    } finally {
      asyncValidating.value.numeroDocumento = false
    }
  }
}

const onDocumentTypeChange = () => {
  // Limpiar validación del número de documento al cambiar tipo
  clearFieldError('numeroDocumento')
  local.value.numeroDocumento = ''
}

// Funciones de mapeo
function mapRoleNameToFrontend(backendRoleName: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'ADMIN': 'admin',
    'PROFESOR': 'profesor',
    'ESTUDIANTE': 'estudiante',
    'SECRETARIO': 'secretario',
    'PACIENTE': 'paciente'
  }
  return roleMap[backendRoleName] || 'estudiante'
}

function getRoleLabel(roleName: string): string {
  const labelMap: Record<string, string> = {
    'ADMIN': 'Administrador',
    'PROFESOR': 'Profesor',
    'ESTUDIANTE': 'Estudiante',
    'SECRETARIO': 'Secretario',
    'PACIENTE': 'Paciente'
  }
  return labelMap[roleName] || roleName
}

// Sincronizar cambios externos
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    local.value = {
      id: newValue.id,
      nombre: newValue.nombre ?? '',
      apellido: newValue.apellido ?? '',
      email: newValue.email ?? '',
      tipoDocumento: newValue.tipoDocumento ?? 'CEDULA',
      numeroDocumento: newValue.numeroDocumento ?? '',
      fechaNacimiento: newValue.fechaNacimiento ?? '',
      password: newValue.password ?? '',
      NotasAdicionales: newValue.NotasAdicionales ?? '',
      role: newValue.role ?? ('estudiante' as UserRole),
      roleId: newValue.roleId,
      especialidadIds: newValue.especialidadIds ?? [],
      parroquiaId: newValue.parroquiaId ?? 0,
      activo: newValue.activo ?? true
    }
  }
}, { immediate: true })

async function onSubmit() {
  // Primero validar todos los campos
  const fieldsToValidate = [
    { field: 'nombre', value: local.value.nombre, rules: nameRules },
    { field: 'apellido', value: local.value.apellido, rules: nameRules },
    { field: 'email', value: local.value.email, rules: emailRules },
    { field: 'tipoDocumento', value: local.value.tipoDocumento, rules: documentTypeRules },
    { field: 'numeroDocumento', value: local.value.numeroDocumento, rules: getDocumentRules() },
    { field: 'fechaNacimiento', value: local.value.fechaNacimiento, rules: dateRules },
    { field: 'password', value: local.value.password, rules: getPasswordRules() },
    { field: 'role', value: local.value.role, rules: roleRules }
  ]

  // Validar todos los campos
  let hasValidationErrors = false
  for (const { field, value, rules } of fieldsToValidate) {
    const isValid = await validateField(field, value, rules)
    if (!isValid) {
      hasValidationErrors = true
    }
  }

  // Validaciones asíncronas adicionales
  await onEmailInput()
  await onDocumentInput()

  // Verificar si hay errores después de todas las validaciones
  if (hasValidationErrors || hasErrors.value) {
    console.log('Formulario tiene errores, no se puede enviar')
    return
  }

  isSubmitting.value = true

  try {
    // Obtener el roleId correspondiente al rol seleccionado
    const selectedRole = availableRoles.value.find(r => 
      mapRoleNameToFrontend(r.nombre) === local.value.role
    )
    
    const userData = {
      ...local.value,
      roleId: selectedRole?.id || 3,
      parroquiaId: local.value.parroquiaId
    }
    
    console.log('Enviando datos del usuario:', userData)
    emit('save', userData)
  } catch (error: any) {
    console.error('Error al enviar formulario:', error)
    handleApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

function onParroquiaChange(parroquia: Parroquia | null) {
  local.value.parroquiaId = parroquia?.id || 0
  console.log('Parroquia seleccionada:', parroquia)
}

// Funciones helper para tipos de documento
function getDocumentoLabel(tipo: string): string {
  switch (tipo) {
    case 'CEDULA': return 'Cédula'
    case 'PASAPORTE': return 'Pasaporte'
    case 'RUC': return 'RUC'
    default: return 'Número de Documento'
  }
}

function getDocumentoPlaceholder(tipo: string): string {
  switch (tipo) {
    case 'CEDULA': return '1234567890'
    case 'PASAPORTE': return 'A12345678'
    case 'RUC': return '1234567890001'
    default: return 'Ingrese documento'
  }
}
</script>

<style src="@/assets/css/components/UserForm.css" scoped></style>