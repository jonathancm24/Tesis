<template>
  <section class="archivos-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Estudiantes</p>
        <h1>Biblioteca de archivos</h1>
        <p class="subtitle">
          Consulta y descarga documentos compartidos por profesores y administradores.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" type="button" @click="fetchArchivos" :disabled="isLoading">
          Recargar
        </button>
      </div>
    </header>

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
import { getErrorMessage } from '@/utils/errorHandler'
import { archivosService } from '@/services/common/archivos.service'
import type { ArchivoItem } from '@/types/archivos.types'

const toast = useToast()

const archivos = ref<ArchivoItem[]>([])
const isLoading = ref(false)
const searchTerm = ref('')

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
