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
        <div class="row align-items-center">
          <div class="col-lg-4 col-md-6 mb-3 mb-lg-0">
            <div class="input-group">
              <input 
                v-model="busqueda" 
                type="text" 
                class="form-control" 
                placeholder="Buscar solicitudes..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-lg-2 col-md-3 mb-3 mb-lg-0">
            <select v-model="filtroTipo" class="form-select">
              <option value="">Todos los tipos</option>
              <option value="permiso">Permiso</option>
              <option value="certificado">Certificado</option>
              <option value="apelacion">Apelación</option>
              <option value="cambio_horario">Cambio de Horario</option>
              <option value="extension_plazo">Extensión de Plazo</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-3 mb-3 mb-lg-0">
            <select v-model="filtroEstado" class="form-select">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6 mb-3 mb-lg-0">
            <select v-model="ordenarPor" class="form-select">
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
      <div v-for="solicitud in solicitudesFiltradas" :key="solicitud.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100 request-card" :class="getCardClass(solicitud.estado)">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i :class="getIconoTipo(solicitud.tipo)" class="me-2"></i>
              <span class="badge" :class="getBadgeTipo(solicitud.tipo)">
                {{ getTipoTexto(solicitud.tipo) }}
              </span>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="verDetalles(solicitud)">
                  <i class="fas fa-eye me-2"></i>Ver Detalles
                </a></li>
                <li v-if="solicitud.estado === 'pendiente'">
                  <a class="dropdown-item" href="#" @click="editarSolicitud(solicitud)">
                    <i class="fas fa-edit me-2"></i>Editar
                  </a>
                </li>
                <li v-if="solicitud.estado === 'pendiente'">
                  <hr class="dropdown-divider">
                </li>
                <li v-if="solicitud.estado === 'pendiente'">
                  <a class="dropdown-item text-danger" href="#" @click="cancelarSolicitud(solicitud.id)">
                    <i class="fas fa-trash me-2"></i>Cancelar
                  </a>
                </li>
              </ul>
            </div>
          </div>

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

            <div v-if="solicitud.archivos && solicitud.archivos.length > 0" class="request-files mb-3">
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

          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge" :class="getBadgeEstado(solicitud.estado)">
                {{ getEstadoTexto(solicitud.estado) }}
              </span>
              <div class="request-actions">
                <button 
                  class="btn btn-outline-primary btn-sm"
                  @click="verDetalles(solicitud)"
                >
                  <i class="fas fa-eye me-1"></i>Detalles
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
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                  ></button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarSolicitud">
            {{ solicitudEditando ? 'Actualizar' : 'Enviar' }} Solicitud
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
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
            @click="editarSolicitud(solicitudSeleccionada)"
          >
            <i class="fas fa-edit me-2"></i>Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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
const ordenarPor = ref('fecha_creacion');
const solicitudEditando = ref<Solicitud | null>(null);
const solicitudSeleccionada = ref<Solicitud | null>(null);

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
const estadisticas = computed(() => {
  return {
    pendientes: solicitudes.value.filter(s => s.estado === 'pendiente').length,
    enRevision: solicitudes.value.filter(s => s.estado === 'en_revision').length,
    aprobadas: solicitudes.value.filter(s => s.estado === 'aprobada').length,
    rechazadas: solicitudes.value.filter(s => s.estado === 'rechazada').length
  };
});

const solicitudesFiltradas = computed(() => {
  let filtradas = solicitudes.value;

  // Filtrar por tipo
  if (filtroTipo.value) {
    filtradas = filtradas.filter(s => s.tipo === filtroTipo.value);
  }

  // Filtrar por estado
  if (filtroEstado.value) {
    filtradas = filtradas.filter(s => s.estado === filtroEstado.value);
  }

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    filtradas = filtradas.filter(s =>
      s.asunto.toLowerCase().includes(termino) ||
      s.descripcion.toLowerCase().includes(termino) ||
      s.dirigidoA.toLowerCase().includes(termino)
    );
  }

  // Ordenar
  filtradas.sort((a, b) => {
    switch (ordenarPor.value) {
      case 'fecha_actualizacion':
        const fechaA = a.fechaRespuesta || a.fechaCreacion;
        const fechaB = b.fechaRespuesta || b.fechaCreacion;
        return fechaB.getTime() - fechaA.getTime();
      case 'tipo':
        return a.tipo.localeCompare(b.tipo);
      case 'estado':
        return a.estado.localeCompare(b.estado);
      default:
        return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
    }
  });

  return filtradas;
});

// Métodos
const formatearFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES');
};

const formatearFechaCompleta = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getCardClass = (estado: string) => {
  const clases = {
    'pendiente': 'border-warning',
    'en_revision': 'border-info',
    'aprobada': 'border-success',
    'rechazada': 'border-danger'
  };
  return clases[estado as keyof typeof clases] || '';
};

