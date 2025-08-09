# 📋 **Formularios que necesitan actualización**

## 🔧 **Archivos del Frontend a Actualizar**

### **1. Formulario de Usuarios**
- **Archivo**: `frontend/src/components/admin/UserForm.vue`
- **Cambios necesarios**:
  - Campo `cedula` → `numeroDocumento`
  - Agregar selector `tipoDocumento`
  - Validaciones condicionales según tipo

### **2. Perfil de Administrador**
- **Archivo**: `frontend/src/views/admin/AdminProfile.vue`
- **Cambios necesarios**:
  - Campo `cedula` → `numeroDocumento`
  - Agregar selector `tipoDocumento`

### **3. Formulario de Pacientes**
- **Archivo**: `frontend/src/components/secretary/PatientForm.vue`
- **Cambios necesarios**:
  - Campo `cedula` → `numeroDocumento`
  - Campo `cedulaRep` → `numeroDocumentoRep`
  - Agregar selectores de tipo de documento

### **4. Servicios del Frontend**
- **Archivo**: `frontend/src/services/pacienteService.ts`
- **Cambios necesarios**:
  - Mapeo de campos en respuestas

## 🎯 **Patrón de Formulario Recomendado**

```vue
<template>
  <!-- Selector de tipo de documento -->
  <div class="col-12 col-md-6">
    <label for="tipoDocumento" class="form-label">
      <i class="fas fa-id-card me-1"></i> Tipo de Documento *
    </label>
    <select
      id="tipoDocumento"
      v-model="local.tipoDocumento"
      class="form-select"
      required
    >
      <option value="">Seleccione tipo...</option>
      <option 
        v-for="(label, value) in TipoDocumentoLabels" 
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </select>
  </div>

  <!-- Campo de número de documento -->
  <div class="col-12 col-md-6">
    <label for="numeroDocumento" class="form-label">
      <i class="fas fa-id-card me-1"></i> 
      {{ getDocumentoLabel(local.tipoDocumento) }} *
    </label>
    <input
      id="numeroDocumento"
      v-model="local.numeroDocumento"
      type="text"
      class="form-control"
      :placeholder="getDocumentoPlaceholder(local.tipoDocumento)"
      required
    />
    <div class="invalid-feedback">
      {{ getDocumentoError(local.tipoDocumento) }}
    </div>
  </div>
</template>

<script>
import { TipoDocumento, TipoDocumentoLabels } from '@/types/patient'

// Funciones helper
const getDocumentoLabel = (tipo) => {
  switch (tipo) {
    case TipoDocumento.CEDULA: return 'Cédula'
    case TipoDocumento.PASAPORTE: return 'Pasaporte'
    case TipoDocumento.RUC: return 'RUC'
    default: return 'Número de Documento'
  }
}

const getDocumentoPlaceholder = (tipo) => {
  switch (tipo) {
    case TipoDocumento.CEDULA: return '1234567890'
    case TipoDocumento.PASAPORTE: return 'A12345678'
    case TipoDocumento.RUC: return '1234567890001'
    default: return 'Ingrese documento'
  }
}
</script>
```

## ✅ **Validaciones por Tipo**

```javascript
const validateDocumento = (tipo, numero) => {
  switch (tipo) {
    case TipoDocumento.CEDULA:
      return /^\d{10}$/.test(numero) 
        ? null 
        : 'La cédula debe tener 10 dígitos'
    
    case TipoDocumento.RUC:
      return /^\d{13}$/.test(numero) 
        ? null 
        : 'El RUC debe tener 13 dígitos'
    
    case TipoDocumento.PASAPORTE:
      return /^[A-Z0-9]{6,12}$/i.test(numero) 
        ? null 
        : 'Formato de pasaporte inválido'
    
    default:
      return numero.length >= 5 && numero.length <= 20
        ? null
        : 'El documento debe tener entre 5 y 20 caracteres'
  }
}
```

## 🔄 **Mapeo de Compatibilidad**

Para mantener la compatibilidad mientras migras, usa este patrón:

```javascript
// En servicios: Al enviar al backend
const requestData = {
  ...formData,
  // Mantener nombres nuevos
  tipoDocumento: formData.tipoDocumento,
  numeroDocumento: formData.numeroDocumento
}

// Al recibir del backend: mapear para frontend
const frontendData = {
  ...backendData,
  // El backend envía "cedula" por compatibilidad
  numeroDocumento: backendData.cedula || backendData.numeroDocumento
}
```

---

**📝 Nota**: El backend ya está actualizado y mantiene compatibilidad enviando el campo `cedula` mapeado desde `numeroDocumento`.
