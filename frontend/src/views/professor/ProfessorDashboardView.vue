<!-- Ruta: /professor/dashboard - Archivo: src/views/professor/ProfessorDashboardView.vue -->
<template>
  <div class="prof-dash container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 header-bar">
      <div>
        <h2 class="h3 mb-1 text-primary fw-bold">Panel de Control - Profesor</h2>
        <p class="text-muted mb-0">Supervisa la actividad académica y clínica de los estudiantes</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <!-- Botones con icono + texto (siempre visibles) -->
        <button class="btn btn-outline-primary btn-icon-text" @click="refreshData">
          <i class="fas fa-sync-alt"></i><span>Actualizar</span>
        </button>
        <button class="btn btn-primary btn-icon-text" @click="viewAllPendingCases">
          <i class="fas fa-clipboard-check"></i><span>Ver Pendientes</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4 g-3">
      <div class="col-lg-3 col-md-6">
        <div class="stat-card bg-danger text-white">
          <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
          <div class="stat-main">
            <div class="stat-number">{{ pendingCasesCount }}</div>
            <div class="stat-label">Casos Pendientes</div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stat-card bg-success text-white">
          <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
          <div class="stat-main">
            <div class="stat-number">{{ totalStudents }}</div>
            <div class="stat-label">Estudiantes Activos</div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stat-card bg-info text-white">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <div class="stat-main">
            <div class="stat-number">{{ casesReviewedToday }}</div>
            <div class="stat-label">Revisados Hoy</div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stat-card bg-warning text-dark">
          <div class="stat-icon"><i class="fas fa-book"></i></div>
          <div class="stat-main">
            <div class="stat-number">{{ activeCoursesCount }}</div>
            <div class="stat-label">Cursos Activos</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Casos clínicos pendientes -->
      <div class="col-lg-8 mb-4">
        <div class="card card-elev">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-clipboard-list text-primary"></i>
              Casos Clínicos Pendientes de Aprobación
            </h5>
            <button class="btn btn-sm btn-outline-primary btn-icon-text" @click="viewAllPendingCases">
              <i class="fas fa-list-ul"></i><span>Ver todos</span>
            </button>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0 align-middle">
                <thead class="table-light sticky-thead">
                  <tr>
                    <th>Estudiante</th>
                    <th>Paciente</th>
                    <th>Caso</th>
                    <th>Fecha Solicitud</th>
                    <th>Prioridad</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="caso in pendingCases.slice(0, 5)" :key="caso.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="mini-avatar bg-primary text-white me-2">
                          {{ caso.studentName.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="fw-medium">{{ caso.studentName }}</div>
                          <small class="text-muted">{{ caso.studentId }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div class="fw-medium">{{ caso.patientName }}</div>
                        <small class="text-muted">{{ caso.patientId }}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div class="fw-medium">{{ caso.title }}</div>
                        <small class="text-muted">{{ caso.specialty }}</small>
                      </div>
                    </td>
                    <td class="text-nowrap">{{ formatDate(caso.submittedAt) }}</td>
                    <td>
                      <span :class="getPriorityClass(caso.priority)">{{ caso.priority }}</span>
                    </td>
                    <td class="text-center">
                      <!-- Botones con icono + nombre (siempre visibles) -->
                      <div class="action-group d-flex flex-wrap justify-content-center">
                        <button class="btn btn-outline-success btn-icon-text me-1 mb-1" @click="reviewCase(caso)">
                          <i class="fas fa-eye"></i><span>Revisar</span>
                        </button>
                        <button class="btn btn-success btn-icon-text me-1 mb-1" @click="approveCase(caso.id)">
                          <i class="fas fa-check"></i><span>Aprobar</span>
                        </button>
                        <button class="btn btn-danger btn-icon-text mb-1" @click="rejectCase(caso.id)">
                          <i class="fas fa-times"></i><span>Rechazar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!pendingCases.length">
                    <td colspan="6" class="text-center text-muted py-4">
                      No hay casos pendientes de aprobación
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Estado vacío extra (fallback) -->
            <div v-if="!pendingCases.length" class="empty-state text-center py-4">
              <i class="fas fa-clipboard-check fa-3x text-muted opacity-50 d-block mb-3"></i>
              <h6 class="text-muted">No hay casos pendientes de aprobación</h6>
              <p class="text-muted mb-0">Todos los casos han sido revisados</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividad reciente -->
      <div class="col-lg-4 mb-4">
        <div class="card card-elev">
          <div class="card-header">
            <h5 class="card-title mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-history text-primary"></i> Actividad Reciente
            </h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div v-for="activity in recentActivities" :key="activity.id" class="timeline-item">
                <div class="timeline-marker">
                  <div :class="getActivityIconClass(activity.type)" class="timeline-dot">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                </div>
                <div class="timeline-content">
                  <h6 class="mb-1">{{ activity.title }}</h6>
                  <p class="text-muted mb-1 small">{{ activity.description }}</p>
                  <small class="text-muted">{{ formatDateTime(activity.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>

    <!-- Estadísticas de Cursos -->
    <div class="row">
      <div class="col-12">
        <div class="card card-elev">
          <div class="card-header">
            <h5 class="card-title mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-chart-bar text-primary"></i> Progreso por Curso
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div v-for="course in courseStats" :key="course.name" class="col-md-4">
                <div class="course-stat-card">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-semibold mb-0">{{ course.name }}</h6>
                    <span class="badge bg-primary">{{ course.completionRate }}%</span>
                  </div>
                  <div class="text-muted small mb-2">Estudiantes: {{ course.totalStudents }}</div>
                  <div class="progress progress-thin">
                    <div class="progress-bar" role="progressbar" :style="{ width: course.completionRate + '%' }"></div>
                  </div>
                  <div class="mt-2 small text-muted">
                    <div>Casos pendientes: {{ course.pendingCases }}</div>
                    <div>Último caso: {{ formatDate(course.lastCaseDate) }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!courseStats.length" class="col-12 text-center text-muted">Sin cursos activos.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>  
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Assignment } from '../../mocks/professor/assignments'
import { fetchAssignmentsMock } from '../../mocks/professor/assignments'
import { fetchCoursesMock } from '../../mocks/professor/studentsByCourse'

const router = useRouter()

/* Estados */
const assignments = ref<Assignment[]>([])
const courses = ref<string[]>([])

/* Casos pendientes (mock) */
const pendingCases = ref([
  { id: 1, studentId: 'EST001', studentName: 'María García',  patientId: 'PAC001', patientName: 'Juan Pérez',   title: 'Caries Dental Múltiple', specialty: 'Operatoria Dental', submittedAt: '2025-08-07T10:30:00Z', priority: 'Alta' },
  { id: 2, studentId: 'EST002', studentName: 'Carlos López',  patientId: 'PAC002', patientName: 'Ana Martínez', title: 'Periodontitis Crónica',  specialty: 'Periodoncia',      submittedAt: '2025-08-06T15:45:00Z', priority: 'Media' },
  { id: 3, studentId: 'EST003', studentName: 'Sofia Rodriguez', patientId: 'PAC003', patientName: 'Pedro Silva',  title: 'Extracción Molar',       specialty: 'Cirugía Oral',      submittedAt: '2025-08-05T09:15:00Z', priority: 'Baja' }
])

/* Actividad reciente (mock) */
const recentActivities = ref([
  { id: 1, type: 'approval',   title: 'Caso aprobado',  description: 'Caso de endodoncia de María García aprobado', timestamp: '2025-08-08T08:30:00Z' },
  { id: 2, type: 'submission', title: 'Nuevo caso enviado', description: 'Carlos López envió caso de periodoncia',    timestamp: '2025-08-07T16:20:00Z' },
  { id: 3, type: 'review',     title: 'Caso revisado',   description: 'Caso de cirugía oral requiere correcciones',   timestamp: '2025-08-07T14:10:00Z' }
])

/* Estadísticas de cursos (mock) */
const courseStats = ref([
  { name: 'Operatoria Dental', totalStudents: 25, completionRate: 78, pendingCases: 5, lastCaseDate: '2025-08-07T00:00:00Z' },
  { name: 'Periodoncia',       totalStudents: 20, completionRate: 85, pendingCases: 3, lastCaseDate: '2025-08-06T00:00:00Z' },
  { name: 'Cirugía Oral',      totalStudents: 18, completionRate: 92, pendingCases: 2, lastCaseDate: '2025-08-05T00:00:00Z' }
])

/* Computed */
const totalStudents      = computed(() => courseStats.value.reduce((s, c) => s + c.totalStudents, 0))
const pendingCasesCount  = computed(() => pendingCases.value.length)
const casesReviewedToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return recentActivities.value.filter(a => a.timestamp.startsWith(today) && a.type === 'approval').length
})
const activeCoursesCount = computed(() => courses.value.length)

/* Métodos */
const loadData = async () => {
  assignments.value = await fetchAssignmentsMock()
  courses.value     = await fetchCoursesMock()
}
const refreshData         = async () => { await loadData() }
const viewAllPendingCases = () => router.push('/professor/case-approvals')
const reviewCase          = (caso: any) => router.push(`/professor/case-review/${caso.id}`)

const approveCase = async (caseId: number) => {
  if (confirm('¿Aprobar este caso clínico?')) {
    pendingCases.value = pendingCases.value.filter(c => c.id !== caseId)
    recentActivities.value.unshift({ id: Date.now(), type: 'approval', title: 'Caso aprobado', description: 'Caso clínico aprobado por el profesor', timestamp: new Date().toISOString() })
  }
}
const rejectCase = async (caseId: number) => {
  if (confirm('¿Rechazar este caso clínico? El estudiante deberá realizar correcciones.')) {
    pendingCases.value = pendingCases.value.filter(c => c.id !== caseId)
    recentActivities.value.unshift({ id: Date.now(), type: 'rejection', title: 'Caso rechazado', description: 'Caso clínico rechazado - requiere correcciones', timestamp: new Date().toISOString() })
  }
}

/* Helpers */
const formatDate     = (iso: string) => new Date(iso).toLocaleDateString('es-ES')
const formatDateTime = (iso: string) => new Date(iso).toLocaleString('es-ES')

const getPriorityClass = (priority: string) =>
  ({ 'Alta': 'badge bg-danger', 'Media': 'badge bg-warning text-dark', 'Baja': 'badge bg-success' }[priority] || 'badge bg-secondary')

const getActivityIconClass = (type: string) =>
  ({ 'approval': 'bg-success', 'submission': 'bg-primary', 'review': 'bg-warning', 'rejection': 'bg-danger' }[type] || 'bg-secondary')

const getActivityIcon = (type: string) =>
  ({ 'approval': 'fas fa-check', 'submission': 'fas fa-plus', 'review': 'fas fa-eye', 'rejection': 'fas fa-times' }[type] || 'fas fa-info')

/* Carga inicial */
onMounted(loadData)
</script>

<!-- Importa el CSS externo de la página -->
<style src="@/assets/css/pages/professor/ProfessorDashboard.css" scoped></style>
