# Implementación de Tipos de Documento para Representantes

## Resumen de Cambios Implementados

Se ha implementado exitosamente un sistema completo para manejar diferentes tipos de documentos tanto para pacientes como para sus representantes legales. Esto permite que el sistema funcione internacionalmente, no solo con cédulas ecuatorianas.

## Cambios en el Backend

### 1. Schema de Base de Datos (schema.prisma)
- ✅ Ya existía el enum `TipoDocumentoRepresentante` con valores: CEDULA, PASAPORTE, RUC, OTRO
- ✅ Ya existía el campo `tipoDocumentoRep` en el modelo `Paciente`
- ✅ Sistema funciona correctamente con ambos enums sincronizados

### 2. DTOs (Data Transfer Objects)
**Archivo:** `backend/src/modules/pacientes/DTO/registro.dto.ts`
- ✅ Agregado enum `TipoDocumentoRepresentante`
- ✅ Agregado campo `tipoDocumentoRep?: TipoDocumentoRepresentanteType` con validación
- ✅ Validación con decorador `@IsEnum()` para tipos válidos

### 3. Servicios
**Archivo:** `backend/src/modules/pacientes/paciente.service.ts`
- ✅ Actualizado método `crearPaciente()` para incluir `tipoDocumentoRep`
- ✅ Actualizado método `obtenerHistorialCompleto()` para devolver `tipoDocumentoRep`

**Archivo:** `backend/src/modules/pacientes/DTO/historial.dto.ts`
- ✅ Agregado campo `tipoDocumentoRep?: string` al DTO `PacienteBasicoDto`

### 4. Correcciones de Compatibilidad
**Archivo:** `backend/src/modules/Encuesta/encuesta.service.ts`
- ✅ Actualizado para usar `numeroDocumento` en lugar de `cedula` en las consultas
- ✅ Mantenida compatibilidad con frontend mapeando `numeroDocumento` → `cedula`

**Archivo:** `backend/src/modules/Encuesta/Interface/encuesta.interface.ts`
- ✅ Agregados comentarios de compatibilidad para el mapeo de campos

## Cambios en el Frontend

### 1. Tipos TypeScript
**Archivo:** `frontend/src/types/patient.ts`
- ✅ Agregado enum `TipoDocumentoRepresentante` con mismos valores que backend
- ✅ Agregado tipo `TipoDocumentoRepresentanteType`
- ✅ Agregado objeto `TipoDocumentoRepresentanteLabels` para textos amigables
- ✅ Actualizada interfaz `RegistroPaciente` con campo `tipoDocumentoRep?: TipoDocumentoRepresentanteType`
- ✅ Actualizada interfaz `PacienteBasico` con campo `tipoDocumentoRep?: string`

### 2. Validadores
**Archivo:** `frontend/src/utils/validators.ts` (NUEVO)
- ✅ Función `validateCedula()` - Valida cédulas ecuatorianas con algoritmo módulo 10
- ✅ Función `validateRUC()` - Valida RUCs ecuatorianos (personas naturales, sociedades, entidades públicas)
- ✅ Función `validatePassport()` - Validación básica para pasaportes
- ✅ Función `validatePhone()` - Valida teléfonos ecuatorianos
- ✅ Función `validateEmail()` - Validación de emails
- ✅ Funciones de ayuda para representantes legales

### 3. Componentes Actualizados
**Archivo:** `frontend/src/components/secretary/PatientForm.vue`
- ✅ Formulario completamente modernizado con todos los campos
- ✅ Sección específica para información del representante
- ✅ Selector de tipo de documento del representante
- ✅ Validación dinámica según el tipo de documento seleccionado
- ✅ Interfaz responsive y accesible
- ✅ Manejo de errores y validaciones en tiempo real

### 4. Ejemplo de Implementación
**Archivo:** `frontend/src/views/examples/PatientRegistrationExample.vue` (NUEVO)
- ✅ Página de ejemplo completa mostrando el uso del formulario
- ✅ Lista de pacientes con diferentes tipos de documentos
- ✅ Funcionalidad de edición y visualización
- ✅ Datos de ejemplo que muestran casos reales

## Funcionalidades Implementadas

