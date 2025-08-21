<!--
  Modal mejorado para crear preguntas con formato de texto plano optimizado
  Permite configuraciones avanzadas sin complicar la estructura de BD
  @author Sistema de Gestión Clínica
  @version 2.0
-->
<template>
  <div class="modal-overlay" @click="cerrarModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-question-circle" aria-hidden="true"></i>
          {{ modo === 'crear' ? 'Nueva Pregunta Clínica' : 'Editar Pregunta' }}
        </h2>
        <button 
          @click="cerrarModal" 
          class="modal-close"
          type="button"
          aria-label="Cerrar modal"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="guardar" class="question-form">
          <!-- Modo Asistido -->
          <div v-if="modoAsistido" class="guided-mode">
            <!-- Paso 1: Texto de la pregunta -->
            <div class="form-group">
              <label for="pregunta-texto" class="form-label required">
                Texto de la Pregunta
              </label>
              <textarea
                id="pregunta-texto"
                v-model="formularioAsistido.displayText"
                class="form-textarea"
                :class="{ 'error': errores.displayText }"
                placeholder="¿Cuál es tu pregunta? (ejemplo: ¿Tiene dolor de muelas?)"
                rows="2"
                maxlength="500"
                required
                @input="actualizarVistaPrevia"
              ></textarea>
              <div class="form-help">
                {{ (formularioAsistido.displayText || '').length }}/500 caracteres
              </div>
              <div v-if="errores.displayText" class="form-error">
                {{ errores.displayText }}
              </div>
            </div>

            <!-- Paso 2: Tipo de pregunta -->
            <div class="form-group">
              <label for="tipo-pregunta" class="form-label required">
                Tipo de Respuesta
              </label>
              <div class="question-types-grid">
                <div 
                  v-for="tipo in tiposDisponibles" 
                  :key="tipo.value"
                  class="question-type-card"
                  :class="{ 'selected': formularioAsistido.type === tipo.value }"
                  @click="seleccionarTipo(tipo.value)"
                >
                  <i :class="tipo.icon" class="type-icon"></i>
                  <div class="type-info">
                    <h4 class="type-title">{{ tipo.label }}</h4>
                    <p class="type-description">{{ tipo.description }}</p>
                  </div>
                </div>
              </div>
              <div v-if="errores.type" class="form-error">
                {{ errores.type }}
              </div>
            </div>

            <!-- Paso 3: Configuraciones específicas del tipo -->
            <div v-if="formularioAsistido.type" class="form-group">
              <label class="form-label">Configuraciones</label>
              
              <!-- Configuración para Sí/No -->
              <div v-if="formularioAsistido.type === 'si_no'" class="config-section">
                <div class="checkbox-container">
                  <input
                    id="require-detail"
                    v-model="formularioAsistido.requiresDetail"
                    type="checkbox"
                    class="form-checkbox"
                    @change="actualizarVistaPrevia"
                  />
                  <label for="require-detail" class="checkbox-label">
                    <span class="checkbox-text">Requiere detalle cuando la respuesta sea "Sí"</span>
                    <span class="checkbox-description">El usuario deberá explicar más detalles si responde afirmativamente</span>
                  </label>
                </div>
              </div>

              <!-- Configuración para Número -->
              <div v-if="formularioAsistido.type === 'numero'" class="config-section">
                <div class="config-row">
                  <div class="form-group">
                    <label for="numero-min" class="form-label">Valor Mínimo</label>
                    <input
                      id="numero-min"
                      v-model.number="formularioAsistido.min"
                      type="number"
                      class="form-input"
                      placeholder="0"
                      @input="actualizarVistaPrevia"
                    />
                  </div>
                  <div class="form-group">
                    <label for="numero-max" class="form-label">Valor Máximo</label>
                    <input
                      id="numero-max"
                      v-model.number="formularioAsistido.max"
                      type="number"
                      class="form-input"
                      placeholder="100"
                      @input="actualizarVistaPrevia"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label for="numero-placeholder" class="form-label">Texto de Ayuda</label>
                  <input
                    id="numero-placeholder"
                    v-model="formularioAsistido.placeholder"
                    type="text"
                    class="form-input"
                    placeholder="Ejemplo: Ingrese su edad en años"
                    @input="actualizarVistaPrevia"
                  />
                </div>
              </div>

              <!-- Configuración para Opción Múltiple -->
              <div v-if="formularioAsistido.type === 'multiple'" class="config-section">
                <label class="form-label">Opciones de Respuesta</label>
                <div class="options-list">
                  <div 
                    v-for="(_, index) in formularioAsistido.options" 
                    :key="index"
                    class="option-item"
                  >
                    <input
                      v-model="formularioAsistido.options[index]"
                      type="text"
                      class="form-input"
                      :placeholder="`Opción ${index + 1}`"
                      @input="actualizarVistaPrevia"
                    />
                    <button
                      type="button"
                      @click="eliminarOpcion(index)"
                      class="btn btn-remove"
                      :disabled="formularioAsistido.options.length <= 2"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="agregarOpcion"
                  class="btn btn-add"
                  :disabled="formularioAsistido.options.length >= 10"
                >
                  <i class="fas fa-plus"></i>
                  Agregar Opción
                </button>
              </div>

              <!-- Configuración para Escala -->
              <div v-if="formularioAsistido.type === 'escala'" class="config-section">
                <div class="config-row">
                  <div class="form-group">
                    <label for="escala-min" class="form-label">Valor Mínimo</label>
                    <input
                      id="escala-min"
                      v-model.number="formularioAsistido.scaleMin"
                      type="number"
                      class="form-input"
                      min="1"
                      max="10"
                      @input="actualizarVistaPrevia"
                    />
                  </div>
                  <div class="form-group">
                    <label for="escala-max" class="form-label">Valor Máximo</label>
                    <input
                      id="escala-max"
                      v-model.number="formularioAsistido.scaleMax"
                      type="number"
                      class="form-input"
                      min="2"
                      max="10"
                      @input="actualizarVistaPrevia"
                    />
                  </div>
                </div>
                <div class="config-row">
                  <div class="form-group">
                    <label for="escala-label-min" class="form-label">Etiqueta Mínima</label>
                    <input
                      id="escala-label-min"
                      v-model="formularioAsistido.scaleLabelMin"
                      type="text"
                      class="form-input"
                      placeholder="Ejemplo: Muy malo"
                      @input="actualizarVistaPrevia"
                    />
                  </div>
                  <div class="form-group">
                    <label for="escala-label-max" class="form-label">Etiqueta Máxima</label>
                    <input
                      id="escala-label-max"
                      v-model="formularioAsistido.scaleLabelMax"
                      type="text"
                      class="form-input"
                      placeholder="Ejemplo: Excelente"
                      @input="actualizarVistaPrevia"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Especialidad -->
            <div class="form-group">
              <label for="especialidad-select" class="form-label">
                Especialidad
              </label>
              <select
                id="especialidad-select"
                v-model="formularioAsistido.especialidadId"
                class="form-select"
                :class="{ 'error': errores.especialidadId }"
              >
                <option value="">Selecciona una especialidad (opcional)</option>
                <option 
                  v-for="especialidad in especialidades" 
                  :key="especialidad.id"
                  :value="especialidad.id"
                >
                  {{ especialidad.nombre }}
                </option>
              </select>
              <div class="form-help">
                Si no seleccionas una especialidad, la pregunta será general para todas.
              </div>
            </div>

            <!-- Pregunta obligatoria -->
            <div class="form-group checkbox-group">
              <div class="checkbox-container">
                <input
                  id="pregunta-obligatoria"
                  v-model="formularioAsistido.obligatoria"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="pregunta-obligatoria" class="checkbox-label">
                  <span class="checkbox-text">Pregunta obligatoria</span>
                  <span class="checkbox-description">Los usuarios deben responder esta pregunta para continuar</span>
                </label>
              </div>
            </div>

            <!-- Vista previa -->
            <div v-if="vistaPreviaGenerada" class="form-group preview-group">
              <div class="preview-header">
                <h4 class="preview-title">
                  <i class="fas fa-eye"></i>
                  Vista Previa
                </h4>
                <p class="preview-subtitle">Así se verá la pregunta para los usuarios</p>
              </div>
              
              <div class="preview-container">
                <component 
                  :is="componenteVistaPrevia"
                  :question="preguntaParseada"
                  :disabled="true"
                />
              </div>
            </div>
          </div>

          <!-- Modo Avanzado (Texto Directo) -->
          <div v-else class="advanced-mode">
            <div class="mode-header">
              <h3>Modo Avanzado - Edición Directa</h3>
              <p>Edita directamente el formato de texto. Primera línea: pregunta, Segunda línea: configuración.</p>
            </div>
            
            <div class="form-group">
              <label for="texto-directo" class="form-label required">
                Contenido de la Pregunta
              </label>
              <textarea
                id="texto-directo"
                v-model="textoDirecto"
                class="form-textarea advanced-textarea"
                :class="{ 'error': errores.textoDirecto }"
                placeholder="¿Tiene dolor de muelas?&#10;si_no*"
                rows="6"
                @input="validarTextoDirecto"
              ></textarea>
              <div class="form-help">
                <strong>Formato:</strong> Línea 1 = Pregunta, Línea 2 = Configuración
              </div>
              <div v-if="errores.textoDirecto" class="form-error">
                {{ errores.textoDirecto }}
              </div>
            </div>

            <!-- Ejemplos -->
            <div class="examples-section">
              <details class="examples-toggle">
                <summary>Ver ejemplos de formato</summary>
                <div class="examples-grid">
                  <div v-for="(ejemplo, tipo) in ejemplos" :key="tipo" class="example-card">
                    <h5>{{ tipo.replace('_', ' ').toUpperCase() }}</h5>
                    <pre class="example-code">{{ ejemplo }}</pre>
                    <button
                      type="button"
                      @click="aplicarEjemplo(ejemplo)"
                      class="btn btn-sm btn-secondary"
                    >
                      Usar este ejemplo
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </form>

        <!-- Toggle de modo -->
        <div class="mode-toggle">
          <button
            type="button"
            @click="alternarModo"
            class="btn btn-mode-toggle"
          >
            <i :class="modoAsistido ? 'fas fa-code' : 'fas fa-magic'"></i>
            {{ modoAsistido ? 'Modo Avanzado' : 'Modo Asistido' }}
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          type="button"
          @click="cerrarModal" 
          class="btn btn-secondary"
          :disabled="guardando"
        >
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        
        <button 
          type="button"
          @click="guardar" 
          class="btn btn-primary"
          :disabled="!formularioValido || guardando"
        >
          <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ guardando ? 'Guardando...' : (modo === 'crear' ? 'Crear Pregunta' : 'Guardar Cambios') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  parseQuestion, 
  stringifyQuestion, 
  validateQuestionFormat,
  getQuestionExamples,
  type ParsedQuestion,
  QuestionType 
} from '@/utils/questionParser'
import QuestionPreview from '@/components/professor/QuestionPreview.vue'

