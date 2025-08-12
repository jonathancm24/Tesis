# Módulo de Prescripciones Médicas

## Descripción General

El módulo de Prescripciones proporciona un sistema completo para la gestión de prescripciones farmacológicas en el contexto de casos clínicos odontológicos. Incluye validaciones médicas, control de estados, y análisis estadísticos.

## Arquitectura del Módulo

### Estructura de Archivos

```
Prescripciones/
├── Interface/
│   └── prescripcion.interface.ts     # 13 interfaces TypeScript
├── DTO/
│   ├── crear-actualizar-prescripcion.dto.ts  # 7 DTOs de creación/actualización
│   └── filtros-prescripciones.dto.ts         # 6 DTOs de filtros y respuestas
├── prescripcion.service.ts           # Lógica de negocio (800+ líneas)
├── prescripcion.controller.ts        # 12 endpoints REST
├── prescripcion.module.ts           # Configuración del módulo
└── PRESCRIPCIONES.md               # Esta documentación
```

### Interfaces Principales

#### IPrescripcion
Interface principal que define la estructura completa de una prescripción:
- Información farmacológica (medicamento, dosis, frecuencia, duración)
- Estado del workflow (PENDIENTE → APROBADO → EN_PROCESO → COMPLETADO)
- Metadatos (fechas, relaciones con casos clínicos)

#### IValidacionInteracciones
Sistema de validación de interacciones medicamentosas:
- Detección automática de conflictos entre medicamentos
- Clasificación por severidad (LEVE, MODERADA, SEVERA)
- Recomendaciones clínicas específicas

#### IValidacionDosificacion
Validación de dosificación apropiada:
- Consideración de edad, peso y género del paciente
- Factores de riesgo y condiciones médicas
- Alertas de dosificación inapropiada

## Estados del Workflow

### Flujo Principal
```
PENDIENTE → APROBADO → EN_PROCESO → COMPLETADO
    ↓           ↓
RECHAZADO   CANCELADO
    ↓
PENDIENTE
```

### Transiciones Válidas
- **PENDIENTE**: Puede ir a APROBADO, RECHAZADO, o CANCELADO
- **APROBADO**: Puede ir a EN_PROCESO o CANCELADO
- **RECHAZADO**: Puede volver a PENDIENTE o ser CANCELADO
- **EN_PROCESO**: Puede ir a COMPLETADO, INCOMPLETO, o CANCELADO
- **COMPLETADO**: Estado final (no permite cambios)
- **INCOMPLETO**: Puede volver a EN_PROCESO o ser CANCELADO
- **CANCELADO**: Estado final (eliminación lógica)

## Permisos por Rol

### ESTUDIANTE
- ✅ Crear nuevas prescripciones
- ✅ Editar prescripciones en estado PENDIENTE
- ✅ Completar prescripciones (marcar como COMPLETADO)
- ✅ Validar interacciones y dosificación
- ❌ Cambiar estados (aprobar/rechazar)
- ❌ Actualizaciones completas
- ❌ Eliminar prescripciones

### PROFESOR
- ✅ Todas las operaciones de ESTUDIANTE
- ✅ Aprobar/rechazar prescripciones (cambio de estados)
- ✅ Actualizaciones completas de cualquier prescripción
- ✅ Eliminar prescripciones (solo PENDIENTES)
- ✅ Ver estadísticas completas

### ADMIN
- ✅ Acceso completo a todas las funcionalidades
- ✅ Operaciones de administración del sistema

### SECRETARIO
- ✅ Consultar prescripciones y datos
- ✅ Ver estadísticas y reportes
- ❌ Crear, editar o eliminar prescripciones

## Funcionalidades Principales

### 1. Gestión CRUD Básica

#### Crear Prescripción
```typescript
POST /prescripciones
Body: CrearPrescripcionDto
```
- Validación automática de duplicados
- Estado inicial: PENDIENTE
- Verificación de existencia del caso clínico

#### Actualizar Prescripción Básica
```typescript
PATCH /prescripciones/:id/basica
Body: ActualizarPrescripcionBasicaDto
```
- Estudiantes: solo prescripciones PENDIENTES
- Profesores: cualquier prescripción

#### Actualizar Estado
```typescript
PATCH /prescripciones/:id/estado
Body: ActualizarEstadoPrescripcionDto
```
- Solo profesores
- Validación de transiciones válidas
- Registro automático en observaciones

### 2. Validaciones Médicas

