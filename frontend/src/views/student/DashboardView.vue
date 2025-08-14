<!-- 
  Dashboard del Estudiante - Vista Principal de Pacientes
  
  Esta vista muestra un resumen completo de los pacientes asignados al estudiante,
  incluyendo estadísticas generales, filtros de búsqueda y una tabla con información detallada.
  
  Funcionalidades principales:
  - Estadísticas en tiempo real (pacientes, citas, casos, tratamientos)
  - Filtros por estado de caso, tratamiento y especialidad
  - Tabla responsive con información de pacientes y casos activos
  - Modal detallado para mostrar información completa del paciente
  - Integración con backend real mediante studentService
  
  Archivo: src/views/student/DashboardView.vue
-->
<template>
  <div class="dashboard-container">
    <!-- Título y descripción principal -->
    <header class="dashboard-header">
      <h1>Dashboard del Estudiante</h1>
      <p>Gestiona tus pacientes asignados, casos clínicos y próximas citas</p>
    </header>

    <!-- Sección de estadísticas generales -->
    <section class="stats-cards" v-if="!loading.estadisticas">
      <!-- Total de pacientes asignados -->
      <div class="card stat-card green">
        <div class="stat-number">{{ estadisticas.totalPacientes }}</div>
        <div class="stat-label">Pacientes Asignados</div>
        <div class="stat-subtitle">Total bajo tu cuidado</div>
      </div>
      
      <!-- Citas programadas para hoy -->
      <div class="card stat-card blue">
        <div class="stat-number">{{ estadisticas.citasHoy }}</div>
        <div class="stat-label">Citas Hoy</div>
        <div class="stat-subtitle">Programadas para hoy</div>
      </div>
      
      <!-- Casos clínicos activos -->
      <div class="card stat-card purple">
        <div class="stat-number">{{ estadisticas.casosActivos }}</div>
        <div class="stat-label">Casos Activos</div>
        <div class="stat-subtitle">En progreso o revisión</div>
      </div>
      
      <!-- Tratamientos en curso -->
      <div class="card stat-card orange">
        <div class="stat-number">{{ estadisticas.tratamientosEnCurso }}</div>
        <div class="stat-label">Tratamientos Activos</div>
        <div class="stat-subtitle">En curso de ejecución</div>
      </div>
      
      <!-- Casos completados -->
      <div class="card stat-card success">
        <div class="stat-number">{{ estadisticas.casosCompletados }}</div>
        <div class="stat-label">Casos Completados</div>
        <div class="stat-subtitle">Finalizados exitosamente</div>
      </div>
      
      <!-- Promedio de calificaciones (si está disponible) -->
      <div class="card stat-card info" v-if="estadisticas.promedioCalificaciones">
        <div class="stat-number">{{ estadisticas.promedioCalificaciones.toFixed(1) }}</div>
        <div class="stat-label">Promedio</div>
        <div class="stat-subtitle">Calificaciones obtenidas</div>
      </div>
    </section>

    <!-- Indicador de carga para estadísticas -->
    <section class="stats-loading" v-else>
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Cargando estadísticas...</span>
        </div>
        <p class="mt-2 text-muted">Cargando estadísticas...</p>
      </div>
    </section>

    <!-- Barra de filtros y búsqueda -->
    <section class="filter-bar">
      <!-- Campo de búsqueda general -->
      <div class="filter-group">
        <label for="busqueda" class="sr-only">Buscar pacientes</label>
        <input
          id="busqueda"
          v-model="filtros.busqueda"
          type="text"
          placeholder="Buscar por nombre, apellido o documento..."
          class="filter-input"
          @input="aplicarFiltros"
        />
      </div>
      
      <!-- Filtro por estado de caso clínico -->
      <div class="filter-group">
        <label for="estadoCaso" class="sr-only">Estado del caso</label>
        <select 
          id="estadoCaso"
          v-model="filtros.estadoCaso" 
          class="filter-select"
          @change="aplicarFiltros"
        >
          <option value="">Todos los estados de caso</option>
          <option value="EN_PROGRESO">En Progreso</option>
          <option value="EN_REVISION">En Revisión</option>
          <option value="APROBADO">Aprobado</option>
          <option value="FINALIZADO">Finalizado</option>
        </select>
      </div>
      
      <!-- Filtro por especialidad -->
      <div class="filter-group">
        <label for="especialidad" class="sr-only">Especialidad</label>
        <select 
          id="especialidad"
          v-model="filtros.especialidadId" 
          class="filter-select"
          @change="aplicarFiltros"
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
      
      <!-- Filtro por docente supervisor -->
      <div class="filter-group">
        <label for="docente" class="sr-only">Docente supervisor</label>
        <select 
          id="docente"
          v-model="filtros.docenteId" 
          class="filter-select"
          @change="aplicarFiltros"
        >
          <option value="">Todos los docentes</option>
          <option 
            v-for="docente in docentes" 
            :key="docente.id" 
            :value="docente.id"
          >
            {{ docente.nombre }} {{ docente.apellido }}
          </option>
        </select>
      </div>
      
      <!-- Botón para limpiar filtros -->
      <div class="filter-group">
        <button 
          @click="limpiarFiltros" 
          class="btn btn-outline-secondary"
          title="Limpiar todos los filtros"
        >
          <i class="fas fa-eraser"></i>
          Limpiar
        </button>
      </div>
    </section>

    <!-- Tabla principal de pacientes -->
    <div class="table-container" v-if="!loading.pacientes">
      <table class="patients-table table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col">Paciente</th>
            <th scope="col">Caso Activo</th>
            <th scope="col">Estado del Caso</th>
            <th scope="col">Próxima Cita</th>
            <th scope="col">Última Actividad</th>
            <th scope="col" class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Filas de pacientes -->
          <tr v-for="paciente in pacientesFiltrados" :key="paciente.id">
            <!-- Información del paciente -->
            <td class="patient-cell">
              <div class="d-flex align-items-center">
                <!-- Avatar con iniciales -->
                <div class="avatar me-3">
                  {{ obtenerIniciales(paciente.paciente.nombre, paciente.paciente.apellido) }}
                </div>
                <div>
                  <!-- Nombre completo -->
                  <div class="patient-name fw-bold">
                    {{ paciente.paciente.nombre }} {{ paciente.paciente.apellido }}
                  </div>
                  <!-- Información adicional -->
                  <div class="patient-info text-muted small">
                    {{ paciente.paciente.numeroDocumento }} • {{ paciente.paciente.edad }} años
                  </div>
                </div>
              </div>
            </td>
            
            <!-- Caso clínico activo -->
            <td>
              <div v-if="paciente.casoActivo">
                <div class="case-title fw-semibold">
                  {{ paciente.casoActivo.titulo || 'Sin título' }}
                </div>
                <div class="case-specialty text-muted small">
                  {{ paciente.casoActivo.especialidad }}
                </div>
              </div>
              <div v-else class="text-muted">
                Sin caso activo
              </div>
            </td>
            
            <!-- Estado del caso -->
            <td>
              <span 
                v-if="paciente.casoActivo"
                :class="['badge', obtenerClaseEstado(paciente.casoActivo.estado)]"
              >
                {{ formatearEstado(paciente.casoActivo.estado) }}
              </span>
              <span v-else class="badge badge-secondary">
                Sin caso
              </span>
            </td>
            
            <!-- Próxima cita -->
            <td>
              <div v-if="paciente.proximaCita">
                <div class="appointment-date">
                  {{ formatearFecha(paciente.proximaCita.fecha) }}
                </div>
                <div class="appointment-time text-muted small">
                  {{ paciente.proximaCita.hora }}
                </div>
              </div>
              <div v-else class="text-muted">
                Sin cita programada
              </div>
            </td>
            
            <!-- Última actividad -->
            <td>
              <div class="activity-date">
                {{ formatearFecha(paciente.ultimaActividad) }}
              </div>
              <div class="activity-time text-muted small">
                {{ formatearHora(paciente.ultimaActividad) }}
              </div>
            </td>
            
            <!-- Acciones -->
            <td class="text-end">
              <div class="btn-group" role="group" aria-label="Acciones del paciente">
                <!-- Botón para ver detalles -->
                <button
                  @click="abrirModal(paciente)"
                  class="btn btn-sm btn-outline-primary"
                  title="Ver detalles completos"
                >
                  <i class="fas fa-eye"></i>
                  Detalles
                </button>
                
                <!-- Botón para ver caso clínico (si existe) -->
                <button
                  v-if="paciente.casoActivo"
                  @click="verCasoClinico(paciente.casoActivo.id)"
                  class="btn btn-sm btn-outline-info"
                  title="Ver caso clínico"
                >
                  <i class="fas fa-file-medical"></i>
                  Caso
                </button>
              </div>
            </td>
          </tr>
          
          <!-- Mensaje cuando no hay datos -->
          <tr v-if="pacientesFiltrados.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">
              <div class="empty-state">
                <i class="fas fa-search fa-2x mb-3"></i>
                <p class="mb-0">
                  {{ pacientes.length === 0 ? 'No tienes pacientes asignados' : 'No se encontraron pacientes con los filtros aplicados' }}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Indicador de carga para la tabla -->
    <div class="table-loading text-center py-5" v-else>
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Cargando pacientes...</span>
      </div>
      <p class="mt-3 text-muted">Cargando información de pacientes...</p>
    </div>

    <!-- Modal para mostrar detalles del paciente -->
    <div
      class="modal fade"
      :class="{ 'show d-block': pacienteSeleccionado }"
      tabindex="-1"
      aria-labelledby="modalPacienteLabel"
      aria-hidden="true"
      @click.self="cerrarModal"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" v-if="pacienteSeleccionado">
          <!-- Encabezado del modal -->
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="modalPacienteLabel">
              <i class="fas fa-user-circle me-2"></i>
              Información Completa del Paciente
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="cerrarModal"
              aria-label="Cerrar"
            ></button>
          </div>
          
          <!-- Contenido del modal -->
          <div class="modal-body">
            <div class="row">
              <!-- Información personal del paciente -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="card-title mb-0">
                      <i class="fas fa-user me-2"></i>
                      Información Personal
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="patient-avatar mb-3 text-center">
                      <div class="avatar-large">
                        {{ obtenerIniciales(pacienteSeleccionado.paciente.nombre, pacienteSeleccionado.paciente.apellido) }}
                      </div>
                    </div>
                    
                    <dl class="row">
                      <dt class="col-sm-5">Nombre completo:</dt>
                      <dd class="col-sm-7">
                        {{ pacienteSeleccionado.paciente.nombre }} {{ pacienteSeleccionado.paciente.apellido }}
                      </dd>
                      
                      <dt class="col-sm-5">Documento:</dt>
                      <dd class="col-sm-7">{{ pacienteSeleccionado.paciente.numeroDocumento }}</dd>
                      
                      <dt class="col-sm-5">Edad:</dt>
                      <dd class="col-sm-7">{{ pacienteSeleccionado.paciente.edad }} años</dd>
                      
                      <dt class="col-sm-5">Fecha de nacimiento:</dt>
                      <dd class="col-sm-7">{{ formatearFecha(pacienteSeleccionado.paciente.fechaNacimiento) }}</dd>
                      
                      <dt class="col-sm-5" v-if="pacienteSeleccionado.paciente.telefono">Teléfono:</dt>
                      <dd class="col-sm-7" v-if="pacienteSeleccionado.paciente.telefono">
                        <a :href="`tel:${pacienteSeleccionado.paciente.telefono}`">
                          {{ pacienteSeleccionado.paciente.telefono }}
                        </a>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <!-- Información del caso activo -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="card-title mb-0">
                      <i class="fas fa-file-medical me-2"></i>
                      Caso Clínico Activo
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-if="pacienteSeleccionado.casoActivo">
                      <dl class="row">
                        <dt class="col-sm-5">Título:</dt>
                        <dd class="col-sm-7">{{ pacienteSeleccionado.casoActivo.titulo || 'Sin título' }}</dd>
                        
                        <dt class="col-sm-5">Especialidad:</dt>
                        <dd class="col-sm-7">{{ pacienteSeleccionado.casoActivo.especialidad }}</dd>
                        
                        <dt class="col-sm-5">Estado:</dt>
                        <dd class="col-sm-7">
                          <span :class="['badge', obtenerClaseEstado(pacienteSeleccionado.casoActivo.estado)]">
                            {{ formatearEstado(pacienteSeleccionado.casoActivo.estado) }}
                          </span>
                        </dd>
                        
                        <dt class="col-sm-5">Última actualización:</dt>
                        <dd class="col-sm-7">{{ formatearFecha(pacienteSeleccionado.casoActivo.fechaActualizacion) }}</dd>
                      </dl>
                      
                      <div class="mt-3">
                        <button 
                          @click="verCasoClinico(pacienteSeleccionado.casoActivo.id)"
                          class="btn btn-primary btn-sm"
                        >
                          <i class="fas fa-external-link-alt me-2"></i>
                          Ver Caso Completo
                        </button>
                      </div>
                    </div>
                    <div v-else class="text-center text-muted py-4">
                      <i class="fas fa-file-medical fa-3x mb-3 opacity-50"></i>
                      <p>Este paciente no tiene un caso clínico activo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Información adicional en segunda fila -->
            <div class="row mt-4">
              <!-- Próxima cita -->
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="card-title mb-0">
                      <i class="fas fa-calendar-check me-2"></i>
                      Próxima Cita
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-if="pacienteSeleccionado.proximaCita">
                      <dl class="row">
                        <dt class="col-sm-4">Fecha:</dt>
                        <dd class="col-sm-8">{{ formatearFecha(pacienteSeleccionado.proximaCita.fecha) }}</dd>
                        
                        <dt class="col-sm-4">Hora:</dt>
                        <dd class="col-sm-8">{{ pacienteSeleccionado.proximaCita.hora }}</dd>
                        
                        <dt class="col-sm-4">Estado:</dt>
                        <dd class="col-sm-8">
                          <span :class="['badge', obtenerClaseEstadoCita(pacienteSeleccionado.proximaCita.estado)]">
                            {{ formatearEstadoCita(pacienteSeleccionado.proximaCita.estado) }}
                          </span>
                        </dd>
                        
                        <dt class="col-sm-4" v-if="pacienteSeleccionado.proximaCita.motivo">Motivo:</dt>
                        <dd class="col-sm-8" v-if="pacienteSeleccionado.proximaCita.motivo">
                          {{ pacienteSeleccionado.proximaCita.motivo }}
                        </dd>
                      </dl>
                    </div>
                    <div v-else class="text-center text-muted py-3">
                      <i class="fas fa-calendar-times fa-2x mb-2 opacity-50"></i>
                      <p class="mb-0">No hay citas programadas</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Docente supervisor -->
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="card-title mb-0">
                      <i class="fas fa-user-tie me-2"></i>
                      Docente Supervisor
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-if="pacienteSeleccionado.docenteSupervisor">
                      <dl class="row">
                        <dt class="col-sm-4">Nombre:</dt>
                        <dd class="col-sm-8">
                          {{ pacienteSeleccionado.docenteSupervisor.nombre }} {{ pacienteSeleccionado.docenteSupervisor.apellido }}
                        </dd>
                        
                        <dt class="col-sm-4">Email:</dt>
                        <dd class="col-sm-8">
                          <a :href="`mailto:${pacienteSeleccionado.docenteSupervisor.email}`">
                            {{ pacienteSeleccionado.docenteSupervisor.email }}
                          </a>
                        </dd>
                      </dl>
                    </div>
                    <div v-else class="text-center text-muted py-3">
                      <i class="fas fa-user-times fa-2x mb-2 opacity-50"></i>
                      <p class="mb-0">Sin docente asignado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pie del modal -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarModal">
              <i class="fas fa-times me-2"></i>
              Cerrar
            </button>
            <button 
              v-if="pacienteSeleccionado.casoActivo"
              type="button" 
              class="btn btn-primary"
              @click="verCasoClinico(pacienteSeleccionado.casoActivo.id)"
            >
              <i class="fas fa-file-medical me-2"></i>
              Ir al Caso Clínico
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop del modal -->
    <div class="modal-backdrop fade show" v-if="pacienteSeleccionado"></div>

    <!-- Toast para notificaciones -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
