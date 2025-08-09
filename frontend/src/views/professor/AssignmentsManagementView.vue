<!-- src/views/professor/AssignmentsManagementView.vue -->
<template>
  <section class="clinical-management container py-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0 text-primary">
            <i class="bi bi-clipboard-pulse me-2"></i>
            Gestión de Casos Clínicos
          </h2>
        </div>
      </div>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-file-medical-fill text-primary fs-1 mb-2"></i>
            <h5 class="card-title">{{ totalCases }}</h5>
            <p class="card-text text-muted">Total Casos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-clock-fill text-warning fs-1 mb-2"></i>
            <h5 class="card-title">{{ pendingCases }}</h5>
            <p class="card-text text-muted">Pendientes Revisión</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
            <h5 class="card-title">{{ approvedCases }}</h5>
            <p class="card-text text-muted">Aprobados</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-x-circle-fill text-danger fs-1 mb-2"></i>
            <h5 class="card-title">{{ rejectedCases }}</h5>
            <p class="card-text text-muted">Rechazados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
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

    <!-- Tabla de Casos Clínicos -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Casos Clínicos Asignados</h5>
        <button class="btn btn-primary" @click="createNewAssignment">
          <i class="bi bi-plus-lg me-2"></i>
          Nueva Asignación Clínica
        </button>
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
                <th>Acciones</th>
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
                      class="rounded-circle me-2"
                      width="32"
                      height="32"
                    />
                    <span>{{ clinicalCase.studentName }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-info">{{ clinicalCase.specialty }}</span>
                </td>
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
                <td>
                  <small class="text-muted">{{ formatDate(clinicalCase.assignedDate) }}</small>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewCaseDetails(clinicalCase.id)"
                      title="Ver Detalles"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      v-if="clinicalCase.status === 'pendiente'"
                      class="btn btn-sm btn-outline-success"
                      @click="approveCase(clinicalCase.id)"
                      title="Aprobar"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button
                      v-if="clinicalCase.status === 'pendiente'"
                      class="btn btn-sm btn-outline-danger"
                      @click="rejectCase(clinicalCase.id)"
                      title="Rechazar"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="editAssignment(clinicalCase.id)"
                      title="Editar Asignación"
                    >
                      <i class="bi bi-pencil"></i>
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

    <!-- Modal de Detalles del Caso -->
    <div class="modal fade" id="caseDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del Caso Clínico</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedCase" class="row">
              <div class="col-md-6">
                <h6>Información del Paciente</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>{{ selectedCase.patientName }}</td>
                  </tr>
                  <tr>
                    <td><strong>Edad:</strong></td>
                    <td>{{ selectedCase.patientAge }} años</td>
                  </tr>
                  <tr>
                    <td><strong>Género:</strong></td>
                    <td>{{ selectedCase.patientGender }}</td>
                  </tr>|
                </table>
              </div>
              <div class="col-md-6">
                <h6>Información del Caso</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Estudiante:</strong></td>
                    <td>{{ selectedCase.studentName }}</td>
                  </tr>
                  <tr>
                    <td><strong>Especialidad:</strong></td>
                    <td>{{ selectedCase.specialty }}</td>
                  </tr>
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
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Nueva Asignación -->
    <div class="modal fade" id="newAssignmentModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nueva Asignación Clínica</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Estudiante</label>
                    <select v-model="newAssignment.studentId" class="form-select" required>
                      <option value="">Seleccionar estudiante</option>
                      <option v-for="student in availableStudents" :key="student.id" :value="student.id">
                        {{ student.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Paciente</label>
                    <select v-model="newAssignment.patientId" class="form-select" required>
                      <option value="">Seleccionar paciente</option>
                      <option v-for="patient in availablePatients" :key="patient.id" :value="patient.id">
                        {{ patient.name }} ({{ patient.age }} años)
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Especialidad</label>
                    <select v-model="newAssignment.specialty" class="form-select" required>
                      <option value="">Seleccionar especialidad</option>
                      <option value="operatoria">Operatoria Dental</option>
                      <option value="endodoncia">Endodoncia</option>
                      <option value="periodoncia">Periodoncia</option>
                      <option value="cirugia">Cirugía Oral</option>
                      <option value="protesis">Prótesis</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Prioridad</label>
                    <select v-model="newAssignment.priority" class="form-select" required>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Observaciones</label>
                    <textarea
                      v-model="newAssignment.notes"
                      class="form-control"
                      rows="3"
                      placeholder="Instrucciones específicas para el estudiante..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click="saveAssignment">
              Crear Asignación
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Interfaces para casos clínicos
interface ClinicalCase {
  id: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  studentName: string;
  studentAvatar: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_progreso';
  assignedDate: string;
  notes?: string;
}

interface Student {
  id: number;
  name: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
}

interface NewAssignment {
  studentId: number | '';
  patientId: number | '';
  specialty: string;
  priority: string;
  notes: string;
}

// Estado reactivo
const clinicalCases = ref<ClinicalCase[]>([]);
const selectedStatus = ref<string>('');
const selectedSpecialty = ref<string>('');
const selectedStudent = ref<string>('');
const searchTerm = ref<string>('');
const selectedCase = ref<ClinicalCase | null>(null);
const newAssignment = ref<NewAssignment>({
  studentId: '',
  patientId: '',
  specialty: '',
  priority: 'media',
  notes: ''
});

// Datos simulados
const availableStudents = ref<Student[]>([
  { id: 1, name: 'Ana Rodríguez' },
  { id: 2, name: 'Carlos Mendoza' },
  { id: 3, name: 'María González' },
  { id: 4, name: 'David Silva' },
  { id: 5, name: 'Laura Vargas' }
]);

const availablePatients = ref<Patient[]>([
  { id: 1, name: 'Juan Pérez', age: 45 },
  { id: 2, name: 'Carmen López', age: 32 },
  { id: 3, name: 'Roberto García', age: 28 },
  { id: 4, name: 'Elena Morales', age: 55 },
  { id: 5, name: 'Francisco Rivera', age: 38 }
]);

// Cargar datos al montar
onMounted(() => {
  loadClinicalCases();
});

function loadClinicalCases() {
  clinicalCases.value = [
    {
      id: 1,
      patientName: 'Juan Pérez',
      patientAge: 45,
      patientGender: 'Masculino',
      studentName: 'Ana Rodríguez',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      specialty: 'Operatoria Dental',
      diagnosis: 'Caries dental múltiple',
      treatment: 'Restauraciones con resina compuesta',
      status: 'pendiente',
      assignedDate: '2024-01-15T09:00:00Z',
      notes: 'Paciente con múltiples caries. Requiere tratamiento inmediato.'
    },
    {
      id: 2,
      patientName: 'Carmen López',
      patientAge: 32,
      patientGender: 'Femenino',
      studentName: 'Carlos Mendoza',
      studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      specialty: 'Endodoncia',
      diagnosis: 'Pulpitis irreversible',
      treatment: 'Tratamiento de conducto',
      status: 'aprobado',
      assignedDate: '2024-01-14T14:30:00Z',
      notes: 'Caso complejo que requiere supervisión constante.'
    },
    {
      id: 3,
      patientName: 'Roberto García',
      patientAge: 28,
      patientGender: 'Masculino',
      studentName: 'María González',
      studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      specialty: 'Periodoncia',
      diagnosis: 'Gingivitis crónica',
      treatment: 'Raspado y alisado radicular',
      status: 'en_progreso',
      assignedDate: '2024-01-13T11:15:00Z'
    },
    {
      id: 4,
      patientName: 'Elena Morales',
      patientAge: 55,
      patientGender: 'Femenino',
      studentName: 'David Silva',
      studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      specialty: 'Prótesis',
      diagnosis: 'Edentulismo parcial',
      treatment: 'Prótesis parcial removible',
      status: 'rechazado',
      assignedDate: '2024-01-12T16:00:00Z',
      notes: 'Plan de tratamiento incompleto. Requiere revisión.'
    },
    {
      id: 5,
      patientName: 'Francisco Rivera',
      patientAge: 38,
      patientGender: 'Masculino',
      studentName: 'Laura Vargas',
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      specialty: 'Cirugía Oral',
      diagnosis: 'Extracción de terceros molares',
      treatment: 'Cirugía de extracción',
      status: 'pendiente',
      assignedDate: '2024-01-15T13:45:00Z',
      notes: 'Extracción compleja. Revisar estudios radiográficos.'
    }
  ];
}

// Computed properties para estadísticas
const totalCases = computed(() => clinicalCases.value.length);
const pendingCases = computed(() => 
  clinicalCases.value.filter(c => c.status === 'pendiente').length
);
const approvedCases = computed(() => 
  clinicalCases.value.filter(c => c.status === 'aprobado').length
);
const rejectedCases = computed(() => 
  clinicalCases.value.filter(c => c.status === 'rechazado').length
);

// Computed property para estudiantes únicos
const students = computed(() => 
  Array.from(new Set(clinicalCases.value.map(c => c.studentName)))
);

// Computed property para casos filtrados
const filteredCases = computed(() => {
  return clinicalCases.value.filter(clinicalCase => {
    const matchesStatus = !selectedStatus.value || clinicalCase.status === selectedStatus.value;
    const matchesSpecialty = !selectedSpecialty.value || 
      clinicalCase.specialty.toLowerCase().includes(selectedSpecialty.value.toLowerCase());
    const matchesStudent = !selectedStudent.value || clinicalCase.studentName === selectedStudent.value;
    const matchesSearch = !searchTerm.value || 
      clinicalCase.patientName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      clinicalCase.diagnosis.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      clinicalCase.treatment.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    return matchesStatus && matchesSpecialty && matchesStudent && matchesSearch;
  });
});

// Funciones utilitarias
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pendiente':
      return 'bg-warning text-dark';
    case 'aprobado':
      return 'bg-success';
    case 'rechazado':
      return 'bg-danger';
    case 'en_progreso':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
    case 'aprobado':
      return 'Aprobado';
    case 'rechazado':
      return 'Rechazado';
    case 'en_progreso':
      return 'En Progreso';
    default:
      return 'Desconocido';
  }
}

// Funciones de interacción
function viewCaseDetails(caseId: number) {
  selectedCase.value = clinicalCases.value.find(c => c.id === caseId) || null;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('caseDetailsModal'));
  modal.show();
}

