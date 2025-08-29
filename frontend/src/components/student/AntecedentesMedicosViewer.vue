<template>
  <div v-if="mostrarAntecedentes" class="modal-backdrop antecedentes-modal-backdrop show" @click.self="cerrarAntecedentes">
    <div class="modal-dialog modal-xl modal-dialog-scrollable antecedentes-modal-dialog">
      <div class="modal-content antecedentes-modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="icon-container">
              <i class="fas fa-file-medical text-primary"></i>
            </div>
            <div class="title-container">
              <h4 class="modal-title mb-0">Antecedentes Médicos</h4>
              <p class="subtitle mb-0">Información médica del paciente</p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="cerrarAntecedentes"
            aria-label="Cerrar">
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
            <!-- Información del paciente - Compacta -->
            <div class="patient-info-card mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body py-2 px-3">
                  <div class="row align-items-center">
                    <div class="col-md-8">
                      <div class="d-flex flex-wrap gap-3 align-items-center">
                        <span><strong>{{ antecedentes.paciente.nombre }} {{ antecedentes.paciente.apellido }}</strong></span>
                        <span class="text-muted">{{ antecedentes.paciente.cedula }}</span>
                        <span class="text-muted">{{ antecedentes.paciente.genero || 'No especificado' }}</span>
                      </div>
                    </div>
                    <div class="col-md-4 text-md-end">
                      <small class="text-muted">
                        <i class="fas fa-calendar-alt me-1"></i>
                        {{ formatearFecha(antecedentes.fechaEncuesta) }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Antecedentes por categoría -->
            <div v-for="categoria in antecedentes.antecedentesPorCategoria" :key="categoria.categoria" class="categoria-antecedentes mb-3">
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
                  <div v-else class="respuestas-grid antecedentes-respuestas-grid">
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

          <!-- Estado inicial -->
          <div v-else class="text-center py-5">
            <div class="mb-3">
              <i class="fas fa-file-medical-alt fa-3x text-muted"></i>
            </div>
            <h5 class="text-muted">No hay antecedentes disponibles</h5>
            <p class="text-muted">Seleccione un paciente para ver sus antecedentes médicos</p>
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
      if (esRespuestaPositiva(respuesta.respuesta)) {
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

// Methods
const cargarAntecedentes = async () => {
  if (!props.pacienteId) return;
  
  cargandoAntecedentes.value = true;
  error.value = '';
  
  try {
    const resultado = await encuestaService.obtenerAntecedentes(props.pacienteId);
    antecedentes.value = resultado;
  } catch (err) {
    error.value = 'Error al cargar los antecedentes médicos';
    console.error('Error cargando antecedentes:', err);
  } finally {
    cargandoAntecedentes.value = false;
  }
};

const cerrarAntecedentes = () => {
  emit('cerrar');
};

const imprimirAntecedentes = () => {
  window.print();
};

const esRespuestaPositiva = (respuesta: string): boolean => {
  const respuestasPositivas = ['sí', 'si', 'yes', 'verdadero', 'true', 'positivo'];
  return respuestasPositivas.includes(respuesta.toLowerCase());
};

const getBadgeClass = (respuesta: string): string => {
  if (esRespuestaPositiva(respuesta)) {
    return 'bg-warning text-dark';
  }
  return 'bg-success';
};

const getIconoCategoria = (categoria: string): string => {
  const iconos: Record<string, string> = {
    'Antecedentes Personales': 'fas fa-user',
    'Antecedentes Familiares': 'fas fa-users',
    'Medicamentos': 'fas fa-pills',
    'Alergias': 'fas fa-exclamation-triangle',
    'Hábitos': 'fas fa-smoking',
    'Antecedentes Gineco-Obstétricos': 'fas fa-venus',
    'Revisión por Sistemas': 'fas fa-stethoscope'
  };
  return iconos[categoria] || 'fas fa-file-medical';
};

const formatearFecha = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Watchers
watch(() => props.mostrarAntecedentes, (mostrar) => {
  if (mostrar && props.pacienteId) {
    cargarAntecedentes();
  }
});

watch(() => props.pacienteId, (nuevoPacienteId) => {
  if (props.mostrarAntecedentes && nuevoPacienteId) {
    cargarAntecedentes();
  }
});

// Mount
onMounted(() => {
  if (props.mostrarAntecedentes && props.pacienteId) {
    cargarAntecedentes();
  }
});
</script>

<style scoped>
/* Modal optimized styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex !important;
  align-items: center;
  justify-content: center;
  opacity: 1;
}

.modal-dialog {
  max-width: 98%;
  max-height: 98vh;
  margin: 0;
  width: 100%;
  opacity: 1;
}

.modal-content {
  height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background-color: #ffffff;
  opacity: 1;
}

.modal-header {
  flex-shrink: 0;
  border-bottom: 2px solid #e3f2fd;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.icon-container i {
  font-size: 1.5rem;
  color: white;
}

.title-container h4 {
  font-weight: 600;
  color: white;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  max-height: calc(95vh - 140px);
  font-size: 0.9rem;
  background: linear-gradient(135deg, #f8f9fae8 0%, #ffffff 100%);
}

.modal-footer {
  flex-shrink: 0;
  border-top: 2px solid #e3f2fd;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Patient info card - Compact */
.patient-info-card .card-body {
  padding: 0.8rem 1rem;
}

.patient-info-card .card {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #2196f3;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.15);
}

.patient-info-card .row {
  margin: 0;
}

.patient-info-card .col-md-8,
.patient-info-card .col-md-4 {
  padding: 0.25rem 0;
}

/* Category cards - Compact */
.categoria-antecedentes {
  margin-bottom: 0.75rem;
}

.categoria-card {
  border: 2px solid #e1f5fe;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.categoria-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 0.7rem 0.85rem;
  border-bottom: 2px solid #2196f3;
}

.categoria-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1565c0;
  display: flex;
  align-items: center;
}

.categoria-body {
  padding: 0.75rem;
}

/* Responsive grid - Optimized for more content */
.respuestas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.6rem;
}

