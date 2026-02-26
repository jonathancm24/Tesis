<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">
            <span class="title-icon">📋</span>Encuesta de Tamizaje
          </h2>
          <p class="modal-subtitle">
            Antecedentes médicos y estado de salud
          </p>
        </div>
        <button
          class="close-button"
          @click="handleClose"
          title="Cerrar (Esc)"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">Progreso General</span>
          <span class="progress-percentage">{{ porcentajeCompletitud }}%</span>
        </div>
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: porcentajeCompletitud + '%' }"
          ></div>
        </div>
        <div class="progress-stats">
          <span class="stat"
            ><strong>{{ respuestasCompletadas }}</strong> de
            <strong>{{ totalPreguntas }}</strong> respondidas</span
          >
        </div>
      </div>

      <!-- Tabs by Category -->
      <div class="tabs-container">
        <div class="tabs-list" role="tablist">
          <button
            v-for="(categoria, idx) in categorias"
            :key="categoria"
            role="tab"
            :aria-selected="activeTab === idx"
            class="tab-button"
            :class="{ active: activeTab === idx }"
            @click="cambiarCategoria(idx)"
          >
            <span class="tab-text">{{ formatCategoryName(categoria) }}</span>
            <span class="tab-count">
              {{ getPreguntasRespondidasCategoria(categoria) }} / {{ getCategoryQuestionCount(categoria) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Question Navigation Info -->
      <div v-if="currentCategoryQuestions.length > 0" class="question-nav-info">
        <div class="category-progress">
          <span class="category-name">{{ formatCategoryName(categorias[activeTab] || '') }}</span>
          <span class="question-counter">Pregunta {{ currentQuestionIndex + 1 }} de {{ currentCategoryQuestions.length }}</span>
        </div>
        <div class="mini-progress-bar">
          <div
            class="mini-progress-fill"
            :style="{ width: categoryProgressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Questions Content -->
      <div class="questions-container">
        <div v-if="currentCategoryQuestions.length === 0" class="empty-state">
          <p>No hay preguntas disponibles en esta categoría</p>
        </div>

        <div v-else-if="currentQuestion" class="questions-wrapper">
          <Transition :name="transitionName" mode="out-in">
            <div :key="currentQuestionKey" class="current-question">
              <QuestionRenderer
                :question="currentQuestion"
                :model-value="respuestasActuales.get(currentQuestion?.id || 0) ?? null"
                :detalle="detallesActuales.get(currentQuestion?.id || 0) ?? null"
                :index="globalQuestionIndex"
                :show-error="showErrors"
                @update:model-value="
                  (value) => currentQuestion && handleRespuestaChange(currentQuestion.id, value)
                "
                @update:detalle="(value) => currentQuestion && detallesActuales.set(currentQuestion.id, value)"
              />
            </div>
          </Transition>

          <!-- Navigation Buttons -->
          <div class="question-navigation">
            <button
              class="nav-button nav-prev"
              :disabled="isFirstQuestion"
              @click="previousQuestion"
              title="Pregunta anterior (←)"
            >
              <span class="nav-icon">←</span>
              <span class="nav-text">Anterior</span>
            </button>
            
            <div class="nav-dots">
              <button
                v-for="(q, idx) in currentCategoryQuestions"
                :key="q.id"
                class="nav-dot"
                :class="{
                  active: idx === currentQuestionIndex,
                  answered: respuestasActuales.has(q.id) && 
                    respuestasActuales.get(q.id) !== null && 
                    respuestasActuales.get(q.id) !== ''
                }"
                :title="`Pregunta ${idx + 1}`"
                @click="currentQuestionIndex = idx"
              ></button>
            </div>

            <button
              class="nav-button nav-next"
              :disabled="isLastQuestion"
              @click="nextQuestion"
              title="Siguiente pregunta (→)"
            >
              <span class="nav-text">Siguiente</span>
              <span class="nav-icon">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer with Actions -->
      <div class="modal-footer">
        <div class="footer-buttons">
          <button class="btn-secondary" :disabled="isReadOnly" @click="handleLimpiar">
            🔄 Limpiar
          </button>
          <button class="btn-secondary" @click="handleClose">Cancelar</button>
          <button
            class="btn-primary"
            :disabled="isLoading || isReadOnly"
            @click="handleGuardar"
          >
            <span v-if="!isLoading">💾 Guardar Respuestas</span>
            <span v-else class="loading-spinner">⏳ Guardando...</span>
          </button>
        </div>
        <div v-if="error" class="error-alert">
          <span class="error-icon">❌</span>
          {{ error }}
        </div>
        <div v-if="success" class="success-alert">
          <span class="success-icon">✅</span>
          {{ success }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useEncuestaTamizajeStore } from '@/stores/Estudiantes/encuestaTamizaje'
import QuestionRenderer from './QuestionRenderer.vue'
import type { PreguntaTamizaje } from '@/types/encuestaTamizaje.types'

interface Props {
  isOpen: boolean
  pacienteId?: number
  genero?: string
}

const props = withDefaults(defineProps<Props>(), {
  pacienteId: 0,
  genero: ''
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  saved: []
}>()

const store = useEncuestaTamizajeStore()
const activeTab = ref(0)
const currentQuestionIndex = ref(0)
const transitionName = ref('slide-left')
const showErrors = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const isReadOnly = computed(() => store.encuestaPacienteActual?.estado === 'COMPLETADA')

// Local state for responses
const respuestasActuales = ref<Map<number, string | boolean | null>>(
  new Map()
)
const detallesActuales = ref<Map<number, string | null>>(new Map())

/* Categorías ordenadas */
const categorias = computed(() => {
  const categoryOrder = [
    'DATOS GENERALES',
    'ANTECEDENTES PERSONALES',
    'ANTECEDENTES MÉDICOS',
    'MEDICAMENTOS',
    'ANTECEDENTES FAMILIARES',
    'ANTECEDENTES BUCALES',
    'ANTECEDENTES GINECOLÓGICOS'
  ]

  const available = store.categorias
  return available.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    return (
      (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    )
  })
})

/* Filtrar preguntas según género del paciente */
const preguntasFiltradas = computed(() => {
  const esMujer = props.genero?.toLowerCase() === 'femenino' || props.genero?.toLowerCase() === 'f' || props.genero?.toLowerCase() === 'mujer'
  
  return store.todasLasPreguntas.filter(pregunta => {
    // Si la pregunta es solo para mujeres y el paciente no es mujer, excluirla
    if (pregunta.soloMujer && !esMujer) {
      return false
    }
    return true
  })
})

/* Preguntas de la categoría activa */
const currentCategoryQuestions = computed(() => {
  if (categorias.value.length === 0) return []
  const currentCategory = categorias.value[activeTab.value]
  if (!currentCategory) return []
  
  const preguntasCategoria = store.preguntasPorCategoria[currentCategory] || []
  const esMujer = props.genero?.toLowerCase() === 'femenino' || props.genero?.toLowerCase() === 'f' || props.genero?.toLowerCase() === 'mujer'
  
  return preguntasCategoria
    .filter(pregunta => {
      // Filtrar preguntas solo para mujeres si el paciente no es mujer
      if (pregunta.soloMujer && !esMujer) {
        return false
      }
      return true
    })
    .sort((a: PreguntaTamizaje, b: PreguntaTamizaje) => (a.orden || 0) - (b.orden || 0))
})

/* Pregunta actual */
const currentQuestion = computed(() => {
  return currentCategoryQuestions.value[currentQuestionIndex.value]
})

/* Key única para la pregunta actual (para transiciones) */
const currentQuestionKey = computed(() => {
  return currentQuestion.value?.id || 0
})

/* Índice global de la pregunta */
const globalQuestionIndex = computed(() => {
  let count = 0
  for (let i = 0; i < activeTab.value; i++) {
    const categoria = categorias.value[i]
    if (categoria) {
      count += getCategoryQuestionCount(categoria)
    }
  }
  return count + currentQuestionIndex.value
})

/* Navegación */
const isFirstQuestion = computed(() => {
  return activeTab.value === 0 && currentQuestionIndex.value === 0
})

const isLastQuestion = computed(() => {
  return activeTab.value === categorias.value.length - 1 &&
    currentQuestionIndex.value === currentCategoryQuestions.value.length - 1
})

/* Progreso de categoría actual */
const categoryProgressPercentage = computed(() => {
  if (currentCategoryQuestions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / currentCategoryQuestions.value.length) * 100)
})

