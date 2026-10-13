<template>
  <section class="tratamientos-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Estudiantes</p>
        <h1>Tratamientos y prescripciones</h1>
        <p class="subtitle">
          Revisa tus casos clínicos y usa las acciones rápidas para registrar tratamientos, adjuntos y consultar el historial.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" type="button" @click="cargarCasos" :disabled="isLoading">
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
            placeholder="Buscar por paciente o especialidad"
            aria-label="Buscar casos"
          />
          <select v-model="estadoFilter" aria-label="Filtrar por estado">
            <option value="all">Todos</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="EN_TRATAMIENTO">En tratamiento</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>
        <div class="summary">Mostrando {{ casosFiltrados.length }} casos</div>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando casos clínicos...</p>
      </div>

      <div v-else-if="!casosFiltrados.length" class="empty-state">
        <span class="empty-state-icon">📋</span>
        <p>No tienes casos clínicos registrados.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="casos-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Especialidad</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Registros</th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="caso in casosFiltrados"
              :key="caso.id"
              :class="{ 'active-row': selectedCaso?.id === caso.id }"
            >
              <td>
                {{ caso.paciente?.nombre }} {{ caso.paciente?.apellido }}
              </td>
              <td>{{ caso.especialidad?.nombre || 'Sin especialidad' }}</td>
              <td>{{ formatFecha(caso.fechaCreacion) }}</td>
              <td>
                <span :class="['badge', getEstadoBadge(caso.estado)]">
                  {{ getEstadoLabel(caso.estado) }}
                </span>
              </td>
              <td>
                T: {{ caso.tratamientos?.length || 0 }} · P: {{ caso.prescripciones?.length || 0 }}
              </td>
              <td class="actions-col">
                <div class="row-actions">
                  <button
                    class="btn btn-secondary btn-action"
                    type="button"
                    :disabled="esCasoBloqueado(caso.estado)"
                    @click="abrirTratamientoModal(caso)"
                  >
                    Tratamiento
                  </button>
                  <button
                    class="btn btn-secondary btn-action"
                    type="button"
                    :disabled="esCasoBloqueado(caso.estado)"
                    @click="abrirArchivosModal(caso)"
                  >
                    Archivos
                  </button>
                  <button
                    class="btn btn-link btn-action"
                    type="button"
                    @click="abrirHistorialModal(caso)"
                  >
                    Historial
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TratamientoCasoModal
      :is-open="tratamientoModalOpen"
      :caso="selectedCaso"
      @close="tratamientoModalOpen = false"
      @saved="handleTratamientoSaved"
    />

    <ArchivosCasoModal
      :is-open="archivosModalOpen"
      :caso="selectedCaso"
      @close="archivosModalOpen = false"
    />

    <HistorialPacienteModal
      :is-open="historialModalOpen"
      :paciente-id="selectedCaso?.paciente?.id || 0"
      @close="historialModalOpen = false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import type { CasoClinicoListItem, EstadoCasoClinico } from '@/types/casosClinicos.types'
import TratamientoCasoModal from '@/components/estudiantes/tratamientos/TratamientoCasoModal.vue'
import ArchivosCasoModal from '@/components/estudiantes/tratamientos/ArchivosCasoModal.vue'
import HistorialPacienteModal from '@/components/estudiantes/tratamientos/HistorialPacienteModal.vue'
import '@/assets/styles/Estudiantes/Tratamientos.css'

const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref(false)

const casos = ref<CasoClinicoListItem[]>([])
const selectedCaso = ref<CasoClinicoListItem | null>(null)

const searchTerm = ref('')
const estadoFilter = ref<'all' | EstadoCasoClinico>('all')

const tratamientoModalOpen = ref(false)
const archivosModalOpen = ref(false)
const historialModalOpen = ref(false)

const casosFiltrados = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return casos.value.filter((caso) => {
    const byEstado = estadoFilter.value === 'all' || caso.estado === estadoFilter.value
    if (!byEstado) return false

    if (!term) return true

    const paciente = `${caso.paciente?.nombre || ''} ${caso.paciente?.apellido || ''}`.toLowerCase()
    const especialidad = (caso.especialidad?.nombre || '').toLowerCase()

    return paciente.includes(term) || especialidad.includes(term)
  })
})

const cargarCasos = async () => {
  const estudianteId = authStore.user?.id
  if (!estudianteId) {
    toast.error('No se pudo identificar al estudiante')
    return
  }

  try {
    isLoading.value = true
    casos.value = await casosClinicosService.getByEstudiante(estudianteId)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const esCasoBloqueado = (estado: EstadoCasoClinico) => estado === 'RECHAZADO' || estado === 'FINALIZADO'

const abrirTratamientoModal = (caso: CasoClinicoListItem) => {
  if (esCasoBloqueado(caso.estado)) {
    toast.warning('Este caso ya no permite crear tratamientos ni prescripciones')
    return
  }

  selectedCaso.value = caso
  tratamientoModalOpen.value = true
}

const abrirArchivosModal = (caso: CasoClinicoListItem) => {
  if (esCasoBloqueado(caso.estado)) {
    toast.warning('Este caso ya no permite agregar archivos')
    return
  }

  selectedCaso.value = caso
  archivosModalOpen.value = true
}

const abrirHistorialModal = (caso: CasoClinicoListItem) => {
  selectedCaso.value = caso
  historialModalOpen.value = true
}

const handleTratamientoSaved = async () => {
  tratamientoModalOpen.value = false
  await cargarCasos()
}

const getEstadoLabel = (estado: EstadoCasoClinico) => {
  const labels: Record<EstadoCasoClinico, string> = {
    EN_REVISION: 'En revisión',
    EN_TRATAMIENTO: 'En tratamiento',
    FINALIZADO: 'Finalizado',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado'
  }
  return labels[estado] || estado
}

const getEstadoBadge = (estado: EstadoCasoClinico) => {
  const badge: Record<EstadoCasoClinico, string> = {
    EN_REVISION: 'badge-warning',
    EN_TRATAMIENTO: 'badge-info',
    FINALIZADO: 'badge-success',
    APROBADO: 'badge-success',
    RECHAZADO: 'badge-danger'
  }
  return badge[estado] || 'badge-muted'
}

const formatFecha = (fecha: string | Date) => {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  cargarCasos()
})
</script>
