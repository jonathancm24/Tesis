<template>
  <div class="clinical-cases-container">
    <!-- Header con título y acciones principales -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="clinical-title">
            <i class="fas fa-stethoscope me-2"></i>
            Casos Clínicos
          </h2>
          <p class="clinical-subtitle mb-0">Gestión integral de casos clínicos odontológicos</p>
        </div>
        <div class="header-actions">
          <button 
            class="btn btn-primary btn-lg clinical-btn"
            @click="showCreateModal = true"
          >
            <i class="fas fa-plus me-2"></i>
            Nuevo Caso
          </button>
        </div>
      </div>
    </div>

    <!-- Panel de filtros y búsqueda -->
    <div class="filters-panel clinical-card mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              class="form-control clinical-input"
              placeholder="Buscar por paciente, diagnóstico..."
              v-model="searchTerm"
              @input="debouncedSearch"
            >
          </div>
        </div>
        <div class="col-md-2">
          <select class="form-select clinical-select" v-model="filterStatus">
            <option value="">Todos los estados</option>
            <option v-for="state in clinicalStates" :key="state.value" :value="state.value">
              {{ state.label }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select clinical-select" v-model="filterSpecialty">
            <option value="">Todas las especialidades</option>
            <option value="Endodoncia">Endodoncia</option>
            <option value="Periodoncia">Periodoncia</option>
            <option value="Ortodoncia">Ortodoncia</option>
            <option value="Cirugía Oral">Cirugía Oral</option>
            <option value="Rehabilitación">Rehabilitación</option>
          </select>
        </div>
        <div class="col-md-2">
          <input
            type="date"
            class="form-control clinical-input"
            v-model="filterDateFrom"
            title="Fecha desde"
          >
        </div>
        <div class="col-md-2">
          <button class="btn btn-outline-primary clinical-btn w-100" @click="clearFilters">
            <i class="fas fa-filter-circle-xmark me-1"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-panel mb-4">
      <div class="row g-3">
        <div class="col-md-3" v-for="stat in statistics" :key="stat.label">
          <div class="stat-card clinical-card">
            <div class="stat-icon" :class="stat.colorClass">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stat.value }}</h3>
              <p class="stat-label">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de casos clínicos -->
    <div class="cases-grid">
      <div class="row g-4">
        <div class="col-md-12" v-if="loading">
          <div class="loading-container clinical-card">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 mb-0">Cargando casos clínicos...</p>
          </div>
        </div>

        <div class="col-md-12" v-else-if="filteredCases.length === 0">
          <div class="empty-state clinical-card">
            <i class="fas fa-folder-open empty-icon"></i>
            <h4>No hay casos clínicos</h4>
            <p class="text-muted">
              {{ searchTerm ? 'No se encontraron casos que coincidan con tu búsqueda.' : 'Aún no tienes casos clínicos registrados.' }}
            </p>
            <button 
              class="btn btn-primary clinical-btn"
              @click="showCreateModal = true"
              v-if="!searchTerm"
            >
              <i class="fas fa-plus me-2"></i>
              Crear primer caso
            </button>
          </div>
        </div>

        <div class="col-md-6 col-lg-4" v-for="case_ in filteredCases" :key="case_.id">
          <div class="case-card clinical-card" @click="viewCaseDetails(case_.id)">
            <div class="case-header">
              <div class="case-status">
                <span class="status-badge" :class="getStatusClass(case_.estado)">
                  {{ getStatusLabel(case_.estado) }}
                </span>
              </div>
              <div class="case-actions">
                <div class="dropdown">
                  <button 
                    class="btn btn-sm btn-link text-muted"
                    type="button"
                    :id="`dropdown-${case_.id}`"
                    data-bs-toggle="dropdown"
                    @click.stop
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu" :aria-labelledby="`dropdown-${case_.id}`">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="viewCaseDetails(case_.id)">
                        <i class="fas fa-eye me-2"></i>Ver detalles
                      </a>
                    </li>
                    <li v-if="canEditCase(case_)">
                      <a class="dropdown-item" href="#" @click.prevent="editCase(case_)">
                        <i class="fas fa-edit me-2"></i>Editar
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="manageFiles(case_.id)">
                        <i class="fas fa-paperclip me-2"></i>Gestionar archivos
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="downloadReport(case_.id)">
                        <i class="fas fa-download me-2"></i>Descargar reporte
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="case-content">
              <h5 class="case-title">
                {{ getPatientFullName(case_.paciente) }}
              </h5>
              <p class="case-specialty">
                <i class="fas fa-tooth me-1"></i>
                {{ getSpecialtyName(case_.especialidad) }}
              </p>
              <p class="case-diagnosis">
                <strong>Diagnóstico:</strong> 
                {{ case_.diagnostico || case_.motivoConsulta || 'Sin diagnóstico registrado' }}
              </p>
              <p class="case-treatment" v-if="case_.tratamiento || case_.planTratamiento">
                <strong>Tratamiento:</strong> 
                {{ case_.tratamiento || case_.planTratamiento }}
              </p>
            </div>

            <div class="case-footer">
              <div class="case-meta">
                <span class="case-date">
                  <i class="far fa-calendar-alt me-1"></i>
                  {{ formatDate(case_.fechaCreacion) }}
                </span>
                <span class="case-code" v-if="case_.codigo">
                  <i class="fas fa-barcode me-1"></i>
                  {{ case_.codigo }}
                </span>
              </div>
              <div class="case-indicators">
                <span v-if="case_.tieneOdontograma" class="indicator-badge" title="Tiene odontograma">
                  <i class="fas fa-tooth"></i>
                </span>
                <span v-if="case_.tieneMucosa" class="indicator-badge" title="Tiene registro de mucosa">
                  <i class="fas fa-microscope"></i>
                </span>
                <span v-if="case_.archivos && case_.archivos.length > 0" class="indicator-badge" title="Tiene archivos adjuntos">
                  <i class="fas fa-paperclip"></i>
                  {{ case_.archivos.length }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination-container mt-4" v-if="totalPages > 1">
      <nav aria-label="Paginación de casos clínicos">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>
          <li 
            class="page-item" 
            v-for="page in visiblePages" 
            :key="page"
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modal para crear nuevo caso -->
    <CreateCaseModal
      v-model:show="showCreateModal"
      @case-created="handleCaseCreated"
    />

    <!-- Modal para ver detalles del caso -->
    <CaseDetailsModal
      v-model:show="showDetailsModal"
      :case-id="selectedCaseId"
      @case-updated="handleCaseUpdated"
    />

    <!-- Modal para editar caso -->
    <EditCaseModal
      v-model:show="showEditModal"
      :case-data="selectedCase"
      @case-updated="handleCaseUpdated"
    />

    <!-- Modal para gestionar archivos -->
    <FileManagementModal
      v-model:show="showFilesModal"
      :case-id="selectedCaseId"
      @files-updated="loadCases"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import * as clinicalService from '@/services/clinicalCasesService'
import CreateCaseModal from '@/components/modals/CreateCaseModal.vue'
import CaseDetailsModal from '@/components/modals/CaseDetailsModal.vue'
import EditCaseModal from '@/components/modals/EditCaseModal.vue'
import FileManagementModal from '@/components/modals/FileManagementModal.vue'

// Interfaces
interface Paciente {
  id?: number | string
  nombres?: string
  apellidos?: string
  nombre?: string  // Variaciones que pueden venir del backend
  apellido?: string
}

interface Archivo {
  id: number | string
  nombre: string
  categoria?: string
}

interface CasoClinico {
  id: number | string
  codigo?: string
  paciente?: Paciente
  especialidad?: string | { id: number; nombre: string }
  diagnostico?: string
  motivoConsulta?: string
  tratamiento?: string
  planTratamiento?: string
  estado: string
  fechaCreacion: string
  fechaActualizacion?: string
  tieneOdontograma?: boolean
  tieneMucosa?: boolean
  archivos?: Archivo[]
}

interface EstadoClinico {
  value: string
  label: string
  color: string
}

interface Estadistica {
  label: string
  value: number
  icon: string
  colorClass: string
}

// Simple debounce function
function debounce(func: Function, delay: number) {
  let timeoutId: number | undefined
  return function (...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => func(...args), delay)
  }
}

