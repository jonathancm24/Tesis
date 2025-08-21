<!-- 
  Componente para gestionar preguntas clínicas por especialidad
  Permite a los profesores crear, editar, visualizar y eliminar preguntas específicas
  @author Sistema de Gestión Clínica
  @version 1.0
-->
<template>
  <div class="questions-management">
    <!-- Header de la página con título y estadísticas -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="fas fa-question-circle" aria-hidden="true"></i>
            Gestión de Preguntas Clínicas
          </h1>
          <p class="page-subtitle">
            Administra las preguntas específicas para los casos clínicos de tu especialidad
          </p>
        </div>
        
        <!-- Estadísticas rápidas -->
        <div class="stats-section" v-if="estadisticas">
          <div class="stat-card">
            <span class="stat-number">{{ estadisticas.totalPreguntas }}</span>
            <span class="stat-label">Total Preguntas</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ estadisticas.preguntasObligatorias }}</span>
            <span class="stat-label">Obligatorias</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ estadisticas.preguntasOpcionales }}</span>
            <span class="stat-label">Opcionales</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y controles -->
    <div class="controls-section">
      <div class="filters-group">
        <!-- Selector de especialidad -->
        <div class="filter-item">
          <label for="especialidad-select" class="filter-label">Especialidad:</label>
          <select 
            id="especialidad-select"
            v-model="filtros.especialidadId" 
            @change="aplicarFiltros"
            class="filter-select"
            :disabled="cargando"
          >
            <option value="">Todas las especialidades</option>
            <option 
              v-for="especialidad in especialidades" 
              :key="especialidad.id" 
              :value="especialidad.id"
            >
              {{ especialidad.nombre }}
            </option>
          </select>
        </div>

        <!-- Selector de tipo de pregunta -->
        <div class="filter-item">
          <label for="tipo-select" class="filter-label">Tipo:</label>
          <select 
            id="tipo-select"
            v-model="filtros.tipo" 
            @change="aplicarFiltros"
            class="filter-select"
            :disabled="cargando"
          >
            <option value="">Todos los tipos</option>
            <option value="TEXTO">Texto</option>
            <option value="OPCION_MULTIPLE">Opción Múltiple</option>
            <option value="VERDADERO_FALSO">Verdadero/Falso</option>
            <option value="NUMERO">Número</option>
            <option value="FECHA">Fecha</option>
            <option value="TEXTO_LARGO">Texto Largo</option>
          </select>
        </div>

        <!-- Filtro obligatoria -->
        <div class="filter-item">
          <label for="obligatoria-select" class="filter-label">Obligatoria:</label>
          <select 
            id="obligatoria-select"
            v-model="filtros.obligatoria" 
            @change="aplicarFiltros"
            class="filter-select"
            :disabled="cargando"
          >
            <option value="">Todas</option>
            <option :value="true">Sí</option>
            <option :value="false">No</option>
          </select>
        </div>

        <!-- Búsqueda de texto -->
        <div class="filter-item search-item">
          <label for="busqueda-input" class="filter-label">Buscar:</label>
          <div class="search-input-group">
            <input 
              id="busqueda-input"
              type="text"
              v-model="filtros.busqueda"
              @input="buscarConDebounce"
              placeholder="Buscar por texto de pregunta..."
              class="search-input"
              :disabled="cargando"
            />
            <i class="fas fa-search search-icon" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="actions-group">
        <button 
          @click="abrirModalCrear" 
          class="btn btn-primary"
          :disabled="cargando || !tieneEspecialidadesAsignadas"
          :title="!tieneEspecialidadesAsignadas ? 'Necesitas tener especialidades asignadas para crear preguntas' : 'Crear nueva pregunta'"
        >
          <i class="fas fa-plus" aria-hidden="true"></i>
          Nueva Pregunta
        </button>
        
        <button 
          @click="limpiarFiltros" 
          class="btn btn-secondary"
          :disabled="cargando"
        >
          <i class="fas fa-eraser" aria-hidden="true"></i>
          Limpiar Filtros
        </button>

        <button 
          @click="exportarPreguntas" 
          class="btn btn-outline"
          :disabled="cargando || !preguntas || preguntas.length === 0"
        >
          <i class="fas fa-download" aria-hidden="true"></i>
          Exportar
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="cargando" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando preguntas...</p>
    </div>

    <!-- Lista de preguntas -->
    <div v-else-if="preguntas && preguntas.length > 0" class="questions-list">
      <div 
        v-for="pregunta in preguntas" 
        :key="pregunta.id"
        class="question-card"
      >
        <div class="question-header">
          <div class="question-info">
            <h3 class="question-text">{{ pregunta.texto }}</h3>
            <div class="question-meta">
              <span class="question-type">
                <i class="fas fa-tag" aria-hidden="true"></i>
                {{ formatearTipoPregunta(pregunta.tipo) }}
              </span>
              <span 
                :class="['question-required', pregunta.obligatoria ? 'required' : 'optional']"
              >
                <i 
                  :class="pregunta.obligatoria ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'" 
                  aria-hidden="true"
                ></i>
                {{ pregunta.obligatoria ? 'Obligatoria' : 'Opcional' }}
              </span>
              <span v-if="pregunta.especialidad" class="question-specialty">
                <i class="fas fa-stethoscope" aria-hidden="true"></i>
                {{ pregunta.especialidad.nombre }}
              </span>
            </div>
          </div>
          
          <div class="question-actions">
            <button 
              @click="editarPregunta(pregunta)"
              class="btn-action btn-edit"
              :title="`Editar pregunta: ${pregunta.texto}`"
            >
              <i class="fas fa-edit" aria-hidden="true"></i>
              <span class="sr-only">Editar</span>
            </button>
            
            <button 
              @click="confirmarEliminar(pregunta)"
              class="btn-action btn-delete"
              :title="`Eliminar pregunta: ${pregunta.texto}`"
            >
              <i class="fas fa-trash" aria-hidden="true"></i>
              <span class="sr-only">Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="pagination-container">
        <nav class="pagination" role="navigation" aria-label="Navegación de páginas">
          <button 
            @click="irAPagina(paginaActual - 1)"
            :disabled="paginaActual <= 1"
            class="pagination-btn pagination-prev"
          >
            <i class="fas fa-chevron-left" aria-hidden="true"></i>
            Anterior
          </button>
          
          <div class="pagination-info">
            Página {{ paginaActual }} de {{ totalPaginas }} 
            ({{ totalPreguntas }} preguntas)
          </div>
          
          <button 
            @click="irAPagina(paginaActual + 1)"
            :disabled="paginaActual >= totalPaginas"
            class="pagination-btn pagination-next"
          >
            Siguiente
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </button>
        </nav>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-question-circle" aria-hidden="true"></i>
      </div>
      <h3 class="empty-title">
        {{ !tieneEspecialidadesAsignadas ? 'Sin especialidades asignadas' : 'No hay preguntas disponibles' }}
      </h3>
      <p class="empty-description">
        {{ !tieneEspecialidadesAsignadas ? 
           'Necesitas tener al menos una especialidad asignada para poder crear preguntas clínicas. Contacta con el administrador para asignar especialidades a tu perfil.' :
           tieneFiltrosActivos ? 
           'No se encontraron preguntas que coincidan con los filtros aplicados.' :
           'Aún no has creado preguntas para esta especialidad. ¡Comienza creando tu primera pregunta!'
        }}
      </p>
      <button 
        v-if="tieneEspecialidadesAsignadas && !tieneFiltrosActivos"
        @click="abrirModalCrear" 
        class="btn btn-primary"
      >
        <i class="fas fa-plus" aria-hidden="true"></i>
        Crear Primera Pregunta
      </button>
      <button 
        v-else-if="tieneFiltrosActivos"
        @click="limpiarFiltros" 
        class="btn btn-secondary"
      >
        <i class="fas fa-eraser" aria-hidden="true"></i>
        Limpiar Filtros
      </button>
    </div>

    <!-- Modal para crear/editar pregunta -->
    <QuestionFormModal
      v-if="mostrarModal"
      :pregunta="preguntaEditando"
      :especialidades="especialidades"
      :modo="modoModal"
      @guardar="guardarPregunta"
      @cancelar="cerrarModal"
    />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal
      v-if="mostrarConfirmacion"
      :titulo="'Confirmar Eliminación'"
      :mensaje="`¿Estás seguro de que deseas eliminar la pregunta: '${preguntaAEliminar?.texto}'?`"
      :tipo="'danger'"
      @confirmar="eliminarPregunta"
      @cancelar="cancelarEliminacion"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { 
  fetchPreguntasConFiltros,
  fetchEstadisticasPreguntas,
  fetchEspecialidadesProfesor,
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta as eliminarPreguntaAPI,
  type PreguntaClinica,
  type FiltrosPregunta,
  type EstadisticasPreguntas,
  TipoPregunta
} from '@/services/questionsService'
import QuestionFormModal from '@/components/professor/QuestionFormModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/store/auth'

