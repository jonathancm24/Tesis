<!--
  Componente reutilizable para campos de formulario con validación
-->
<template>
  <div class="form-field" :class="{ 'has-error': hasError, 'is-validating': isValidating }">
    <label v-if="label" :for="fieldId" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <div class="field-wrapper">
      <slot />
      
      <!-- Indicador de validación asíncrona -->
      <div v-if="isValidating" class="validation-indicator">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    </div>
    
    <!-- Mensajes de error -->
    <div v-if="hasError && error" class="error-message" :id="`${fieldId}-error`">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>
    
    <!-- Lista de errores múltiples -->
    <div v-else-if="hasError && errors && errors.length > 0" class="error-messages" :id="`${fieldId}-error`">
      <div v-for="(err, index) in errors" :key="index" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ err }}
      </div>
    </div>
    
    <!-- Mensaje de ayuda -->
    <div v-if="helpText && !hasError" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label?: string;
  error?: string;
  errors?: string[];
  helpText?: string;
  required?: boolean;
  isValidating?: boolean;
  fieldId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  error: '',
  errors: () => [],
  helpText: '',
  required: false,
  isValidating: false,
  fieldId: () => `field-${Math.random().toString(36).substr(2, 9)}`
});

// Computed properties
const hasError = computed(() => {
  return !!(props.error || (props.errors && props.errors.length > 0));
});
</script>

<style scoped>
.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212529;
  font-size: 0.875rem;
}

.required-indicator {
  color: #dc3545;
  margin-left: 0.25rem;
}

.field-wrapper {
  position: relative;
}

.validation-indicator {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.error-message,
.error-messages .error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.error-messages {
  margin-top: 0.5rem;
}

.error-message i {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

/* Estados del campo */
.form-field.has-error .form-label {
  color: #dc3545;
}

.form-field.is-validating .form-label {
  color: #6c757d;
}

/* Animaciones */
.validation-indicator i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 576px) {
  .form-field {
    margin-bottom: 1rem;
  }
  
  .form-label {
    font-size: 0.8rem;
  }
  
  .error-message,
  .help-text {
    font-size: 0.8rem;
  }
}
</style>