// Stores
const authStore = useAuthStore()

// Estado de la aplicación
const loading = ref(true)
const cases = ref<CasoClinico[]>([])
const clinicalStates = ref<EstadoClinico[]>([])
const statistics = ref<Estadistica[]>([
  { label: 'Total Casos', value: 0, icon: 'fas fa-clipboard-list', colorClass: 'bg-primary' },
  { label: 'En Revisión', value: 0, icon: 'fas fa-hourglass-half', colorClass: 'bg-warning' },
  { label: 'Aprobados', value: 0, icon: 'fas fa-check-circle', colorClass: 'bg-success' },
  { label: 'Finalizados', value: 0, icon: 'fas fa-flag-checkered', colorClass: 'bg-info' }
])

// Filtros y búsqueda
const searchTerm = ref('')
const filterStatus = ref('')
const filterSpecialty = ref('')
const filterDateFrom = ref('')

// Paginación
const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalItems = ref(0)

// Modales
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const showFilesModal = ref(false)
const selectedCaseId = ref<number | string | null>(null)
const selectedCase = ref<CasoClinico | null>(null)

// Computed properties
const filteredCases = computed(() => {
  let filtered = cases.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(case_ => {
      const patientName = getPatientFullName(case_.paciente).toLowerCase()
      return patientName.includes(term) ||
        (case_.diagnostico?.toLowerCase().includes(term) || false) ||
        (case_.tratamiento?.toLowerCase().includes(term) || false) ||
        (case_.codigo?.toLowerCase().includes(term) || false)
    })
  }

  if (filterStatus.value) {
    filtered = filtered.filter(case_ => case_.estado === filterStatus.value)
  }

  if (filterSpecialty.value) {
    filtered = filtered.filter(case_ => case_.especialidad === filterSpecialty.value)
  }

  if (filterDateFrom.value) {
    filtered = filtered.filter(case_ => 
      new Date(case_.fechaCreacion) >= new Date(filterDateFrom.value)
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const visiblePages = computed(() => {
  const pages = []
  const startPage = Math.max(1, currentPage.value - 2)
  const endPage = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

// Métodos
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadCases()
}, 500)

const loadCases = async () => {
  try {
    loading.value = true
    
    const params = {
      pagina: currentPage.value,
      limite: itemsPerPage.value,
      busqueda: searchTerm.value,
      estado: filterStatus.value,
      especialidadId: filterSpecialty.value,
      fechaDesde: filterDateFrom.value
    }

    // Limpiar parámetros vacíos
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === '' || params[key as keyof typeof params] === null || params[key as keyof typeof params] === undefined) {
        delete params[key as keyof typeof params]
      }
    })

    console.log('Cargando casos con parámetros:', params)

    let response
    if (authStore.user?.id) {
      // Si tenemos el ID del usuario, obtener casos específicos del estudiante
      response = await clinicalService.fetchStudentClinicalCases(authStore.user.id, params)
    } else {
      // Si no, obtener casos generales (para desarrollo)
      response = await clinicalService.fetchClinicalCases(params)
    }
    
    console.log('Respuesta del backend:', response)
    
    // Procesar la respuesta del backend
    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        cases.value = response.data
        totalItems.value = response.total || response.data.length
      } else if (Array.isArray(response)) {
        cases.value = response
        totalItems.value = response.length
      } else {
        console.warn('Formato de respuesta inesperado:', response)
        cases.value = []
        totalItems.value = 0
      }
    } else {
      cases.value = []
      totalItems.value = 0
    }
    
    updateStatistics()
  } catch (error) {
    console.error('Error loading cases:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    // Solo usar datos simulados si hay un error real de backend
    loadSimulatedData()
  } finally {
    loading.value = false
  }
}

