<template>
  <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }" @click.self="closeModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header clinical-header">
          <h5 class="modal-title">
            <i class="fas fa-folder-open me-2"></i>
            Gestión de Archivos
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <!-- Subir nuevo archivo -->
          <div class="upload-section mb-4">
            <div class="upload-card clinical-card">
              <h6 class="section-title">
                <i class="fas fa-upload me-2"></i>
                Subir Nuevo Archivo
              </h6>
              
              <form @submit.prevent="uploadFile">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label required">Categoría</label>
                    <select v-model="uploadForm.categoria" class="form-select clinical-select" required>
                      <option value="">Seleccionar categoría</option>
                      <option v-for="category in fileCategories" :key="category.value" :value="category.value">
                        {{ category.label }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label required">Archivo</label>
                    <input
                      type="file"
                      class="form-control clinical-input"
                      @change="handleFileSelect"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                      required
                    >
                  </div>

                  <div class="col-12">
                    <label class="form-label">Descripción</label>
                    <textarea
                      v-model="uploadForm.descripcion"
                      class="form-control clinical-input"
                      rows="2"
                      placeholder="Descripción del archivo (opcional)..."
                    ></textarea>
                  </div>

                  <div class="col-12">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="uploading || !canUpload"
                    >
                      <span v-if="uploading">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Subiendo...
                      </span>
                      <span v-else>
                        <i class="fas fa-upload me-1"></i>
                        Subir Archivo
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Lista de archivos existentes -->
          <div class="files-section">
            <div class="files-header mb-3">
              <h6 class="section-title">
                <i class="fas fa-paperclip me-2"></i>
                Archivos Adjuntos
                <span class="badge bg-secondary ms-2">{{ files.length }}</span>
              </h6>
            </div>

            <div v-if="loadingFiles" class="loading-container">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando archivos...</span>
              </div>
              <p class="mt-2 mb-0">Cargando archivos...</p>
            </div>

            <div v-else-if="files.length === 0" class="empty-files">
              <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <h6 class="text-muted">No hay archivos adjuntos</h6>
              <p class="text-muted mb-0">Sube el primer archivo para este caso clínico</p>
            </div>

            <div v-else class="files-list">
              <div 
                v-for="file in files" 
                :key="file.id"
                class="file-item clinical-card"
              >
                <div class="file-icon">
                  <i :class="getFileIcon(file.tipoArchivo)"></i>
                </div>
                
                <div class="file-info">
                  <h6 class="file-name">{{ file.nombreOriginal }}</h6>
                  <div class="file-meta">
                    <span class="file-category">
                      <i class="fas fa-tag me-1"></i>
                      {{ getCategoryLabel(file.categoria) }}
                    </span>
                    <span class="file-size">
                      <i class="fas fa-weight-hanging me-1"></i>
                      {{ formatFileSize(file.tamano) }}
                    </span>
                    <span class="file-date">
                      <i class="far fa-calendar-alt me-1"></i>
                      {{ formatDate(file.fechaSubida) }}
                    </span>
                  </div>
                  <p v-if="file.descripcion" class="file-description">
                    {{ file.descripcion }}
                  </p>
                </div>

                <div class="file-actions">
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="downloadFile(file.id)"
                    title="Descargar archivo"
                  >
                    <i class="fas fa-download"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="previewFile(file)"
                    title="Vista previa"
                    v-if="canPreview(file.tipoArchivo)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDeleteFile(file)"
                    title="Eliminar archivo"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para eliminar archivo -->
  <div 
    class="modal fade" 
    :class="{ show: showDeleteConfirm }" 
    :style="{ display: showDeleteConfirm ? 'block' : 'none' }"
    @click.self="cancelDelete"
  >
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar Eliminación</h5>
          <button type="button" class="btn-close" @click="cancelDelete"></button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar este archivo?</p>
          <p class="text-muted mb-0">
            <strong>{{ fileToDelete?.nombreOriginal }}</strong>
          </p>
          <small class="text-danger">Esta acción no se puede deshacer.</small>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelDelete">
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="deleteFile"
            :disabled="deleting"
          >
            <span v-if="deleting">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Eliminando...
            </span>
            <span v-else>
              <i class="fas fa-trash me-1"></i>
              Eliminar
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show || showDeleteConfirm" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as clinicalService from '@/services/clinicalCasesService'

// Props y emits
interface Props {
  show: boolean
  caseId: number | string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  'files-updated': []
}>()

// Estado del componente
const loadingFiles = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const files = ref<any[]>([])
const fileCategories = ref<any[]>([])
const selectedFile = ref<File | null>(null)
const showDeleteConfirm = ref(false)
const fileToDelete = ref<any>(null)

const uploadForm = ref({
  categoria: '',
  descripcion: ''
})

// Computed properties
const canUpload = computed(() => {
  return uploadForm.value.categoria && selectedFile.value
})

// Métodos
const closeModal = () => {
  emit('update:show', false)
  resetForm()
}

const resetForm = () => {
  uploadForm.value = {
    categoria: '',
    descripcion: ''
  }
  selectedFile.value = null
  
  // Reset file input
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

const loadFiles = async () => {
  if (!props.caseId) return

  try {
    loadingFiles.value = true
    const response = await clinicalService.fetchClinicalCaseFiles(props.caseId)
    files.value = response.data || []
  } catch (error) {
    console.error('Error loading files:', error)
    // Datos simulados para desarrollo
    files.value = [
      {
        id: 1,
        nombreOriginal: 'radiografia_periapical.jpg',
        categoria: 'ESTUDIO_RADIOGRAFICO',
        tipoArchivo: 'image/jpeg',
        tamano: 2048576,
        fechaSubida: '2025-01-15T09:00:00Z',
        descripcion: 'Radiografía inicial del molar afectado'
      },
      {
        id: 2,
        nombreOriginal: 'consentimiento_informado.pdf',
        categoria: 'DOCUMENTO_CONSENTIMIENTO',
        tipoArchivo: 'application/pdf',
        tamano: 1024000,
        fechaSubida: '2025-01-15T09:30:00Z',
        descripcion: 'Consentimiento firmado por el paciente'
      }
    ]
  } finally {
    loadingFiles.value = false
  }
}

const loadFileCategories = async () => {
  try {
    fileCategories.value = await clinicalService.fetchFileCategories()
  } catch (error) {
    console.error('Error loading categories:', error)
    // Categorías por defecto
    fileCategories.value = [
      { value: 'ESTUDIO_RADIOGRAFICO', label: 'Estudio Radiográfico' },
      { value: 'FOTO_INTRAORAL', label: 'Foto Intraoral' },
      { value: 'FOTO_EXTRAORAL', label: 'Foto Extraoral' },
      { value: 'FOTO_TRATAMIENTO', label: 'Foto de Tratamiento' },
      { value: 'DOCUMENTO_CONSENTIMIENTO', label: 'Consentimiento Informado' },
      { value: 'RECETA_MEDICA', label: 'Receta Médica' },
      { value: 'INTERCONSULTA', label: 'Interconsulta' },
      { value: 'RESULTADO_LABORATORIO', label: 'Resultado de Laboratorio' },
      { value: 'DOCUMENTO_LEGAL', label: 'Documento Legal' },
      { value: 'PLAN_TRATAMIENTO', label: 'Plan de Tratamiento' },
      { value: 'REPORTE_PROGRESO', label: 'Reporte de Progreso' },
      { value: 'OTRO', label: 'Otro' }
    ]
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const uploadFile = async () => {
  if (!props.caseId || !selectedFile.value || uploading.value) return

  try {
    uploading.value = true

    await clinicalService.uploadClinicalCaseFile(
      props.caseId,
      selectedFile.value,
      uploadForm.value.categoria,
      uploadForm.value.descripcion
    )

    // Recargar lista de archivos
    await loadFiles()
    
    // Resetear formulario
    resetForm()
    
    // Notificar actualización
    emit('files-updated')
    
    alert('Archivo subido exitosamente')
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Error al subir el archivo. Inténtalo nuevamente.')
  } finally {
    uploading.value = false
  }
}

const confirmDeleteFile = (file: any) => {
  fileToDelete.value = file
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  fileToDelete.value = null
}

const deleteFile = async () => {
  if (!fileToDelete.value || deleting.value) return

  try {
    deleting.value = true

    await clinicalService.deleteClinicalCaseFile(fileToDelete.value.id)
    
    // Recargar lista de archivos
    await loadFiles()
    
    // Cerrar modal de confirmación
    cancelDelete()
    
    // Notificar actualización
    emit('files-updated')
    
    alert('Archivo eliminado exitosamente')
  } catch (error) {
    console.error('Error deleting file:', error)
    alert('Error al eliminar el archivo. Inténtalo nuevamente.')
  } finally {
    deleting.value = false
  }
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

const previewFile = (file: any) => {
  // Implementar vista previa
  console.log('Preview file:', file)
  alert('Vista previa no implementada aún')
}

const canPreview = (mimeType: string) => {
  return mimeType?.startsWith('image/') || mimeType?.includes('pdf')
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getFileIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return 'fas fa-image text-info'
  if (mimeType?.includes('pdf')) return 'fas fa-file-pdf text-danger'
  if (mimeType?.includes('word')) return 'fas fa-file-word text-primary'
  if (mimeType?.includes('excel')) return 'fas fa-file-excel text-success'
  return 'fas fa-file text-secondary'
}

const getCategoryLabel = (category: string) => {
  const cat = fileCategories.value.find(c => c.value === category)
  return cat?.label || category
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow && props.caseId) {
    loadFiles()
  }
})

// Lifecycle
onMounted(() => {
  loadFileCategories()
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

.clinical-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8ecef;
  padding: 1.5rem;
}

.clinical-input, .clinical-select {
  border: 2px solid #e8ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.clinical-input:focus, .clinical-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.section-title {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f3f4;
}

.upload-card {
  margin-bottom: 0;
}

.files-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.file-info {
  flex-grow: 1;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.file-category,
.file-size,
.file-date {
  color: #6c757d;
  font-size: 0.875rem;
}

.file-description {
  color: #495057;
  font-size: 0.875rem;
  margin: 0;
  font-style: italic;
}

.file-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.loading-container, .empty-files {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.required::after {
  content: " *";
  color: #dc3545;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .file-actions {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }
  
  .file-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
