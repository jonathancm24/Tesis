<template>
  <div class="user-form-container">
    <!-- Indicador de carga -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Guardando...</span>
      </div>
      <p class="mt-2">Guardando usuario...</p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleFormSubmit" class="user-form" novalidate>
      <div class="row g-3">
        <!-- Nombre -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.nombre"
            type="text"
            label="Nombre"
            :required="true"
            placeholder="Ingrese el nombre"
            :errors="getFieldErrors('nombre')"
            :validation-rules="[
              { type: 'required' },
              { type: 'minLength', value: 2 },
              { type: 'maxLength', value: 50 }
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
            placeholder="Ingrese el apellido"
            :errors="getFieldErrors('apellido')"
            :validation-rules="[
              { type: 'required' },
              { type: 'minLength', value: 2 },
              { type: 'maxLength', value: 50 }
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
            :required="true"
            placeholder="usuario@dominio.com"
            help-text="Se utilizará para el inicio de sesión"
            :errors="getFieldErrors('email')"
            :validation-rules="[
              { type: 'required' },
              { type: 'email' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Cédula -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.cedula"
            type="text"
            label="Cédula"
            :required="true"
            placeholder="0123456789"
            help-text="Cédula de identidad ecuatoriana"
            :errors="getFieldErrors('cedula')"
            :validation-rules="[
              { type: 'required' },
              { type: 'cedula' }
            ]"
            @validate="validateField"
          />
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

        <!-- Rol -->
        <div class="col-12 col-md-6">
          <FormField
            v-model="formData.rol"
            type="select"
            label="Rol"
            :required="true"
            placeholder="Seleccione un rol"
            :options="roleOptions"
            help-text="Rol que tendrá el usuario en el sistema"
            :errors="getFieldErrors('rol')"
            :validation-rules="[
              { type: 'required' }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Contraseña (solo para nuevo usuario) -->
        <div v-if="!user?.id" class="col-12 col-md-6">
          <FormField
            v-model="formData.password"
            type="password"
            label="Contraseña"
            :required="true"
            placeholder="Mínimo 6 caracteres"
            help-text="La contraseña debe tener al menos 6 caracteres"
            :errors="getFieldErrors('password')"
            :validation-rules="[
              { type: 'required' },
              { type: 'minLength', value: 6 },
              { type: 'maxLength', value: 100 }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Confirmar contraseña (solo para nuevo usuario) -->
        <div v-if="!user?.id" class="col-12 col-md-6">
          <FormField
            v-model="formData.confirmPassword"
            type="password"
            label="Confirmar Contraseña"
            :required="true"
            placeholder="Confirme la contraseña"
            help-text="Debe coincidir con la contraseña anterior"
            :errors="getFieldErrors('confirmPassword')"
            :validation-rules="[
              { type: 'required' },
              { 
                type: 'custom', 
                message: 'Las contraseñas no coinciden',
                validator: (value: string) => value === formData.password
              }
            ]"
            @validate="validateField"
          />
        </div>

        <!-- Estado del usuario -->
        <div class="col-12">
          <div class="form-check">
            <input
              id="activo"
              v-model="formData.activo"
              type="checkbox"
              class="form-check-input"
            />
            <label for="activo" class="form-check-label">
              Usuario activo
            </label>
            <small class="form-text text-muted d-block">
              Los usuarios inactivos no podrán acceder al sistema
            </small>
          </div>
        </div>
      </div>

      <!-- Error general del API -->
      <div v-if="apiError" class="alert alert-danger mt-3">
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>Error al guardar usuario</strong>
            <p class="mb-0">{{ apiError.message }}</p>
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
          :disabled="isSubmitting || hasErrors"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="fas fa-save me-1"></i>
          {{ isSubmitting ? 'Guardando...' : (user?.id ? 'Actualizar' : 'Crear Usuario') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import FormField from '@/components/common/FormField.vue';
import { useFormValidation } from '@/composables/useFormValidation';
import { getUserValidationRules } from '@/utils/formValidation';
import { useToast } from '@/composables/useToast';
import type { User } from '@/types/user';

// Props
interface Props {
  user?: User | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  loading: false
});

// Emits
const emit = defineEmits<{
  save: [userData: any];
  cancel: [];
}>();

// Composables
const { showSuccess } = useToast();
const {
  isSubmitting,
  hasErrors,
  apiError,
  getFieldErrors,
  validateField: validateSingleField,
  handleSubmit,
  resetForm
} = useFormValidation({
  validationRules: getUserValidationRules(),
  showToastOnError: true,
  resetOnSuccess: false
});

// Datos del formulario
const formData = reactive({
  nombre: '',
  apellido: '',
  email: '',
  cedula: '',
  telefono: '',
  rol: '',
  password: '',
  confirmPassword: '',
  activo: true
});

// Opciones para el select de roles
const roleOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'PROFESSOR', label: 'Profesor' },
  { value: 'SECRETARY', label: 'Secretario' },
  { value: 'STUDENT', label: 'Estudiante' }
];

// Métodos
const validateField = (fieldName: string, value: any, rules: any[]) => {
  validateSingleField(fieldName, value, rules, formData);
};

const handleFormSubmit = async () => {
  const submitFunction = async () => {
    // Preparar datos para enviar
    const dataToSend = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      cedula: formData.cedula,
      telefono: formData.telefono || null,
      rol: formData.rol,
      activo: formData.activo
    };

    // Agregar contraseña solo si es un usuario nuevo
    if (!props.user?.id) {
      (dataToSend as any).password = formData.password;
    }

    emit('save', dataToSend);
    return dataToSend;
  };

  const result = await handleSubmit(formData, submitFunction);
  
  if (result) {
    const action = props.user?.id ? 'actualizado' : 'creado';
    showSuccess(`Usuario ${action} exitosamente`);
  }
};

const onCancel = () => {
  resetForm();
  emit('cancel');
};

const loadUserData = () => {
  if (props.user) {
    formData.nombre = props.user.nombre || '';
    formData.apellido = props.user.apellido || '';
    formData.email = props.user.email || '';
    formData.cedula = ''; // User no tiene cedula directamente
    formData.telefono = ''; // User no tiene telefono directamente
    formData.rol = props.user.role || '';
    formData.activo = props.user.activo ?? true;
    
    // Limpiar campos de contraseña para edición
    formData.password = '';
    formData.confirmPassword = '';
  }
};

// Lifecycle
onMounted(() => {
  loadUserData();
});

// Watchers
// watch(() => props.user, loadUserData, { immediate: true });
</script>

<style scoped>
.user-form-container {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0.5rem;
}

.user-form {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.form-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5c636a;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.alert {
  border-radius: 0.5rem;
  border: none;
  padding: 1rem;
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.form-check {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

/* Responsive */
@media (max-width: 768px) {
  .user-form {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