### Para el Paciente Principal
- ✅ Soporte para CEDULA, PASAPORTE, RUC, OTRO
- ✅ Validación específica según el tipo de documento
- ✅ Placeholders dinámicos según el tipo seleccionado

### Para el Representante Legal
- ✅ Campo opcional para nombre del representante
- ✅ Selector independiente de tipo de documento
- ✅ Validación específica para el documento del representante
- ✅ Campos para relación y contacto del representante
- ✅ Campos solo aparecen cuando se ingresa un representante

### Validaciones Implementadas
- ✅ **Cédula Ecuatoriana:** Algoritmo módulo 10, verificación de provincia
- ✅ **RUC:** Validación para personas naturales, sociedades privadas y entidades públicas
- ✅ **Pasaporte:** Validación de longitud y caracteres alfanuméricos
- ✅ **Otro Documento:** Validación mínima de longitud
- ✅ **Teléfonos:** Formato ecuatoriano (9-10 dígitos)
- ✅ **Emails:** Validación estándar RFC

### Compatibilidad
- ✅ **Backward Compatibility:** El frontend sigue recibiendo `cedula` mapeada desde `numeroDocumento`
- ✅ **API Consistency:** Todas las APIs mantienen la estructura existente
- ✅ **Database Migration:** Sin pérdida de datos existentes

## Casos de Uso Cubiertos

### 1. Paciente Ecuatoriano Adulto
```javascript
{
  nombre: "Juan Carlos",
  apellido: "Pérez García", 
  tipoDocumento: "CEDULA",
  numeroDocumento: "1234567890"
  // Sin representante
}
```

### 2. Paciente Menor de Edad con Representante
```javascript
{
  nombre: "María Fernanda",
  apellido: "López Ruiz",
  tipoDocumento: "CEDULA", 
  numeroDocumento: "1234567891",
  representante: "Ana Ruiz López",
  tipoDocumentoRep: "CEDULA",
  numeroDocumentoRep: "1234567892",
  relacionRep: "Madre"
}
```

### 3. Paciente Extranjero
```javascript
{
  nombre: "Roberto",
  apellido: "Smith Johnson",
  tipoDocumento: "PASAPORTE",
  numeroDocumento: "ABC123456",
  // Representante con documento diferente si es necesario
  representante: "Jane Smith",
  tipoDocumentoRep: "PASAPORTE", 
  numeroDocumentoRep: "DEF789012"
}
```

## Estado del Sistema

### ✅ Completado
- Schema de base de datos actualizado
- Backend compilando sin errores
- DTOs y servicios actualizados
- Tipos TypeScript definidos
- Validadores implementados
- Formulario moderno funcional
- Ejemplo de implementación completo

### 📋 Listo para Implementar
El sistema está completamente preparado para:
1. Registrar pacientes con cualquier tipo de documento
2. Asignar representantes con documentos independientes
3. Validar documentos según su tipo
4. Mantener compatibilidad con código existente

### 🔄 Próximos Pasos Recomendados
1. Actualizar otros formularios que manejen pacientes (si los hay)
2. Implementar el ejemplo en las rutas reales de la aplicación
3. Ejecutar pruebas end-to-end con diferentes tipos de documentos
4. Documentar los nuevos endpoints para el equipo

## Archivos Modificados/Creados

### Backend
- `prisma/schema.prisma` (ya tenía la estructura correcta)
- `src/modules/pacientes/DTO/registro.dto.ts` (modificado)
- `src/modules/pacientes/DTO/historial.dto.ts` (modificado)
- `src/modules/pacientes/paciente.service.ts` (modificado)
- `src/modules/Encuesta/encuesta.service.ts` (corregido para compatibilidad)
- `src/modules/Encuesta/Interface/encuesta.interface.ts` (corregido para compatibilidad)

### Frontend
- `src/types/patient.ts` (modificado)
- `src/utils/validators.ts` (nuevo)
- `src/components/secretary/PatientForm.vue` (completamente modernizado)
- `src/views/examples/PatientRegistrationExample.vue` (nuevo)

El sistema ahora soporta completamente documentos internacionales tanto para pacientes como para representantes, manteniendo la funcionalidad existente y agregando flexibilidad para casos de uso globales.