// Props
interface Props {
  pregunta?: any | null
  especialidades: { id: number; nombre: string; descripcion?: string }[]
  modo: 'crear' | 'editar'
  mostrar: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pregunta: null,
  mostrar: false
})

// Emits
interface Emits {
  (e: 'guardar', pregunta: any): void
  (e: 'cancelar'): void
}

const emit = defineEmits<Emits>()

// Estado
const modoAsistido = ref(true)
const guardando = ref(false)
const errores = ref<Record<string, string>>({})

// Formulario asistido
const formularioAsistido = ref({
  displayText: '',
  type: '' as QuestionType | '',
  especialidadId: undefined as number | undefined,
  obligatoria: false,
  requiresDetail: false,
  min: undefined as number | undefined,
  max: undefined as number | undefined,
  placeholder: '',
  options: ['', ''],
  scaleMin: 1,
  scaleMax: 5,
  scaleLabelMin: '',
  scaleLabelMax: ''
})

// Texto directo para modo avanzado
const textoDirecto = ref('')

// Computed
const ejemplos = computed(() => getQuestionExamples())

const tiposDisponibles = [
  {
    value: QuestionType.SI_NO,
    label: 'Sí / No',
    description: 'Respuesta de sí o no, con opción de detalle',
    icon: 'fas fa-check-circle'
  },
  {
    value: QuestionType.TEXTO,
    label: 'Texto Corto',
    description: 'Respuesta de texto en una línea',
    icon: 'fas fa-font'
  },
  {
    value: QuestionType.TEXTO_LARGO,
    label: 'Texto Largo',
    description: 'Respuesta de texto en múltiples líneas',
    icon: 'fas fa-align-left'
  },
  {
    value: QuestionType.NUMERO,
    label: 'Número',
    description: 'Respuesta numérica con rangos opcionales',
    icon: 'fas fa-hashtag'
  },
  {
    value: QuestionType.MULTIPLE,
    label: 'Opción Múltiple',
    description: 'Selección entre varias opciones',
    icon: 'fas fa-list-ul'
  },
  {
    value: QuestionType.ESCALA,
    label: 'Escala',
    description: 'Puntuación en una escala numérica',
    icon: 'fas fa-star'
  },
  {
    value: QuestionType.FECHA,
    label: 'Fecha',
    description: 'Selección de fecha específica',
    icon: 'fas fa-calendar'
  }
]

