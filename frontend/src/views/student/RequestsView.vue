<!-- src/views/student/RequestsView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Solicitudes</h2>
        <p class="text-muted">Gestiona tus solicitudes académicas y administrativas</p>
      </div>
      <button 
        class="btn btn-primary"
        data-bs-toggle="modal" 
        data-bs-target="#modalSolicitud"
        @click="nuevaSolicitud"
      >
        <i class="fas fa-plus me-2"></i>Nueva Solicitud
      </button>
    </div>

    <!-- Estadísticas de solicitudes -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-clock fa-2x text-warning mb-2"></i>
            <h5 class="card-title">{{ estadisticas.pendientes }}</h5>
            <p class="card-text text-muted">Pendientes</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-eye fa-2x text-info mb-2"></i>
            <h5 class="card-title">{{ estadisticas.enRevision }}</h5>
            <p class="card-text text-muted">En Revisión</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
            <h5 class="card-title">{{ estadisticas.aprobadas }}</h5>
            <p class="card-text text-muted">Aprobadas</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-times-circle fa-2x text-danger mb-2"></i>
            <h5 class="card-title">{{ estadisticas.rechazadas }}</h5>
            <p class="card-text text-muted">Rechazadas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center g-3">
          <div class="col-lg-4 col-md-6">
            <div class="input-group">
              <input 
                v-model="busqueda" 
                type="text" 
                class="form-control" 
                placeholder="Buscar solicitudes..."
                aria-label="Buscar solicitudes"
              >
              <button class="btn btn-outline-secondary" type="button" @click="forzarBusqueda">
                <i class="fas fa-search me-1"></i>Buscar
              </button>
            </div>
          </div>
          <div class="col-lg-2 col-md-3">
            <select v-model="filtroTipo" class="form-select" aria-label="Filtrar por tipo">
              <option value="">Todos los tipos</option>
              <option value="permiso">Permiso</option>
              <option value="certificado">Certificado</option>
              <option value="apelacion">Apelación</option>
              <option value="cambio_horario">Cambio de Horario</option>
              <option value="extension_plazo">Extensión de Plazo</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-3">
            <select v-model="filtroEstado" class="form-select" aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6">
            <select v-model="ordenarPor" class="form-select" aria-label="Ordenar por">
              <option value="fecha_creacion">Fecha de Creación</option>
              <option value="fecha_actualizacion">Última Actualización</option>
              <option value="tipo">Tipo</option>
              <option value="estado">Estado</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6">
            <button 
              class="btn btn-outline-secondary w-100"
              @click="limpiarFiltros"
            >
              <i class="fas fa-filter me-2"></i>Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de solicitudes -->
    <div class="row">
      <div 
        v-for="solicitud in solicitudesFiltradas" 
        :key="solicitud.id" 
        class="col-lg-6 col-xl-4 mb-4"
        :id="'sol-card-'+solicitud.id"
      >
        <div class="card h-100 request-card" :class="getCardClass(solicitud.estado)">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i :class="getIconoTipo(solicitud.tipo)" class="me-2" aria-hidden="true"></i>
              <span class="badge" :class="getBadgeTipo(solicitud.tipo)">
                {{ getTipoTexto(solicitud.tipo) }}
              </span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button 
                class="btn btn-outline-primary btn-sm"
                @click="toggleDetalles(solicitud)"
              >
                <i class="fas fa-eye me-1"></i>
                <span v-if="!isExpanded(solicitud.id)">Ver detalles</span>
                <span v-else>Ocultar detalles</span>
              </button>

              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="abrirModalDetalles(solicitud)">
                      <i class="fas fa-window-maximize me-2"></i>Abrir en ventana
                    </a>
                  </li>
                  <li v-if="solicitud.estado === 'pendiente'">
                    <a class="dropdown-item" href="#" @click.prevent="editarSolicitud(solicitud)">
                      <i class="fas fa-edit me-2"></i>Editar
                    </a>
                  </li>
                  <li v-if="solicitud.estado === 'pendiente'"><hr class="dropdown-divider"></li>
                  <li v-if="solicitud.estado === 'pendiente'">
                    <a class="dropdown-item text-danger" href="#" @click.prevent="cancelarSolicitud(solicitud.id)">
                      <i class="fas fa-trash me-2"></i>Cancelar
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="card-body">
            <h6 class="card-title mb-2">{{ solicitud.asunto }}</h6>
            <p class="card-text text-muted small mb-3">{{ solicitud.descripcion }}</p>
            
            <div class="request-meta mb-3">
              <div class="row mb-2">
                <div class="col-6">
                  <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    Creada: {{ formatearFecha(solicitud.fechaCreacion) }}
                  </small>
                </div>
                <div class="col-6 text-end">
                  <small class="text-muted">
                    <i class="fas fa-user me-1"></i>
                    {{ solicitud.dirigidoA }}
                  </small>
                </div>
              </div>
              
              <div v-if="solicitud.fechaRespuesta" class="row mb-2">
                <div class="col-12">
                  <small class="text-muted">
                    <i class="fas fa-reply me-1"></i>
                    Respondida: {{ formatearFecha(solicitud.fechaRespuesta) }}
                  </small>
                </div>
              </div>

              <div v-if="solicitud.prioridad" class="mb-2">
                <span class="badge" :class="getBadgePrioridad(solicitud.prioridad)">
                  {{ solicitud.prioridad }} prioridad
                </span>
              </div>
            </div>

            <div v-if="solicitud.archivos?.length" class="request-files mb-3">
              <small class="text-muted d-block mb-2">Archivos adjuntos:</small>
              <div class="d-flex flex-wrap gap-1">
                <span 
                  v-for="archivo in solicitud.archivos" 
                  :key="archivo" 
                  class="badge bg-light text-dark"
                >
                  <i class="fas fa-paperclip me-1"></i>{{ archivo }}
                </span>
              </div>
            </div>

            <div v-if="solicitud.observaciones" class="request-observations">
              <small class="text-muted d-block mb-1">Observaciones:</small>
              <div class="bg-light p-2 rounded small">
                {{ solicitud.observaciones }}
              </div>
            </div>
          </div>

          <!-- DETALLES INLINE (expandible) -->
          <transition name="fade">
            <div v-if="isExpanded(solicitud.id)" class="details-panel">
              <div class="details-grid">
                <div>
                  <strong>Tipo:</strong>
                  <span class="ms-2 badge" :class="getBadgeTipo(solicitud.tipo)">
                    {{ getTipoTexto(solicitud.tipo) }}
                  </span>
                </div>
                <div>
                  <strong>Estado:</strong>
                  <span class="ms-2 badge" :class="getBadgeEstado(solicitud.estado)">
                    {{ getEstadoTexto(solicitud.estado) }}
                  </span>
                </div>
                <div>
                  <strong>Dirigido a:</strong>
                  <span class="ms-2">{{ solicitud.dirigidoA }}</span>
                </div>
                <div>
                  <strong>Prioridad:</strong>
                  <span class="ms-2 badge" :class="getBadgePrioridad(solicitud.prioridad)">
                    {{ solicitud.prioridad }}
                  </span>
                </div>
              </div>

              <div class="mt-3">
                <strong>Asunto:</strong>
                <p class="mt-1 mb-2">{{ solicitud.asunto }}</p>
              </div>

              <div class="mb-2">
                <strong>Descripción:</strong>
                <p class="mt-1">{{ solicitud.descripcion }}</p>
              </div>

              <div v-if="solicitud.justificacion" class="mb-2">
                <strong>Justificación:</strong>
                <p class="mt-1">{{ solicitud.justificacion }}</p>
              </div>

              <div v-if="solicitud.observaciones" class="mb-2">
                <strong>Observaciones:</strong>
                <div class="bg-light p-3 rounded mt-1">{{ solicitud.observaciones }}</div>
              </div>

              <div class="row mt-2">
                <div class="col-md-6">
                  <strong>Fecha de creación:</strong>
                  <p class="mt-1">{{ formatearFechaCompleta(solicitud.fechaCreacion) }}</p>
                </div>
                <div v-if="solicitud.fechaRespuesta" class="col-md-6">
                  <strong>Fecha de respuesta:</strong>
                  <p class="mt-1">{{ formatearFechaCompleta(solicitud.fechaRespuesta) }}</p>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-3">
                <button 
                  v-if="solicitud.estado === 'pendiente'" 
                  class="btn btn-outline-primary btn-sm"
                  @click="editarSolicitud(solicitud)"
                >
                  <i class="fas fa-edit me-1"></i>Editar
                </button>
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  @click="toggleDetalles(solicitud)"
                >
                  <i class="fas fa-chevron-up me-1"></i>Ocultar
                </button>
              </div>
            </div>
          </transition>

          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge" :class="getBadgeEstado(solicitud.estado)">
                {{ getEstadoTexto(solicitud.estado) }}
              </span>
              <div class="request-actions">
                <button 
                  class="btn btn-outline-primary btn-sm"
                  @click="toggleDetalles(solicitud)"
                >
                  <i class="fas fa-eye me-1"></i>
                  <span v-if="!isExpanded(solicitud.id)">Detalles</span>
                  <span v-else>Ocultar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="solicitudesFiltradas.length === 0" class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron solicitudes</h5>
          <p class="text-muted">Crea una nueva solicitud o modifica los filtros de búsqueda</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Nueva/Editar Solicitud -->
  <div class="modal fade" id="modalSolicitud" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ solicitudEditando ? 'Editar Solicitud' : 'Nueva Solicitud' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarSolicitud">
            <div class="row">
              <div class="col-md-8 mb-3">
                <label class="form-label">Asunto *</label>
                <input 
                  v-model="formSolicitud.asunto" 
                  type="text" 
                  class="form-control" 
                  placeholder="Asunto de la solicitud"
                  required
                >
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Tipo *</label>
                <select v-model="formSolicitud.tipo" class="form-select" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="permiso">Permiso</option>
                  <option value="certificado">Certificado</option>
                  <option value="apelacion">Apelación</option>
                  <option value="cambio_horario">Cambio de Horario</option>
                  <option value="extension_plazo">Extensión de Plazo</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-8 mb-3">
                <label class="form-label">Dirigido a *</label>
                <select v-model="formSolicitud.dirigidoA" class="form-select" required>
                  <option value="">Seleccionar destinatario</option>
                  <option value="Coordinador Académico">Coordinador Académico</option>
                  <option value="Director de Carrera">Director de Carrera</option>
                  <option value="Secretaría Académica">Secretaría Académica</option>
                  <option value="Decano">Decano</option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Prioridad</label>
                <select v-model="formSolicitud.prioridad" class="form-select">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción *</label>
              <textarea 
                v-model="formSolicitud.descripcion" 
                class="form-control" 
                rows="4"
                placeholder="Describe detalladamente tu solicitud"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Justificación</label>
              <textarea 
                v-model="formSolicitud.justificacion" 
                class="form-control" 
                rows="3"
                placeholder="Justifica el motivo de tu solicitud"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Archivos de soporte</label>
              <input 
                type="file" 
                class="form-control" 
                multiple
                @change="handleFileUpload"
              >
              <div class="form-text">
                Puedes adjuntar documentos de respaldo (PDF, DOC, JPG, PNG)
              </div>
            </div>

            <div v-if="formSolicitud.archivos.length > 0" class="mb-3">
              <label class="form-label">Archivos seleccionados:</label>
              <div class="d-flex flex-wrap gap-2">
                <span 
                  v-for="(archivo, index) in formSolicitud.archivos" 
                  :key="index"
                  class="badge bg-light text-dark d-flex align-items-center"
                >
                  <i class="fas fa-paperclip me-1"></i>{{ archivo }}
                  <button 
                    type="button" 
                    class="btn-close btn-close-sm ms-2"
                    @click="removerArchivo(index)"
                    aria-label="Quitar archivo"
                  ></button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarSolicitud">
            <i class="fas fa-paper-plane me-2"></i>{{ solicitudEditando ? 'Actualizar' : 'Enviar' }} Solicitud
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Detalles de Solicitud -->
  <div class="modal fade" id="modalDetalles" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalles de la Solicitud</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <div v-if="solicitudSeleccionada">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Tipo:</strong> {{ getTipoTexto(solicitudSeleccionada.tipo) }}
              </div>
              <div class="col-md-6">
                <strong>Estado:</strong> 
                <span class="badge ms-2" :class="getBadgeEstado(solicitudSeleccionada.estado)">
                  {{ getEstadoTexto(solicitudSeleccionada.estado) }}
                </span>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Dirigido a:</strong> {{ solicitudSeleccionada.dirigidoA }}
              </div>
              <div class="col-md-6">
                <strong>Prioridad:</strong>
                <span class="badge ms-2" :class="getBadgePrioridad(solicitudSeleccionada.prioridad)">
                  {{ solicitudSeleccionada.prioridad }}
                </span>
              </div>
            </div>

            <div class="mb-3">
              <strong>Asunto:</strong>
              <p class="mt-1">{{ solicitudSeleccionada.asunto }}</p>
            </div>

            <div class="mb-3">
              <strong>Descripción:</strong>
              <p class="mt-1">{{ solicitudSeleccionada.descripcion }}</p>
            </div>

            <div v-if="solicitudSeleccionada.justificacion" class="mb-3">
              <strong>Justificación:</strong>
              <p class="mt-1">{{ solicitudSeleccionada.justificacion }}</p>
            </div>

            <div v-if="solicitudSeleccionada.observaciones" class="mb-3">
              <strong>Observaciones:</strong>
              <div class="bg-light p-3 rounded mt-1">
                {{ solicitudSeleccionada.observaciones }}
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <strong>Fecha de creación:</strong>
                <p class="mt-1">{{ formatearFechaCompleta(solicitudSeleccionada.fechaCreacion) }}</p>
              </div>
              <div v-if="solicitudSeleccionada.fechaRespuesta" class="col-md-6">
                <strong>Fecha de respuesta:</strong>
                <p class="mt-1">{{ formatearFechaCompleta(solicitudSeleccionada.fechaRespuesta) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button 
            v-if="solicitudSeleccionada?.estado === 'pendiente'" 
            type="button" 
            class="btn btn-primary"
            @click="editarSolicitud(solicitudSeleccionada!)"
          >
            <i class="fas fa-edit me-2"></i>Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';

interface Solicitud {
  id: number;
  asunto: string;
  descripcion: string;
  tipo: 'permiso' | 'certificado' | 'apelacion' | 'cambio_horario' | 'extension_plazo';
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada';
  dirigidoA: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreacion: Date;
  fechaRespuesta?: Date;
  justificacion?: string;
  observaciones?: string;
  archivos?: string[];
}

interface FormSolicitud {
  asunto: string;
  descripcion: string;
  tipo: string;
  dirigidoA: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  justificacion: string;
  archivos: string[];
}

// Estados reactivos
const busqueda = ref('');
const filtroTipo = ref('');
const filtroEstado = ref('');
const ordenarPor = ref<'fecha_creacion'|'fecha_actualizacion'|'tipo'|'estado'>('fecha_creacion');
const solicitudEditando = ref<Solicitud | null>(null);
const solicitudSeleccionada = ref<Solicitud | null>(null);

// Control de expansión inline
const expanded = ref<Record<number, boolean>>({}); // id -> abierto/cerrado

const formSolicitud = ref<FormSolicitud>({
  asunto: '',
  descripcion: '',
  tipo: '',
  dirigidoA: '',
  prioridad: 'media',
  justificacion: '',
  archivos: []
});

// Datos de ejemplo
const solicitudes = ref<Solicitud[]>([
  {
    id: 1,
    asunto: 'Solicitud de Permiso para Examen de Recuperación',
    descripcion: 'Solicito permiso para rendir examen de recuperación de la materia Operatoria Dental debido a enfermedad durante el período de exámenes.',
    tipo: 'permiso',
    estado: 'pendiente',
    dirigidoA: 'Coordinador Académico',
    prioridad: 'alta',
    fechaCreacion: new Date('2025-02-01'),
    justificacion: 'Durante el período de exámenes estuve enfermo con gripe, lo cual está respaldado por certificado médico adjunto.',
    archivos: ['certificado_medico.pdf']
  },
  {
    id: 2,
    asunto: 'Certificado de Estudios',
    descripcion: 'Necesito certificado de estudios para tramitar beca estudiantil.',
    tipo: 'certificado',
    estado: 'aprobada',
    dirigidoA: 'Secretaría Académica',
    prioridad: 'media',
    fechaCreacion: new Date('2025-01-25'),
    fechaRespuesta: new Date('2025-01-28'),
    observaciones: 'Certificado emitido y disponible para retiro en secretaría.'
  },
  {
    id: 3,
    asunto: 'Apelación de Calificación - Endodoncia',
    descripcion: 'Solicito revisión de calificación del examen final de Endodoncia.',
    tipo: 'apelacion',
    estado: 'en_revision',
    dirigidoA: 'Director de Carrera',
    prioridad: 'alta',
    fechaCreacion: new Date('2025-01-30'),
    justificacion: 'Considero que la calificación no refleja el conocimiento demostrado en el examen, solicito segunda revisión.',
    archivos: ['examen_endodoncia.pdf', 'evidencias.pdf']
  },
  {
    id: 4,
    asunto: 'Cambio de Horario de Prácticas',
    descripcion: 'Solicito cambio de horario de prácticas clínicas por conflicto laboral.',
    tipo: 'cambio_horario',
    estado: 'rechazada',
    dirigidoA: 'Coordinador Académico',
    prioridad: 'media',
    fechaCreacion: new Date('2025-01-20'),
    fechaRespuesta: new Date('2025-01-24'),
    observaciones: 'No es posible realizar el cambio solicitado debido a capacidad limitada en otros horarios.'
  }
]);

// Computed
const estadisticas = computed(() => ({
  pendientes: solicitudes.value.filter(s => s.estado === 'pendiente').length,
  enRevision: solicitudes.value.filter(s => s.estado === 'en_revision').length,
  aprobadas: solicitudes.value.filter(s => s.estado === 'aprobada').length,
  rechazadas: solicitudes.value.filter(s => s.estado === 'rechazada').length
}));

const solicitudesFiltradas = computed(() => {
  let filtradas = [...solicitudes.value];

  if (filtroTipo.value) filtradas = filtradas.filter(s => s.tipo === filtroTipo.value);
  if (filtroEstado.value) filtradas = filtradas.filter(s => s.estado === filtroEstado.value);

  if (busqueda.value) {
    const t = busqueda.value.toLowerCase();
    filtradas = filtradas.filter(s =>
      s.asunto.toLowerCase().includes(t) ||
      s.descripcion.toLowerCase().includes(t) ||
      s.dirigidoA.toLowerCase().includes(t)
    );
  }

  filtradas.sort((a, b) => {
    switch (ordenarPor.value) {
      case 'fecha_actualizacion': {
        const fa = a.fechaRespuesta || a.fechaCreacion;
        const fb = b.fechaRespuesta || b.fechaCreacion;
        return fb.getTime() - fa.getTime();
      }
      case 'tipo': return a.tipo.localeCompare(b.tipo);
      case 'estado': return a.estado.localeCompare(b.estado);
      default: return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
    }
  });

  return filtradas;
});

// Métodos de formato
const formatearFecha = (fecha: Date) => fecha.toLocaleDateString('es-ES');
const formatearFechaCompleta = (fecha: Date) =>
  fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const getCardClass = (estado: Solicitud['estado']) => ({
  'border-warning': estado === 'pendiente',
  'border-info':    estado === 'en_revision',
  'border-success': estado === 'aprobada',
  'border-danger':  estado === 'rechazada'
});

const getBadgeEstado = (estado: Solicitud['estado']) => ({
  'pendiente': 'bg-warning',
  'en_revision': 'bg-info',
  'aprobada': 'bg-success',
  'rechazada': 'bg-danger'
}[estado] || 'bg-secondary');

const getBadgeTipo = (tipo: Solicitud['tipo']) => ({
  'permiso': 'bg-primary',
  'certificado': 'bg-success',
  'apelacion': 'bg-warning',
  'cambio_horario': 'bg-info',
  'extension_plazo': 'bg-secondary'
}[tipo] || 'bg-secondary');

const getBadgePrioridad = (prioridad: Solicitud['prioridad']) => ({
  'baja': 'bg-success',
  'media': 'bg-warning',
  'alta': 'bg-danger',
  'urgente': 'bg-dark'
}[prioridad] || 'bg-secondary');

const getIconoTipo = (tipo: Solicitud['tipo']) => ({
  'permiso': 'fas fa-user-check',
  'certificado': 'fas fa-certificate',
  'apelacion': 'fas fa-balance-scale',
  'cambio_horario': 'fas fa-clock',
  'extension_plazo': 'fas fa-calendar-plus'
}[tipo] || 'fas fa-clipboard-list');

const getTipoTexto = (tipo: Solicitud['tipo']) => ({
  'permiso': 'Permiso',
  'certificado': 'Certificado',
  'apelacion': 'Apelación',
  'cambio_horario': 'Cambio de Horario',
  'extension_plazo': 'Extensión de Plazo'
}[tipo] || tipo);

const getEstadoTexto = (estado: Solicitud['estado']) => ({
  'pendiente': 'Pendiente',
  'en_revision': 'En Revisión',
  'aprobada': 'Aprobada',
  'rechazada': 'Rechazada'
}[estado] || estado);

// Acciones UI
const limpiarFiltros = () => { busqueda.value = ''; filtroTipo.value = ''; filtroEstado.value = ''; };
const forzarBusqueda = () => console.log('Buscar:', busqueda.value);

// Inline details helpers
const isExpanded = (id: number) => !!expanded.value[id];
const toggleDetalles = (solicitud: Solicitud) => {
  expanded.value = { ...expanded.value, [solicitud.id]: !expanded.value[solicitud.id] };
  solicitudSeleccionada.value = solicitud;
  nextTick(() => {
    const el = document.getElementById(`sol-card-${solicitud.id}`);
    if (el && isExpanded(solicitud.id)) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
};

const abrirModalDetalles = (solicitud: Solicitud) => {
  solicitudSeleccionada.value = solicitud;
  const el = document.getElementById('modalDetalles') as any;
  const bs = (window as any).bootstrap;
  if (bs?.Modal && el) {
    const instance = bs.Modal.getOrCreateInstance(el);
    instance.show();
  }
};

// CRUD
const nuevaSolicitud = () => {
  solicitudEditando.value = null;
  formSolicitud.value = { asunto:'', descripcion:'', tipo:'', dirigidoA:'', prioridad:'media', justificacion:'', archivos:[] };
};

const editarSolicitud = (solicitud: Solicitud) => {
  solicitudEditando.value = solicitud;
  formSolicitud.value = {
    asunto: solicitud.asunto,
    descripcion: solicitud.descripcion,
    tipo: solicitud.tipo,
    dirigidoA: solicitud.dirigidoA,
    prioridad: solicitud.prioridad,
    justificacion: solicitud.justificacion || '',
    archivos: solicitud.archivos || []
  };
  // Abrir modal de edición
  const el = document.getElementById('modalSolicitud') as any;
  const bs = (window as any).bootstrap;
  if (bs?.Modal && el) {
    const instance = bs.Modal.getOrCreateInstance(el);
    instance.show();
  }
  // Cerrar modal de detalles si estaba abierto
  const det = document.getElementById('modalDetalles') as any;
  if (bs?.Modal && det) bs.Modal.getInstance(det)?.hide();
};

const guardarSolicitud = () => {
  if (solicitudEditando.value) {
    const index = solicitudes.value.findIndex(s => s.id === solicitudEditando.value!.id);
    if (index !== -1) {
      solicitudes.value[index] = {
        ...solicitudes.value[index],
        asunto: formSolicitud.value.asunto,
        descripcion: formSolicitud.value.descripcion,
        tipo: formSolicitud.value.tipo as Solicitud['tipo'],
        dirigidoA: formSolicitud.value.dirigidoA,
        prioridad: formSolicitud.value.prioridad,
        justificacion: formSolicitud.value.justificacion,
        archivos: formSolicitud.value.archivos
      };
    }
  } else {
    const nuevoId = solicitudes.value.length ? Math.max(...solicitudes.value.map(s => s.id)) + 1 : 1;
    const nueva: Solicitud = {
      id: nuevoId,
      asunto: formSolicitud.value.asunto,
      descripcion: formSolicitud.value.descripcion,
      tipo: formSolicitud.value.tipo as Solicitud['tipo'],
      estado: 'pendiente',
      dirigidoA: formSolicitud.value.dirigidoA,
      prioridad: formSolicitud.value.prioridad,
      fechaCreacion: new Date(),
      justificacion: formSolicitud.value.justificacion,
      archivos: formSolicitud.value.archivos
    };
    solicitudes.value.unshift(nueva);
  }
  console.log('Solicitud guardada');
  // Cerrar modal de edición si existe
  const el = document.getElementById('modalSolicitud') as any;
  const bs = (window as any).bootstrap;
  if (bs?.Modal && el) bs.Modal.getInstance(el)?.hide();
};

const cancelarSolicitud = (id: number) => {
  if (confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
    const index = solicitudes.value.findIndex(s => s.id === id);
    if (index !== -1) {
      solicitudes.value.splice(index, 1);
      console.log('Solicitud cancelada');
    }
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files).map(file => file.name);
    formSolicitud.value.archivos.push(...newFiles);
  }
};
const removerArchivo = (index: number) => { formSolicitud.value.archivos.splice(index, 1); };

onMounted(() => console.log('Vista de solicitudes cargada'));
</script>

<style scoped>
.request-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.request-meta { border-top: 1px solid #dee2e6; padding-top: 0.75rem; }
.request-observations { border-top: 1px solid #dee2e6; padding-top: 0.75rem; }

.request-actions button { opacity: 0.8; transition: opacity 0.2s ease-in-out; }
.request-card:hover .request-actions button { opacity: 1; }

.btn-close-sm { font-size: 0.7rem; width: 0.8rem; height: 0.8rem; }

/* Detalles inline */
.details-panel {
  border-top: 1px dashed #dee2e6;
  background: #f8f9fa;
  padding: 1rem 1rem 0.75rem;
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .5rem .75rem;
}

/* Animación simple para el expand/collapse */
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 575.98px) {
  .details-grid { grid-template-columns: 1fr; }
}
</style>