/**
 * Script del Dashboard del Estudiante
 * 
 * Maneja toda la lógica de:
 * - Carga de datos desde el backend
 * - Filtrado y búsqueda de pacientes
 * - Estados de carga y error
 * - Navegación entre vistas
 * - Formateo de datos para visualización
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import ToastContainer from '@/components/common/ToastContainer.vue'
import studentService from '@/services/studentService'

// Importar tipos necesarios
import type {
  EstadisticasEstudiante,
  PacienteDashboard,
  EspecialidadBasica,
  DocenteBasico,
  FiltrosDashboard
} from '@/types/student'

// Importar enums como valores (no como types)
import {
  EstadoCasoClinico,
  EstadoCita
} from '@/types/student'

// ========================================
// COMPOSABLES Y SERVICIOS
// ========================================

/** Router para navegación entre vistas */
const router = useRouter()

/** Servicio de notificaciones toast */
const toast = useToast()

// ========================================
// ESTADO REACTIVO
// ========================================

/** Estadísticas generales del estudiante */
const estadisticas = ref<EstadisticasEstudiante>({
  totalPacientes: 0,
  citasHoy: 0,
  casosActivos: 0,
  tratamientosEnCurso: 0,
  casosCompletados: 0,
  citasPendientes: 0
})

/** Lista de pacientes con información resumida */
const pacientes = ref<PacienteDashboard[]>([])