const preguntaParseada = computed(() => {
  if (!vistaPreviaGenerada.value) return null
  
  try {
    const texto = modoAsistido.value ? generarTextoDesdeFormulario() : textoDirecto.value
    return parseQuestion(texto)
  } catch {
    return null
  }
})

const vistaPreviaGenerada = computed(() => {
  if (modoAsistido.value) {
    return formularioAsistido.value.displayText && formularioAsistido.value.type
  } else {
    return textoDirecto.value && textoDirecto.value.includes('\n')
  }
})

const componenteVistaPrevia = computed(() => QuestionPreview)

const formularioValido = computed(() => {
  if (modoAsistido.value) {
    return (
      formularioAsistido.value.displayText &&
      formularioAsistido.value.displayText.length >= 5 &&
      formularioAsistido.value.type &&
      validarConfiguracionAsistida() &&
      Object.keys(errores.value).length === 0
    )
  } else {
    return (
      textoDirecto.value &&
      textoDirecto.value.includes('\n') &&
      Object.keys(errores.value).length === 0
    )
  }
})

// Métodos
function seleccionarTipo(tipo: QuestionType) {
  formularioAsistido.value.type = tipo
  
  // Resetear configuraciones específicas
  formularioAsistido.value.requiresDetail = false
  formularioAsistido.value.min = undefined
  formularioAsistido.value.max = undefined
  formularioAsistido.value.placeholder = ''
  formularioAsistido.value.options = ['', '']
  formularioAsistido.value.scaleMin = 1
  formularioAsistido.value.scaleMax = 5
  formularioAsistido.value.scaleLabelMin = ''
  formularioAsistido.value.scaleLabelMax = ''
  
  actualizarVistaPrevia()
}

