<!-- src/views/student/ResourcesView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Recursos Académicos</h2>
        <p class="text-muted">Accede a materiales de estudio, guías y recursos didácticos</p>
      </div>
      <button 
        class="btn btn-primary" 
        data-bs-toggle="modal" 
        data-bs-target="#modalRecurso"
        @click="nuevoRecurso"
      >
        <i class="fas fa-plus me-2"></i>Subir Recurso
      </button>
    </div>

    <!-- Estadísticas de recursos -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-book fa-2x text-primary mb-2"></i>
            <h5 class="card-title">{{ estadisticas.documentos }}</h5>
            <p class="card-text text-muted">Documentos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-video fa-2x text-success mb-2"></i>
            <h5 class="card-title">{{ estadisticas.videos }}</h5>
            <p class="card-text text-muted">Videos</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-image fa-2x text-warning mb-2"></i>
            <h5 class="card-title">{{ estadisticas.imagenes }}</h5>
            <p class="card-text text-muted">Imágenes</p>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-link fa-2x text-info mb-2"></i>
            <h5 class="card-title">{{ estadisticas.enlaces }}</h5>
            <p class="card-text text-muted">Enlaces</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-lg-4 col-md-6 mb-3 mb-lg-0">
            <div class="input-group">
              <input 
                v-model="busqueda" 
                type="text" 
                class="form-control" 
                placeholder="Buscar recursos..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-lg-2 col-md-3 mb-3 mb-lg-0">
            <select v-model="filtroTipo" class="form-select">
              <option value="">Todos los tipos</option>
              <option value="documento">Documentos</option>
              <option value="video">Videos</option>
              <option value="imagen">Imágenes</option>
              <option value="enlace">Enlaces</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-3 mb-3 mb-lg-0">
            <select v-model="filtroMateria" class="form-select">
              <option value="">Todas las materias</option>
              <option value="operatoria">Operatoria Dental</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="protesis">Prótesis</option>
              <option value="cirugia">Cirugía Oral</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6 mb-3 mb-lg-0">
            <select v-model="ordenarPor" class="form-select">
              <option value="fecha">Fecha</option>
              <option value="nombre">Nombre</option>
              <option value="tipo">Tipo</option>
              <option value="materia">Materia</option>
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

    <!-- Grid de recursos -->
    <div class="row">
      <div v-for="recurso in recursosFiltrados" :key="recurso.id" class="col-lg-4 col-md-6 mb-4">
        <div class="card h-100 resource-card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i :class="getIconoTipo(recurso.tipo)" class="me-2"></i>
              <span class="badge" :class="getBadgeTipo(recurso.tipo)">
                {{ getTipoTexto(recurso.tipo) }}
              </span>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="descargarRecurso(recurso)">
                  <i class="fas fa-download me-2"></i>Descargar
                </a></li>
                <li><a class="dropdown-item" href="#" @click="compartirRecurso(recurso)">
                  <i class="fas fa-share me-2"></i>Compartir
                </a></li>
                <li><a class="dropdown-item" href="#" @click="marcarFavorito(recurso)">
                  <i :class="recurso.favorito ? 'fas fa-star' : 'far fa-star'" class="me-2"></i>
                  {{ recurso.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
                </a></li>
              </ul>
            </div>
          </div>

          <div class="card-body">
            <h6 class="card-title mb-2">{{ recurso.nombre }}</h6>
            <p class="card-text text-muted small mb-3">{{ recurso.descripcion }}</p>
            
            <div class="resource-meta mb-3">
              <div class="row mb-2">
                <div class="col-6">
                  <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    {{ formatearFecha(recurso.fechaSubida) }}
                  </small>
                </div>
                <div class="col-6 text-end">
                  <small class="text-muted">
                    <i class="fas fa-download me-1"></i>
                    {{ recurso.descargas }}
                  </small>
                </div>
              </div>
              
              <div class="row mb-2">
                <div class="col-6">
                  <small class="text-muted">
                    <i class="fas fa-book me-1"></i>
                    {{ recurso.materia }}
                  </small>
                </div>
                <div class="col-6 text-end">
                  <small class="text-muted">
                    <i class="fas fa-file me-1"></i>
                    {{ recurso.tamaño }}
                  </small>
                </div>
              </div>

              <div v-if="recurso.autor" class="mb-2">
                <small class="text-muted">
                  <i class="fas fa-user me-1"></i>
                  {{ recurso.autor }}
                </small>
              </div>
            </div>

            <div v-if="recurso.tags && recurso.tags.length > 0" class="resource-tags mb-3">
              <div class="d-flex flex-wrap gap-1">
                <span 
                  v-for="tag in recurso.tags" 
                  :key="tag" 
                  class="badge bg-light text-dark"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <div class="resource-rating">
                <div class="d-flex align-items-center">
                  <div class="stars me-2">
                    <i v-for="n in 5" :key="n" 
                       :class="n <= recurso.calificacion ? 'fas fa-star text-warning' : 'far fa-star text-muted'"
                       style="font-size: 0.8rem;"></i>
                  </div>
                  <small class="text-muted">({{ recurso.calificacion }})</small>
                </div>
              </div>
              <div class="resource-actions">
                <button 
                  class="btn btn-primary btn-sm"
                  @click="abrirRecurso(recurso)"
                >
                  <i class="fas fa-eye me-1"></i>Ver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="recursosFiltrados.length === 0" class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron recursos</h5>
          <p class="text-muted">Prueba con diferentes filtros o sube un nuevo recurso</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Nuevo Recurso -->
  <div class="modal fade" id="modalRecurso" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Subir Nuevo Recurso</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarRecurso">
            <div class="row">
              <div class="col-md-8 mb-3">
                <label class="form-label">Nombre del recurso *</label>
                <input 
                  v-model="formRecurso.nombre" 
                  type="text" 
                  class="form-control" 
                  placeholder="Nombre del recurso"
                  required
                >
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Tipo *</label>
                <select v-model="formRecurso.tipo" class="form-select" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="documento">Documento</option>
                  <option value="video">Video</option>
                  <option value="imagen">Imagen</option>
                  <option value="enlace">Enlace</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Materia</label>
                <select v-model="formRecurso.materia" class="form-select">
                  <option value="">Seleccionar materia</option>
                  <option value="operatoria">Operatoria Dental</option>
                  <option value="endodoncia">Endodoncia</option>
                  <option value="periodoncia">Periodoncia</option>
                  <option value="protesis">Prótesis</option>
                  <option value="cirugia">Cirugía Oral</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Autor</label>
                <input 
                  v-model="formRecurso.autor" 
                  type="text" 
                  class="form-control" 
                  placeholder="Nombre del autor"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="formRecurso.descripcion" 
                class="form-control" 
                rows="3"
                placeholder="Describe el contenido del recurso"
              ></textarea>
            </div>

            <div class="mb-3" v-if="formRecurso.tipo === 'enlace'">
              <label class="form-label">URL del enlace *</label>
              <input 
                v-model="formRecurso.url" 
                type="url" 
                class="form-control" 
                placeholder="https://ejemplo.com"
              >
            </div>

            <div class="mb-3" v-else>
              <label class="form-label">Archivo</label>
              <input 
                type="file" 
                class="form-control" 
                @change="handleFileUpload"
              >
              <div class="form-text">
                Formatos soportados: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4, AVI
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Etiquetas</label>
              <input 
                v-model="tagsInput" 
                type="text" 
                class="form-control" 
                placeholder="Separa las etiquetas con comas"
                @keyup.enter="agregarTag"
              >
              <div v-if="formRecurso.tags.length > 0" class="mt-2">
                <span 
                  v-for="(tag, index) in formRecurso.tags" 
                  :key="index"
                  class="badge bg-primary me-1"
                >
                  {{ tag }}
                  <button 
                    type="button" 
                    class="btn-close btn-close-white btn-close-sm ms-1"
                    @click="removerTag(index)"
                  ></button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarRecurso">
            <i class="fas fa-upload me-2"></i>Subir Recurso
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Recurso {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'documento' | 'video' | 'imagen' | 'enlace';
  materia: string;
  autor: string;
  fechaSubida: Date;
  tamaño: string;
  descargas: number;
  calificacion: number;
  favorito: boolean;
  tags: string[];
  url?: string;
  archivo?: string;
}

interface FormRecurso {
  nombre: string;
  descripcion: string;
  tipo: string;
  materia: string;
  autor: string;
  tags: string[];
  url?: string;
  archivo?: File;
}

// Estados reactivos
const busqueda = ref('');
const filtroTipo = ref('');
const filtroMateria = ref('');
const ordenarPor = ref('fecha');
const tagsInput = ref('');

const formRecurso = ref<FormRecurso>({
  nombre: '',
  descripcion: '',
  tipo: '',
  materia: '',
  autor: '',
  tags: []
});

// Datos de ejemplo
const recursos = ref<Recurso[]>([
  {
    id: 1,
    nombre: 'Manual de Operatoria Dental',
    descripcion: 'Guía completa sobre técnicas de restauración dental y materiales.',
    tipo: 'documento',
    materia: 'operatoria',
    autor: 'Dr. Carlos Méndez',
    fechaSubida: new Date('2025-01-15'),
    tamaño: '2.5 MB',
    descargas: 45,
    calificacion: 5,
    favorito: true,
    tags: ['restauración', 'composites', 'técnicas'],
    archivo: 'manual-operatoria.pdf'
  },
  {
    id: 2,
    nombre: 'Video: Técnica de Endodoncia',
    descripcion: 'Demostración paso a paso del tratamiento endodóntico.',
    tipo: 'video',
    materia: 'endodoncia',
    autor: 'Dra. Ana Rodríguez',
    fechaSubida: new Date('2025-01-20'),
    tamaño: '150 MB',
    descargas: 32,
    calificacion: 4,
    favorito: false,
    tags: ['endodoncia', 'procedimiento', 'video'],
    archivo: 'endodoncia-tecnica.mp4'
  },
  {
    id: 3,
    nombre: 'Atlas de Anatomía Dental',
    descripcion: 'Colección de imágenes de anatomía dental para estudio.',
    tipo: 'imagen',
    materia: 'anatomia',
    autor: 'Dr. Luis Martínez',
    fechaSubida: new Date('2025-01-10'),
    tamaño: '5.2 MB',
    descargas: 67,
    calificacion: 5,
    favorito: true,
    tags: ['anatomía', 'dental', 'atlas'],
    archivo: 'atlas-anatomia.zip'
  },
  {
    id: 4,
    nombre: 'Biblioteca Digital Odontológica',
    descripcion: 'Acceso a la biblioteca digital con miles de recursos.',
    tipo: 'enlace',
    materia: 'general',
    autor: 'Universidad',
    fechaSubida: new Date('2025-01-05'),
    tamaño: 'N/A',
    descargas: 123,
    calificacion: 4,
    favorito: false,
    tags: ['biblioteca', 'digital', 'recursos'],
    url: 'https://biblioteca-odonto.edu.ec'
  }
]);

// Computed
const estadisticas = computed(() => {
  return {
    documentos: recursos.value.filter(r => r.tipo === 'documento').length,
    videos: recursos.value.filter(r => r.tipo === 'video').length,
    imagenes: recursos.value.filter(r => r.tipo === 'imagen').length,
    enlaces: recursos.value.filter(r => r.tipo === 'enlace').length
  };
});

const recursosFiltrados = computed(() => {
  let filtrados = recursos.value;

  // Filtrar por tipo
  if (filtroTipo.value) {
    filtrados = filtrados.filter(r => r.tipo === filtroTipo.value);
  }

  // Filtrar por materia
  if (filtroMateria.value) {
    filtrados = filtrados.filter(r => r.materia === filtroMateria.value);
  }

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    filtrados = filtrados.filter(r =>
      r.nombre.toLowerCase().includes(termino) ||
      r.descripcion.toLowerCase().includes(termino) ||
      r.autor.toLowerCase().includes(termino) ||
      r.tags.some(tag => tag.toLowerCase().includes(termino))
    );
  }

  // Ordenar
  filtrados.sort((a, b) => {
    switch (ordenarPor.value) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'tipo':
        return a.tipo.localeCompare(b.tipo);
      case 'materia':
        return a.materia.localeCompare(b.materia);
      default:
        return b.fechaSubida.getTime() - a.fechaSubida.getTime();
    }
  });

  return filtrados;
});

