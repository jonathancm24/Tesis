<template>
  <section class="usuarios-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Administración</p>
        <h1>Gestión de usuarios</h1>
        <p class="subtitle">
          Administra usuarios, busca rápidamente y gestiona el estado de las cuentas.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" type="button" @click="handleOpenImport">
          Cargar Excel
        </button>
        <button class="btn btn-primary" type="button" @click="handleCreateNew">
          Nuevo usuario
        </button>
      </div>
    </header>

    <!-- Banner de error (mantiene la tabla visible) -->
    <div v-if="usuariosStore.error && !usuariosStore.isLoading" class="error-banner">
      <span class="error-icon">⚠</span>
      <span class="error-message">{{ usuariosStore.error }}</span>
      <button class="btn-close-error" @click="usuariosStore.error = null" aria-label="Cerrar">×</button>
    </div>

    <div class="layout">
      <div class="card">
        <div class="card-header">
          <div class="search-bar">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar por nombre, apellido o email"
              aria-label="Buscar usuarios"
            />
            <select v-model="statusFilter" aria-label="Filtrar por estado">
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div class="summary">
            <span>Mostrando {{ filteredUsers.length }} usuarios</span>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading state -->
              <tr v-if="usuariosStore.isLoading && usuariosStore.usuarios.length === 0">
                <td colspan="5" class="empty-state">
                  <div class="loading-spinner"></div>
                  Cargando usuarios...
                </td>
              </tr>
              <!-- Data rows -->
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-info">
                    <span class="user-name">{{ user.nombre }} {{ user.apellido }}</span>
                    <span class="user-doc">{{ user.tipoDocumento }} · {{ user.numeroDocumento }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.role?.nombre || 'Sin rol' }}</td>
                <td>
                  <span :class="['badge', user.activo ? 'badge-success' : 'badge-muted']">
                    {{ user.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions-col">
                  <button class="btn btn-link" type="button" @click="handleEdit(user)" :disabled="usuariosStore.isLoading">
                    Editar
                  </button>
                  <button
                    class="btn btn-link"
                    type="button"
                    @click="toggleActive(user)"
                    :disabled="usuariosStore.isLoading"
                  >
                    {{ user.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
              <!-- Empty state -->
              <tr v-if="!usuariosStore.isLoading && filteredUsers.length === 0">
                <td colspan="5" class="empty-state">
                  No se encontraron usuarios con los filtros actuales.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="card form-card">
        <div class="card-header">
          <div>
            <h2>{{ isEditing ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
            <p class="subtitle">Completa los campos básicos para crear o actualizar.</p>
          </div>
          <span class="badge" :class="isEditing ? 'badge-info' : 'badge-primary'">
            {{ isEditing ? 'Edición' : 'Registro' }}
          </span>
        </div>

        <form class="user-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <label>
              Nombre
              <input v-model="form.nombre" type="text" required />
            </label>
            <label>
              Apellido
              <input v-model="form.apellido" type="text" required />
            </label>
            <label>
              Email
              <input v-model="form.email" type="email" required />
            </label>
            <label>
              Fecha de Nacimiento
              <input v-model="form.fechaNacimiento" type="date" required />
            </label>
            <label v-if="!isEditing">
              Contraseña
              <input v-model="form.password" type="password" :required="!isEditing" placeholder="Mínimo 8 caracteres" />
            </label>
            <label>
              Rol
              <select v-model="form.role" required>
                <option disabled value="">Selecciona un rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Docente">Docente</option>
                <option value="Estudiante">Estudiante</option>
                <option value="Secretario">Secretario</option>
              </select>
            </label>

            <div class="full-width" v-if="requiereEspecialidades(form.role)">
              <label class="label-title">
                Especialidades * 
                <span class="label-hint">(selecciona al menos una)</span>
              </label>
              <div class="especialidades-grid">
                <div
                  v-for="especialidad in especialidades"
                  :key="especialidad.id"
                  class="checkbox-item"
                >
                  <input
                    :id="`esp-create-${especialidad.id}`"
                    type="checkbox"
                    :value="especialidad.id"
                    :checked="form.especialidadIds.includes(especialidad.id)"
                    @change="toggleEspecialidad(especialidad.id)"
                  />
                  <label :for="`esp-create-${especialidad.id}`" class="checkbox-label">
                    {{ especialidad.nombre }}
                  </label>
                </div>
              </div>
              <p v-if="form.especialidadIds.length === 0 && requiereEspecialidades(form.role)" class="hint-text error">
                Debes seleccionar al menos una especialidad
              </p>
              <p v-else-if="form.especialidadIds.length > 0" class="hint-text success">
                {{ form.especialidadIds.length }} especialidad(es) seleccionada(s)
              </p>
            </div>

            <label>
              Tipo documento
              <select v-model="form.tipoDocumento" required>
                <option :value="TipoDocumento.CEDULA">Cédula</option>
                <option :value="TipoDocumento.PASAPORTE">Pasaporte</option>
                <option :value="TipoDocumento.RUC">RUC</option>
                <option :value="TipoDocumento.OTRO">Otro</option>
              </select>
            </label>
            <label>
              Número documento
              <input v-model="form.numeroDocumento" type="text" required />
            </label>
            <label>
              Teléfono (opcional)
              <input v-model="form.telefono" type="tel" />
            </label>
            <label class="full-width">
              Dirección (opcional)
              <input v-model="form.direccion" type="text" />
            </label>
          </div>

          <div class="form-actions">
            <button class="btn btn-secondary" type="button" @click="handleReset" :disabled="usuariosStore.isLoading">
              Limpiar
            </button>
            <button class="btn btn-primary" type="submit" :disabled="usuariosStore.isLoading">
              {{ usuariosStore.isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </aside>
    </div>

    <!-- Modal de importación -->
    <ImportUsuariosModal 
      :is-open="isImportModalOpen" 
      @close="isImportModalOpen = false"
      @success="handleImportSuccess"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useUsuariosStore } from '@/stores/admin/usuarios'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import { especialidadesService } from '@/services/Admin/especialidades.service'
import { TipoDocumento, type Usuario } from '@/types/usuarios.types'
import type { Especialidad } from '@/types/especialidades.types'
import ImportUsuariosModal from '@/components/admin/ImportUsuariosModal.vue'

const usuariosStore = useUsuariosStore()
const { success, error: showError } = useToast()

const searchTerm = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const selectedUserId = ref<number | null>(null)
const isImportModalOpen = ref(false)
const especialidades = ref<Especialidad[]>([])

// Mapeo de roles (IDs del backend)
const rolesMap = ref<{ [key: string]: number }>({
  'Administrador': 1,
  'Docente': 2,
  'Profesor': 2,
  'PROFESOR': 2,
  'Estudiante': 3,
  'ESTUDIANTE': 3,
  'ADMIN': 1,
  'Secretario': 4
})

const roleIdToLabel: Record<number, string> = {
  1: 'Administrador',
  2: 'Docente',
  3: 'Estudiante',
  4: 'Secretario'
}

const requiereEspecialidades = (role: string) => {
  const normalized = role.trim().toUpperCase()
  return normalized === 'DOCENTE' || normalized === 'PROFESOR' || normalized === 'ESTUDIANTE'
}

const resolveRoleId = (role: string) => {
  const direct = rolesMap.value[role]
  if (direct) return direct
  return rolesMap.value[role.trim().toUpperCase()] || 0
}

const form = reactive({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  password: '',
  role: '',
  especialidadIds: [] as number[],
  tipoDocumento: TipoDocumento.CEDULA,
  numeroDocumento: '',
  telefono: '',
  direccion: ''
})

// Cargar usuarios al montar el componente
onMounted(async () => {
  try {
    const [_, especialidadesData] = await Promise.all([
      usuariosStore.fetchUsuarios(),
      especialidadesService.getAll()
    ])
    especialidades.value = especialidadesData
  } catch (err) {
    showError(getErrorMessage(err))
  }
})

// Computed para usuarios filtrados (ahora usa el store)
const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return usuariosStore.usuarios.filter((user) => {
    const matchesTerm =
      !term ||
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && user.activo) ||
      (statusFilter.value === 'inactive' && !user.activo)

    return matchesTerm && matchesStatus
  })
})

const isEditing = computed(() => selectedUserId.value !== null)

const handleCreateNew = () => {
  selectedUserId.value = null
  handleReset()
}

const handleEdit = (user: Usuario) => {
  selectedUserId.value = user.id
  form.nombre = user.nombre
  form.apellido = user.apellido
  form.email = user.email
  form.fechaNacimiento = user.fechaNacimiento?.split('T')[0] ?? '' // Formato YYYY-MM-DD
  form.role = roleIdToLabel[user.role?.id || 0] || user.role?.nombre || ''
  form.especialidadIds = user.especialidades?.map((esp) => esp.id) || []
  form.tipoDocumento = user.tipoDocumento
  form.numeroDocumento = user.numeroDocumento
  form.telefono = user.telefono || ''
  form.direccion = user.direccion || ''
  form.password = '' // No mostrar contraseña actual
}

const toggleEspecialidad = (especialidadId: number) => {
  const index = form.especialidadIds.indexOf(especialidadId)
  if (index > -1) {
    form.especialidadIds.splice(index, 1)
  } else {
    form.especialidadIds.push(especialidadId)
  }
}

const handleReset = () => {
  form.nombre = ''
  form.apellido = ''
  form.email = ''
  form.fechaNacimiento = ''
  form.password = ''
  form.role = ''
  form.especialidadIds = []
  form.tipoDocumento = TipoDocumento.CEDULA
  form.numeroDocumento = ''
  form.telefono = ''
  form.direccion = ''
}

const handleSubmit = async () => {
  try {
    // Validación básica
    if (!form.nombre || !form.apellido || !form.email || !form.fechaNacimiento || !form.numeroDocumento || !form.role) {
      showError('Por favor completa todos los campos requeridos')
      return
    }

    // Verificar que tipoDocumento sea válido
    const tiposValidos = [TipoDocumento.CEDULA, TipoDocumento.PASAPORTE, TipoDocumento.RUC, TipoDocumento.OTRO]
    if (!tiposValidos.includes(form.tipoDocumento)) {
      showError('Tipo de documento no válido')
      return
    }

    if (isEditing.value && selectedUserId.value) {
      // Actualizar usuario existente
      const roleId = resolveRoleId(form.role)
      if (!roleId) {
        showError('Rol no válido')
        return
      }

      if (requiereEspecialidades(form.role) && form.especialidadIds.length === 0) {
        showError('Debes seleccionar al menos una especialidad para este rol')
        return
      }
      
      const updateData = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim().toLowerCase(),
        fechaNacimiento: form.fechaNacimiento,
        roleId: roleId,
        especialidadIds: form.especialidadIds,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento.trim(),
        telefono: form.telefono?.trim() || undefined,
        direccion: form.direccion?.trim() || undefined
      }
      
      await usuariosStore.updateUsuario(selectedUserId.value, updateData)
      success('Usuario actualizado exitosamente')
    } else {
      // Validar contraseña para creación
      if (!form.password || form.password.length < 8) {
        showError('La contraseña debe tener al menos 8 caracteres')
        return
      }

      // Crear nuevo usuario
      const roleId = resolveRoleId(form.role)
      if (!roleId) {
        showError('Rol no válido')
        return
      }

      if (requiereEspecialidades(form.role) && form.especialidadIds.length === 0) {
        showError('Debes seleccionar al menos una especialidad para este rol')
        return
      }
      
      const createData = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim().toLowerCase(),
        fechaNacimiento: form.fechaNacimiento,
        password: form.password,
        roleId: roleId,
        especialidadIds: form.especialidadIds,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento.trim(),
        telefono: form.telefono?.trim() || undefined,
        direccion: form.direccion?.trim() || undefined,
        activo: true
      }
      
      await usuariosStore.createUsuario(createData)
      success('Usuario creado exitosamente')
    }

    handleCreateNew()
  } catch (err) {
    showError(getErrorMessage(err))
  }
}

const toggleActive = async (user: Usuario) => {
  try {
    if (user.activo) {
      await usuariosStore.deactivateUsuario(user.id)
      success(`Usuario ${user.nombre} ${user.apellido} desactivado`)
    } else {
      await usuariosStore.activateUsuario(user.id)
      success(`Usuario ${user.nombre} ${user.apellido} activado`)
    }
  } catch (err) {
    showError(getErrorMessage(err))
  }
}

const handleOpenImport = () => {
  isImportModalOpen.value = true
}

const handleImportSuccess = async () => {
  // Refrescar la lista de usuarios después de una importación exitosa
  try {
    await usuariosStore.fetchUsuarios()
  } catch (err) {
    showError(getErrorMessage(err))
  }
}
</script>

<style scoped src="@/assets/styles/admin/usuarios.css"></style>
