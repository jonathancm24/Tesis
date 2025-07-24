<!-- src/components/professor/AssignTaskForm.vue -->
<template>
  <form
    @submit.prevent="onSubmit"
    :class="{ 'needs-validation': true, 'was-validated': submitted }"
    novalidate
    class="assign-task-form p-4"
  >
    <!-- Sprint 6 – 2025-07-24 – Formulario de Asignación de Tareas -->
    <h3 class="mb-4">
      {{ editMode ? 'Editar Tarea Académica' : 'Nueva Tarea Académica' }}
    </h3>

    <!-- Título -->
    <div class="mb-3">
      <label for="title" class="form-label">Título</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        class="form-control"
        required
        maxlength="100"
      />
      <div class="invalid-feedback">
        El título es obligatorio (máx. 100 caracteres).
      </div>
    </div>

    <!-- Descripción -->
    <div class="mb-3">
      <label for="description" class="form-label">Descripción</label>
      <textarea
        id="description"
        v-model="form.description"
        class="form-control"
        rows="4"
        required
        maxlength="500"
      ></textarea>
      <div class="invalid-feedback">
        La descripción es obligatoria (máx. 500 caracteres).
      </div>
    </div>

    <!-- Curso -->
    <div class="mb-3">
      <label for="course" class="form-label">Curso</label>
      <select
        id="course"
        v-model="form.course"
        class="form-select"
        required
      >
        <option value="" disabled>Seleccione un curso...</option>
        <option
          v-for="c in courses"
          :key="c"
          :value="c"
        >{{ c }}</option>
      </select>
      <div class="invalid-feedback">
        Debe seleccionar un curso.
      </div>
    </div>

    <!-- Fecha de entrega -->
    <div class="mb-3">
      <label for="dueDate" class="form-label">Fecha de Entrega</label>
      <input
        id="dueDate"
        v-model="form.dueDate"
        type="date"
        class="form-control"
        :min="minDueDate"
        required
      />
      <div class="invalid-feedback">
        Debe especificar una fecha de entrega válida.
      </div>
    </div>

    <!-- Botones -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button type="submit" class="btn btn-success">
        {{ editMode ? 'Guardar Cambios' : 'Crear Tarea' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import type { Assignment } from '../../mocks/professor/assignments'
import { saveAssignmentMock } from '../../mocks/professor/assignments'
import { fetchCoursesMock } from '../../mocks/professor/studentsByCourse'

// Props y eventos
const props = defineProps<{
  modelValue: Partial<Assignment>
  editMode: boolean
}>()
const emit = defineEmits<{
  (e: 'save', payload: Assignment): void
  (e: 'cancel'): void
}>()

// Estado del formulario
const form = reactive<Partial<Assignment>>({
  ...props.modelValue
})
const submitted = ref(false)

// Cursos disponibles
const courses = ref<string[]>([])

onMounted(async () => {
  courses.value = await fetchCoursesMock()
})

// Fecha mínima de entrega: hoy
const minDueDate = computed(() => new Date().toISOString().slice(0, 10))

// Manejo de envío
async function onSubmit() {
  submitted.value = true
  const formEl = document.querySelector('.assign-task-form') as HTMLFormElement
  if (!formEl.checkValidity()) return

  const payload: Assignment = {
    id: form.id ?? Date.now(),
    title: form.title!.trim(),
    description: form.description!.trim(),
    course: form.course!,
    dueDate: form.dueDate!,
    createdAt: props.modelValue?.createdAt ?? new Date().toISOString()
  }

  await saveAssignmentMock(payload)
  emit('save', payload)
}
</script>

<style scoped>
/* Ejemplo rápido de estilos; puedes moverlos a tu CSS modular */
.assign-task-form { background: #fff; border-radius: .5rem; }
</style>