function approveCase(caseId: number) {
  const clinicalCase = clinicalCases.value.find(c => c.id === caseId);
  if (clinicalCase) {
    clinicalCase.status = 'aprobado';
    console.log(`Caso ${caseId} aprobado`);
  }
}

function rejectCase(caseId: number) {
  const clinicalCase = clinicalCases.value.find(c => c.id === caseId);
  if (clinicalCase) {
    clinicalCase.status = 'rechazado';
    console.log(`Caso ${caseId} rechazado`);
  }
}

function editAssignment(caseId: number) {
  console.log(`Editar asignación ${caseId}`);
  // Aquí se implementaría la lógica para editar la asignación
}

function createNewAssignment() {
  // Limpiar formulario
  newAssignment.value = {
    studentId: '',
    patientId: '',
    specialty: '',
    priority: 'media',
    notes: ''
  };
  
  const modal = new (window as any).bootstrap.Modal(document.getElementById('newAssignmentModal'));
  modal.show();
}

function saveAssignment() {
  console.log('Guardar nueva asignación:', newAssignment.value);
  
  // Aquí se implementaría la lógica para guardar la asignación
  // Por ahora solo cerraremos el modal
  const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('newAssignmentModal'));
  modal.hide();
  
  // Recargar casos
  loadClinicalCases();
}
</script>

<style scoped>
.clinical-management {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-body {
  padding: 1.5rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
}

.table th {
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
}

.table td {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-group .btn {
  padding: 0.375rem 0.5rem;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.text-primary {
  color: #7b2cbf !important;
}

.btn-primary {
  background-color: #7b2cbf;
  border-color: #7b2cbf;
}

.btn-primary:hover {
  background-color: #6a1b9a;
  border-color: #6a1b9a;
}

.btn-outline-primary {
  color: #7b2cbf;
  border-color: #7b2cbf;
}

.btn-outline-primary:hover {
  background-color: #7b2cbf;
  border-color: #7b2cbf;
}

.fs-1 {
  font-size: 3rem !important;
}

.rounded-circle {
  object-fit: cover;
}

.form-select:focus,
.form-control:focus,
.form-control:focus {
  border-color: #7b2cbf;
  box-shadow: 0 0 0 0.2rem rgba(123, 44, 191, 0.25);
}

.table-hover tbody tr:hover {
  background-color: rgba(123, 44, 191, 0.05);
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.fw-bold {
  font-weight: 700 !important;
}

.fw-semibold {
  font-weight: 600 !important;
}
</style>
