<template>
  <div v-if="mostrarEncuesta" class="encuesta-modal-backdrop show" @click.self="cerrarEncuesta">
    <div class="encuesta-modal-dialog">
      <div class="encuesta-modal-content">
        <!-- Header -->
        <div class="encuesta-modal-header">
          <div class="header-content">
            <div class="icon-container">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="title-container">
              <h4>Encuesta de Tamizaje Médico</h4>
              <p class="modal-subtitle">
                {{ formulario?.paciente.nombre }} {{ formulario?.paciente.apellido }}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="cerrarEncuesta"
            :disabled="guardando"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body con scroll optimizado -->
        <div class="encuesta-modal-body">
          <!-- Loading estado inicial -->
          <div v-if="cargandoFormulario" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando formulario de tamizaje...</p>
          </div>

          <!-- Encuesta ya completada -->
          <div v-else-if="formulario?.tieneEncuestaPrevia" class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="fas fa-info-circle me-2"></i>
              <div>
                <strong>Encuesta ya completada</strong>
                <p class="mb-0">
                  Este paciente ya tiene una encuesta de tamizaje completada el 
                  {{ formatearFecha(formulario.fechaUltimaEncuesta) }}.
                </p>
              </div>
            </div>
          </div>

          <!-- Formulario de encuesta -->
          <form v-else-if="formulario" @submit.prevent="guardarEncuesta" class="encuesta-form">
            <!-- Instrucciones -->
            <div class="alert alert-light border-0 bg-light mb-4">
              <div class="d-flex align-items-start">
                <i class="fas fa-lightbulb text-warning me-2 mt-1"></i>
                <div>
                  <strong>Instrucciones:</strong>
                  <p class="mb-0 small text-muted">
                    Complete todas las preguntas marcadas como obligatorias (*). 
                    Si responde "SÍ" a alguna pregunta, proporcione los detalles solicitados.
                  </p>
                </div>
              </div>
            </div>

            <!-- Preguntas por categoría -->
            <div v-for="(categoria, index) in formulario.preguntasPorCategoria" :key="categoria.categoria">
              <div class="categoria-section mb-4">
                <!-- Título de categoría -->
                <div class="section-header mb-3">
                  <h5 class="categoria-title">
                    <i :class="getIconoCategoria(categoria.categoria)" class="me-2"></i>
                    {{ categoria.categoria }}
                  </h5>
                </div>

                <!-- Preguntas de la categoría -->
                <div class="preguntas-container">
                  <div 
                    v-for="pregunta in categoria.preguntas" 
                    :key="pregunta.id"
                    class="pregunta-item mb-3"
                  >
                    <div class="pregunta-content">
                      <!-- Texto de la pregunta -->
                      <label :for="`pregunta-${pregunta.id}`" class="pregunta-label">
                        {{ pregunta.texto }}
                        <span v-if="pregunta.requiereDetalle" class="text-danger">*</span>
                      </label>

                      <!-- Campo de respuesta según el tipo -->
                      <div class="respuesta-container mt-2">
                        <!-- Tipo SI/NO -->
                        <div v-if="pregunta.tipo === 'SI_NO'" class="respuesta-opciones">
                          <div class="form-check form-check-inline">
                            <input
                              :id="`pregunta-${pregunta.id}-si`"
                              v-model="respuestas[pregunta.id]"
                              type="radio"
                              :name="`pregunta-${pregunta.id}`"
                              value="SI"
                              class="form-check-input"
                              @change="onRespuestaChange(pregunta.id, 'SI')"
                            >
                            <label :for="`pregunta-${pregunta.id}-si`" class="form-check-label">
                              Sí
                            </label>
                          </div>
                          <div class="form-check form-check-inline">
                            <input
                              :id="`pregunta-${pregunta.id}-no`"
                              v-model="respuestas[pregunta.id]"
                              type="radio"
                              :name="`pregunta-${pregunta.id}`"
                              value="NO"
                              class="form-check-input"
                              @change="onRespuestaChange(pregunta.id, 'NO')"
                            >
                            <label :for="`pregunta-${pregunta.id}-no`" class="form-check-label">
                              No
                            </label>
                          </div>
                        </div>

                        <!-- Tipo TEXTO -->
                        <div v-else-if="pregunta.tipo === 'TEXTO'" class="respuesta-texto">
                          <textarea
                            :id="`pregunta-${pregunta.id}`"
                            v-model="respuestas[pregunta.id]"
                            class="form-control"
                            rows="3"
                            :placeholder="'Escriba su respuesta...'"
                            @input="onRespuestaChange(pregunta.id, ($event.target as HTMLTextAreaElement)?.value || '')"
                          ></textarea>
                        </div>

                        <!-- Tipo NUMERO -->
                        <div v-else-if="pregunta.tipo === 'NUMERO'" class="respuesta-numero">
                          <input
                            :id="`pregunta-${pregunta.id}`"
                            v-model="respuestas[pregunta.id]"
                            type="number"
                            class="form-control"
                            :placeholder="'Ingrese un número...'"
                            @input="onRespuestaChange(pregunta.id, ($event.target as HTMLInputElement)?.value || '')"
                          >
                        </div>

                        <!-- Campo de detalle (cuando requiere detalle y la respuesta es SÍ) -->
                        <div 
                          v-if="pregunta.requiereDetalle && respuestas[pregunta.id] === 'SI'" 
                          class="detalle-container mt-2"
                        >
                          <label :for="`detalle-${pregunta.id}`" class="form-label text-muted small">
                            Por favor, especifique los detalles:
                          </label>
                          <textarea
                            :id="`detalle-${pregunta.id}`"
                            v-model="detalles[pregunta.id]"
                            class="form-control form-control-sm"
                            rows="2"
                            placeholder="Proporcione más información..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Separador entre categorías -->
              <hr v-if="index < formulario.preguntasPorCategoria.length - 1" class="categoria-separator">
            </div>

            <!-- Resumen de progreso -->
            <div class="progress-summary alert alert-light mt-4">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">
                  <i class="fas fa-chart-pie me-2"></i>
                  Progreso: {{ preguntasRespondidas }} de {{ totalPreguntas }} preguntas
                </span>
                <div class="progress" style="width: 200px; height: 8px;">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    :style="`width: ${porcentajeProgreso}%`"
                    :aria-valuenow="porcentajeProgreso" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </form>

          <!-- Error state -->
          <div v-else-if="error" class="alert alert-danger">
            <div class="d-flex align-items-center">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Error al cargar formulario</strong>
                <p class="mb-0">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="formulario && !formulario.tieneEncuestaPrevia" class="encuesta-modal-footer">
          <div class="footer-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="cerrarEncuesta"
              :disabled="guardando"
            >
              <i class="fas fa-times me-2"></i>
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="guardarEncuesta"
              :disabled="!formularioCompleto || guardando"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ guardando ? 'Guardando...' : 'Guardar Encuesta' }}
            </button>
          </div>
        </div>

        <div v-else-if="formulario?.tieneEncuestaPrevia" class="encuesta-modal-footer">
          <div class="footer-actions">
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="verAntecedentes"
            >
              <i class="fas fa-eye me-2"></i>
              Ver Antecedentes
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="cerrarEncuesta"
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
import { encuestaService, type FormularioTamizaje, type CrearEncuestaDto } from '@/services/encuestaService';
import type { PacienteLista } from '@/types/patient';

