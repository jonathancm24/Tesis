<template>
  <div class="form-field">
    <!-- Label -->
    <label 
      v-if="label"
      :for="fieldId"
      class="form-label"
      :class="{ 'required': required }"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <!-- Input según el tipo -->
    <div class="input-container">
      <!-- Input de texto -->
      <input
        v-if="type === 'text' || type === 'email' || type === 'password' || type === 'tel'"
        :id="fieldId"
        v-model="inputValue"
        :type="type"
        :class="fieldClass"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${fieldId}-error` : undefined"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Input de número -->
      <input
        v-else-if="type === 'number'"
        :id="fieldId"
        v-model="inputValue"
        type="number"
        :class="fieldClass"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${fieldId}-error` : undefined"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Input de fecha -->
      <input
        v-else-if="type === 'date' || type === 'datetime-local'"
        :id="fieldId"
        v-model="inputValue"
        :type="type"
        :class="fieldClass"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${fieldId}-error` : undefined"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Select -->
      <select
        v-else-if="type === 'select'"
        :id="fieldId"
        v-model="inputValue"
        :class="fieldClass"
        :disabled="disabled"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${fieldId}-error` : undefined"
        @change="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option value="" disabled>{{ placeholder || 'Seleccione una opción' }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Textarea -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="fieldId"
        v-model="inputValue"
        :class="fieldClass"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows || 3"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${fieldId}-error` : undefined"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      ></textarea>

      <!-- Iconos de estado -->
      <div v-if="showValidationIcons && (hasError || isValid)" class="validation-icon">
        <i v-if="hasError" class="fas fa-exclamation-circle text-danger"></i>
        <i v-else-if="isValid" class="fas fa-check-circle text-success"></i>
      </div>
    </div>

    <!-- Texto de ayuda -->
    <small v-if="helpText && !hasError" class="form-text text-muted">
      {{ helpText }}
    </small>

    <!-- Errores de validación -->
    <div v-if="hasError" :id="`${fieldId}-error`" class="invalid-feedback d-block">
      <div v-for="error in errors" :key="error" class="error-message">
        <i class="fas fa-exclamation-triangle me-1"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type { ValidationRule } from '@/utils/formValidation';

// Props
interface Props {
  modelValue: any;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea';
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  helpText?: string;
  errors?: string[];
  validationRules?: ValidationRule[];
  options?: Array<{ value: any; label: string }>;
  
  // Atributos específicos
  maxlength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  
  // Configuración de validación
  validateOnInput?: boolean;
  validateOnBlur?: boolean;
  showValidationIcons?: boolean;
  
  // Clases CSS
  fieldClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  validateOnInput: true,
  validateOnBlur: true,
  showValidationIcons: true,
  fieldClass: 'form-control'
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any];
  'validate': [field: string, value: any, rules: ValidationRule[]];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

// Estados reactivos
const hasFocus = ref(false);
const hasBlurred = ref(false);

// ID único para el campo
const fieldId = computed(() => {
  return `field-${Math.random().toString(36).substr(2, 9)}`;
});

// Valor del input
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Estado de validación
const hasError = computed(() => {
  return props.errors && props.errors.length > 0;
});

const isValid = computed(() => {
  return !hasError.value && hasBlurred.value && inputValue.value !== '' && inputValue.value !== null && inputValue.value !== undefined;
});

const errors = computed(() => {
  return props.errors || [];
});

// Clase CSS dinámica para el campo
const fieldClass = computed(() => {
  let classes = props.fieldClass;
  
  if (hasError.value) {
    classes += ' is-invalid';
  } else if (isValid.value) {
    classes += ' is-valid';
  }
  
  return classes;
});

// Manejadores de eventos
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  let value: any = target.value;
  
  // Conversión de tipos según el tipo de input
  if (props.type === 'number') {
    value = value === '' ? null : Number(value);
  }
  
  inputValue.value = value;
  
  // Validar en tiempo real si está habilitado
  if (props.validateOnInput && props.validationRules) {
    emit('validate', fieldId.value, value, props.validationRules);
  }
};

const handleBlur = (event: FocusEvent) => {
  hasFocus.value = false;
  hasBlurred.value = true;
  
  // Validar al perder el foco si está habilitado
  if (props.validateOnBlur && props.validationRules) {
    emit('validate', fieldId.value, inputValue.value, props.validationRules);
  }
  
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  hasFocus.value = true;
  emit('focus', event);
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  // Auto-validar cuando cambia el valor externamente
  if (hasBlurred.value && props.validationRules && props.validateOnInput) {
    nextTick(() => {
      emit('validate', fieldId.value, newValue, props.validationRules!);
    });
  }
});
</script>

<style scoped>
.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.form-label.required {
  position: relative;
}

.input-container {
  position: relative;
}

.validation-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 5;
}

.validation-icon i {
  font-size: 16px;
}

/* Ajustar padding cuando hay iconos de validación */
.form-control:not(select):not(textarea) {
  padding-right: 40px;
}

select.form-control {
  padding-right: 40px;
  background-position: right 40px center;
}

textarea.form-control {
  padding-right: 40px;
}

.invalid-feedback {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.error-message:last-child {
  margin-bottom: 0;
}

.form-text {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Estados de validación mejorados */
.form-control.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-control.is-valid {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control:focus.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-control:focus.is-valid {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

/* Animaciones suaves */
.form-control {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.validation-icon i {
  transition: color 0.15s ease-in-out;
}

.invalid-feedback {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
