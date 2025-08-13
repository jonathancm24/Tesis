<!--
  Vista: HomeAdmin (Panel de Administración)
  Ruta: /admin
  CSS asociado: src/assets/css/pages/admin/HomeAdmin.css
-->
<template>
  <div class="admin-home">
    <!-- Encabezado -->
    <div class="welcome-section">
      <h1 class="h3 mb-1">Panel de Administración</h1>
      <p class="text-muted mb-0">Bienvenido al panel de control administrativo del sistema</p>
    </div>

    <!-- Estado de carga / error -->
    <div v-if="loading || error" class="my-3">
      <div v-if="loading" class="alert alert-info d-flex align-items-center gap-2">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando datos...</span>
      </div>
      <div v-else class="alert alert-danger d-flex align-items-center gap-2">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ error }}</span>
        <button class="btn btn-sm btn-outline-light ms-auto" @click="reload">Reintentar</button>
      </div>
    </div>

    <!-- Cards de estadísticas -->
    <div class="row g-4 mb-5">
      <div v-for="card in statCards" :key="card.key" class="col-xl-3 col-md-6">
        <div class="stat-card" :class="card.bgClass">
          <div class="stat-icon">
            <i :class="card.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen del Sistema -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex align-items-center">
            <i class="fas fa-chart-bar me-2"></i>
            <h5 class="mb-0">Resumen del Sistema</h5>
            <button class="btn btn-sm btn-outline-primary ms-auto" @click="reload" :disabled="loading">
              <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
              Actualizar
            </button>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <!-- Clínicas -->
              <div class="col-lg-3 col-md-6">
                <div class="overview-section">
                  <h6 class="overview-title">
                    <i class="fas fa-clinic-medical me-2"></i>
                    Clínicas
                  </h6>
                  <div class="overview-stats">
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ o.clinicas.activas }}</span>
                      <span class="stat-text">Activas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-primary">{{ o.clinicas.enRuta }}</span>
                      <span class="stat-text">En Ruta</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-warning">{{ o.clinicas.enMantenimiento }}</span>
                      <span class="stat-text">Mantenimiento</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-muted">{{ o.clinicas.inactivas }}</span>
                      <span class="stat-text">Inactivas</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Casos Clínicos Hoy -->
              <div class="col-lg-3 col-md-6">
                <div class="overview-section">
                  <h6 class="overview-title">
                    <i class="fas fa-file-medical me-2"></i>
                    Casos Hoy
                  </h6>
                  <div class="overview-stats">
                    <div class="stat-item">
                      <span class="stat-value text-info">{{ o.casosClinicosHoy.nuevos }}</span>
                      <span class="stat-text">Nuevos</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-warning">{{ o.casosClinicosHoy.enRevision }}</span>
                      <span class="stat-text">En Revisión</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ o.casosClinicosHoy.aprobados }}</span>
                      <span class="stat-text">Aprobados</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-primary">{{ o.casosClinicosHoy.enTratamiento }}</span>
                      <span class="stat-text">En Tratamiento</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Citas Hoy -->
              <div class="col-lg-3 col-md-6">
                <div class="overview-section">
                  <h6 class="overview-title">
                    <i class="fas fa-calendar-day me-2"></i>
                    Citas Hoy
                  </h6>
                  <div class="overview-stats">
                    <div class="stat-item">
                      <span class="stat-value text-primary">{{ o.citasHoy.programadas }}</span>
                      <span class="stat-text">Programadas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ o.citasHoy.completadas }}</span>
                      <span class="stat-text">Completadas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-warning">{{ o.citasHoy.canceladas }}</span>
                      <span class="stat-text">Canceladas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-danger">{{ o.citasHoy.noAsistio }}</span>
                      <span class="stat-text">No Asistió</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actividad -->
              <div class="col-lg-3 col-md-6">
                <div class="overview-section">
                  <h6 class="overview-title">
                    <!-- 'fa-activity' no existe; usamos 'fa-chart-line' -->
                    <i class="fas fa-chart-line me-2"></i>
                    Actividad
                  </h6>
                  <div class="overview-stats">
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ o.actividad.usuariosConectados }}</span>
                      <span class="stat-text">Conectados</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-info">{{ o.actividad.sesionesHoy }}</span>
                      <span class="stat-text">Sesiones Hoy</span>
                    </div>
                    <div class="stat-item text-center" style="grid-column: span 2;">
                      <div class="text-muted small">Última actividad:</div>
                      <div class="fw-bold">{{ formatLastActivity(o.actividad.ultimaActividad) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Actividad -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Solicitudes y Reportes -->
    <div class="row">
      <!-- Solicitudes -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="fas fa-inbox me-2"></i>
              <h5 class="mb-0">Solicitudes Recientes</h5>
            </div>
            <span class="badge bg-primary">{{ requests.length }}</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Solicitud</th>
                    <th>Usuario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in topRequests" :key="request.id">
                    <td>
                      <div class="fw-bold">{{ request.title }}</div>
                      <small class="text-muted">{{ request.type }}</small>
                    </td>
                    <td>
                      <div>{{ request.user }}</div>
                      <small class="text-muted">{{ request.userRole }}</small>
                    </td>
                    <td>
                      <span :class="['badge', requestStatusClass(request.status)]">
                        {{ requestStatusText(request.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          v-if="request.status === 'pendiente'"
                          @click="onUpdateRequest(request.id, 'aprobado')"
                          class="btn btn-outline-success"
                          title="Aprobar"
                        >
                          <i class="fas fa-check"></i>
                          Aprobar
                        </button>
                        <button
                          v-if="request.status === 'pendiente'"
                          @click="onUpdateRequest(request.id, 'rechazado')"
                          class="btn btn-outline-danger"
                          title="Rechazar"
                        >
                          <i class="fas fa-times"></i>
                          Rechazar
                        </button>
                        <button class="btn btn-outline-primary" title="Ver detalles">
                          <i class="fas fa-eye"></i>
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!requests.length">
                    <td colspan="4" class="text-center text-muted py-4">Sin solicitudes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Reportes de Errores -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="fas fa-bug me-2"></i>
              <h5 class="mb-0">Reportes de Errores</h5>
            </div>
            <span class="badge bg-danger">{{ pendingErrorCount }}</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Error</th>
                    <th>Usuario</th>
                    <th>Prioridad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in topErrorReports" :key="report.id">
                    <td>
                      <div class="fw-bold">{{ report.title }}</div>
                      <small class="text-muted">{{ report.category }}</small>
                    </td>
                    <td>
                      <div>{{ report.user }}</div>
                      <small class="text-muted">{{ report.userRole }}</small>
                    </td>
                    <td>
                      <span :class="['badge', priorityClass(report.priority)]">
                        {{ report.priority.toUpperCase() }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          v-if="report.status === 'pendiente'"
                          @click="onUpdateError(report.id, 'en_proceso')"
                          class="btn btn-outline-warning"
                          title="En proceso"
                        >
                          <i class="fas fa-play"></i>
                          En proceso
                        </button>
                        <button
                          v-if="report.status !== 'resuelto'"
                          @click="onUpdateError(report.id, 'resuelto')"
                          class="btn btn-outline-success"
                          title="Resolver"
                        >
                          <i class="fas fa-check"></i>
                          Resolver
                        </button>
                        <button class="btn btn-outline-primary" title="Ver detalles">
                          <i class="fas fa-eye"></i>
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!errorReports.length">
                    <td colspan="4" class="text-center text-muted py-4">Sin reportes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- /Reportes -->
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * HomeAdmin.vue — Panel de administración
 * Integra con el backend real para mostrar datos actuales del sistema
 */
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from '@/composables/useToast'
import type { AdminStats, SystemOverview } from '@/types/admin'

// Importar tipos del mock para compatibilidad temporal
type ErrorReport = {
  id: number
  title: string
  description: string
  user: string
  userRole: string
  priority: 'baja' | 'media' | 'alta' | 'critica'
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado'
  createdAt: string
  updatedAt: string
  category: string
}

type Request = {
  id: number
  title: string
  description: string
  user: string
  userRole: string
  type: string
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso'
  createdAt: string
  updatedAt: string
}

/* Estado */
const stats = ref<AdminStats | null>(null)
const systemOverview = ref<SystemOverview | null>(null)
const errorReports = ref<ErrorReport[]>([])
const requests = ref<Request[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const { showToast } = useToast()

/* Carga de datos desde el backend */
const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    // Cargar datos en paralelo desde el backend
    const [statsData, overviewData, requestsData, errorsData] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getSystemOverview(),
      adminService.getRecentRequests(),
      adminService.getErrorReports()
    ])

    stats.value = statsData
    systemOverview.value = overviewData
    requests.value = requestsData.map(formatRequestFromBackend)
    errorReports.value = errorsData

    showToast('Datos cargados correctamente', 'success')
  } catch (e: any) {
    console.error('Error cargando datos del dashboard:', e)
    error.value = e.message || 'No se pudieron cargar los datos. Intenta nuevamente.'
    showToast('Error al cargar los datos del dashboard', 'error')
  } finally {
    loading.value = false
  }
}

/* Función para formatear solicitudes del backend */
const formatRequestFromBackend = (solicitud: any): Request => {
  return {
    id: solicitud.id,
    title: solicitud.tipoSolicitud || 'Solicitud',
    description: solicitud.descripcion || 'Sin descripción',
    user: solicitud.estudiante?.nombre || 'Usuario desconocido',
    userRole: 'estudiante',
    type: solicitud.especialidad?.nombre || 'General',
    status: mapBackendStatusToRequestStatus(solicitud.estado),
    createdAt: solicitud.fechaCreacion || new Date().toISOString(),
    updatedAt: solicitud.fechaActualizacion || solicitud.fechaCreacion || new Date().toISOString()
  }
}

/* Mapear estados del backend a estados de la UI */
const mapBackendStatusToRequestStatus = (backendStatus: string): Request['status'] => {
  const statusMap: Record<string, Request['status']> = {
    'PENDIENTE': 'pendiente',
    'APROBADA': 'aprobado',
    'RECHAZADA': 'rechazado',
    'EN_PROCESO': 'en_proceso',
    'CANCELADA': 'rechazado'
  }
  return statusMap[backendStatus] || 'pendiente'
}

/* Mapear estados de UI a estados del backend */
const mapRequestStatusToBackend = (uiStatus: Request['status']): string => {
  const statusMap: Record<Request['status'], string> = {
    'pendiente': 'PENDIENTE',
    'aprobado': 'APROBADA',
    'rechazado': 'RECHAZADA',
    'en_proceso': 'EN_PROCESO'
  }
  return statusMap[uiStatus] || 'PENDIENTE'
}

const reload = () => loadData()
onMounted(loadData)

/* Valores por defecto */
const defaultStats: AdminStats = {
  activeUsers: 0,
  totalUsers: 0,
  pendingAppointments: 0,
  totalAppointments: 0,
  recentPatients: 0,
  totalPatients: 0,
  pendingReports: 0,
  totalReports: 0
}

const defaultOverview: SystemOverview = {
  clinicas: { activas: 0, enRuta: 0, enMantenimiento: 0, inactivas: 0 },
  casosClinicosHoy: { nuevos: 0, enRevision: 0, aprobados: 0, enTratamiento: 0 },
  citasHoy: { programadas: 0, completadas: 0, canceladas: 0, noAsistio: 0 },
  actividad: { usuariosConectados: 0, sesionesHoy: 0, ultimaActividad: '' }
}

const s = computed(() => stats.value ?? defaultStats)
const o = computed(() => systemOverview.value ?? defaultOverview)

/* Cards de estadísticas */
const statCards = computed(() => [
  {
    key: 'users',
    icon: 'fas fa-users',
    bgClass: 'bg-primary',
    label: 'Usuarios Activos',
    value: `${s.value.activeUsers}/${s.value.totalUsers}`
  },
  {
    key: 'appointments',
    icon: 'fas fa-calendar-check',
    bgClass: 'bg-success',
    label: 'Citas Pendientes',
    value: `${s.value.pendingAppointments}/${s.value.totalAppointments}`
  },
  {
    key: 'patients',
    icon: 'fas fa-user-injured',
    bgClass: 'bg-info',
    label: 'Pacientes Nuevos',
    value: `${s.value.recentPatients}/${s.value.totalPatients}`
  },
  {
    key: 'reports',
    icon: 'fas fa-exclamation-triangle',
    bgClass: 'bg-warning',
    label: 'Reportes Pendientes',
    value: `${s.value.pendingReports}/${s.value.totalReports}`
  }
])

/* Derivados de tablas */
const topRequests = computed(() => requests.value.slice(0, 5))
const topErrorReports = computed(() => errorReports.value.slice(0, 5))
const pendingErrorCount = computed(
  () => errorReports.value.filter(r => r.status === 'pendiente').length
)

/* Mapeos de estado */
const STATUS_CLASS: Record<Request['status'], string> = {
  pendiente: 'bg-warning',
  aprobado: 'bg-success',
  rechazado: 'bg-danger',
  en_proceso: 'bg-info'
}

const STATUS_TEXT: Record<Request['status'], string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  en_proceso: 'En Proceso'
}

const PRIORITY_CLASS: Record<ErrorReport['priority'], string> = {
  baja: 'bg-secondary',
  media: 'bg-warning',
  alta: 'bg-danger',
  critica: 'bg-dark'
}

/* Helpers UI */
const formatLastActivity = (dateString: string) => {
  if (!dateString) return 'N/A'
  const now = new Date()
  const activityDate = new Date(dateString)
  const diffMinutes = Math.floor((now.getTime() - activityDate.getTime()) / 60000)
  if (diffMinutes < 1) return 'Ahora mismo'
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  return activityDate.toLocaleDateString('es-ES')
}

const requestStatusClass = (status: Request['status']) =>
  STATUS_CLASS[status] || 'bg-secondary'
const requestStatusText = (status: Request['status']) =>
  STATUS_TEXT[status] || status
const priorityClass = (priority: ErrorReport['priority']) =>
  PRIORITY_CLASS[priority] || 'bg-secondary'

/* Acciones con backend */
const onUpdateRequest = async (id: number, status: Request['status']) => {
  try {
    const backendStatus = mapRequestStatusToBackend(status)
    await adminService.updateRequestStatus(id, backendStatus)
    
    // Actualizar optimísticamente en la UI
    const idx = requests.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      requests.value[idx] = { ...requests.value[idx], status }
    }
    
    showToast(`Solicitud ${status === 'aprobado' ? 'aprobada' : 'rechazada'} correctamente`, 'success')
  } catch (e: any) {
    console.error('Error al actualizar solicitud:', e)
    showToast('Error al actualizar la solicitud', 'error')
  }
}

const onUpdateError = async (id: number, status: ErrorReport['status']) => {
  try {
    await adminService.updateErrorReportStatus(id, status)
    
    // Actualizar optimísticamente en la UI
    const idx = errorReports.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      errorReports.value[idx] = { ...errorReports.value[idx], status }
    }
    
    showToast('Reporte de error actualizado correctamente', 'success')
  } catch (e: any) {
    console.error('Error al actualizar reporte:', e)
    showToast('Error al actualizar el reporte', 'error')
  }
}
</script>

<style src="@/assets/css/pages/admin/HomeAdmin.css" scoped></style>
