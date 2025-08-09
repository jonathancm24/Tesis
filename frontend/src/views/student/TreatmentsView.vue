<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Tratamientos</h2>
        <p class="text-muted">Registra procedimientos y evolución de pacientes</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalTratamiento">
        <i class="fas fa-plus me-2"></i>Nuevo Procedimiento
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Paciente</label>
            <select v-model="filtroPaciente" class="form-select">
              <option value="">Todos los pacientes</option>
              <option value="maria-garcia">María García</option>
              <option value="carlos-mendoza">Carlos Mendoza</option>
              <option value="ana-lopez">Ana López</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Especialidad</label>
            <select v-model="filtroEspecialidad" class="form-select">
              <option value="">Todas</option>
              <option value="operatoria">Operatoria</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="cirugia">Cirugía</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Estado</label>
            <select v-model="filtroEstado" class="form-select">
              <option value="">Todos</option>
              <option value="planificado">Planificado</option>
              <option value="en-progreso">En progreso</option>
              <option value="completado">Completado</option>
              <option value="pendiente-aprobacion">Pendiente aprobación</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Buscar</label>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control" 
              placeholder="Buscar tratamiento..."
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de tratamientos -->
    <div class="row">
      <div v-for="tratamiento in tratamientosFiltrados" :key="tratamiento.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-0">{{ tratamiento.paciente }}</h6>
              <small class="text-muted">{{ tratamiento.procedimiento }}</small>
            </div>
            <span class="badge" :class="getBadgeEstado(tratamiento.estado)">
              {{ getTextoEstado(tratamiento.estado) }}
            </span>
          </div>
          <div class="card-body">
            <div class="mb-2">
              <strong>Diente:</strong> {{ tratamiento.diente }}
            </div>
            <div class="mb-2">
              <strong>Especialidad:</strong> {{ tratamiento.especialidad }}
            </div>
            <div class="mb-2">
              <strong>Fecha:</strong> {{ formatearFecha(tratamiento.fecha) }}
            </div>
            <div class="mb-2">
              <strong>Duración:</strong> {{ tratamiento.duracion }}
            </div>
            <div v-if="tratamiento.observaciones" class="mb-2">
              <strong>Observaciones:</strong>
              <p class="text-muted small mb-0">{{ tratamiento.observaciones }}</p>
            </div>
            
            <!-- Evolución del tratamiento -->
            <div v-if="tratamiento.evoluciones.length > 0" class="mt-3">
              <strong>Evolución:</strong>
              <div class="timeline mt-2">
                <div 
                  v-for="evolucion in tratamiento.evoluciones.slice(0, 2)" 
                  :key="evolucion.id" 
                  class="timeline-item"
                >
                  <small class="text-muted">{{ formatearFecha(evolucion.fecha) }}</small>
                  <p class="small mb-0">{{ evolucion.descripcion }}</p>
                </div>
                <div v-if="tratamiento.evoluciones.length > 2" class="text-muted small">
                  +{{ tratamiento.evoluciones.length - 2 }} evoluciones más
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-outline-primary btn-sm" @click="verTratamiento(tratamiento.id)">
                <i class="fas fa-eye me-1"></i>Ver
              </button>
              <button class="btn btn-outline-info btn-sm" @click="agregarEvolucion(tratamiento.id)">
                <i class="fas fa-notes-medical me-1"></i>Evolución
              </button>
              <button 
                v-if="tratamiento.estado === 'en-progreso'" 
                class="btn btn-outline-success btn-sm" 
                @click="completarTratamiento(tratamiento.id)"
              >
                <i class="fas fa-check me-1"></i>Completar
              </button>
              <button 
                v-if="tratamiento.estado === 'completado'" 
                class="btn btn-outline-warning btn-sm" 
                @click="solicitarAprobacion(tratamiento.id)"
              >
                <i class="fas fa-paper-plane me-1"></i>Solicitar aprobación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="tratamientosFiltrados.length === 0" class="text-center py-5">
      <i class="fas fa-procedures fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No hay tratamientos registrados</h5>
      <p class="text-muted">Comienza registrando tu primer procedimiento</p>
      <button class="btn btn-primary" @click="abrirModalTratamiento">
        <i class="fas fa-plus me-2"></i>Registrar procedimiento
      </button>
    </div>

    <!-- Resumen de casos para cierre -->
    <div class="card mt-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Casos Listos para Cierre</h5>
      </div>
      <div class="card-body">
        <div v-if="casosParaCierre.length === 0" class="text-center text-muted py-3">
          No hay casos listos para cierre
        </div>
        <div v-else class="row">
          <div v-for="caso in casosParaCierre" :key="caso.id" class="col-md-6 mb-3">
            <div class="border rounded p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ caso.paciente }}</h6>
                  <small class="text-muted">{{ caso.codigo }}</small>
                  <p class="small mb-0 mt-1">{{ caso.tratamientosCompletados }} tratamientos completados</p>
                </div>
                <button class="btn btn-success btn-sm" @click="cerrarCaso(caso.id)">
                  <i class="fas fa-check-circle me-1"></i>Cerrar caso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para nuevo tratamiento -->
  <div class="modal fade" id="modalTratamiento" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editandoTratamiento ? 'Editar Tratamiento' : 'Nuevo Procedimiento' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarTratamiento">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Paciente</label>
                <select v-model="formularioTratamiento.paciente" class="form-select" required>
                  <option value="">Seleccionar paciente</option>
                  <option value="maria-garcia">María García</option>
                  <option value="carlos-mendoza">Carlos Mendoza</option>
                  <option value="ana-lopez">Ana López</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Diente</label>
                <input v-model="formularioTratamiento.diente" type="text" class="form-control" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Especialidad</label>
                <select v-model="formularioTratamiento.especialidad" class="form-select" required>
                  <option value="">Seleccionar especialidad</option>
                  <option value="operatoria">Operatoria Dental</option>
                  <option value="endodoncia">Endodoncia</option>
                  <option value="periodoncia">Periodoncia</option>
                  <option value="cirugia">Cirugía Oral</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Procedimiento</label>
                <input v-model="formularioTratamiento.procedimiento" type="text" class="form-control" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha</label>
                <input v-model="formularioTratamiento.fecha" type="date" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Duración (minutos)</label>
                <input v-model="formularioTratamiento.duracion" type="number" class="form-control" required>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Observaciones</label>
              <textarea v-model="formularioTratamiento.observaciones" class="form-control" rows="4"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarTratamiento">
            {{ editandoTratamiento ? 'Actualizar' : 'Registrar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para evolución -->
  <div class="modal fade" id="modalEvolucion" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Agregar Evolución</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarEvolucion">
            <div class="mb-3">
              <label class="form-label">Fecha</label>
              <input v-model="formularioEvolucion.fecha" type="date" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea v-model="formularioEvolucion.descripcion" class="form-control" rows="4" required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Estado del paciente</label>
              <select v-model="formularioEvolucion.estado" class="form-select">
                <option value="mejorado">Mejorado</option>
                <option value="estable">Estable</option>
                <option value="requiere-atencion">Requiere atención</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarEvolucion">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Evolucion {
  id: number;
  fecha: Date;
  descripcion: string;
  estado: 'mejorado' | 'estable' | 'requiere-atencion';
}

interface Tratamiento {
  id: number;
  paciente: string;
  diente: string;
  especialidad: string;
  procedimiento: string;
  fecha: Date;
  duracion: string;
  estado: 'planificado' | 'en-progreso' | 'completado' | 'pendiente-aprobacion';
  observaciones?: string;
  evoluciones: Evolucion[];
}

interface CasoParaCierre {
  id: number;
  codigo: string;
  paciente: string;
  tratamientosCompletados: number;
}

const router = useRouter();

// Estados reactivos
const filtroPaciente = ref('');
const filtroEspecialidad = ref('');
const filtroEstado = ref('');
const busqueda = ref('');
const editandoTratamiento = ref(false);
const tratamientoSeleccionado = ref<number | null>(null);

const formularioTratamiento = ref({
  paciente: '',
  diente: '',
  especialidad: '',
  procedimiento: '',
  fecha: '',
  duracion: '',
  observaciones: ''
});

const formularioEvolucion = ref({
  fecha: '',
  descripcion: '',
  estado: 'mejorado'
});

// Datos de ejemplo
const tratamientos = ref<Tratamiento[]>([
  {
    id: 1,
    paciente: 'María García',
    diente: '1.6',
    especialidad: 'Operatoria Dental',
    procedimiento: 'Obturación clase II',
    fecha: new Date('2025-02-10'),
    duracion: '60 min',
    estado: 'completado',
    observaciones: 'Procedimiento realizado sin complicaciones',
    evoluciones: [
      {
        id: 1,
        fecha: new Date('2025-02-10'),
        descripcion: 'Obturación realizada con resina compuesta',
        estado: 'mejorado'
      },
      {
        id: 2,
        fecha: new Date('2025-02-17'),
        descripcion: 'Control post-operatorio. Paciente sin molestias',
        estado: 'estable'
      }
    ]
  },
  {
    id: 2,
    paciente: 'Carlos Mendoza',
    diente: '2.1',
    especialidad: 'Endodoncia',
    procedimiento: 'Tratamiento de conducto',
    fecha: new Date('2025-02-15'),
    duracion: '90 min',
    estado: 'en-progreso',
    observaciones: 'Primera sesión de endodoncia',
    evoluciones: [
      {
        id: 3,
        fecha: new Date('2025-02-15'),
        descripcion: 'Apertura cameral y localización de conductos',
        estado: 'mejorado'
      }
    ]
  }
]);

const casosParaCierre = ref<CasoParaCierre[]>([
  {
    id: 1,
    codigo: 'CC-2025-001',
    paciente: 'María García',
    tratamientosCompletados: 3
  }
]);

// Computed
const tratamientosFiltrados = computed(() => {
  return tratamientos.value.filter(tratamiento => {
    const cumplePaciente = !filtroPaciente.value || 
      tratamiento.paciente.toLowerCase().includes(filtroPaciente.value.toLowerCase());
    const cumpleEspecialidad = !filtroEspecialidad.value || 
      tratamiento.especialidad.toLowerCase().includes(filtroEspecialidad.value.toLowerCase());
    const cumpleEstado = !filtroEstado.value || tratamiento.estado === filtroEstado.value;
    const cumpleBusqueda = !busqueda.value || 
      tratamiento.procedimiento.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      tratamiento.paciente.toLowerCase().includes(busqueda.value.toLowerCase());
    
    return cumplePaciente && cumpleEspecialidad && cumpleEstado && cumpleBusqueda;
  });
});

// Métodos
const getBadgeEstado = (estado: string) => {
  const clases = {
    'planificado': 'bg-secondary',
    'en-progreso': 'bg-warning',
    'completado': 'bg-success',
    'pendiente-aprobacion': 'bg-info'
  };
  return clases[estado as keyof typeof clases] || 'bg-secondary';
};

const getTextoEstado = (estado: string) => {
  const textos = {
    'planificado': 'Planificado',
    'en-progreso': 'En progreso',
    'completado': 'Completado',
    'pendiente-aprobacion': 'Pendiente aprobación'
  };
  return textos[estado as keyof typeof textos] || estado;
};

const formatearFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES');
};

