# Sistema de Validación y Manejo de Errores

Este documento explica cómo usar el sistema completo de validación y manejo de errores implementado en el frontend.

## 📚 Archivos Principales

### Tipos y Interfaces
- `src/types/errors.ts` - Tipos para errores y validaciones
- `src/utils/errorHandler.ts` - Procesamiento de errores del backend
- `src/utils/formValidation.ts` - Utilidades de validación de formularios

### Composables
- `src/composables/useFormValidation.ts` - Hook para validación de formularios
- `src/composables/useToast.ts` - Hook para notificaciones toast

### Componentes
- `src/components/common/FormField.vue` - Campo de formulario con validación
- `src/components/common/ToastContainer.vue` - Contenedor de notificaciones

## 🚀 Cómo Usar

### 1. Formulario Básico con Validación

```vue
<template>
  <form @submit.prevent="handleFormSubmit">
    <!-- Campo con validación -->
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
    
    <button type="submit" :disabled="hasErrors">
      Guardar
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import FormField from '@/components/common/FormField.vue';
import { useFormValidation } from '@/composables/useFormValidation';

const formData = reactive({
  nombre: '',
  email: ''
});

const {
  hasErrors,
  getFieldErrors,
  validateField: validateSingleField,
  handleSubmit
} = useFormValidation();

const validateField = (fieldName, value, rules) => {
  validateSingleField(fieldName, value, rules, formData);
};

const handleFormSubmit = async () => {
  await handleSubmit(formData, async () => {
    // Aquí haces la llamada al API
    const response = await api.post('/users', formData);
    return response.data;
  });
};
</script>
```

### 2. Tipos de Validación Disponibles

```javascript
// Validaciones básicas
{ type: 'required' }
{ type: 'email' }
{ type: 'minLength', value: 6 }
{ type: 'maxLength', value: 100 }
{ type: 'numeric' }
{ type: 'date' }
{ type: 'phone' }
{ type: 'cedula' }

// Validación con regex
{ 
  type: 'pattern', 
  value: /^[A-Za-z]+$/, 
  message: 'Solo se permiten letras' 
}

// Validación personalizada
{ 
  type: 'custom',
  message: 'Las contraseñas no coinciden',
  validator: (value, formData) => value === formData.password
}
```

### 3. Manejo de Errores del Backend

```javascript
import { processBackendError, handleGlobalError } from '@/utils/errorHandler';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

try {
  await api.post('/users', userData);
} catch (error) {
  // Opción 1: Manejo manual
  const appError = processBackendError(error);
  showToast(appError.message, 'error');
  
  // Opción 2: Manejo automático con toast
  handleGlobalError(error, showToast);
}
```

### 4. Notificaciones Toast

```javascript
import { useToast } from '@/composables/useToast';

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Mostrar diferentes tipos de toast
showSuccess('Usuario creado exitosamente');
showError('Error al guardar los datos');
showWarning('Revise los campos obligatorios');
showInfo('Información guardada');

// Toast persistente
showToast('Mensaje importante', 'warning', 0, true);
```

### 5. Campo FormField Completo

```vue
<FormField
  v-model="formData.email"
  type="email"
  label="Correo Electrónico"
  :required="true"
  placeholder="usuario@email.com"
  help-text="Se usará para el inicio de sesión"
  :errors="getFieldErrors('email')"
  :validation-rules="[
    { type: 'required' },
    { type: 'email' }
  ]"
  :show-validation-icons="true"
  @validate="validateField"
  @focus="handleFocus"
  @blur="handleBlur"
/>
```

### 6. Validaciones Predefinidas

```javascript
import { 
  getUserValidationRules,
  getPatientValidationRules,
  getLoginValidationRules 
} from '@/utils/formValidation';

// Para formularios de usuario
const userRules = getUserValidationRules();

// Para formularios de paciente
const patientRules = getPatientValidationRules();

// Para login
const loginRules = getLoginValidationRules();
```

## 🛠️ Características del Sistema

### ✅ Validación en Tiempo Real
- Validación mientras el usuario escribe
- Validación al perder el foco del campo
- Validación completa al enviar el formulario

### ✅ Manejo de Errores del Backend
- Mapeo automático de errores a mensajes amigables
- Manejo específico por código de error
- Soporte para errores de validación por campo

### ✅ Estados Visuales
- Campos con borde rojo/verde según validación
- Iconos de validación opcionales
- Mensajes de error específicos por campo

### ✅ Tipos de Campo Soportados
- `text`, `email`, `password`, `tel`
- `number`, `date`, `datetime-local`
- `select`, `textarea`

### ✅ Responsive y Accesible
- Diseño responsive para móviles
- Atributos ARIA para accesibilidad
- Focus states mejorados

### ✅ Notificaciones Toast
- 4 tipos: success, error, warning, info
- Auto-cierre configurable
- Animaciones suaves
- Responsive

## 🔧 Configuración

### Agregar ToastContainer al App.vue

```vue
<template>
  <div id="app">
    <router-view/>
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '@/components/common/ToastContainer.vue';
</script>
```

### Personalizar Mensajes de Error

```javascript
import { FormValidator } from '@/utils/formValidation';

const customMessages = {
  required: 'Este campo es obligatorio',
  email: 'Formato de email inválido',
  minLength: 'Mínimo {min} caracteres'
};

const validator = new FormValidator(customMessages);
```

## 📝 Ejemplos Completos

### Formulario de Usuario
Ver: `src/components/admin/UserFormValidated.vue`

### Formulario de Paciente
Ver: `src/components/secretary/PatientFormValidated.vue`

### Formulario de Encuesta
Ver: `src/components/student/EncuestaTamizajeForm.vue` (ya actualizado)

## 🔍 Debugging

### Ver Errores en Consola
```javascript
// El sistema automáticamente logea errores procesados
console.error('Error procesado:', appError);
```

### Estado de Validación
```javascript
const validation = useFormValidation();

// Ver estado actual
console.log('Tiene errores:', validation.hasErrors.value);
console.log('Errores por campo:', validation.fieldErrors);
console.log('Error de API:', validation.apiError.value);
```

## 🎯 Beneficios

1. **Consistencia**: Todos los formularios usan el mismo sistema
2. **Reutilización**: Componentes y lógica reutilizable
3. **Mantenibilidad**: Código centralizado y organizado
4. **UX Mejorada**: Feedback inmediato y mensajes claros
5. **Accesibilidad**: Cumple estándares de accesibilidad web
6. **Escalabilidad**: Fácil agregar nuevos tipos de validación

---

Este sistema proporciona una base sólida para el manejo de formularios y errores en toda la aplicación, mejorando significativamente la experiencia del usuario y la calidad del código.