/** Lista de especialidades para filtros */
const especialidades = ref<EspecialidadBasica[]>([])

/** Lista de docentes para filtros */
const docentes = ref<DocenteBasico[]>([])

/** Filtros aplicados actualmente */
const filtros = ref<FiltrosDashboard>({
  busqueda: '',
  estadoCaso: undefined,
  especialidadId: undefined,
  docenteId: undefined
})

/** Paciente seleccionado para mostrar en modal */
const pacienteSeleccionado = ref<PacienteDashboard | null>(null)

/** Estados de carga para diferentes secciones */
const loading = ref({
  estadisticas: true,
  pacientes: true,
  modal: false
})

/** Estado de error global */
const error = ref<string | null>(null)

// ========================================
// COMPUTED PROPERTIES
// ========================================

/**
 * Lista filtrada de pacientes basada en los filtros aplicados
 */
const pacientesFiltrados = computed(() => {
  let resultado = [...pacientes.value]

  // Aplicar filtro de búsqueda por texto
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase().trim()
    resultado = resultado.filter(p => 
      p.paciente.nombre.toLowerCase().includes(busqueda) ||
      p.paciente.apellido.toLowerCase().includes(busqueda) ||
      p.paciente.numeroDocumento.toLowerCase().includes(busqueda)
    )
  }

  // Aplicar filtro por estado de caso clínico
  if (filtros.value.estadoCaso) {
    resultado = resultado.filter(p => 
      p.casoActivo && p.casoActivo.estado === filtros.value.estadoCaso
    )
  }

  // Aplicar filtro por especialidad
  if (filtros.value.especialidadId) {
    resultado = resultado.filter(p => {
      // Buscar en especialidades disponibles para obtener el nombre
      const especialidad = especialidades.value.find(e => e.id === filtros.value.especialidadId)
      return p.casoActivo && p.casoActivo.especialidad === especialidad?.nombre
    })
  }

  // Aplicar filtro por docente
  if (filtros.value.docenteId) {
    resultado = resultado.filter(p => 
      p.docenteSupervisor && p.docenteSupervisor.id === filtros.value.docenteId
    )
  }

  return resultado
})

