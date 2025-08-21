<!--
  Componente de vista previa para preguntas clínicas
  Muestra cómo se verá la pregunta según su configuración
  @author Sistema de Gestión Clínica
  @version 2.0
-->
<template>
  <div class="question-preview" v-if="question">
    <div class="question-text">
      {{ question.displayText }}
      <span v-if="question.validation.required" class="required-indicator">*</span>
    </div>
    
    <div class="question-input">
      <!-- Sí/No -->
      <div v-if="question.type === 'si_no'" class="si-no-input">
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="preview-sino" value="si" :disabled="disabled" />
            <span>Sí</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="preview-sino" value="no" :disabled="disabled" />
            <span>No</span>
          </label>
        </div>
        <div v-if="question.config.requiresDetail" class="detail-section">
          <label class="detail-label">Si la respuesta es "Sí", proporcione más detalles:</label>
          <textarea 
            class="detail-textarea"
            placeholder="Escriba los detalles aquí..."
            :disabled="disabled"
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- Texto Corto -->
      <div v-else-if="question.type === 'texto'" class="text-input">
        <input
          type="text"
          class="text-field"
          :placeholder="question.config.placeholder || 'Escriba su respuesta aquí...'"
          :disabled="disabled"
        />
      </div>

      <!-- Texto Largo -->
      <div v-else-if="question.type === 'texto_largo'" class="textarea-input">
        <textarea
          class="textarea-field"
          :placeholder="question.config.placeholder || 'Escriba su respuesta detallada aquí...'"
          :disabled="disabled"
          rows="4"
        ></textarea>
      </div>

      <!-- Número -->
      <div v-else-if="question.type === 'numero'" class="number-input">
        <input
          type="number"
          class="number-field"
          :placeholder="question.config.placeholder || 'Ingrese un número'"
          :min="question.config.min"
          :max="question.config.max"
          :disabled="disabled"
        />
        <div v-if="question.config.min !== undefined || question.config.max !== undefined" class="number-range">
          <span v-if="question.config.min !== undefined">Mínimo: {{ question.config.min }}</span>
          <span v-if="question.config.max !== undefined">Máximo: {{ question.config.max }}</span>
        </div>
      </div>

      <!-- Opción Múltiple -->
      <div v-else-if="question.type === 'multiple'" class="multiple-input">
        <div class="checkbox-group">
          <label 
            v-for="(option, index) in question.config.options" 
            :key="index"
            class="checkbox-option"
          >
            <input type="checkbox" :disabled="disabled" />
            <span>{{ option }}</span>
          </label>
        </div>
      </div>

      <!-- Escala -->
      <div v-else-if="question.type === 'escala'" class="scale-input">
        <div class="scale-container">
          <div v-if="question.config.scale?.labels?.[0]" class="scale-label-min">
            {{ question.config.scale.labels[0] }}
          </div>
          <div class="scale-options">
            <label 
              v-for="num in scaleRange" 
              :key="num"
              class="scale-option"
            >
              <input type="radio" :name="`preview-scale-${question.displayText}`" :value="num" :disabled="disabled" />
              <span class="scale-number">{{ num }}</span>
            </label>
          </div>
          <div v-if="question.config.scale?.labels?.[1]" class="scale-label-max">
            {{ question.config.scale.labels[1] }}
          </div>
        </div>
      </div>

      <!-- Fecha -->
      <div v-else-if="question.type === 'fecha'" class="date-input">
        <input
          type="date"
          class="date-field"
          :disabled="disabled"
        />
      </div>

      <!-- Fallback -->
      <div v-else class="fallback-input">
        <input
          type="text"
          class="text-field"
          placeholder="Campo de respuesta"
          :disabled="disabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ParsedQuestion } from '@/utils/questionParser'

interface Props {
  question: ParsedQuestion | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: true
})

const scaleRange = computed(() => {
  if (!props.question?.config.scale) return []
  
  const min = props.question.config.scale.min || 1
  const max = props.question.config.scale.max || 5
  
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})
</script>

<style scoped>
.question-preview {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  font-family: inherit;
}

.question-text {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  line-height: 1.5;
}

.required-indicator {
  color: #e53e3e;
  font-weight: 700;
  margin-left: 4px;
}

.question-input {
  margin-top: 12px;
}

/* Sí/No Input */
.si-no-input .radio-group {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.radio-option input {
  margin: 0;
}

.detail-section {
  margin-top: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  border-left: 3px solid #ab47bc;
}

.detail-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 6px;
}

.detail-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 0.85rem;
  resize: vertical;
  font-family: inherit;
}

/* Text Inputs */
.text-field, .number-field, .date-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
}

.textarea-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

/* Number Input */
.number-range {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #718096;
  display: flex;
  gap: 16px;
}

/* Multiple Choice */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 0;
}

.checkbox-option input {
  margin: 0;
}

/* Scale Input */
.scale-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.scale-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.scale-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  gap: 4px;
}

.scale-option input {
  margin: 0;
}

.scale-number {
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a5568;
}

.scale-label-min,
.scale-label-max {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
  text-align: center;
}

/* Disabled State */
input:disabled,
textarea:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 480px) {
  .question-preview {
    padding: 16px;
  }
  
  .scale-options {
    gap: 8px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