const loadSimulatedData = () => {
  cases.value = [
    {
      id: 'demo-1',
      codigo: 'CC-2025-001',
      paciente: { 
        nombres: 'María Elena', 
        apellidos: 'García López',
        nombre: 'María Elena',  // Formato alternativo del backend
        apellido: 'García López'
      },
      especialidad: 'Endodoncia',
      diagnostico: 'Pulpitis irreversible en pieza 16',
      tratamiento: 'Tratamiento de conducto radicular',
      estado: 'EN_REVISION',
      fechaCreacion: '2025-01-15',
      tieneOdontograma: true,
      tieneMucosa: false,
      archivos: [{ id: 1, nombre: 'radiografia.jpg' }, { id: 2, nombre: 'foto_inicial.jpg' }]
    },
    {
      id: 'demo-2',
      codigo: 'CC-2025-002',
      paciente: { 
        nombres: 'Carlos Alberto', 
        apellidos: 'Ruiz Mendoza',
        nombre: 'Carlos Alberto',
        apellido: 'Ruiz Mendoza'
      },
      especialidad: 'Periodoncia',
      diagnostico: 'Gingivitis crónica generalizada',
      tratamiento: 'Profilaxis y educación en higiene oral',
      estado: 'APROBADO',
      fechaCreacion: '2025-01-10',
      tieneOdontograma: true,
      tieneMucosa: true,
      archivos: [{ id: 3, nombre: 'plan_tratamiento.pdf' }]
    },
    {
      id: 'demo-3',
      codigo: 'CC-2025-003',
      paciente: { 
        nombres: 'Ana Sofía', 
        apellidos: 'López Vargas',
        nombre: 'Ana Sofía',
        apellido: 'López Vargas'
      },
      especialidad: 'Ortodoncia',
      diagnostico: 'Maloclusión clase II división 1',
      tratamiento: 'Brackets metálicos autoligables',
      estado: 'EN_TRATAMIENTO',
      fechaCreacion: '2025-01-08',
      tieneOdontograma: true,
      tieneMucosa: false,
      archivos: []
    }
  ]
  updateStatistics()
}

