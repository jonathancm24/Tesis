<!-- src/views/professor/AssignmentsManagementView.vue -->
<template>
  <section class="assignments-management container py-4">
    <!-- Sprint 6 – 2025-07-24 – Gestión de Asignaciones Académicas -->
    <h2 class="mb-4">Gestión de Asignaciones Académicas</h2>

    <!-- Pestañas Listado / Formulario -->
    <b-tabs v-model="activeTab" pills card>
      <!-- Pestaña Listado -->
      <b-tab title="Listado">
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead class="table-light">
              <tr>
                <th>Título</th>
                <th>Curso</th>
                <th>Fecha Entrega</th>
                <th>Creado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in assignments" :key="a.id">
                <td>{{ a.title }}</td>
                <td>{{ a.course }}</td>
                <td>{{ a.dueDate }}</td>
                <td>{{ formatDate(a.createdAt) }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="onEdit(a)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="onDelete(a.id)"
                    title="Eliminar"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="assignments.length === 0">
                <td colspan="5" class="text-center text-muted">
                  No hay asignaciones registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-success mt-3" @click="onNew">
          <i class="bi bi-plus-lg"></i> Nueva Asignación
        </button>
      </b-tab>

      <!-- Pestaña Crear / Editar -->
      <b-tab :title="editMode ? 'Editar' : 'Crear'">
        <AssignTaskForm
          :modelValue="currentAssignment"
          :editMode="editMode"
          @save="onSave"
          @cancel="onCancel"
        />
      </b-tab>
    </b-tabs>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Assignment } from '../../mocks/professor/assignments'
import {
  fetchAssignmentsMock,
  saveAssignmentMock,
  deleteAssignmentMock
} from '../../mocks/professor/assignments'
import AssignTaskForm from '../../components/professor/AssignTaskForm.vue'

// Estado reactivo
const assignments = ref<Assignment[]>([])
const activeTab = ref(0)            // 0=Listado, 1=Formulario
const editMode = ref(false)
const currentAssignment = ref<Partial<Assignment>>({})

// Carga inicial de datos
async function load() {
  assignments.value = await fetchAssignmentsMock()
}
onMounted(load)

// Abrir formulario para nueva asignación
function onNew() {
  currentAssignment.value = {}
  editMode.value = false
  activeTab.value = 1
}

// Abrir formulario para editar asignación existente
function onEdit(a: Assignment) {
  currentAssignment.value = { ...a }
  editMode.value = true
  activeTab.value = 1
}

// Guardar (nuevo o editar)
async function onSave(a: Assignment) {
  await saveAssignmentMock(a)
  await load()
  activeTab.value = 0
}

// Cancelar creación/edición
function onCancel() {
  editMode.value = false
  currentAssignment.value = {}
  activeTab.value = 0
}

// Eliminar asignación
async function onDelete(id: number) {
  if (!confirm('¿Eliminar esta asignación?')) return
  await deleteAssignmentMock(id)
  await load()
}

// Formateo de fecha legible
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}
</script>

<style scoped>
.assignments-management h2 {
  color: var(--bs-primary);
}
.table thead th {
  vertical-align: middle;
}
.btn i {
  font-size: 1rem;
}
</style>
