<!-- Ruta: /admin/users  - Archivo: src/views/admin/AdminUsers.vue -->
<template>
  <div class="admin-users container-fluid py-4">
    <!-- Toolbar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 text-primary">
        Gestión de Usuarios
      </h1>
      <div class="d-flex align-items-center">
        <input
          v-model="filter"
          type="text"
          class="form-control me-2"
          placeholder="Buscar..."
          aria-label="Buscar usuarios"
        />
        <button
          class="btn btn-success"
          @click="openModal()"
          aria-label="Añadir usuario"
        >
          Añadir usuario
        </button>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Tabla de usuarios -->
    <div v-if="!loading" class="table-responsive">
      <table class="table table-hover shadow-sm">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Activo</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in filteredUsers"
            :key="u.id"
            :class="{ 'table-secondary': !u.activo }"
          >
            <td>{{ u.id }}</td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span :class="roleBadgeClass(u.role)">
                {{ u.role }}
              </span>
            </td>
            <td>{{ u.activo ? 'Sí' : 'No' }}</td>
            <td class="text-center">
              <button
                class="btn btn-sm btn-primary me-2"
                @click="openModal(u)"
              >
                Editar
              </button>
              <button
                class="btn btn-sm btn-warning me-2"
                @click="onToggleActive(u)"
              >
                {{ u.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="onDelete(u.id)"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="!filteredUsers.length">
            <td colspan="6" class="text-center text-muted py-4">
              No se encontraron usuarios.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Crear/Editar -->
    <transition name="fade">
      <div v-if="isModalOpen" class="modal-backdrop fade show"></div>
    </transition>
    <transition name="fade">
      <div
        v-if="isModalOpen"
        class="modal d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                {{ editingUser.id ? 'Editar Usuario' : 'Nuevo Usuario' }}
              </h5>
              <button
                type="button"
                class="btn-close btn-close-white"
                @click="closeModal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div class="modal-body">
              <UserForm
                :modelValue="editingUser"
                :editMode="!!editingUser.id"
                @save="handleSave"
                @cancel="closeModal"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserForm from '@/components/admin/UserForm.vue'
import type { User, Role } from '@/mocks/api'
import {
  fetchUsersMock,
  saveUserMock,
  deleteUserMock,
} from '@/mocks/api'

// Interfaz para datos del formulario
interface FormUser {
  id?: number
  nombre: string
  email: string
  role: Role
  especialidad?: string
  historial?: string
  activo: boolean
  password?: string
}

// Estados
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const filter = ref('')
const isModalOpen = ref(false)
const editingUser = ref<Partial<FormUser>>({})

// Carga inicial de usuarios
onMounted(loadUsers)
async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    users.value = await fetchUsersMock()
  } catch (err: any) {
    error.value = err.message || 'Error al cargar usuarios'
  } finally {
    loading.value = false
  }
}

// Filtrado por nombre o email
const filteredUsers = computed(() =>
  users.value.filter(u =>
    u.nombre.toLowerCase().includes(filter.value.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.value.toLowerCase())
  )
)

// Abrir modal en modo creación o edición
function openModal(user?: User) {
  editingUser.value = user
    ? { ...user }
    : { nombre: '', email: '', role: 'estudiante', activo: true }
  isModalOpen.value = true
}

// Cerrar modal
function closeModal() {
  isModalOpen.value = false
}

// Guardar usuario (crear o actualizar)
async function handleSave(data: FormUser) {
  isModalOpen.value = false
  loading.value = true
  error.value = ''
  try {
    await saveUserMock(data as User)
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || 'Error al guardar usuario'
  } finally {
    loading.value = false
  }
}

// Eliminar usuario
async function onDelete(id: number) {
  if (!confirm('¿Eliminar este usuario?')) return
  loading.value = true
  error.value = ''
  try {
    await deleteUserMock(id)
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || 'Error al eliminar usuario'
  } finally {
    loading.value = false
  }
}

// Alternar activo/inactivo
async function onToggleActive(u: User) {
  loading.value = true
  error.value = ''
  try {
    await saveUserMock({ ...u, activo: !u.activo })
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || 'Error al actualizar estado'
  } finally {
    loading.value = false
  }
}

// Clases para badges de rol
function roleBadgeClass(role: Role) {
  return {
    'badge bg-danger': role === 'admin',
    'badge bg-success': role === 'profesor',
    'badge bg-info text-dark': role === 'estudiante',
    'badge bg-warning text-dark': role === 'secretario',
    'badge bg-secondary text-white': role === 'paciente',
  }
}
</script>

<style src="@/assets/css/pages/admin/AdminUsers.css" scoped></style>