/* Total de preguntas (filtradas según género) */
const totalPreguntas = computed(() => preguntasFiltradas.value.length)

/* Respuestas completadas */
const respuestasCompletadas = computed(() => {
  let count = 0
  respuestasActuales.value.forEach((value) => {
    // Contar como respondida si tiene cualquier valor excepto null o string vacío
    // false (respuesta "No") SÍ cuenta como respuesta válida
    if (value !== null && value !== '') {
      count++
    }
  })
  return count
})

/* Porcentaje de completitud */
const porcentajeCompletitud = computed(() => {
  if (totalPreguntas.value === 0) return 0
  return Math.round((respuestasCompletadas.value / totalPreguntas.value) * 100)
})

/* Cuenta de preguntas por categoría */
const getCategoryQuestionCount = (categoria: string): number => {
  return store.preguntasPorCategoria[categoria]?.length || 0
}

/* Preguntas respondidas por categoría */
const getPreguntasRespondidasCategoria = (categoria: string): number => {
  const preguntas = store.preguntasPorCategoria[categoria] || []
  return preguntas.filter((p) => {
    const respuesta = respuestasActuales.value.get(p.id)
    // Respuesta válida: cualquier valor excepto null o string vacío
    // false (No) ES una respuesta válida
    return respuesta !== null && respuesta !== ''
  }).length
}

