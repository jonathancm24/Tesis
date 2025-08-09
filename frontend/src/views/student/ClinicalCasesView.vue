<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Casos Clínicos</h2>
        <p class="text-muted">Gestiona tus casos clínicos y su estado de aprobación</p>
      </div>
      <button class="btn btn-primary" @click="crearNuevoCaso">
        <i class="fas fa-plus me-2"></i>Nuevo Caso
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Filtrar por especialidad</label>
            <select v-model="filtroEspecialidad" class="form-select">
              <option value="">Todas las especialidades</option>
              <option value="operatoria">Operatoria Dental</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="cirugia">Cirugía Oral</option>
              <option value="protesis">Prótesis</option>
              <option value="ortodoncia">Ortodoncia</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Estado</label>
            <select v-model="filtroEstado" class="form-select">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente de aprobación</option>
              <option value="aprobado">Aprobado</option>
              <option value="en-tratamiento">En tratamiento</option>
              <option value="cerrado">Cerrado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Buscar</label>
            <input 
              v-model="busqueda" 
              type="text" 
              class="form-control" 
              placeholder="Buscar por paciente o código..."
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de casos -->
    <div class="row">
      <div v-for="caso in casosFiltrados" :key="caso.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-0">{{ caso.paciente }}</h6>
              <small class="text-muted">Código: {{ caso.codigo }}</small>
            </div>
            <span class="badge" :class="getEstadoBadgeClass(caso.estado)">
              {{ getEstadoTexto(caso.estado) }}
            </span>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <strong>Especialidad:</strong> {{ caso.especialidad }}
            </div>
            <div class="mb-3">
              <strong>Fecha creación:</strong> {{ formatearFecha(caso.fechaCreacion) }}
            </div>
            <div class="mb-3">
              <strong>Motivo:</strong> {{ caso.motivoConsulta }}
            </div>
            <div v-if="caso.observaciones" class="mb-3">
              <strong>Observaciones:</strong>
              <p class="text-muted small mb-0">{{ caso.observaciones }}</p>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="verCaso(caso.id)">
                <i class="fas fa-eye me-1"></i>Ver
              </button>
              <button class="btn btn-outline-info btn-sm" @click="editarCaso(caso.id)">
                <i class="fas fa-edit me-1"></i>Editar
              </button>
              <button 
                v-if="caso.estado === 'aprobado'" 
                class="btn btn-outline-success btn-sm" 
                @click="iniciarTratamiento(caso.id)"
              >
                <i class="fas fa-play me-1"></i>Iniciar
              </button>
              <div class="dropdown">
                <button 
                  class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                  data-bs-toggle="dropdown"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click="subirArchivos(caso.id)">
                    <i class="fas fa-upload me-2"></i>Subir archivos
                  </a></li>
                  <li><a class="dropdown-item" href="#" @click="descargarPDF(caso.id)">
                    <i class="fas fa-file-pdf me-2"></i>Exportar PDF
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" @click="eliminarCaso(caso.id)">
                    <i class="fas fa-trash me-2"></i>Eliminar
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="casosFiltrados.length === 0" class="text-center py-5">
      <i class="fas fa-file-medical fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No hay casos clínicos</h5>
      <p class="text-muted">Comienza creando tu primer caso clínico</p>
      <button class="btn btn-primary" @click="crearNuevoCaso">
        <i class="fas fa-plus me-2"></i>Crear primer caso
      </button>
    </div>
  </div>

  <!-- Modal para subir archivos -->
  <div class="modal fade" id="uploadModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Subir Archivos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Tipo de archivo</label>
            <select v-model="tipoArchivo" class="form-select">
              <option value="radiografia">Radiografía</option>
              <option value="fotografia">Fotografía clínica</option>
              <option value="documento">Documento</option>
              <option value="consentimiento">Consentimiento informado</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Archivo</label>
            <input type="file" class="form-control" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx">
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea v-model="descripcionArchivo" class="form-control" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="confirmarSubida">Subir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface CasoClinico {
  id: number;
  codigo: string;
  paciente: string;
  especialidad: string;
  estado: 'pendiente' | 'aprobado' | 'en-tratamiento' | 'cerrado' | 'rechazado';
  fechaCreacion: Date;
  motivoConsulta: string;
  observaciones?: string;
}

