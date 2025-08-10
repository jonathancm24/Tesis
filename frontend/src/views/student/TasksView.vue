<!-- src/views/student/TasksView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Tareas</h2>
        <p class="text-muted">Gestiona tus asignaciones y entregables</p>
      </div>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-primary btn-icon-text"
          @click="filtroSeleccionado = ''"
          :class="claseFormaBoton"
        >
          <i class="fas fa-list me-2" aria-hidden="true" v-if="showIcon"></i>
          <span v-if="showText">Todas</span>
        </button>
        <button 
          class="btn btn-primary btn-icon-text" 
          data-bs-toggle="modal" 
          data-bs-target="#modalTarea"
          @click="nuevaTarea"
          :class="claseFormaBoton"
        >
          <i class="fas fa-plus me-2" aria-hidden="true" v-if="showIcon"></i>
          <span v-if="showText">Nueva Tarea</span>
        </button>
      </div>
    </div>

    <!-- Filtros y estadísticas -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div 
          class="card text-center cursor-pointer filter-card"
          :class="{ 'border-warning': filtroSeleccionado === 'pendiente' }"
          @click="filtroSeleccionado = 'pendiente'"
        >
          <div class="card-body">
            <i class="fas fa-clock fa-2x text-warning mb-2" aria-hidden="true"></i>
            <h5 class="card-title">{{ tareasEstadisticas.pendientes }}</h5>
            <p class="card-text text-muted">Pendientes</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div 
          class="card text-center cursor-pointer filter-card"
          :class="{ 'border-info': filtroSeleccionado === 'en_progreso' }"
          @click="filtroSeleccionado = 'en_progreso'"
        >
          <div class="card-body">
            <i class="fas fa-hourglass-half fa-2x text-info mb-2" aria-hidden="true"></i>
            <h5 class="card-title">{{ tareasEstadisticas.enProgreso }}</h5>
            <p class="card-text text-muted">En Progreso</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div 
          class="card text-center cursor-pointer filter-card"
          :class="{ 'border-success': filtroSeleccionado === 'completada' }"
          @click="filtroSeleccionado = 'completada'"
        >
          <div class="card-body">
            <i class="fas fa-check-circle fa-2x text-success mb-2" aria-hidden="true"></i>
            <h5 class="card-title">{{ tareasEstadisticas.completadas }}</h5>
            <p class="card-text text-muted">Completadas</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div 
          class="card text-center cursor-pointer filter-card"
          :class="{ 'border-danger': filtroSeleccionado === 'vencida' }"
          @click="filtroSeleccionado = 'vencida'"
        >
          <div class="card-body">
            <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2" aria-hidden="true"></i>
            <h5 class="card-title">{{ tareasEstadisticas.vencidas }}</h5>
            <p class="card-text text-muted">Vencidas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center g-3">
          <div class="col-lg-4 col-md-6">
            <div class="input-group">
              <input 
                v-model="busqueda" 
                type="text" 
                class="form-control" 
                placeholder="Buscar tareas..."
                aria-label="Buscar tareas"
              >
              <button class="btn btn-outline-secondary btn-icon-text" type="button" @click="forzarBusqueda" aria-label="Buscar" :class="claseFormaBoton">
                <i class="fas fa-search me-1" aria-hidden="true" v-if="showIcon"></i>
                <span v-if="showText">Buscar</span>
              </button>
            </div>
          </div>
          <div class="col-lg-2 col-md-3">
            <select v-model="filtroMateria" class="form-select" aria-label="Filtrar por materia">
              <option value="">Todas las materias</option>
              <option value="operatoria">Operatoria</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="cirugia">Cirugía</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-3">
            <select v-model="filtroPrioridad" class="form-select" aria-label="Filtrar por prioridad">
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6">
            <select v-model="ordenarPor" class="form-select" aria-label="Ordenar por">
              <option value="fecha_vencimiento">Vencimiento</option>
              <option value="prioridad">Prioridad</option>
              <option value="materia">Materia</option>
              <option value="nombre">Nombre</option>
            </select>
          </div>

          <!-- Apariencia -->
          <div class="col-lg-2 col-md-6 text-end">
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-icon-text" data-bs-toggle="dropdown" :class="claseFormaBoton">
                <i class="fas fa-sliders-h me-1" v-if="showIcon"></i>
                <span v-if="showText">Apariencia</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li class="dropdown-header">Contenido</li>
                <li><a class="dropdown-item" href="#" @click.prevent="setModo('icono')"><i class="fas fa-icons me-2"></i>Solo ícono</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="setModo('texto')"><i class="fas fa-font me-2"></i>Solo texto</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="setModo('ambos')"><i class="fas fa-icons me-2"></i><i class="fas fa-font ms-1 me-1"></i>Ícono + texto</a></li>
                <li><hr class="dropdown-divider"></li>
                <li class="dropdown-header">Forma</li>
                <li><a class="dropdown-item" href="#" @click.prevent="setForma('pill')"><i class="fas fa-ellipsis-h me-2"></i>Píldora</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="setForma('rounded')"><i class="fas fa-square me-2"></i>Redondeada</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="setForma('square')"><i class="far fa-square me-2"></i>Cuadrada</a></li>
              </ul>
            </div>
          </div>

          <!-- Toggle Lista/Kanban -->
          <div class="col-12">
            <div class="btn-group" role="group" aria-label="Cambiar vista">
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-icon-text"
                :class="[ { active: vistaActual === 'lista' }, claseFormaBoton ]"
                @click="vistaActual = 'lista'"
              >
                <i class="fas fa-list me-1" aria-hidden="true" v-if="showIcon"></i>
                <span v-if="showText">Lista</span>
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-icon-text"
                :class="[ { active: vistaActual === 'kanban' }, claseFormaBoton ]"
                @click="vistaActual = 'kanban'"
              >
                <i class="fas fa-columns me-1" aria-hidden="true" v-if="showIcon"></i>
                <span v-if="showText">Kanban</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Lista -->
    <div v-if="vistaActual === 'lista'" class="row">
      <div v-for="tarea in tareasFiltradas" :key="tarea.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100 task-card" :class="getCardClass(tarea.estado)">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <span class="badge me-2" :class="getBadgeMateria(tarea.materia)">
                {{ tarea.materia }}
              </span>
              <span class="badge" :class="getBadgePrioridad(tarea.prioridad)">
                {{ tarea.prioridad }}
              </span>
            </div>

            <!-- Acciones principales -->
            <div class="action-toolbar">
              <button 
                class="btn btn-soft-primary btn-sm btn-icon-text"
                :class="claseFormaBoton"
                @click="editarTarea(tarea)"
                :aria-label="`Editar ${tarea.titulo}`"
                title="Editar"
              >
                <i class="fas fa-edit" v-if="showIcon"></i>
                <span v-if="showText">Editar</span>
              </button>

              <button 
                class="btn btn-soft-violet btn-sm btn-icon-text"
                :class="claseFormaBoton"
                @click="duplicarTarea(tarea)"
                :aria-label="`Duplicar ${tarea.titulo}`"
                title="Duplicar"
              >
                <i class="fas fa-copy" v-if="showIcon"></i>
                <span v-if="showText">Duplicar</span>
              </button>

              <button 
                class="btn btn-soft-danger btn-sm btn-icon-text"
                :class="claseFormaBoton"
                @click="confirmarEliminar(tarea.id, tarea.titulo)"
                :aria-label="`Eliminar ${tarea.titulo}`"
                title="Eliminar"
              >
                <i class="fas fa-trash" v-if="showIcon"></i>
                <span v-if="showText">Eliminar</span>
              </button>
            </div>
          </div>

          <div class="card-body">
            <h6 class="card-title mb-2">{{ tarea.titulo }}</h6>
            <p class="card-text text-muted small mb-3">{{ tarea.descripcion }}</p>
            
            <div class="task-meta mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted">
                  <i class="fas fa-calendar me-1" aria-hidden="true"></i>
                  Vence: {{ formatearFecha(tarea.fechaVencimiento) }}
                </small>
                <small :class="getDiasRestantesClass(tarea.fechaVencimiento)">
                  {{ getDiasRestantes(tarea.fechaVencimiento) }}
                </small>
              </div>
              
              <div class="progress mb-2" style="height: 6px;">
                <div 
                  class="progress-bar" 
                  :class="getProgressClass(tarea.progreso)"
                  :style="{ width: tarea.progreso + '%' }"
                ></div>
              </div>

              <!-- Resumen de última revisión (si existe) -->
              <div v-if="tarea.ultimaRevision" class="small mt-2">
                <span class="badge bg-info me-2"><i class="fas fa-clipboard-check me-1"></i>Revisada</span>
                <span class="text-muted">Última revisión: {{ formatearFechaHora(tarea.ultimaRevision.fecha) }}</span>
                <span v-if="tarea.ultimaRevision.puntaje !== null" class="ms-2 text-muted">| Puntaje: {{ tarea.ultimaRevision.puntaje }}%</span>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                <small class="text-muted">{{ tarea.progreso }}% completado</small>
                <div class="task-actions d-flex gap-2">
                  <button 
                    class="btn btn-soft-info btn-sm btn-icon-text"
                    :class="claseFormaBoton"
                    @click="abrirModalRevisar(tarea)"
                  >
                    <i class="fas fa-clipboard-check me-1" aria-hidden="true" v-if="showIcon"></i>
                    <span v-if="showText">Revisar</span>
                  </button>
                  <button 
                    v-if="tarea.estado !== 'completada'"
                    class="btn btn-soft-success btn-sm btn-icon-text"
                    :class="claseFormaBoton"
                    @click="marcarCompletada(tarea.id)"
                  >
                    <i class="fas fa-check me-1" aria-hidden="true" v-if="showIcon"></i>
                    <span v-if="showText">Completar</span>
                  </button>
                  <button 
                    class="btn btn-soft-secondary btn-sm btn-icon-text"
                    :class="claseFormaBoton"
                    @click="verDetalles(tarea)"
                  >
                    <i class="fas fa-eye me-1" aria-hidden="true" v-if="showIcon"></i>
                    <span v-if="showText">Detalles</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="tarea.archivos && tarea.archivos.length > 0" class="task-files">
              <small class="text-muted d-block mb-2">Archivos adjuntos:</small>
              <div class="d-flex flex-wrap gap-1">
                <span 
                  v-for="archivo in tarea.archivos" 
                  :key="archivo" 
                  class="badge bg-light text-dark"
                >
                  <i class="fas fa-paperclip me-1" aria-hidden="true"></i>{{ archivo }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                Creada: {{ formatearFecha(tarea.fechaCreacion) }}
              </small>
              <span class="badge" :class="getBadgeEstado(tarea.estado)">
                {{ getEstadoTexto(tarea.estado) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="tareasFiltradas.length === 0" class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-tasks fa-3x text-muted mb-3" aria-hidden="true"></i>
          <h5 class="text-muted">No se encontraron tareas</h5>
          <p class="text-muted">Crea una nueva tarea o modifica los filtros de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Vista Kanban -->
    <div v-if="vistaActual === 'kanban'" class="row">
      <div v-for="columna in columnasKanban" :key="columna.estado" class="col-lg-3 col-md-6 mb-4">
        <div class="card kanban-column">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">
              <i :class="columna.icono" class="me-2" aria-hidden="true"></i>{{ columna.titulo }}
            </h6>
            <span class="badge bg-secondary">{{ columna.tareas.length }}</span>
          </div>
          <div class="card-body">
            <div v-for="tarea in columna.tareas" :key="tarea.id" class="kanban-task mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-3">
                  <h6 class="card-title mb-2">{{ tarea.titulo }}</h6>
                  <p class="card-text small text-muted mb-2">{{ tarea.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge" :class="getBadgeMateria(tarea.materia)">{{ tarea.materia }}</span>
                    <small :class="getDiasRestantesClass(tarea.fechaVencimiento)">
                      {{ getDiasRestantes(tarea.fechaVencimiento) }}
                    </small>
                  </div>
                  <div class="d-flex flex-wrap justify-content-end mt-2 gap-2">
                    <button class="btn btn-soft-primary btn-sm btn-icon-text" :class="claseFormaBoton" @click="editarTarea(tarea)">
                      <i class="fas fa-edit" v-if="showIcon"></i><span v-if="showText">Editar</span>
                    </button>
                    <button class="btn btn-soft-violet btn-sm btn-icon-text" :class="claseFormaBoton" @click="duplicarTarea(tarea)">
                      <i class="fas fa-copy" v-if="showIcon"></i><span v-if="showText">Duplicar</span>
                    </button>
                    <button class="btn btn-soft-danger btn-sm btn-icon-text" :class="claseFormaBoton" @click="confirmarEliminar(tarea.id, tarea.titulo)">
                      <i class="fas fa-trash" v-if="showIcon"></i><span v-if="showText">Eliminar</span>
                    </button>
                    <button class="btn btn-soft-info btn-sm btn-icon-text" :class="claseFormaBoton" @click="abrirModalRevisar(tarea)">
                      <i class="fas fa-clipboard-check" v-if="showIcon"></i><span v-if="showText">Revisar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="columna.tareas.length === 0" class="text-center text-muted py-3">
              <i class="fas fa-plus-circle fa-2x mb-2" aria-hidden="true"></i>
              <p class="small">No hay tareas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Nueva/Editar Tarea -->
  <div class="modal fade" id="modalTarea" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ tareaEditando ? 'Editar Tarea' : 'Nueva Tarea' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarTarea">
            <div class="row">
              <div class="col-md-8 mb-3">
                <label class="form-label">Título *</label>
                <input 
                  v-model="formTarea.titulo" 
                  type="text" 
                  class="form-control" 
                  placeholder="Título de la tarea"
                  required
                >
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Prioridad</label>
                <select v-model="formTarea.prioridad" class="form-select">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Materia</label>
                <select v-model="formTarea.materia" class="form-select">
                  <option value="operatoria">Operatoria</option>
                  <option value="endodoncia">Endodoncia</option>
                  <option value="periodoncia">Periodoncia</option>
                  <option value="cirugia">Cirugía</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha de Vencimiento</label>
                <input 
                  v-model="formTarea.fechaVencimiento" 
                  type="date" 
                  class="form-control"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="formTarea.descripcion" 
                class="form-control" 
                rows="3"
                placeholder="Descripción detallada de la tarea"
              ></textarea>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Estado</label>
                <select v-model="formTarea.estado" class="form-select">
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Progreso (%)</label>
                <input 
                  v-model.number="formTarea.progreso" 
                  type="range" 
                  class="form-range" 
                  min="0" 
                  max="100"
                >
                <div class="text-center small text-muted">{{ formTarea.progreso }}%</div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-soft-secondary btn-icon-text" data-bs-dismiss="modal" :class="claseFormaBoton">
            <i class="fas fa-times me-1" aria-hidden="true" v-if="showIcon"></i><span v-if="showText">Cancelar</span>
          </button>
          <button type="button" class="btn btn-soft-primary btn-icon-text" @click="guardarTarea" :class="claseFormaBoton">
            <i class="fas fa-save me-1" aria-hidden="true" v-if="showIcon"></i>
            <span v-if="showText">{{ tareaEditando ? 'Actualizar' : 'Crear' }} Tarea</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Revisar Tarea -->
  <div class="modal fade" id="modalRevisar" tabindex="-1" aria-labelledby="modalRevisarLabel">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="modalRevisarLabel" class="modal-title">Revisar Tarea</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body" v-if="tareaRevisando">
          <div class="mb-2">
            <strong>{{ tareaRevisando.titulo }}</strong>
            <div class="small text-muted">
              <span class="badge me-1" :class="getBadgeMateria(tareaRevisando.materia)">{{ tareaRevisando.materia }}</span>
              <span class="badge" :class="getBadgePrioridad(tareaRevisando.prioridad)">Prioridad: {{ tareaRevisando.prioridad }}</span>
            </div>
          </div>

          <hr>

          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="chkCumple" v-model="formRevision.cumple">
            <label class="form-check-label" for="chkCumple">Cumple con los requisitos</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="chkArchivos" v-model="formRevision.archivosCompletos">
            <label class="form-check-label" for="chkArchivos">Archivos adjuntos completos</label>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="chkCorreccion" v-model="formRevision.necesitaCorreccion">
            <label class="form-check-label" for="chkCorreccion">Necesita corrección</label>
          </div>

          <div class="mb-3">
            <label class="form-label">Comentarios</label>
            <textarea v-model="formRevision.comentarios" class="form-control" rows="3" placeholder="Observaciones o feedback"></textarea>
          </div>

          <div class="mb-1">
            <label class="form-label">Puntaje: <strong>{{ formRevision.puntaje }}%</strong></label>
            <input type="range" class="form-range" min="0" max="100" v-model.number="formRevision.puntaje">
          </div>

          <div class="alert alert-info py-2 small" v-if="formRevision.necesitaCorreccion">
            <i class="fas fa-info-circle me-1"></i> Al necesitar corrección, la tarea permanecerá <strong>En Progreso</strong>.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-soft-secondary btn-icon-text" data-bs-dismiss="modal" :class="claseFormaBoton">
            <i class="fas fa-times me-1" v-if="showIcon"></i><span v-if="showText">Cancelar</span>
          </button>
          <button class="btn btn-soft-primary btn-icon-text" @click="guardarRevision" :class="claseFormaBoton">
            <i class="fas fa-save me-1" v-if="showIcon"></i><span v-if="showText">Guardar revisión</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

type ModoBoton = 'icono' | 'texto' | 'ambos';
type FormaBoton = 'pill' | 'rounded' | 'square';

interface Revision {
  fecha: Date;
  puntaje: number | null;
  comentarios: string;
  necesitaCorreccion: boolean;
}

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  materia: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
  progreso: number;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  archivos?: string[];
  ultimaRevision?: Revision | null;
}

interface FormTarea {
  titulo: string;
  descripcion: string;
  materia: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'en_progreso' | 'completada';
  progreso: number;
  fechaVencimiento: string;
}

interface FormRevision {
  cumple: boolean;
  archivosCompletos: boolean;
  necesitaCorreccion: boolean;
  comentarios: string;
  puntaje: number;
}

/* ======== Apariencia de botones ======== */
const modoBotones = ref<ModoBoton>('ambos');
const formaBoton = ref<FormaBoton>('pill');
const showIcon = computed(() => modoBotones.value !== 'texto');
const showText = computed(() => modoBotones.value !== 'icono');
const claseFormaBoton = computed(() => ({
  'btn-shape-pill': formaBoton.value === 'pill',
  'btn-shape-rounded': formaBoton.value === 'rounded',
  'btn-shape-square': formaBoton.value === 'square',
}));
const setModo = (m: ModoBoton) => (modoBotones.value = m);
const setForma = (f: FormaBoton) => (formaBoton.value = f);

/* ======== Estados principales ======== */
const busqueda = ref('');
const filtroSeleccionado = ref('');
const filtroMateria = ref('');
const filtroPrioridad = ref('');
const ordenarPor = ref('fecha_vencimiento');
const vistaActual = ref<'lista' | 'kanban'>('lista');
const tareaEditando = ref<Tarea | null>(null);

// Modal revisar
const tareaRevisando = ref<Tarea | null>(null);
const formRevision = ref<FormRevision>({
  cumple: false,
  archivosCompletos: false,
  necesitaCorreccion: false,
  comentarios: '',
  puntaje: 0
});

const formTarea = ref<FormTarea>({
  titulo: '',
  descripcion: '',
  materia: 'operatoria',
  prioridad: 'media',
  estado: 'pendiente',
  progreso: 0,
  fechaVencimiento: ''
});

// Datos de ejemplo
const tareas = ref<Tarea[]>([
  {
    id: 1,
    titulo: 'Ensayo sobre Técnicas de Operatoria',
    descripcion: 'Redactar ensayo de 1500 palabras sobre técnicas modernas de operatoria dental',
    materia: 'operatoria',
    prioridad: 'alta',
    estado: 'en_progreso',
    progreso: 60,
    fechaCreacion: new Date('2025-01-20'),
    fechaVencimiento: new Date('2025-02-15'),
    archivos: ['referencias.pdf', 'borrador.docx'],
    ultimaRevision: null
  },
  {
    id: 2,
    titulo: 'Práctica de Endodoncia',
    descripcion: 'Completar 3 casos prácticos de tratamiento endodóntico',
    materia: 'endodoncia',
    prioridad: 'alta',
    estado: 'pendiente',
    progreso: 0,
    fechaCreacion: new Date('2025-01-25'),
    fechaVencimiento: new Date('2025-02-20'),
    ultimaRevision: null
  },
  {
    id: 3,
    titulo: 'Examen de Periodoncia',
    descripcion: 'Preparar para examen parcial de periodoncia',
    materia: 'periodoncia',
    prioridad: 'media',
    estado: 'completada',
    progreso: 100,
    fechaCreacion: new Date('2025-01-10'),
    fechaVencimiento: new Date('2025-02-01'),
    ultimaRevision: { fecha: new Date('2025-02-01T10:00:00'), puntaje: 95, comentarios: '¡Excelente trabajo!', necesitaCorreccion: false }
  },
  {
    id: 4,
    titulo: 'Investigación sobre Implantes',
    descripcion: 'Investigar y presentar sobre las últimas tendencias en implantología',
    materia: 'cirugia',
    prioridad: 'baja',
    estado: 'vencida',
    progreso: 30,
    fechaCreacion: new Date('2025-01-05'),
    fechaVencimiento: new Date('2025-01-30'),
    ultimaRevision: null
  }
]);

/* ======== Computed ======== */
const tareasEstadisticas = computed(() => ({
  pendientes: tareas.value.filter(t => t.estado === 'pendiente').length,
  enProgreso: tareas.value.filter(t => t.estado === 'en_progreso').length,
  completadas: tareas.value.filter(t => t.estado === 'completada').length,
  vencidas: tareas.value.filter(t => t.estado === 'vencida').length
}));

const tareasFiltradas = computed(() => {
  let filtradas = [...tareas.value];

  if (filtroSeleccionado.value) filtradas = filtradas.filter(t => t.estado === filtroSeleccionado.value);
  if (filtroMateria.value) filtradas = filtradas.filter(t => t.materia === filtroMateria.value);
  if (filtroPrioridad.value) filtradas = filtradas.filter(t => t.prioridad === filtroPrioridad.value);

  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    filtradas = filtradas.filter(t =>
      t.titulo.toLowerCase().includes(termino) ||
      t.descripcion.toLowerCase().includes(termino)
    );
  }

  filtradas.sort((a, b) => {
    switch (ordenarPor.value) {
      case 'prioridad': {
        const order: Record<'alta'|'media'|'baja', number> = { alta: 3, media: 2, baja: 1 };
        return order[b.prioridad] - order[a.prioridad];
      }
      case 'materia': return a.materia.localeCompare(b.materia);
      case 'nombre': return a.titulo.localeCompare(b.titulo);
      default: return a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime();
    }
  });

  return filtradas;
});

const columnasKanban = computed(() => {
  const estados: Array<Tarea['estado']> = ['pendiente', 'en_progreso', 'completada', 'vencida'];
  return estados.map(estado => ({
    estado,
    titulo: getEstadoTexto(estado),
    icono: getIconoEstado(estado),
    tareas: tareasFiltradas.value.filter(t => t.estado === estado)
  }));
});

/* ======== Utilitarios ======== */
const forzarBusqueda = () => console.log('Buscar:', busqueda.value);
const formatearFecha = (fecha: Date) => fecha.toLocaleDateString('es-ES');
const formatearFechaHora = (fecha: Date) => fecha.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

const getDiasRestantes = (fechaVencimiento: Date) => {
  const hoy = new Date();
  const diferencia = fechaVencimiento.getTime() - hoy.getTime();
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  if (dias < 0) return `${Math.abs(dias)} días vencida`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días restantes`;
};

const getDiasRestantesClass = (fechaVencimiento: Date) => {
  const hoy = new Date();
  const diferencia = fechaVencimiento.getTime() - hoy.getTime();
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'text-danger fw-bold';
  if (dias <= 3) return 'text-warning fw-bold';
  return 'text-muted';
};

const getCardClass = (estado: Tarea['estado']) => ({
  'border-warning': estado === 'pendiente',
  'border-info':    estado === 'en_progreso',
  'border-success': estado === 'completada',
  'border-danger':  estado === 'vencida'
});

const getBadgeEstado = (estado: Tarea['estado']) => ({
  'pendiente': 'bg-warning',
  'en_progreso': 'bg-info',
  'completada': 'bg-success',
  'vencida': 'bg-danger'
}[estado] || 'bg-secondary');

const getBadgeMateria = (materia: string) => ({
  'operatoria': 'bg-primary',
  'endodoncia': 'bg-success',
  'periodoncia': 'bg-warning',
  'cirugia': 'bg-danger'
}[materia] || 'bg-secondary');

const getBadgePrioridad = (prioridad: Tarea['prioridad']) => ({
  'alta': 'bg-danger',
  'media': 'bg-warning',
  'baja': 'bg-success'
}[prioridad] || 'bg-secondary');

const getProgressClass = (progreso: number) => {
  if (progreso === 100) return 'bg-success';
  if (progreso >= 75) return 'bg-info';
  if (progreso >= 50) return 'bg-warning';
  return 'bg-danger';
};

const getEstadoTexto = (estado: Tarea['estado']) => ({
  'pendiente': 'Pendiente',
  'en_progreso': 'En Progreso',
  'completada': 'Completada',
  'vencida': 'Vencida'
}[estado] || estado);

const getIconoEstado = (estado: Tarea['estado']) => ({
  'pendiente': 'fas fa-clock',
  'en_progreso': 'fas fa-hourglass-half',
  'completada': 'fas fa-check-circle',
  'vencida': 'fas fa-exclamation-triangle'
}[estado] || 'fas fa-tasks');

/* ======== CRUD / Acciones ======== */
const nuevaTarea = () => {
  tareaEditando.value = null;
  formTarea.value = {
    titulo: '',
    descripcion: '',
    materia: 'operatoria',
    prioridad: 'media',
    estado: 'pendiente',
    progreso: 0,
    fechaVencimiento: ''
  };
  abrirModal('modalTarea');
};

const editarTarea = (tarea: Tarea) => {
  tareaEditando.value = tarea;
  formTarea.value = {
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    materia: tarea.materia,
    prioridad: tarea.prioridad,
    estado: tarea.estado === 'vencida' ? 'pendiente' : tarea.estado,
    progreso: tarea.progreso,
    fechaVencimiento: tarea.fechaVencimiento.toISOString().split('T')[0]
  };
  abrirModal('modalTarea');
};

const guardarTarea = () => {
  if (tareaEditando.value) {
    const index = tareas.value.findIndex(t => t.id === tareaEditando.value!.id);
    if (index !== -1) {
      tareas.value[index] = {
        ...tareas.value[index],
        titulo: formTarea.value.titulo,
        descripcion: formTarea.value.descripcion,
        materia: formTarea.value.materia,
        prioridad: formTarea.value.prioridad,
        estado: formTarea.value.estado,
        progreso: formTarea.value.progreso,
        fechaVencimiento: new Date(formTarea.value.fechaVencimiento)
      };
    }
  } else {
    const nuevoId = tareas.value.length ? Math.max(...tareas.value.map(t => t.id)) + 1 : 1;
    const nuevaTarea: Tarea = {
      id: nuevoId,
      titulo: formTarea.value.titulo,
      descripcion: formTarea.value.descripcion,
      materia: formTarea.value.materia,
      prioridad: formTarea.value.prioridad,
      estado: formTarea.value.estado,
      progreso: formTarea.value.progreso,
      fechaCreacion: new Date(),
      fechaVencimiento: new Date(formTarea.value.fechaVencimiento),
      ultimaRevision: null
    };
    tareas.value.push(nuevaTarea);
  }
  cerrarModal('modalTarea');
  console.log('Tarea guardada');
};

const duplicarTarea = (tarea: Tarea) => {
  const nuevoId = tareas.value.length ? Math.max(...tareas.value.map(t => t.id)) + 1 : 1;
  const nuevaTarea: Tarea = {
    ...tarea,
    id: nuevoId,
    titulo: `${tarea.titulo} (Copia)`,
    estado: 'pendiente',
    progreso: 0,
    fechaCreacion: new Date(),
    ultimaRevision: null
  };
  tareas.value.push(nuevaTarea);
  console.log('Tarea duplicada');
};

const confirmarEliminar = (id: number, titulo: string) => {
  if (confirm(`¿Eliminar la tarea "${titulo}"?`)) {
    eliminarTarea(id);
  }
};

const eliminarTarea = (id: number) => {
  const index = tareas.value.findIndex(t => t.id === id);
  if (index !== -1) {
    tareas.value.splice(index, 1);
    console.log('Tarea eliminada');
  }
};

const marcarCompletada = (id: number) => {
  const tarea = tareas.value.find(t => t.id === id);
  if (tarea) {
    tarea.estado = 'completada';
    tarea.progreso = 100;
    tarea.ultimaRevision = {
      fecha: new Date(),
      puntaje: tarea.ultimaRevision?.puntaje ?? null,
      comentarios: tarea.ultimaRevision?.comentarios ?? '',
      necesitaCorreccion: false
    };
    console.log('Tarea marcada como completada');
  }
};

const verDetalles = (tarea: Tarea) => {
  console.log('Ver detalles de tarea:', tarea.titulo);
};

/* ======== Revisar ======== */
const abrirModalRevisar = (tarea: Tarea) => {
  tareaRevisando.value = tarea;
  formRevision.value = {
    cumple: tarea.progreso >= 70,
    archivosCompletos: (tarea.archivos?.length || 0) > 0,
    necesitaCorreccion: false,
    comentarios: tarea.ultimaRevision?.comentarios || '',
    puntaje: typeof tarea.ultimaRevision?.puntaje === 'number' ? tarea.ultimaRevision!.puntaje : Math.min(100, Math.max(0, tarea.progreso))
  };
  abrirModal('modalRevisar');
};

const guardarRevision = () => {
  if (!tareaRevisando.value) return;
  const t = tareaRevisando.value;
  t.ultimaRevision = {
    fecha: new Date(),
    puntaje: formRevision.value.puntaje,
    comentarios: formRevision.value.comentarios,
    necesitaCorreccion: formRevision.value.necesitaCorreccion
  };
  if (!formRevision.value.necesitaCorreccion && formRevision.value.cumple && formRevision.value.archivosCompletos) {
    t.estado = 'completada';
    t.progreso = 100;
  } else if (t.estado === 'pendiente') {
    t.estado = 'en_progreso';
  }
  cerrarModal('modalRevisar');
  tareaRevisando.value = null;
  console.log('Revisión guardada');
};

/* ======== Helpers de modal (Bootstrap) ======== */
const abrirModal = (id: string) => {
  const el = document.getElementById(id) as any;
  const bs = (window as any).bootstrap;
  if (bs?.Modal && el) bs.Modal.getOrCreateInstance(el).show();
};
const cerrarModal = (id: string) => {
  const el = document.getElementById(id) as any;
  const bs = (window as any).bootstrap;
  if (bs?.Modal && el) bs.Modal.getInstance(el)?.hide();
};

onMounted(() => {
  console.log('Vista de tareas cargada');
  // Actualizar estados de tareas vencidas
  const hoy = new Date();
  tareas.value.forEach(tarea => {
    if (tarea.fechaVencimiento < hoy && tarea.estado !== 'completada') {
      tarea.estado = 'vencida';
    }
  });
});
</script>

<style scoped>
/* Utilidad: icono + texto alineados */
.btn-icon-text {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
}

/* Formas */
.btn-shape-pill { border-radius: 999px; }
.btn-shape-rounded { border-radius: .5rem; }
.btn-shape-square { border-radius: .25rem; }

/* Botones “soft” (colores suaves) */
.btn-soft-primary { background: rgba(13,110,253,0.12); color: #0d6efd; border: 1px solid rgba(13,110,253,0.15); }
.btn-soft-secondary { background: rgba(108,117,125,0.12); color: #6c757d; border: 1px solid rgba(108,117,125,0.15); }
.btn-soft-success { background: rgba(25,135,84,0.12); color: #198754; border: 1px solid rgba(25,135,84,0.15); }
.btn-soft-danger { background: rgba(220,53,69,0.12); color: #dc3545; border: 1px solid rgba(220,53,69,0.15); }
.btn-soft-warning { background: rgba(255,193,7,0.12); color: #b88600; border: 1px solid rgba(255,193,7,0.15); }
.btn-soft-info { background: rgba(13,202,240,0.12); color: #0aa2c0; border: 1px solid rgba(13,202,240,0.15); }
/* Violeta adicional */
.btn-soft-violet { background: rgba(111,66,193,0.12); color: #6f42c1; border: 1px solid rgba(111,66,193,0.15); }

.btn-soft-primary:hover,
.btn-soft-secondary:hover,
.btn-soft-success:hover,
.btn-soft-danger:hover,
.btn-soft-warning:hover,
.btn-soft-info:hover,
.btn-soft-violet:hover {
  filter: brightness(0.98);
}

/* Tarjetas y animaciones */
.filter-card { transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out; cursor: pointer; }
.filter-card:hover { transform: translateY(-2px); }

.task-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
.task-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.task-meta { border-top: 1px solid #dee2e6; padding-top: 0.75rem; }

.action-toolbar { display: flex; gap: .35rem; flex-wrap: wrap; }

.kanban-column { min-height: 500px; }
.kanban-task { cursor: pointer; transition: transform 0.2s ease-in-out; }
.kanban-task:hover { transform: translateX(4px); }

.cursor-pointer { cursor: pointer; }

/* Accesibilidad: aumentar área de click en botones pequeños */
.btn-sm { padding: .35rem .55rem; }
</style>