function agregarOpcion() {
  if (formularioAsistido.value.options.length < 10) {
    formularioAsistido.value.options.push('')
    actualizarVistaPrevia()
  }
}

function eliminarOpcion(index: number) {
  if (formularioAsistido.value.options.length > 2) {
    formularioAsistido.value.options.splice(index, 1)
    actualizarVistaPrevia()
  }
}

function generarTextoDesdeFormulario(): string {
  if (!formularioAsistido.value.displayText || !formularioAsistido.value.type) {
    return ''
  }
  
  const question: ParsedQuestion = {
    displayText: formularioAsistido.value.displayText,
    type: formularioAsistido.value.type as QuestionType,
    config: {
      requiresDetail: formularioAsistido.value.requiresDetail,
      min: formularioAsistido.value.min,
      max: formularioAsistido.value.max,
      placeholder: formularioAsistido.value.placeholder,
      options: formularioAsistido.value.options.filter(o => o.trim()),
      scale: formularioAsistido.value.type === QuestionType.ESCALA ? {
        min: formularioAsistido.value.scaleMin,
        max: formularioAsistido.value.scaleMax,
        labels: [formularioAsistido.value.scaleLabelMin, formularioAsistido.value.scaleLabelMax].filter(l => l.trim())
      } : undefined
    },
    validation: { required: formularioAsistido.value.obligatoria }
  }
  
  return stringifyQuestion(question)
}