// Props
interface Props {
  mostrarEncuesta: boolean;
  paciente: PacienteLista | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  cerrar: [];
  guardado: [encuestaId: number];
  verAntecedentes: [pacienteId: number];
}>();

// Estados reactivos
const cargandoFormulario = ref(false);
const guardando = ref(false);
const error = ref('');
const formulario = ref<FormularioTamizaje | null>(null);
const respuestas = ref<Record<number, string>>({});
const detalles = ref<Record<number, string>>({});

// Computed properties
const totalPreguntas = computed(() => {
  if (!formulario.value) return 0;
  return formulario.value.preguntasPorCategoria.reduce(
    (total, categoria) => total + categoria.preguntas.length, 
    0
  );
});

const preguntasRespondidas = computed(() => {
  return Object.keys(respuestas.value).filter(key => respuestas.value[parseInt(key)]).length;
});

const porcentajeProgreso = computed(() => {
  if (totalPreguntas.value === 0) return 0;
  return Math.round((preguntasRespondidas.value / totalPreguntas.value) * 100);
});

const formularioCompleto = computed(() => {
  if (!formulario.value) return false;
  
  // Verificar que todas las preguntas obligatorias estén respondidas
  for (const categoria of formulario.value.preguntasPorCategoria) {
    for (const pregunta of categoria.preguntas) {
      const respuesta = respuestas.value[pregunta.id];
      
      // Si la pregunta requiere detalle y la respuesta es SÍ, debe tener detalle
      if (pregunta.requiereDetalle && respuesta === 'SI' && !detalles.value[pregunta.id]) {
        return false;
      }
      
      // Todas las preguntas son obligatorias
      if (!respuesta) {
        return false;
      }
    }
  }
  
  return true;
});

