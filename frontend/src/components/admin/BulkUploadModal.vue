<!-- src/components/admin/BulkUploadModal.vue -->
<template>
  <div class="modal fade" id="bulkUploadModal" tabindex="-1" aria-labelledby="bulkUploadModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <!-- Header del Modal -->
        <div class="modal-header">
          <h5 class="modal-title" id="bulkUploadModalLabel">
            <i class="fas fa-upload me-2"></i>
            Carga Masiva de Usuarios
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Cuerpo del Modal -->
        <div class="modal-body">
          <!-- Paso 1: Selección de archivo -->
          <div v-if="currentStep === 1" class="step-content">
            <div class="step-header mb-4">
              <h6 class="text-primary">
                <i class="fas fa-file-excel me-2"></i>
                Paso 1: Seleccionar archivo Excel
              </h6>
              <p class="text-muted">
                Sube un archivo Excel (.xlsx o .xls) con los datos de los usuarios a crear.
              </p>
            </div>

            <!-- Botón para descargar plantilla -->
            <div class="mb-4">
              <button 
                type="button" 
                class="btn btn-outline-info"
                @click="downloadTemplate"
                :disabled="isDownloadingTemplate"
              >
                <i class="fas fa-download me-2"></i>
                {{ isDownloadingTemplate ? 'Descargando...' : 'Descargar Plantilla Excel' }}
              </button>
              <small class="text-muted d-block mt-1">
                Descarga una plantilla con el formato requerido y datos de ejemplo.
              </small>
            </div>

            <!-- Botón visible para subir archivo -->
            <div class="mb-3">
              <button
                type="button"
                class="btn btn-primary"
                @click="triggerFileInput"
              >
                <i class="fas fa-file-arrow-up me-2"></i>
                Subir archivo
              </button>
              <small class="text-muted d-block mt-1">Selecciona el archivo desde tu equipo.</small>
            </div>

            <!-- Zona de arrastrar y soltar -->
            <div 
              class="upload-zone"
              :class="{ 
                'drag-over': isDragOver,
                'has-file': selectedFile,
                'has-error': uploadError
              }"
              @dragenter.prevent="onDragEnter"
              @dragover.prevent="onDragOver" 
              @dragleave.prevent="onDragLeave"
              @drop.prevent="onDrop"
              @click="triggerFileInput"
            >
              <div v-if="!selectedFile" class="upload-content">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <h6>Arrastra tu archivo Excel aquí</h6>
                <p class="text-muted">o haz clic para seleccionar</p>
                <small class="text-muted">
                  Formatos soportados: .xlsx, .xls (máximo 5MB)
                </small>
              </div>

              <div v-else class="file-selected">
                <i class="fas fa-file-excel file-icon"></i>
                <div class="file-info">
                  <h6>{{ selectedFile.name }}</h6>
                  <p class="text-muted">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-danger"
                  @click.stop="removeFile"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Input oculto para archivos -->
            <input 
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls"
              style="display: none"
              @change="onFileSelected"
            />

            <!-- Error de subida -->
            <div v-if="uploadError" class="alert alert-danger mt-3">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ uploadError }}
            </div>
          </div>

          <!-- Paso 2: Validación y resultados -->
          <div v-if="currentStep === 2" class="step-content">
            <div class="step-header mb-4">
              <h6 class="text-primary">
                <i class="fas fa-check-circle me-2"></i>
                Paso 2: Validación del archivo
              </h6>
            </div>

            <!-- Loading -->
            <div v-if="isValidating" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Validando archivo...</span>
              </div>
              <p class="mt-2 text-muted">Validando archivo Excel...</p>
            </div>

            <!-- Resultados de validación -->
            <div v-else-if="validationResult" class="validation-results">
              <!-- Resumen -->
              <div class="row mb-4">
                <div class="col-md-3">
                  <div class="stat-card text-center">
                    <div class="stat-number text-primary">{{ validationResult.summary.totalRows }}</div>
                    <div class="stat-label">Total de filas</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center">
                    <div class="stat-number text-success">{{ validationResult.summary.validRows }}</div>
                    <div class="stat-label">Válidos</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center">
                    <div class="stat-number text-warning">{{ validationResult.summary.duplicateRows }}</div>
                    <div class="stat-label">Duplicados</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center">
                    <div class="stat-number text-danger">{{ validationResult.summary.invalidRows }}</div>
                    <div class="stat-label">Con errores</div>
                  </div>
                </div>
              </div>

              <!-- Tabs para mostrar detalles -->
              <ul class="nav nav-tabs" id="validationTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link active" 
                    id="valid-tab" 
                    data-bs-toggle="tab" 
                    data-bs-target="#valid" 
                    type="button" 
                    role="tab"
                  >
                    Válidos ({{ validationResult.summary.validRows }})
                  </button>
                </li>
                <li class="nav-item" role="presentation" v-if="validationResult.summary.duplicateRows > 0">
                  <button 
                    class="nav-link" 
                    id="duplicates-tab" 
                    data-bs-toggle="tab" 
                    data-bs-target="#duplicates" 
                    type="button" 
                    role="tab"
                  >
                    Duplicados ({{ validationResult.summary.duplicateRows }})
                  </button>
                </li>
                <li class="nav-item" role="presentation" v-if="validationResult.summary.invalidRows > 0">
                  <button 
                    class="nav-link" 
                    id="invalid-tab" 
                    data-bs-toggle="tab" 
                    data-bs-target="#invalid" 
                    type="button" 
                    role="tab"
                  >
                    Con errores ({{ validationResult.summary.invalidRows }})
                  </button>
                </li>
              </ul>

              <div class="tab-content mt-3" id="validationTabsContent">
                <!-- Usuarios válidos -->
                <div class="tab-pane fade show active" id="valid" role="tabpanel">
                  <div v-if="validationResult.validUsers.length > 0" class="table-responsive">
                    <table class="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Apellido</th>
                          <th>Email</th>
                          <th>Documento</th>
                          <th>Rol</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="user in validationResult.validUsers.slice(0, 10)" :key="user.email">
                          <td>{{ user.nombre }}</td>
                          <td>{{ user.apellido }}</td>
                          <td>{{ user.email }}</td>
                          <td>{{ user.numeroDocumento }}</td>
                          <td>
                            <span class="badge bg-primary">{{ user.role }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p v-if="validationResult.validUsers.length > 10" class="text-muted">
                      Mostrando 10 de {{ validationResult.validUsers.length }} usuarios válidos
                    </p>
                  </div>
                </div>

                <!-- Usuarios duplicados -->
                <div class="tab-pane fade" id="duplicates" role="tabpanel">
                  <div v-if="validationResult.duplicateUsers.length > 0">
                    <div class="alert alert-warning">
                      <i class="fas fa-info-circle me-2"></i>
                      Los usuarios duplicados que están inactivos serán reactivados automáticamente.
                    </div>
                    <div class="table-responsive">
                      <table class="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Fila</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Estado actual</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="duplicate in validationResult.duplicateUsers" :key="duplicate.row">
                            <td>{{ duplicate.row }}</td>
                            <td>{{ duplicate.data.nombre }} {{ duplicate.data.apellido }}</td>
                            <td>{{ duplicate.data.email }}</td>
                            <td>
                              <span 
                                class="badge" 
                                :class="duplicate.existingUser.activo ? 'bg-success' : 'bg-secondary'"
                              >
                                {{ duplicate.existingUser.activo ? 'Activo' : 'Inactivo' }}
                              </span>
                            </td>
                            <td>
                              <span v-if="duplicate.existingUser.activo" class="text-muted">Sin cambios</span>
                              <span v-else class="text-success">Se reactivará</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Usuarios con errores -->
                <div class="tab-pane fade" id="invalid" role="tabpanel">
                  <div v-if="validationResult.invalidUsers.length > 0" class="table-responsive">
                    <table class="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Fila</th>
                          <th>Datos</th>
                          <th>Errores</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="invalid in validationResult.invalidUsers" :key="invalid.row">
                          <td>{{ invalid.row }}</td>
                          <td>
                            <small>
                              {{ invalid.data.nombre || '' }} {{ invalid.data.apellido || '' }} 
                              ({{ invalid.data.email || 'Sin email' }})
                            </small>
                          </td>
                          <td>
                            <ul class="list-unstyled mb-0">
                              <li v-for="error in invalid.errors" :key="error" class="text-danger">
                                <small><i class="fas fa-exclamation-circle me-1"></i>{{ error }}</small>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 3: Procesando -->
          <div v-if="currentStep === 3" class="step-content">
            <div class="text-center py-4">
              <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Procesando usuarios...</span>
              </div>
              <h6 class="mt-3">Procesando usuarios...</h6>
              <p class="text-muted">Por favor espera mientras se crean los usuarios</p>
            </div>
          </div>

          <!-- Paso 4: Resultados finales -->
          <div v-if="currentStep === 4" class="step-content">
            <div class="step-header mb-4">
              <h6 class="text-success">
                <i class="fas fa-check-circle me-2"></i>
                Procesamiento completado
              </h6>
            </div>

            <div v-if="processResult" class="process-results">
              <!-- Resumen final -->
              <div class="row mb-4">
                <div class="col-md-4">
                  <div class="stat-card text-center">
                    <div class="stat-number text-success">{{ processResult.summary.successfullyCreated }}</div>
                    <div class="stat-label">Creados</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-card text-center">
                    <div class="stat-number text-info">{{ processResult.summary.successfullyUpdated }}</div>
                    <div class="stat-label">Reactivados</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-card text-center">
                    <div class="stat-number text-danger">{{ processResult.summary.failed }}</div>
                    <div class="stat-label">Fallidos</div>
                  </div>
                </div>
              </div>

              <!-- Detalles de usuarios creados -->
              <div v-if="processResult.created.length > 0" class="mb-4">
                <h6 class="text-success">
                  <i class="fas fa-user-plus me-2"></i>
                  Usuarios creados exitosamente
                </h6>
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>Importante:</strong> Estos usuarios tienen contraseñas temporales. 
                  Se recomienda enviarles sus credenciales y solicitar que cambien la contraseña.
                </div>
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Contraseña temporal</th>
                        <th>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in processResult.created" :key="user.id">
                        <td>{{ user.nombre }} {{ user.apellido }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                          <code class="text-primary">{{ user.temporaryPassword }}</code>
                        </td>
                        <td>
                          <span class="badge bg-primary">{{ user.role?.nombre }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Usuarios reactivados -->
              <div v-if="processResult.updated.length > 0" class="mb-4">
                <h6 class="text-info">
                  <i class="fas fa-user-check me-2"></i>
                  Usuarios reactivados
                </h6>
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in processResult.updated" :key="user.id">
                        <td>{{ user.nombre }} {{ user.apellido }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="badge bg-info">{{ user.role?.nombre }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Errores -->
              <div v-if="processResult.failed.length > 0" class="mb-4">
                <h6 class="text-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Usuarios que fallaron al procesar
                </h6>
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Datos</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="failed in processResult.failed" :key="failed.data.email">
                        <td>{{ failed.data.nombre }} {{ failed.data.apellido }} ({{ failed.data.email }})</td>
                        <td class="text-danger">{{ failed.error }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="modal-footer">
          <button 
            v-if="currentStep > 1 && currentStep < 4" 
            type="button" 
            class="btn btn-secondary"
            @click="goBack"
            :disabled="isValidating || isProcessing"
          >
            <i class="fas fa-arrow-left me-2"></i>
            Atrás
          </button>

          <button 
            v-if="currentStep === 1" 
            type="button" 
            class="btn btn-primary"
            @click="validateFile"
            :disabled="!selectedFile || isValidating"
          >
            <i class="fas fa-check me-2"></i>
            {{ isValidating ? 'Validando...' : 'Validar archivo' }}
          </button>

          <button 
            v-if="currentStep === 2 && validationResult && !validationResult.hasErrors" 
            type="button" 
            class="btn btn-success"
            @click="processUsers"
            :disabled="isProcessing"
          >
            <i class="fas fa-play me-2"></i>
            {{ isProcessing ? 'Procesando...' : 'Procesar usuarios' }}
          </button>

          <button 
            v-if="currentStep === 4" 
            type="button" 
            class="btn btn-primary"
            @click="closeModal"
          >
            <i class="fas fa-check me-2"></i>
            Finalizar
          </button>

          <button 
            type="button" 
            class="btn btn-secondary" 
            data-bs-dismiss="modal"
            @click="resetModal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bulkUserService, type ExcelValidationResponse, type BulkProcessResponse } from '@/services/bulkUserService'

// Props y emits
interface Emits {
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// Estado del modal
const currentStep = ref(1)
const isDragOver = ref(false)
const selectedFile = ref<File | null>(null)
const uploadError = ref('')

// Estado de validación
const isValidating = ref(false)
const validationResult = ref<ExcelValidationResponse | null>(null)

// Estado de procesamiento
const isProcessing = ref(false)
const processResult = ref<BulkProcessResponse | null>(null)

// Estado de descarga de plantilla
const isDownloadingTemplate = ref(false)

// Referencias del DOM
const fileInput = ref<HTMLInputElement>()

/**
 * Maneja el evento de arrastrar archivo sobre la zona de subida
 */
const onDragEnter = () => {
  isDragOver.value = true
}

const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

/**
 * Maneja el evento de soltar archivo en la zona de subida
 */
const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

/**
 * Activa el input de archivo oculto
 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/**
 * Maneja la selección de archivo desde el input
 */
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

/**
 * Procesa la selección de archivo
 */
const handleFileSelection = (file: File) => {
  uploadError.value = ''
  
  // Validar tipo de archivo
  if (!bulkUserService.isValidExcelFile(file.name)) {
    uploadError.value = 'Solo se permiten archivos Excel (.xlsx, .xls)'
    return
  }
  
  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = 'El archivo no puede ser mayor a 5MB'
    return
  }
  
  selectedFile.value = file
}

/**
 * Remueve el archivo seleccionado
 */
const removeFile = () => {
  selectedFile.value = null
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Valida el archivo Excel seleccionado
 */
const validateFile = async () => {
  if (!selectedFile.value) return
  
  isValidating.value = true
  uploadError.value = ''
  
  try {
    validationResult.value = await bulkUserService.validateExcelFile(selectedFile.value)
    currentStep.value = 2
  } catch (error: any) {
    uploadError.value = error.message
  } finally {
    isValidating.value = false
  }
}

/**
 * Procesa los usuarios validados
 */
const processUsers = async () => {
  if (!validationResult.value) return
  
  isProcessing.value = true
  currentStep.value = 3
  
  try {
    processResult.value = await bulkUserService.processUsers(
      validationResult.value.validUsers,
      validationResult.value.duplicateUsers
    )
    currentStep.value = 4
  } catch (error: any) {
    uploadError.value = error.message
    currentStep.value = 2
  } finally {
    isProcessing.value = false
  }
}

/**
 * Descarga la plantilla Excel
 */
const downloadTemplate = async () => {
  isDownloadingTemplate.value = true
  
  try {
    const blob = await bulkUserService.downloadTemplate()
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla_usuarios.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
  } catch (error: any) {
    uploadError.value = error.message
  } finally {
    isDownloadingTemplate.value = false
  }
}

/**
 * Vuelve al paso anterior
 */
const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

/**
 * Cierra el modal y emite evento de éxito
 */
const closeModal = () => {
  // Cerrar modal usando Bootstrap
  const modal = document.getElementById('bulkUploadModal')
  if (modal) {
    const bsModal = (window as any).bootstrap.Modal.getInstance(modal)
    if (bsModal) {
      bsModal.hide()
    }
  }
  
  // Emitir evento de éxito para refrescar la lista
  emit('success')
  
  // Reset modal
  resetModal()
}

/**
 * Resetea el estado del modal
 */
const resetModal = () => {
  currentStep.value = 1
  selectedFile.value = null
  uploadError.value = ''
  validationResult.value = null
  processResult.value = null
  isDragOver.value = false
  isValidating.value = false
  isProcessing.value = false
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Formatea el tamaño de archivo para mostrar al usuario
 */
const formatFileSize = (bytes: number): string => {
  return bulkUserService.formatFileSize(bytes)
}
</script>

<style src="@/assets/css/components/BulkUploadModal.css" scoped></style>