// Composables
const { showToast } = useToast()
const authStore = useAuthStore()

// Estado de la aplicación
const cargando = ref(false)
const preguntas = ref<PreguntaClinica[]>([])
const especialidades = ref<{ id: number; nombre: string; descripcion?: string }[]>([])
const estadisticas = ref<EstadisticasPreguntas | null>(null)

// Paginación
const paginaActual = ref(1)
const limitePorPagina = ref(10)
const totalPreguntas = ref(0)

// Filtros
const filtros = ref<FiltrosPregunta>({
  especialidadId: undefined,
  tipo: undefined,
  obligatoria: undefined,
  busqueda: '',
  pagina: 1,
  limite: 10
})

// Modal de creación/edición
const mostrarModal = ref(false)
const modoModal = ref<'crear' | 'editar'>('crear')
const preguntaEditando = ref<PreguntaClinica | null>(null)

// Modal de confirmación
const mostrarConfirmacion = ref(false)
const preguntaAEliminar = ref<PreguntaClinica | null>(null)

// Computed properties
const totalPaginas = computed(() => Math.ceil(totalPreguntas.value / limitePorPagina.value))

const tieneFiltrosActivos = computed(() => {
  return !!(
    filtros.value.especialidadId ||
    filtros.value.tipo ||
    filtros.value.obligatoria !== undefined ||
    (filtros.value.busqueda && filtros.value.busqueda.trim())
  )
})