// ========================================
// MÉTODOS DE CARGA DE DATOS
// ========================================

/**
 * Carga inicial de todos los datos del dashboard
 */
async function cargarDashboard(): Promise<void> {
  try {
    error.value = null
    loading.value.estadisticas = true
    loading.value.pacientes = true

    // Cargar datos del dashboard
    const datosCompletos = await studentService.obtenerDashboard()

    // Actualizar estado reactivo
    estadisticas.value = datosCompletos.estadisticas
    pacientes.value = datosCompletos.pacientes
    especialidades.value = datosCompletos.especialidades
    docentes.value = datosCompletos.docentes

    // Mostrar notificación de éxito si hay datos
    if (datosCompletos.pacientes.length > 0) {
      toast.showSuccess(
        `Dashboard cargado. Se encontraron ${datosCompletos.pacientes.length} pacientes asignados`
      )
    }

  } catch (err) {
    console.error('Error al cargar dashboard:', err)
    error.value = 'No se pudieron cargar los datos del dashboard'
    
    toast.showError(
      'Error al cargar datos. Hubo un problema al obtener la información. Por favor, recarga la página.'
    )
  } finally {
    loading.value.estadisticas = false
    loading.value.pacientes = false
  }
}

/**
 * Recarga solo los datos de pacientes manteniendo filtros
 */
