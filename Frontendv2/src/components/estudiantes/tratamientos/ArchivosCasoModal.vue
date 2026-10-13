<template>
  <Teleport to="body">
    <div v-if="isOpen" class="tratamientos-modal-overlay" @click.self="cerrarModal">
      <div class="tratamientos-modal-content">
        <header class="tratamientos-modal-header">
          <div>
            <p class="tratamientos-modal-eyebrow">Estudiantes · Archivos</p>
            <h2 class="tratamientos-modal-title">Adjuntar archivos al caso</h2>
            <p class="tratamientos-modal-subtitle">
              <span v-if="caso">Caso #{{ caso.id }} · {{ caso.paciente?.nombre }} {{ caso.paciente?.apellido }}</span>
              <span v-else>Selecciona un caso para continuar.</span>
            </p>
          </div>
          <button class="tratamientos-modal-close" type="button" @click="cerrarModal">×</button>
        </header>

        <div class="tratamientos-modal-body">
          <div v-if="!caso" class="tratamientos-modal-state">No hay un caso seleccionado.</div>

          <template v-else>
            <section class="tratamientos-modal-section">
              <div class="tratamientos-modal-list-header">
                <div>
                  <h3>Subir documentos</h3>
                  <p class="tratamientos-modal-helper">Puedes previsualizar algunos archivos antes de descargarlos.</p>
                </div>
                <span :class="['tratamientos-modal-badge', estadoBadge]">{{ caso.estado }}</span>
              </div>

              <div class="tratamientos-modal-grid tratamientos-modal-grid--two">
                <div class="tratamientos-modal-field">
                  <label>Archivos</label>
                  <input ref="fileInputRef" type="file" multiple :disabled="isUploading || !canEdit" @change="handleFileChange" />
                </div>
                <div class="tratamientos-modal-field">
                  <label>Descripción</label>
                  <input v-model.trim="descripcionArchivo" type="text" placeholder="Descripción opcional" :disabled="isUploading || !canEdit" />
                </div>
              </div>

              <div class="tratamientos-modal-actions" style="justify-content: flex-start; margin-top: 0.25rem;">
                <button class="btn btn-primary" type="button" :disabled="isUploading || !filesToUpload.length || !canEdit" @click="handleUploadFiles">
                  {{ isUploading ? 'Subiendo...' : 'Subir archivos' }}
                </button>
              </div>
            </section>

            <section class="tratamientos-modal-section">
              <h3>Archivos registrados</h3>
              <div v-if="isLoading" class="tratamientos-modal-state">Cargando archivos del caso...</div>
              <div v-else-if="!archivosCaso.length" class="tratamientos-modal-state">Sin archivos adjuntos.</div>
              <div v-else class="tratamientos-modal-file-list">
                <article v-for="archivo in archivosCaso" :key="archivo.id" class="tratamientos-modal-file-card">
                  <div class="tratamientos-modal-list-header">
                    <div>
                      <strong>{{ archivo.nombre }}</strong>
                      <p class="tratamientos-modal-meta">{{ archivo.tipo }} · {{ formatDate(archivo.fechaSubida) }}</p>
                      <p class="tratamientos-modal-meta">Subido por {{ archivo.subidoPor.nombre }} {{ archivo.subidoPor.apellido }}</p>
                    </div>
                    <span v-if="esArchivoPrevisualizable(archivo)" class="tratamientos-modal-badge tratamientos-modal-badge--info">Vista previa</span>
                  </div>

                  <p v-if="archivo.descripcion" class="tratamientos-modal-helper">{{ archivo.descripcion }}</p>

                  <div class="tratamientos-modal-file-actions">
                    <button v-if="esArchivoPrevisualizable(archivo)" class="tratamientos-modal-link-btn" type="button" @click="mostrarVistaPrevia(archivo)">
                      Ver
                    </button>
                    <button class="tratamientos-modal-link-btn" type="button" @click="descargarArchivo(archivo)">Descargar</button>
                  </div>
                </article>
              </div>

              <div v-if="archivoVistaPrevia" class="tratamientos-modal-file-preview">
                <template v-if="previewKind === 'image'">
                  <img :src="archivoVistaPrevia" :alt="archivoSeleccionado?.nombre || 'Vista previa de archivo'" />
                </template>
                <template v-else-if="previewKind === 'pdf'">
                  <iframe :src="archivoVistaPrevia" title="Vista previa de PDF"></iframe>
                </template>
                <template v-else>
                  <div class="tratamientos-modal-file-placeholder">No se pudo renderizar una vista previa directa para este archivo.</div>
                </template>
              </div>
            </section>
          </template>
        </div>

        <footer class="tratamientos-modal-footer">
          <div class="tratamientos-modal-actions">
            <button class="btn btn-secondary" type="button" @click="cerrarModal">Cerrar</button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { archivosService } from '@/services/common/archivos.service'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import type { CasoClinicoListItem } from '@/types/casosClinicos.types'
