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
        <button class="btn btn-outline-primary btn-icon-text" @click="refreshData" :disabled="loading">
          <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
          <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
        </button>
        <button class="btn btn-primary btn-icon-text" @click="viewAllPendingCases">
          <i class="fas fa-clipboard-check"></i><span>Ver Pendientes</span>
        </button>
      </div>
    </div>

    <!-- Stats -->
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

    <!-- Main -->
    <div class="row">
      <!-- Casos pendientes -->
      <div class="col-lg-8 mb-4">
        <div class="card card-elev">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-clipboard-list text-primary"></i> Casos Clínicos Pendientes de Aprobación
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
                    <td><span :class="getPriorityClass(caso.priority)">{{ caso.priority }}</span></td>
                    <td class="text-center">
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
                    <td colspan="6" class="text-center text-muted py-4">No hay casos pendientes de aprobación</td>
                  </tr>
                </tbody>
              </table>
            </div>

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

    <!-- Estadísticas cursos -->
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

    <!-- Modal: Revisar (controlado por Vue, sin JS de Bootstrap) -->
    <div v-if="showReviewModal">
      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="fas fa-search text-primary"></i> Revisar Caso
              </h5>
              <button type="button" class="btn-close" aria-label="Cerrar" @click="closeReviewModal"></button>
            </div>
            <div class="modal-body" v-if="selectedCase">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <strong>Estudiante:</strong>
                  <div>{{ selectedCase.studentName }} <small class="text-muted">({{ selectedCase.studentId }})</small></div>
                </div>
                <div class="col-md-6">
                  <strong>Paciente:</strong>
                  <div>{{ selectedCase.patientName }} <small class="text-muted">({{ selectedCase.patientId }})</small></div>
                </div>
                <div class="col-md-6">
                  <strong>Caso:</strong>
                  <div>{{ selectedCase.title }}</div>
                </div>
                <div class="col-md-3">
                  <strong>Especialidad:</strong>
                  <div>{{ selectedCase.specialty }}</div>
                </div>
                <div class="col-md-3">
                  <strong>Fecha:</strong>
                  <div>{{ formatDate(selectedCase.submittedAt) }}</div>
                </div>
              </div>

              <hr>

              <div class="row g-3">
                <div class="col-md-6">
                  <h6 class="fw-semibold mb-2">Checklist</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chk1" v-model="reviewForm.checklist.anamnesis">
                    <label class="form-check-label" for="chk1">Anamnesis y antecedentes completos</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chk2" v-model="reviewForm.checklist.diagnostico">
                    <label class="form-check-label" for="chk2">Diagnóstico documentado</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chk3" v-model="reviewForm.checklist.plan">
                    <label class="form-check-label" for="chk3">Plan de tratamiento coherente</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chk4" v-model="reviewForm.checklist.consentimiento">
                    <label class="form-check-label" for="chk4">Consentimiento informado</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-semibold mb-2">Comentarios</h6>
                  <textarea class="form-control" rows="5" v-model.trim="reviewForm.comments" placeholder="Notas para el estudiante"></textarea>
                  <div class="mt-3">
                    <label class="form-label mb-1">Puntaje (0–100)</label>
                    <input type="range" class="form-range" min="0" max="100" v-model.number="reviewForm.score">
                    <div class="text-end small text-muted">{{ reviewForm.score }}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer" v-if="selectedCase">
              <button class="btn btn-outline-secondary" @click="saveReview">
                <i class="fas fa-save me-1"></i>Guardar revisión
              </button>
              <button class="btn btn-danger" @click="rejectCase(selectedCase.id)">
                <i class="fas fa-times me-1"></i>Rechazar
              </button>
              <button class="btn btn-success" @click="approveCase(selectedCase.id)">
                <i class="fas fa-check me-1"></i>Aprobar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>

    <!-- Modal: Ver todos -->
    <div v-if="showAllCasesModal">
      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="fas fa-list-ul text-primary"></i> Todos los Casos Pendientes
              </h5>
              <button type="button" class="btn-close" aria-label="Cerrar" @click="closeAllCasesModal"></button>
            </div>
            <div class="modal-body">
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Estudiante</th>
                      <th>Paciente</th>
                      <th>Caso</th>
                      <th>Fecha</th>
                      <th>Prioridad</th>
                      <th class="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="caso in pendingCases" :key="caso.id">
                      <td class="text-muted">#{{ caso.id }}</td>
                      <td>{{ caso.studentName }} <small class="text-muted">({{ caso.studentId }})</small></td>
                      <td>{{ caso.patientName }} <small class="text-muted">({{ caso.patientId }})</small></td>
                      <td>{{ caso.title }} <small class="text-muted d-block">{{ caso.specialty }}</small></td>
                      <td class="text-nowrap">{{ formatDate(caso.submittedAt) }}</td>
                      <td><span :class="getPriorityClass(caso.priority)">{{ caso.priority }}</span></td>
                      <td class="text-center">
                        <div class="d-flex justify-content-center flex-wrap">
                          <button class="btn btn-outline-success btn-sm btn-icon-text me-1 mb-1" @click="reviewCase(caso)">
                            <i class="fas fa-eye"></i><span>Revisar</span>
                          </button>
                          <button class="btn btn-success btn-sm btn-icon-text me-1 mb-1" @click="approveCase(caso.id)">
                            <i class="fas fa-check"></i><span>Aprobar</span>
                          </button>
                          <button class="btn btn-danger btn-sm btn-icon-text mb-1" @click="rejectCase(caso.id)">
                            <i class="fas fa-times"></i><span>Rechazar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="!pendingCases.length">
                      <td colspan="7" class="text-center text-muted py-4">No hay casos pendientes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline-secondary" @click="closeAllCasesModal">
                <i class="fas fa-times me-1"></i>Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>

    <!-- Toast simple (sin Bootstrap JS) -->
    <div v-if="toast.visible" class="toast-lite position-fixed top-0 end-0 m-3 shadow">
      <div class="p-2 border-bottom d-flex align-items-center gap-2">
        <i :class="toast.icon"></i>
        <strong>{{ toast.title }}</strong>
      </div>
      <div class="p-2">{{ toast.message }}</div>
    </div>
  </div>  
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/* Tipos mínimos */
type Assignment = { id: number }
type Priority = 'Alta' | 'Media' | 'Baja'
type ActivityType = 'approval' | 'submission' | 'review' | 'rejection'
type PendingCase = {
  id: number
  studentId: string
  studentName: string
  patientId: string
  patientName: string
  title: string
  specialty: string
  submittedAt: string
  priority: Priority
}
type Activity = { id: number; type: ActivityType; title: string; description: string; timestamp: string }