const loadStates = async () => {
  try {
    clinicalStates.value = await clinicalService.fetchClinicalCaseStates()
  } catch (error) {
    console.error('Error loading states:', error)
    clinicalStates.value = [
      { value: 'EN_REVISION', label: 'En Revisión', color: 'warning' },
      { value: 'APROBADO', label: 'Aprobado', color: 'success' },
      { value: 'PENDIENTE_ESTUDIOS', label: 'Pendiente Estudios', color: 'info' },
      { value: 'EN_TRATAMIENTO', label: 'En Tratamiento', color: 'primary' },
      { value: 'FINALIZADO', label: 'Finalizado', color: 'secondary' },
      { value: 'CANCELADO', label: 'Cancelado', color: 'danger' }
    ]
  }
}

const updateStatistics = () => {
  const total = cases.value.length
  const enRevision = cases.value.filter(c => c.estado === 'EN_REVISION').length
  const aprobados = cases.value.filter(c => c.estado === 'APROBADO').length
  const finalizados = cases.value.filter(c => c.estado === 'FINALIZADO').length

  statistics.value = [
    { label: 'Total Casos', value: total, icon: 'fas fa-clipboard-list', colorClass: 'bg-primary' },
    { label: 'En Revisión', value: enRevision, icon: 'fas fa-hourglass-half', colorClass: 'bg-warning' },
    { label: 'Aprobados', value: aprobados, icon: 'fas fa-check-circle', colorClass: 'bg-success' },
    { label: 'Finalizados', value: finalizados, icon: 'fas fa-flag-checkered', colorClass: 'bg-info' }
  ]
}

const clearFilters = () => {
  searchTerm.value = ''
  filterStatus.value = ''
  filterSpecialty.value = ''
  filterDateFrom.value = ''
  currentPage.value = 1
  loadCases()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadCases()
  }
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'EN_REVISION': 'status-warning',
    'APROBADO': 'status-success',
    'PENDIENTE_ESTUDIOS': 'status-info',
    'EN_TRATAMIENTO': 'status-primary',
    'FINALIZADO': 'status-secondary',
    'CANCELADO': 'status-danger'
  }
  return statusMap[status] || 'status-secondary'
}

