<template>
  <div class="patient-form-container">
    <!-- Título del formulario -->
    <div class="form-header mb-4">
      <h3 class="form-title">
        <i class="fas fa-user-plus me-2"></i>
        {{ patient?.id ? 'Editar Paciente' : 'Nuevo Paciente' }}
      </h3>
      <p class="form-subtitle text-muted">
        Complete todos los campos obligatorios marcados con *
      </p>
    </div>

    <!-- Indicador de carga -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Guardando...</span>
      </div>
      <p class="mt-2">Guardando paciente...</p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleFormSubmit" class="patient-form" novalidate>
      <div class="row g-3">
        <!-- Información Personal -->
        <div class="col-12">
          <h5 class="section-title">
            <i class="fas fa-user me-2"></i>
            Información Personal
          </h5>
        </div>

        <!-- Nombre -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.nombre"
            type="text"
            label="Nombre"
            :required="true"
            placeholder="Ingrese el nombre del paciente"
            :errors="getFieldErrors('nombre')"
            :validation-rules="[
              { type: 'required' },
              { type: 'minLength', value: 2 },
              { type: 'maxLength', value: 50 },
              { type: 'pattern', value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras y espacios' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Apellido -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.apellido"
            type="text"
            label="Apellido"
            :required="true"
            placeholder="Ingrese el apellido del paciente"
            :errors="getFieldErrors('apellido')"
            :validation-rules="[
              { type: 'required' },
              { type: 'minLength', value: 2 },
              { type: 'maxLength', value: 50 },
              { type: 'pattern', value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras y espacios' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Tipo de Documento -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.tipoDocumento"
            type="select"
            label="Tipo de Documento"
            :required="true"
            placeholder="Seleccione el tipo de documento"
            :options="tipoDocumentoOptions"
            :errors="getFieldErrors('tipoDocumento')"
            :validation-rules="[
              { type: 'required' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Número de Documento -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.numeroDocumento"
            type="text"
            label="Número de Documento"
            :required="true"
            :placeholder="getDocumentPlaceholder()"
            :help-text="getDocumentHelpText()"
            :errors="getFieldErrors('numeroDocumento')"
            :validation-rules="getDocumentValidationRules()"
            @validate="validateField"
          />
        </div>

        <!-- Fecha de Nacimiento -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.fechaNacimiento"
            type="date"
            label="Fecha de Nacimiento"
            :required="true"
            help-text="Fecha de nacimiento del paciente"
            :errors="getFieldErrors('fechaNacimiento')"
            :validation-rules="[
              { type: 'required' },
              { type: 'date' },
              { 
                type: 'custom',
                message: 'La fecha no puede ser en el futuro',
                validator: (value: string | number | Date) => value ? new Date(value) <= new Date() : true
              },
              {
                type: 'custom',
                message: 'La edad debe ser menor a 120 años',
                validator: (value: string | number | Date) => {
                  if (!value) return true;
                  const birthDate = new Date(value);
                  const ageDiff = Date.now() - birthDate.getTime();
                  const ageDate = new Date(ageDiff);
                  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                  return age < 120;
                }
              }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Género -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.genero"
            type="select"
            label="Género"
            :required="true"
            placeholder="Seleccione el género"
            :options="generoOptions"
            :errors="getFieldErrors('genero')"
            :validation-rules="[
              { type: 'required' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Información de Contacto -->
        <div class="col-12 mt-4">
          <h5 class="section-title">
            <i class="fas fa-phone me-2"></i>
            Información de Contacto
          </h5>
        </div>

        <!-- Teléfono -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.telefono"
            type="tel"
            label="Teléfono"
            placeholder="0987654321"
            help-text="Número de teléfono móvil o fijo"
            :errors="getFieldErrors('telefono')"
            :validation-rules="[
              { type: 'phone' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Email -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.email"
            type="email"
            label="Correo Electrónico"
            placeholder="paciente@email.com"
            help-text="Correo electrónico opcional para notificaciones"
            :errors="getFieldErrors('email')"
            :validation-rules="[
              { type: 'email' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Dirección -->
        <div class="col-12">
          <FormField
            v-model="formData.direccion"
            type="textarea"
            label="Dirección"
            placeholder="Ingrese la dirección del paciente"
            help-text="Dirección completa del domicilio del paciente"
            :rows="3"
            :errors="getFieldErrors('direccion')"
            :validation-rules="[
              { type: 'maxLength', value: 500 }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Observaciones -->
        <div class="col-12">
          <FormField
            v-model="formData.observaciones"
            type="textarea"
            label="Observaciones"
            placeholder="Observaciones adicionales sobre el paciente"
            help-text="Notas adicionales o información relevante"
            :rows="3"
            :errors="getFieldErrors('observaciones')"
            :validation-rules="[
              { type: 'maxLength', value: 1000 }
            ]"
            @validate="validateField"
          />
        </div>
      </div>

      <!-- Error general del API -->
      <div v-if="apiError" class="alert alert-danger mt-4">
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>Error al guardar paciente</strong>
            <p class="mb-0">{{ apiError.message }}</p>
          </div>
        </div>
      </div>

      <!-- Resumen de errores -->
      <div v-if="hasErrors && hasSubmitted" class="alert alert-warning mt-4">
        <div class="d-flex align-items-start">
          <i class="fas fa-exclamation-triangle me-2 mt-1"></i>
          <div>
            <strong>Por favor, corrija los siguientes errores:</strong>
            <ul class="mb-0 mt-2">
              <li v-for="(errors, field) in fieldErrors" :key="field">
                <strong>{{ getFieldLabel(field) }}:</strong> {{ errors[0] }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions mt-4">
        <button
          type="button"
          class="btn btn-secondary me-2"
          @click="onCancel"
          :disabled="isSubmitting"
        >
          <i class="fas fa-times me-1"></i>
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="fas fa-save me-1"></i>
          {{ isSubmitting ? 'Guardando...' : (patient?.id ? 'Actualizar Paciente' : 'Crear Paciente') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import FormField from '@/components/common/FormField.vue';
import { useFormValidation } from '@/composables/useFormValidation';
import { getPatientValidationRules } from '@/utils/formValidation';
import { useToast } from '@/composables/useToast';
import type { PacienteLista } from '@/types/patient';

// Props
interface Props {
  patient?: PacienteLista | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  patient: null,
  loading: false
});

// Emits
const emit = defineEmits<{
  save: [patientData: any];
  cancel: [];
}>();

// Composables
const { showSuccess } = useToast();
const {
  isSubmitting,
  hasErrors,
  hasSubmitted,
  fieldErrors,
  apiError,
  getFieldErrors,
  validateField: validateSingleField,
  handleSubmit,
  resetForm
} = useFormValidation({
  validationRules: getPatientValidationRules(),
  showToastOnError: true,
  resetOnSuccess: false
});

// Fecha de hoy para validaciones (no usado pero mantenido para referencia)
// const today = computed(() => {
//   return new Date().toISOString().split('T')[0];
// });

// Datos del formulario
const formData = reactive({
  nombre: '',
  apellido: '',
  tipoDocumento: '',
  numeroDocumento: '',
  fechaNacimiento: '',
  genero: '',
  telefono: '',
  email: '',
  direccion: '',
  observaciones: ''
});

// Opciones para los selects
const tipoDocumentoOptions = [
  { value: 'CEDULA', label: 'Cédula de Identidad' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'RUC', label: 'RUC' },
  { value: 'OTRO', label: 'Otro' }
];

const generoOptions = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' }
];

// Labels para los campos (para mostrar en errores)
const fieldLabels: Record<string, string> = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  tipoDocumento: 'Tipo de Documento',
  numeroDocumento: 'Número de Documento',
  fechaNacimiento: 'Fecha de Nacimiento',
  genero: 'Género',
  telefono: 'Teléfono',
  email: 'Correo Electrónico',
  direccion: 'Dirección',
  observaciones: 'Observaciones'
};

// Métodos
const validateField = (fieldName: string, value: any, rules: any[]) => {
  validateSingleField(fieldName, value, rules, formData);
};

const getFieldLabel = (fieldName: string): string => {
  return fieldLabels[fieldName] || fieldName;
};

const getDocumentPlaceholder = (): string => {
  switch (formData.tipoDocumento) {
    case 'CEDULA':
      return '1234567890';
    case 'PASAPORTE':
      return 'AB1234567';
    case 'RUC':
      return '1234567890001';
    default:
      return 'Ingrese el número de documento';
  }
};

const getDocumentHelpText = (): string => {
  switch (formData.tipoDocumento) {
    case 'CEDULA':
      return 'Cédula de identidad ecuatoriana (10 dígitos)';
    case 'PASAPORTE':
      return 'Número de pasaporte válido';
    case 'RUC':
      return 'RUC ecuatoriano (13 dígitos)';
    default:
      return 'Número de documento válido';
  }
};

const getDocumentValidationRules = () => {
  return [
    { type: 'required' as const },
    { type: 'minLength' as const, value: 6 },
    { type: 'maxLength' as const, value: 15 }
  ];
};

const handleFormSubmit = async () => {
  const submitFunction = async () => {
    // Preparar datos para enviar
    const dataToSend = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      fechaNacimiento: formData.fechaNacimiento,
      genero: formData.genero,
      telefono: formData.telefono || null,
      email: formData.email || null,
      direccion: formData.direccion || null,
      observaciones: formData.observaciones || null
    };

    emit('save', dataToSend);
    return dataToSend;
  };

  const result = await handleSubmit(formData, submitFunction);
  
  if (result) {
    const action = props.patient?.id ? 'actualizado' : 'creado';
    showSuccess(`Paciente ${action} exitosamente`);
  }
};

const onCancel = () => {
  resetForm();
  emit('cancel');
};

const loadPatientData = () => {
  if (props.patient) {
    formData.nombre = props.patient.nombre || '';
    formData.apellido = props.patient.apellido || '';
    formData.tipoDocumento = 'CEDULA'; // Valor por defecto ya que PacienteLista no tiene este campo
    formData.numeroDocumento = props.patient.cedula || ''; // Mapear cedula a numeroDocumento
    formData.fechaNacimiento = props.patient.fechaNacimiento ? 
      new Date(props.patient.fechaNacimiento).toISOString().split('T')[0] : '';
    formData.genero = props.patient.genero || '';
    formData.telefono = props.patient.telefono || '';
    formData.email = props.patient.email || '';
    formData.direccion = ''; // PacienteLista no tiene direccion
    formData.observaciones = ''; // PacienteLista no tiene observaciones
  }
};

// Lifecycle
onMounted(() => {
  loadPatientData();
});
</script>

<style scoped>
.patient-form-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  color: #2d3748;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-subtitle {
  font-size: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0.75rem;
}

.patient-form {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.section-title {
  color: #4a5568;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.form-actions {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.alert {
  border-radius: 0.75rem;
  border: none;
  padding: 1.25rem;
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-left: 4px solid #ef4444;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.alert ul {
  padding-left: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .patient-form {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .patient-form {
    padding: 1rem;
    margin: 0.5rem;
  }
}
</style>
