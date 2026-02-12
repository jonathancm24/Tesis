<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Importar usuarios desde Excel</h2>
            <button class="btn-close" @click="handleClose" aria-label="Cerrar">×</button>
          </div>

          <div class="modal-body">
            <!-- Paso 1: Instrucciones y descarga de plantilla -->
            <div v-if="currentStep === 'upload'" class="step-content">
              <div class="instructions">
                <h3>📋 Instrucciones</h3>
                <ol>
                  <li>Descarga la plantilla de Excel haciendo clic en el botón de abajo</li>
                  <li>Completa los datos de los usuarios en la plantilla</li>
                  <li>Guarda el archivo y súbelo usando el botón de carga</li>
                  <li>Revisa los resultados de la importación</li>
                </ol>
              </div>

              <div class="template-section">
                <button class="btn btn-secondary" @click="downloadTemplate" :disabled="isLoading">
                  <span class="icon">📥</span>
                  Descargar plantilla
                </button>
                <p class="help-text">La plantilla incluye todas las columnas requeridas y ejemplos</p>
              </div>

              <div class="divider">
                <span>O sube tu archivo Excel</span>
              </div>

              <!-- Zona de carga de archivo -->
              <div 
                class="upload-zone" 
                :class="{ 'drag-over': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept=".xlsx,.xls" 
                  @change="handleFileSelect" 
                  hidden
                />
                
                <div v-if="!selectedFile" class="upload-placeholder">
                  <span class="upload-icon">📄</span>
                  <p class="upload-text">
                    Arrastra tu archivo Excel aquí<br>
                    o haz clic para seleccionar
                  </p>
                  <button class="btn btn-primary" type="button" @click="openFileDialog">
                    Seleccionar archivo
                  </button>
                  <p class="upload-hint">Formatos aceptados: .xlsx, .xls</p>
                </div>

                <div v-else class="file-preview">
                  <span class="file-icon">📊</span>
                  <div class="file-info">
                    <p class="file-name">{{ selectedFile.name }}</p>
                    <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                  <button class="btn-remove" @click="removeFile" type="button">
                    <span>×</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Paso 2: Procesando -->
            <div v-if="currentStep === 'processing'" class="step-content">
              <div class="processing-state">
                <div class="loading-spinner-large"></div>
                <h3>Procesando archivo...</h3>
                <p>Por favor espera mientras se importan los usuarios</p>
              </div>
            </div>

            <!-- Paso 3: Resultados -->
            <div v-if="currentStep === 'results'" class="step-content">
              <div class="results-summary" :class="resultType">
                <span class="result-icon">{{ resultIcon }}</span>
                <div class="result-info">
                  <h3>{{ resultTitle }}</h3>
                  <p>{{ resultMessage }}</p>
                </div>
              </div>

              <div v-if="importResult" class="results-details">
                <div class="stat-cards">
                  <div class="stat-card success">
                    <span class="stat-value">{{ importResult.imported }}</span>
                    <span class="stat-label">Usuarios importados</span>
                  </div>
                  <div class="stat-card error" v-if="importResult.errors.length > 0">
                    <span class="stat-value">{{ importResult.errors.length }}</span>
                    <span class="stat-label">Errores</span>
                  </div>
                </div>

                <!-- Lista de errores si existen -->
                <div v-if="importResult.errors.length > 0" class="errors-list">
                  <h4>⚠️ Errores encontrados:</h4>
                  <ul>
                    <li v-for="(error, index) in importResult.errors" :key="index">
                      {{ error }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              v-if="currentStep === 'upload'" 
              class="btn btn-secondary" 
              @click="handleClose"
              :disabled="isLoading"
            >
              Cancelar
            </button>
            
            <button 
              v-if="currentStep === 'upload'" 
              class="btn btn-primary" 
              @click="handleUpload"
              :disabled="!selectedFile || isLoading"
            >
              {{ isLoading ? 'Importando...' : 'Importar usuarios' }}
            </button>

            <button 
              v-if="currentStep === 'results'" 
              class="btn btn-secondary" 
              @click="resetModal"
            >
              Importar otro archivo
            </button>

            <button 
              v-if="currentStep === 'results'" 
              class="btn btn-primary" 
              @click="handleClose"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usuariosService } from '@/services/usuarios.service'
import { getErrorMessage } from '@/utils/errorHandler'
import '@/assets/styles/admin/usuarios.css'
import '@/assets/styles/admin/components/ImportUsuariosModal.css'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

type Step = 'upload' | 'processing' | 'results'

const currentStep = ref<Step>('upload')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const importResult = ref<{ imported: number; errors: string[] } | null>(null)

const resultType = computed(() => {
  if (!importResult.value) return ''
  return importResult.value.errors.length === 0 ? 'success' : 
         importResult.value.imported > 0 ? 'warning' : 'error'
})

const resultIcon = computed(() => {
  switch (resultType.value) {
    case 'success': return '✓'
    case 'warning': return '⚠'
    case 'error': return '✕'
    default: return ''
  }
})

const resultTitle = computed(() => {
  switch (resultType.value) {
    case 'success': return 'Importación exitosa'
    case 'warning': return 'Importación parcial'
    case 'error': return 'Error en la importación'
    default: return ''
  }
})

const resultMessage = computed(() => {
  if (!importResult.value) return ''
  
  if (resultType.value === 'success') {
    return `Se importaron ${importResult.value.imported} usuarios correctamente`
  } else if (resultType.value === 'warning') {
    return `Se importaron ${importResult.value.imported} usuarios, pero hubo ${importResult.value.errors.length} errores`
  } else {
    return 'No se pudo importar ningún usuario. Revisa los errores a continuación.'
  }
})

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    
    // Validar extensión
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      selectedFile.value = file
    } else {
      alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)')
    }
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const downloadTemplate = async () => {
  try {
    isLoading.value = true
    const blob = await usuariosService.downloadTemplate()
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plantilla_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`
    link.setAttribute('target', '_blank')
    document.body.appendChild(link)
    link.click()
    
    // Pequeño delay antes de limpiar
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('Error al descargar plantilla:', error)
    alert(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  try {
    isLoading.value = true
    currentStep.value = 'processing'
    
    const result = await usuariosService.importFromExcel(selectedFile.value)
    importResult.value = result
    
    currentStep.value = 'results'
    
    // Si fue exitoso, emitir evento para refrescar la lista
    if (result.imported > 0) {
      emit('success')
    }
  } catch (error) {
    currentStep.value = 'results'
    importResult.value = {
      imported: 0,
      errors: [getErrorMessage(error)]
    }
  } finally {
    isLoading.value = false
  }
}

const resetModal = () => {
  currentStep.value = 'upload'
  selectedFile.value = null
  importResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleClose = () => {
  if (!isLoading.value) {
    resetModal()
    emit('close')
  }
}
</script>

