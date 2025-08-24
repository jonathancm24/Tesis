<!-- Ruta: /admin/users  - Archivo: src/views/admin/AdminUsers.vue -->
<template>
  <div class="admin-users container-fluid py-4">
    <!-- Toolbar -->
    <div class="toolbar">
      <h1>
        Gestión de Usuarios
      </h1>
      <div class="actions">
        <input
          v-model="filter"
          type="text"
          class="form-control search-input"
          placeholder="Buscar..."
          aria-label="Buscar usuarios"
        />
        
        <!-- Botón de Carga Masiva -->
        <button
          class="btn btn-outline-success"
          data-bs-toggle="modal"
          data-bs-target="#bulkUploadModal"
          title="Carga masiva desde Excel"
        >
          <i class="fas fa-upload me-1"></i>
          Carga masiva
        </button>
        
        <!-- Botón de Desactivación Masiva -->
        <button
          class="btn btn-outline-warning"
          data-bs-toggle="modal"
          data-bs-target="#bulkDeactivateModal"
          title="Desactivar usuarios masivamente"
          :disabled="activeUsersCount === 0"
        >
          <i class="fas fa-user-slash me-1"></i>
          Desactivar masivo
        </button>
        
        <!-- Botón de Añadir Usuario Individual -->
        <button
          class="btn btn-success"
          @click="openModal()"
          aria-label="Añadir usuario"
        >
          <i class="fas fa-user-plus me-1"></i>
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
  <div v-if="!loading" class="table-container table-responsive">
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
              <span :class="roleBadgeClassByNombre(u.roleNombre, u.role)">
                {{ roleDisplay(u.roleNombre, u.role) }}
              </span>
            </td>
            <td>{{ u.activo ? 'Sí' : 'No' }}</td>
            <td class="text-center">
              <button
                class="btn btn-sm btn-primary me-2"
                @click="openModal(u)"
                :disabled="loading || loadingUserData"
              >
                <i class="fas fa-edit me-1"></i>
                Editar
              </button>
              <button
                class="btn btn-sm btn-warning me-2"
                @click="onToggleActive(u)"
                :disabled="loading"
              >
                <i class="fas fa-power-off me-1"></i>
                {{ u.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="onDelete(u.id)"
                :disabled="loading"
              >
                <i class="fas fa-trash me-1"></i>
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
              <div v-if="loadingUserData" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando datos del usuario...</span>
                </div>
                <p class="mt-2 text-muted">Cargando datos del usuario...</p>
              </div>
              <UserForm
                v-else
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

    <!-- Modal de Carga Masiva -->
    <BulkUploadModal @success="onBulkOperationSuccess" />

    <!-- Modal de Desactivación Masiva -->
    <BulkDeactivateModal :users="users" @success="onBulkOperationSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserForm from '@/components/admin/UserForm.vue'
import BulkUploadModal from '@/components/admin/BulkUploadModal.vue'
import BulkDeactivateModal from '@/components/admin/BulkDeactivateModal.vue'
import { userService } from '@/services/userService'
import type { User, FormUser, UserRole, TipoDocumentoType } from '@/types/user'

// Estados
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const filter = ref('')
const isModalOpen = ref(false)
const editingUser = ref<Partial<FormUser>>({})
const loadingUserData = ref(false)

// Carga inicial de usuarios
onMounted(loadUsers)

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    users.value = await userService.getUsers()
    console.log('Usuarios cargados:', users.value)
  } catch (err: any) {
    error.value = err.message || 'Error al cargar usuarios'
    console.error('Error al cargar usuarios:', err)
  } finally {
    loading.value = false
  }
}

// Filtrado por nombre, apellido o email
const filteredUsers = computed(() =>
  users.value.filter(u =>
    u.nombre.toLowerCase().includes(filter.value.toLowerCase()) ||
    u.apellido.toLowerCase().includes(filter.value.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.value.toLowerCase())
  )
)

// Contador de usuarios activos para habilitar/deshabilitar botón de desactivación masiva
const activeUsersCount = computed(() => 
  users.value.filter(u => u.activo).length
)