const getBadgeEstado = (estado: string) => {
  const badges = {
    'pendiente': 'bg-warning',
    'en_revision': 'bg-info',
    'aprobada': 'bg-success',
    'rechazada': 'bg-danger'
  };
  return badges[estado as keyof typeof badges] || 'bg-secondary';
};

const getBadgeTipo = (tipo: string) => {
  const badges = {
    'permiso': 'bg-primary',
    'certificado': 'bg-success',
    'apelacion': 'bg-warning',
    'cambio_horario': 'bg-info',
    'extension_plazo': 'bg-secondary'
  };
  return badges[tipo as keyof typeof badges] || 'bg-secondary';
};

const getBadgePrioridad = (prioridad: string) => {
  const badges = {
    'baja': 'bg-success',
    'media': 'bg-warning',
    'alta': 'bg-danger',
    'urgente': 'bg-dark'
  };
  return badges[prioridad as keyof typeof badges] || 'bg-secondary';
};

const getIconoTipo = (tipo: string) => {
  const iconos = {
    'permiso': 'fas fa-user-check',
    'certificado': 'fas fa-certificate',
    'apelacion': 'fas fa-balance-scale',
    'cambio_horario': 'fas fa-clock',
    'extension_plazo': 'fas fa-calendar-plus'
  };
  return iconos[tipo as keyof typeof iconos] || 'fas fa-clipboard-list';
};

const getTipoTexto = (tipo: string) => {
  const textos = {
    'permiso': 'Permiso',
    'certificado': 'Certificado',
    'apelacion': 'Apelación',
    'cambio_horario': 'Cambio de Horario',
    'extension_plazo': 'Extensión de Plazo'
  };
  return textos[tipo as keyof typeof textos] || tipo;
};

const getEstadoTexto = (estado: string) => {
  const textos = {
    'pendiente': 'Pendiente',
    'en_revision': 'En Revisión',
    'aprobada': 'Aprobada',
    'rechazada': 'Rechazada'
  };
  return textos[estado as keyof typeof textos] || estado;
};

const limpiarFiltros = () => {
  busqueda.value = '';
  filtroTipo.value = '';
  filtroEstado.value = '';
};

const nuevaSolicitud = () => {
  solicitudEditando.value = null;
  formSolicitud.value = {
    asunto: '',
    descripcion: '',
    tipo: '',
    dirigidoA: '',
    prioridad: 'media',
    justificacion: '',
    archivos: []
  };
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
  
  // Cerrar modal de detalles si está abierto
  const modalDetalles = document.getElementById('modalDetalles');
  if (modalDetalles) {
    const modal = (window as any).bootstrap?.Modal.getInstance(modalDetalles);
    modal?.hide();
  }
};

const guardarSolicitud = () => {
  if (solicitudEditando.value) {
    // Actualizar solicitud existente
    const index = solicitudes.value.findIndex(s => s.id === solicitudEditando.value!.id);
    if (index !== -1) {
      solicitudes.value[index] = {
        ...solicitudes.value[index],
        asunto: formSolicitud.value.asunto,
        descripcion: formSolicitud.value.descripcion,
        tipo: formSolicitud.value.tipo as any,
        dirigidoA: formSolicitud.value.dirigidoA,
        prioridad: formSolicitud.value.prioridad,
        justificacion: formSolicitud.value.justificacion,
        archivos: formSolicitud.value.archivos
      };
    }
  } else {
    // Crear nueva solicitud
    const nuevaSolicitud: Solicitud = {
      id: Math.max(...solicitudes.value.map(s => s.id)) + 1,
      asunto: formSolicitud.value.asunto,
      descripcion: formSolicitud.value.descripcion,
      tipo: formSolicitud.value.tipo as any,
      estado: 'pendiente',
      dirigidoA: formSolicitud.value.dirigidoA,
      prioridad: formSolicitud.value.prioridad,
      fechaCreacion: new Date(),
      justificacion: formSolicitud.value.justificacion,
      archivos: formSolicitud.value.archivos
    };
    solicitudes.value.push(nuevaSolicitud);
  }
  
  console.log('Solicitud guardada');
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

const verDetalles = (solicitud: Solicitud) => {
  solicitudSeleccionada.value = solicitud;
  // Aquí se abriría el modal de detalles
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files).map(file => file.name);
    formSolicitud.value.archivos.push(...newFiles);
  }
};

const removerArchivo = (index: number) => {
  formSolicitud.value.archivos.splice(index, 1);
};

onMounted(() => {
  console.log('Vista de solicitudes cargada');
});
</script>

<style scoped>
.request-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.request-meta {
  border-top: 1px solid #dee2e6;
  padding-top: 0.75rem;
}

.request-observations {
  border-top: 1px solid #dee2e6;
  padding-top: 0.75rem;
}

.request-actions button {
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.request-card:hover .request-actions button {
  opacity: 1;
}

.btn-close-sm {
  font-size: 0.7rem;
  width: 0.8rem;
  height: 0.8rem;
}
</style>
