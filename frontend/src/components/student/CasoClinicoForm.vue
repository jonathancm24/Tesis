<template>
  <div v-if="mostrarFormulario" class="caso-clinico-backdrop show" @click.self="cerrarFormulario">
    <div class="caso-clinico-modal">
      <div class="caso-clinico-content">
        <!-- Header -->
        <div class="caso-clinico-header">
          <div class="header-content">
            <div class="icon-container">
              <i class="fas fa-file-medical"></i>
            </div>
            <div class="title-container">
              <h4>Nuevo Caso Clínico</h4>
              <p class="modal-subtitle" v-if="paciente">
                {{ paciente.nombre }} {{ paciente.apellido }} - {{ paciente.cedula }}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="cerrarFormulario"
            :disabled="guardando"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div class="step" :class="{ active: seccionActual === 'motivo', completed: seccionesCompletas.motivo }">
            <div class="step-number">1</div>
            <span>Motivo de Consulta</span>
          </div>
          <div class="step" :class="{ active: seccionActual === 'enfermedad', completed: seccionesCompletas.enfermedad }">
            <div class="step-number">2</div>
            <span>Enfermedad Actual</span>
          </div>
          <div class="step" :class="{ active: seccionActual === 'examen-general', completed: seccionesCompletas.examenGeneral }">
            <div class="step-number">3</div>
            <span>Examen Físico General</span>
          </div>
          <div class="step" :class="{ active: seccionActual === 'examen-regional', completed: seccionesCompletas.examenRegional }">
            <div class="step-number">4</div>
            <span>Examen Físico Regional</span>
          </div>
          <div class="step" :class="{ active: seccionActual === 'examen-bucal', completed: seccionesCompletas.examenBucal }">
            <div class="step-number">5</div>
            <span>Examen Físico Bucal</span>
          </div>
          <div class="step" :class="{ active: seccionActual === 'estudios', completed: seccionesCompletas.estudios }">
            <div class="step-number">6</div>
            <span>Estudios Complementarios</span>
          </div>
        </div>

        <!-- Body con navegación por secciones -->
        <div class="caso-clinico-body">
          
          <!-- Sección 1: Motivo de Consulta -->
          <div v-show="seccionActual === 'motivo'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-comment-medical me-2"></i>Motivo de Consulta</h5>
              <p class="text-muted">¿Por qué razón acude el paciente a consulta?</p>
            </div>
            <div class="form-group">
              <label class="form-label">Motivo de la consulta *</label>
              <textarea
                v-model="formulario.motivoConsulta"
                class="form-control"
                rows="4"
                placeholder="Describa el motivo principal por el cual el paciente acude a consulta..."
                required
              ></textarea>
            </div>
          </div>

          <!-- Sección 2: Enfermedad Actual -->
          <div v-show="seccionActual === 'enfermedad'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-notes-medical me-2"></i>Enfermedad Actual</h5>
              <p class="text-muted">Relato cronológico detallado de signos y síntomas</p>
            </div>
            
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Sexo del paciente *</label>
                <select v-model="formulario.sexo" class="form-select" required>
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Edad actual *</label>
                <input 
                  v-model="formulario.edad" 
                  type="number" 
                  class="form-control" 
                  placeholder="Años"
                  min="0"
                  max="120"
                  required
                >
              </div>
              <div class="col-12">
                <label class="form-label">Relato cronológico de la enfermedad *</label>
                <textarea
                  v-model="formulario.enfermedadActual"
                  class="form-control"
                  rows="6"
                  placeholder="Describa cronológicamente los signos y síntomas. Si presenta dolor, especifique: desde cuándo, intensidad (1-10), evolución, ubicación, tipo de dolor, medicación previa tomada y por qué acude específicamente a clínicas de odontología..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Sección 3: Examen Físico General -->
          <div v-show="seccionActual === 'examen-general'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-user-md me-2"></i>Examen Físico General</h5>
              <p class="text-muted">Evaluación general del estado físico del paciente</p>
            </div>
            
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Peso (kg) *</label>
                <input 
                  v-model="formulario.peso" 
                  type="number" 
                  class="form-control" 
                  placeholder="Ej: 70.5"
                  step="0.1"
                  min="0"
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label">Talla (cm) *</label>
                <input 
                  v-model="formulario.talla" 
                  type="number" 
                  class="form-control" 
                  placeholder="Ej: 165"
                  step="0.1"
                  min="0"
                  required
                >
              </div>
              <div class="col-12">
                <label class="form-label">Facies *</label>
                <textarea
                  v-model="formulario.facies"
                  class="form-control"
                  rows="3"
                  placeholder="Describa las características faciales del paciente (expresión, color, simetría, etc.)..."
                  required
                ></textarea>
              </div>
              <div class="col-12">
                <label class="form-label">Marcha *</label>
                <textarea
                  v-model="formulario.marcha"
                  class="form-control"
                  rows="3"
                  placeholder="Describa la forma de caminar del paciente (normal, alterada, uso de apoyo, etc.)..."
                  required
                ></textarea>
              </div>
              <div class="col-12">
                <label class="form-label">Piel y Mucosas *</label>
                <textarea
                  v-model="formulario.PielyMucosa"
                  class="form-control"
                  rows="3"
                  placeholder="Describa el estado de la piel y mucosas (color, hidratación, lesiones, etc.)..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Sección 4: Examen Físico Regional -->
          <div v-show="seccionActual === 'examen-regional'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-head-side-mask me-2"></i>Examen Físico Regional</h5>
              <p class="text-muted">Evaluación específica de cabeza, cara, cuello y ATM</p>
            </div>
            
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Cráneo *</label>
                <textarea
                  v-model="formulario.craneo"
                  class="form-control"
                  rows="3"
                  placeholder="Describa características del cráneo (forma, tamaño, simetría, lesiones, etc.)..."
                  required
                ></textarea>
              </div>
              <div class="col-12">
                <label class="form-label">Cara y Cuello *</label>
                <textarea
                  v-model="formulario.CarayCuello"
                  class="form-control"
                  rows="4"
                  placeholder="Describa simetrías, perfil, estado de la piel, cadenas ganglionares, tiroides, glándulas salivales..."
                  required
                ></textarea>
              </div>
              <div class="col-12">
                <label class="form-label">ATM (Articulación Temporomandibular) *</label>
                <textarea
                  v-model="formulario.ATM"
                  class="form-control"
                  rows="4"
                  placeholder="Evalúe dolor, chasquido, luxación, desviación, apertura bucal (medida en mm)..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Sección 5: Examen Físico Bucal -->
          <div v-show="seccionActual === 'examen-bucal'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-tooth me-2"></i>Examen Físico Bucal</h5>
              <p class="text-muted">Odontograma y topografía de la mucosa oral</p>
            </div>
            
            <!-- Odontograma compacto con mejor aprovechamiento del espacio -->
            <div class="subseccion-odontograma-completa">
              <h6 class="subseccion-title">
                <i class="fas fa-teeth me-2"></i>Odontograma Completo
              </h6>
              <div class="odontograma-container-expandido">
                <OdontogramaCompacto 
                  v-model="formulario.odontograma"
                  v-model:hallazgos="hallazgosEncontrados"
                  @change="onOdontogramaChange"
                />
              </div>
            </div>

            <!-- Tabla de hallazgos odontológicos -->
            <div v-if="hallazgosEncontrados.length > 0" class="subseccion">
              <h6 class="subseccion-title">
                <i class="fas fa-list me-2"></i>Hallazgos Odontológicos
              </h6>
              <div class="table-responsive">
                <table class="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Diente</th>
                      <th>Superficie</th>
                      <th>Condición</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(hallazgo, index) in hallazgosEncontrados" :key="`${hallazgo.diente}-${hallazgo.superficie}`">
                      <td><strong>{{ hallazgo.diente }}</strong></td>
                      <td>
                        <span class="badge bg-info">{{ hallazgo.superficie }}</span>
                      </td>
                      <td>
                        <span class="badge" :class="getBadgeClass(hallazgo.condicion)">
                          {{ getEstadoTexto(hallazgo.condicion) }}
                        </span>
                      </td>
                      <td>
                        <button 
                          @click="removerHallazgo(index)"
                          class="btn btn-sm btn-outline-danger"
                          title="Quitar hallazgo"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Topografía de mucosa compacta -->
            <div class="subseccion">
              <h6 class="subseccion-title">
                <i class="fas fa-map me-2"></i>Topografía de la Mucosa Oral
              </h6>
              <TopografiaMucosaCompacta 
                v-model="formulario.topografiaMucosa"
                @change="onTopografiaChange"
              />
            </div>

            <!-- Tabla de mucosas seleccionadas -->
            <div v-if="mucosasSeleccionadas.length > 0" class="subseccion">
              <h6 class="subseccion-title">
                <i class="fas fa-list me-2"></i>Áreas de mucosa con hallazgos
              </h6>
              <div class="table-responsive">
                <table class="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Localización</th>
                      <th>Vista</th>
                      <th>Descripción/Observación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mucosa in mucosasSeleccionadas" :key="`${mucosa.vista}-${mucosa.numero}`">
                      <td><strong>{{ mucosa.numero }}</strong></td>
                      <td>{{ mucosa.nombre }}</td>
                      <td>
                        <span class="badge bg-info">{{ mucosa.vista }}</span>
                      </td>
                      <td>
                        <input 
                          v-model="mucosa.descripcion" 
                          type="text" 
                          class="form-control form-control-sm"
                          placeholder="Descripción del hallazgo..."
                        >
                      </td>
                      <td>
                        <button 
                          @click="removerMucosa(mucosa.vista, mucosa.numero)"
                          class="btn btn-sm btn-outline-danger"
                          title="Quitar"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sección 6: Estudios Complementarios -->
          <div v-show="seccionActual === 'estudios'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-x-ray me-2"></i>Estudios Complementarios</h5>
              <p class="text-muted">¿Se requieren estudios adicionales?</p>
            </div>
            
            <div class="estudios-grid">
              <div 
                v-for="estudio in tiposEstudios" 
                :key="estudio.id"
                class="estudio-item"
              >
                <div class="form-check">
                  <input
                    :id="`estudio-${estudio.id}`"
                    v-model="formulario.estudiosComplementarios[estudio.id]"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label :for="`estudio-${estudio.id}`" class="form-check-label">
                    <i :class="estudio.icon" class="me-2"></i>
                    {{ estudio.nombre }}
                  </label>
                </div>
                <div 
                  v-if="formulario.estudiosComplementarios[estudio.id]" 
                  class="estudio-detalle mt-2"
                >
                  <textarea
                    v-model="formulario.detalleEstudios[estudio.id]"
                    class="form-control form-control-sm"
                    rows="2"
                    :placeholder="`Especifique detalles del ${estudio.nombre.toLowerCase()}...`"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Nota importante sobre estudios -->
            <div class="alert alert-info mt-4">
              <div class="d-flex align-items-start">
                <i class="fas fa-info-circle me-2 mt-1"></i>
                <div>
                  <strong>Nota importante:</strong>
                  <p class="mb-0">
                    Si selecciona estudios complementarios, se agendará una nueva cita para la evaluación de resultados. 
                    El caso clínico quedará pendiente hasta que se completen los estudios solicitados.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer con navegación -->
        <div class="caso-clinico-footer">
          <div class="navigation-buttons">
            <button 
              v-if="seccionActual !== 'motivo'"
              type="button" 
              class="btn btn-outline-secondary" 
              @click="seccionAnterior"
            >
              <i class="fas fa-arrow-left me-2"></i>
              Anterior
            </button>
            
            <div class="spacer"></div>
            
            <button 
              v-if="seccionActual !== 'estudios'"
              type="button" 
              class="btn btn-primary" 
              @click="seccionSiguiente"
              :disabled="!seccionActualCompleta"
            >
              Siguiente
              <i class="fas fa-arrow-right ms-2"></i>
            </button>
            
            <button 
              v-if="seccionActual === 'estudios'"
              type="button" 
              class="btn btn-success" 
              @click="guardarCasoClinico"
              :disabled="!formularioCompleto || guardando"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-paper-plane me-2"></i>
              {{ guardando ? 'Enviando...' : 'Enviar a Revisión' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import OdontogramaCompacto from './OdontogramaCompacto.vue';
import TopografiaMucosaCompacta from './TopografiaMucosaCompacta.vue';
import type { PacienteLista } from '@/types/patient';

// Interfaces para odontograma
interface HallazgoOdontologico {
  diente: string;
  superficie: string;
  condicion: string;
}

// Props
interface Props {
  mostrarFormulario: boolean;
  paciente: PacienteLista | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  cerrar: [];
  guardado: [casoId: number];
}>();

const router = useRouter();

// Estado del formulario
const seccionActual = ref<'motivo' | 'enfermedad' | 'examen-general' | 'examen-regional' | 'examen-bucal' | 'estudios'>('motivo');
const guardando = ref(false);

// Variable reactiva para hallazgos odontológicos
const hallazgosEncontrados = ref<HallazgoOdontologico[]>([]);

// Datos del formulario
const formulario = ref({
  // Motivo de consulta
  motivoConsulta: '',
  
  // Enfermedad actual
  sexo: '',
  edad: null as number | null,
  enfermedadActual: '',
  
  // Examen físico general
  peso: null as number | null,
  talla: null as number | null,
  facies: '',
  marcha: '',
  PielyMucosa: '',
  
  // Examen físico regional
  craneo: '',
  CarayCuello: '',
  ATM: '',
  
  // Examen físico bucal
  odontograma: [] as any[],
  topografiaMucosa: {
    superior: [] as any[],
    inferior: [] as any[]
  },
  
  // Estudios complementarios
  estudiosComplementarios: {} as Record<string, boolean>,
  detalleEstudios: {} as Record<string, string>
});

// Tipos de estudios complementarios
const tiposEstudios = [
  { id: 'imagenologico', nombre: 'Solicitud de estudio imagenológico', icon: 'fas fa-x-ray' },
  { id: 'paraclinicos', nombre: 'Solicitud de estudio paraclínicos', icon: 'fas fa-vial' },
  { id: 'fotografico', nombre: 'Solicitud de estudio fotográfico', icon: 'fas fa-camera' },
  { id: 'modelos', nombre: 'Solicitud de modelos de estudio', icon: 'fas fa-cube' },
  { id: 'encerado', nombre: 'Encerado diagnóstico', icon: 'fas fa-palette' },
  { id: 'otro', nombre: 'Otro', icon: 'fas fa-plus' }
];

// Computed properties para validación
const seccionesCompletas = computed(() => ({
  motivo: !!formulario.value.motivoConsulta.trim(),
  enfermedad: !!(formulario.value.sexo && formulario.value.edad && formulario.value.enfermedadActual.trim()),
  examenGeneral: !!(formulario.value.peso && formulario.value.talla && formulario.value.facies.trim() && 
                   formulario.value.marcha.trim() && formulario.value.PielyMucosa.trim()),
  examenRegional: !!(formulario.value.craneo.trim() && formulario.value.CarayCuello.trim() && formulario.value.ATM.trim()),
  examenBucal: true, // Siempre válido, pueden estar vacíos
  estudios: true // Siempre válido, son opcionales
}));

const seccionActualCompleta = computed(() => {
  switch (seccionActual.value) {
    case 'motivo': return seccionesCompletas.value.motivo;
    case 'enfermedad': return seccionesCompletas.value.enfermedad;
    case 'examen-general': return seccionesCompletas.value.examenGeneral;
    case 'examen-regional': return seccionesCompletas.value.examenRegional;
    case 'examen-bucal': return seccionesCompletas.value.examenBucal;
    case 'estudios': return seccionesCompletas.value.estudios;
    default: return false;
  }
});

const formularioCompleto = computed(() => {
  return Object.values(seccionesCompletas.value).every(completa => completa);
});

// Computed para dientes con estado
// Computed para mucosas seleccionadas
const mucosasSeleccionadas = computed(() => {
  const seleccionadas: Array<{
    numero: number;
    nombre: string;
    marcado: boolean;
    vista: string;
    descripcion: string;
  }> = [];
  
  // Superior
  formulario.value.topografiaMucosa.superior.forEach(item => {
    if (item.marcado) {
      seleccionadas.push({
        ...item,
        vista: 'Superior',
        descripcion: item.descripcion || ''
      });
    }
  });
  
  // Inferior
  formulario.value.topografiaMucosa.inferior.forEach(item => {
    if (item.marcado) {
      seleccionadas.push({
        ...item,
        vista: 'Inferior',
        descripcion: item.descripcion || ''
      });
    }
  });
  
  return seleccionadas;
});

// Métodos de navegación
const seccionSiguiente = () => {
  const secciones = ['motivo', 'enfermedad', 'examen-general', 'examen-regional', 'examen-bucal', 'estudios'];
  const indiceActual = secciones.indexOf(seccionActual.value);
  if (indiceActual < secciones.length - 1) {
    seccionActual.value = secciones[indiceActual + 1] as any;
  }
};

const seccionAnterior = () => {
  const secciones = ['motivo', 'enfermedad', 'examen-general', 'examen-regional', 'examen-bucal', 'estudios'];
  const indiceActual = secciones.indexOf(seccionActual.value);
  if (indiceActual > 0) {
    seccionActual.value = secciones[indiceActual - 1] as any;
  }
};

// Métodos de manipulación de datos
const onOdontogramaChange = (dientes: any[]) => {
  formulario.value.odontograma = dientes;
};

const onTopografiaChange = (datos: any) => {
  formulario.value.topografiaMucosa = datos;
};

const removerHallazgo = (index: number) => {
  // Remover hallazgo de la lista
  hallazgosEncontrados.value.splice(index, 1);
};

const removerMucosa = (vista: string, numero: number) => {
  const lista = vista === 'Superior' ? formulario.value.topografiaMucosa.superior : formulario.value.topografiaMucosa.inferior;
  const item = lista.find(i => i.numero === numero);
  if (item) {
    item.marcado = false;
    item.descripcion = '';
  }
};

// Métodos de utilidad
const getBadgeClass = (estado: string) => {
  const clases: Record<string, string> = {
    'healthy': 'bg-success',
    'caries': 'bg-danger',
    'filling': 'bg-primary',
    'crown': 'bg-warning',
    'missing': 'bg-dark',
    'root-canal': 'bg-info',
    'implant': 'bg-secondary',
    'bridge': 'bg-warning text-dark',
    'extraction': 'bg-danger'
  };
  return clases[estado] || 'bg-secondary';
};

const getEstadoTexto = (estado: string) => {
  const textos: Record<string, string> = {
    'healthy': 'Sano',
    'caries': 'Caries',
    'filling': 'Obturación',
    'crown': 'Corona',
    'missing': 'Ausente',
    'root-canal': 'Endodoncia',
    'implant': 'Implante',
    'bridge': 'Puente',
    'extraction': 'Extracción'
  };
  return textos[estado] || estado;
};

// Métodos principales
const guardarCasoClinico = async () => {
  if (!props.paciente || !formularioCompleto.value) return;
  
  try {
    guardando.value = true;
    
    // Aquí iría la lógica para enviar al backend
    console.log('Guardando caso clínico:', {
      pacienteId: props.paciente.id,
      ...formulario.value
    });
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    emit('guardado', Math.random()); // Simular ID
    cerrarFormulario();
    
    // Redirigir a la página de casos clínicos
    router.push('/student/cases');
    
  } catch (error) {
    console.error('Error al guardar caso clínico:', error);
  } finally {
    guardando.value = false;
  }
};

const cerrarFormulario = () => {
  // Reset del formulario
  seccionActual.value = 'motivo';
  formulario.value = {
    motivoConsulta: '',
    sexo: '',
    edad: null,
    enfermedadActual: '',
    peso: null,
    talla: null,
    facies: '',
    marcha: '',
    PielyMucosa: '',
    craneo: '',
    CarayCuello: '',
    ATM: '',
    odontograma: [],
    topografiaMucosa: { superior: [], inferior: [] },
    estudiosComplementarios: {},
    detalleEstudios: {}
  };
  
  emit('cerrar');
};

// Watchers
watch(() => props.paciente, (nuevoPaciente) => {
  if (nuevoPaciente) {
    // Pre-llenar algunos campos basados en el paciente
    formulario.value.sexo = nuevoPaciente.genero || '';
    if (nuevoPaciente.fechaNacimiento) {
      const hoy = new Date();
      const fechaNac = new Date(nuevoPaciente.fechaNacimiento);
      formulario.value.edad = hoy.getFullYear() - fechaNac.getFullYear();
    }
  }
});
</script>

<style scoped>
/* Estilos del modal de caso clínico */
.caso-clinico-backdrop {
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
}

.caso-clinico-modal {
  width: 100% !important;
  max-width: 1400px !important;
  max-height: 98vh !important;
  background: #ffffff !important;
  border-radius: 1rem !important;
  box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.3) !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

.caso-clinico-content {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  max-height: 98vh !important;
}

/* Header */
.caso-clinico-header {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: white !important;
  padding: 1rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
}

.header-content {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
  flex: 1 !important;
}

.icon-container {
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1rem !important;
}

.title-container h4 {
  margin: 0 !important;
  font-size: 1.1rem !important;
  font-weight: 700 !important;
}

.modal-subtitle {
  margin: 0 !important;
  font-size: 0.8rem !important;
  opacity: 0.9 !important;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  font-size: 0.9rem !important;
  transition: all 0.2s ease !important;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1) !important;
}

/* Progress Indicator */
.progress-indicator {
  display: flex !important;
  justify-content: space-between !important;
  padding: 0.75rem 1rem !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #e5e7eb !important;
  overflow-x: auto !important;
  flex-shrink: 0 !important;
}

.step {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 0.25rem !important;
  min-width: 100px !important;
  padding: 0.25rem !important;
  position: relative !important;
}

.step:not(:last-child)::after {
  content: '' !important;
  position: absolute !important;
  top: 12px !important;
  right: -50% !important;
  width: 100% !important;
  height: 2px !important;
  background: #d1d5db !important;
  z-index: 0 !important;
}

.step.completed:not(:last-child)::after {
  background: #10b981 !important;
}

.step-number {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  background: #d1d5db !important;
  color: #6b7280 !important;
  transition: all 0.2s ease !important;
  z-index: 1 !important;
  position: relative !important;
}

.step.active .step-number {
  background: #2563eb !important;
  color: white !important;
}

.step.completed .step-number {
  background: #10b981 !important;
  color: white !important;
}

.step span {
  font-size: 0.7rem !important;
  text-align: center !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
}

.step.active span {
  color: #2563eb !important;
  font-weight: 600 !important;
}

.step.completed span {
  color: #10b981 !important;
}

/* Body */
.caso-clinico-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 1rem !important;
  min-height: 0 !important;
}