#### Validación de Interacciones
```typescript
POST /prescripciones/validar-interacciones
Body: ValidarInteraccionesDto
```
- Análisis de medicamentos activos del paciente
- Clasificación por severidad
- Recomendaciones clínicas específicas

#### Validación de Dosificación
```typescript
POST /prescripciones/validar-dosificacion
Body: ValidarDosificacionDto
```
- Considera edad, peso y género
- Factores de riesgo personalizados
- Alertas de seguridad farmacológica

### 3. Búsqueda y Filtrado

#### Filtros Disponibles
- Estado de prescripción
- Caso clínico específico
- Medicamento (búsqueda parcial)
- Rango de fechas
- Vía de administración
- Presentación farmacológica
- Con/sin observaciones

#### Paginación
- Resultados por página configurables
- Ordenamiento por múltiples campos
- Información de navegación completa

### 4. Estadísticas y Reportes

#### Métricas Incluidas
- Distribución por estado
- Medicamentos más prescritos
- Análisis por vía de administración
- Tiempo promedio de aprobación
- Porcentaje de aprobación
- Prescripciones por estudiante

## Validaciones de Seguridad

### Validación de Duplicados
Previene la creación de prescripciones duplicadas del mismo medicamento para un paciente en el mismo caso clínico.

### Control de Permisos
- Validación por rol en cada endpoint
- Verificación de propiedad para estudiantes
- Control granular de operaciones

### Integridad de Estados
- Solo permite transiciones válidas
- Validación de estados finales
- Prevención de modificaciones inapropiadas

## Integración con Otros Módulos

### CasosClinicos
- Cada prescripción pertenece a un caso clínico
- Acceso a datos del paciente y especialidad
- Validación de existencia del caso

### Observaciones
- Registro automático de cambios de estado
- Trazabilidad completa de modificaciones
- Comentarios y observaciones del docente

### Usuarios
- Control de acceso basado en roles
- Validación de permisos específicos
- Auditoría de operaciones por usuario

## Ejemplos de Uso

### Crear una Nueva Prescripción
```typescript
const nuevaPrescripcion = {
  casoClinicoId: 123,
  medicamento: "Amoxicilina",
  dosis: "500mg",
  frecuencia: "Cada 8 horas",
  duracion: "7 días",
  concentracion: "500mg/cápsula",
  presentacion: "Cápsulas",
  viadeadministracion: "Oral",
  Nrodefarmacos: 21
};

// POST /prescripciones
```

### Aprobar una Prescripción
```typescript
const aprobacion = {
  estado: "APROBADO",
  motivo: "Prescripción validada según protocolo",
  observaciones: "Recordar al paciente tomar con alimentos"
};

// PATCH /prescripciones/123/estado
```

### Validar Interacciones
```typescript
const validacion = {
  prescripcionId: 123,
  incluirOtrosCasos: true,
  forzarValidacion: false
};

// POST /prescripciones/validar-interacciones
```

## Características Técnicas

### Tecnologías Utilizadas
- **NestJS**: Framework del backend
- **Prisma ORM**: Acceso a base de datos
- **PostgreSQL**: Base de datos principal
- **class-validator**: Validación de DTOs
- **Swagger/OpenAPI**: Documentación automática

### Patrones Implementados
- **Repository Pattern**: A través de Prisma
- **DTO Pattern**: Separación de datos de entrada/salida
- **Guard Pattern**: Control de acceso y autorización
- **Service Layer**: Lógica de negocio centralizada

### Características de Calidad
- **Type Safety**: TypeScript end-to-end
- **Validation**: Validación automática de entrada
- **Error Handling**: Manejo consistente de errores
- **Logging**: Trazabilidad completa de operaciones
- **Documentation**: Swagger automático y comentarios

## Consideraciones de Desarrollo

### Extensibilidad
El módulo está diseñado para ser fácilmente extensible:
- Nuevos tipos de validación farmacológica
- Integración con bases de datos de medicamentos
- Reportes personalizados adicionales
- Nuevos estados del workflow si es necesario

### Mantenimiento
- Código bien documentado y tipado
- Separación clara de responsabilidades
- Patrones consistentes con otros módulos
- Tests unitarios recomendados para lógica crítica

### Performance
- Consultas optimizadas con includes selectivos
- Paginación para grandes volúmenes de datos
- Índices de base de datos en campos de búsqueda frecuente
- Cacheo de validaciones complejas (futuro)
