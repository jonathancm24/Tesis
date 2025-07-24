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
        placeholder="Ingrese nombre completo"
        required
      />
      <div class="invalid-feedback">
        El nombre es obligatorio.
      </div>
    </div>

    <!-- Email -->
    <div class="col-12 col-md-6">
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
        required
      >
        <option disabled value="">Selecciona...</option>
        <option value="admin">Admin</option>
        <option value="estudiante">Estudiante</option>
        <option value="profesor">Profesor</option>
        <option value="secretario">Secretario</option>
        <option value="paciente">Paciente</option>
      </select>
      <div class="invalid-feedback">
        Debes seleccionar un rol.
      </div>
    </div>

    <!-- Especialidad (solo estudiantes/profesores) -->
    <div
      v-if="['estudiante','profesor'].includes(local.role)"
      class="col-12 col-md-6"
    >
      <label for="especialidad" class="form-label">
        <i class="fas fa-briefcase-medical me-1"></i> Especialidad
      </label>
      <input
        id="especialidad"
        v-model="local.especialidad"
        type="text"
        class="form-control"
        placeholder="Ej. Ortodoncia"
      />
    </div>

    <!-- Historial Médico (solo pacientes) -->
    <div v-if="local.role === 'paciente'" class="col-12">
      <label for="historial" class="form-label">
        <i class="fas fa-notes-medical me-1"></i> Historial Médico
      </label>
      <textarea
        id="historial"
        v-model="local.historial"
        class="form-control"
        rows="3"
        placeholder="Antecedentes, alergias, etc."
      ></textarea>
    </div>

    <!-- Activo (switch) -->
    <div class="col-12 col-md-6 form-check form-switch">
      <input
        id="activo"
        v-model="local.activo"
        class="form-check-input"
        type="checkbox"
      />
      <label class="form-check-label" for="activo">
        <i class="fas fa-toggle-on me-1"></i> Activo
      </label>
    </div>

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
import type { Role } from '@/mocks/api'

interface FormUser {
  id?: number
  nombre: string
  email: string
  role: Role
  especialidad: string
  historial: string
  activo: boolean
}

const props = defineProps<{
  modelValue: Partial<FormUser>
  editMode: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: FormUser): void
  (e: 'cancel'): void
}>()

const local = ref<FormUser>({
  id: props.modelValue.id,
  nombre: props.modelValue.nombre ?? '',
  email: props.modelValue.email ?? '',
  role: props.modelValue.role ?? 'estudiante',
  especialidad: props.modelValue.especialidad ?? '',
  historial: props.modelValue.historial ?? '',
  activo: props.modelValue.activo ?? true,
})

// Sincronizar cambios externos
watch(() => props.modelValue, v => {
  local.value = {
    id: v.id,
    nombre: v.nombre ?? '',
    email: v.email ?? '',
    role: v.role ?? 'estudiante',
    especialidad: v.especialidad ?? '',
    historial: v.historial ?? '',
    activo: v.activo ?? true,
  }
})

// Validación Bootstrap
onMounted(() => {
  const form = document.querySelector('.needs-validation') as HTMLFormElement
  form.addEventListener('submit', (e: Event) => {
    if (!form.checkValidity()) {
      e.preventDefault()
      e.stopPropagation()
    }
    form.classList.add('was-validated')
  }, false)
})

function onSave() {
  emit('save', { ...local.value })
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
.was-validated .form-control:invalid {
  border-color: var(--bs-danger);
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, .25);
}
.btn-outline-secondary:hover {
  background-color: var(--bs-light);
}
</style>