// Métodos
const cargarFormulario = async () => {
  if (!props.paciente) return;
  
  try {
    cargandoFormulario.value = true;
    error.value = '';
    
    formulario.value = await encuestaService.obtenerFormulario(
      props.paciente.id, 
      props.paciente.genero || undefined
    );
    
    // Resetear respuestas
    respuestas.value = {};
    detalles.value = {};
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    cargandoFormulario.value = false;
  }
};

const onRespuestaChange = (preguntaId: number, valor: string) => {
  respuestas.value[preguntaId] = valor;
  
  // Si la respuesta no es SÍ, limpiar el detalle
  if (valor !== 'SI') {
    delete detalles.value[preguntaId];
  }
};

const guardarEncuesta = async () => {
  if (!formulario.value || !props.paciente || !formularioCompleto.value) return;
  
  try {
    guardando.value = true;
    
    // Preparar los datos de la encuesta
    const encuestaData: CrearEncuestaDto = {
      pacienteId: props.paciente.id,
      respuestas: Object.entries(respuestas.value).map(([preguntaId, respuesta]) => ({
        preguntaId: parseInt(preguntaId),
        respuesta,
        detalle: detalles.value[parseInt(preguntaId)] || undefined
      }))
    };
    
    const encuestaCreada = await encuestaService.crearEncuesta(encuestaData);
    
    emit('guardado', encuestaCreada.id);
    cerrarEncuesta();
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al guardar la encuesta';
  } finally {
    guardando.value = false;
  }
};

const verAntecedentes = () => {
  if (props.paciente) {
    emit('verAntecedentes', props.paciente.id);
  }
};

const cerrarEncuesta = () => {
  emit('cerrar');
};

const formatearFecha = (fecha: Date | undefined) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

// Watchers
watch(() => props.mostrarEncuesta, (nuevoValor) => {
  if (nuevoValor && props.paciente) {
    cargarFormulario();
  }
});

watch(() => props.paciente, (nuevoPaciente) => {
  if (nuevoPaciente && props.mostrarEncuesta) {
    cargarFormulario();
  }
});

// Lifecycle
onMounted(() => {
  if (props.mostrarEncuesta && props.paciente) {
    cargarFormulario();
  }
});
</script>

<style scoped>
/* ========================================
   MODAL PERSONALIZADO PARA ENCUESTA
======================================== */

/* Backdrop del modal */
.encuesta-modal-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(3px) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 1rem !important;
  box-sizing: border-box !important;
}

.encuesta-modal-backdrop.show {
  opacity: 1 !important;
}

/* Modal dialog */
.encuesta-modal-dialog {
  width: 100% !important;
  max-width: 900px !important;
  max-height: 95vh !important;
  margin: 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border-radius: 1rem !important;
  box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.3) !important;
  overflow: hidden !important;
}

/* Modal content */
.encuesta-modal-content {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  max-height: 95vh !important;
  overflow: hidden !important;
}

/* Header del modal */
.encuesta-modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
  border-radius: 1rem 1rem 0 0 !important;
}

.header-content {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
  flex: 1 !important;
}

.icon-container {
  width: 50px !important;
  height: 50px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.2rem !important;
  color: white !important;
  flex-shrink: 0 !important;
}

.title-container h4 {
  margin: 0 !important;
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  color: white !important;
}

.modal-subtitle {
  margin: 0 !important;
  font-size: 0.85rem !important;
  opacity: 0.9 !important;
  color: white !important;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  opacity: 1 !important;
  font-size: 1rem !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1) !important;
}

/* Body del modal con scroll optimizado */
.encuesta-modal-body {
  flex: 1 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 1.5rem !important;
  min-height: 0 !important;
  max-height: calc(95vh - 200px) !important;
  
  /* Scroll personalizado */
  scrollbar-width: thin !important;
  scrollbar-color: #cbd5e0 #f7fafc !important;
}

/* Webkit scrollbar para Chrome/Safari */
.encuesta-modal-body::-webkit-scrollbar {
  width: 8px !important;
}

.encuesta-modal-body::-webkit-scrollbar-track {
  background: #f7fafc !important;
  border-radius: 4px !important;
}

.encuesta-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e0 !important;
  border-radius: 4px !important;
  transition: background 0.2s ease !important;
}

.encuesta-modal-body::-webkit-scrollbar-thumb:hover {
  background: #a0aec0 !important;
}

/* Footer del modal */
.encuesta-modal-footer {
  background: #f8f9fa !important;
  border-top: 1px solid #e9ecef !important;
  padding: 1.25rem 1.5rem !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 1rem !important;
  flex-shrink: 0 !important;
  border-radius: 0 0 1rem 1rem !important;
}

