<!-- src/views/professor/ProfessorDashboardView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Panel de Control - Profesor</h2>
        <p class="text-muted">Supervisa la actividad académica y clínica de los estudiantes</p>
      </div>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-primary" 
          @click="refreshData"
        >
          <i class="fas fa-sync-alt me-2"></i>Actualizar
        </button>
        <button 
          class="btn btn-primary" 
          @click="viewAllPendingCases"
        >
          <i class="fas fa-clipboard-check me-2"></i>Ver Pendientes
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ pendingCasesCount }}</h3>
                <p class="card-text">Casos Pendientes</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-exclamation-circle fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ totalStudents }}</h3>
                <p class="card-text">Estudiantes Activos</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-user-graduate fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ casesReviewedToday }}</h3>
                <p class="card-text">Revisados Hoy</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h3 class="card-title mb-0">{{ activeCoursesCount }}</h3>
                <p class="card-text">Cursos Activos</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-book fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Casos Clínicos Pendientes de Aprobación -->
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="fas fa-clipboard-list me-2"></i>Casos Clínicos Pendientes de Aprobación
            </h5>
            <button class="btn btn-sm btn-outline-primary" @click="viewAllPendingCases">
              Ver todos
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Estudiante</th>
                    <th>Paciente</th>
                    <th>Caso</th>
                    <th>Fecha Solicitud</th>
                    <th>Prioridad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="caso in pendingCases.slice(0, 5)" :key="caso.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                             style="width: 32px; height: 32px; font-size: 14px;">
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
                    <td>{{ formatDate(caso.submittedAt) }}</td>
                    <td>
                      <span :class="getPriorityClass(caso.priority)">
                        {{ caso.priority }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button 
                          class="btn btn-sm btn-outline-success"
                          @click="reviewCase(caso)"
                          title="Revisar caso"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-success"
                          @click="approveCase(caso.id)"
                          title="Aprobar"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-danger"
                          @click="rejectCase(caso.id)"
                          title="Rechazar"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Estado vacío -->
            <div v-if="!pendingCases.length" class="text-center py-4">
              <div class="mb-3">
                <i class="fas fa-clipboard-check fa-3x text-muted opacity-50"></i>
              </div>
              <h6 class="text-muted">No hay casos pendientes de aprobación</h6>
              <p class="text-muted mb-0">Todos los casos han sido revisados</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividad Reciente -->
      <div class="col-lg-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-history me-2"></i>Actividad Reciente
            </h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="timeline-item d-flex mb-3"
              >
                <div class="timeline-marker">
                  <div :class="getActivityIconClass(activity.type)">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                </div>
                <div class="timeline-content ms-3">
                  <div>
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
    </div>

    <!-- Estadísticas de Cursos -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-bar me-2"></i>Progreso por Curso
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div v-for="course in courseStats" :key="course.name" class="col-md-4 mb-3">
                <div class="course-stat-card">
                  <h6 class="fw-semibold">{{ course.name }}</h6>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Estudiantes: {{ course.totalStudents }}</span>
                    <span class="badge bg-primary">{{ course.completionRate }}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div 
                      class="progress-bar" 
                      role="progressbar" 
                      :style="{ width: course.completionRate + '%' }"
                    ></div>
                  </div>
                  <div class="mt-2 small text-muted">
                    <div>Casos pendientes: {{ course.pendingCases }}</div>
                    <div>Último caso: {{ formatDate(course.lastCaseDate) }}</div>
                  </div>
                </div>
              </div>
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

// Estados reactivos
const assignments = ref<Assignment[]>([])
const courses = ref<string[]>([])

// Datos simulados para casos clínicos pendientes
const pendingCases = ref([
  {
    id: 1,
    studentId: 'EST001',
    studentName: 'María García',
    patientId: 'PAC001',
    patientName: 'Juan Pérez',
    title: 'Caries Dental Múltiple',
    specialty: 'Operatoria Dental',
    submittedAt: '2025-08-07T10:30:00Z',
    priority: 'Alta'
  },
  {
    id: 2,
    studentId: 'EST002',
    studentName: 'Carlos López',
    patientId: 'PAC002',
    patientName: 'Ana Martínez',
    title: 'Periodontitis Crónica',
    specialty: 'Periodoncia',
    submittedAt: '2025-08-06T15:45:00Z',
    priority: 'Media'
  },
  {
    id: 3,
    studentId: 'EST003',
    studentName: 'Sofia Rodriguez',
    patientId: 'PAC003',
    patientName: 'Pedro Silva',
    title: 'Extracción Molar',
    specialty: 'Cirugía Oral',
    submittedAt: '2025-08-05T09:15:00Z',
    priority: 'Baja'
  }
])

// Actividades recientes simuladas
const recentActivities = ref([
  {
    id: 1,
    type: 'approval',
    title: 'Caso aprobado',
    description: 'Caso de endodoncia de María García aprobado',
    timestamp: '2025-08-08T08:30:00Z'
  },
  {
    id: 2,
    type: 'submission',
    title: 'Nuevo caso enviado',
    description: 'Carlos López envió caso de periodoncia',
    timestamp: '2025-08-07T16:20:00Z'
  },
  {
    id: 3,
    type: 'review',
    title: 'Caso revisado',
    description: 'Caso de cirugía oral requiere correcciones',
    timestamp: '2025-08-07T14:10:00Z'
  }
])

// Estadísticas de cursos simuladas
const courseStats = ref([
  {
    name: 'Operatoria Dental',
    totalStudents: 25,
    completionRate: 78,
    pendingCases: 5,
    lastCaseDate: '2025-08-07T00:00:00Z'
  },
  {
    name: 'Periodoncia',
    totalStudents: 20,
    completionRate: 85,
    pendingCases: 3,
    lastCaseDate: '2025-08-06T00:00:00Z'
  },
  {
    name: 'Cirugía Oral',
    totalStudents: 18,
    completionRate: 92,
    pendingCases: 2,
    lastCaseDate: '2025-08-05T00:00:00Z'
  }
])

// Computed properties
const totalStudents = computed(() => 
  courseStats.value.reduce((sum, course) => sum + course.totalStudents, 0)
)

const pendingCasesCount = computed(() => pendingCases.value.length)

const casesReviewedToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return recentActivities.value.filter(activity => 
    activity.timestamp.startsWith(today) && activity.type === 'approval'
  ).length
})