const getStatusLabel = (status: string) => {
  const state = clinicalStates.value.find(s => s.value === status)
  return state?.label || status
}

const getSpecialtyName = (especialidad: string | { id: number; nombre: string } | undefined) => {
  if (!especialidad) return 'No especificada'
  
  if (typeof especialidad === 'string') {
    return especialidad
  }
  
  if (typeof especialidad === 'object' && especialidad.nombre) {
    return especialidad.nombre
  }
  
  return 'No especificada'
}

const getPatientFullName = (paciente: Paciente | undefined) => {
  if (!paciente) return 'Paciente no especificado'
  
  // Intentar diferentes formatos de nombre que pueden venir del backend
  const firstName = paciente.nombres || paciente.nombre || ''
  const lastName = paciente.apellidos || paciente.apellido || ''
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  } else {
    return 'Nombre no disponible'
  }
}

const canEditCase = (case_: CasoClinico) => {
  return ['EN_REVISION', 'PENDIENTE_ESTUDIOS'].includes(case_.estado)
}

const viewCaseDetails = (caseId: number | string) => {
  selectedCaseId.value = caseId
  showDetailsModal.value = true
}

const editCase = (case_: CasoClinico) => {
  selectedCase.value = case_
  showEditModal.value = true
}

const manageFiles = (caseId: number | string) => {
  selectedCaseId.value = caseId
  showFilesModal.value = true
}

const downloadReport = async (caseId: number | string) => {
  try {
    const blob = await clinicalService.exportClinicalCaseReport(caseId, 'pdf')
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `caso-clinico-${caseId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading report:', error)
    alert('Error al descargar el reporte. Inténtalo nuevamente.')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleCaseCreated = () => {
  showCreateModal.value = false
  loadCases()
}

const handleCaseUpdated = () => {
  showDetailsModal.value = false
  showEditModal.value = false
  loadCases()
}

// Watchers
watch([filterStatus, filterSpecialty, filterDateFrom], () => {
  currentPage.value = 1
  loadCases()
})

// Lifecycle
onMounted(async () => {
  await loadStates()
  await loadCases()
})
</script>

<style scoped>
.clinical-cases-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Header styles */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.clinical-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.clinical-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Card styles */
.clinical-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #e8ecef;
  transition: all 0.3s ease;
}

.clinical-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Form controls */
.clinical-input, .clinical-select {
  border: 2px solid #e8ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.clinical-input:focus, .clinical-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.clinical-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.clinical-btn:hover {
  transform: translateY(-1px);
}

/* Search container */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 3;
}

.search-container input {
  padding-left: 2.5rem;
}

/* Filters panel */
.filters-panel {
  padding: 1.5rem;
}

/* Statistics panel */
.stats-panel .stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

.stat-content p {
  margin: 0;
  color: #718096;
  font-weight: 500;
}

/* Case cards */
.case-card {
  padding: 0;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1rem 0.5rem 1rem;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-warning { background: #fff3cd; color: #856404; }
.status-success { background: #d1edff; color: #0c5460; }
.status-info { background: #cce7ff; color: #055160; }
.status-primary { background: #e7f1ff; color: #0a3d62; }
.status-secondary { background: #f8f9fa; color: #495057; }
.status-danger { background: #f8d7da; color: #721c24; }

.case-content {
  padding: 0.5rem 1rem;
  flex-grow: 1;
}

.case-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.case-specialty {
  color: #667eea;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.case-diagnosis, .case-treatment {
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.case-footer {
  padding: 1rem;
  border-top: 1px solid #e8ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.case-date, .case-code {
  font-size: 0.8rem;
  color: #718096;
}

.case-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator-badge {
  background: #e7f1ff;
  color: #0a3d62;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Loading and empty states */
.loading-container, .empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .clinical-cases-container {
    padding: 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
  }
  
  .clinical-title {
    font-size: 1.5rem;
  }
  
  .filters-panel {
    padding: 1rem;
  }
  
  .stats-panel .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
}
</style>