.footer-actions {
  display: flex !important;
  gap: 1rem !important;
  align-items: center !important;
}

.footer-actions .btn {
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
  border-radius: 0.5rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
}

.footer-actions .btn-secondary {
  background: #6c757d !important;
  border-color: #6c757d !important;
  color: white !important;
}

.footer-actions .btn-secondary:hover {
  background: #5c636a !important;
  border-color: #565e64 !important;
  transform: translateY(-2px) !important;
}

.footer-actions .btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  color: white !important;
}

.footer-actions .btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 0.5rem 1rem rgba(102, 126, 234, 0.3) !important;
}

.footer-actions .btn:disabled {
  opacity: 0.6 !important;
  transform: none !important;
  cursor: not-allowed !important;
}

/* ========================================
   CONTENIDO DE LA ENCUESTA
======================================== */

.encuesta-form {
  font-size: 0.95rem !important;
}

/* Alertas mejoradas */
.alert {
  border-radius: 0.75rem !important;
  border: 1px solid rgba(13, 110, 253, 0.2) !important;
  margin-bottom: 1.5rem !important;
}

.alert-light {
  background: rgba(248, 249, 250, 0.8) !important;
  border-color: #e9ecef !important;
}

.alert-info {
  background: rgba(13, 110, 253, 0.1) !important;
  border-color: rgba(13, 110, 253, 0.2) !important;
  color: #0d6efd !important;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.1) !important;
  border-color: rgba(220, 53, 69, 0.2) !important;
  color: #dc3545 !important;
}

