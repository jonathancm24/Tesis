<!-- src/views/professor/StudentProgressView.vue -->
<template>
  <section class="student-progress container py-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0 text-primary">
            <i class="bi bi-people-fill me-2"></i>
            Supervisión de Estudiantes
          </h2>
        </div>
      </div>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-person-check-fill text-success fs-1 mb-2"></i>
            <h5 class="card-title">{{ studentsWithPermissions }}</h5>
            <p class="card-text text-muted">Con Permisos Activos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-person-x-fill text-warning fs-1 mb-2"></i>
            <h5 class="card-title">{{ studentsWithoutPermissions }}</h5>
            <p class="card-text text-muted">Sin Permisos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-clipboard-check-fill text-info fs-1 mb-2"></i>
            <h5 class="card-title">{{ activeCases }}</h5>
            <p class="card-text text-muted">Casos Activos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-clock-fill text-danger fs-1 mb-2"></i>
            <h5 class="card-title">{{ pendingReviews }}</h5>
            <p class="card-text text-muted">Revisiones Pendientes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Curso</label>
            <select v-model="selectedCourse" class="form-select">
              <option value="">Todos los cursos</option>
              <option v-for="course in courses" :key="course" :value="course">
                {{ course }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Estado de Permisos</label>
            <select v-model="selectedPermissionStatus" class="form-select">
              <option value="">Todos</option>
              <option value="activo">Con Permisos Activos</option>
              <option value="revocado">Permisos Revocados</option>
              <option value="pendiente">Pendiente Aprobación</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Nivel Clínico</label>
            <select v-model="selectedLevel" class="form-select">
              <option value="">Todos los niveles</option>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Buscar</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              placeholder="Nombre del estudiante..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Estudiantes -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Estudiante</th>
                <th>Curso/Nivel</th>
                <th>Casos Activos</th>
                <th>Estado Permisos</th>
                <th>Última Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in filteredStudents" :key="student.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="student.avatar"
                      :alt="student.name"
                      class="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    <div>
                      <div class="fw-bold">{{ student.name }}</div>
                      <small class="text-muted">{{ student.email }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="fw-semibold">{{ student.course }}</div>
                    <span :class="getLevelBadgeClass(student.level)" class="badge">
                      {{ student.level }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-info">{{ student.activeCases }}</span>
                </td>
                <td>
                  <span :class="getPermissionBadgeClass(student.permissionStatus)" class="badge">
                    {{ getPermissionStatusText(student.permissionStatus) }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">{{ formatDate(student.lastActivity) }}</small>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewStudentDetails(student.id)"
                      title="Ver Detalles"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      v-if="student.permissionStatus === 'activo'"
                      class="btn btn-sm btn-outline-warning"
                      @click="revokePermissions(student.id)"
                      title="Revocar Permisos"
                    >
                      <i class="bi bi-person-x"></i>
                    </button>
                    <button
                      v-if="student.permissionStatus === 'revocado'"
                      class="btn btn-sm btn-outline-success"
                      @click="grantPermissions(student.id)"
                      title="Otorgar Permisos"
                    >
                      <i class="bi bi-person-check"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="viewClinicalHistory(student.id)"
                      title="Historia Clínica"
                    >
                      <i class="bi bi-clipboard-data"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  No se encontraron estudiantes que coincidan con los filtros.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación para Revocar Permisos -->
    <div class="modal fade" id="revokeModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Revocar Permisos de Atención</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de que desea revocar los permisos de atención clínica para este estudiante?</p>
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Esta acción impedirá que el estudiante pueda:
              <ul class="mb-0 mt-2">
                <li>Crear nuevos casos clínicos</li>
                <li>Acceder a tratamientos de pacientes</li>
                <li>Realizar procedimientos clínicos</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-warning"
              @click="confirmRevokePermissions"
              data-bs-dismiss="modal"
            >
              Revocar Permisos
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles del Estudiante -->
    <div class="modal fade" id="studentDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del Estudiante</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedStudent" class="row">
              <div class="col-md-4 text-center">
                <img
                  :src="selectedStudent.avatar"
                  :alt="selectedStudent.name"
                  class="rounded-circle mb-3"
                  width="120"
                  height="120"
                />
                <h5>{{ selectedStudent.name }}</h5>
                <p class="text-muted">{{ selectedStudent.email }}</p>
              </div>
              <div class="col-md-8">
                <h6>Información Académica</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Curso:</strong></td>
                    <td>{{ selectedStudent.course }}</td>
                  </tr>
                  <tr>
                    <td><strong>Nivel Clínico:</strong></td>
                    <td>
                      <span :class="getLevelBadgeClass(selectedStudent.level)" class="badge">
                        {{ selectedStudent.level }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Casos Activos:</strong></td>
                    <td>{{ selectedStudent.activeCases }}</td>
                  </tr>
                  <tr>
                    <td><strong>Casos Completados:</strong></td>
                    <td>{{ selectedStudent.completedCases }}</td>
                  </tr>
                  <tr>
                    <td><strong>Calificación Promedio:</strong></td>
                    <td>{{ selectedStudent.averageGrade }}/10</td>
                  </tr>
                </table>
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
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Interfaces para la nueva funcionalidad
interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string;
  course: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  permissionStatus: 'activo' | 'revocado' | 'pendiente';
  activeCases: number;
  completedCases: number;
  averageGrade: number;
  lastActivity: string;
}

// Estado reactivo
const students = ref<Student[]>([]);
const selectedCourse = ref<string>('');
const selectedPermissionStatus = ref<string>('');
const selectedLevel = ref<string>('');
const searchTerm = ref<string>('');
const selectedStudent = ref<Student | null>(null);
const studentToRevoke = ref<number | null>(null);

// Cargar datos simulados al montar el componente
onMounted(() => {
  loadStudentData();
});

function loadStudentData() {
  // Datos simulados para estudiantes
  students.value = [
    {
      id: 1,
      name: 'Ana Rodríguez',
      email: 'ana.rodriguez@universidad.edu',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      course: 'Odontología Integral III',
      level: 'avanzado',
      permissionStatus: 'activo',
      activeCases: 3,
      completedCases: 12,
      averageGrade: 8.5,
      lastActivity: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@universidad.edu',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      course: 'Odontología Integral II',
      level: 'intermedio',
      permissionStatus: 'revocado',
      activeCases: 0,
      completedCases: 8,
      averageGrade: 7.2,
      lastActivity: '2024-01-14T14:15:00Z'
    },
    {
      id: 3,
      name: 'María González',
      email: 'maria.gonzalez@universidad.edu',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      course: 'Odontología Integral I',
      level: 'basico',
      permissionStatus: 'pendiente',
      activeCases: 1,
      completedCases: 3,
      averageGrade: 9.1,
      lastActivity: '2024-01-15T09:45:00Z'
    },
    {
      id: 4,
      name: 'David Silva',
      email: 'david.silva@universidad.edu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      course: 'Odontología Integral III',
      level: 'avanzado',
      permissionStatus: 'activo',
      activeCases: 5,
      completedCases: 15,
      averageGrade: 8.8,
      lastActivity: '2024-01-15T11:20:00Z'
    },
    {
      id: 5,
      name: 'Laura Vargas',
      email: 'laura.vargas@universidad.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      course: 'Odontología Integral II',
      level: 'intermedio',
      permissionStatus: 'activo',
      activeCases: 2,
      completedCases: 10,
      averageGrade: 8.0,
      lastActivity: '2024-01-15T08:30:00Z'
    }
  ];
}

// Computed properties para estadísticas
const studentsWithPermissions = computed(() =>
  students.value.filter(s => s.permissionStatus === 'activo').length
);

const studentsWithoutPermissions = computed(() =>
  students.value.filter(s => s.permissionStatus === 'revocado').length
);

const activeCases = computed(() =>
  students.value.reduce((total, student) => total + student.activeCases, 0)
);

const pendingReviews = computed(() =>
  students.value.filter(s => s.permissionStatus === 'pendiente').length
);

// Computed property para cursos únicos
const courses = computed(() =>
  Array.from(new Set(students.value.map(s => s.course)))
);

// Computed property para estudiantes filtrados
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesCourse = !selectedCourse.value || student.course === selectedCourse.value;
    const matchesPermission = !selectedPermissionStatus.value || student.permissionStatus === selectedPermissionStatus.value;
    const matchesLevel = !selectedLevel.value || student.level === selectedLevel.value;
    const matchesSearch = !searchTerm.value || 
      student.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    return matchesCourse && matchesPermission && matchesLevel && matchesSearch;
  });
});

