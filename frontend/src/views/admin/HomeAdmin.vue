<!-- Ruta: /admin  - Archivo: src/views/admin/HomeAdmin.vue -->
<template>
  <div class="admin-home">
    <div class="welcome-section">
      <h1 class="h3 mb-4">Panel de Administración</h1>
      <p class="text-muted">Bienvenido al panel de control administrativo del sistema</p>
    </div>

    <!-- Cards de estadísticas mejoradas -->
    <div class="row g-4 mb-5">
      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-primary">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.activeUsers || 0 }}/{{ stats?.totalUsers || 0 }}</div>
            <div class="stat-label">Usuarios Activos</div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-success">
          <div class="stat-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.pendingAppointments || 0 }}/{{ stats?.totalAppointments || 0 }}</div>
            <div class="stat-label">Citas Pendientes</div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-info">
          <div class="stat-icon">
            <i class="fas fa-user-injured"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.recentPatients || 0 }}/{{ stats?.totalPatients || 0 }}</div>
            <div class="stat-label">Pacientes Nuevos</div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-warning">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.pendingReports || 0 }}/{{ stats?.totalReports || 0 }}</div>
            <div class="stat-label">Reportes Pendientes</div>
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
                      <span class="stat-value text-success">{{ systemOverview?.clinicas.activas || 0 }}</span>
                      <span class="stat-text">Activas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-primary">{{ systemOverview?.clinicas.enRuta || 0 }}</span>
                      <span class="stat-text">En Ruta</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-warning">{{ systemOverview?.clinicas.enMantenimiento || 0 }}</span>
                      <span class="stat-text">Mantenimiento</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-muted">{{ systemOverview?.clinicas.inactivas || 0 }}</span>
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
                      <span class="stat-value text-info">{{ systemOverview?.casosClinicosHoy.nuevos || 0 }}</span>
                      <span class="stat-text">Nuevos</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-warning">{{ systemOverview?.casosClinicosHoy.enRevision || 0 }}</span>
                      <span class="stat-text">En Revisión</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ systemOverview?.casosClinicosHoy.aprobados || 0 }}</span>
                      <span class="stat-text">Aprobados</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-primary">{{ systemOverview?.casosClinicosHoy.enTratamiento || 0 }}</span>
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
                      <span class="stat-value text-primary">{{ systemOverview?.citasHoy.programadas || 0 }}</span>
                      <span class="stat-text">Programadas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ systemOverview?.citasHoy.completadas || 0 }}</span>
                      <span class="stat-text">Completadas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-warning">{{ systemOverview?.citasHoy.canceladas || 0 }}</span>
                      <span class="stat-text">Canceladas</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-danger">{{ systemOverview?.citasHoy.noAsistio || 0 }}</span>
                      <span class="stat-text">No Asistió</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actividad -->
              <div class="col-lg-3 col-md-6">
                <div class="overview-section">
                  <h6 class="overview-title">
                    <i class="fas fa-activity me-2"></i>
                    Actividad
                  </h6>
                  <div class="overview-stats">
                    <div class="stat-item">
                      <span class="stat-value text-success">{{ systemOverview?.actividad.usuariosConectados || 0 }}</span>
                      <span class="stat-text">Conectados</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value text-info">{{ systemOverview?.actividad.sesionesHoy || 0 }}</span>
                      <span class="stat-text">Sesiones Hoy</span>
                    </div>
                    <div class="stat-item text-center" style="grid-column: span 2;">
                      <div class="text-muted small">Última actividad:</div>
                      <div class="fw-bold">{{ formatLastActivity(systemOverview?.actividad.ultimaActividad || '') }}</div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <tr v-for="request in requests.slice(0, 5)" :key="request.id">
                    <td>
                      <div class="fw-bold">{{ request.title }}</div>
                      <small class="text-muted">{{ request.type }}</small>
                    </td>
                    <td>
                      <div>{{ request.user }}</div>
                      <small class="text-muted">{{ request.userRole }}</small>
                    </td>
                    <td>
                      <span :class="['badge', getRequestStatusClass(request.status)]">
                        {{ getRequestStatusText(request.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          v-if="request.status === 'pendiente'"
                          @click="updateRequestStatus(request.id, 'aprobado')"
                          class="btn btn-outline-success"
                          title="Aprobar">
                          <i class="fas fa-check"></i>
                        </button>
                        <button 
                          v-if="request.status === 'pendiente'"
                          @click="updateRequestStatus(request.id, 'rechazado')"
                          class="btn btn-outline-danger"
                          title="Rechazar">
                          <i class="fas fa-times"></i>
                        </button>
                        <button 
                          class="btn btn-outline-primary"
                          title="Ver detalles">
                          <i class="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
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
            <span class="badge bg-danger">{{ errorReports.filter(r => r.status === 'pendiente').length }}</span>
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
                  <tr v-for="report in errorReports.slice(0, 5)" :key="report.id">
                    <td>
                      <div class="fw-bold">{{ report.title }}</div>
                      <small class="text-muted">{{ report.category }}</small>
                    </td>
                    <td>
                      <div>{{ report.user }}</div>
                      <small class="text-muted">{{ report.userRole }}</small>
                    </td>
                    <td>
                      <span :class="['badge', getPriorityClass(report.priority)]">
                        {{ report.priority.toUpperCase() }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          v-if="report.status === 'pendiente'"
                          @click="updateErrorReportStatus(report.id, 'en_proceso')"
                          class="btn btn-outline-warning"
                          title="En proceso">
                          <i class="fas fa-play"></i>
                        </button>
                        <button 
                          v-if="report.status !== 'resuelto'"
                          @click="updateErrorReportStatus(report.id, 'resuelto')"
                          class="btn btn-outline-success"
                          title="Resolver">
                          <i class="fas fa-check"></i>
                        </button>
                        <button 
                          class="btn btn-outline-primary"
                          title="Ver detalles">
                          <i class="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Stats, SystemOverview, ErrorReport, Request } from '@/mocks/admin/api'
import { 
  fetchStatsMock, 
  fetchSystemOverviewMock, 
  fetchErrorReportsMock, 
  fetchRequestsMock,
  updateErrorReportStatusMock,
  updateRequestStatusMock
} from '@/mocks/admin/api'

const stats = ref<Stats | null>(null)
const systemOverview = ref<SystemOverview | null>(null)
const errorReports = ref<ErrorReport[]>([])
const requests = ref<Request[]>([])

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    stats.value = await fetchStatsMock()
    systemOverview.value = await fetchSystemOverviewMock()
    errorReports.value = await fetchErrorReportsMock()
    requests.value = await fetchRequestsMock()
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
}

const formatLastActivity = (dateString: string) => {
  if (!dateString) return 'N/A'
  const now = new Date()
  const activityDate = new Date(dateString)
  const diffMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Ahora mismo'
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  
  return activityDate.toLocaleDateString('es-ES')
}

const getRequestStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    pendiente: 'bg-warning',
    aprobado: 'bg-success',
    rechazado: 'bg-danger',
    en_proceso: 'bg-info'
  }
  return statusClasses[status] || 'bg-secondary'
}

const getRequestStatusText = (status: string) => {
  const statusTexts: Record<string, string> = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_proceso: 'En Proceso'
  }
  return statusTexts[status] || status
}

const getPriorityClass = (priority: string) => {
  const priorityClasses: Record<string, string> = {
    baja: 'bg-secondary',
    media: 'bg-warning',
    alta: 'bg-danger',
    critica: 'bg-dark'
  }
  return priorityClasses[priority] || 'bg-secondary'
}

const updateRequestStatus = async (id: number, status: Request['status']) => {
  try {
    await updateRequestStatusMock(id, status)
    await loadData() // Recargar datos
  } catch (error) {
    console.error('Error al actualizar solicitud:', error)
  }
}

const updateErrorReportStatus = async (id: number, status: ErrorReport['status']) => {
  try {
    await updateErrorReportStatusMock(id, status)
    await loadData() // Recargar datos
  } catch (error) {
    console.error('Error al actualizar reporte:', error)
  }
}
</script>

<style src="@/assets/css/pages/admin/HomeAdmin.css" scoped></style>
