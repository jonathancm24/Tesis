<template>
  <section class="archivos-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Profesor</p>
        <h1>Gestión de archivos</h1>
        <p class="subtitle">
          Carga, visualiza, descarga y administra documentos para estudiantes.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" type="button" @click="fetchArchivos" :disabled="isLoading">
          Recargar
        </button>
      </div>
    </header>

    <div class="card upload-card">
      <div class="card-header">
        <div>
          <h2>Subir archivo</h2>
          <p class="subtitle">Disponible para profesores y administradores.</p>
        </div>
      </div>

      <form class="upload-form" @submit.prevent="handleUpload">
        <div class="form-group">
          <label for="archivo">Archivo</label>
          <input id="archivo" type="file" @change="handleFileSelected" />
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <input
            id="descripcion"
            v-model="uploadDescripcion"
            type="text"
            maxlength="500"
            placeholder="Ejemplo: consentimiento informado, radiografía, etc."
          />
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="isUploading || !selectedFile">
            {{ isUploading ? 'Subiendo...' : 'Subir archivo' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-header card-header-responsive">
        <div class="search-bar">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Buscar por nombre, descripción o usuario"
            aria-label="Buscar archivos"
          />
        </div>
        <div class="summary">Mostrando {{ filteredArchivos.length }} archivos</div>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando archivos...</p>
      </div>

      <div v-else-if="!filteredArchivos.length" class="empty-state">
        <span class="empty-state-icon">📁</span>
        <p>No hay archivos disponibles en esta área.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="archivos-table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Descripción</th>
              <th>Subido por</th>
              <th>Fecha</th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="archivo in filteredArchivos" :key="archivo.id">
              <td>
                <div class="file-main">
                  <span class="file-name">{{ archivo.nombre }}</span>
                  <span class="file-type">{{ archivo.tipo }}</span>
                </div>
              </td>
              <td>{{ archivo.descripcion || 'Sin descripción' }}</td>
              <td>
                {{ archivo.subidoPor.nombre }} {{ archivo.subidoPor.apellido }}
              </td>
              <td>{{ formatDate(archivo.fechaSubida) }}</td>
              <td class="actions-col">
                <button class="btn btn-link" type="button" @click="handleVisualizar(archivo)">
                  Visualizar
                </button>
                <button class="btn btn-link" type="button" @click="handleDescargar(archivo)">
                  Descargar
                </button>
                <button
                  v-if="canDelete(archivo)"
                  class="btn btn-link danger"
                  type="button"
                  @click="handleDelete(archivo)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/utils/errorHandler'
import { archivosService } from '@/services/common/archivos.service'
import type { ArchivoItem } from '@/types/archivos.types'

const authStore = useAuthStore()
const { role } = usePermissions()
const toast = useToast()

const archivos = ref<ArchivoItem[]>([])
const isLoading = ref(false)
const isUploading = ref(false)
const selectedFile = ref<File | null>(null)
const uploadDescripcion = ref('')
const searchTerm = ref('')

const isAdmin = computed(() => role.value === 'ADMIN')

const filteredArchivos = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return archivos.value

  return archivos.value.filter((archivo) => {
    const uploader = `${archivo.subidoPor.nombre} ${archivo.subidoPor.apellido}`.toLowerCase()
    return (
      archivo.nombre.toLowerCase().includes(term) ||
      (archivo.descripcion || '').toLowerCase().includes(term) ||
      uploader.includes(term)
    )
  })
})

onMounted(async () => {
  await fetchArchivos()
})

const fetchArchivos = async () => {
  isLoading.value = true
  try {
    archivos.value = await archivosService.getAreaEstudiantes()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const handleFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.warning('Selecciona un archivo para subir')
    return
  }

  isUploading.value = true
  try {
    await archivosService.uploadAreaEstudiantes(selectedFile.value, uploadDescripcion.value)
    selectedFile.value = null
    uploadDescripcion.value = ''
    toast.success('Archivo subido correctamente')
    await fetchArchivos()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isUploading.value = false
  }
}

const handleDescargar = async (archivo: ArchivoItem) => {
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

const handleVisualizar = async (archivo: ArchivoItem) => {
  try {
    const blob = await archivosService.download(archivo.id)
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 60000)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const canDelete = (archivo: ArchivoItem) => {
  if (isAdmin.value) {
    return true
  }

  return archivo.subidoPor.id === authStore.user?.id
}

const handleDelete = async (archivo: ArchivoItem) => {
  const confirmed = confirm(`¿Deseas eliminar el archivo "${archivo.nombre}"?`)
  if (!confirmed) return

  try {
    await archivosService.remove(archivo.id)
    toast.success('Archivo eliminado correctamente')
    await fetchArchivos()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const formatDate = (value: string) => {
  return new Date(value).toLocaleString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped src="@/assets/styles/Estudiantes/Archivos.css"></style>