const tieneEspecialidadesAsignadas = computed(() => {
  return especialidades.value && especialidades.value.length > 0
})

// Watchers
watch(() => filtros.value.especialidadId, () => {
  cargarEstadisticas()
})

// Métodos principales
async function cargarDatos() {
  cargando.value = true
  try {
    await Promise.all([
      cargarPreguntas(),
      cargarEspecialidades(),
      cargarEstadisticas()
    ])
  } catch (error) {
    console.error('Error cargando datos:', error)
    showToast('Error al cargar los datos', 'error')
  } finally {
    cargando.value = false
  }
}

async function cargarPreguntas() {
  try {
    // Si el profesor tiene especialidades específicas, filtrar solo por esas
    const especialidadesIds = especialidades.value.map(e => e.id)
    let filtrosConEspecialidad = { ...filtros.value }
    
    // Si no se ha seleccionado una especialidad específica y el profesor tiene especialidades limitadas
    if (!filtros.value.especialidadId && especialidadesIds.length > 0) {
      // Para profesores con especialidades limitadas, agregar filtro automático
      // Por ahora, no aplicamos filtro automático para permitir ver todas las preguntas
      // pero esto se puede cambiar si se requiere restricción estricta
    }
    
    const response = await fetchPreguntasConFiltros({
      ...filtrosConEspecialidad,
      pagina: paginaActual.value,
      limite: limitePorPagina.value
    })
    
    preguntas.value = response.data || []
    totalPreguntas.value = response.total || 0
  } catch (error) {
    console.error('Error cargando preguntas:', error)
    // En caso de error, asegurar que los arrays estén inicializados
    preguntas.value = []
    totalPreguntas.value = 0
    throw error
  }
}

async function cargarEspecialidades() {
  try {
    // Obtener solo las especialidades asignadas al profesor
    especialidades.value = await fetchEspecialidadesProfesor(authStore.user?.id)
  } catch (error) {
    console.error('Error cargando especialidades:', error)
    throw error
  }
}

async function cargarEstadisticas() {
  try {
    estadisticas.value = await fetchEstadisticasPreguntas(filtros.value.especialidadId)
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
    // No lanzamos el error para que no bloquee la carga principal
  }
}

// Métodos de filtros y búsqueda
async function aplicarFiltros() {
  paginaActual.value = 1
  filtros.value.pagina = 1
  await cargarPreguntas()
}

