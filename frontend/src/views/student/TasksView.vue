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
          class="btn btn-outline-primary"
          @click="filtroSeleccionado = ''"
        >
          <i class="fas fa-list me-2"></i>Todas
        </button>
        <button 
          class="btn btn-primary" 
          data-bs-toggle="modal" 
          data-bs-target="#modalTarea"
          @click="nuevaTarea"
        >
          <i class="fas fa-plus me-2"></i>Nueva Tarea
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
            <i class="fas fa-clock fa-2x text-warning mb-2"></i>
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
            <i class="fas fa-hourglass-half fa-2x text-info mb-2"></i>
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
            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
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
            <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
            <h5 class="card-title">{{ tareasEstadisticas.vencidas }}</h5>
            <p class="card-text text-muted">Vencidas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-lg-4 col-md-6 mb-3 mb-lg-0">
            <div class="input-group">
              <input 
                v-model="busqueda" 
                type="text" 
                class="form-control" 
                placeholder="Buscar tareas..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-lg-2 col-md-3 mb-3 mb-lg-0">
            <select v-model="filtroMateria" class="form-select">
              <option value="">Todas las materias</option>
              <option value="operatoria">Operatoria</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="cirugia">Cirugía</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-3 mb-3 mb-lg-0">
            <select v-model="filtroPrioridad" class="form-select">
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6 mb-3 mb-lg-0">
            <select v-model="ordenarPor" class="form-select">
              <option value="fecha_vencimiento">Vencimiento</option>
              <option value="prioridad">Prioridad</option>
              <option value="materia">Materia</option>
              <option value="nombre">Nombre</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6">
            <div class="btn-group w-100" role="group">
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                :class="{ active: vistaActual === 'lista' }"
                @click="vistaActual = 'lista'"
              >
                <i class="fas fa-list"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                :class="{ active: vistaActual === 'kanban' }"
                @click="vistaActual = 'kanban'"
              >
                <i class="fas fa-columns"></i>
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
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="editarTarea(tarea)">
                  <i class="fas fa-edit me-2"></i>Editar
                </a></li>
                <li><a class="dropdown-item" href="#" @click="duplicarTarea(tarea)">
                  <i class="fas fa-copy me-2"></i>Duplicar
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click="eliminarTarea(tarea.id)">
                  <i class="fas fa-trash me-2"></i>Eliminar
                </a></li>
              </ul>
            </div>
          </div>

          <div class="card-body">
            <h6 class="card-title mb-2">{{ tarea.titulo }}</h6>
            <p class="card-text text-muted small mb-3">{{ tarea.descripcion }}</p>
            
            <div class="task-meta mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted">
                  <i class="fas fa-calendar me-1"></i>
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
              
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">{{ tarea.progreso }}% completado</small>
                <div class="task-actions">
                  <button 
                    v-if="tarea.estado !== 'completada'"
                    class="btn btn-outline-success btn-sm me-1"
                    @click="marcarCompletada(tarea.id)"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    class="btn btn-outline-primary btn-sm"
                    @click="verDetalles(tarea)"
                  >
                    <i class="fas fa-eye"></i>
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
                  <i class="fas fa-paperclip me-1"></i>{{ archivo }}
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
          <i class="fas fa-tasks fa-3x text-muted mb-3"></i>
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
              <i :class="columna.icono" class="me-2"></i>{{ columna.titulo }}
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
                </div>
              </div>
            </div>
            
            <div v-if="columna.tareas.length === 0" class="text-center text-muted py-3">
              <i class="fas fa-plus-circle fa-2x mb-2"></i>
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
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarTarea">
            {{ tareaEditando ? 'Actualizar' : 'Crear' }} Tarea
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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

// Estados reactivos
const busqueda = ref('');
const filtroSeleccionado = ref('');
const filtroMateria = ref('');
const filtroPrioridad = ref('');
const ordenarPor = ref('fecha_vencimiento');
const vistaActual = ref<'lista' | 'kanban'>('lista');
const tareaEditando = ref<Tarea | null>(null);

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
    archivos: ['referencias.pdf', 'borrador.docx']
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
    fechaVencimiento: new Date('2025-02-20')
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
    fechaVencimiento: new Date('2025-02-01')
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
    fechaVencimiento: new Date('2025-01-30')
  }
]);

// Computed
const tareasEstadisticas = computed(() => {
  return {
    pendientes: tareas.value.filter(t => t.estado === 'pendiente').length,
    enProgreso: tareas.value.filter(t => t.estado === 'en_progreso').length,
    completadas: tareas.value.filter(t => t.estado === 'completada').length,
    vencidas: tareas.value.filter(t => t.estado === 'vencida').length
  };
});