/* Formatea nombre de categoría */
const formatCategoryName = (categoria: string): string => {
  return categoria
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

/* Navegación entre preguntas */
const nextQuestion = () => {
  if (currentQuestionIndex.value < currentCategoryQuestions.value.length - 1) {
    transitionName.value = 'slide-left'
    currentQuestionIndex.value++
  } else if (activeTab.value < categorias.value.length - 1) {
    // Pasar a la siguiente categoría
    transitionName.value = 'slide-left'
    activeTab.value++
    currentQuestionIndex.value = 0
  }
  showErrors.value = false
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    transitionName.value = 'slide-right'
    currentQuestionIndex.value--
  } else if (activeTab.value > 0) {
    // Pasar a la categoría anterior
    transitionName.value = 'slide-right'
    activeTab.value--
    const categoria = categorias.value[activeTab.value]
    if (categoria) {
      const prevCategoryQuestions = store.preguntasPorCategoria[categoria] || []
      currentQuestionIndex.value = prevCategoryQuestions.length - 1
    } else {
      currentQuestionIndex.value = 0
    }
  }
  showErrors.value = false
}

const cambiarCategoria = (idx: number) => {
  if (idx !== activeTab.value) {
    transitionName.value = idx > activeTab.value ? 'slide-left' : 'slide-right'
    activeTab.value = idx
    currentQuestionIndex.value = 0
    showErrors.value = false
  }
}

/* Maneja cambio de respuesta */
const handleRespuestaChange = (preguntaId: number, value: string | boolean | null) => {
  respuestasActuales.value.set(preguntaId, value)
  showErrors.value = false
}

/* Maneja cierre del modal */
const handleClose = () => {
  emit('update:isOpen', false)
  showErrors.value = false
  error.value = null
  success.value = null
  activeTab.value = 0
  currentQuestionIndex.value = 0
}

/* Limpia las respuestas */
const handleLimpiar = () => {
  if (isReadOnly.value) {
    error.value = 'La encuesta está completada y solo puede visualizarse. Cree una nueva versión para editar.'
    return
  }

  if (confirm('¿Está seguro de que desea limpiar todas las respuestas?')) {
    respuestasActuales.value.clear()
    detallesActuales.value.clear()
    showErrors.value = false
  }
}

