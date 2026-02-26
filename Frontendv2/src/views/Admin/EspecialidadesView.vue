<template>
  <div class="especialidades-page">
    <div class="page-header">
      <div>
        <h1>Gestión de Especialidades</h1>
        <p class="subtitle">Administra las especialidades odontológicas del sistema</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateModal">
          <span class="icon">+</span>
          Nueva Especialidad
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Lista de Especialidades</h2>
      </div>

      <!-- Estado de carga -->
      <div v-if="store.isLoading && !especialidades.length" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando especialidades...</p>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!store.isLoading && !especialidades.length" class="empty-state">
        <span class="empty-state-icon">📋</span>
        <p>No hay especialidades registradas</p>
        <button class="btn btn-primary" @click="openCreateModal">
          Crear primera especialidad
        </button>
      </div>

      <!-- Tabla de especialidades -->
      <div v-else class="especialidades-table-container">
        <table class="especialidades-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="especialidad in especialidades" :key="especialidad.id">
              <td>{{ especialidad.id }}</td>
              <td>{{ especialidad.nombre }}</td>
              <td class="descripcion-cell">
                {{ especialidad.descripcion || 'Sin descripción' }}
              </td>
              <td>
                <div class="table-actions">
                  <button 
                    class="btn-icon edit" 
                    @click="openEditModal(especialidad)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn-icon delete" 
                    @click="confirmDelete(especialidad)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Crear/Editar -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h3>{{ isEditing ? 'Editar Especialidad' : 'Nueva Especialidad' }}</h3>
              <button class="btn-close" @click="closeModal">×</button>
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="modal-body">
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <input
                    id="nombre"
                    v-model="formData.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Ej: Ortodoncia"
                    required
                    maxlength="100"
                  />
                </div>

                <div class="form-group">
                  <label for="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    v-model="formData.descripcion"
                    class="form-control"
                    placeholder="Descripción de la especialidad (opcional)"
                    maxlength="500"
                  ></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="store.isLoading">
                  {{ store.isLoading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEspecialidadesStore } from '@/stores/admin/especialidades'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import type { Especialidad, CreateEspecialidadDto } from '@/types/especialidades.types'
import '@/assets/styles/admin/usuarios.css'
import '@/assets/styles/admin/especialidades.css'

const store = useEspecialidadesStore()
const toast = useToast()

const especialidades = computed(() => store.especialidades)
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const formData = ref<CreateEspecialidadDto>({
  nombre: '',
  descripcion: ''
})

// Cargar especialidades al montar
onMounted(async () => {
  try {
    await store.fetchEspecialidades()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
})

// Abrir modal para crear
function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    nombre: '',
    descripcion: ''
  }
  isModalOpen.value = true
}

// Abrir modal para editar
function openEditModal(especialidad: Especialidad) {
  isEditing.value = true
  editingId.value = especialidad.id
  formData.value = {
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion || ''
  }
  isModalOpen.value = true
}

// Cerrar modal
function closeModal() {
  isModalOpen.value = false
  setTimeout(() => {
    isEditing.value = false
    editingId.value = null
    formData.value = { nombre: '', descripcion: '' }
  }, 300)
}

// Manejar submit del formulario
async function handleSubmit() {
  try {
    if (isEditing.value && editingId.value) {
      await store.updateEspecialidad(editingId.value, formData.value)
      toast.success('Especialidad actualizada correctamente')
    } else {
      await store.createEspecialidad(formData.value)
      toast.success('Especialidad creada correctamente')
    }
    closeModal()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// Confirmar eliminación
function confirmDelete(especialidad: Especialidad) {
  if (confirm(`¿Estás seguro de eliminar la especialidad "${especialidad.nombre}"?`)) {
    handleDelete(especialidad.id)
  }
}

// Eliminar especialidad
async function handleDelete(id: number) {
  try {
    await store.deleteEspecialidad(id)
    toast.success('Especialidad eliminada correctamente')
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
</script>
