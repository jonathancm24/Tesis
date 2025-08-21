<!-- 
  Modal para crear y editar preguntas clínicas
  Formulario dinámico que se adapta según el tipo de pregunta seleccionado
  @author Sistema de Gestión Clínica
  @version 1.0
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
          <!-- Campo de texto de la pregunta -->
          <div class="form-group">
            <label for="pregunta-texto" class="form-label required">
              Texto de la Pregunta
            </label>
            <textarea
              id="pregunta-texto"
              v-model="formulario.texto"
              class="form-textarea"
              :class="{ 'error': errores.texto }"
              placeholder="Escribe aquí el texto de tu pregunta..."
              rows="3"
              maxlength="500"
              required
              aria-describedby="texto-error texto-help"
            ></textarea>
            <div id="texto-help" class="form-help">
              {{ (formulario.texto || '').length }}/500 caracteres
            </div>
            <div v-if="errores.texto" id="texto-error" class="form-error">
              {{ errores.texto }}
            </div>
          </div>

          <!-- Tipo de pregunta -->
          <div class="form-group">
            <label for="tipo-pregunta" class="form-label required">
              Tipo de Pregunta
            </label>
            <select
              id="tipo-pregunta"
              v-model="formulario.tipo"
              class="form-select"
              :class="{ 'error': errores.tipo }"
              required
              aria-describedby="tipo-error tipo-help"
            >
              <option value="">Selecciona un tipo</option>
              <option value="TEXTO">Texto Corto</option>
              <option value="TEXTO_LARGO">Texto Largo</option>
              <option value="OPCION_MULTIPLE">Opción Múltiple</option>
              <option value="VERDADERO_FALSO">Verdadero/Falso</option>
              <option value="NUMERO">Número</option>
              <option value="FECHA">Fecha</option>
            </select>
            <div id="tipo-help" class="form-help">
              {{ obtenerDescripcionTipo(formulario.tipo) }}
            </div>
            <div v-if="errores.tipo" id="tipo-error" class="form-error">
              {{ errores.tipo }}
            </div>
          </div>

          <!-- Especialidad -->
          <div class="form-group">
            <label for="especialidad-select" class="form-label">
              Especialidad
            </label>
            <select
              id="especialidad-select"
              v-model="formulario.especialidadId"
              class="form-select"
              :class="{ 'error': errores.especialidadId }"
              aria-describedby="especialidad-error especialidad-help"
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
            <div id="especialidad-help" class="form-help">
              Si no seleccionas una especialidad, la pregunta será general para todas.
            </div>
            <div v-if="errores.especialidadId" id="especialidad-error" class="form-error">
              {{ errores.especialidadId }}
            </div>
          </div>

          <!-- Checkbox obligatoria -->
          <div class="form-group checkbox-group">
            <div class="checkbox-container">
              <input
                id="pregunta-obligatoria"
                type="checkbox"
                v-model="formulario.obligatoria"
                class="form-checkbox"
              />
              <label for="pregunta-obligatoria" class="checkbox-label">
                <span class="checkbox-text">Pregunta Obligatoria</span>
                <span class="checkbox-description">
                  Las preguntas obligatorias deben ser respondidas para completar el caso clínico.
                </span>
              </label>
            </div>
          </div>

          <!-- Vista previa del tipo de pregunta -->
          <div v-if="formulario.tipo" class="form-group preview-group">
            <div class="preview-header">
              <h4 class="preview-title">
                <i class="fas fa-eye" aria-hidden="true"></i>
                Vista Previa
              </h4>
              <span class="preview-subtitle">
                Así se verá esta pregunta para los estudiantes:
              </span>
            </div>
            
            <div class="preview-container">
              <div class="preview-question">
                <div class="preview-question-text">
                  {{ formulario.texto || 'Texto de la pregunta...' }}
                  <span v-if="formulario.obligatoria" class="preview-required">*</span>
                </div>
                
                <!-- Vista previa según el tipo -->
                <div class="preview-input">
                  <div v-if="formulario.tipo === 'TEXTO'" class="preview-field">
                    <input type="text" placeholder="Respuesta de texto corto..." disabled />
                  </div>
                  
                  <div v-else-if="formulario.tipo === 'TEXTO_LARGO'" class="preview-field">
                    <textarea placeholder="Respuesta de texto largo..." disabled rows="3"></textarea>
                  </div>
                  
                  <div v-else-if="formulario.tipo === 'OPCION_MULTIPLE'" class="preview-field">
                    <div class="preview-options">
                      <label class="preview-option">
                        <input type="radio" name="preview" disabled />
                        Opción 1
                      </label>
                      <label class="preview-option">
                        <input type="radio" name="preview" disabled />
                        Opción 2
                      </label>
                      <label class="preview-option">
                        <input type="radio" name="preview" disabled />
                        Opción 3
                      </label>
                    </div>
                  </div>
                  
                  <div v-else-if="formulario.tipo === 'VERDADERO_FALSO'" class="preview-field">
                    <div class="preview-options">
                      <label class="preview-option">
                        <input type="radio" name="preview-bool" disabled />
                        Verdadero
                      </label>
                      <label class="preview-option">
                        <input type="radio" name="preview-bool" disabled />
                        Falso
                      </label>
                    </div>
                  </div>
                  
                  <div v-else-if="formulario.tipo === 'NUMERO'" class="preview-field">
                    <input type="number" placeholder="123" disabled />
                  </div>
                  
                  <div v-else-if="formulario.tipo === 'FECHA'" class="preview-field">
                    <input type="date" disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button 
          type="button"
          @click="cerrarModal" 
          class="btn btn-secondary"
          :disabled="guardando"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
          Cancelar
        </button>
        
        <button 
          type="button"
          @click="guardar" 
          class="btn btn-primary"
          :disabled="!formularioValido || guardando"
        >
          <i v-if="guardando" class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          <i v-else class="fas fa-save" aria-hidden="true"></i>
          {{ guardando ? 'Guardando...' : (modo === 'crear' ? 'Crear Pregunta' : 'Guardar Cambios') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { PreguntaClinica, TipoPregunta } from '@/services/questionsService'

// Props
interface Props {
  pregunta?: PreguntaClinica | null
  especialidades: { id: number; nombre: string; descripcion?: string }[]
  modo: 'crear' | 'editar'
}

const props = withDefaults(defineProps<Props>(), {
  pregunta: null
})

// Emits
interface Emits {
  (e: 'guardar', pregunta: PreguntaClinica): void
  (e: 'cancelar'): void
}

const emit = defineEmits<Emits>()

// Estado del formulario
const formulario = ref<Partial<PreguntaClinica>>({
  texto: '',
  tipo: undefined,
  obligatoria: false,
  especialidadId: undefined
})

const errores = ref<Record<string, string>>({})
const guardando = ref(false)

// Computed
const formularioValido = computed(() => {
  return (
    formulario.value.texto &&
    formulario.value.texto.length >= 10 &&
    formulario.value.texto.length <= 500 &&
    formulario.value.tipo &&
    Object.keys(errores.value).length === 0
  )
})

// Watchers para validación en tiempo real
watch(() => formulario.value.texto, validarTexto)
watch(() => formulario.value.tipo, validarTipo)

// Métodos de validación
function validarTexto() {
  if (!formulario.value.texto) {
    errores.value.texto = 'El texto de la pregunta es obligatorio'
  } else if (formulario.value.texto.length < 10) {
    errores.value.texto = 'El texto debe tener al menos 10 caracteres'
  } else if (formulario.value.texto.length > 500) {
    errores.value.texto = 'El texto no puede exceder 500 caracteres'
  } else {
    delete errores.value.texto
  }
}

function validarTipo() {
  if (!formulario.value.tipo) {
    errores.value.tipo = 'Debes seleccionar un tipo de pregunta'
  } else {
    delete errores.value.tipo
  }
}

function validarFormulario(): boolean {
  errores.value = {}
  
  validarTexto()
  validarTipo()
  
  return Object.keys(errores.value).length === 0
}

// Métodos principales
function inicializarFormulario() {
  if (props.pregunta && props.modo === 'editar') {
    formulario.value = {
      id: props.pregunta.id,
      texto: props.pregunta.texto,
      tipo: props.pregunta.tipo,
      obligatoria: props.pregunta.obligatoria,
      especialidadId: props.pregunta.especialidadId
    }
  } else {
    formulario.value = {
      texto: '',
      tipo: undefined,
      obligatoria: false,
      especialidadId: undefined
    }
  }
  errores.value = {}
}

async function guardar() {
  if (!validarFormulario()) {
    return
  }

  guardando.value = true
  
  try {
    const preguntaData: PreguntaClinica = {
      ...formulario.value as PreguntaClinica
    }
    
    emit('guardar', preguntaData)
  } catch (error) {
    console.error('Error al guardar pregunta:', error)
  } finally {
    guardando.value = false
  }
}

function cerrarModal() {
  emit('cancelar')
}

function obtenerDescripcionTipo(tipo?: TipoPregunta): string {
  if (!tipo) return 'Selecciona un tipo para ver su descripción'
  
  const descripciones = {
    TEXTO: 'Respuesta de texto corto (una línea)',
    TEXTO_LARGO: 'Respuesta de texto largo (múltiples líneas)',
    OPCION_MULTIPLE: 'Respuesta de selección múltiple con opciones predefinidas',
    VERDADERO_FALSO: 'Respuesta de verdadero o falso',
    NUMERO: 'Respuesta numérica',
    FECHA: 'Respuesta de fecha específica'
  }
  
  return descripciones[tipo] || 'Tipo de pregunta personalizado'
}

// Lifecycle
onMounted(() => {
  inicializarFormulario()
})

// Reinicializar cuando cambie la pregunta
watch(() => props.pregunta, () => {
  inicializarFormulario()
}, { deep: true })
</script>

<style scoped>
@import '@/assets/css/components/professor/QuestionFormModal.css';
</style>