// Métodos
const formatearFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES');
};

const getIconoTipo = (tipo: string) => {
  const iconos = {
    'documento': 'fas fa-file-pdf',
    'video': 'fas fa-play-circle',
    'imagen': 'fas fa-image',
    'enlace': 'fas fa-external-link-alt'
  };
  return iconos[tipo as keyof typeof iconos] || 'fas fa-file';
};

const getBadgeTipo = (tipo: string) => {
  const badges = {
    'documento': 'bg-danger',
    'video': 'bg-success',
    'imagen': 'bg-warning',
    'enlace': 'bg-info'
  };
  return badges[tipo as keyof typeof badges] || 'bg-secondary';
};

const getTipoTexto = (tipo: string) => {
  const textos = {
    'documento': 'Documento',
    'video': 'Video',
    'imagen': 'Imagen',
    'enlace': 'Enlace'
  };
  return textos[tipo as keyof typeof textos] || tipo;
};

const limpiarFiltros = () => {
  busqueda.value = '';
  filtroTipo.value = '';
  filtroMateria.value = '';
};

const nuevoRecurso = () => {
  formRecurso.value = {
    nombre: '',
    descripcion: '',
    tipo: '',
    materia: '',
    autor: '',
    tags: []
  };
};

const descargarRecurso = (recurso: Recurso) => {
  console.log('Descargando recurso:', recurso.nombre);
  // Aquí se implementaría la descarga real
};

