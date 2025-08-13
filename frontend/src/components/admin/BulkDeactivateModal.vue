<!-- src/components/admin/BulkDeactivateModal.vue -->
<template>
  <div class="modal fade" id="bulkDeactivateModal" tabindex="-1" aria-labelledby="bulkDeactivateModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Header del Modal -->
        <div class="modal-header">
          <h5 class="modal-title" id="bulkDeactivateModalLabel">
            <i class="fas fa-user-slash me-2"></i>
            Desactivar Usuarios Masivamente
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Cuerpo del Modal -->
        <div class="modal-body">
          <!-- Información inicial -->
          <div v-if="!isProcessing && !processResult" class="initial-content">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Atención:</strong> Esta acción desactivará los usuarios seleccionados. 
              Los usuarios desactivados no podrán acceder al sistema hasta que sean reactivados.
            </div>

            <!-- Selección de usuarios -->
            <div class="user-selection mb-4">
              <h6 class="mb-3">
                <i class="fas fa-users me-2"></i>
                Seleccionar usuarios para desactivar
              </h6>

              <!-- Buscador -->
              <div class="search-box mb-3">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input
                    v-model="searchTerm"
                    type="text"
                    class="form-control"
                    placeholder="Buscar usuarios por nombre, apellido o email..."
                  />
                </div>
              </div>

              <!-- Controles de selección -->
              <div class="selection-controls mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="selectAll"
                      :disabled="filteredActiveUsers.length === 0"
                    >
                      <i class="fas fa-check-square me-1"></i>
                      Seleccionar todos
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="deselectAll"
                      :disabled="selectedUserIds.length === 0"
                    >
                      <i class="fas fa-square me-1"></i>
                      Deseleccionar todos
                    </button>
                  </div>
                  <small class="text-muted">
                    {{ selectedUserIds.length }} de {{ filteredActiveUsers.length }} seleccionados
                  </small>
                </div>
              </div>

              <!-- Lista de usuarios -->
              <div class="users-list">
                <div v-if="filteredActiveUsers.length === 0" class="text-center py-4 text-muted">
                  <i class="fas fa-info-circle me-2"></i>
                  {{ searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios activos para desactivar' }}
                </div>

                <div v-else class="table-responsive">
                  <table class="table table-hover table-sm">
                    <thead>
                      <tr>
                        <th width="40">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            :checked="allFilteredSelected"
                            @change="toggleAllFiltered"
                          />
                        </th>
                        <th>Nombre completo</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="user in paginatedUsers"
                        :key="user.id"
                        :class="{ 'table-active': selectedUserIds.includes(user.id) }"
                      >
                        <td>
                          <input
                            type="checkbox"
                            class="form-check-input"
                            :value="user.id"
                            v-model="selectedUserIds"
                          />
                        </td>
                        <td>
                          <strong>{{ user.nombre }} {{ user.apellido }}</strong>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="badge" :class="getRoleBadgeClass(user.role)">
                            {{ getRoleDisplayName(user.role) }}
                          </span>
                        </td>
                        <td>
                          <span class="badge bg-success">Activo</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Paginación simple -->
                <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
                  <nav>
                    <ul class="pagination pagination-sm">
                      <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button
                          class="page-link"
                          @click="currentPage = Math.max(1, currentPage - 1)"
                          :disabled="currentPage === 1"
                        >
                          Anterior
                        </button>
                      </li>
                      <li
                        v-for="page in visiblePages"
                        :key="page"
                        class="page-item"
                        :class="{ active: page === currentPage }"
                      >
                        <button class="page-link" @click="currentPage = page">
                          {{ page }}
                        </button>
                      </li>
                      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button
                          class="page-link"
                          @click="currentPage = Math.min(totalPages, currentPage + 1)"
                          :disabled="currentPage === totalPages"
                        >
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>

            <!-- Resumen de selección -->
            <div v-if="selectedUserIds.length > 0" class="selection-summary">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Resumen:</strong> Se desactivarán {{ selectedUserIds.length }} usuario(s).
                Los usuarios desactivados no podrán acceder al sistema.
              </div>
            </div>
          </div>

          <!-- Estado de procesamiento -->
          <div v-if="isProcessing" class="processing-content text-center py-4">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Desactivando usuarios...</span>
            </div>
            <h6 class="mt-3">Desactivando usuarios...</h6>
            <p class="text-muted">Por favor espera mientras se procesan las desactivaciones</p>
          </div>

          <!-- Resultados del procesamiento -->
          <div v-if="processResult" class="results-content">
            <div class="alert alert-success">
              <i class="fas fa-check-circle me-2"></i>
              <strong>Proceso completado</strong>
            </div>

            <!-- Resumen de resultados -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="stat-card text-center">
                  <div class="stat-number text-success">{{ processResult.summary.successfullyDeactivated }}</div>
                  <div class="stat-label">Desactivados exitosamente</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="stat-card text-center">
                  <div class="stat-number text-danger">{{ processResult.summary.failed }}</div>
                  <div class="stat-label">Fallidos</div>
                </div>
              </div>
            </div>

            <!-- Usuarios desactivados exitosamente -->
            <div v-if="processResult.deactivated.length > 0" class="mb-4">
              <h6 class="text-success">
                <i class="fas fa-user-check me-2"></i>
                Usuarios desactivados exitosamente
              </h6>
              <div class="table-responsive">
                <table class="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in processResult.deactivated" :key="user.id">
                      <td>{{ user.nombre }} {{ user.apellido }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" :class="getRoleBadgeClass(user.role?.nombre)">
                          {{ user.role?.nombre }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-secondary">Desactivado</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Usuarios que fallaron -->
            <div v-if="processResult.failed.length > 0" class="mb-4">
              <h6 class="text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Usuarios que no pudieron ser desactivados
              </h6>
              <div class="table-responsive">
                <table class="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="failed in processResult.failed" :key="failed.id">
                      <td>{{ failed.id }}</td>
                      <td class="text-danger">{{ failed.error }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="modal-footer">
          <button
            v-if="!isProcessing && !processResult"
            type="button"
            class="btn btn-warning"
            @click="deactivateUsers"
            :disabled="selectedUserIds.length === 0"
          >
            <i class="fas fa-user-slash me-2"></i>
            Desactivar {{ selectedUserIds.length }} usuario(s)
          </button>

          <button
            v-if="processResult"
            type="button"
            class="btn btn-primary"
            @click="closeModal"
          >
            <i class="fas fa-check me-2"></i>
            Finalizar
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            @click="resetModal"
            :disabled="isProcessing"
          >
            {{ processResult ? 'Cerrar' : 'Cancelar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { User } from '@/types/user'
import { bulkUserService, type BulkDeactivateResponse } from '@/services/bulkUserService'

// Props y emits
interface Props {
  users: User[]
}

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Estado del componente
const selectedUserIds = ref<number[]>([])
const searchTerm = ref('')
const isProcessing = ref(false)
const processResult = ref<BulkDeactivateResponse | null>(null)

// Paginación
const currentPage = ref(1)
const itemsPerPage = 10

// Computed para usuarios activos
const activeUsers = computed(() => {
  return props.users.filter(user => user.activo)
})

// Computed para usuarios filtrados por búsqueda
const filteredActiveUsers = computed(() => {
  if (!searchTerm.value) {
    return activeUsers.value
  }

  const term = searchTerm.value.toLowerCase()
  return activeUsers.value.filter(user =>
    user.nombre.toLowerCase().includes(term) ||
    user.apellido.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term)
  )
})

// Computed para paginación
const totalPages = computed(() => {
  return Math.ceil(filteredActiveUsers.value.length / itemsPerPage)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredActiveUsers.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Computed para selección
const allFilteredSelected = computed(() => {
  return filteredActiveUsers.value.length > 0 &&
    filteredActiveUsers.value.every(user => selectedUserIds.value.includes(user.id))
})

/**
 * Selecciona todos los usuarios filtrados
 */
const selectAll = () => {
  selectedUserIds.value = [...filteredActiveUsers.value.map(user => user.id)]
}

/**
 * Deselecciona todos los usuarios
 */
const deselectAll = () => {
  selectedUserIds.value = []
}

/**
 * Alterna la selección de todos los usuarios filtrados
 */
const toggleAllFiltered = () => {
  if (allFilteredSelected.value) {
    // Deseleccionar los filtrados
    const filteredIds = filteredActiveUsers.value.map(user => user.id)
    selectedUserIds.value = selectedUserIds.value.filter(id => !filteredIds.includes(id))
  } else {
    // Seleccionar los filtrados
    const filteredIds = filteredActiveUsers.value.map(user => user.id)
    const newIds = filteredIds.filter(id => !selectedUserIds.value.includes(id))
    selectedUserIds.value = [...selectedUserIds.value, ...newIds]
  }
}

/**
 * Desactiva los usuarios seleccionados
 */
const deactivateUsers = async () => {
  if (selectedUserIds.value.length === 0) return

  isProcessing.value = true

  try {
    processResult.value = await bulkUserService.bulkDeactivateUsers(selectedUserIds.value)
  } catch (error: any) {
    alert('Error al desactivar usuarios: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

/**
 * Cierra el modal y emite evento de éxito
 */
const closeModal = () => {
  // Cerrar modal usando Bootstrap
  const modal = document.getElementById('bulkDeactivateModal')
  if (modal) {
    const bsModal = (window as any).bootstrap.Modal.getInstance(modal)
    if (bsModal) {
      bsModal.hide()
    }
  }

  // Emitir evento de éxito para refrescar la lista
  emit('success')

  // Reset modal
  resetModal()
}

/**
 * Resetea el estado del modal
 */
const resetModal = () => {
  selectedUserIds.value = []
  searchTerm.value = ''
  isProcessing.value = false
  processResult.value = null
  currentPage.value = 1
}

/**
 * Obtiene la clase CSS para el badge del rol
 */
const getRoleBadgeClass = (role: string): string => {
  const roleClasses = {
    'admin': 'bg-danger',
    'profesor': 'bg-success',
    'estudiante': 'bg-info',
    'secretario': 'bg-warning',
    'paciente': 'bg-secondary'
  }
  return roleClasses[role as keyof typeof roleClasses] || 'bg-secondary'
}

/**
 * Obtiene el nombre a mostrar del rol
 */
const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    'admin': 'Administrador',
    'profesor': 'Profesor',
    'estudiante': 'Estudiante',
    'secretario': 'Secretario',
    'paciente': 'Paciente'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

// Observar cambios en el término de búsqueda para resetear la página
watch(searchTerm, () => {
  currentPage.value = 1
})

// Limpiar selección cuando cambian los props
watch(() => props.users, () => {
  selectedUserIds.value = []
})
</script>

<style src="@/assets/css/components/BulkDeactivateModal.css" scoped></style>
