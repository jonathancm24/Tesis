<template>
  <section class="clinical-management container py-4">
    <!-- Header -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 class="mb-0 text-primary fw-bold">
            <i class="bi bi-clipboard-pulse me-2"></i>
            Gestión de Casos Clínicos
          </h2>
          <button class="btn btn-primary btn-icon-text" @click="createNewAssignment">
            <i class="bi bi-plus-lg"></i><span>Nueva Asignación Clínica</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="row mb-4 g-3">
      <div class="col-lg-3 col-md-6">
        <div class="card kpi-card h-100">
          <div class="card-body text-center">
            <i class="bi bi-file-medical-fill text-brand fs-1 mb-2"></i>
            <h5 class="card-title mb-0">{{ totalCases }}</h5>
            <p class="card-text text-muted">Total Casos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card kpi-card h-100">
          <div class="card-body text-center">
            <i class="bi bi-clock-fill text-warning fs-1 mb-2"></i>
            <h5 class="card-title mb-0">{{ pendingCases }}</h5>
            <p class="card-text text-muted">Pendientes Revisión</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card kpi-card h-100">
          <div class="card-body text-center">
            <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
            <h5 class="card-title mb-0">{{ approvedCases }}</h5>
            <p class="card-text text-muted">Aprobados</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card kpi-card h-100">
          <div class="card-body text-center">
            <i class="bi bi-x-circle-fill text-danger fs-1 mb-2"></i>
            <h5 class="card-title mb-0">{{ rejectedCases }}</h5>
            <p class="card-text text-muted">Rechazados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Estado</label>
            <select v-model="selectedStatus" class="form-select">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente Revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="en_progreso">En Progreso</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Especialidad</label>
            <select v-model="selectedSpecialty" class="form-select">
              <option value="">Todas las especialidades</option>
              <option value="operatoria">Operatoria Dental</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="cirugia">Cirugía Oral</option>
              <option value="protesis">Prótesis</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Estudiante</label>
            <select v-model="selectedStudent" class="form-select">
              <option value="">Todos los estudiantes</option>
              <option v-for="student in students" :key="student" :value="student">
                {{ student }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Buscar</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              placeholder="Paciente, diagnóstico..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Casos -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Casos Clínicos Asignados</h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Paciente</th>
                <th>Estudiante</th>
                <th>Especialidad</th>
                <th>Diagnóstico</th>
                <th>Estado</th>
                <th>Fecha Asignación</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="clinicalCase in filteredCases" :key="clinicalCase.id">
                <td>
                  <div>
                    <div class="fw-bold">{{ clinicalCase.patientName }}</div>
                    <small class="text-muted">{{ clinicalCase.patientAge }} años</small>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="clinicalCase.studentAvatar"
                      :alt="clinicalCase.studentName"
                      class="rounded-circle me-2 avatar"
                      width="32"
                      height="32"
                    />
                    <span>{{ clinicalCase.studentName }}</span>
                  </div>
                </td>
                <td><span class="badge bg-info">{{ clinicalCase.specialty }}</span></td>
                <td>
                  <div>
                    <div class="fw-semibold">{{ clinicalCase.diagnosis }}</div>
                    <small class="text-muted">{{ clinicalCase.treatment }}</small>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(clinicalCase.status)" class="badge">
                    {{ getStatusText(clinicalCase.status) }}
                  </span>
                </td>
                <td><small class="text-muted">{{ formatDate(clinicalCase.assignedDate) }}</small></td>
                <td class="text-center">
                  <div class="action-group d-flex flex-wrap justify-content-center">
                    <button
                      class="btn btn-outline-primary btn-icon-text me-1 mb-1"
                      @click="viewCaseDetails(clinicalCase.id)"
                    >
                      <i class="bi bi-eye"></i><span>Ver</span>
                    </button>
                    <button
                      v-if="clinicalCase.status === 'pendiente'"
                      class="btn btn-outline-success btn-icon-text me-1 mb-1"
                      @click="approveCase(clinicalCase.id)"
                    >
                      <i class="bi bi-check-lg"></i><span>Aprobar</span>
                    </button>
                    <button
                      v-if="clinicalCase.status === 'pendiente'"
                      class="btn btn-outline-danger btn-icon-text me-1 mb-1"
                      @click="rejectCase(clinicalCase.id)"
                    >
                      <i class="bi bi-x-lg"></i><span>Rechazar</span>
                    </button>
                    <button
                      class="btn btn-outline-info btn-icon-text mb-1"
                      @click="editAssignment(clinicalCase.id)"
                    >
                      <i class="bi bi-pencil"></i><span>Editar</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCases.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  No se encontraron casos clínicos que coincidan con los filtros.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Detalles del Caso -->
    <div class="modal fade" id="caseDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-brand">
            <h5 class="modal-title">Detalles del Caso Clínico</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedCase" class="row">
              <div class="col-md-6">
                <h6>Información del Paciente</h6>
                <table class="table table-sm">
                  <tr><td><strong>Nombre:</strong></td><td>{{ selectedCase.patientName }}</td></tr>
                  <tr><td><strong>Edad:</strong></td><td>{{ selectedCase.patientAge }} años</td></tr>
                  <tr><td><strong>Género:</strong></td><td>{{ selectedCase.patientGender }}</td></tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Información del Caso</h6>
                <table class="table table-sm">
                  <tr><td><strong>Estudiante:</strong></td><td>{{ selectedCase.studentName }}</td></tr>
                  <tr><td><strong>Especialidad:</strong></td><td>{{ selectedCase.specialty }}</td></tr>
                  <tr>
                    <td><strong>Estado:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedCase.status)" class="badge">
                        {{ getStatusText(selectedCase.status) }}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <div class="col-12">
                <h6>Diagnóstico y Tratamiento</h6>
                <p><strong>Diagnóstico:</strong> {{ selectedCase.diagnosis }}</p>
                <p><strong>Tratamiento Propuesto:</strong> {{ selectedCase.treatment }}</p>
                <p><strong>Observaciones:</strong> {{ selectedCase.notes || 'Sin observaciones' }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nueva Asignación -->
    <div class="modal fade" id="newAssignmentModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-brand">
            <h5 class="modal-title">Nueva Asignación Clínica</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Estudiante</label>
                  <select v-model="newAssignment.studentId" class="form-select" required>
                    <option value="">Seleccionar estudiante</option>
                    <option v-for="student in availableStudents" :key="student.id" :value="student.id">
                      {{ student.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Paciente</label>
                  <select v-model="newAssignment.patientId" class="form-select" required>
                    <option value="">Seleccionar paciente</option>
                    <option v-for="patient in availablePatients" :key="patient.id" :value="patient.id">
                      {{ patient.name }} ({{ patient.age }} años)
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Especialidad</label>
                  <select v-model="newAssignment.specialty" class="form-select" required>
                    <option value="">Seleccionar especialidad</option>
                    <option value="Operatoria Dental">Operatoria Dental</option>
                    <option value="Endodoncia">Endodoncia</option>
                    <option value="Periodoncia">Periodoncia</option>
                    <option value="Cirugía Oral">Cirugía Oral</option>
                    <option value="Prótesis">Prótesis</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Prioridad</label>
                  <select v-model="newAssignment.priority" class="form-select" required>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Diagnóstico</label>
                  <input v-model="newAssignment.diagnosis" type="text" class="form-control" placeholder="Ej. caries dental múltiple" required>
                </div>
                <div class="col-12">
                  <label class="form-label">Tratamiento Propuesto</label>
                  <input v-model="newAssignment.treatment" type="text" class="form-control" placeholder="Ej. restauraciones con resina" required>
                </div>
                <div class="col-12">
                  <label class="form-label">Observaciones</label>
                  <textarea v-model="newAssignment.notes" class="form-control" rows="3" placeholder="Instrucciones específicas para el estudiante..."></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="saveAssignment">Crear Asignación</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ClinicalCase {
  id: number
  patientName: string
  patientAge: number
  patientGender: string
  studentName: string
  studentAvatar: string
  specialty: string
  diagnosis: string
  treatment: string
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_progreso'
  assignedDate: string
  notes?: string
}

interface Student { id: number; name: string; avatar?: string }
interface Patient { id: number; name: string; age: number }

interface NewAssignment {
  studentId: number | ''
  patientId: number | ''
  specialty: string
  priority: 'baja' | 'media' | 'alta'
  diagnosis: string
  treatment: string
  notes: string
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=100&h=100&fit=crop&crop=face'

/* Estado */
const clinicalCases = ref<ClinicalCase[]>([])
const selectedStatus = ref<string>('')        // filtro
const selectedSpecialty = ref<string>('')     // filtro
const selectedStudent = ref<string>('')       // filtro
const searchTerm = ref<string>('')            // filtro
const selectedCase = ref<ClinicalCase | null>(null)

const newAssignment = ref<NewAssignment>({
  studentId: '',
  patientId: '',
  specialty: '',
  priority: 'media',
  diagnosis: '',
  treatment: '',
  notes: ''
})

/* Datos simulados */
const availableStudents = ref<Student[]>([
  { id: 1, name: 'Ana Rodríguez' },
  { id: 2, name: 'Carlos Mendoza' },
  { id: 3, name: 'María González' },
  { id: 4, name: 'David Silva' },
  { id: 5, name: 'Laura Vargas' }
])

const availablePatients = ref<Patient[]>([
  { id: 1, name: 'Juan Pérez', age: 45 },
  { id: 2, name: 'Carmen López', age: 32 },
  { id: 3, name: 'Roberto García', age: 28 },
  { id: 4, name: 'Elena Morales', age: 55 },
  { id: 5, name: 'Francisco Rivera', age: 38 }
])

/* Carga inicial */
onMounted(loadClinicalCases)

function loadClinicalCases () {
  clinicalCases.value = [
    { id: 1, patientName: 'Juan Pérez', patientAge: 45, patientGender: 'Masculino', studentName: 'Ana Rodríguez', studentAvatar: DEFAULT_AVATAR, specialty: 'Operatoria Dental', diagnosis: 'Caries dental múltiple', treatment: 'Restauraciones con resina compuesta', status: 'pendiente', assignedDate: '2024-01-15T09:00:00Z', notes: 'Paciente con múltiples caries. Requiere tratamiento inmediato.' },
    { id: 2, patientName: 'Carmen López', patientAge: 32, patientGender: 'Femenino', studentName: 'Carlos Mendoza', studentAvatar: DEFAULT_AVATAR, specialty: 'Endodoncia', diagnosis: 'Pulpitis irreversible', treatment: 'Tratamiento de conducto', status: 'aprobado', assignedDate: '2024-01-14T14:30:00Z', notes: 'Caso complejo que requiere supervisión constante.' },
    { id: 3, patientName: 'Roberto García', patientAge: 28, patientGender: 'Masculino', studentName: 'María González', studentAvatar: DEFAULT_AVATAR, specialty: 'Periodoncia', diagnosis: 'Gingivitis crónica', treatment: 'Raspado y alisado radicular', status: 'en_progreso', assignedDate: '2024-01-13T11:15:00Z' },
    { id: 4, patientName: 'Elena Morales', patientAge: 55, patientGender: 'Femenino', studentName: 'David Silva', studentAvatar: DEFAULT_AVATAR, specialty: 'Prótesis', diagnosis: 'Edentulismo parcial', treatment: 'Prótesis parcial removible', status: 'rechazado', assignedDate: '2024-01-12T16:00:00Z', notes: 'Plan de tratamiento incompleto. Requiere revisión.' },
    { id: 5, patientName: 'Francisco Rivera', patientAge: 38, patientGender: 'Masculino', studentName: 'Laura Vargas', studentAvatar: DEFAULT_AVATAR, specialty: 'Cirugía Oral', diagnosis: 'Extracción de terceros molares', treatment: 'Cirugía de extracción', status: 'pendiente', assignedDate: '2024-01-15T13:45:00Z', notes: 'Extracción compleja. Revisar estudios radiográficos.' }
  ]
}

/* Estadísticas */
const totalCases    = computed(() => clinicalCases.value.length)
const pendingCases  = computed(() => clinicalCases.value.filter(c => c.status === 'pendiente').length)
const approvedCases = computed(() => clinicalCases.value.filter(c => c.status === 'aprobado').length)
const rejectedCases = computed(() => clinicalCases.value.filter(c => c.status === 'rechazado').length)
const students      = computed(() => Array.from(new Set(clinicalCases.value.map(c => c.studentName))))

/* Filtros */
const filteredCases = computed(() => {
  return clinicalCases.value.filter(c => {
    const statusOK  = !selectedStatus.value || c.status === selectedStatus.value
    const specOK    = !selectedSpecialty.value || c.specialty.toLowerCase().includes(selectedSpecialty.value.toLowerCase())
    const studentOK = !selectedStudent.value || c.studentName === selectedStudent.value
    const q         = searchTerm.value.trim().toLowerCase()
    const searchOK  = !q || c.patientName.toLowerCase().includes(q) || c.diagnosis.toLowerCase().includes(q) || c.treatment.toLowerCase().includes(q)
    return statusOK && specOK && studentOK && searchOK
  })
})

/* Utils */
function formatDate (iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
function getStatusBadgeClass (status: ClinicalCase['status']) {
  return {
    pendiente:   'bg-warning text-dark',
    aprobado:    'bg-success',
    rechazado:   'bg-danger',
    en_progreso: 'bg-info'
  }[status] || 'bg-secondary'
}
function getStatusText (status: ClinicalCase['status']) {
  return {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_progreso: 'En Progreso'
  }[status] || 'Desconocido'
}

/* Acciones */
function viewCaseDetails (caseId: number) {
  selectedCase.value = clinicalCases.value.find(c => c.id === caseId) || null
  const modal = new (window as any).bootstrap.Modal(document.getElementById('caseDetailsModal'))
  modal.show()
}
function approveCase (caseId: number) {
  const c = clinicalCases.value.find(x => x.id === caseId)
  if (c) c.status = 'aprobado'
}
function rejectCase (caseId: number) {
  const c = clinicalCases.value.find(x => x.id === caseId)
  if (c) c.status = 'rechazado'
}
function editAssignment (caseId: number) {
  // Aquí podrías abrir el mismo modal prellenado
  console.log('Editar asignación', caseId)
}
function createNewAssignment () {
  newAssignment.value = {
    studentId: '',
    patientId: '',
    specialty: '',
    priority: 'media',
    diagnosis: '',
    treatment: '',
    notes: ''
  }
  const modal = new (window as any).bootstrap.Modal(document.getElementById('newAssignmentModal'))
  modal.show()
}
function saveAssignment () {
  // Validación mínima
  if (!newAssignment.value.studentId || !newAssignment.value.patientId || !newAssignment.value.specialty || !newAssignment.value.diagnosis || !newAssignment.value.treatment) {
    alert('Completa todos los campos obligatorios.')
    return
  }

  const student = availableStudents.value.find(s => s.id === newAssignment.value.studentId)!
  const patient = availablePatients.value.find(p => p.id === newAssignment.value.patientId)!

  const lastCase = clinicalCases.value.length > 0 ? clinicalCases.value[clinicalCases.value.length - 1] : null
  const nextId = (lastCase?.id ?? 0) + 1
  clinicalCases.value.unshift({
    id: nextId,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: '—',
    studentName: student.name,
    studentAvatar: student.avatar || DEFAULT_AVATAR,
    specialty: newAssignment.value.specialty,
    diagnosis: newAssignment.value.diagnosis,
    treatment: newAssignment.value.treatment,
    status: 'pendiente',
    assignedDate: new Date().toISOString(),
    notes: newAssignment.value.notes || ''
  })

  // Cerrar modal
  const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('newAssignmentModal'))
  modal?.hide()
}
</script>

<!-- CSS externo -->
<style src="@/assets/css/pages/professor/AssignmentsManagement.css" scoped></style>