const activeCoursesCount = computed(() => courses.value.length)

// Métodos
const refreshData = async () => {
  await loadData()
}

const viewAllPendingCases = () => {
  router.push('/professor/case-approvals')
}

const reviewCase = (caso: any) => {
  router.push(`/professor/case-review/${caso.id}`)
}

const approveCase = async (caseId: number) => {
  if (confirm('¿Aprobar este caso clínico?')) {
    // Lógica de aprobación
    pendingCases.value = pendingCases.value.filter(c => c.id !== caseId)
    
    // Agregar a actividades recientes
    recentActivities.value.unshift({
      id: Date.now(),
      type: 'approval',
      title: 'Caso aprobado',
      description: 'Caso clínico aprobado por el profesor',
      timestamp: new Date().toISOString()
    })
  }
}

const rejectCase = async (caseId: number) => {
  if (confirm('¿Rechazar este caso clínico? El estudiante deberá realizar correcciones.')) {
    // Lógica de rechazo
    pendingCases.value = pendingCases.value.filter(c => c.id !== caseId)
    
    // Agregar a actividades recientes
    recentActivities.value.unshift({
      id: Date.now(),
      type: 'rejection',
      title: 'Caso rechazado',
      description: 'Caso clínico rechazado - requiere correcciones',
      timestamp: new Date().toISOString()
    })
  }
}

const formatDate = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

const formatDateTime = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES')
}

const getPriorityClass = (priority: string) => {
  const classes = {
    'Alta': 'badge bg-danger',
    'Media': 'badge bg-warning',
    'Baja': 'badge bg-success'
  }
  return classes[priority as keyof typeof classes] || 'badge bg-secondary'
}

const getActivityIconClass = (type: string) => {
  const classes = {
    'approval': 'timeline-icon bg-success',
    'submission': 'timeline-icon bg-primary',
    'review': 'timeline-icon bg-warning',
    'rejection': 'timeline-icon bg-danger'
  }
  return classes[type as keyof typeof classes] || 'timeline-icon bg-secondary'
}

const getActivityIcon = (type: string) => {
  const icons = {
    'approval': 'fas fa-check',
    'submission': 'fas fa-plus',
    'review': 'fas fa-eye',
    'rejection': 'fas fa-times'
  }
  return icons[type as keyof typeof icons] || 'fas fa-info'
}

// Carga inicial de datos
const loadData = async () => {
  assignments.value = await fetchAssignmentsMock()
  courses.value = await fetchCoursesMock()
}

onMounted(loadData)
</script>

<style scoped>
.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
}

.timeline-marker {
  position: relative;
  flex-shrink: 0;
}

.timeline-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-weight: 600;
}

.table th {
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #dee2e6;
}

.badge {
  font-size: 0.75rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.opacity-75 {
  opacity: 0.75;
}

.course-stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--bs-primary);
}

.course-stat-card h6 {
  color: var(--bs-dark);
  margin-bottom: 0.75rem;
}

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  background-color: var(--bs-primary);
}
</style>
