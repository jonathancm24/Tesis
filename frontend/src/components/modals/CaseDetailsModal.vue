<template>
  <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header clinical-header">
          <div class="header-info">
            <h5 class="modal-title">
              <i class="fas fa-file-medical me-2"></i>
              Detalles del Caso Clínico
            </h5>
            <p class="mb-0 opacity-75" v-if="caseData">
              {{ caseData.codigo || `Caso #${caseData.id}` }}
            </p>
          </div>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body" v-if="loading">
          <div class="loading-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando detalles del caso...</span>
            </div>
            <p class="mt-3 mb-0">Cargando información del caso clínico...</p>
          </div>
        </div>

        <div class="modal-body case-details" v-else-if="caseData">
          <!-- Información del paciente y estado -->
          <div class="row mb-4">
            <div class="col-md-8">
              <div class="patient-info clinical-card">
                <h6 class="section-title">
                  <i class="fas fa-user me-2"></i>
                  Información del Paciente
                </h6>
                <div class="patient-details">
                  <div class="patient-header">
                    <div class="patient-avatar">
                      <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="patient-main-info">
                      <h4 class="patient-name">
                        {{ getPatientName() }}
                      </h4>
                      <p class="patient-id" v-if="caseData.paciente?.cedula || caseData.paciente?.numeroDocumento">
                        <i class="fas fa-id-card me-2"></i>
                        <strong>Cédula:</strong> {{ caseData.paciente.cedula || caseData.paciente.numeroDocumento }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="patient-info-grid">
                    <div class="info-card age-card" v-if="caseData.paciente?.fechaNacimiento">
                      <div class="info-icon">
                        <i class="fas fa-birthday-cake"></i>
                      </div>
                      <div class="info-content">
                        <span class="info-label">Edad</span>
                        <span class="info-value">{{ calculateAge(caseData.paciente.fechaNacimiento) }} años</span>
                      </div>
                    </div>

                    <div class="info-card contact-card" v-if="caseData.paciente?.telefono">
                      <div class="info-icon">
                        <i class="fas fa-phone"></i>
                      </div>
                      <div class="info-content">
                        <span class="info-label">Teléfono</span>
                        <span class="info-value">{{ caseData.paciente.telefono }}</span>
                      </div>
                    </div>

                    <div class="info-card email-card" v-if="caseData.paciente?.email">
                      <div class="info-icon">
                        <i class="fas fa-envelope"></i>
                      </div>
                      <div class="info-content">
                        <span class="info-label">Email</span>
                        <span class="info-value">{{ caseData.paciente.email }}</span>
                      </div>
                    </div>

                    <div class="info-card student-card" v-if="caseData.estudiante">
                      <div class="info-icon">
                        <i class="fas fa-user-graduate"></i>
                      </div>
                      <div class="info-content">
                        <span class="info-label">Estudiante</span>
                        <span class="info-value">{{ getStudentName() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="case-status clinical-card">
                <h6 class="section-title">
                  <i class="fas fa-flag me-2"></i>
                  Estado del Caso
                </h6>
                <div class="status-content">
                  <span class="status-badge large" :class="getStatusClass(caseData.estado)">
                    {{ getStatusLabel(caseData.estado) }}
                  </span>
                  <p class="case-date">
                    <i class="far fa-calendar-alt me-1"></i>
                    Creado: {{ formatDate(caseData.fechaCreacion) }}
                  </p>
                  <p class="case-date" v-if="caseData.fechaActualizacion">
                    <i class="far fa-clock me-1"></i>
                    Actualizado: {{ formatDate(caseData.fechaActualizacion) }}
                  </p>
                  <p class="case-date" v-if="caseData.calificacion">
                    <i class="fas fa-star me-1"></i>
                    Calificación: {{ caseData.calificacion }}
                  </p>
                  <p class="case-date" v-else>
                    <i class="fas fa-star-o me-1"></i>
                    Sin calificación
                  </p>
                  <div class="case-ids">
                    <small class="text-muted">
                      <i class="fas fa-hashtag me-1"></i>
                      ID: {{ caseData.id }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información clínica -->
          <div class="clinical-info mb-4">
            <div class="clinical-card">
              <h6 class="section-title">
                <i class="fas fa-stethoscope me-2"></i>
                Información Clínica
              </h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="info-field">
                    <label class="field-label">Motivo de Consulta</label>
                    <p class="field-value">{{ caseData.motivoConsulta || 'No especificado' }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-field">
                    <label class="field-label">Especialidad</label>
                    <p class="field-value">{{ getSpecialtyName() }}</p>
                  </div>
                </div>
                <div class="col-12">
                  <div class="info-field">
                    <label class="field-label">Enfermedad Actual</label>
                    <p class="field-value">{{ caseData.enfermedadActual || caseData.diagnostico || 'Sin información registrada' }}</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.peso">
                  <div class="info-field">
                    <label class="field-label">Peso</label>
                    <p class="field-value">{{ caseData.peso }} kg</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.talla">
                  <div class="info-field">
                    <label class="field-label">Talla</label>
                    <p class="field-value">{{ caseData.talla }} m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Examen físico -->
          <div class="physical-exam mb-4">
            <div class="clinical-card">
              <h6 class="section-title">
                <i class="fas fa-user-md me-2"></i>
                Examen Físico
              </h6>
              <div class="row g-3">
                <div class="col-md-6" v-if="caseData.facies">
                  <div class="info-field">
                    <label class="field-label">Facies</label>
                    <p class="field-value">{{ caseData.facies }}</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.marcha">
                  <div class="info-field">
                    <label class="field-label">Marcha</label>
                    <p class="field-value">{{ caseData.marcha }}</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.craneo">
                  <div class="info-field">
                    <label class="field-label">Cráneo</label>
                    <p class="field-value">{{ caseData.craneo }}</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.CarayCuello">
                  <div class="info-field">
                    <label class="field-label">Cara y Cuello</label>
                    <p class="field-value">{{ caseData.CarayCuello }}</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.PielyMucosa">
                  <div class="info-field">
                    <label class="field-label">Piel y Mucosa</label>
                    <p class="field-value">{{ caseData.PielyMucosa }}</p>
                  </div>
                </div>
                <div class="col-md-6" v-if="caseData.ATM">
                  <div class="info-field">
                    <label class="field-label">ATM</label>
                    <p class="field-value">{{ caseData.ATM }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Registros clínicos -->
          <div class="clinical-records mb-4">
            <div class="row g-3">
              <!-- Odontograma -->
              <div class="col-md-6">
                <div class="record-card clinical-card">
                  <div class="record-header">
                    <h6 class="section-title">
                      <i class="fas fa-tooth me-2"></i>
                      Odontograma
                    </h6>
                    <div class="record-actions">
                      <button 
                        v-if="odontogramData"
                        class="btn btn-sm btn-outline-primary"
                        @click="viewOdontogram"
                      >
                        <i class="fas fa-eye me-1"></i>
                        Ver
                      </button>
                      <button 
                        v-if="canEdit"
                        class="btn btn-sm btn-outline-success"
                        @click="editOdontogram"
                      >
                        <i class="fas fa-edit me-1"></i>
                        {{ odontogramData ? 'Editar' : 'Crear' }}
                      </button>
                    </div>
                  </div>
                  <div class="record-content">
                    <div v-if="odontogramData" class="record-summary">
                      <p class="mb-1">
                        <strong>Piezas registradas:</strong> {{ odontogramData.piezasAfectadas || 'Ninguna' }}
                      </p>
                      <p class="mb-1">
                        <strong>Total de dientes:</strong> {{ odontogramData.totalPiezas || 0 }}
                      </p>
                      <p class="mb-1">
                        <strong>Última actualización:</strong> {{ formatDate(odontogramData.fechaActualizacion) }}
                      </p>
                      <span class="badge bg-success">{{ odontogramData.totalPiezas }} registro(s)</span>
                    </div>
                    <div v-else class="empty-record">
                      <i class="fas fa-plus-circle text-muted fa-2x mb-2"></i>
                      <p class="text-muted mb-0">No hay odontograma registrado</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mucosa Oral -->
              <div class="col-md-6">
                <div class="record-card clinical-card">
                  <div class="record-header">
                    <h6 class="section-title">
                      <i class="fas fa-microscope me-2"></i>
                      Topografía de Mucosa Oral
                    </h6>
                    <div class="record-actions">
                      <button 
                        v-if="mucosaData"
                        class="btn btn-sm btn-outline-primary"
                        @click="viewMucosa"
                      >
                        <i class="fas fa-eye me-1"></i>
                        Ver
                      </button>
                      <button 
                        v-if="canEdit"
                        class="btn btn-sm btn-outline-success"
                        @click="editMucosa"
                      >
                        <i class="fas fa-edit me-1"></i>
                        {{ mucosaData ? 'Editar' : 'Crear' }}
                      </button>
                    </div>
                  </div>
                  <div class="record-content">
                    <div v-if="mucosaData" class="record-summary">
                      <p class="mb-1">
                        <strong>Hallazgos superiores:</strong> {{ mucosaData.zonasSuperior || 0 }}
                      </p>
                      <p class="mb-1">
                        <strong>Hallazgos inferiores:</strong> {{ mucosaData.zonasInferior || 0 }}
                      </p>
                      <p class="mb-1">
                        <strong>Total de hallazgos:</strong> {{ mucosaData.totalHallazgos || 0 }}
                      </p>
                      <p class="mb-1">
                        <strong>Última actualización:</strong> {{ formatDate(mucosaData.fechaActualizacion) }}
                      </p>
                      <span class="badge bg-success">{{ mucosaData.totalHallazgos }} hallazgo(s)</span>
                    </div>
                    <div v-else class="empty-record">
                      <i class="fas fa-plus-circle text-muted fa-2x mb-2"></i>
                      <p class="text-muted mb-0">No hay topografía registrada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detalle del Odontograma -->
          <div v-if="showOdontogramDetail && odontogramData" class="odontogram-detail mb-4">
            <div class="clinical-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="section-title mb-0">
                  <i class="fas fa-tooth me-2"></i>
                  Detalle del Odontograma
                </h6>
                <button class="btn btn-sm btn-outline-secondary" @click="showOdontogramDetail = false">
                  <i class="fas fa-times me-1"></i>
                  Cerrar
                </button>
              </div>
              
              <div class="odontogram-grid">
                <div class="row g-3">
                  <div v-for="odontograma in odontogramData.odontogramas" :key="odontograma.id" class="col-md-6 col-lg-4">
                    <div class="odontogram-card">
                      <div class="card-header bg-light">
                        <h6 class="mb-0">
                          <i class="fas fa-tooth me-1"></i>
                          Pieza {{ odontograma.diente }}
                        </h6>
                      </div>
                      <div class="card-body">
                        <div class="condition-info mb-2">
                          <strong>Condiciones:</strong>
                          <div class="conditions-list mt-1">
                            <template v-if="odontograma.condicion && typeof odontograma.condicion === 'object'">
                              <span 
                                v-for="(superficie, key) in odontograma.condicion" 
                                :key="key"
                                class="badge me-1 mb-1"
                                :class="getConditionBadgeClass(superficie)"
                              >
                                {{ key }}: {{ superficie }}
                              </span>
                            </template>
                            <span v-else class="text-muted">Sin condiciones específicas</span>
                          </div>
                        </div>
                        
                        <div v-if="odontograma.conclusion" class="conclusion-info">
                          <strong>Conclusión:</strong>
                          <p class="mb-0 text-muted small">{{ odontograma.conclusion }}</p>
                        </div>
                        
                        <div class="date-info mt-2">
                          <small class="text-muted">
                            <i class="far fa-calendar me-1"></i>
                            {{ formatDate(odontograma.fechaCreacion) }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="!odontogramData.odontogramas || odontogramData.odontogramas.length === 0" class="text-center py-4">
                <i class="fas fa-tooth text-muted fa-3x mb-2"></i>
                <p class="text-muted">No hay datos de odontograma disponibles</p>
              </div>
            </div>
          </div>

          <!-- Detalle de la Topografía de Mucosa -->
          <div v-if="showMucosaDetail && mucosaData" class="mucosa-detail mb-4">
            <div class="clinical-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="section-title mb-0">
                  <i class="fas fa-microscope me-2"></i>
                  Detalle de Topografía de Mucosa Oral
                </h6>
                <button class="btn btn-sm btn-outline-secondary" @click="showMucosaDetail = false">
                  <i class="fas fa-times me-1"></i>
                  Cerrar
                </button>
              </div>
              
              <div class="mucosa-sections">
                <!-- Mucosa Superior -->
                <div class="mucosa-section mb-4">
                  <h6 class="text-primary mb-3">
                    <i class="fas fa-arrow-up me-1"></i>
                    Mucosa Superior
                  </h6>
                  <div class="row g-3">
                    <div 
                      v-for="hallazgo in hallazgosSuperior" 
                      :key="hallazgo.id" 
                      class="col-md-6 col-lg-4"
                    >
                      <div class="hallazgo-card">
                        <div class="card-header bg-light">
                          <h6 class="mb-0">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            Zona {{ hallazgo.codigoZona }}
                          </h6>
                        </div>
                        <div class="card-body">
                          <div class="type-info mb-2">
                            <strong>Tipo:</strong>
                            <span class="badge bg-secondary ms-1">{{ hallazgo.tipo }}</span>
                          </div>
                          
                          <div v-if="hallazgo.descripcion" class="description-info">
                            <strong>Descripción:</strong>
                            <p class="mb-0 text-muted small">{{ hallazgo.descripcion }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div 
                    v-if="hallazgosSuperior.length === 0"
                    class="text-center py-3 text-muted"
                  >
                    <i class="fas fa-info-circle me-1"></i>
                    No hay hallazgos en mucosa superior
                  </div>
                </div>

                <!-- Mucosa Inferior -->
                <div class="mucosa-section">
                  <h6 class="text-success mb-3">
                    <i class="fas fa-arrow-down me-1"></i>
                    Mucosa Inferior
                  </h6>
                  <div class="row g-3">
                    <div 
                      v-for="hallazgo in hallazgosInferior" 
                      :key="hallazgo.id" 
                      class="col-md-6 col-lg-4"
                    >
                      <div class="hallazgo-card">
                        <div class="card-header bg-light">
                          <h6 class="mb-0">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            Zona {{ hallazgo.codigoZona }}
                          </h6>
                        </div>
                        <div class="card-body">
                          <div class="type-info mb-2">
                            <strong>Tipo:</strong>
                            <span class="badge bg-secondary ms-1">{{ hallazgo.tipo }}</span>
                          </div>
                          
                          <div v-if="hallazgo.descripcion" class="description-info">
                            <strong>Descripción:</strong>
                            <p class="mb-0 text-muted small">{{ hallazgo.descripcion }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div 
                    v-if="hallazgosInferior.length === 0"
                    class="text-center py-3 text-muted"
                  >
                    <i class="fas fa-info-circle me-1"></i>
                    No hay hallazgos en mucosa inferior
                  </div>
                </div>
              </div>
              
              <div v-if="!mucosaData.hallazgos || mucosaData.hallazgos.length === 0" class="text-center py-4">
                <i class="fas fa-microscope text-muted fa-3x mb-2"></i>
                <p class="text-muted">No hay datos de topografía de mucosa disponibles</p>
              </div>
            </div>
          </div>

          <!-- Archivos adjuntos -->
          <div class="attached-files mb-4">
            <div class="clinical-card">
              <div class="files-header">
                <h6 class="section-title">
                  <i class="fas fa-paperclip me-2"></i>
                  Archivos Adjuntos
                  <span class="badge bg-secondary ms-2">{{ files.length }}</span>
                </h6>
                <button 
                  v-if="canEdit"
                  class="btn btn-sm btn-outline-primary"
                  @click="manageFiles"
                >
                  <i class="fas fa-upload me-1"></i>
                  Gestionar archivos
                </button>
              </div>
              
              <div v-if="files.length === 0" class="empty-files">
                <i class="fas fa-folder-open text-muted fa-2x mb-2"></i>
                <p class="text-muted mb-0">No hay archivos adjuntos</p>
              </div>
              
              <div v-else class="files-grid">
                <div 
                  v-for="file in files" 
                  :key="file.id"
                  class="file-item"
                >
                  <div class="file-icon">
                    <i :class="getFileIcon(file.tipoArchivo)"></i>
                  </div>
                  <div class="file-info">
                    <h6 class="file-name">{{ file.nombreOriginal }}</h6>
                    <p class="file-meta">
                      {{ file.categoria }} • {{ formatFileSize(file.tamano) }}
                    </p>
                    <p class="file-date">{{ formatDate(file.fechaSubida) }}</p>
                  </div>
                  <div class="file-actions">
                    <button class="btn btn-sm btn-outline-primary" @click="downloadFile(file.id)">
                      <i class="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comentarios y evaluaciones -->
          <div class="comments-section" v-if="comments.length > 0">
            <div class="clinical-card">
              <h6 class="section-title">
                <i class="fas fa-comments me-2"></i>
                Comentarios y Evaluaciones
              </h6>
              <div class="comments-list">
                <div 
                  v-for="comment in comments" 
                  :key="comment.id"
                  class="comment-item"
                >
                  <div class="comment-header">
                    <div class="comment-author">
                      <strong>{{ comment.autor.nombres }} {{ comment.autor.apellidos }}</strong>
                      <span class="author-role">({{ comment.autor.rol }})</span>
                    </div>
                    <span class="comment-date">{{ formatDate(comment.fechaCreacion) }}</span>
                  </div>
                  <div class="comment-content">
                    {{ comment.comentario }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cerrar
          </button>
          <button 
            v-if="canEdit"
            type="button" 
            class="btn btn-primary"
            @click="editCase"
          >
            <i class="fas fa-edit me-1"></i>
            Editar Caso
          </button>
          <button 
            type="button" 
            class="btn btn-outline-primary"
            @click="downloadReport"
          >
            <i class="fas fa-download me-1"></i>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import * as clinicalService from '@/services/clinicalCasesService'

// Props y emits
interface Props {
  show: boolean
  caseId: number | string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  'case-updated': []
}>()

// Estado del componente
const authStore = useAuthStore()
const loading = ref(false)
const caseData = ref<any>(null)
const odontogramData = ref<any>(null)
const mucosaData = ref<any>(null)
const files = ref<any[]>([])
const comments = ref<any[]>([])

// Estado para vistas expandidas
const showOdontogramDetail = ref(false)
const showMucosaDetail = ref(false)

// Computed properties
const canEdit = computed(() => {
  if (!caseData.value) return false
  
  // Los estudiantes pueden editar sus casos en ciertos estados
  if (authStore.user?.role === 'estudiante') {
    return caseData.value.estudianteId === authStore.user.id &&
           ['EN_REVISION', 'PENDIENTE_ESTUDIOS'].includes(caseData.value.estado)
  }
  
  // Los profesores y administradores pueden editar siempre
  return ['profesor', 'admin'].includes(authStore.user?.role || '')
})

// Computed properties para los hallazgos de mucosa
const hallazgosSuperior = computed(() => {
  if (!mucosaData.value?.hallazgos) return []
  return mucosaData.value.hallazgos.filter((h: any) => h.codigoZona && h.codigoZona.startsWith('M-S'))
})

const hallazgosInferior = computed(() => {
  if (!mucosaData.value?.hallazgos) return []
  return mucosaData.value.hallazgos.filter((h: any) => h.codigoZona && h.codigoZona.startsWith('M-I'))
})

// Métodos
const closeModal = () => {
  emit('update:show', false)
  resetData()
}

const resetData = () => {
  caseData.value = null
  odontogramData.value = null
  mucosaData.value = null
  files.value = []
  comments.value = []
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  }
}

const loadCaseDetails = async () => {
  if (!props.caseId) return

  try {
    loading.value = true

    console.log('Cargando detalles del caso:', props.caseId)

    // Cargar datos del caso completo usando la ruta específica del backend
    const caseResponse = await clinicalService.fetchClinicalCaseById(props.caseId)
    console.log('Datos del caso recibidos:', caseResponse)
    
    caseData.value = caseResponse

    // Si los datos del paciente, profesor o especialidad no están poblados, cargarlos por separado
    const promises = []
    
    // Cargar información del paciente si solo tenemos el ID
    if (caseResponse.pacienteId && !caseResponse.paciente) {
      console.log('Cargando información del paciente ID:', caseResponse.pacienteId)
      promises.push(
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pacientes/${caseResponse.pacienteId}`, {
          headers: getAuthHeaders()
        }).then(res => res.ok ? res.json() : null)
      )
    } else {
      promises.push(Promise.resolve(null))
    }

    // Cargar información de la especialidad si solo tenemos el ID
    if (caseResponse.especialidadId && !caseResponse.especialidad) {
      console.log('Cargando información de la especialidad ID:', caseResponse.especialidadId)
      promises.push(
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/especialidades/${caseResponse.especialidadId}`, {
          headers: getAuthHeaders()
        }).then(res => res.ok ? res.json() : null)
      )
    } else {
      promises.push(Promise.resolve(null))
    }

    // Cargar información del estudiante si solo tenemos el ID
    if (caseResponse.estudianteId && !caseResponse.estudiante) {
      console.log('Cargando información del estudiante ID:', caseResponse.estudianteId)
      promises.push(
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/usuarios/porId/${caseResponse.estudianteId}`, {
          headers: getAuthHeaders()
        }).then(res => res.ok ? res.json() : null)
      )
    } else {
      promises.push(Promise.resolve(null))
    }

    // Cargar información del profesor si solo tenemos el ID
    if (caseResponse.profesorId && !caseResponse.profesor) {
      console.log('Cargando información del profesor ID:', caseResponse.profesorId)
      promises.push(
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/usuarios/porId/${caseResponse.profesorId}`, {
          headers: getAuthHeaders()
        }).then(res => res.ok ? res.json() : null)
      )
    } else {
      promises.push(Promise.resolve(null))
    }

    // Cargar datos adicionales en paralelo (odontograma, mucosa, archivos, comentarios)
    promises.push(
      clinicalService.fetchClinicalCaseOdontogram(props.caseId).catch(() => null),
      clinicalService.fetchClinicalCaseMucosa(props.caseId).catch(() => null),
      clinicalService.fetchClinicalCaseFiles(props.caseId).catch(() => null),
      clinicalService.fetchClinicalCaseComments(props.caseId).catch(() => null)
    )

    const [pacienteData, especialidadData, estudianteData, profesorData, odontogramResponse, mucosaResponse, filesResponse, commentsResponse] = await Promise.all(promises)

    // Actualizar los datos del caso con la información cargada
    if (pacienteData) {
      console.log('Información del paciente cargada:', pacienteData)
      caseData.value.paciente = pacienteData
    }

    if (especialidadData) {
      console.log('Información de la especialidad cargada:', especialidadData)
      caseData.value.especialidad = especialidadData
    }

    if (estudianteData) {
      console.log('Información del estudiante cargada:', estudianteData)
      caseData.value.estudiante = estudianteData
    }

    if (profesorData) {
      console.log('Información del profesor cargada:', profesorData)
      caseData.value.profesor = profesorData
    }

    // Procesar respuestas adicionales
    if (odontogramResponse && Array.isArray(odontogramResponse) && odontogramResponse.length > 0) {
      odontogramData.value = {
        odontogramas: odontogramResponse,
        piezasAfectadas: odontogramResponse.map(o => o.diente).join(', '),
        fechaActualizacion: odontogramResponse[0].fechaCreacion,
        totalPiezas: odontogramResponse.length
      }
      console.log('Odontograma cargado:', odontogramData.value)
    } else {
      odontogramData.value = null
    }

    if (mucosaResponse && Array.isArray(mucosaResponse) && mucosaResponse.length > 0) {
      mucosaData.value = {
        hallazgos: mucosaResponse,
        zonasSuperior: mucosaResponse.filter(h => h.codigoZona && h.codigoZona.startsWith('M-S')).length,
        zonasInferior: mucosaResponse.filter(h => h.codigoZona && h.codigoZona.startsWith('M-I')).length,
        fechaActualizacion: mucosaResponse[0]?.casoClinico?.fechaCreacion || new Date().toISOString(),
        totalHallazgos: mucosaResponse.length
      }
      console.log('Mucosa cargada:', mucosaData.value)
    } else {
      mucosaData.value = null
    }

    if (filesResponse) {
      files.value = filesResponse.data || filesResponse || []
      console.log('Archivos cargados:', files.value)
    } else {
      files.value = []
    }

    if (commentsResponse) {
      comments.value = commentsResponse.data || commentsResponse || []
      console.log('Comentarios cargados:', comments.value)
    } else {
      comments.value = []
    }

  } catch (error) {
    console.error('Error loading case details:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    // Solo usar datos simulados si hay un error real del backend
    console.log('Usando datos simulados debido a error del backend')
    loadSimulatedData()
  } finally {
    loading.value = false
  }
}

const loadSimulatedData = () => {
  caseData.value = {
    id: props.caseId,
    codigo: 'CC-2025-001',
    paciente: {
      nombres: 'María Elena',
      apellidos: 'García López',
      cedula: '1234567890',
      fechaNacimiento: '1990-05-15',
      telefono: '0987654321'
    },
    estudiante: {
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Silva'
    },
    especialidad: 'Endodoncia',
    motivoConsulta: 'Dolor intenso en molar superior derecho',
    diagnostico: 'Pulpitis irreversible en pieza 16 con compromiso periapical',
    tratamiento: 'Tratamiento de conducto radicular y posterior restauración coronaria',
    observaciones: 'Paciente refiere dolor intenso al masticar. Se observa caries profunda.',
    estado: 'EN_REVISION',
    fechaCreacion: '2025-01-15T10:30:00Z',
    fechaActualizacion: '2025-01-16T14:20:00Z'
  }

  odontogramData.value = {
    piezasAfectadas: '16, 17',
    fechaActualizacion: '2025-01-15T11:00:00Z'
  }

  files.value = [
    {
      id: 1,
      nombreOriginal: 'radiografia_periapical.jpg',
      categoria: 'Estudio Radiográfico',
      tipoArchivo: 'image/jpeg',
      tamano: 2048576,
      fechaSubida: '2025-01-15T09:00:00Z'
    },
    {
      id: 2,
      nombreOriginal: 'consentimiento_informado.pdf',
      categoria: 'Documento Legal',
      tipoArchivo: 'application/pdf',
      tamano: 1024000,
      fechaSubida: '2025-01-15T09:30:00Z'
    }
  ]
}

const calculateAge = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'EN_REVISION': 'status-warning',
    'APROBADO': 'status-success',
    'PENDIENTE_ESTUDIOS': 'status-info',
    'EN_TRATAMIENTO': 'status-primary',
    'FINALIZADO': 'status-secondary',
    'CANCELADO': 'status-danger'
  }
  return statusMap[status] || 'status-secondary'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'EN_REVISION': 'En Revisión',
    'APROBADO': 'Aprobado',
    'PENDIENTE_ESTUDIOS': 'Pendiente Estudios',
    'EN_TRATAMIENTO': 'En Tratamiento',
    'FINALIZADO': 'Finalizado',
    'CANCELADO': 'Cancelado'
  }
  return statusMap[status] || status
}

const getFileIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return 'fas fa-image text-info'
  if (mimeType?.includes('pdf')) return 'fas fa-file-pdf text-danger'
  if (mimeType?.includes('word')) return 'fas fa-file-word text-primary'
  if (mimeType?.includes('excel')) return 'fas fa-file-excel text-success'
  return 'fas fa-file text-secondary'
}

const getPatientName = () => {
  if (caseData.value?.paciente) {
    const p = caseData.value.paciente
    if (p.nombres && p.apellidos) {
      return `${p.nombres} ${p.apellidos}`
    }
    if (p.nombre && p.apellido) {
      return `${p.nombre} ${p.apellido}`
    }
    if (p.nombres) return p.nombres
    if (p.nombre) return p.nombre
  }
  return `Paciente ID: ${caseData.value?.pacienteId || 'N/A'}`
}

const getStudentName = () => {
  if (caseData.value?.estudiante) {
    const e = caseData.value.estudiante
    if (e.nombres && e.apellidos) {
      return `${e.nombres} ${e.apellidos}`
    }
    if (e.nombre && e.apellido) {
      return `${e.nombre} ${e.apellido}`
    }
    if (e.nombres) return e.nombres
    if (e.nombre) return e.nombre
  }
  return `ID: ${caseData.value?.estudianteId || 'N/A'}`
}

const getSpecialtyName = () => {
  if (caseData.value?.especialidad) {
    return caseData.value.especialidad.nombre || caseData.value.especialidad.name || 'Sin nombre'
  }
  return `Especialidad ID: ${caseData.value?.especialidadId || 'N/A'}`
}

const viewOdontogram = () => {
  // Mostrar vista expandida del odontograma
  showOdontogramDetail.value = true
  console.log('Showing odontogram detail for case:', props.caseId)
}

const editOdontogram = () => {
  // Implementar edición del odontograma
  console.log('Edit odontogram for case:', props.caseId)
}

const viewMucosa = () => {
  // Mostrar vista expandida de la topografía de mucosa
  showMucosaDetail.value = true
  console.log('Showing mucosa detail for case:', props.caseId)
}

const editMucosa = () => {
  // Implementar edición de la topografía de mucosa
  console.log('Edit mucosa for case:', props.caseId)
}

const getConditionBadgeClass = (condition: string) => {
  const conditionMap: Record<string, string> = {
    'healthy': 'bg-success',
    'caries': 'bg-danger',
    'filling': 'bg-primary',
    'crown': 'bg-warning',
    'missing': 'bg-dark',
    'root-canal': 'bg-info',
    'implant': 'bg-secondary',
    'bridge': 'bg-light text-dark',
    'extraction': 'bg-dark'
  }
  return conditionMap[condition] || 'bg-secondary'
}

const manageFiles = () => {
  // Implementar gestión de archivos
  console.log('Manage files for case:', props.caseId)
}

const editCase = () => {
  emit('case-updated')
  closeModal()
}

const downloadFile = async (fileId: number | string) => {
  try {
    const blob = await clinicalService.downloadClinicalCaseFile(fileId)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `archivo-${fileId}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading file:', error)
    alert('Error al descargar el archivo')
  }
}

const downloadReport = async () => {
  if (!props.caseId) return

  try {
    const blob = await clinicalService.exportClinicalCaseReport(props.caseId, 'pdf')
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `caso-clinico-${props.caseId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading report:', error)
    alert('Error al descargar el reporte')
  }
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow && props.caseId) {
    loadCaseDetails()
  }
})

watch(() => props.caseId, (newCaseId) => {
  if (newCaseId && props.show) {
    loadCaseDetails()
  }
})
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.clinical-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.clinical-header .btn-close {
  filter: invert(1);
}

.header-info .modal-title {
  margin-bottom: 0;
}

.clinical-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8ecef;
  padding: 1.5rem;
}

.section-title {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f3f4;
}

/* Patient info styles */
.patient-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e8ecef;
}

.patient-avatar {
  flex-shrink: 0;
}

.patient-avatar i {
  font-size: 2.5rem;
  color: #667eea;
}

.patient-main-info {
  flex-grow: 1;
}

.patient-name {
  color: #2d3748;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.patient-id {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
}

.patient-id i {
  color: #667eea;
}

.patient-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.info-card:hover {
  border-color: #667eea;
  background: #f1f3f9;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  background: #e9ecef;
  color: #495057;
}

.age-card .info-icon {
  background: #fff3cd;
  color: #856404;
}

.contact-card .info-icon {
  background: #cce7ff;
  color: #0a58ca;
}

.email-card .info-icon {
  background: #f8d7da;
  color: #721c24;
}

.student-card .info-icon {
  background: #e7f1ff;
  color: #0a3d62;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #495057;
  line-height: 1.3;
}

/* Status styles */
.status-badge.large {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 1rem;
}

.status-warning { background: #fff3cd; color: #856404; }
.status-success { background: #d1edff; color: #0c5460; }
.status-info { background: #cce7ff; color: #055160; }
.status-primary { background: #e7f1ff; color: #0a3d62; }
.status-secondary { background: #f8f9fa; color: #495057; }
.status-danger { background: #f8d7da; color: #721c24; }

.case-date {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

/* Clinical info styles */
.info-field {
  margin-bottom: 1rem;
}

.field-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: block;
}

.field-value {
  color: #2d3748;
  margin: 0;
  line-height: 1.5;
}

.case-ids {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e8ecef;
}

/* Record cards styles */
.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.record-actions {
  display: flex;
  gap: 0.5rem;
}

.record-summary p {
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.empty-record {
  text-align: center;
  padding: 1.5rem;
  color: #6c757d;
}

/* Files styles */
.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.empty-files {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.files-grid {
  display: grid;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: #667eea;
  transform: translateY(-1px);
}

.file-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.file-info {
  flex-grow: 1;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #2d3748;
}

.file-meta, .file-date {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

/* Comments styles */
.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  border-bottom: 1px solid #e8ecef;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  color: #495057;
  font-size: 0.9rem;
}

.author-role {
  color: #6c757d;
  font-weight: normal;
}

.comment-date {
  color: #6c757d;
  font-size: 0.8rem;
}

.comment-content {
  color: #2d3748;
  line-height: 1.5;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

/* Odontogram detail styles */
.odontogram-detail .clinical-card {
  border-left: 4px solid #0d6efd;
}

.odontogram-grid .odontogram-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.odontogram-grid .odontogram-card:hover {
  border-color: #0d6efd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.odontogram-card .card-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem;
}

.odontogram-card .card-body {
  padding: 1rem;
}

.conditions-list .badge {
  font-size: 0.75rem;
  text-transform: capitalize;
}

.condition-info, .conclusion-info {
  margin-bottom: 0.75rem;
}

/* Mucosa detail styles */
.mucosa-detail .clinical-card {
  border-left: 4px solid #198754;
}

.mucosa-section {
  padding: 1rem 0;
}

.mucosa-section:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.hallazgo-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hallazgo-card:hover {
  border-color: #198754;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hallazgo-card .card-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem;
}

.hallazgo-card .card-body {
  padding: 1rem;
}

.type-info, .description-info {
  margin-bottom: 0.75rem;
}

.type-info .badge {
  font-size: 0.8rem;
}

.date-info {
  border-top: 1px solid #f8f9fa;
  padding-top: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .patient-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .patient-avatar i {
    font-size: 2rem;
  }
  
  .patient-name {
    font-size: 1.1rem;
  }
  
  .patient-info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .info-card {
    padding: 0.875rem;
  }
  
  .info-icon {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .record-header, .files-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  /* Responsive odontogram detail */
  .odontogram-grid .row {
    margin: 0;
  }
  
  .odontogram-grid .col-md-6, 
  .odontogram-grid .col-lg-4 {
    padding: 0.5rem;
  }
  
  .odontogram-card .card-body,
  .hallazgo-card .card-body {
    padding: 0.75rem;
  }
  
  /* Responsive mucosa detail */
  .mucosa-section h6 {
    font-size: 1rem;
  }
  
  .mucosa-sections .row {
    margin: 0;
  }
  
  .mucosa-sections .col-md-6,
  .mucosa-sections .col-lg-4 {
    padding: 0.5rem;
  }
}
</style>