async function recargarPacientes(): Promise<void> {
  try {
    loading.value.pacientes = true
    
    const pacientesActualizados = await studentService.obtenerPacientesDashboard(filtros.value)
    pacientes.value = pacientesActualizados
    
  } catch (err) {
    console.error('Error al recargar pacientes:', err)
    toast.showError('Error: No se pudieron actualizar los datos de pacientes')
  } finally {
    loading.value.pacientes = false
  }
}

// ========================================
// MÉTODOS DE FILTRADO
// ========================================

/**
 * Aplica los filtros actuales y recarga los pacientes
 */
async function aplicarFiltros(): Promise<void> {
  await recargarPacientes()
}

/**
 * Limpia todos los filtros y recarga los datos
 */
async function limpiarFiltros(): Promise<void> {
  filtros.value = {
    busqueda: '',
    estadoCaso: undefined,
    especialidadId: undefined,
    docenteId: undefined
  }
  
  await recargarPacientes()
  
  toast.showInfo('Filtros limpiados: Se han removido todos los filtros aplicados')
}

// ========================================
// MÉTODOS DE MODAL
// ========================================

/**
 * Abre el modal con la información detallada del paciente
 */
function abrirModal(paciente: PacienteDashboard): void {
  pacienteSeleccionado.value = paciente
}

