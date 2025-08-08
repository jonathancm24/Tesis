<template>
  <div v-if="mostrarAntecedentes" class="modal-backdrop show" @click.self="cerrarAntecedentes">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="icon-container">
              <i class="fas fa-file-medical-alt"></i>
            </div>
            <div class="title-container">
              <h4>Antecedentes Médicos</h4>
              <p class="modal-subtitle">
                {{ antecedentes?.paciente.nombre }} {{ antecedentes?.paciente.apellido }}
                - {{ antecedentes?.paciente.cedula }}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="cerrarAntecedentes"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Loading estado inicial -->
          <div v-if="cargandoAntecedentes" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando antecedentes médicos...</p>
          </div>

          <!-- Antecedentes cargados -->
          <div v-else-if="antecedentes" class="antecedentes-content">
            <!-- Información del paciente -->
            <div class="patient-info-card mb-4">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6 class="text-muted mb-1">Información del Paciente</h6>
                      <p class="mb-1"><strong>Nombre:</strong> {{ antecedentes.paciente.nombre }} {{ antecedentes.paciente.apellido }}</p>
                      <p class="mb-1"><strong>Cédula:</strong> {{ antecedentes.paciente.cedula }}</p>
                      <p class="mb-0"><strong>Género:</strong> {{ antecedentes.paciente.genero || 'No especificado' }}</p>
                    </div>
                    <div class="col-md-6">
                      <h6 class="text-muted mb-1">Fecha de Encuesta</h6>
                      <p class="mb-0">
                        <i class="fas fa-calendar-alt me-2 text-primary"></i>
                        {{ formatearFecha(antecedentes.fechaEncuesta) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Antecedentes por categoría -->
            <div v-for="categoria in antecedentes.antecedentesPorCategoria" :key="categoria.categoria" class="categoria-antecedentes mb-4">
              <div class="categoria-card">
                <!-- Header de categoría -->
                <div class="categoria-header">
                  <h5 class="categoria-title">
                    <i :class="getIconoCategoria(categoria.categoria)" class="me-2"></i>
                    {{ categoria.categoria }}
                    <span class="badge bg-secondary ms-2">{{ categoria.respuestas.length }} respuestas</span>
                  </h5>
                </div>

                <!-- Respuestas de la categoría -->
                <div class="categoria-body">
                  <div v-if="categoria.respuestas.length === 0" class="no-respuestas">
                    <p class="text-muted mb-0">
                      <i class="fas fa-info-circle me-2"></i>
                      No hay información registrada en esta categoría
                    </p>
                  </div>
                  <div v-else class="respuestas-grid">
                    <div 
                      v-for="(respuesta, index) in categoria.respuestas" 
                      :key="index"
                      class="respuesta-item"
                      :class="{ 'respuesta-positiva': esRespuestaPositiva(respuesta.respuesta) }"
                    >
                      <div class="respuesta-content">
                        <div class="pregunta-texto">
                          <i class="fas fa-question-circle me-2 text-primary"></i>
                          {{ respuesta.pregunta }}
                        </div>
                        <div class="respuesta-valor">
                          <span class="respuesta-badge" :class="getBadgeClass(respuesta.respuesta)">
                            {{ respuesta.respuesta }}
                          </span>
                        </div>
                        <div v-if="respuesta.detalle" class="respuesta-detalle">
                          <div class="detalle-label">
                            <i class="fas fa-info me-1"></i>
                            Detalles:
                          </div>
                          <div class="detalle-content">
                            {{ respuesta.detalle }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de alertas médicas -->
            <div class="alertas-medicas-card mb-4">
              <div class="card border-warning">
                <div class="card-header bg-warning bg-opacity-10">
                  <h6 class="mb-0 text-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Alertas Médicas Importantes
                  </h6>
                </div>
                <div class="card-body">
                  <div v-if="alertasImportantes.length === 0" class="text-muted">
                    <i class="fas fa-check-circle me-2 text-success"></i>
                    No se encontraron alertas médicas significativas
                  </div>
                  <div v-else>
                    <div v-for="(alerta, index) in alertasImportantes" :key="index" class="alerta-item mb-2">
                      <div class="d-flex align-items-start">
                        <i class="fas fa-exclamation-circle text-warning me-2 mt-1"></i>
                        <div>
                          <strong>{{ alerta.categoria }}:</strong> {{ alerta.pregunta }}
                          <div v-if="alerta.detalle" class="text-muted small mt-1">
                            {{ alerta.detalle }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="alert alert-danger">
            <div class="d-flex align-items-center">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Error al cargar antecedentes</strong>
                <p class="mb-0">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <div class="footer-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="imprimirAntecedentes"
              :disabled="!antecedentes"
            >
              <i class="fas fa-print me-2"></i>
              Imprimir
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="cerrarAntecedentes"
            >
              <i class="fas fa-times me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { encuestaService, type AntecedentesMedicos } from '@/services/encuestaService';

// Props
interface Props {
  mostrarAntecedentes: boolean;
  pacienteId: number | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  cerrar: [];
}>();

// Estados reactivos
const cargandoAntecedentes = ref(false);
const error = ref('');
const antecedentes = ref<AntecedentesMedicos | null>(null);

// Computed properties
const alertasImportantes = computed(() => {
  if (!antecedentes.value) return [];
  
  const alertas: Array<{ categoria: string; pregunta: string; detalle?: string }> = [];
  
  // Buscar respuestas positivas que puedan ser alertas médicas
  antecedentes.value.antecedentesPorCategoria.forEach(categoria => {
    categoria.respuestas.forEach(respuesta => {
      if (esRespuestaPositiva(respuesta.respuesta) && 
          (respuesta.pregunta.toLowerCase().includes('alerg') ||
           respuesta.pregunta.toLowerCase().includes('medicament') ||
           respuesta.pregunta.toLowerCase().includes('enfermedad') ||
           respuesta.pregunta.toLowerCase().includes('cirug') ||
           respuesta.pregunta.toLowerCase().includes('hospital'))) {
        alertas.push({
          categoria: categoria.categoria,
          pregunta: respuesta.pregunta,
          detalle: respuesta.detalle
        });
      }
    });
  });
  
  return alertas;
});

// Métodos
const cargarAntecedentes = async () => {
  if (!props.pacienteId) return;
  
  try {
    cargandoAntecedentes.value = true;
    error.value = '';
    
    antecedentes.value = await encuestaService.obtenerAntecedentes(props.pacienteId);
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    cargandoAntecedentes.value = false;
  }
};

const cerrarAntecedentes = () => {
  emit('cerrar');
};

const formatearFecha = (fecha: Date) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getIconoCategoria = (categoria: string): string => {
  const iconos: Record<string, string> = {
    'Antecedentes Personales': 'fas fa-user-md',
    'Antecedentes Familiares': 'fas fa-users',
    'Hábitos': 'fas fa-leaf',
    'Gineco-Obstétricos': 'fas fa-female',
    'Medicamentos': 'fas fa-pills',
    'Alergias': 'fas fa-exclamation-triangle',
    'Revisión de Sistemas': 'fas fa-stethoscope'
  };
  
  return iconos[categoria] || 'fas fa-clipboard-list';
};

const esRespuestaPositiva = (respuesta: string): boolean => {
  return respuesta?.toLowerCase() === 'si' || respuesta?.toLowerCase() === 'sí';
};

const getBadgeClass = (respuesta: string): string => {
  if (esRespuestaPositiva(respuesta)) {
    return 'badge bg-warning text-dark';
  } else if (respuesta?.toLowerCase() === 'no') {
    return 'badge bg-success';
  } else {
    return 'badge bg-info';
  }
};

const imprimirAntecedentes = () => {
  // Implementar funcionalidad de impresión
  window.print();
};

// Watchers
watch(() => props.mostrarAntecedentes, (nuevoValor) => {
  if (nuevoValor && props.pacienteId) {
    cargarAntecedentes();
  }
});

watch(() => props.pacienteId, (nuevoPacienteId) => {
  if (nuevoPacienteId && props.mostrarAntecedentes) {
    cargarAntecedentes();
  }
});

// Lifecycle
onMounted(() => {
  if (props.mostrarAntecedentes && props.pacienteId) {
    cargarAntecedentes();
  }
});
</script>

<style scoped>
/* Estilos para los antecedentes médicos */
.antecedentes-content {
  font-size: 0.95rem;
}

.patient-info-card .card {
  border-radius: 0.75rem;
}

.categoria-antecedentes {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.categoria-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  overflow: hidden;
}

.categoria-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.25rem;
  border-bottom: 1px solid #dee2e6;
}

.categoria-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #495057;
  display: flex;
  align-items: center;
}

.categoria-body {
  padding: 1.25rem;
}

.no-respuestas {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.respuestas-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.respuesta-item {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid #dee2e6;
  transition: all 0.2s ease;
}

.respuesta-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.respuesta-positiva {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #fef7d8 100%);
}

.respuesta-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pregunta-texto {
  font-weight: 600;
  color: #495057;
  line-height: 1.4;
}

.respuesta-valor {
  display: flex;
  align-items: center;
}

.respuesta-badge {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 0.375rem;
}

.respuesta-detalle {
  background: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
}

.detalle-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.detalle-content {
  color: #495057;
  line-height: 1.5;
}

.alertas-medicas-card {
  margin-top: 2rem;
}

.alerta-item {
  padding: 0.75rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 0.375rem;
  border-left: 3px solid #ffc107;
}

/* Responsive */
@media (max-width: 768px) {
  .respuestas-grid {
    grid-template-columns: 1fr;
  }
  
  .categoria-header,
  .categoria-body {
    padding: 1rem;
  }
  
  .respuesta-content {
    gap: 0.5rem;
  }
  
  .modal-dialog.modal-xl {
    margin: 0.25rem;
    max-width: calc(100% - 0.5rem);
  }
}

/* Print styles */
@media print {
  .modal-backdrop,
  .modal-header,
  .modal-footer {
    display: none !important;
  }
  
  .modal-dialog {
    margin: 0 !important;
    max-width: 100% !important;
  }
  
  .modal-content {
    border: none !important;
    box-shadow: none !important;
  }
  
  .categoria-card {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
}
</style>