/* Estado */
const loading = ref(false)
const assignments = ref<Assignment[]>([])
const courses = ref<string[]>([])

const pendingCases = ref<PendingCase[]>([
  { id: 1, studentId: 'EST001', studentName: 'María García',  patientId: 'PAC001', patientName: 'Juan Pérez',   title: 'Caries Dental Múltiple', specialty: 'Operatoria Dental', submittedAt: '2025-08-07T10:30:00Z', priority: 'Alta' },
  { id: 2, studentId: 'EST002', studentName: 'Carlos López',  patientId: 'PAC002', patientName: 'Ana Martínez', title: 'Periodontitis Crónica',  specialty: 'Periodoncia',      submittedAt: '2025-08-06T15:45:00Z', priority: 'Media' },
  { id: 3, studentId: 'EST003', studentName: 'Sofía Rodríguez', patientId: 'PAC003', patientName: 'Pedro Silva',  title: 'Extracción Molar',       specialty: 'Cirugía Oral',      submittedAt: '2025-08-05T09:15:00Z', priority: 'Baja' }
])

const recentActivities = ref<Activity[]>([
  { id: 1, type: 'approval',   title: 'Caso aprobado',      description: 'Caso de endodoncia de María García aprobado', timestamp: '2025-08-08T08:30:00Z' },
  { id: 2, type: 'submission', title: 'Nuevo caso enviado', description: 'Carlos López envió caso de periodoncia',       timestamp: '2025-08-07T16:20:00Z' },
  { id: 3, type: 'review',     title: 'Caso revisado',      description: 'Caso de cirugía oral requiere correcciones',    timestamp: '2025-08-07T14:10:00Z' }
])

const courseStats = ref([
  { name: 'Operatoria Dental', totalStudents: 25, completionRate: 78, pendingCases: 5, lastCaseDate: '2025-08-07T00:00:00Z' },
  { name: 'Periodoncia',       totalStudents: 20, completionRate: 85, pendingCases: 3, lastCaseDate: '2025-08-06T00:00:00Z' },
  { name: 'Cirugía Oral',      totalStudents: 18, completionRate: 92, pendingCases: 2, lastCaseDate: '2025-08-05T00:00:00Z' }
])

/* UI: Modales controlados por Vue */
const showReviewModal = ref(false)
const showAllCasesModal = ref(false)
const selectedCase = ref<PendingCase | null>(null)
const reviewForm = ref({
  checklist: { anamnesis: false, diagnostico: false, plan: false, consentimiento: false },
  comments: '',
  score: 80
})

/* Toast simple */
const toast = ref({ visible: false, title: 'Notificación', message: '', icon: 'fas fa-info-circle' })
let toastTimer: number | null = null
const showToast = (title: string, message: string, icon = 'fas fa-info-circle') => {
  toast.value = { visible: true, title, message, icon }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value.visible = false), 2200)
}

/* Computed */
const totalStudents      = computed(() => courseStats.value.reduce((s, c) => s + c.totalStudents, 0))
const pendingCasesCount  = computed(() => pendingCases.value.length)
const casesReviewedToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return recentActivities.value.filter(a => a.timestamp.startsWith(today) && a.type === 'approval').length
})
const activeCoursesCount = computed(() => courses.value.length)

/* Acciones simuladas */
const refreshData = async () => {
  loading.value = true
  try {
    // Simula fetch; reemplaza por tus llamadas reales
    await new Promise(r => setTimeout(r, 600))
    assignments.value = [{ id: 1 }, { id: 2 }]
    courses.value = ['Operatoria', 'Periodoncia', 'Cirugía Oral']
    showToast('Datos actualizados', 'Se recargó la información.', 'fas fa-sync')
  } finally {
    loading.value = false
  }
}