.seccion-content {
  margin: 0 auto !important;
}

.seccion-header {
  margin-bottom: 1.25rem !important;
  text-align: center !important;
}

.seccion-header h5 {
  color: #1f2937 !important;
  font-weight: 700 !important;
  margin-bottom: 0.25rem !important;
  font-size: 1.1rem !important;
}

.seccion-header p {
  margin: 0 !important;
  font-size: 0.9rem !important;
}

/* Subsección especial para odontograma expandido */
.subseccion-odontograma-completa {
  margin-bottom: 1.25rem !important;
  padding: 0.75rem !important;
  background: #f8fafc !important;
  border-radius: 0.5rem !important;
  border-left: 4px solid #2563eb !important;
}

.odontograma-container-expandido {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Subsecciones normales */
.subseccion {
  margin-bottom: 1.25rem !important;
  padding: 1rem !important;
  background: #f8fafc !important;
  border-radius: 0.5rem !important;
  border-left: 4px solid #2563eb !important;
}

.subseccion-title {
  color: #1f2937 !important;
  font-weight: 600 !important;
  margin-bottom: 0.75rem !important;
  display: flex !important;
  align-items: center !important;
  font-size: 1rem !important;
}

/* Estudios grid */
.estudios-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
  gap: 0.75rem !important;
}