// Abrir modal en modo creación o edición
async function openModal(user?: User) {
  if (user) {
    // Modo edición - cargar datos completos del usuario
    loadingUserData.value = true
    try {
      console.log('AdminUsers.openModal - Usuario básico de la tabla:', user)
      console.log('AdminUsers.openModal - Cargando datos completos del usuario ID:', user.id)
      
      // Obtener datos completos del usuario desde el backend
      const fullUserData = await userService.getUserById(user.id)
      console.log('AdminUsers.openModal - Datos completos obtenidos:', fullUserData)
      
      editingUser.value = {
        id: fullUserData.id,
        nombre: fullUserData.nombre || '',
        apellido: fullUserData.apellido || '',
        email: fullUserData.email || '',
        tipoDocumento: fullUserData.tipoDocumento || 'CEDULA',
        numeroDocumento: fullUserData.numeroDocumento || '',
        fechaNacimiento: fullUserData.fechaNacimiento || '',
        NotasAdicionales: fullUserData.NotasAdicionales || '',
        role: fullUserData.role || 'estudiante',
        roleId: fullUserData.roleId,
        activo: fullUserData.activo !== undefined ? fullUserData.activo : true,
        especialidadIds: fullUserData.especialidades?.map((e: any) => e.id) || [],
        parroquiaId: fullUserData.parroquiaId || 1,
        password: '' // No enviamos la contraseña para edición
      }
      
      console.log('AdminUsers.openModal - editingUser.value asignado:', editingUser.value)
    } catch (error) {
      console.error('AdminUsers.openModal - Error al cargar datos del usuario:', error)
      // Fallback con datos básicos disponibles
      editingUser.value = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role,
  roleId: user.roleId,
        activo: user.activo,
        tipoDocumento: 'CEDULA',
        numeroDocumento: '',
        fechaNacimiento: '',
        NotasAdicionales: '',
        password: '',
        especialidadIds: user.especialidades?.map((e: any) => e.id) || [],
        parroquiaId: 1
      }
      console.log('AdminUsers.openModal - Usando datos fallback:', editingUser.value)
    } finally {
      loadingUserData.value = false
    }
  } else {
    // Modo creación - datos vacíos con valores por defecto
    editingUser.value = { 
      nombre: '', 
      apellido: '', 
      email: '', 
      role: 'estudiante' as UserRole,
      activo: true,
      tipoDocumento: 'CEDULA' as TipoDocumentoType,
      numeroDocumento: '',
      password: '',
      fechaNacimiento: '',
      NotasAdicionales: '',
      especialidadIds: [],
      parroquiaId: 1
    }
    console.log('AdminUsers.openModal - Modo creación, datos iniciales:', editingUser.value)
  }
  isModalOpen.value = true
}

// Cerrar modal
function closeModal() {
  isModalOpen.value = false
  loadingUserData.value = false
  editingUser.value = {}
  error.value = '' // Limpiar errores al cerrar
}

// Guardar usuario (crear o actualizar)
async function handleSave(data: FormUser) {
  isModalOpen.value = false
  loading.value = true
  error.value = ''
  
  try {
    if (data.id) {
      // Actualizar usuario existente
      console.log('Actualizando usuario con ID:', data.id, 'Datos:', data)
      await userService.updateUser(data.id, data)
      console.log('Usuario actualizado exitosamente')
    } else {
      // Crear nuevo usuario
      console.log('Creando nuevo usuario:', data)
      await userService.createUser(data)
      console.log('Usuario creado exitosamente')
    }
    await loadUsers()
    
    // Mostrar mensaje de éxito (opcional - puedes agregar un toast/notification aquí)
    console.log(`Usuario ${data.id ? 'actualizado' : 'creado'} exitosamente`)
    
  } catch (err: any) {
    error.value = err.message || 'Error al guardar usuario'
    console.error('Error al guardar usuario:', err)
    
    // Volver a abrir el modal para que el usuario pueda corregir
    setTimeout(() => {
      editingUser.value = data
      isModalOpen.value = true
    }, 100)
  } finally {
    loading.value = false
  }
}

// Alternar activo/inactivo
async function onToggleActive(user: User) {
  loading.value = true
  error.value = ''
  try {
    await userService.toggleUserActive(user.id)
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || 'Error al actualizar estado'
    console.error('Error al cambiar estado:', err)
  } finally {
    loading.value = false
  }
}

// Eliminar usuario
async function onDelete(id: number) {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return
  
  loading.value = true
  error.value = ''
  try {
    await userService.deleteUser(id)
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || 'Error al eliminar usuario'
    console.error('Error al eliminar usuario:', err)
  } finally {
    loading.value = false
  }
}

// Manejar éxito de operaciones masivas (carga y desactivación)
async function onBulkOperationSuccess() {
  // Recargar la lista de usuarios después de operaciones masivas
  await loadUsers()
}

// Clases para badges de rol
function roleBadgeClassByNombre(roleNombre?: string, role?: UserRole) {
  const key = roleNombre ? roleNombre.toString().trim().toUpperCase() : ''
  if (key === 'ADMIN') return 'badge bg-danger'
  if (key === 'PROFESOR') return 'badge bg-success'
  if (key === 'ESTUDIANTE') return 'badge bg-info text-dark'
  if (key === 'SECRETARIO') return 'badge bg-warning text-dark'
  // Fallback usando role mapeado
  return {
    'badge bg-danger': role === 'admin',
    'badge bg-success': role === 'profesor',
    'badge bg-info text-dark': role === 'estudiante',
    'badge bg-warning text-dark': role === 'secretario',
    'badge bg-secondary': role !== 'admin' && role !== 'profesor' && role !== 'estudiante' && role !== 'secretario'
  }
}

function roleDisplay(roleNombre?: string, role?: UserRole) {
  const labelMap: Record<string, string> = {
    ADMIN: 'Administrador',
    PROFESOR: 'Profesor',
    ESTUDIANTE: 'Estudiante',
    SECRETARIO: 'Secretario',
    PACIENTE: 'Paciente'
  }
  if (roleNombre && labelMap[roleNombre]) return labelMap[roleNombre]
  const fallback: Record<UserRole, string> = {
    admin: 'Administrador',
    profesor: 'Profesor',
    estudiante: 'Estudiante',
    secretario: 'Secretario',
    paciente: 'Paciente'
  }
  return role ? fallback[role] : 'Rol'
}
</script>

<style src="@/assets/css/pages/admin/AdminUsers.css" scoped></style>