const router = useRouter();

// Estados reactivos
const filtroEspecialidad = ref('');
const filtroEstado = ref('');
const busqueda = ref('');
const tipoArchivo = ref('radiografia');
const descripcionArchivo = ref('');

// Datos de ejemplo
const casos = ref<CasoClinico[]>([
  {
    id: 1,
    codigo: 'CC-2025-001',
    paciente: 'María García',
    especialidad: 'Operatoria Dental',
    estado: 'pendiente',
    fechaCreacion: new Date('2025-01-15'),
    motivoConsulta: 'Dolor en molar superior derecho',
    observaciones: 'Paciente refiere dolor intenso al masticar'
  },
  {
    id: 2,
    codigo: 'CC-2025-002',
    paciente: 'Carlos Mendoza',
    especialidad: 'Endodoncia',
    estado: 'aprobado',
    fechaCreacion: new Date('2025-01-20'),
    motivoConsulta: 'Tratamiento de conducto',
  },
  {
    id: 3,
    codigo: 'CC-2025-003',
    paciente: 'Ana López',
    especialidad: 'Periodoncia',
    estado: 'en-tratamiento',
    fechaCreacion: new Date('2025-02-01'),
    motivoConsulta: 'Gingivitis crónica',
  }
]);

// Computed para filtros
const casosFiltrados = computed(() => {
  return casos.value.filter(caso => {
    const cumpleEspecialidad = !filtroEspecialidad.value || caso.especialidad.toLowerCase().includes(filtroEspecialidad.value.toLowerCase());
    const cumpleEstado = !filtroEstado.value || caso.estado === filtroEstado.value;
    const cumpleBusqueda = !busqueda.value || 
      caso.paciente.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      caso.codigo.toLowerCase().includes(busqueda.value.toLowerCase());
    
    return cumpleEspecialidad && cumpleEstado && cumpleBusqueda;
  });
});

// Métodos
const getEstadoBadgeClass = (estado: string) => {
  const clases = {
    'pendiente': 'bg-warning',
    'aprobado': 'bg-success',
    'en-tratamiento': 'bg-info',
    'cerrado': 'bg-secondary',
    'rechazado': 'bg-danger'
  };
  return clases[estado as keyof typeof clases] || 'bg-secondary';
};

const getEstadoTexto = (estado: string) => {
  const textos = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'en-tratamiento': 'En tratamiento',
    'cerrado': 'Cerrado',
    'rechazado': 'Rechazado'
  };
  return textos[estado as keyof typeof textos] || estado;
};

const formatearFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const crearNuevoCaso = () => {
  router.push('/student/patients');
};

const verCaso = (id: number) => {
  console.log('Ver caso:', id);
};

const editarCaso = (id: number) => {
  router.push('/student/patients');
};

const iniciarTratamiento = (id: number) => {
  router.push('/student/treatments');
};

const subirArchivos = (id: number) => {
  console.log('Subir archivos para caso:', id);
  // Aquí se abriría el modal de subida
};

const descargarPDF = (id: number) => {
  console.log('Descargar PDF del caso:', id);
};

const eliminarCaso = (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar este caso?')) {
    casos.value = casos.value.filter(c => c.id !== id);
  }
};

const confirmarSubida = () => {
  console.log('Subiendo archivo:', tipoArchivo.value, descripcionArchivo.value);
  // Cerrar modal
  descripcionArchivo.value = '';
};

onMounted(() => {
  console.log('Vista de casos clínicos cargada');
});
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 0.75rem;
}
</style>
