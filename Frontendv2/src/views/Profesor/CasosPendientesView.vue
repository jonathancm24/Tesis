<template>
  <section class="casos-pendientes-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Profesor</p>
        <h1>Buzón de casos clínicos</h1>
        <p class="subtitle">
          Revisa, comenta y aprueba los casos clínicos de tus estudiantes
        </p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <span class="stat-icon">📋</span>
          <div class="stat-info">
            <span class="stat-value">{{ estadisticas.enRevision }}</span>
            <span class="stat-label">En Revisión</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">{{ estadisticas.aprobados }}</span>
            <span class="stat-label">Aprobados</span>
          </div>
        </div>
      </div>
    </header>

    <div class="layout">
      <div class="card">
        <div class="card-header">
          <div class="filters-bar">
            <select v-model="filtroEstado" @change="handleFiltroChange">
              <option value="EN_REVISION">En Revisión</option>
              <option value="all">Todos los estados</option>
              <option value="APROBADO">Aprobados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
          </div>
          <div class="summary">
            <span>{{ casos.length }} casos</span>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando casos clínicos...</p>
        </div>

        <!-- Tabla vacía -->
        <div v-else-if="!isLoading && !casos.length" class="empty-state">
          <span class="empty-state-icon">📁</span>
          <p>No hay casos clínicos para revisar</p>
        </div>

        <!-- Lista de casos -->
        <div v-else class="table-wrapper">
          <table class="casos-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Estudiante</th>
                <th>Especialidad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="caso in casos"
                :key="caso.id"
                :class="{ 'active-row': casoSeleccionado?.id === caso.id }"
                @click="handleSelectCaso(caso.id)"
                style="cursor: pointer"
              >
                <td>
                  <div class="patient-info">
                    <span class="patient-name">
                      {{ caso.paciente?.nombre }} {{ caso.paciente?.apellido }}
                    </span>
                    <span class="patient-meta">
                      {{ caso.paciente?.tipoDocumento }} · {{ caso.paciente?.numeroDocumento }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="student-info">
                    <span>{{ caso.estudiante?.nombre }} {{ caso.estudiante?.apellido }}</span>
                  </div>
                </td>
                <td>{{ caso.especialidad?.nombre }}</td>
                <td>{{ formatFecha(caso.fechaCreacion) }}</td>
                <td>
                  <span :class="['badge', `badge-${getEstadoBadge(caso.estado)}`]">
                    {{ getEstadoLabel(caso.estado) }}
                  </span>
                </td>
                <td>
                  <span class="observaciones-count">
                    {{ caso.observaciones?.length || 0 }}
                  </span>
                </td>
                <td class="actions-col">
                  <button
                    class="btn btn-link"
                    type="button"
                    @click.stop="handleVerDetalleCaso(caso.id, caso.paciente?.id)"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside v-if="casoSeleccionado" class="detail-sidebar">
        <!-- Card: Información del Caso -->
        <div class="card info-card">
          <div class="card-header">
            <h3>Detalle del caso</h3>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span :class="['badge', `badge-${getEstadoBadge(casoSeleccionado.estado)}`]">
                {{ getEstadoLabel(casoSeleccionado.estado) }}
              </span>
              <button
                class="btn btn-secondary"
                type="button"
                @click="abrirHistorialPaciente(casoSeleccionado.paciente?.id)"
              >
                Historial paciente
              </button>
            </div>
          </div>

          <div class="info-section">
            <h4>Paciente</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nombre</span>
                <span class="value">
                  {{ casoSeleccionado.paciente?.nombre }} {{ casoSeleccionado.paciente?.apellido }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Documento</span>
                <span class="value">
                  {{ casoSeleccionado.paciente?.tipoDocumento }} ·
                  {{ casoSeleccionado.paciente?.numeroDocumento }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Edad</span>
                <span class="value">{{ calcularEdad(casoSeleccionado.paciente?.fechaNacimiento) }} años</span>
              </div>
              <div class="info-item">
                <span class="label">Género</span>
                <span class="value">{{ casoSeleccionado.paciente?.genero || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>Estudiante</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nombre</span>
                <span class="value">
                  {{ casoSeleccionado.estudiante?.nombre }} {{ casoSeleccionado.estudiante?.apellido }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">{{ casoSeleccionado.estudiante?.email || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>Hallazgos Clínicos</h4>
            <div class="hallazgos-grid">
              <div class="hallazgo-item">
                <strong>Motivo de consulta:</strong>
                <p>{{ casoSeleccionado.motivoConsulta }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Enfermedad actual:</strong>
                <p>{{ casoSeleccionado.enfermedadActual }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>ATM:</strong>
                <p>{{ casoSeleccionado.ATM }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Cara y cuello:</strong>
                <p>{{ casoSeleccionado.CarayCuello }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Piel y mucosa:</strong>
                <p>{{ casoSeleccionado.PielyMucosa }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Cráneo:</strong>
                <p>{{ casoSeleccionado.craneo }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Facies:</strong>
                <p>{{ casoSeleccionado.facies }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Marcha:</strong>
                <p>{{ casoSeleccionado.marcha }}</p>
              </div>
              <div class="hallazgo-item">
                <strong>Medidas:</strong>
                <p>Peso: {{ casoSeleccionado.peso }} kg | Talla: {{ casoSeleccionado.talla }} cm</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Card: Observaciones -->
        <div class="card observaciones-card">
          <div class="card-header">
            <h3>Observaciones</h3>
            <span class="count-badge">{{ casoSeleccionado.observaciones?.length || 0 }}</span>
          </div>

          <div v-if="casoSeleccionado.observaciones && casoSeleccionado.observaciones.length > 0" class="observaciones-list">
            <div
              v-for="obs in casoSeleccionado.observaciones"
              :key="obs.id"
              class="observacion-item"
            >
              <div class="observacion-header">
                <strong>{{ obs.docente?.nombre }} {{ obs.docente?.apellido }}</strong>
                <span class="fecha">{{ formatFecha(obs.fecha) }}</span>
              </div>
              <h5 v-if="obs.titulo">{{ obs.titulo }}</h5>
              <p class="observacion-contenido">{{ obs.descripcion }}</p>
              <p v-if="obs.contenidoDocente" class="observacion-docente">{{ obs.contenidoDocente }}</p>
            </div>
          </div>
          <div v-else class="observaciones-empty">
            <p>No hay observaciones aún</p>
          </div>

          <!-- Formulario para nueva observación -->
          <div v-if="casoSeleccionado.estado === 'EN_REVISION'" class="observacion-form">
            <h4>Agregar observación</h4>
            <textarea
              v-model="nuevaObservacion"
              rows="3"
              placeholder="Escribe tu observación aquí..."
              :disabled="isSavingObservacion"
            ></textarea>
            <button
              class="btn btn-secondary"
              type="button"
              :disabled="!nuevaObservacion.trim() || isSavingObservacion"
              @click="handleAgregarObservacion"
            >
              {{ isSavingObservacion ? 'Guardando...' : 'Agregar Observación' }}
            </button>
          </div>
        </div>

        <!-- Card: Acciones -->
        <div v-if="casoSeleccionado.estado === 'EN_REVISION'" class="card acciones-card">
          <div class="card-header">
            <h3>Decisión</h3>
          </div>
          <div class="acciones-form">
            <div class="form-field">
              <label for="calificacion">Calificación (opcional)</label>
              <input
                id="calificacion"
                v-model.number="calificacion"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>
            <div class="acciones-buttons">
              <button
                class="btn btn-success"
                type="button"
                :disabled="isSaving"
                @click="handleAprobar"
              >
                {{ isSaving ? 'Guardando...' : '✅ Aprobar' }}
              </button>
              <button
                class="btn btn-danger"
                type="button"
                :disabled="isSaving"
                @click="handleRechazar"
              >
                {{ isSaving ? 'Guardando...' : '❌ Rechazar' }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <aside v-else class="detail-sidebar">
        <div class="card empty-state-card">
          <div class="empty-icon">📋</div>
          <p>Selecciona un caso para ver los detalles y tomar acción</p>
        </div>
      </aside>
    </div>

    <HistorialCompletoModal
      :is-open="isHistorialModalOpen"
      :paciente-id="pacienteHistorialId || 0"
      @close="isHistorialModalOpen = false"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import HistorialCompletoModal from '@/components/estudiantes/pacientes/HistorialCompletoModal.vue'
import type { CasoClinico, CasoClinicoListItem, EstadoCasoClinico } from '@/types/casosClinicos.types'
import { getErrorMessage } from '@/utils/errorHandler'

const authStore = useAuthStore()
const toast = useToast()

const casos = ref<CasoClinicoListItem[]>([])
const casoSeleccionado = ref<CasoClinico | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isSavingObservacion = ref(false)
const filtroEstado = ref<string>('EN_REVISION')
const nuevaObservacion = ref('')
const calificacion = ref<number | undefined>()
const isHistorialModalOpen = ref(false)
const pacienteHistorialId = ref<number | null>(null)

const estadisticas = computed(() => {
  const enRevision = casos.value.filter(c => c.estado === 'EN_REVISION').length
  const aprobados = casos.value.filter(c => c.estado === 'APROBADO').length
  return { enRevision, aprobados }
})

const cargarCasos = async () => {
  try {
    isLoading.value = true
    const profesorId = authStore.user?.id
    if (!profesorId) {
      toast.error('No se pudo identificar al profesor')
      return
    }

    const estado = filtroEstado.value === 'all' ? undefined : filtroEstado.value
    casos.value = await casosClinicosService.getByProfesor(profesorId, estado)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const cargarDetalleCaso = async (casoId: number) => {
  try {
    casoSeleccionado.value = await casosClinicosService.getById(casoId)
    calificacion.value = casoSeleccionado.value.calificacion || undefined
  } catch (error) {
    toast.error('No se pudo cargar el detalle del caso')
  }
}

const handleSelectCaso = async (casoId: number) => {
  await cargarDetalleCaso(casoId)
}

const abrirHistorialPaciente = async (pacienteId?: number) => {
  if (!pacienteId) {
    toast.error('No se encontró el paciente para mostrar el historial')
    return
  }

  pacienteHistorialId.value = pacienteId
  isHistorialModalOpen.value = true
}

const handleVerDetalleCaso = async (casoId: number, pacienteId?: number) => {
  await handleSelectCaso(casoId)
  await abrirHistorialPaciente(pacienteId)
}

const handleFiltroChange = async () => {
  await cargarCasos()
  casoSeleccionado.value = null
}

const handleAgregarObservacion = async () => {
  if (!casoSeleccionado.value || !nuevaObservacion.value.trim()) return

  try {
    isSavingObservacion.value = true
    const profesorId = authStore.user?.id
    if (!profesorId) {
      toast.error('No se pudo identificar al profesor')
      return
    }

    await casosClinicosService.createObservacion({
      casoClinicoId: casoSeleccionado.value.id,
      docenteId: profesorId,
      contenido: nuevaObservacion.value.trim()
    })

    toast.success('Observación agregada correctamente')
    nuevaObservacion.value = ''
    
    // Recargar el detalle del caso
    await cargarDetalleCaso(casoSeleccionado.value.id)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isSavingObservacion.value = false
  }
}

const handleAprobar = async () => {
  if (!casoSeleccionado.value) return

  if (!confirm('¿Estás seguro de aprobar este caso clínico?')) return

  try {
    isSaving.value = true
    await casosClinicosService.updateEstado(casoSeleccionado.value.id, {
      estado: 'APROBADO',
      calificacion: calificacion.value
    })

    toast.success('Caso aprobado correctamente')
    await cargarCasos()
    casoSeleccionado.value = null
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isSaving.value = false
  }
}

const handleRechazar = async () => {
  if (!casoSeleccionado.value) return

  if (!nuevaObservacion.value.trim()) {
    toast.error('Debes agregar una observación antes de rechazar el caso')
    return
  }

  if (!confirm('¿Estás seguro de rechazar este caso clínico?')) return

  try {
    isSaving.value = true
    
    // Primero agregar la observación
    await handleAgregarObservacion()
    
    // Luego rechazar el caso
    await casosClinicosService.updateEstado(casoSeleccionado.value.id, {
      estado: 'RECHAZADO',
      calificacion: calificacion.value
    })

    toast.success('Caso rechazado correctamente')
    await cargarCasos()
    casoSeleccionado.value = null
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isSaving.value = false
  }
}

const getEstadoLabel = (estado: EstadoCasoClinico): string => {
  const labels: Record<EstadoCasoClinico, string> = {
    'EN_REVISION': 'En Revisión',
    'EN_TRATAMIENTO': 'En Tratamiento',
    'FINALIZADO': 'Finalizado',
    'APROBADO': 'Aprobado',
    'RECHAZADO': 'Rechazado'
  }
  return labels[estado] || estado
}

const getEstadoBadge = (estado: EstadoCasoClinico): string => {
  const badges: Record<EstadoCasoClinico, string> = {
    'EN_REVISION': 'warning',
    'EN_TRATAMIENTO': 'info',
    'FINALIZADO': 'success',
    'APROBADO': 'success',
    'RECHAZADO': 'danger'
  }
  return badges[estado] || 'muted'
}

const formatFecha = (fecha: Date | string | undefined): string => {
  if (!fecha) return 'N/A'
  const d = new Date(fecha)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const calcularEdad = (fechaNacimiento: Date | string | undefined): number => {
  if (!fechaNacimiento) return 0
  const today = new Date()
  const birthDate = new Date(fechaNacimiento)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

onMounted(() => {
  cargarCasos()
})
</script>

<style scoped src="@/assets/styles/Profesor/CasosPendientes.css"></style>