import type { ArchivoItem } from '@/types/archivos.types'
import '@/assets/styles/Estudiantes/components/TratamientosModals.css'

interface Props {
  isOpen: boolean
  caso: CasoClinicoListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()
const toast = useToast()

const isLoading = ref(false)
const isUploading = ref(false)
const archivosCaso = ref<ArchivoItem[]>([])
const filesToUpload = ref<File[]>([])
const descripcionArchivo = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const archivoSeleccionado = ref<ArchivoItem | null>(null)
const archivoVistaPrevia = ref<string | null>(null)
const previewKind = ref<'image' | 'pdf' | 'other' | null>(null)

const canEdit = computed(() => Boolean(props.caso) && props.caso?.estado !== 'RECHAZADO' && props.caso?.estado !== 'FINALIZADO')

const estadoBadge = computed(() => {
  const estado = props.caso?.estado
  if (estado === 'FINALIZADO' || estado === 'APROBADO') return 'tratamientos-modal-badge--success'
  if (estado === 'RECHAZADO') return 'tratamientos-modal-badge--danger'
  if (estado === 'EN_TRATAMIENTO') return 'tratamientos-modal-badge--info'
  return 'tratamientos-modal-badge--warning'
})

const limpiarVistaPrevia = () => {
  if (archivoVistaPrevia.value) {
    URL.revokeObjectURL(archivoVistaPrevia.value)
  }
  archivoSeleccionado.value = null
  archivoVistaPrevia.value = null
  previewKind.value = null
}

const limpiarFormulario = () => {
  filesToUpload.value = []
  descripcionArchivo.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const formatDate = (value: string) => {
  return new Date(value).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const esArchivoPrevisualizable = (archivo: ArchivoItem) => {
  const extension = archivo.nombre.split('.').pop()?.toLowerCase() || ''
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(extension)
}

const tipoVistaPrevia = (archivo: ArchivoItem): 'image' | 'pdf' | 'other' => {
  const extension = archivo.nombre.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  return 'other'
}

const cargarArchivos = async () => {
  if (!props.caso) {
    archivosCaso.value = []
    return
  }

  try {
    isLoading.value = true
    archivosCaso.value = await archivosService.listByEntity('CASO_CLINICO', props.caso.id)
  } catch (error) {
    toast.error(getErrorMessage(error))
    archivosCaso.value = []
  } finally {
    isLoading.value = false
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  filesToUpload.value = Array.from(input.files || [])
}

const handleUploadFiles = async () => {
  if (!props.caso || !canEdit.value || !filesToUpload.value.length) return

  try {
    isUploading.value = true
    await Promise.all(
      filesToUpload.value.map((file) =>
        archivosService.upload({
          file,
          descripcion: descripcionArchivo.value,
          entidadTipo: 'CASO_CLINICO',
          entidadId: props.caso!.id
        })
      )
    )

    toast.success('Archivos subidos correctamente')
    limpiarFormulario()
    limpiarVistaPrevia()
    await cargarArchivos()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isUploading.value = false
  }
}

const descargarArchivo = async (archivo: ArchivoItem) => {
  try {
    const blob = await archivosService.download(archivo.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = archivo.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const mostrarVistaPrevia = async (archivo: ArchivoItem) => {
  try {
    limpiarVistaPrevia()
    const blob = await archivosService.download(archivo.id)
    archivoSeleccionado.value = archivo
    archivoVistaPrevia.value = URL.createObjectURL(blob)
    previewKind.value = tipoVistaPrevia(archivo)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const cerrarModal = () => {
  if (isUploading.value) return
  limpiarVistaPrevia()
  limpiarFormulario()
  emit('close')
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && props.caso) {
      limpiarFormulario()
      limpiarVistaPrevia()
      await cargarArchivos()
    } else if (!isOpen) {
      limpiarVistaPrevia()
      limpiarFormulario()
      archivosCaso.value = []
    }
  },
  { immediate: true }
)
</script>