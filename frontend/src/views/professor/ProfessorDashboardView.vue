<!-- Ruta: /professor/dashboard - Archivo: src/views/professor/ProfessorDashboardView.vue -->
<template>
  <div class="professor-dashboard">
    <!-- Header del Dashboard -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-tachometer-alt me-3"></i>
            Dashboard del Profesor
          </h1>
          <p class="page-subtitle">Resumen de actividades y casos clínicos</p>
        </div>
        <div class="header-actions">
          <button 
            type="button" 
            class="btn btn-primary btn-icon-text"
            @click="refreshData"
            :disabled="loading"
          >
            <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas Principales -->
    <div class="stats-grid mb-4">
      <div class="stat-card bg-gradient-primary">
        <div class="stat-icon">
          <i class="fas fa-clipboard-list text-white"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ pendingCasesCount }}</div>
          <div class="stat-label">Casos Pendientes</div>
        </div>
      </div>

      <div class="stat-card bg-gradient-success">
        <div class="stat-icon">
          <i class="fas fa-graduation-cap text-white"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ totalStudents }}</div>
          <div class="stat-label">Estudiantes Supervisados</div>
        </div>
      </div>

      <div class="stat-card bg-gradient-info">
        <div class="stat-icon">
          <i class="fas fa-chart-line text-white"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ averageGrade?.toFixed(1) || 'N/A' }}</div>
          <div class="stat-label">Promedio General</div>
        </div>
      </div>

      <div class="stat-card bg-gradient-warning">
        <div class="stat-icon">
          <i class="fas fa-stethoscope text-white"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ activeCoursesCount }}</div>
          <div class="stat-label">Especialidades</div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Casos Pendientes de Revisión -->
      <div class="col-xl-8 col-lg-7 mb-4">
        <div class="card card-elev">
          <div class="card-header">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
              <h5 class="card-title mb-0">
                <i class="fas fa-clock me-2 text-warning"></i>
                Casos Pendientes de Revisión
              </h5>
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                @click="viewAllPendingCases"
              >
                <i class="fas fa-list me-1"></i>
                Ver Todos
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loadingCases" class="text-center py-4">
              <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
              <p class="mt-2 text-muted">Cargando casos...</p>
            </div>

            <div v-else-if="pendingCases.length === 0" class="text-center py-4">
              <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
              <h6 class="text-muted">¡Excelente trabajo!</h6>
              <p class="text-muted">No tienes casos pendientes de revisión.</p>
            </div>

            <div v-else>
              <!-- Vista de tabla para pantallas grandes -->
              <div class="table-responsive d-none d-lg-block">
                <table class="table table-hover">
                  <thead class="table-header sticky-thead">
                    <tr>
                      <th>Estudiante</th>
                      <th>Paciente</th>
                      <th>Especialidad</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="caso in pendingCases.slice(0, 5)" :key="caso.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="mini-avatar bg-primary me-2">
                            {{ getInitials(caso.nombreEstudiante) }}
                          </div>
                          <span>{{ caso.nombreEstudiante }}</span>
                        </div>
                      </td>
                      <td>{{ caso.nombrePaciente }}</td>
                      <td>
                        <span class="badge bg-light text-dark">{{ caso.nombreEspecialidad }}</span>
                      </td>
                      <td>{{ formatDate(caso.fechaCreacion) }}</td>
                      <td>
                        <button
                          type="button"
                          class="btn btn-primary btn-sm"
                          @click="reviewCase(caso)"
                        >
                          <i class="fas fa-eye me-1"></i>
                          Revisar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Vista de tarjetas para pantallas pequeñas -->
              <div class="d-lg-none">
                <div v-for="caso in pendingCases.slice(0, 5)" :key="caso.id" class="case-card mb-3">
                  <div class="d-flex align-items-start justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                      <div class="mini-avatar bg-primary me-2">
                        {{ getInitials(caso.nombreEstudiante) }}
                      </div>
                      <div>
                        <h6 class="mb-0">{{ caso.nombreEstudiante }}</h6>
                        <small class="text-muted">{{ caso.nombrePaciente }}</small>
                      </div>
                    </div>
                    <span class="badge bg-light text-dark">{{ caso.nombreEspecialidad }}</span>
                  </div>
                  
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      {{ formatDate(caso.fechaCreacion) }}
                    </small>
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      @click="reviewCase(caso)"
                    >
                      <i class="fas fa-eye me-1"></i>
                      Revisar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividades Recientes -->
      <div class="col-xl-4 col-lg-5 mb-4">
        <div class="card card-elev">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-history me-2 text-info"></i>
              Actividad Reciente
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentActivities.length === 0" class="text-center py-3">
              <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
              <p class="text-muted mb-1">No hay actividades recientes</p>
              <small class="text-muted">Las actividades aparecerán conforme revises casos</small>
            </div>

            <div v-else class="timeline">
              <div 
                v-for="activity in recentActivities.slice(0, 5)" 
                :key="activity.id"
                class="timeline-item"
              >
                <div :class="['timeline-dot', getActivityIconClass(activity.tipo)]">
                  <i :class="getActivityIcon(activity.tipo)"></i>
                </div>
                <div class="timeline-content">
                  <h6 class="timeline-title">{{ activity.titulo }}</h6>
                  <p class="timeline-desc">{{ activity.descripcion }}</p>
                  <small class="text-muted">{{ formatDateTime(activity.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas de Mis Especialidades -->
    <div class="row">
      <div class="col-12">
        <div class="card card-elev">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-bar me-2 text-primary"></i>
              Mis Especialidades
            </h5>
          </div>
          <div class="card-body">
            <div v-if="courseStats.length === 0" class="text-center py-4">
              <i class="fas fa-chart-line fa-2x text-muted"></i>
              <p class="mt-2 text-muted mb-1">No hay casos asignados aún</p>
              <small class="text-muted">Los datos aparecerán cuando tengas casos clínicos asignados</small>
            </div>

            <div v-else class="row">
              <div 
                v-for="course in courseStats" 
                :key="course.nombre"
                class="col-12 col-md-6 col-xl-4 mb-3"
              >
                <div class="course-stat-card">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="course-name mb-0">{{ course.nombre }}</h6>
                    <span class="badge bg-primary">{{ course.totalEstudiantes }} estudiantes</span>
                  </div>
                  
                  <div class="course-metrics">
                    <div class="metric-item mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="metric-label">Tasa de Finalización</span>
                        <span class="metric-value">{{ course.tasaCompleccion }}%</span>
                      </div>
                      <div class="progress progress-thin">
                        <div 
                          class="progress-bar bg-success" 
                          :style="{ width: course.tasaCompleccion + '%' }"
                        ></div>
                      </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="metric-label">Casos Pendientes</span>
                      <span class="metric-value text-warning fw-bold">{{ course.casosPendientes }}</span>
                    </div>

                    <div v-if="course.promedioCalificacion" class="d-flex justify-content-between align-items-center mb-2">
                      <span class="metric-label">Promedio</span>
                      <span 
                        class="metric-value fw-bold"
                        :class="getGradeClass(course.promedioCalificacion)"
                      >
                        {{ course.promedioCalificacion.toFixed(1) }}
                      </span>
                    </div>
                  </div>

                  <div class="course-footer mt-3 pt-3 border-top">
                    <small class="text-muted">
                      <i class="fas fa-clock me-1"></i>
                      Última actividad: {{ formatDate(course.ultimaFechaCaso) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <CaseReviewModal
      :visible="showReviewModal"
      :caso="selectedCase"
      @close="closeReviewModal"
      @saved="onCaseSaved"
    />

    <AllCasesModal
      :visible="showAllCasesModal"
      @close="closeAllCasesModal"
      @reviewCase="reviewCase"
    />

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProfessorStore } from '@/store/professor'
import type { CasoClinicoResumen } from '@/types/clinicalCase'
import CaseReviewModal from '@/components/professor/CaseReviewModal.vue'
import AllCasesModal from '@/components/professor/AllCasesModal.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

// Store
const professorStore = useProfessorStore()

// Estado local
const showReviewModal = ref(false)
const showAllCasesModal = ref(false)
const selectedCase = ref<CasoClinicoResumen | null>(null)
const loading = ref(false)

// Computed properties del store
const pendingCases = computed(() => professorStore.pendingCases)
const pendingCasesCount = computed(() => professorStore.pendingCasesCount)
const totalStudents = computed(() => professorStore.totalStudents)
const averageGrade = computed(() => professorStore.averageGrade)
const activeCoursesCount = computed(() => professorStore.activeCoursesCount)
const recentActivities = computed(() => professorStore.recentActivities)
const courseStats = computed(() => professorStore.courseStats)
const loadingCases = computed(() => professorStore.loadingCases)

// Métodos
const refreshData = async () => {
  loading.value = true
  try {
    await professorStore.refreshDashboard()
  } finally {
    loading.value = false
  }
}

const viewAllPendingCases = () => {
  showAllCasesModal.value = true
}

const closeAllCasesModal = () => {
  showAllCasesModal.value = false
}

const reviewCase = (caso: CasoClinicoResumen) => {
  selectedCase.value = caso
  showReviewModal.value = true
  showAllCasesModal.value = false
}

const closeReviewModal = () => {
  showReviewModal.value = false
  selectedCase.value = null
}

const onCaseSaved = async () => {
  // Refrescar la lista de casos pendientes
  await professorStore.loadPendingCases()
  await professorStore.loadRecentActivities()
}

// Helpers
const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getActivityIconClass = (type: string) => {
  const classes = {
    approval: 'bg-success',
    submission: 'bg-primary',
    review: 'bg-warning',
    rejection: 'bg-danger',
    grade: 'bg-info'
  }
  return classes[type as keyof typeof classes] || 'bg-secondary'
}

const getActivityIcon = (type: string) => {
  const icons = {
    approval: 'fas fa-check',
    submission: 'fas fa-upload',
    review: 'fas fa-edit',
    rejection: 'fas fa-times',
    grade: 'fas fa-star'
  }
  return icons[type as keyof typeof icons] || 'fas fa-info'
}

const getGradeClass = (grade: number) => {
  if (grade >= 90) return 'text-success'
  if (grade >= 80) return 'text-primary'
  if (grade >= 70) return 'text-warning'
  return 'text-danger'
}

// Lifecycle
onMounted(async () => {
  await refreshData()
})
</script>

<!-- Llamada al CSS de la página -->
<style src="@/assets/css/pages/professor/ProfessorDashboard.css" scoped></style>
