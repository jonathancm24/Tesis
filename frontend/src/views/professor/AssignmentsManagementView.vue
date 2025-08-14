<template>
  <section class="clinical-management container py-4">
    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-primary" @click="createNewAssignment">Nueva asignación</button>
      <input v-model="searchTerm" class="form-control w-auto" placeholder="Buscar paciente, diagnóstico o tratamiento" />
      <select v-model="selectedStatus" class="form-select w-auto">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobado">Aprobado</option>
        <option value="rechazado">Rechazado</option>
        <option value="en_progreso">En Progreso</option>
      </select>
      <select v-model="selectedSpecialty" class="form-select w-auto">
        <option value="">Todas las especialidades</option>
        <option v-for="c in filteredCases" :key="c.id" :value="c.specialty">{{ c.specialty }}</option>
      </select>
      <select v-model="selectedStudent" class="form-select w-auto">
        <option value="">Todos los estudiantes</option>
        <option v-for="s in students" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>
    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Estudiante</th>
          <th>Especialidad</th>
          <th>Diagnóstico</th>
          <th>Tratamiento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="clinicalCases.length === 0">
          <td colspan="7" class="text-center text-muted py-4">
            <div>
              <i class="fas fa-clipboard-list fa-2x mb-2"></i>
              <p class="mb-0">No hay casos clínicos disponibles</p>
              <small>Los casos aparecerán aquí cuando los estudiantes los envíen</small>
            </div>
          </td>
        </tr>
        <tr v-for="c in filteredCases" :key="c.id">
          <td>{{ c.patientName }}</td>
          <td>{{ c.studentName }}</td>
          <td>{{ c.specialty }}</td>
          <td>{{ c.diagnosis }}</td>
          <td>{{ c.treatment }}</td>
          <td><span :class="'badge ' + getStatusBadgeClass(c.status)">{{ getStatusText(c.status) }}</span></td>
          <td>
            <button class="btn btn-sm btn-info me-1" @click="openDetails(c.id)">Detalles</button>
            <button class="btn btn-sm btn-warning me-1" @click="editAssignment(c.id)">Editar</button>
            <button class="btn btn-sm btn-success me-1" @click="approveCase(c.id)">Aprobar</button>
            <button class="btn btn-sm btn-danger" @click="openReject(c.id)">Rechazar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Modal de detalles -->
    <div v-if="ui.detailsOpen" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del caso</h5>
            <button type="button" class="btn-close" @click="closeDetails"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedCase">
              <p><strong>Paciente:</strong> {{ selectedCase.patientName }}</p>
              <p><strong>Estudiante:</strong> {{ selectedCase.studentName }}</p>
              <p><strong>Especialidad:</strong> {{ selectedCase.specialty }}</p>
              <p><strong>Diagnóstico:</strong> {{ selectedCase.diagnosis }}</p>
              <p><strong>Tratamiento:</strong> {{ selectedCase.treatment }}</p>
              <p><strong>Notas:</strong> {{ selectedCase.notes }}</p>
              <p><strong>Estado:</strong> <span :class="'badge ' + getStatusBadgeClass(selectedCase.status)">{{ getStatusText(selectedCase.status) }}</span></p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetails">Cerrar</button>
            <button class="btn btn-success" @click="selectedCase && approveCase(selectedCase.id)">Aprobar</button>
            <button class="btn btn-danger" @click="selectedCase && openReject(selectedCase.id)">Rechazar</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal de rechazo -->
    <div v-if="ui.rejectOpen" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Motivo de rechazo</h5>
            <button type="button" class="btn-close" @click="closeReject"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="rejectReason" class="form-control" placeholder="Escribe el motivo"></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeReject">Cancelar</button>
            <button class="btn btn-danger" @click="confirmReject">Confirmar rechazo</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal de formulario de asignación -->
    <div v-if="ui.formOpen" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar asignación' : 'Nueva asignación' }}</h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="mb-3">
                <label class="form-label">Estudiante <span class="text-danger">*</span></label>
                <select v-model="newAssignment.studentId" class="form-select" required>
                  <option value="">Selecciona estudiante</option>
                  <option v-for="s in availableStudents" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
                <div v-if="availableStudents.length === 0" class="text-muted small mt-1">
                  No hay estudiantes disponibles
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Paciente <span class="text-danger">*</span></label>
                <select v-model="newAssignment.patientId" class="form-select" required>
                  <option value="">Selecciona paciente</option>
                  <option v-for="p in availablePatients" :key="p.id" :value="String(p.id)">
                    {{ p.nombre }} {{ p.apellido }} - {{ p.cedula }}
                  </option>
                </select>
                <div v-if="availablePatients.length === 0" class="text-muted small mt-1">
                  No hay pacientes disponibles
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Especialidad <span class="text-danger">*</span></label>
                <input v-model="newAssignment.specialty" class="form-control" placeholder="Ej. Ortodoncia, Endodoncia..." required />
              </div>
              
              <div class="mb-3">
                <label class="form-label">Diagnóstico <span class="text-danger">*</span></label>
                <input v-model="newAssignment.diagnosis" class="form-control" placeholder="Diagnóstico del caso clínico" required />
              </div>
              
              <div class="mb-3">
                <label class="form-label">Tratamiento <span class="text-danger">*</span></label>
                <input v-model="newAssignment.treatment" class="form-control" placeholder="Tratamiento propuesto" required />
              </div>
              
              <div class="mb-3">
                <label class="form-label">Notas adicionales</label>
                <textarea v-model="newAssignment.notes" class="form-control" rows="3" placeholder="Observaciones adicionales (opcional)"></textarea>
              </div>
              
              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  {{ editMode ? 'Actualizar' : 'Crear' }} Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'