function actualizarVistaPrevia() {
  // Método para forzar actualización de vista previa
}

function validarConfiguracionAsistida(): boolean {
  if (formularioAsistido.value.type === QuestionType.MULTIPLE) {
    const opcionesValidas = formularioAsistido.value.options.filter(o => o.trim())
    return opcionesValidas.length >= 2
  }
  
  if (formularioAsistido.value.type === QuestionType.NUMERO || formularioAsistido.value.type === QuestionType.ESCALA) {
    const min = formularioAsistido.value.type === QuestionType.NUMERO ? 
      formularioAsistido.value.min : formularioAsistido.value.scaleMin
    const max = formularioAsistido.value.type === QuestionType.NUMERO ? 
      formularioAsistido.value.max : formularioAsistido.value.scaleMax
    
    if (min !== undefined && max !== undefined) {
      return min < max
    }
  }
  
  return true
}

function validarTextoDirecto() {
  try {
    if (textoDirecto.value) {
      validateQuestionFormat(textoDirecto.value)
      delete errores.value.textoDirecto
    }
  } catch (error: any) {
    errores.value.textoDirecto = error.message
  }
}

function aplicarEjemplo(ejemplo: string) {
  textoDirecto.value = ejemplo
  validarTextoDirecto()
}

function alternarModo() {
  if (modoAsistido.value) {
    // Cambiar a modo avanzado: generar texto directo
    textoDirecto.value = generarTextoDesdeFormulario()
  } else {
    // Cambiar a modo asistido: parsear texto directo
    try {
      if (textoDirecto.value) {
        const parsed = parseQuestion(textoDirecto.value)
        formularioAsistido.value.displayText = parsed.displayText
        formularioAsistido.value.type = parsed.type
        formularioAsistido.value.requiresDetail = parsed.config.requiresDetail || false
        formularioAsistido.value.min = parsed.config.min
        formularioAsistido.value.max = parsed.config.max
        formularioAsistido.value.placeholder = parsed.config.placeholder || ''
        formularioAsistido.value.options = parsed.config.options || ['', '']
        if (parsed.config.scale) {
          formularioAsistido.value.scaleMin = parsed.config.scale.min
          formularioAsistido.value.scaleMax = parsed.config.scale.max
          formularioAsistido.value.scaleLabelMin = parsed.config.scale.labels?.[0] || ''
          formularioAsistido.value.scaleLabelMax = parsed.config.scale.labels?.[1] || ''
        }
        formularioAsistido.value.obligatoria = parsed.validation.required
      }
    } catch (error) {
      console.warn('No se pudo parsear el texto directo:', error)
    }
  }
  
  modoAsistido.value = !modoAsistido.value
}