const tareasFiltradas = computed(() => {
  let filtradas = tareas.value;

  // Filtrar por estado
  if (filtroSeleccionado.value) {
    filtradas = filtradas.filter(t => t.estado === filtroSeleccionado.value);
  }

  // Filtrar por materia
  if (filtroMateria.value) {
    filtradas = filtradas.filter(t => t.materia === filtroMateria.value);
  }

  // Filtrar por prioridad
  if (filtroPrioridad.value) {
    filtradas = filtradas.filter(t => t.prioridad === filtroPrioridad.value);
  }

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    filtradas = filtradas.filter(t =>
      t.titulo.toLowerCase().includes(termino) ||
      t.descripcion.toLowerCase().includes(termino)
    );
  }

  // Ordenar
  filtradas.sort((a, b) => {
    switch (ordenarPor.value) {
      case 'prioridad':
        const prioridadOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
        return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
      case 'materia':
        return a.materia.localeCompare(b.materia);
      case 'nombre':
        return a.titulo.localeCompare(b.titulo);
      default:
        return a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime();
    }
  });

  return filtradas;
});

const columnasKanban = computed(() => {
  const estados = ['pendiente', 'en_progreso', 'completada', 'vencida'];
  return estados.map(estado => ({
    estado,
    titulo: getEstadoTexto(estado),
    icono: getIconoEstado(estado),
    tareas: tareasFiltradas.value.filter(t => t.estado === estado)
  }));
});

// Métodos
const formatearFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES');
};

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

const getCardClass = (estado: string) => {
  const clases = {
    'pendiente': 'border-warning',
    'en_progreso': 'border-info',
    'completada': 'border-success',
    'vencida': 'border-danger'
  };
  return clases[estado as keyof typeof clases] || '';
};

const getBadgeEstado = (estado: string) => {
  const badges = {
    'pendiente': 'bg-warning',
    'en_progreso': 'bg-info',
    'completada': 'bg-success',
    'vencida': 'bg-danger'
  };
  return badges[estado as keyof typeof badges] || 'bg-secondary';
};

const getBadgeMateria = (materia: string) => {
  const badges = {
    'operatoria': 'bg-primary',
    'endodoncia': 'bg-success',
    'periodoncia': 'bg-warning',
    'cirugia': 'bg-danger'
  };
  return badges[materia as keyof typeof badges] || 'bg-secondary';
};

const getBadgePrioridad = (prioridad: string) => {
  const badges = {
    'alta': 'bg-danger',
    'media': 'bg-warning',
    'baja': 'bg-success'
  };
  return badges[prioridad as keyof typeof badges] || 'bg-secondary';
};

const getProgressClass = (progreso: number) => {
  if (progreso === 100) return 'bg-success';
  if (progreso >= 75) return 'bg-info';
  if (progreso >= 50) return 'bg-warning';
  return 'bg-danger';
};

const getEstadoTexto = (estado: string) => {
  const textos = {
    'pendiente': 'Pendiente',
    'en_progreso': 'En Progreso',
    'completada': 'Completada',
    'vencida': 'Vencida'
  };
  return textos[estado as keyof typeof textos] || estado;
};

const getIconoEstado = (estado: string) => {
  const iconos = {
    'pendiente': 'fas fa-clock',
    'en_progreso': 'fas fa-hourglass-half',
    'completada': 'fas fa-check-circle',
    'vencida': 'fas fa-exclamation-triangle'
  };
  return iconos[estado as keyof typeof iconos] || 'fas fa-tasks';
};

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
};

const guardarTarea = () => {
  if (tareaEditando.value) {
    // Actualizar tarea existente
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
    // Crear nueva tarea
    const nuevaTarea: Tarea = {
      id: Math.max(...tareas.value.map(t => t.id)) + 1,
      titulo: formTarea.value.titulo,
      descripcion: formTarea.value.descripcion,
      materia: formTarea.value.materia,
      prioridad: formTarea.value.prioridad,
      estado: formTarea.value.estado,
      progreso: formTarea.value.progreso,
      fechaCreacion: new Date(),
      fechaVencimiento: new Date(formTarea.value.fechaVencimiento)
    };
    tareas.value.push(nuevaTarea);
  }
  
  console.log('Tarea guardada');
};

const duplicarTarea = (tarea: Tarea) => {
  const nuevaTarea: Tarea = {
    ...tarea,
    id: Math.max(...tareas.value.map(t => t.id)) + 1,
    titulo: `${tarea.titulo} (Copia)`,
    estado: 'pendiente',
    progreso: 0,
    fechaCreacion: new Date()
  };
  tareas.value.push(nuevaTarea);
  console.log('Tarea duplicada');
};

const eliminarTarea = (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    const index = tareas.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tareas.value.splice(index, 1);
      console.log('Tarea eliminada');
    }
  }
};

const marcarCompletada = (id: number) => {
  const tarea = tareas.value.find(t => t.id === id);
  if (tarea) {
    tarea.estado = 'completada';
    tarea.progreso = 100;
    console.log('Tarea marcada como completada');
  }
};

const verDetalles = (tarea: Tarea) => {
  console.log('Ver detalles de tarea:', tarea.titulo);
  // Aquí se abriría un modal con los detalles completos
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
.filter-card {
  transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out;
  cursor: pointer;
}

.filter-card:hover {
  transform: translateY(-2px);
}

.task-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.task-meta {
  border-top: 1px solid #dee2e6;
  padding-top: 0.75rem;
}

.task-actions button {
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.task-card:hover .task-actions button {
  opacity: 1;
}

.kanban-column {
  min-height: 500px;
}

.kanban-task {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.kanban-task:hover {
  transform: translateX(4px);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