const abrirModalTratamiento = () => {
  editandoTratamiento.value = false;
  formularioTratamiento.value = {
    paciente: '',
    diente: '',
    especialidad: '',
    procedimiento: '',
    fecha: '',
    duracion: '',
    observaciones: ''
  };
};

const verTratamiento = (id: number) => {
  console.log('Ver tratamiento:', id);
};

const agregarEvolucion = (id: number) => {
  tratamientoSeleccionado.value = id;
  formularioEvolucion.value = {
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    estado: 'mejorado'
  };
};

const completarTratamiento = (id: number) => {
  const tratamiento = tratamientos.value.find(t => t.id === id);
  if (tratamiento) {
    tratamiento.estado = 'completado';
  }
};

const solicitarAprobacion = (id: number) => {
  const tratamiento = tratamientos.value.find(t => t.id === id);
  if (tratamiento) {
    tratamiento.estado = 'pendiente-aprobacion';
  }
  // Redirigir a solicitudes
  router.push('/student/requests');
};

const cerrarCaso = (id: number) => {
  if (confirm('¿Estás seguro de que deseas cerrar este caso clínico?')) {
    casosParaCierre.value = casosParaCierre.value.filter(c => c.id !== id);
    console.log('Caso cerrado:', id);
  }
};

const guardarTratamiento = () => {
  console.log('Guardando tratamiento:', formularioTratamiento.value);
  // Aquí se guardaría el tratamiento
};

const guardarEvolucion = () => {
  console.log('Guardando evolución:', formularioEvolucion.value);
  // Aquí se agregaría la evolución al tratamiento
};

onMounted(() => {
  console.log('Vista de tratamientos cargada');
});
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.timeline {
  border-left: 2px solid #dee2e6;
  padding-left: 1rem;
}

.timeline-item {
  margin-bottom: 1rem;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -1.375rem;
  top: 0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  background-color: #007bff;
  border-radius: 50%;
}

.badge {
  font-size: 0.75rem;
}
</style>