// Funciones utilitarias
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getLevelBadgeClass(level: string): string {
  switch (level) {
    case 'basico':
      return 'bg-info';
    case 'intermedio':
      return 'bg-warning text-dark';
    case 'avanzado':
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
}

function getPermissionBadgeClass(status: string): string {
  switch (status) {
    case 'activo':
      return 'bg-success';
    case 'revocado':
      return 'bg-danger';
    case 'pendiente':
      return 'bg-warning text-dark';
    default:
      return 'bg-secondary';
  }
}

function getPermissionStatusText(status: string): string {
  switch (status) {
    case 'activo':
      return 'Permisos Activos';
    case 'revocado':
      return 'Permisos Revocados';
    case 'pendiente':
      return 'Pendiente Aprobación';
    default:
      return 'Estado Desconocido';
  }
}

// Funciones de interacción
function viewStudentDetails(studentId: number) {
  selectedStudent.value = students.value.find(s => s.id === studentId) || null;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('studentDetailsModal'));
  modal.show();
}

function revokePermissions(studentId: number) {
  studentToRevoke.value = studentId;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('revokeModal'));
  modal.show();
}

function confirmRevokePermissions() {
  if (studentToRevoke.value) {
    const student = students.value.find(s => s.id === studentToRevoke.value);
    if (student) {
      student.permissionStatus = 'revocado';
      student.activeCases = 0; // Al revocar permisos, se suspenden casos activos
      console.log(`Permisos revocados para ${student.name}`);
    }
    studentToRevoke.value = null;
  }
}

function grantPermissions(studentId: number) {
  const student = students.value.find(s => s.id === studentId);
  if (student) {
    student.permissionStatus = 'activo';
    console.log(`Permisos otorgados para ${student.name}`);
  }
}

function viewClinicalHistory(studentId: number) {
  console.log(`Ver historia clínica para estudiante ${studentId}`);
  // Aquí se implementaría la lógica para mostrar la historia clínica
}
</script>

<style scoped>
.student-progress {
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

.alert {
  border: none;
  border-radius: 0.5rem;
}

.text-primary {
  color: #7b2cbf !important;
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
</style>
