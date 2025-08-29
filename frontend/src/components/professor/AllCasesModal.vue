<!-- src/components/professor/AllCasesModal.vue -->
<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-list-alt me-2"></i>
          Todos los Casos Pendientes
        </h3>
        <button type="button" class="btn-close" @click="close" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Filtros -->
        <div class="filters-section mb-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Especialidad</label>
              <select class="form-control" v-model="filters.especialidadId">
                <option value="">Todas las especialidades</option>
                <option value="1">Endodoncia</option>
                <option value="2">Ortodoncia</option>
                <option value="3">Periodoncia</option>
                <option value="4">Cirugía Oral</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select class="form-control" v-model="filters.estado">
                <option value="">Todos los estados</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="APROBADO">Aprobado</option>
                <option value="PENDIENTE_ESTUDIOS">Pendiente Estudios</option>
                <option value="EN_TRATAMIENTO">En Tratamiento</option>
              </select>
            </div>
          </div>
          <div class="row g-3 mt-2">
            <div class="col-md-8">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                v-model="filters.busqueda"
                placeholder="Buscar por motivo de consulta o nombre..."
              />
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button type="button" class="btn btn-primary w-100" @click="applyFilters">
                <i class="fas fa-search me-2"></i>
                Buscar
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de casos -->
        <div class="table-container">
          <div v-if="loading" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
            <p class="mt-2 text-muted">Cargando casos...</p>
          </div>

          <div v-else-if="cases.length === 0" class="text-center py-4">
            <i class="fas fa-inbox fa-2x text-muted"></i>
            <p class="mt-2 text-muted">No se encontraron casos con los filtros aplicados</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-header sticky-thead">
                <tr>
                  <th>Estudiante</th>
                  <th>Paciente</th>
                  <th>Especialidad</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="caso in cases" :key="caso.id">
                  <td>
                    <div class="student-info">
                      <div class="mini-avatar bg-primary">
                        {{ getInitials(caso.nombreEstudiante) }}
                      </div>
                      <span>{{ caso.nombreEstudiante }}</span>
                    </div>
                  </td>
                  <td>{{ caso.nombrePaciente }}</td>
                  <td>
                    <span class="specialty-badge">{{ caso.nombreEspecialidad }}</span>
                  </td>
                  <td>
                    <div class="motivo-text">{{ truncateText(caso.motivoConsulta, 40) }}</div>
                  </td>
                  <td>
                    <span :class="getStatusClass(caso.estado)">
                      {{ getStatusLabel(caso.estado) }}
                    </span>
                    <span v-if="caso.prioridad" :class="getPriorityClass(caso.prioridad)" class="ms-1">
                      {{ caso.prioridad }}
                    </span>
                  </td>
                  <td>{{ formatDate(caso.fechaCreacion) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        @click="reviewCase(caso)"
                        title="Revisar caso"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-success"
                        @click="quickApprove(caso)"
                        title="Aprobar rápidamente"
                        v-if="caso.estado === 'EN_REVISION'"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div v-if="pagination.totalPaginas > 1" class="pagination-container mt-3">
            <nav aria-label="Navegación de casos">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: !pagination.hayPaginaAnterior }">
                  <button class="page-link" @click="goToPage(pagination.pagina - 1)" :disabled="!pagination.hayPaginaAnterior">
                    Anterior
                  </button>
                </li>
                <li 
                  v-for="page in getVisiblePages()" 
                  :key="page" 
                  class="page-item" 
                  :class="{ active: page === pagination.pagina }"
                >
                  <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: !pagination.hayPaginaSiguiente }">
                  <button class="page-link" @click="goToPage(pagination.pagina + 1)" :disabled="!pagination.hayPaginaSiguiente">
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="cases-summary">
          <span class="text-muted">
            Mostrando {{ cases.length }} de {{ pagination.total }} casos
          </span>
        </div>
        <button type="button" class="btn btn-secondary" @click="close">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { CasoClinicoResumen, EstadoCasoClinicoType, FiltrosCasosClinico } from '@/types/clinicalCase'
import { fetchProfessorCases, updateCaseStatus } from '@/services/professorDashboardService'
import { useAuthStore } from '@/store/auth'
import { showToast } from '@/utils/toast'

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  reviewCase: [caso: CasoClinicoResumen]
}>()

// Store
const authStore = useAuthStore()