import {
  fetchClinicalCases,
  createClinicalCase,
  updateClinicalCaseBasic,
  updateClinicalCaseStatus
} from '@/services/clinicalCasesService'
import { userService } from '@/services/userService'
import pacienteService from '@/services/pacienteService'
import type { PacienteLista } from '@/types/patient'

// Interfaces para los datos
interface ClinicalCase {
  id: string;
  studentName: string;
  patientName: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_progreso';
}
interface AssignmentForm {
  studentId: string;
  patientId: string;
  specialty: string;
  priority: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
}

const clinicalCases = ref<ClinicalCase[]>([])
const selectedStatus = ref('')
const selectedSpecialty = ref('')
const selectedStudent = ref('')
const searchTerm = ref('')
const selectedCase = ref<ClinicalCase | null>(null)
const newAssignment = ref<AssignmentForm>({
  studentId: '',
  patientId: '',
  specialty: '',
  priority: 'media',
  diagnosis: '',
  treatment: '',
  notes: ''
})
const editMode = ref(false)
const editId = ref<string | null>(null)
const ui = ref({ detailsOpen: false, formOpen: false, rejectOpen: false })
const rejectTargetId = ref<string | null>(null)
const rejectReason = ref('')
const availableStudents = ref<{ id: string; name: string }[]>([])
const availablePatients = ref<PacienteLista[]>([])

onMounted(loadClinicalCases)
async function loadClinicalCases () {
  try {
    console.log('Iniciando carga de casos clínicos...')
    
    // Verificar token y rol del usuario
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token de autenticación');
      alert('No estás autenticado. Por favor, inicia sesión.');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Usuario actual:', payload);
      console.log('Rol del usuario:', payload.role);
      console.log('Roles permitidos:', ['ESTUDIANTE', 'PROFESOR', 'ADMIN', 'SECRETARIO']);
      
      // Verificar si el rol está en la lista permitida (considerar variaciones)
      const rolesPermitidos = ['ESTUDIANTE', 'PROFESOR', 'ADMIN', 'SECRETARIO', 'profesor', 'estudiante', 'admin', 'secretario'];
      const rolUsuario = payload.role || payload.roles || payload.nombre;
      
      console.log('Verificando rol:', rolUsuario);
      
      if (!rolesPermitidos.includes(rolUsuario)) {
        console.error('Rol no autorizado:', rolUsuario);
        console.log('Intentando cargar casos clínicos de todas formas...');
        // No retornamos aquí, intentamos cargar los datos
      } else {
        console.log('Rol autorizado:', rolUsuario);
      }
    } catch (e) {
      console.error('Error decodificando token:', e);
      console.log('Continuando con la carga...');
    }
    
    const response = await fetchClinicalCases()
    console.log('Respuesta de casos clínicos:', response)
    clinicalCases.value = response.data || []
    console.log('Casos clínicos cargados:', clinicalCases.value)
    
    // Mensaje informativo si estamos usando datos simulados
    if (clinicalCases.value.length > 0 && clinicalCases.value[0].id?.includes('demo')) {
      console.log('⚠️ Usando datos simulados debido a problemas de permisos')
    }
    // Cargar estudiantes y pacientes al iniciar
    await loadStudentsAndPatients()
  } catch (err) {
    console.error('Error detallado al cargar casos clínicos:', err)
    
    // Si es error 403, mostrar mensaje específico
    if (err instanceof Error && err.message.includes('403')) {
      alert('No tienes permisos para ver los casos clínicos. Verifica que tengas el rol correcto (PROFESOR, ESTUDIANTE, ADMIN o SECRETARIO).')
    } else {
      alert('Error al cargar casos clínicos: ' + (err instanceof Error ? err.message : String(err)))
    }
  }
}