function inicializarFormulario() {
  if (props.pregunta && props.modo === 'editar') {
    try {
      // Si la pregunta ya tiene el formato nuevo, parsearla
      if (props.pregunta.texto && props.pregunta.texto.includes('\n')) {
        const parsed = parseQuestion(props.pregunta.texto)
        
        formularioAsistido.value.displayText = parsed.displayText
        formularioAsistido.value.type = parsed.type
        formularioAsistido.value.especialidadId = props.pregunta.especialidadId
        formularioAsistido.value.obligatoria = props.pregunta.obligatoria
        formularioAsistido.value.requiresDetail = parsed.config.requiresDetail || false
        
        if (parsed.config.min !== undefined) formularioAsistido.value.min = parsed.config.min
        if (parsed.config.max !== undefined) formularioAsistido.value.max = parsed.config.max
        if (parsed.config.placeholder) formularioAsistido.value.placeholder = parsed.config.placeholder
        if (parsed.config.options) formularioAsistido.value.options = [...parsed.config.options]
        
        if (parsed.config.scale) {
          formularioAsistido.value.scaleMin = parsed.config.scale.min
          formularioAsistido.value.scaleMax = parsed.config.scale.max
          formularioAsistido.value.scaleLabelMin = parsed.config.scale.labels?.[0] || ''
          formularioAsistido.value.scaleLabelMax = parsed.config.scale.labels?.[1] || ''
        }
        
        textoDirecto.value = props.pregunta.texto
      } else {
        // Formato antiguo: convertir
        formularioAsistido.value.displayText = props.pregunta.texto
        formularioAsistido.value.type = props.pregunta.tipo || QuestionType.TEXTO
        formularioAsistido.value.especialidadId = props.pregunta.especialidadId
        formularioAsistido.value.obligatoria = props.pregunta.obligatoria
        
        textoDirecto.value = `${props.pregunta.texto}\n${props.pregunta.tipo || 'texto'}`
      }
    } catch (error) {
      console.error('Error inicializando formulario:', error)
      // Fallback
      formularioAsistido.value.displayText = props.pregunta.texto || ''
      formularioAsistido.value.type = props.pregunta.tipo || QuestionType.TEXTO
    }
  } else {
    // Nuevo registro
    formularioAsistido.value = {
      displayText: '',
      type: '' as QuestionType | '',
      especialidadId: undefined,
      obligatoria: false,
      requiresDetail: false,
      min: undefined,
      max: undefined,
      placeholder: '',
      options: ['', ''],
      scaleMin: 1,
      scaleMax: 5,
      scaleLabelMin: '',
      scaleLabelMax: ''
    }
    textoDirecto.value = ''
  }
  
  errores.value = {}
}

async function guardar() {
  if (!formularioValido.value) return
  
  guardando.value = true
  
  try {
    const textoFinal = modoAsistido.value ? generarTextoDesdeFormulario() : textoDirecto.value
    
    // Validar formato final
    validateQuestionFormat(textoFinal)
    
    const preguntaData = {
      id: props.pregunta?.id,
      texto: textoFinal,
      tipo: modoAsistido.value ? formularioAsistido.value.type : parseQuestion(textoFinal).type,
      obligatoria: modoAsistido.value ? formularioAsistido.value.obligatoria : parseQuestion(textoFinal).validation.required,
      especialidadId: modoAsistido.value ? formularioAsistido.value.especialidadId : props.pregunta?.especialidadId
    }
    
    emit('guardar', preguntaData)
  } catch (error: any) {
    errores.value.general = error.message
  } finally {
    guardando.value = false
  }
}

function cerrarModal() {
  emit('cancelar')
}

// Lifecycle
onMounted(() => {
  inicializarFormulario()
})

watch(() => props.pregunta, () => {
  if (props.mostrar) {
    inicializarFormulario()
  }
}, { deep: true })
</script>

<style scoped>
@import '@/assets/css/components/professor/QuestionFormModalV2.css';
</style>