// Estado
const loading = ref(false)
const cases = ref<CasoClinicoResumen[]>([])
const filters = ref<FiltrosCasosClinico>({
  estado: 'EN_REVISION',
  pagina: 1,
  limite: 10
})

const pagination = ref({
  total: 0,
  pagina: 1,
  limite: 10,
  totalPaginas: 1,
  hayPaginaSiguiente: false,
  hayPaginaAnterior: false
})

// Computed
const getVisiblePages = () => {
  const current = pagination.value.pagina
  const total = pagination.value.totalPaginas
  const pages = []
  
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Métodos
const close = () => {
  emit('close')
}

const loadCases = async () => {
  if (!authStore.user?.id) return
  
  loading.value = true
  try {
    const response = await fetchProfessorCases(authStore.user.id, filters.value)
    cases.value = response.data
    pagination.value = {
      total: response.total,
      pagina: response.pagina,
      limite: response.limite,
      totalPaginas: response.totalPaginas,
      hayPaginaSiguiente: response.hayPaginaSiguiente,
      hayPaginaAnterior: response.hayPaginaAnterior
    }
  } catch (error) {
    console.error('Error al cargar casos:', error)
    showToast('Error', 'error', 'Error al cargar los casos')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  filters.value.pagina = 1
  loadCases()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPaginas) {
    filters.value.pagina = page
    loadCases()
  }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusLabel = (estado: EstadoCasoClinicoType) => {
  const labels = {
    EN_REVISION: 'En Revisión',
    APROBADO: 'Aprobado',
    PENDIENTE_ESTUDIOS: 'Pendiente Estudios',
    EN_TRATAMIENTO: 'En Tratamiento',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado'
  }
  return labels[estado] || estado
}

const getStatusClass = (estado: EstadoCasoClinicoType) => {
  const classes = {
    EN_REVISION: 'badge bg-warning',
    APROBADO: 'badge bg-success',
    PENDIENTE_ESTUDIOS: 'badge bg-info',
    EN_TRATAMIENTO: 'badge bg-primary',
    FINALIZADO: 'badge bg-success',
    CANCELADO: 'badge bg-danger'
  }
  return classes[estado] || 'badge bg-secondary'
}

const getPriorityClass = (priority: string) => {
  const classes = {
    Alta: 'badge bg-danger',
    Media: 'badge bg-warning text-dark',
    Baja: 'badge bg-success'
  }
  return classes[priority as keyof typeof classes] || 'badge bg-secondary'
}

const reviewCase = (caso: CasoClinicoResumen) => {
  emit('reviewCase', caso)
}

const quickApprove = async (caso: CasoClinicoResumen) => {
  if (confirm(`¿Está seguro de aprobar el caso de ${caso.nombreEstudiante}?`)) {
    try {
      await updateCaseStatus(caso.id, {
        estado: 'APROBADO',
        observaciones: 'Aprobado por revisión rápida'
      })
      showToast('Éxito', 'success', 'Caso aprobado correctamente')
      loadCases() // Recargar la lista
    } catch (error) {
      console.error('Error al aprobar caso:', error)
      showToast('Error', 'error', 'Error al aprobar el caso')
    }
  }
}

// Lifecycle
onMounted(() => {
  if (props.visible) {
    loadCases()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.filters-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.table-container {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table-header {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.sticky-thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.table th {
  font-weight: 600;
  color: #374151;
  padding: 1rem 0.75rem;
  border: none;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
}

.specialty-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.motivo-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.bg-warning {
  background-color: #f59e0b !important;
}

.bg-success {
  background-color: #10b981 !important;
}

.bg-info {
  background-color: #3b82f6 !important;
}

.bg-primary {
  background-color: #8b5cf6 !important;
}

.bg-danger {
  background-color: #ef4444 !important;
}

.bg-secondary {
  background-color: #6b7280 !important;
}

.text-dark {
  color: #1f2937 !important;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #667eea;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
}

.page-link:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.page-item.active .page-link {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cases-summary {
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-outline-primary {
  border: 1px solid #667eea;
  color: #667eea;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

.btn-outline-success {
  border: 1px solid #10b981;
  color: #10b981;
  background: transparent;
}

.btn-outline-success:hover {
  background: #10b981;
  color: white;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .student-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .motivo-text {
    max-width: 150px;
  }
}
</style>