const viewAllPendingCases = () => {
  if (!pendingCases.value.length) {
    showToast('Sin pendientes', 'No hay casos pendientes por ahora.', 'fas fa-check-circle')
    return
  }
  showAllCasesModal.value = true
}
const closeAllCasesModal = () => { showAllCasesModal.value = false }

const reviewCase = (caso: PendingCase) => {
  selectedCase.value = { ...caso }
  reviewForm.value = { checklist: { anamnesis: false, diagnostico: false, plan: false, consentimiento: false }, comments: '', score: 80 }
  showReviewModal.value = true
}
const closeReviewModal = () => { showReviewModal.value = false }

const approveCase = (caseId: number) => {
  const item = pendingCases.value.find(c => c.id === caseId)
  if (!item) return
  if (!confirm('¿Aprobar este caso clínico?')) return
  pendingCases.value = pendingCases.value.filter(c => c.id !== caseId)
  recentActivities.value.unshift({
    id: Date.now(), type: 'approval', title: 'Caso aprobado',
    description: `Se aprobó el caso: ${item.title} de ${item.studentName}`, timestamp: new Date().toISOString()
  })
  showToast('Caso aprobado', `${item.title} aprobado correctamente.`, 'fas fa-check')
  showReviewModal.value = false
}
const rejectCase = (caseId: number) => {
  const item = pendingCases.value.find(c => c.id === caseId)
  if (!item) return
  if (!confirm('¿Rechazar este caso clínico? El estudiante deberá realizar correcciones.')) return
  pendingCases.value = pendingCases.value.filter(c => c.id !== caseId)
  recentActivities.value.unshift({
    id: Date.now(), type: 'rejection', title: 'Caso rechazado',
    description: `Se rechazó el caso: ${item.title} de ${item.studentName}`, timestamp: new Date().toISOString()
  })
  showToast('Caso rechazado', `${item.title} fue rechazado.`, 'fas fa-times')
  showReviewModal.value = false
}
const saveReview = () => {
  if (!selectedCase.value) return
  showToast('Revisión guardada', 'Se guardaron tus observaciones.', 'fas fa-save')
}

/* Helpers */
const formatDate     = (iso: string) => new Date(iso).toLocaleDateString('es-ES')
const formatDateTime = (iso: string) => new Date(iso).toLocaleString('es-ES')
const getPriorityClass = (priority: Priority) =>
  ({ Alta: 'badge bg-danger', Media: 'badge bg-warning text-dark', Baja: 'badge bg-success' }[priority])
const getActivityIconClass = (type: ActivityType) =>
  ({ approval: 'bg-success', submission: 'bg-primary', review: 'bg-warning', rejection: 'bg-danger' }[type])
const getActivityIcon = (type: ActivityType) =>
  ({ approval: 'fas fa-check', submission: 'fas fa-plus', review: 'fas fa-eye', rejection: 'fas fa-times' }[type])
</script>

<!-- Llamada al CSS de la página (coloca tus estilos ahí) -->
<style src="@/assets/css/pages/professor/ProfessorDashboard.css" scoped></style>

<!-- Estilos mínimos locales para modales controlados por Vue y toast lite -->
<style scoped>
.header-bar { border-bottom: 1px solid #e9ecef; padding-bottom: .75rem; }
.btn-icon-text i { margin-right: .5rem; }

/* Stats */
.stat-card { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 6px 18px rgba(0,0,0,.08); }
.stat-icon { font-size:1.75rem; }
.stat-number { font-size:1.6rem; font-weight:700; }
.stat-label { font-size:.9rem; }

/* Cards */
.card-elev { border:1px solid #eef1f4; border-radius:.75rem; box-shadow:0 6px 18px rgba(0,0,0,.06); }
.card-elev .card-header { background:#fff; border-bottom:1px solid #eef1f4; }

/* Table */
.sticky-thead { position: sticky; top: 0; z-index: 1; }

/* Avatars */
.mini-avatar { width:36px; height:36px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700; }

/* Action buttons */
.action-group .btn { min-width: 120px; }

/* Timeline */
.timeline { position:relative; margin-left:.5rem; }
.timeline::before { content:''; position:absolute; left:14px; top:0; bottom:0; width:2px; background:#e9ecef; }
.timeline-item { display:flex; gap:.75rem; position:relative; padding-left:1.5rem; margin-bottom:1rem; }
.timeline-dot { width:28px; height:28px; border-radius:50%; color:#fff; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.15); }

/* Course stat */
.course-stat-card { border:1px solid #eef1f4; border-radius:.75rem; padding:.9rem; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,.05); }
.progress-thin { height:6px; }

/* Toast lite */
.toast-lite { background:#fff; border:1px solid #e9ecef; border-radius:.5rem; min-width:260px; overflow:hidden; z-index:1090; }

/* Responsive */
@media (max-width: 991.98px) { .action-group .btn { min-width: 100px; } }
@media (max-width: 575.98px) { .action-group .btn { min-width: auto; } }
</style>