/* Secciones de categorías */
.categoria-section {
  background: #f8f9fa !important;
  border-radius: 0.75rem !important;
  padding: 1.5rem !important;
  border-left: 4px solid #0d6efd !important;
  margin-bottom: 1.5rem !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.section-header {
  border-bottom: 2px solid #e9ecef !important;
  padding-bottom: 0.75rem !important;
  margin-bottom: 1rem !important;
}

.categoria-title {
  color: #495057 !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
}

.preguntas-container {
  padding-top: 0.5rem !important;
}

/* Items de preguntas */
.pregunta-item {
  background: white !important;
  border-radius: 0.5rem !important;
  padding: 1.25rem !important;
  border: 1px solid #e9ecef !important;
  transition: all 0.2s ease !important;
  margin-bottom: 1rem !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.pregunta-item:hover {
  border-color: #0d6efd !important;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.1) !important;
  transform: translateY(-1px) !important;
}

.pregunta-item:last-child {
  margin-bottom: 0 !important;
}

.pregunta-label {
  font-weight: 600 !important;
  color: #495057 !important;
  margin-bottom: 0 !important;
  line-height: 1.5 !important;
  display: block !important;
}

.respuesta-container {
  margin-top: 0.75rem !important;
}

/* Opciones de respuesta */
.respuesta-opciones {
  display: flex !important;
  gap: 1.5rem !important;
  align-items: center !important;
  flex-wrap: wrap !important;
}

.form-check {
  margin-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
}

.form-check-input {
  margin-top: 0 !important;
  margin-right: 0.5rem !important;
  width: 1.2rem !important;
  height: 1.2rem !important;
}

.form-check-label {
  font-weight: 500 !important;
  color: #495057 !important;
  cursor: pointer !important;
  margin-bottom: 0 !important;
}

/* Campos de texto y número */
.respuesta-texto .form-control,
.respuesta-numero .form-control {
  border: 2px solid #e9ecef !important;
  border-radius: 0.5rem !important;
  padding: 0.75rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
}

.respuesta-texto .form-control:focus,
.respuesta-numero .form-control:focus {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1) !important;
}

/* Container de detalles */
.detalle-container {
  background: #fff3cd !important;
  border-radius: 0.5rem !important;
  padding: 0.75rem !important;
  border-left: 3px solid #ffc107 !important;
  margin-top: 0.75rem !important;
}

.detalle-container .form-label {
  font-weight: 600 !important;
  margin-bottom: 0.5rem !important;
  color: #856404 !important;
  font-size: 0.85rem !important;
}

.detalle-container .form-control {
  border: 1px solid #ffeaa7 !important;
  background: #fff !important;
  font-size: 0.9rem !important;
}

.detalle-container .form-control:focus {
  border-color: #ffc107 !important;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.1) !important;
}

/* Separadores */
.categoria-separator {
  border: none !important;
  height: 2px !important;
  background: linear-gradient(90deg, transparent, #dee2e6, transparent) !important;
  margin: 2rem 0 !important;
}

/* Resumen de progreso */
.progress-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 0.75rem !important;
  padding: 1rem !important;
  margin-top: 1.5rem !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.progress {
  background-color: #e9ecef !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  height: 10px !important;
}

.progress-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  transition: width 0.4s ease !important;
  border-radius: 6px !important;
}

/* ========================================
   RESPONSIVE DESIGN
======================================== */

/* Tablets */
@media (max-width: 992px) {
  .encuesta-modal-dialog {
    max-width: 95% !important;
    margin: 0.5rem !important;
  }
  
  .encuesta-modal-header {
    padding: 1.25rem !important;
  }
  
  .encuesta-modal-body {
    padding: 1.25rem !important;
    max-height: calc(95vh - 180px) !important;
  }
  
  .categoria-section {
    padding: 1.25rem !important;
  }
  
  .pregunta-item {
    padding: 1rem !important;
  }
}

/* Móviles */
@media (max-width: 768px) {
  .encuesta-modal-backdrop {
    padding: 0.5rem !important;
  }
  
  .encuesta-modal-dialog {
    max-width: 100% !important;
    margin: 0 !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
  
  .encuesta-modal-content {
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
  
  .encuesta-modal-header {
    padding: 1rem !important;
    border-radius: 0 !important;
  }
  
  .header-content {
    gap: 0.75rem !important;
  }
  
  .icon-container {
    width: 40px !important;
    height: 40px !important;
    font-size: 1rem !important;
  }
  
  .title-container h4 {
    font-size: 1.1rem !important;
  }
  
  .modal-subtitle {
    font-size: 0.8rem !important;
  }
  
  .encuesta-modal-body {
    padding: 1rem !important;
    max-height: calc(100vh - 160px) !important;
  }
  
  .categoria-section {
    padding: 1rem !important;
    margin-bottom: 1rem !important;
  }
  
  .pregunta-item {
    padding: 0.875rem !important;
    margin-bottom: 0.75rem !important;
  }
  
  .pregunta-label {
    font-size: 0.9rem !important;
  }
  
  .respuesta-opciones {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.75rem !important;
  }
  
  .form-check {
    width: 100% !important;
  }
  
  .encuesta-modal-footer {
    padding: 1rem !important;
    flex-direction: column !important;
    gap: 0.75rem !important;
  }
  
  .footer-actions {
    width: 100% !important;
    flex-direction: column-reverse !important;
    gap: 0.75rem !important;
  }
  
  .footer-actions .btn {
    width: 100% !important;
    justify-content: center !important;
  }
  
  .progress-summary {
    padding: 0.75rem !important;
  }
  
  .progress-summary .d-flex {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }
  
  .progress {
    width: 100% !important;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .encuesta-modal-body {
    padding: 0.75rem !important;
  }
  
  .categoria-section {
    padding: 0.75rem !important;
  }
  
  .pregunta-item {
    padding: 0.75rem !important;
  }
  
  .categoria-title {
    font-size: 1rem !important;
  }
  
  .pregunta-label {
    font-size: 0.85rem !important;
  }
  
  .alert {
    padding: 0.75rem !important;
    font-size: 0.85rem !important;
  }
}

/* ========================================
   MEJORAS DE ACCESIBILIDAD
======================================== */

/* Focus states mejorados */
.btn-close:focus,
.form-check-input:focus,
.form-control:focus {
  outline: 2px solid #0d6efd !important;
  outline-offset: 2px !important;
}

/* Indicadores de estado */
.pregunta-item.respondida {
  border-color: #198754 !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%) !important;
}

.pregunta-item.pendiente {
  border-color: #ffc107 !important;
}

/* Smooth scroll en el body del modal */
.encuesta-modal-body {
  scroll-behavior: smooth !important;
}

/* Animaciones suaves */
.pregunta-item,
.categoria-section,
.alert {
  animation: fadeInUp 0.3s ease-out !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0 !important;
    transform: translateY(20px) !important;
  }
  to {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
}

/* Indicador de scroll */
.encuesta-modal-body::before {
  content: '' !important;
  position: sticky !important;
  top: -1.5rem !important;
  left: 0 !important;
  right: 0 !important;
  height: 10px !important;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%) !important;
  z-index: 10 !important;
  pointer-events: none !important;
}

.encuesta-modal-body::after {
  content: '' !important;
  position: sticky !important;
  bottom: -1.5rem !important;
  left: 0 !important;
  right: 0 !important;
  height: 10px !important;
  background: linear-gradient(0deg, rgba(255,255,255,0.9) 0%, transparent 100%) !important;
  z-index: 10 !important;
  pointer-events: none !important;
}
</style>