.estudio-item {
  padding: 0.75rem !important;
  background: #f8fafc !important;
  border-radius: 0.375rem !important;
  border: 1px solid #e5e7eb !important;
}

.estudio-detalle {
  margin-top: 0.5rem !important;
}

/* Footer */
.caso-clinico-footer {
  background: #f8fafc !important;
  border-top: 1px solid #e5e7eb !important;
  padding: 0.75rem 1rem !important;
  flex-shrink: 0 !important;
}

.navigation-buttons {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
}

.spacer {
  flex: 1 !important;
}

/* Form styles */
.form-label {
  font-weight: 600 !important;
  color: #374151 !important;
  margin-bottom: 0.5rem !important;
}

.form-control,
.form-select {
  border: 2px solid #e5e7eb !important;
  border-radius: 0.375rem !important;
  padding: 0.5rem !important;
  transition: border-color 0.2s ease !important;
}

.form-control:focus,
.form-select:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.1) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .caso-clinico-modal {
    margin: 0 !important;
    max-width: 100% !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
  
  .progress-indicator {
    padding: 0.5rem !important;
  }
  
  .step {
    min-width: 70px !important;
    gap: 0.25rem !important;
  }
  
  .step span {
    font-size: 0.65rem !important;
  }
  
  .caso-clinico-body {
    padding: 0.75rem !important;
  }
  
  .estudios-grid {
    grid-template-columns: 1fr !important;
  }
  
  .navigation-buttons {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }
  
  .navigation-buttons .btn {
    width: 100% !important;
  }
  
  .spacer {
    display: none !important;
  }
  
  .seccion-header {
    margin-bottom: 1rem !important;
  }
  
  .subseccion {
    margin-bottom: 1rem !important;
    padding: 0.75rem !important;
  }
}
</style>