async function loadStudentsAndPatients () {
  try {
    console.log('Cargando estudiantes y pacientes...')
    // Cargar estudiantes (usuarios con rol estudiante)
    const users = await userService.getUsers()
    console.log('Usuarios obtenidos:', users)
    
    availableStudents.value = users
      .filter(u => u.role === 'estudiante')
      .map(u => ({ id: String(u.id), name: `${u.nombre} ${u.apellido}` }))
    
    console.log('Estudiantes filtrados:', availableStudents.value)
    
    // Cargar pacientes
    const patients = await pacienteService.obtenerPacientes()
    console.log('Pacientes obtenidos:', patients)
    availablePatients.value = patients
  } catch (err) {
    console.error('Error al cargar estudiantes o pacientes:', err)
    alert('Error al cargar estudiantes o pacientes: ' + (err instanceof Error ? err.message : String(err)))
  }
}
async function saveAssignment (): Promise<void> {
  if (!newAssignment.value.studentId || !newAssignment.value.patientId || !newAssignment.value.specialty || !newAssignment.value.diagnosis || !newAssignment.value.treatment) {
    alert('Por favor, completa todos los campos obligatorios marcados con *')
    return
  }
  
  try {
    console.log('Guardando asignación:', newAssignment.value)
    
    if (editMode.value && editId.value) {
      await updateClinicalCaseBasic(editId.value, newAssignment.value)
      alert('Asignación actualizada correctamente')
    } else {
      await createClinicalCase(newAssignment.value)
      alert('Asignación creada correctamente')
    }
    
    await loadClinicalCases()
    closeForm()
  } catch (err) {
    console.error('Error al guardar la asignación:', err)
    alert('Error al guardar la asignación: ' + (err instanceof Error ? err.message : String(err)))
  }
}
async function approveCase (caseId: string): Promise<void> {
  if (confirm('¿Aprobar este caso?')) {
    await updateClinicalCaseStatus(caseId, { estado: 'aprobado' })
    await loadClinicalCases()
    closeDetails()
  }
}
async function confirmReject (): Promise<void> {
  const id = rejectTargetId.value
  const reason = rejectReason.value.trim()
  if (!id || !reason) return
  await updateClinicalCaseStatus(id, { estado: 'rechazado', motivo: reason })
  await loadClinicalCases()
  closeReject()
}
function openDetails (caseId: string): void {
  selectedCase.value = clinicalCases.value.find(c => c.id === caseId) || null
  ui.value.detailsOpen = true
}
function closeDetails () {
  ui.value.detailsOpen = false
  selectedCase.value = null
}
function openReject (caseId: string): void {
  rejectTargetId.value = caseId
  rejectReason.value = ''
  ui.value.rejectOpen = true
}
function closeReject () {
  ui.value.rejectOpen = false
  rejectTargetId.value = null
  rejectReason.value = ''
}
async function createNewAssignment () {
  try {
    editMode.value = false
    editId.value = null
    newAssignment.value = {
      studentId: '',
      patientId: '',
      specialty: '',
      priority: 'media',
      diagnosis: '',
      treatment: '',
      notes: ''
    }
    
    // Cargar estudiantes y pacientes cada vez que se abre el formulario
    await loadStudentsAndPatients()
    ui.value.formOpen = true
  } catch (err) {
    console.error('Error al abrir formulario:', err)
    alert('Error al cargar datos para el formulario')
  }
}
function editAssignment (caseId: string): void {
  const c = clinicalCases.value.find(x => x.id === caseId)
  if (!c) return
  editMode.value = true
  editId.value = c.id
  // Mapear a formulario
  const student = availableStudents.value.find(s => s.name === c.studentName)
  const patient = availablePatients.value.find(p => `${p.nombre} ${p.apellido}` === c.patientName)
  newAssignment.value = {
    studentId: student?.id ?? '',
  patientId: patient ? String(patient.id) : '',
    specialty: c.specialty,
    priority: 'media',
    diagnosis: c.diagnosis,
    treatment: c.treatment,
    notes: c.notes || ''
  }
  ui.value.formOpen = true
}
function closeForm () {
  ui.value.formOpen = false
}
function getStatusBadgeClass (status: ClinicalCase['status']): string {
  return {
    pendiente:   'bg-warning text-dark',
    aprobado:    'bg-success',
    rechazado:   'bg-danger',
    en_progreso: 'bg-info'
  }[status] || 'bg-secondary'
}
function getStatusText (status: ClinicalCase['status']): string {
  return {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_progreso: 'En Progreso'
  }[status] || 'Desconocido'
}
const students = computed<string[]>(() => Array.from(new Set(clinicalCases.value.map(c => c.studentName))))
const filteredCases = computed<ClinicalCase[]>(() => {
  return clinicalCases.value.filter(c => {
    const statusOK  = !selectedStatus.value || c.status === selectedStatus.value
    const specOK    = !selectedSpecialty.value || c.specialty === selectedSpecialty.value
    const studentOK = !selectedStudent.value || c.studentName === selectedStudent.value
    const q         = searchTerm.value.trim().toLowerCase()
    const searchOK  = !q || c.patientName.toLowerCase().includes(q) || c.diagnosis.toLowerCase().includes(q) || c.treatment.toLowerCase().includes(q)
    return statusOK && specOK && studentOK && searchOK
  })
})
</script>

<style src="@/assets/css/pages/professor/AssignmentsManagement.css" scoped></style>