// Función debounce simple inline para evitar problemas de importación
function createDebounce<T extends (...args: any[]) => any>(func: T, delay: number) {
  let timeoutId: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

const buscarConDebounce = createDebounce(async () => {
  await aplicarFiltros()
}, 500)

function limpiarFiltros() {
  filtros.value = {
    especialidadId: undefined,
    tipo: undefined,
    obligatoria: undefined,
    busqueda: '',
    pagina: 1,
    limite: 10
  }
  paginaActual.value = 1
  cargarPreguntas()
}

// Métodos de paginación
async function irAPagina(pagina: number) {
  if (pagina < 1 || pagina > totalPaginas.value) return
  
  paginaActual.value = pagina
  filtros.value.pagina = pagina
  await cargarPreguntas()
}

// Métodos del modal
function abrirModalCrear() {
  modoModal.value = 'crear'
  preguntaEditando.value = null
  mostrarModal.value = true
}

function editarPregunta(pregunta: PreguntaClinica) {
  modoModal.value = 'editar'
  preguntaEditando.value = { ...pregunta }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  preguntaEditando.value = null
}

async function guardarPregunta(pregunta: PreguntaClinica) {
  try {
    cargando.value = true
    
    // Validar que la especialidad seleccionada esté en las especialidades del profesor
    if (pregunta.especialidadId) {
      const especialidadesProfesor = especialidades.value.map(e => e.id)
      if (especialidadesProfesor.length > 0 && !especialidadesProfesor.includes(pregunta.especialidadId)) {
        showToast('No puedes crear preguntas para especialidades que no tienes asignadas', 'error')
        return
      }
    }
    
    if (modoModal.value === 'crear') {
      await crearPregunta(pregunta)
      showToast('Pregunta creada exitosamente', 'success')
    } else {
      await actualizarPregunta(pregunta.id!, pregunta)
      showToast('Pregunta actualizada exitosamente', 'success')
    }
    
    cerrarModal()
    await cargarDatos()
  } catch (error: any) {
    console.error('Error guardando pregunta:', error)
    showToast(
      error.message || 'Error al guardar la pregunta', 
      'error'
    )
  } finally {
    cargando.value = false
  }
}

// Métodos de eliminación
function confirmarEliminar(pregunta: PreguntaClinica) {
  preguntaAEliminar.value = pregunta
  mostrarConfirmacion.value = true
}

function cancelarEliminacion() {
  mostrarConfirmacion.value = false
  preguntaAEliminar.value = null
}

async function eliminarPregunta() {
  if (!preguntaAEliminar.value) return
  
  try {
    cargando.value = true
    await eliminarPreguntaAPI(preguntaAEliminar.value.id!)
    showToast('Pregunta eliminada exitosamente', 'success')
    
    cancelarEliminacion()
    await cargarDatos()
  } catch (error: any) {
    console.error('Error eliminando pregunta:', error)
    showToast(
      error.message || 'Error al eliminar la pregunta', 
      'error'
    )
  } finally {
    cargando.value = false
  }
}

// Métodos de utilidad
function formatearTipoPregunta(tipo: TipoPregunta): string {
  const tipos = {
    [TipoPregunta.TEXTO]: 'Texto',
    [TipoPregunta.OPCION_MULTIPLE]: 'Opción Múltiple',
    [TipoPregunta.VERDADERO_FALSO]: 'Verdadero/Falso',
    [TipoPregunta.NUMERO]: 'Número',
    [TipoPregunta.FECHA]: 'Fecha',
    [TipoPregunta.TEXTO_LARGO]: 'Texto Largo'
  }
  return tipos[tipo] || tipo
}

function exportarPreguntas() {
  // Verificar que hay preguntas para exportar
  if (!preguntas.value || preguntas.value.length === 0) {
    showToast('No hay preguntas para exportar', 'warning')
    return
  }

  // Implementar exportación a CSV/Excel
  const csv = [
    'Pregunta,Tipo,Obligatoria,Especialidad',
    ...preguntas.value.map(p => 
      `"${p.texto}","${formatearTipoPregunta(p.tipo)}","${p.obligatoria ? 'Sí' : 'No'}","${p.especialidad?.nombre || ''}"`
    )
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'preguntas-clinicas.csv'
  a.click()
  window.URL.revokeObjectURL(url)
  
  showToast('Preguntas exportadas exitosamente', 'success')
}

// Lifecycle
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
@import '@/assets/css/pages/professor/QuestionsManagement.css';
</style>
