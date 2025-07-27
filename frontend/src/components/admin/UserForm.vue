<!-- src/components/admin/UserForm.vue -->
<template>
  <form @submit.prevent="onSave" class="row g-3 needs-validation" novalidate>
    <!-- Nombre -->
    <div class="col-12 col-md-6">
      <label for="nombre" class="form-label">
        <i class="fas fa-user me-1"></i> Nombre
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
        <i class="fas fa-user me-1"></i> Apellido
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
    <div class="col-12">
      <label for="email" class="form-label">
        <i class="fas fa-envelope me-1"></i> Email
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

    <!-- Rol -->
    <div class="col-12 col-md-6">
      <label for="role" class="form-label">
        <i class="fas fa-user-tag me-1"></i> Rol
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

    <!-- Activo (switch) -->
    <div class="col-12 col-md-6 d-flex align-items-end">
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

    <!-- Campos adicionales solo para creación -->
    <template v-if="!editMode">
      <div class="col-12 col-md-6">
        <label for="cedula" class="form-label">
          <i class="fas fa-id-card me-1"></i> Cédula
        </label>
        <input
          id="cedula"
          v-model="local.cedula"
          type="text"
          class="form-control"
          placeholder="1234567890"
          required
        />
      </div>

      <div class="col-12 col-md-6">
        <label for="password" class="form-label">
          <i class="fas fa-lock me-1"></i> Contraseña
        </label>
        <input
          id="password"
          v-model="local.password"
          type="password"
          class="form-control"
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>

      <div class="col-12">
        <label for="fechaNacimiento" class="form-label">
          <i class="fas fa-calendar me-1"></i> Fecha de Nacimiento
        </label>
        <input
          id="fechaNacimiento"
          v-model="local.fechaNacimiento"
          type="date"
          class="form-control"
          required
        />
      </div>
    </template>

    <!-- Botones -->
    <div class="col-12 d-flex justify-content-end mt-3">
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
import type { FormUser, UserRole, Role } from '@/types/user'
import { userService } from '@/services/userService'

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

// ✅ AGREGAR ESTADO PARA ROLES DINÁMICOS
const availableRoles = ref<Role[]>([])
const loadingRoles = ref(false)

const local = ref<FormUser>({
  id: props.modelValue.id,
  nombre: props.modelValue.nombre ?? '',
  apellido: props.modelValue.apellido ?? '',
  email: props.modelValue.email ?? '',
  role: props.modelValue.role ?? ('estudiante' as UserRole),
  activo: props.modelValue.activo ?? true,
  cedula: props.modelValue.cedula ?? '',
  password: props.modelValue.password ?? '',
  fechaNacimiento: props.modelValue.fechaNacimiento ?? ''
})

// ✅ CARGAR ROLES AL MONTAR EL COMPONENTE
onMounted(async () => {
  await loadRoles()
})

async function loadRoles() {
  loadingRoles.value = true
  try {
    availableRoles.value = await userService.getRoles()
    console.log('Roles disponibles:', availableRoles.value)
  } catch (error) {
    console.error('Error al cargar roles:', error)
    // Fallback con roles por defecto
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

// Función para mapear nombre del rol de BD a frontend
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

// Función para obtener el label del rol
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
      role: newValue.role ?? ('estudiante' as UserRole),
      activo: newValue.activo ?? true,
      cedula: newValue.cedula ?? '',
      password: newValue.password ?? '',
      fechaNacimiento: newValue.fechaNacimiento ?? ''
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
</style>
