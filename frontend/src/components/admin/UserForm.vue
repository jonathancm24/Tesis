<!-- src/components/admin/UserForm.vue -->
<template>
  <form @submit.prevent="onSave" class="row g-3 needs-validation" novalidate>
    <!-- Nombre -->
    <div class="col-12 col-md-6">
      <label for="nombre" class="form-label">
        <i class="fas fa-user me-1"></i> Nombre *
      </label>
      <input
        id="nombre"
        v-model="local.nombre"
        type="text"
        class="form-control"
        placeholder="Ingrese nombre"
        required
      />
      <div class="invalid-feedback">
        El nombre es obligatorio.
      </div>
    </div>

    <!-- Apellido -->
    <div class="col-12 col-md-6">
      <label for="apellido" class="form-label">
        <i class="fas fa-user me-1"></i> Apellido *
      </label>
      <input
        id="apellido"
        v-model="local.apellido"
        type="text"
        class="form-control"
        placeholder="Ingrese apellido"
        required
      />
      <div class="invalid-feedback">
        El apellido es obligatorio.
      </div>
    </div>

    <!-- Email -->
    <div class="col-12 col-md-6">
      <label for="email" class="form-label">
        <i class="fas fa-envelope me-1"></i> Email *
      </label>
      <input
        id="email"
        v-model="local.email"
        type="email"
        class="form-control"
        placeholder="usuario@dominio.com"
        required
      />
      <div class="invalid-feedback">
        Por favor introduce un email válido.
      </div>
    </div>

    <!-- Cédula -->
    <div class="col-12 col-md-6">
      <label for="cedula" class="form-label">
        <i class="fas fa-id-card me-1"></i> Cédula *
      </label>
      <input
        id="cedula"
        v-model="local.cedula"
        type="text"
        class="form-control"
        placeholder="1234567890"
        required
      />
      <div class="invalid-feedback">
        La cédula es obligatoria.
      </div>
    </div>

    <!-- Fecha de Nacimiento -->
    <div class="col-12 col-md-6">
      <label for="fechaNacimiento" class="form-label">
        <i class="fas fa-calendar me-1"></i> Fecha de Nacimiento *
      </label>
      <input
        id="fechaNacimiento"
        v-model="local.fechaNacimiento"
        type="date"
        class="form-control"
        required
      />
      <div class="invalid-feedback">
        La fecha de nacimiento es obligatoria.
      </div>
    </div>

    <!-- Contraseña -->
    <div class="col-12 col-md-6">
      <label for="password" class="form-label">
        <i class="fas fa-lock me-1"></i> Contraseña *
      </label>
      <input
        id="password"
        v-model="local.password"
        type="password"
        class="form-control"
        placeholder="Mínimo 6 caracteres"
        :required="!editMode"
      />
      <div class="invalid-feedback">
        La contraseña debe tener al menos 6 caracteres.
      </div>
      <div v-if="editMode" class="form-text">
        Deja en blanco para mantener la contraseña actual.
      </div>
    </div>

    <!-- Rol -->
    <div class="col-12 col-md-6">
      <label for="role" class="form-label">
        <i class="fas fa-user-tag me-1"></i> Rol *
      </label>
      <select
        id="role"
        v-model="local.role"
        class="form-select"
        :disabled="loadingRoles"
        required
      >
        <option disabled value="">
          {{ loadingRoles ? 'Cargando roles...' : 'Selecciona...' }}
        </option>
        <option 
          v-for="role in availableRoles" 
          :key="role.id"
          :value="mapRoleNameToFrontend(role.nombre)"
        >
          {{ getRoleLabel(role.nombre) }}
        </option>
      </select>
      <div class="invalid-feedback">
        Debes seleccionar un rol.
      </div>
    </div>

    <!-- Parroquia -->
    <div class="col-12">
      <AutocompleteParroquia
        v-model="local.parroquiaId"
        label="Parroquia"
        placeholder="Buscar por nombre de parroquia o ciudad (ej: Manta, Quito, Guayaquil...)"
        required
        input-id="parroquia"
        @change="onParroquiaChange"
      />
    </div>

    <!-- Especialidades (Selección múltiple) -->
    <div class="col-12">
      <label for="especialidades" class="form-label">
        <i class="fas fa-stethoscope me-1"></i> Especialidades
      </label>
      <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
        <div class="form-text mb-2">
          Selecciona una o más especialidades (opcional para algunos roles)
        </div>
        <div v-if="loadingEspecialidades" class="text-center">
          <div class="spinner-border spinner-border-sm" role="status"></div>
          <span class="ms-2">Cargando especialidades...</span>
        </div>
        <div v-else class="row">
          <div 
            v-for="especialidad in availableEspecialidades" 
            :key="especialidad.id"
            class="col-12 col-md-6 mb-2"
          >
            <div class="form-check">
              <input
                :id="`esp-${especialidad.id}`"
                v-model="local.especialidadIds"
                class="form-check-input"
                type="checkbox"
                :value="especialidad.id"
              />
              <label 
                :for="`esp-${especialidad.id}`" 
                class="form-check-label"
              >
                {{ especialidad.nombre }}
                <small v-if="especialidad.descripcion" class="text-muted d-block">
                  {{ especialidad.descripcion }}
                </small>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notas Adicionales -->
    <div class="col-12">
      <label for="notasAdicionales" class="form-label">
        <i class="fas fa-sticky-note me-1"></i> Notas Adicionales
      </label>
      <textarea
        id="notasAdicionales"
        v-model="local.NotasAdicionales"
        class="form-control"
        rows="3"
        placeholder="Observaciones o notas adicionales sobre el usuario..."
      ></textarea>
      <div class="form-text">
        Campo opcional para información adicional.
      </div>
    </div>

    <!-- Activo (switch) -->
    <div class="col-12">
      <div class="form-check form-switch">
        <input
          id="activo"
          v-model="local.activo"
          class="form-check-input"
          type="checkbox"
        />
        <label class="form-check-label" for="activo">
          <i class="fas fa-toggle-on me-1"></i> Usuario Activo
        </label>
      </div>
    </div>

    <!-- Botones -->
    <div class="col-12 d-flex justify-content-end mt-4">
      <button
        type="button"
        class="btn btn-outline-secondary me-2"
        @click="$emit('cancel')"
      >
        <i class="fas fa-times me-1"></i> Cancelar
      </button>
      <button type="submit" class="btn btn-primary">
        <i :class="editMode ? 'fas fa-save' : 'fas fa-user-plus'" class="me-1"></i>
        {{ editMode ? 'Actualizar' : 'Crear' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FormUser, UserRole, Role, Especialidad, Parroquia } from '@/types/user'
import { userService } from '@/services/userService'
import AutocompleteParroquia from '@/components/common/AutocompleteParroquia.vue' // ✅ IMPORTAR

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

// Formulario local
const local = ref<FormUser>({
  id: props.modelValue.id,
  nombre: props.modelValue.nombre ?? '',
  apellido: props.modelValue.apellido ?? '',
  email: props.modelValue.email ?? '',
  cedula: props.modelValue.cedula ?? '',
  fechaNacimiento: props.modelValue.fechaNacimiento ?? '',
  password: props.modelValue.password ?? '',
  NotasAdicionales: props.modelValue.NotasAdicionales ?? '',
  role: props.modelValue.role ?? ('estudiante' as UserRole),
  roleId: props.modelValue.roleId,
  especialidadIds: props.modelValue.especialidadIds ?? [],
  parroquiaId: props.modelValue.parroquiaId ?? 0,
  activo: props.modelValue.activo ?? true
})

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
      cedula: newValue.cedula ?? '',
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

async function onSave() {
  // Obtener el roleId correspondiente al rol seleccionado
  const selectedRole = availableRoles.value.find(r => 
    mapRoleNameToFrontend(r.nombre) === local.value.role
  )
  
  const userData = {
    ...local.value,
    roleId: selectedRole?.id || 3
  }
  
  emit('save', userData)
}

function onParroquiaChange(parroquia: Parroquia | null) {
  console.log('Parroquia seleccionada:', parroquia)
  // Aquí puedes hacer validaciones adicionales si es necesario
}
</script>

<style scoped>
.form-label {
  font-weight: 600;
}
.form-label i {
  color: var(--bs-primary);
}
.form-check-input {
  cursor: pointer;
}
.form-check-label {
  cursor: pointer;
}
</style>