.respuesta-item {
  background: #ffffff;
  border: 1px solid #e1f5fe;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.3s ease-in-out;
  font-size: 0.85rem;
  box-shadow: 0 1px 3px rgba(33, 150, 243, 0.1);
}

.respuesta-item:hover {
  border-color: #2196f3;
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.2);
  transform: translateY(-1px);
}

.respuesta-positiva {
  border-left: 4px solid #ff9800;
  background: linear-gradient(to right, #fff8e1 0%, #ffffff 15%);
  box-shadow: 0 2px 6px rgba(255, 152, 0, 0.15);
}

.respuesta-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.pregunta-texto {
  font-weight: 500;
  color: #1565c0;
  font-size: 0.85rem;
  line-height: 1.3;
}

.respuesta-valor {
  display: flex;
  align-items: center;
  margin-top: 0.3rem;
}

.respuesta-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.respuesta-detalle {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border-radius: 0.3rem;
  border-left: 3px solid #4caf50;
}

.detalle-label {
  font-weight: 500;
  color: #2e7d32;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.detalle-content {
  color: #388e3c;
  font-size: 0.8rem;
  line-height: 1.4;
}

.no-respuestas {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
}

/* Alerts section - Compact */
.alertas-medicas-card {
  margin-bottom: 1rem;
}

.alertas-medicas-card .card-header {
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-bottom: 2px solid #ff9800;
}

.alertas-medicas-card .card-body {
  padding: 1rem;
  background: #fffef7;
}

.alerta-item {
  margin-bottom: 0.8rem;
  padding: 0.6rem;
  background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
  border-radius: 0.3rem;
  border-left: 4px solid #ff9800;
  box-shadow: 0 1px 3px rgba(255, 152, 0, 0.2);
}

.alerta-item:last-child {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-dialog {
    max-width: 100%;
    height: 100vh;
  }
  
  .modal-content {
    height: 100vh;
    border-radius: 0;
  }
  
  .modal-body {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  
  .respuestas-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .respuesta-item {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  
  .categoria-header,
  .alertas-medicas-card .card-header {
    padding: 0.5rem 0.7rem;
  }
  
  .categoria-body,
  .alertas-medicas-card .card-body {
    padding: 0.7rem;
  }
  
  .pregunta-texto {
    font-size: 0.8rem;
  }
  
  .respuesta-badge {
    font-size: 0.75rem;
  }
}

@media (min-width: 1400px) {
  .respuestas-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}

@media (min-width: 1600px) {
  .respuestas-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}
</style>