/**
 * Cierra el modal de detalles del paciente
 */
function cerrarModal(): void {
  pacienteSeleccionado.value = null
}

// ========================================
// MÉTODOS DE NAVEGACIÓN
// ========================================

/**
 * Navega a la vista detallada de un caso clínico
 */
function verCasoClinico(casoId: number): void {
  cerrarModal()
  router.push(`/student/cases/${casoId}`)
}

// ========================================
// MÉTODOS DE FORMATEO
// ========================================

/**
 * Obtiene las iniciales de un nombre completo
 */
function obtenerIniciales(nombre: string, apellido: string): string {
  const inicial1 = nombre.charAt(0).toUpperCase()
  const inicial2 = apellido.charAt(0).toUpperCase()
  return `${inicial1}${inicial2}`
}

/**
 * Formatea una fecha para mostrar de manera amigable
 */
function formatearFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formatea una hora para mostrar de manera amigable
 */
function formatearHora(fecha: Date): string {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatea el estado de un caso clínico para mostrar
 */
function formatearEstado(estado: EstadoCasoClinico): string {
  const estados: Record<EstadoCasoClinico, string> = {
    [EstadoCasoClinico.EN_REVISION]: 'En Revisión',
    [EstadoCasoClinico.APROBADO]: 'Aprobado',
    [EstadoCasoClinico.PENDIENTE_ESTUDIOS]: 'Pendiente Estudios',
    [EstadoCasoClinico.EN_TRATAMIENTO]: 'En Tratamiento',
    [EstadoCasoClinico.FINALIZADO]: 'Finalizado',
    [EstadoCasoClinico.CANCELADO]: 'Cancelado'
  }
  
  return estados[estado] || estado
}

/**
 * Formatea el estado de una cita para mostrar
 */
function formatearEstadoCita(estado: EstadoCita): string {
  const estados: Record<EstadoCita, string> = {
    [EstadoCita.DISPONIBLE]: 'Disponible',
    [EstadoCita.RESERVADA]: 'Reservada',
    [EstadoCita.CANCELADA]: 'Cancelada',
    [EstadoCita.FINALIZADA]: 'Finalizada',
    [EstadoCita.NO_ASISTIO]: 'No Asistió'
  }
  
  return estados[estado] || estado
}

/**
 * Obtiene la clase CSS para el estado de un caso clínico
 */
function obtenerClaseEstado(estado: EstadoCasoClinico): string {
  return studentService.obtenerClaseEstadoCaso(estado)
}

/**
 * Obtiene la clase CSS para el estado de una cita
 */
function obtenerClaseEstadoCita(estado: EstadoCita): string {
  return studentService.obtenerClaseEstadoCita(estado)
}

// ========================================
// CICLO DE VIDA DEL COMPONENTE
// ========================================

/**
 * Inicialización del componente
 * Carga todos los datos necesarios para el dashboard
 */
onMounted(async () => {
  await cargarDashboard()
})

// ========================================
// MÉTODOS EXPUESTOS PARA TESTING
// ========================================

// Para facilitar testing, exponemos algunos métodos internos
defineExpose({
  cargarDashboard,
  recargarPacientes,
  aplicarFiltros,
  limpiarFiltros,
  abrirModal,
  cerrarModal,
  verCasoClinico
})
</script>

<style src="@/assets/css/pages/student/Dashboard.css" scoped></style>