/* Guarda las respuestas */
const handleGuardar = async () => {
  error.value = null
  success.value = null

  if (isReadOnly.value) {
    error.value = 'La encuesta está completada y no se puede modificar. Cree una nueva versión para editar.'
    return
  }

  // Validar que todas las preguntas obligatorias tengan respuesta (solo las filtradas)
  const preguntasObligatorias = preguntasFiltradas.value.filter(
    (p) => p.obligatoria !== false
  )
  const incompletas = preguntasObligatorias.filter((p) => {
    const respuesta = respuestasActuales.value.get(p.id)
    // Una pregunta está incompleta si no tiene respuesta (null) o es string vacío
    // false (No) SÍ es una respuesta válida
    return !respuestasActuales.value.has(p.id) || respuesta === null || respuesta === ''
  })

  if (incompletas.length > 0) {
    showErrors.value = true
    error.value = `Por favor, complete las ${incompletas.length} pregunta(s) obligatoria(s)`
    return
  }

  isLoading.value = true

  try {
    // Llamar al store para guardar (ya no convertimos, el store lo hace)
    const resultado = await store.guardarRespuestas(
      props.pacienteId, 
      respuestasActuales.value,
      detallesActuales.value
    )

    success.value = '✅ Respuestas guardadas exitosamente'

    // Recargar la encuesta del paciente para obtener el progreso actualizado
    setTimeout(async () => {
      await store.cargarEncuestaPaciente(props.pacienteId)
      emit('saved')
      handleClose()
    }, 1500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al guardar'
    console.error('❌ Modal - Error guardando respuestas:', err)
  } finally {
    isLoading.value = false
  }
}

const cargarDatosEncuestaActual = async () => {
  if (!props.pacienteId) return

  await store.cargarEncuestaPaciente(props.pacienteId)

  respuestasActuales.value.clear()
  detallesActuales.value.clear()

  if (store.encuestaPacienteActual?.respuestas) {
    store.encuestaPacienteActual.respuestas.forEach((r) => {
      if (r.respuesta !== null && r.respuesta !== '') {
        const pregunta = store.todasLasPreguntas.find(p => p.id === r.preguntaId)

        let valorRespuesta: string | boolean | null = r.respuesta

        if (pregunta?.tipo === 'SI_NO') {
          if (r.respuesta === 'SI' || r.respuesta === true) {
            valorRespuesta = true
          } else if (r.respuesta === 'NO' || r.respuesta === false) {
            valorRespuesta = false
          }
        }

        respuestasActuales.value.set(r.preguntaId, valorRespuesta)

        if (r.detalle) {
          detallesActuales.value.set(r.preguntaId, r.detalle)
        }
      }
    })
  }
}

/* Atajos de teclado */
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      if (!isLastQuestion.value) nextQuestion()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      if (!isFirstQuestion.value) previousQuestion()
      break
    case 'Escape':
      event.preventDefault()
      handleClose()
      break
  }
}

/* Carga inicial de preguntas */
onMounted(async () => {
  try {
    // Cargar todas las preguntas si no existen
    if (store.todasLasPreguntas.length === 0) {
      await store.cargarTodasLasPreguntas()
    }

    await cargarDatosEncuestaActual()
  } catch (err) {
    console.error('Error cargando datos:', err)
    error.value = 'Error al cargar las preguntas'
  }

  // Agregar listener de teclado
  window.addEventListener('keydown', handleKeydown)
})

/* Limpiar listeners */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

/* Watch para resetear tab cuando se abre el modal */
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      activeTab.value = 0
      currentQuestionIndex.value = 0
      showErrors.value = false
      error.value = null
      success.value = null
      await cargarDatosEncuestaActual()
    }
  }
)

watch(
  () => props.pacienteId,
  async (newPacienteId, oldPacienteId) => {
    if (!props.isOpen) return
    if (!newPacienteId || newPacienteId === oldPacienteId) return
    await cargarDatosEncuestaActual()
  }
)
</script>

<style scoped src="@/assets/styles/Estudiantes/components/EncuestaTamizajeModal.css"></style>
