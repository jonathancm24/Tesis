<template>
  <div v-if="mostrarFormulario" class="caso-clinico-backdrop show" @click.self="cerrarFormulario">
    <div class="caso-clinico-modal">
      <div class="caso-clinico-content">
        
        <!-- Header del modal -->
        <div class="caso-clinico-header">
          <div class="header-content">
            <div class="icon-container">
              <i class="fas fa-file-medical text-primary"></i>
            </div>
            <div class="title-container">
              <h4>{{ modoEdicion ? 'Editar' : 'Crear' }} Caso Clínico</h4>
              <p class="modal-subtitle" v-if="paciente">
                Paciente: {{ paciente.nombre }} {{ paciente.apellido }} - {{ paciente.cedula }}
              </p>
            </div>
          </div>
          <button type="button" class="btn-close" @click="cerrarFormulario">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Indicador de progreso -->
        <div class="progress-indicator">
          <div 
            v-for="(seccion, index) in secciones" 
            :key="seccion.id"
            class="step"
            :class="{ 
              active: seccionActual === seccion.id, 
              completed: seccionesCompletas[seccion.id] 
            }"
          >
            <div class="step-number">
              <i v-if="seccionesCompletas[seccion.id]" class="fas fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span>{{ seccion.nombre }}</span>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="caso-clinico-body">
          
          <!-- Sección 1: Motivo de Consulta -->
          <div v-if="seccionActual === 'motivo'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-clipboard-list me-2"></i>Motivo de Consulta</h5>
              <p class="text-muted">Información básica del caso clínico</p>
            </div>
            
            <div class="row g-3">
              <!-- Selección de especialidad -->
              <div class="col-12">
                <label class="form-label required">Especialidad</label>
                <select 
                  v-model="formulario.especialidadId" 
                  class="form-select"
                  :class="{ 'is-invalid': errores.especialidadId }"
                  @change="cargarPreguntasEspecialidad"
                  required
                >
                  <option value="">Selecciona una especialidad...</option>
                  <option 
                    v-for="especialidad in especialidades" 
                    :key="especialidad.id"
                    :value="especialidad.id"
                  >
                    {{ especialidad.nombre }}
                  </option>
                </select>
                <div v-if="errores.especialidadId" class="invalid-feedback">
                  {{ errores.especialidadId }}
                </div>
              </div>

              <!-- Selección de profesor -->
              <div class="col-12">
                <label class="form-label required">Profesor Supervisor</label>
                <select 
                  v-model="formulario.profesorId" 
                  class="form-select"
                  :class="{ 'is-invalid': errores.profesorId }"
                  required
                >
                  <option value="">Selecciona un profesor...</option>
                  <option 
                    v-for="profesor in profesores" 
                    :key="profesor.id"
                    :value="profesor.id"
                  >
                    {{ profesor.nombre }} {{ profesor.apellido }}
                  </option>
                </select>
                <div v-if="errores.profesorId" class="invalid-feedback">
                  {{ errores.profesorId }}
                </div>
              </div>

              <!-- Motivo de consulta -->
              <div class="col-12">
                <label class="form-label required">Motivo de Consulta</label>
                <textarea
                  v-model="formulario.motivoConsulta"
                  class="form-control"
                  :class="{ 'is-invalid': errores.motivoConsulta }"
                  rows="4"
                  placeholder="Describe el motivo principal por el que el paciente solicita atención..."
                  required
                ></textarea>
                <div v-if="errores.motivoConsulta" class="invalid-feedback">
                  {{ errores.motivoConsulta }}
                </div>
                <div class="form-text">
                  Mínimo 10 caracteres, máximo 1000
                </div>
              </div>

              <!-- Enfermedad actual -->
              <div class="col-12">
                <label class="form-label required">Enfermedad Actual</label>
                <textarea
                  v-model="formulario.enfermedadActual"
                  class="form-control"
                  :class="{ 'is-invalid': errores.enfermedadActual }"
                  rows="5"
                  placeholder="Describe detalladamente la evolución y características de la enfermedad actual..."
                  required
                ></textarea>
                <div v-if="errores.enfermedadActual" class="invalid-feedback">
                  {{ errores.enfermedadActual }}
                </div>
                <div class="form-text">
                  Mínimo 20 caracteres, máximo 2000
                </div>
              </div>
            </div>
          </div>

          <!-- Sección 2: Examen Físico General -->
          <div v-if="seccionActual === 'examen-general'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-user-md me-2"></i>Examen Físico General</h5>
              <p class="text-muted">Evaluación general del estado físico del paciente</p>
            </div>
            
            <div class="row g-3">
              <!-- Peso y Talla -->
              <div class="col-md-6">
                <label class="form-label required">Peso (kg)</label>
                <input
                  v-model.number="formulario.peso"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errores.peso }"
                  min="1"
                  max="300"
                  step="0.1"
                  placeholder="70.5"
                  required
                >
                <div v-if="errores.peso" class="invalid-feedback">
                  {{ errores.peso }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label required">Talla (m)</label>
                <input
                  v-model.number="formulario.talla"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errores.talla }"
                  min="0.3"
                  max="2.5"
                  step="0.01"
                  placeholder="1.70"
                  required
                >
                <div v-if="errores.talla" class="invalid-feedback">
                  {{ errores.talla }}
                </div>
              </div>

              <!-- Facies -->
              <div class="col-12">
                <label class="form-label required">Facies</label>
                <textarea
                  v-model="formulario.facies"
                  class="form-control"
                  :class="{ 'is-invalid': errores.facies }"
                  rows="3"
                  placeholder="Describe la expresión facial y apariencia general..."
                  required
                ></textarea>
                <div v-if="errores.facies" class="invalid-feedback">
                  {{ errores.facies }}
                </div>
              </div>

              <!-- Marcha -->
              <div class="col-12">
                <label class="form-label required">Marcha</label>
                <textarea
                  v-model="formulario.marcha"
                  class="form-control"
                  :class="{ 'is-invalid': errores.marcha }"
                  rows="3"
                  placeholder="Describe la forma de caminar y postura del paciente..."
                  required
                ></textarea>
                <div v-if="errores.marcha" class="invalid-feedback">
                  {{ errores.marcha }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sección 3: Examen Regional -->
          <div v-if="seccionActual === 'examen-regional'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-head-side-virus me-2"></i>Examen Regional</h5>
              <p class="text-muted">Evaluación específica de cabeza, cuello y estructuras relacionadas</p>
            </div>
            
            <div class="row g-3">
              <!-- Cráneo -->
              <div class="col-12">
                <label class="form-label required">Cráneo</label>
                <textarea
                  v-model="formulario.craneo"
                  class="form-control"
                  :class="{ 'is-invalid': errores.craneo }"
                  rows="3"
                  placeholder="Describe la forma, simetría y características del cráneo..."
                  required
                ></textarea>
                <div v-if="errores.craneo" class="invalid-feedback">
                  {{ errores.craneo }}
                </div>
              </div>

              <!-- Cara y Cuello -->
              <div class="col-12">
                <label class="form-label required">Cara y Cuello</label>
                <textarea
                  v-model="formulario.CarayCuello"
                  class="form-control"
                  :class="{ 'is-invalid': errores.CarayCuello }"
                  rows="4"
                  placeholder="Describe características de la cara, cuello, ganglios, etc..."
                  required
                ></textarea>
                <div v-if="errores.CarayCuello" class="invalid-feedback">
                  {{ errores.CarayCuello }}
                </div>
              </div>

              <!-- ATM -->
              <div class="col-12">
                <label class="form-label required">ATM (Articulación Temporomandibular)</label>
                <textarea
                  v-model="formulario.ATM"
                  class="form-control"
                  :class="{ 'is-invalid': errores.ATM }"
                  rows="4"
                  placeholder="Describe palpación, ruidos articulares, apertura, etc..."
                  required
                ></textarea>
                <div v-if="errores.ATM" class="invalid-feedback">
                  {{ errores.ATM }}
                </div>
              </div>

              <!-- Piel y Mucosa -->
              <div class="col-12">
                <label class="form-label required">Piel y Mucosa</label>
                <textarea
                  v-model="formulario.PielyMucosa"
                  class="form-control"
                  :class="{ 'is-invalid': errores.PielyMucosa }"
                  rows="4"
                  placeholder="Describe el estado de la piel y mucosas visibles..."
                  required
                ></textarea>
                <div v-if="errores.PielyMucosa" class="invalid-feedback">
                  {{ errores.PielyMucosa }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sección 4: Examen Bucal -->
          <div v-if="seccionActual === 'examen-bucal'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-teeth me-2"></i>Examen Bucal</h5>
              <p class="text-muted">Evaluación intraoral: odontograma y topografía de mucosa oral</p>
            </div>
            
            <!-- Subsección del Odontograma -->
            <div class="subseccion-odontograma-completa">
              <div class="subseccion-title">
                <h6><i class="fas fa-tooth me-2"></i>Odontograma</h6>
                <p class="text-muted mb-3">Registra los hallazgos dentales encontrados durante el examen</p>
              </div>
              
              <div class="odontograma-container-expandido">
                <OdontogramaCompacto
                  @change="onOdontogramaChange"
                  :readonly="false"
                  :show-tools="true"
                />
              </div>

              <!-- Lista de hallazgos dentales -->
              <div v-if="hallazgosEncontrados.length > 0" class="mt-4">
                <h6 class="mb-3">Hallazgos Registrados:</h6>
                <div class="row g-2">
                  <div 
                    v-for="(hallazgo, index) in hallazgosEncontrados" 
                    :key="index"
                    class="col-md-6"
                  >
                    <div class="card">
                      <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>Diente {{ hallazgo.diente }}</strong>
                            <span v-if="hallazgo.superficie" class="text-muted"> ({{ hallazgo.superficie }})</span>
                            <br>
                            <span class="badge" :class="getBadgeClass(hallazgo.condicion)">
                              {{ getEstadoTexto(hallazgo.condicion) }}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            @click="removerHallazgo(index)"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subsección de Topografía de Mucosa -->
            <div class="subseccion mt-4">
              <div class="subseccion-title">
                <h6><i class="fas fa-map-marked-alt me-2"></i>Topografía de Mucosa Oral</h6>
                <p class="text-muted mb-3">Registra los hallazgos en las mucosas orales</p>
              </div>
              
              <TopografiaMucosaCompacta
                @change="onTopografiaChange"
                :readonly="false"
              />

              <!-- Lista de mucosas seleccionadas -->
              <div v-if="mucosasSeleccionadas.length > 0" class="mt-3">
                <h6 class="mb-3">Mucosas con Hallazgos:</h6>
                <div class="row g-2">
                  <div 
                    v-for="(mucosa, index) in mucosasSeleccionadas" 
                    :key="index"
                    class="col-md-4"
                  >
                    <div class="card">
                      <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{{ mucosa.vista }} {{ mucosa.numero }}</strong>
                            <br>
                            <small class="text-muted">{{ mucosa.descripcion }}</small>
                          </div>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            @click="removerMucosa(mucosa.vista, mucosa.numero)"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección 5: Preguntas de Especialidad -->
          <div v-if="seccionActual === 'preguntas-especialidad'" class="seccion-content">
            <div class="seccion-header">
              <h5><i class="fas fa-question-circle me-2"></i>Preguntas de Especialidad</h5>
              <p class="text-muted">Preguntas específicas de {{ especialidadSeleccionada?.nombre }}</p>
            </div>
            
            <div v-if="cargandoPreguntas" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando preguntas...</span>
              </div>
              <p class="mt-2 text-muted">Cargando preguntas de especialidad...</p>
            </div>

            <div v-else-if="preguntasEspecialidad.length === 0" class="text-center py-4">
              <i class="fas fa-info-circle text-info fa-3x mb-3"></i>
              <p class="text-muted">No hay preguntas específicas para esta especialidad.</p>
            </div>

            <div v-else class="preguntas-container">
              <div 
                v-for="(pregunta, index) in preguntasEspecialidad" 
                :key="pregunta.id"
                class="pregunta-item mb-4"
              >
                <div class="card">
                  <div class="card-body">
                    <div class="question-header mb-3">
                      <h6 class="mb-1">
                        {{ index + 1 }}. {{ pregunta.pregunta }}
                        <span v-if="pregunta.obligatoria" class="text-danger">*</span>
                      </h6>
                      <small class="text-muted">Tipo: {{ getTipoPreguntaTexto(pregunta.tipo) }}</small>
                    </div>

                    <!-- Respuesta según tipo de pregunta -->
                    <div class="question-content">
                      <!-- Texto simple -->
                      <div v-if="pregunta.tipo === 'TEXTO'">
                        <input
                          v-model="respuestasClinicas[pregunta.id]"
                          type="text"
                          class="form-control"
                          :class="{ 'is-invalid': errores[`pregunta_${pregunta.id}`] }"
                          :required="pregunta.obligatoria"
                          placeholder="Escribe tu respuesta..."
                        >
                      </div>

                      <!-- Texto largo -->
                      <div v-else-if="pregunta.tipo === 'TEXTO_LARGO'">
                        <textarea
                          v-model="respuestasClinicas[pregunta.id]"
                          class="form-control"
                          :class="{ 'is-invalid': errores[`pregunta_${pregunta.id}`] }"
                          rows="4"
                          :required="pregunta.obligatoria"
                          placeholder="Escribe tu respuesta detallada..."
                        ></textarea>
                      </div>

                      <!-- Número -->
                      <div v-else-if="pregunta.tipo === 'NUMERO'">
                        <input
                          v-model.number="respuestasClinicas[pregunta.id]"
                          type="number"
                          class="form-control"
                          :class="{ 'is-invalid': errores[`pregunta_${pregunta.id}`] }"
                          :required="pregunta.obligatoria"
                          placeholder="Ingresa un número..."
                        >
                      </div>

                      <!-- Fecha -->
                      <div v-else-if="pregunta.tipo === 'FECHA'">
                        <input
                          v-model="respuestasClinicas[pregunta.id]"
                          type="date"
                          class="form-control"
                          :class="{ 'is-invalid': errores[`pregunta_${pregunta.id}`] }"
                          :required="pregunta.obligatoria"
                        >
                      </div>

                      <!-- Verdadero/Falso -->
                      <div v-else-if="pregunta.tipo === 'VERDADERO_FALSO'">
                        <div class="form-check">
                          <input
                            v-model="respuestasClinicas[pregunta.id]"
                            type="radio"
                            class="form-check-input"
                            :id="`${pregunta.id}_true`"
                            :name="`pregunta_${pregunta.id}`"
                            value="true"
                            :required="pregunta.obligatoria"
                          >
                          <label class="form-check-label" :for="`${pregunta.id}_true`">
                            Verdadero
                          </label>
                        </div>
                        <div class="form-check">
                          <input
                            v-model="respuestasClinicas[pregunta.id]"
                            type="radio"
                            class="form-check-input"
                            :id="`${pregunta.id}_false`"
                            :name="`pregunta_${pregunta.id}`"
                            value="false"
                            :required="pregunta.obligatoria"
                          >
                          <label class="form-check-label" :for="`${pregunta.id}_false`">
                            Falso
                          </label>
                        </div>
                      </div>

                      <!-- Opción múltiple -->
                      <div v-else-if="pregunta.tipo === 'OPCION_MULTIPLE' && pregunta.opciones">
                        <div 
                          v-for="(opcion, opcionIndex) in pregunta.opciones" 
                          :key="opcionIndex"
                          class="form-check"
                        >
                          <input
                            v-model="respuestasClinicas[pregunta.id]"
                            type="radio"
                            class="form-check-input"
                            :id="`${pregunta.id}_${opcionIndex}`"
                            :name="`pregunta_${pregunta.id}`"
                            :value="opcion"
                            :required="pregunta.obligatoria"
                          >
                          <label class="form-check-label" :for="`${pregunta.id}_${opcionIndex}`">
                            {{ opcion }}
                          </label>
                        </div>
                      </div>

                      <!-- Error de validación -->
                      <div v-if="errores[`pregunta_${pregunta.id}`]" class="invalid-feedback d-block">
                        {{ errores[`pregunta_${pregunta.id}`] }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer con navegación -->
        <div class="caso-clinico-footer">
          <div class="navigation-buttons">
            <button 
              type="button" 
              class="btn btn-outline-secondary"
              @click="seccionAnterior"
              :disabled="seccionActual === 'motivo'"
            >
              <i class="fas fa-arrow-left me-2"></i>Anterior
            </button>
            
            <div class="spacer"></div>
            
            <button 
              type="button" 
              class="btn btn-outline-secondary me-2"
              @click="cerrarFormulario"
            >
              Cancelar
            </button>
            
            <button 
              v-if="seccionActual !== 'preguntas-especialidad'"
              type="button" 
              class="btn btn-primary"
              @click="seccionSiguiente"
              :disabled="!seccionActualCompleta"
            >
              Siguiente<i class="fas fa-arrow-right ms-2"></i>
            </button>
            
            <button 
              v-else
              type="button" 
              class="btn btn-success"
              @click="guardarCasoClinico"
              :disabled="guardando || !formularioCompleto"
            >
              <span v-if="guardando">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>{{ modoEdicion ? 'Actualizar' : 'Crear' }} Caso
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import OdontogramaCompacto from './OdontogramaCompacto.vue';
import TopografiaMucosaCompacta from './TopografiaMucosaCompacta.vue';
import clinicalCaseService, { 
  type CrearCasoClinicoRequest, 
  type CrearHallazgoRequest,
  type CrearRespuestaClinicaRequest,
  type PreguntaClinica
} from '@/services/clinicalCaseService';
import studentService from '@/services/studentService';
import type { PacienteLista } from '@/types/patient';

// =======================================
// INTERFACES Y TIPOS
// =======================================

interface HallazgoOdontologico {
  diente: string;
  superficie: string;
  condicion: string;
  descripcion: string;
}

interface MucosaSeleccionada {
  vista: string;
  numero: number;
  descripcion: string;
}

interface FormularioCasoClinico {
  // Básicos
  especialidadId: number | null;
  profesorId: number | null;
  motivoConsulta: string;
  enfermedadActual: string;
  
  // Examen físico
  peso: number | null;
  talla: number | null;
  facies: string;
  marcha: string;
  
  // Examen regional
  craneo: string;
  CarayCuello: string;
  ATM: string;
  PielyMucosa: string;
}

interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

// =======================================
// PROPS Y EMITS
// =======================================

interface Props {
  mostrarFormulario: boolean;
  paciente: PacienteLista | null;
  casoId?: number; // Para modo edición
}

const props = defineProps<Props>();

const emit = defineEmits<{
  cerrar: [];
  guardado: [casoId: number];
}>();

// =======================================
// COMPOSABLES Y SERVICIOS
// =======================================

const { showToast } = useToast();

// =======================================
// ESTADO REACTIVO
// =======================================

// Control de flujo
const seccionActual = ref<'motivo' | 'examen-general' | 'examen-regional' | 'examen-bucal' | 'preguntas-especialidad'>('motivo');
const guardando = ref(false);
const cargandoPreguntas = ref(false);
const modoEdicion = computed(() => !!props.casoId);

// Datos del formulario
const formulario = ref<FormularioCasoClinico>({
  especialidadId: null,
  profesorId: null,
  motivoConsulta: '',
  enfermedadActual: '',
  peso: null,
  talla: null,
  facies: '',
  marcha: '',
  craneo: '',
  CarayCuello: '',
  ATM: '',
  PielyMucosa: ''
});

// Datos de referencia
const especialidades = ref<Especialidad[]>([]);
const profesores = ref<Profesor[]>([]);
const preguntasEspecialidad = ref<PreguntaClinica[]>([]);

// Hallazgos y respuestas
const hallazgosEncontrados = ref<HallazgoOdontologico[]>([]);
const mucosasSeleccionadas = ref<MucosaSeleccionada[]>([]);
const respuestasClinicas = ref<Record<number, string>>({});

// Control de errores
const errores = ref<Record<string, string>>({});

// =======================================
// COMPUTED PROPERTIES
// =======================================

// Configuración de secciones
const secciones = computed(() => [
  { id: 'motivo' as const, nombre: 'Información Básica' },
  { id: 'examen-general' as const, nombre: 'Examen General' },
  { id: 'examen-regional' as const, nombre: 'Examen Regional' },
  { id: 'examen-bucal' as const, nombre: 'Examen Bucal' },
  { id: 'preguntas-especialidad' as const, nombre: 'Preguntas Especialidad' }
]);

// Especialidad seleccionada
const especialidadSeleccionada = computed(() => 
  especialidades.value.find(e => e.id === formulario.value.especialidadId)
);

// Validaciones por sección
const seccionesCompletas = computed(() => {
  const secciones: Record<string, boolean> = {
    'motivo': validarSeccionMotivo(),
    'examen-general': validarSeccionExamenGeneral(),
    'examen-regional': validarSeccionExamenRegional(),
    'examen-bucal': validarSeccionExamenBucal(),
    'preguntas-especialidad': validarSeccionPreguntas()
  };
  return secciones;
});

const seccionActualCompleta = computed(() => 
  seccionesCompletas.value[seccionActual.value]
);

const formularioCompleto = computed(() => 
  Object.values(seccionesCompletas.value).every(completa => completa)
);

// =======================================
// MÉTODOS DE VALIDACIÓN
// =======================================

function validarSeccionMotivo(): boolean {
  return !!(
    formulario.value.especialidadId &&
    formulario.value.profesorId &&
    formulario.value.motivoConsulta.length >= 10 &&
    formulario.value.enfermedadActual.length >= 20
  );
}

function validarSeccionExamenGeneral(): boolean {
  return !!(
    formulario.value.peso && formulario.value.peso > 0 &&
    formulario.value.talla && formulario.value.talla > 0 &&
    formulario.value.facies.length >= 10 &&
    formulario.value.marcha.length >= 10
  );
}

function validarSeccionExamenRegional(): boolean {
  return !!(
    formulario.value.craneo.length >= 10 &&
    formulario.value.CarayCuello.length >= 10 &&
    formulario.value.ATM.length >= 10 &&
    formulario.value.PielyMucosa.length >= 10
  );
}

function validarSeccionExamenBucal(): boolean {
  // Es opcional tener hallazgos, por lo tanto siempre es válida
  return true;
}

function validarSeccionPreguntas(): boolean {
  // Verificar que todas las preguntas obligatorias tengan respuesta
  return preguntasEspecialidad.value
    .filter(p => p.obligatoria)
    .every(p => respuestasClinicas.value[p.id]?.trim());
}

function validarFormulario(): boolean {
  errores.value = {};
  let esValido = true;

  // Validar información básica
  if (!formulario.value.especialidadId) {
    errores.value.especialidadId = 'La especialidad es requerida';
    esValido = false;
  }

  if (!formulario.value.profesorId) {
    errores.value.profesorId = 'El profesor supervisor es requerido';
    esValido = false;
  }

  if (formulario.value.motivoConsulta.length < 10) {
    errores.value.motivoConsulta = 'El motivo de consulta debe tener al menos 10 caracteres';
    esValido = false;
  }

  if (formulario.value.enfermedadActual.length < 20) {
    errores.value.enfermedadActual = 'La enfermedad actual debe tener al menos 20 caracteres';
    esValido = false;
  }

  // Validar datos físicos
  if (!formulario.value.peso || formulario.value.peso <= 0) {
    errores.value.peso = 'El peso es requerido y debe ser mayor a 0';
    esValido = false;
  }

  if (!formulario.value.talla || formulario.value.talla <= 0) {
    errores.value.talla = 'La talla es requerida y debe ser mayor a 0';
    esValido = false;
  }

  // Validar preguntas obligatorias
  preguntasEspecialidad.value
    .filter(p => p.obligatoria)
    .forEach(pregunta => {
      if (!respuestasClinicas.value[pregunta.id]?.trim()) {
        errores.value[`pregunta_${pregunta.id}`] = 'Esta pregunta es obligatoria';
        esValido = false;
      }
    });

  return esValido;
}

// =======================================
// MÉTODOS DE NAVEGACIÓN
// =======================================

function seccionSiguiente(): void {
  const seccionesOrden = ['motivo', 'examen-general', 'examen-regional', 'examen-bucal', 'preguntas-especialidad'];
  const indiceActual = seccionesOrden.indexOf(seccionActual.value);
  
  if (indiceActual < seccionesOrden.length - 1) {
    seccionActual.value = seccionesOrden[indiceActual + 1] as any;
  }
}

function seccionAnterior(): void {
  const seccionesOrden = ['motivo', 'examen-general', 'examen-regional', 'examen-bucal', 'preguntas-especialidad'];
  const indiceActual = seccionesOrden.indexOf(seccionActual.value);
  
  if (indiceActual > 0) {
    seccionActual.value = seccionesOrden[indiceActual - 1] as any;
  }
}

// =======================================
// MÉTODOS DE DATOS
// =======================================

async function cargarEspecialidades(): Promise<void> {
  try {
    especialidades.value = await studentService.obtenerEspecialidades();
  } catch (error) {
    console.error('Error al cargar especialidades:', error);
    showToast('Error al cargar especialidades', 'error');
  }
}

async function cargarProfesores(): Promise<void> {
  try {
    profesores.value = await studentService.obtenerDocentes();
  } catch (error) {
    console.error('Error al cargar profesores:', error);
    showToast('Error al cargar profesores', 'error');
  }
}

async function cargarPreguntasEspecialidad(): Promise<void> {
  if (!formulario.value.especialidadId) {
    preguntasEspecialidad.value = [];
    return;
  }

  try {
    cargandoPreguntas.value = true;
    preguntasEspecialidad.value = await clinicalCaseService.obtenerPreguntasPorEspecialidad(
      formulario.value.especialidadId
    );
    
    // Limpiar respuestas anteriores
    respuestasClinicas.value = {};
  } catch (error) {
    console.error('Error al cargar preguntas:', error);
    showToast('Error al cargar preguntas de especialidad', 'error');
  } finally {
    cargandoPreguntas.value = false;
  }
}

// =======================================
// MÉTODOS DE HALLAZGOS
// =======================================

function onOdontogramaChange(dientes: any[]): void {
  hallazgosEncontrados.value = dientes.map(diente => ({
    diente: diente.numero,
    superficie: diente.superficie || '',
    condicion: diente.estado,
    descripcion: diente.observaciones || `${diente.estado} en diente ${diente.numero}`
  }));
}

function onTopografiaChange(datos: any): void {
  // Procesar datos de topografía de mucosa
  mucosasSeleccionadas.value = datos.selecciones || [];
}

function removerHallazgo(index: number): void {
  hallazgosEncontrados.value.splice(index, 1);
}

function removerMucosa(vista: string, numero: number): void {
  const index = mucosasSeleccionadas.value.findIndex(
    m => m.vista === vista && m.numero === numero
  );
  if (index >= 0) {
    mucosasSeleccionadas.value.splice(index, 1);
  }
}

// =======================================
// MÉTODOS UTILITARIOS
// =======================================

function getBadgeClass(estado: string): string {
  const clases: Record<string, string> = {
    'SANO': 'bg-success',
    'CARIES': 'bg-warning',
    'OBTURADO': 'bg-info',
    'AUSENTE': 'bg-danger',
    'CORONA': 'bg-primary',
    'ENDODONCIA': 'bg-secondary'
  };
  return clases[estado] || 'bg-secondary';
}

function getEstadoTexto(estado: string): string {
  const textos: Record<string, string> = {
    'SANO': 'Sano',
    'CARIES': 'Caries',
    'OBTURADO': 'Obturado',
    'AUSENTE': 'Ausente',
    'CORONA': 'Corona',
    'ENDODONCIA': 'Endodoncia'
  };
  return textos[estado] || estado;
}

function getTipoPreguntaTexto(tipo: string): string {
  const tipos: Record<string, string> = {
    'TEXTO': 'Texto',
    'TEXTO_LARGO': 'Texto largo',
    'NUMERO': 'Número',
    'FECHA': 'Fecha',
    'VERDADERO_FALSO': 'Verdadero/Falso',
    'OPCION_MULTIPLE': 'Opción múltiple'
  };
  return tipos[tipo] || tipo;
}

// =======================================
// MÉTODOS PRINCIPALES
// =======================================

async function verificarElegibilidadPaciente(): Promise<boolean> {
  if (!props.paciente) return false;
  
  try {
    return await clinicalCaseService.verificarElegibilidadPaciente(props.paciente.id);
  } catch (error) {
    console.error('Error al verificar elegibilidad:', error);
    return false;
  }
}

async function guardarCasoClinico(): Promise<void> {
  if (!validarFormulario()) {
    showToast('Por favor corrige los errores en el formulario', 'error');
    return;
  }

  if (!props.paciente) {
    showToast('No hay paciente seleccionado', 'error');
    return;
  }

  // Verificar elegibilidad del paciente
  const esElegible = await verificarElegibilidadPaciente();
  if (!esElegible) {
    showToast('El paciente debe tener al menos una encuesta de tamizaje completada', 'error');
    return;
  }

  try {
    guardando.value = true;

    // Preparar datos del caso clínico
    const datosCasoClinico: CrearCasoClinicoRequest = {
      pacienteId: props.paciente.id,
      profesorId: formulario.value.profesorId!,
      especialidadId: formulario.value.especialidadId!,
      motivoConsulta: formulario.value.motivoConsulta,
      enfermedadActual: formulario.value.enfermedadActual,
      ATM: formulario.value.ATM,
      CarayCuello: formulario.value.CarayCuello,
      PielyMucosa: formulario.value.PielyMucosa,
      craneo: formulario.value.craneo,
      facies: formulario.value.facies,
      marcha: formulario.value.marcha,
      peso: formulario.value.peso!,
      talla: formulario.value.talla!
    };

    let casoClinico;
    
    if (modoEdicion.value) {
      // Actualizar caso existente
      casoClinico = await clinicalCaseService.actualizarCasoClinico(props.casoId!, datosCasoClinico);
    } else {
      // Crear nuevo caso
      casoClinico = await clinicalCaseService.crearCasoClinico(datosCasoClinico);
    }

    // Guardar hallazgos si existen
    if (hallazgosEncontrados.value.length > 0) {
      const hallazgosParaGuardar: CrearHallazgoRequest[] = hallazgosEncontrados.value.map(h => ({
        diente: h.diente,
        superficie: h.superficie,
        condicion: h.condicion,
        descripcion: h.descripcion
      }));

      await clinicalCaseService.guardarHallazgos(casoClinico.id, hallazgosParaGuardar);
    }

    // Guardar hallazgos de mucosa si existen
    if (mucosasSeleccionadas.value.length > 0) {
      const hallazgosMucosa: CrearHallazgoRequest[] = mucosasSeleccionadas.value.map(m => ({
        ubicacionMucosa: `${m.vista} ${m.numero}`,
        condicion: 'HALLAZGO',
        descripcion: m.descripcion,
        caracteristicas: m.descripcion
      }));

      await clinicalCaseService.guardarHallazgos(casoClinico.id, hallazgosMucosa);
    }

    // Guardar respuestas a preguntas clínicas si existen
    if (Object.keys(respuestasClinicas.value).length > 0) {
      const respuestasParaGuardar: CrearRespuestaClinicaRequest[] = Object.entries(respuestasClinicas.value)
        .filter(([_, respuesta]) => respuesta.trim())
        .map(([preguntaId, respuesta]) => ({
          preguntaId: parseInt(preguntaId),
          respuesta: respuesta.trim()
        }));

      if (respuestasParaGuardar.length > 0) {
        await clinicalCaseService.guardarRespuestasClinicas(casoClinico.id, respuestasParaGuardar);
      }
    }

    showToast(
      modoEdicion.value 
        ? 'Caso clínico actualizado exitosamente' 
        : 'Caso clínico creado exitosamente. Enviado al profesor para revisión.',
      'success'
    );

    emit('guardado', casoClinico.id);
    cerrarFormulario();
    
  } catch (error: any) {
    console.error('Error al guardar caso clínico:', error);
    showToast(error.message || 'Error al guardar el caso clínico', 'error');
  } finally {
    guardando.value = false;
  }
}

function cerrarFormulario(): void {
  // Limpiar formulario
  formulario.value = {
    especialidadId: null,
    profesorId: null,
    motivoConsulta: '',
    enfermedadActual: '',
    peso: null,
    talla: null,
    facies: '',
    marcha: '',
    craneo: '',
    CarayCuello: '',
    ATM: '',
    PielyMucosa: ''
  };
  
  hallazgosEncontrados.value = [];
  mucosasSeleccionadas.value = [];
  respuestasClinicas.value = {};
  errores.value = {};
  seccionActual.value = 'motivo';
  
  emit('cerrar');
}

// =======================================
// WATCHERS
// =======================================

watch(() => props.paciente, async (nuevoPaciente) => {
  if (nuevoPaciente) {
    // Verificar elegibilidad cuando se selecciona un paciente
    const esElegible = await verificarElegibilidadPaciente();
    if (!esElegible) {
      showToast('Advertencia: Este paciente no tiene encuestas de tamizaje completadas', 'warning');
    }
  }
});

watch(() => formulario.value.especialidadId, () => {
  cargarPreguntasEspecialidad();
});

// =======================================
// CICLO DE VIDA
// =======================================

onMounted(async () => {
  await Promise.all([
    cargarEspecialidades(),
    cargarProfesores()
  ]);

  // Si es modo edición, cargar datos del caso
  if (modoEdicion.value && props.casoId) {
    try {
      const caso = await clinicalCaseService.obtenerCasoClinicoPorId(props.casoId);
      if (caso) {
        // Llenar formulario con datos existentes
        formulario.value = {
          especialidadId: caso.especialidadId,
          profesorId: caso.profesorId,
          motivoConsulta: caso.motivoConsulta,
          enfermedadActual: caso.enfermedadActual,
          peso: caso.peso,
          talla: caso.talla,
          facies: caso.facies,
          marcha: caso.marcha,
          craneo: caso.craneo,
          CarayCuello: caso.CarayCuello,
          ATM: caso.ATM,
          PielyMucosa: caso.PielyMucosa
        };

        // Cargar hallazgos existentes
        hallazgosEncontrados.value = caso.hallazgos
          .filter(h => h.diente)
          .map(h => ({
            diente: h.diente!,
            superficie: h.superficie || '',
            condicion: h.condicion,
            descripcion: h.descripcion
          }));

        // Cargar mucosas existentes
        mucosasSeleccionadas.value = caso.hallazgos
          .filter(h => h.ubicacionMucosa)
          .map(h => ({
            vista: h.ubicacionMucosa!.split(' ')[0],
            numero: parseInt(h.ubicacionMucosa!.split(' ')[1]),
            descripcion: h.descripcion
          }));

        // Cargar respuestas existentes
        caso.respuestasClinicas.forEach(respuesta => {
          respuestasClinicas.value[respuesta.preguntaId] = respuesta.respuesta;
        });
      }
    } catch (error) {
      console.error('Error al cargar caso para edición:', error);
      showToast('Error al cargar los datos del caso clínico', 'error');
    }
  }
});
</script>

<style scoped>
/* Estilos del modal de caso clínico */
.caso-clinico-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.caso-clinico-modal {
  width: 100%;
  max-width: 1200px;
  max-height: 95vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.caso-clinico-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 95vh;
}

/* Header */
.caso-clinico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-container i {
  font-size: 1.5rem;
}

.title-container h4 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.modal-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* Progress Indicator */
.progress-indicator {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  overflow-x: auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  flex: 1;
  min-width: 120px;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 15px;
  left: calc(50% + 30px);
  right: calc(-50% + 30px);
  height: 2px;
  background: #dee2e6;
  z-index: 1;
}

.step.completed:not(:last-child)::after {
  background: #28a745;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #dee2e6;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #007bff;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step span {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  line-height: 1.2;
}

.step.active span {
  color: #007bff;
  font-weight: 600;
}

.step.completed span {
  color: #28a745;
  font-weight: 500;
}

/* Body */
.caso-clinico-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.seccion-content {
  max-width: 100%;
}

.seccion-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.seccion-header h5 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-weight: 600;
}

.seccion-header p {
  margin: 0;
  font-size: 0.9rem;
}

/* Subsección especial para odontograma expandido */
.subseccion-odontograma-completa {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.odontograma-container-expandido {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

/* Subsecciones normales */
.subseccion {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.subseccion-title {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

/* Footer */
.caso-clinico-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.navigation-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spacer {
  flex: 1;
}

/* Form styles */
.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.form-control,
.form-select {
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.preguntas-container {
  max-height: 400px;
  overflow-y: auto;
}

.pregunta-item .card {
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.pregunta-item .card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.question-header h6 {
  color: #495057;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .caso-clinico-backdrop {
    padding: 0.5rem;
  }
  
  .caso-clinico-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .progress-indicator {
    padding: 0.75rem;
  }
  
  .step {
    min-width: 80px;
  }
  
  .step span {
    font-size: 0.7rem;
  }
  
  .caso-clinico-body {
    padding: 1rem;
  }
  
  .navigation-buttons {
    flex-wrap: wrap;
  }
}
</style>