const compartirRecurso = (recurso: Recurso) => {
  console.log('Compartiendo recurso:', recurso.nombre);
  // Aquí se implementaría la funcionalidad de compartir
};

const marcarFavorito = (recurso: Recurso) => {
  recurso.favorito = !recurso.favorito;
  console.log(`Recurso ${recurso.favorito ? 'agregado a' : 'removido de'} favoritos`);
};

const abrirRecurso = (recurso: Recurso) => {
  if (recurso.tipo === 'enlace' && recurso.url) {
    window.open(recurso.url, '_blank');
  } else {
    console.log('Abriendo recurso:', recurso.nombre);
    // Aquí se implementaría la visualización del recurso
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    formRecurso.value.archivo = target.files[0];
  }
};

const agregarTag = () => {
  if (tagsInput.value.trim()) {
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    formRecurso.value.tags.push(...tags);
    tagsInput.value = '';
  }
};

const removerTag = (index: number) => {
  formRecurso.value.tags.splice(index, 1);
};

const guardarRecurso = () => {
  // Aquí se implementaría la subida del recurso
  console.log('Guardando recurso:', formRecurso.value);
};

onMounted(() => {
  console.log('Vista de recursos cargada');
});
</script>

<style scoped>
.resource-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #dee2e6;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.resource-meta {
  border-top: 1px solid #f8f9fa;
  padding-top: 0.75rem;
}

.resource-tags {
  border-top: 1px solid #f8f9fa;
  padding-top: 0.75rem;
}

.resource-actions button {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
}

.resource-card:hover .resource-actions button {
  opacity: 1;
}

.stars {
  display: flex;
  gap: 1px;
}

.btn-close-sm {
  font-size: 0.6rem;
  width: 0.8rem;
  height: 0.8rem;
}

/* Corrección para el z-index del dropdown */
.dropdown {
  position: relative;
}

.dropdown-menu {
  z-index: 1050 !important;
  position: absolute;
  right: 0;
  left: auto;
}

.resource-card {
  position: relative;
  overflow: visible;
}

.card-header {
  position: relative;
  z-index: 1;
}
</style>
