<template>
  <section class="pacientes-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Estudiantes</p>
        <h1>Gestión de pacientes</h1>
        <p class="subtitle">
          Crea, visualiza y edita información de los pacientes de la clínica.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" type="button" @click="handleNewPaciente">
          <span class="icon">➕</span>
          Nuevo paciente
        </button>
      </div>
    </header>

    <div class="layout">
      <div class="card">
        <div class="card-header">
          <div class="search-bar">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar por nombre, apellido o email"
              aria-label="Buscar pacientes"
              @input="handleSearch"
            />
            <select v-model="statusFilter" aria-label="Filtrar por estado" @change="handleSearch">
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div class="summary">
            <span>Mostrando {{ pacientes.length }} pacientes</span>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="store.isLoading && !pacientes.length" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando pacientes...</p>
        </div>

        <!-- Tabla vacía -->
        <div v-else-if="!store.isLoading && !pacientes.length" class="empty-state">
          <span class="empty-state-icon">👥</span>
          <p>No hay pacientes registrados</p>
        </div>

        <!-- Tabla de pacientes -->
        <div v-else class="table-wrapper">
          <table class="pacientes-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="paciente in pacientes" 
                :key="paciente.id"
                @click="handleSelectPaciente(paciente)"
                style="cursor: pointer;"
                :class="{ 'active-row': selectedPaciente?.id === paciente.id }"
              >
                <td>
                  <div class="patient-info">
                    <span class="patient-name">{{ paciente.nombre }} {{ paciente.apellido }}</span>
                    <span class="patient-meta">{{ paciente.parroquia?.nombre || 'Sin parroquia' }}</span>
                  </div>
                </td>
                <td>{{ paciente.email || 'No registrado' }}</td>
                <td>{{ paciente.telefono || 'No registrado' }}</td>
                <td>
                  <span class="badge badge-secondary">
                    {{ paciente.tipoDocumento }} · {{ paciente.numeroDocumento }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', paciente.activo ? 'badge-success' : 'badge-muted']">
                    {{ paciente.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions-col">
                  <button
                    class="btn btn-link"
                    type="button"
                    @click="handleEditPaciente(paciente)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="paciente.activo"
                    class="btn btn-link danger"
                    type="button"
                    @click="handleDeletePaciente(paciente.id)"
                    title="Desactivar"
                  >
                    🗑️
                  </button>
                  <button
                    v-else
                    class="btn btn-link success"
                    type="button"
                    @click="handleActivatePaciente(paciente.id)"
                    title="Activar"
                  >
                    ✅
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="summary-sidebar">
        <!-- Estado: Sin paciente seleccionado -->
        <div v-if="!selectedPaciente" class="card empty-state-card">
          <div class="empty-icon">👤</div>
          <p>Selecciona un paciente para ver detalles y gestionar su información</p>
        </div>

        <!-- Estado: Paciente seleccionado -->
        <template v-else>
          <!-- Card: Información del Paciente -->
          <div class="card info-card">
            <div class="paciente-header">
              <div class="paciente-info-main">
                <h2>{{ selectedPaciente.nombre }} {{ selectedPaciente.apellido }}</h2>
                <p class="email">{{ selectedPaciente.email || 'Sin email' }}</p>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">Documento</span>
                <span class="value">{{ selectedPaciente.tipoDocumento }} · {{ selectedPaciente.numeroDocumento }}</span>
              </div>
              <div class="info-item">
                <span class="label">Teléfono</span>
                <span class="value">{{ selectedPaciente.telefono || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Edad</span>
                <span class="value">{{ calcularEdad(selectedPaciente.fechaNacimiento) }} años</span>
              </div>
              <div class="info-item">
                <span class="label">Género</span>
                <span class="value">{{ selectedPaciente.genero || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ocupación</span>
                <span class="value">{{ selectedPaciente.ocupacion || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Estado Civil</span>
                <span class="value">{{ selectedPaciente.estadoCivil || '—' }}</span>
              </div>
            </div>

            <div v-if="selectedPaciente.representante" class="representante-section">
              <h4>Representante</h4>
              <p><strong>{{ selectedPaciente.representante }}</strong> ({{ selectedPaciente.relacionRep }})</p>
              <p class="phone">{{ selectedPaciente.telefonoRep || '—' }}</p>
            </div>
          </div>

          <!-- Card: Antecedentes Médicos Widget -->
          <AntecedentesMedicosWidget
            :paciente-id="selectedPaciente.id"
            :genero="selectedPaciente.genero"
            @encuesta-saved="handleEncuestaSaved"
          />

          <!-- Card: Historial de Casos Widget -->
          <HistorialCasosWidget
            :paciente-id="selectedPaciente.id"
            :casos="getCasosDelPaciente(selectedPaciente.id)"
            @select-caso="handleSelectCaso"
            @open-historial-completo="handleOpenHistorialCompleto"
          />

          <!-- Card: Acciones Rápidas Widget -->
          <AccionesRapidasWidget
            :paciente-id="selectedPaciente.id"
            :puede-crear-caso="puedeCrearCaso(selectedPaciente.id)"
            @accion="handleAccionRapida"
          />
        </template>
      </aside>
    </div>

    <!-- Modal para crear/editar paciente -->
    <PacienteModal
      :is-open="isModalOpen"
      :paciente="editingPaciente"
      @close="isModalOpen = false"
      @success="handleModalSuccess"
    />

    <!-- Modal para agendar cita -->
    <CitasModal
      v-if="selectedPaciente"
      :is-open="isCitaModalOpen"
      :paciente="selectedPaciente"
      @close="isCitaModalOpen = false"
      @cita-creada="handleCitaCreada"
    />

    <HistorialCompletoModal
      v-if="selectedPaciente"
      :is-open="isHistorialModalOpen"
      :paciente-id="selectedPaciente.id"
      @close="isHistorialModalOpen = false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePacientesStore } from '@/stores/Estudiantes/pacientes'
import { useEncuestaTamizajeStore } from '@/stores/Estudiantes/encuestaTamizaje'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import PacienteModal from '@/components/estudiantes/PacienteModal.vue'
import AntecedentesMedicosWidget from '@/components/estudiantes/pacientes/AntecedentesMedicosWidget.vue'
import HistorialCasosWidget from '@/components/estudiantes/pacientes/HistorialCasosWidget.vue'
import HistorialCompletoModal from '@/components/estudiantes/pacientes/HistorialCompletoModal.vue'
import AccionesRapidasWidget from '@/components/estudiantes/pacientes/AccionesRapidasWidget.vue'
import CitasModal from '@/components/estudiantes/pacientes/CitasModal.vue'
import type { Paciente } from '@/types/pacientes.types'
import type { EncuestaProgreso } from '@/types/encuestaTamizaje.types'
import type { CasoClinicoListItem } from '@/types/casosClinicos.types'
import '@/assets/styles/Profesor/Estudiantes.css'

const store = usePacientesStore()
const encuestaStore = useEncuestaTamizajeStore()
const toast = useToast()
const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const selectedPaciente = ref<Paciente | null>(null)
const isModalOpen = ref(false)
const editingPaciente = ref<Paciente | null>(null)
const isCitaModalOpen = ref(false)
const isHistorialModalOpen = ref(false)
const casosDelPaciente = ref<CasoClinicoListItem[]>([])
const loadingCasos = ref(false)

const pacientes = computed(() => store.pacientes)

// Cargar pacientes al montar
onMounted(async () => {
  try {
    await store.fetchPacientes()
    // Cargar todas las preguntas de la encuesta
    if (encuestaStore.todasLasPreguntas.length === 0) {
      await encuestaStore.cargarTodasLasPreguntas()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
})

// Manejar búsqueda con filtros
const handleSearch = async () => {
  try {
    const filters: any = {}

    if (searchTerm.value.trim()) {
      const term = searchTerm.value.trim().toLowerCase()
      filters.nombre = term
    }

    if (statusFilter.value === 'active') {
      filters.activo = true
    } else if (statusFilter.value === 'inactive') {
      filters.activo = false
    }

    await store.fetchPacientes(filters)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// Crear nuevo paciente
const handleNewPaciente = () => {
  editingPaciente.value = null
  isModalOpen.value = true
}

// Editar paciente
const handleEditPaciente = (paciente: Paciente) => {
  editingPaciente.value = paciente
  isModalOpen.value = true
  selectedPaciente.value = paciente
}

// Eliminar (desactivar) paciente
const handleDeletePaciente = async (id: number) => {
  if (!confirm('¿Estás seguro de que deseas desactivar este paciente?')) {
    return
  }

  try {
    await pacientesService.delete(id)
    toast.success('Paciente desactivado correctamente')
    store.removePaciente(id)
    selectedPaciente.value = null
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// Activar paciente
const handleActivatePaciente = async (id: number) => {
  try {
    const updatedPaciente = await pacientesService.activate(id)
    toast.success('Paciente activado correctamente')
    store.updateLocalPaciente(updatedPaciente)
    if (selectedPaciente.value?.id === id) {
      selectedPaciente.value = updatedPaciente
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// Éxito en modal
const handleModalSuccess = async () => {
  toast.success(editingPaciente.value ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente')
  await store.fetchPacientes()
  selectedPaciente.value = null
}

// Seleccionar paciente
const handleSelectPaciente = async (paciente: Paciente) => {
  selectedPaciente.value = paciente
  
  // Cargar la encuesta del paciente seleccionado
  try {
    await encuestaStore.cargarEncuestaPaciente(paciente.id)
  } catch (error) {
    console.error('Error al cargar encuesta:', error)
  }

  // Cargar los casos clínicos del paciente
  await cargarCasosDelPaciente(paciente.id)
}

// Formatear fecha
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Calcular edad a partir de fecha de nacimiento
const calcularEdad = (fechaNacimiento: string | Date | null | undefined): number => {
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

// Obtener progreso de encuesta desde el store
const getEncuestaProgreso = (pacienteId: number): EncuestaProgreso | null => {
  // Retornar el progreso real del store de encuesta
  if (encuestaStore.encuestaPacienteActual && 
      encuestaStore.encuestaPacienteActual.pacienteId === pacienteId) {
    return {
      totalPreguntas: encuestaStore.encuestaPacienteActual.totalPreguntas || 0,
      respuestasCompletadas: encuestaStore.encuestaPacienteActual.respuestasCompletadas || 0,
      porcentaje: encuestaStore.encuestaPacienteActual.porcentaje || 0,
      estado: encuestaStore.encuestaPacienteActual.estado || 'PENDIENTE'
    }
  }
  return null
}

// Cargar casos clínicos del paciente
const cargarCasosDelPaciente = async (pacienteId: number) => {
  try {
    loadingCasos.value = true
    const casos = await casosClinicosService.getByPaciente(pacienteId)
    
    // Mapear a CasoClinicoListItem
    casosDelPaciente.value = casos.map(caso => ({
      id: caso.id,
      fechaCreacion: caso.fechaCreacion,
      estado: caso.estado,
      especialidad: {
        nombre: caso.especialidad?.nombre || 'Sin especialidad'
      },
      profesor: caso.profesor ? {
        nombre: caso.profesor.nombre,
        apellido: caso.profesor.apellido
      } : undefined
    }))
  } catch (error) {
    console.error('Error al cargar casos del paciente:', error)
    casosDelPaciente.value = []
  } finally {
    loadingCasos.value = false
  }
}

// Obtener casos del paciente (reactivo)
const getCasosDelPaciente = (pacienteId: number): CasoClinicoListItem[] => {
  return pacienteId === selectedPaciente.value?.id ? casosDelPaciente.value : []
}

// Determinar si puede crearse un nuevo caso
const puedeCrearCaso = (pacienteId: number): boolean => {
  // TODO: Validar si la encuesta está completada
  // Por ahora, ejemplo: solo si el progreso es 100%
  const encuesta = getEncuestaProgreso(pacienteId)
  return encuesta ? encuesta.estado === 'COMPLETADA' : false
}

// ==================== HANDLERS ====================

// Encuesta guardada
const handleEncuestaSaved = async () => {
  if (selectedPaciente.value) {
    // Recargar la encuesta del paciente para obtener el progreso actualizado
    await encuestaStore.cargarEncuestaPaciente(selectedPaciente.value.id)
    toast.success('Encuesta de tamizaje guardada exitosamente')
  }
}

// Seleccionar un caso clínico
const handleSelectCaso = (casoId: number) => {
  console.log('Seleccionar caso:', casoId)
  toast.info('Abrir página de caso clínico (Por implementar)')
  // TODO: Navegar a página de detalle del caso clínico
}

// Abrir historial completo
const handleOpenHistorialCompleto = () => {
  if (!selectedPaciente.value) {
    toast.error('Seleccione un paciente para ver el historial completo')
    return
  }

  isHistorialModalOpen.value = true
}

// Manejar acciones rápidas
const handleAccionRapida = (accion: 'historial-completo' | 'nueva-cita' | 'nuevo-caso') => {
  switch (accion) {
    case 'historial-completo':
      handleOpenHistorialCompleto()
      break
    case 'nueva-cita':
      if (!selectedPaciente.value) {
        toast.error('Seleccione un paciente antes de agendar una cita')
        return
      }
      isCitaModalOpen.value = true
      break
    case 'nuevo-caso':
      if (!selectedPaciente.value) {
        toast.error('Seleccione un paciente antes de crear un caso clinico')
        return
      }
      if (!puedeCrearCaso(selectedPaciente.value.id)) {
        toast.error('Debe completar la encuesta medica antes de crear un caso')
        return
      }
      router.push({
        name: 'estudiantes-casos-clinicos-nuevo',
        query: { pacienteId: String(selectedPaciente.value.id) }
      })
      break
  }
}

// Manejar cita creada
const handleCitaCreada = async () => {
  isCitaModalOpen.value = false
  // Opcional: recargar datos si es necesario
}
</script>

<style scoped src="@/assets/styles/Profesor/Estudiantes.css"></style>
