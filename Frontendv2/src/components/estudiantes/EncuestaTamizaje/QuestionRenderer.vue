<template>
  <div class="question-item">
    <!-- Header con número y texto de la pregunta -->
    <div class="question-header">
      <div class="question-number">{{ index + 1 }}</div>
      <div class="question-text">
        {{ question.texto }}
        <span v-if="isRequired" class="required-badge">*</span>
      </div>
    </div>

    <!-- Renderizado condicional según tipo -->
    <div class="question-input">
      <!-- SI_NO: Radio Buttons -->
      <template v-if="question.tipo === 'SI_NO'">
        <div class="radio-group">
          <label class="radio-option">
            <input
              type="radio"
              :name="`question-${question.id}`"
              :value="true"
              :checked="modelValue === true"
              @change="$emit('update:modelValue', true)"
            />
            <span class="radio-label">Sí</span>
          </label>
          <label class="radio-option">
            <input
              type="radio"
              :name="`question-${question.id}`"
              :value="false"
              :checked="modelValue === false"
              @change="$emit('update:modelValue', false)"
            />
            <span class="radio-label">No</span>
          </label>
        </div>
      </template>

      <!-- TEXTO: Input de texto -->
      <template v-else-if="question.tipo === 'TEXTO'">
        <input
          type="text"
          class="text-input"
          :value="(modelValue as string) || ''"
          placeholder="Ingrese su respuesta..."
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </template>

      <!-- NUMERO: Input numérico -->
      <template v-else-if="question.tipo === 'NUMERO'">
        <input
          type="number"
          class="number-input"
          :value="(modelValue as string) || ''"
          placeholder="Ingrese un número..."
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </template>

      <!-- FECHA: Input de fecha -->
      <template v-else-if="question.tipo === 'FECHA'">
        <input
          type="date"
          class="date-input"
          :value="(modelValue as string) || ''"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </template>

      <!-- TEXTAREA: Área de texto grande -->
      <template v-else-if="question.tipo === 'TEXTAREA'">
        <textarea
          class="textarea-input"
          :value="(modelValue as string) || ''"
          placeholder="Ingrese su respuesta detallada..."
          rows="3"
          @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </template>

      <!-- MULTIPLE_SELECCION: Checkboxes -->
      <template v-else-if="question.tipo === 'MULTIPLE_SELECCION'">
        <div class="checkbox-group">
          <label class="checkbox-option">
            <input
              type="checkbox"
              value="otro"
              :checked="
                Array.isArray(modelValue) && modelValue.includes('otro')
              "
              @change="
                handleMultipleChange(
                  $event,
                  Array.isArray(modelValue) ? modelValue : []
                )
              "
            />
            <span class="checkbox-label">Otro</span>
          </label>
        </div>
      </template>
    </div>

    <!-- Campo adicional si requiere detalle -->
    <div v-if="question.requiereDetalle && modelValue" class="detail-section">
      <label class="detail-label">Detalles adicionales (opcional)</label>
      <textarea
        class="detail-textarea"
        placeholder="Proporcione más detalles..."
        :value="detalle || ''"
        rows="2"
        @input="$emit('update:detalle', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <!-- Mensaje de error si está incompleto -->
    <div v-if="showError && isRequired && (modelValue === null || modelValue === '')" class="error-message">
      <span class="error-icon">⚠️</span>
      Esta pregunta es obligatoria
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PreguntaTamizaje } from '@/types/encuestaTamizaje.types'

interface Props {
  question: PreguntaTamizaje
  modelValue?: string | boolean | null
  detalle?: string | null
  index?: number
  showError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  detalle: null,
  index: 0,
  showError: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | boolean | null]
  'update:detalle': [value: string | null]
}>()

const isRequired = computed(() => props.question.obligatoria ?? true)

const handleMultipleChange = (event: Event, currentValue: string[]) => {
  const target = event.target as HTMLInputElement
  const newValue = new Set(currentValue)

  if (target.checked) {
    newValue.add(target.value)
  } else {
    newValue.delete(target.value)
  }

  emit('update:modelValue', Array.from(newValue).join(','))
}
</script>

<style scoped src="@/assets/styles/Estudiantes/components/QuestionRenderer.css"></style>
