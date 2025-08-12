# Módulo de Casos Clínicos

## Descripción
El módulo de casos clínicos es uno de los componentes centrales del sistema de gestión clínica odontológica. Permite la creación, seguimiento y evaluación de casos clínicos de estudiantes bajo supervisión de profesores.

## Arquitectura

### Archivos Principales
```
📁 CasosClinicos/
├── 📄 casos-clinicos.module.ts    - Configuración del módulo
├── 📄 caso.service.ts             - Lógica de negocio y validaciones
├── 📄 caso.controller.ts          - Endpoints REST con documentación Swagger
├── 📁 DTO/
│   ├── 📄 crear-actualizar-caso.dto.ts  - DTOs para creación y actualización
│   └── 📄 filtros-casos.dto.ts          - DTOs para filtros y respuestas
└── 📁 Interface/
    └── 📄 caso-clinico.interface.ts     - Interfaces TypeScript
```

## Estados del Caso Clínico

### Flujo de Estados
```
EN_REVISION → APROBADO → PENDIENTE_ESTUDIOS → EN_TRATAMIENTO → FINALIZADO
     ↓            ↓              ↓                  ↓
  CANCELADO    CANCELADO     CANCELADO         CANCELADO
```

### Descripción de Estados
- **EN_REVISION**: Estado inicial, requiere aprobación del profesor
- **APROBADO**: Caso aprobado, puede proceder a estudios o tratamiento
- **PENDIENTE_ESTUDIOS**: Requiere estudios adicionales antes del tratamiento
- **EN_TRATAMIENTO**: Caso activo con tratamientos en curso
- **FINALIZADO**: Caso completado exitosamente
- **CANCELADO**: Caso cancelado por motivos diversos

## Permisos por Rol

### 🎓 ESTUDIANTE
- ✅ Crear nuevos casos clínicos
- ✅ Ver sus propios casos
- ✅ Editar casos en estado EN_REVISION
- ❌ Cambiar estados
- ❌ Ver casos de otros estudiantes

### 👨‍🏫 PROFESOR
- ✅ Ver todos los casos clínicos
- ✅ Aprobar/rechazar casos
- ✅ Cambiar estados del caso
- ✅ Asignar calificaciones
- ✅ Actualización completa de casos
- ✅ Validar finalización

### 👑 ADMIN
- ✅ Control total sobre casos clínicos
- ✅ Todas las operaciones disponibles
- ✅ Gestión de estadísticas

### 📋 SECRETARIO
- ✅ Lectura de casos para reportes
- ✅ Estadísticas y métricas
- ❌ Modificación de casos

## Endpoints Principales

### Gestión Básica
```http
POST   /casos-clinicos                    # Crear caso clínico
GET    /casos-clinicos                    # Listar con filtros
GET    /casos-clinicos/:id               # Obtener por ID
PUT    /casos-clinicos/:id/basico        # Actualización básica
PUT    /casos-clinicos/:id/completo      # Actualización completa
```

### Gestión de Estados
```http
PATCH  /casos-clinicos/:id/estado              # Cambiar estado
PATCH  /casos-clinicos/:id/calificacion        # Asignar calificación
POST   /casos-clinicos/:id/validar-finalizacion # Validar finalización
```

### Consultas Especializadas
```http
GET    /casos-clinicos/estudiante/:id          # Casos de un estudiante
GET    /casos-clinicos/profesor/:id            # Casos de un profesor
GET    /casos-clinicos/pendientes/atencion     # Casos que requieren atención
GET    /casos-clinicos/estadisticas/resumen    # Estadísticas completas
```

## Validaciones de Negocio

### Creación de Casos
- ✓ Paciente debe existir y no tener casos activos
- ✓ Especialidad debe existir
- ✓ Estudiante debe ser válido y activo
- ✓ Profesor debe ser válido y activo

### Transiciones de Estado
- ✓ Solo se permiten transiciones válidas según el flujo
- ✓ Para finalizar: todos los tratamientos deben estar FINALIZADOS
- ✓ Los estudiantes solo pueden editar en estado EN_REVISION

### Permisos de Acceso
- ✓ Estudiantes solo ven sus propios casos
- ✓ Profesores solo ven casos asignados (excepto admins)
- ✓ Validación de roles en cada endpoint

## Integración con Otros Módulos

### Dependencias
- **PrismaModule**: Acceso a base de datos
- **TratamientoModule**: Validación de finalización
- **PacienteModule**: Verificación de pacientes
- **UsuariosModule**: Validación de estudiantes/profesores
- **EspecialidadModule**: Verificación de especialidades

### Sistema de Observaciones
- Se registran cambios de estado automáticamente
- Las calificaciones generan observaciones
- Historial completo de modificaciones

## Características Técnicas

### Filtros y Búsqueda
- Filtrado por especialidad, estudiante, profesor, estado
- Búsqueda por texto en motivo de consulta
- Filtros de fecha (desde/hasta)
- Paginación configurable
- Ordenamiento múltiple

### Estadísticas
- Distribución por estados
- Distribución por especialidades
- Casos del mes actual
- Promedio de calificaciones
- Tiempo promedio de finalización
- Casos con/sin tratamientos

### Documentación API
- Swagger/OpenAPI completo
- Ejemplos de request/response
- Descripción detallada de parámetros
- Códigos de error documentados

## Ejemplos de Uso

### Crear Caso Clínico
```typescript
const nuevoCaso = await casoService.crearCasoClinico({
  pacienteId: 1,
  profesorId: 2,
  estudianteId: 3,
  especialidadId: 1,
  motivoConsulta: "Dolor dental",
  enfermedadActual: "Caries dental en molar superior",
  // ... otros campos médicos
});
```

### Aprobar Caso
```typescript
await casoService.actualizarEstadoCasoClinico(casoId, {
  estado: EstadoCasoClinico.APROBADO,
  profesorId: profesorId,
  motivo: "Caso bien documentado, puede proceder"
});
```

### Validar Finalización
```typescript
const validacion = await casoService.validarFinalizacion({
  casoClinicoId: casoId
});

if (validacion.puedeFinalizarse) {
  // Proceder con finalización
} else {
  console.log(validacion.motivo);
  // Mostrar tratamientos pendientes
}
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
- Includes optimizados en queries de Prisma
- Paginación en listados
- Índices en campos de filtrado frecuente
- Queries separadas para estadísticas

### Mejores Prácticas
- Usar filtros específicos en lugar de consultas amplias
- Implementar caché para estadísticas si es necesario
- Paginar resultados grandes
- Usar includes solo cuando sea necesario

## Seguridad

### Validaciones de Entrada
- Class-validator en todos los DTOs
- Sanitización automática de datos
- Validación de tipos y rangos

### Control de Acceso
- Guards JWT en todos los endpoints
- Validación de roles por endpoint
- Verificación de permisos a nivel de registro

### Auditoría
- Log de todas las operaciones críticas
- Registro de cambios de estado
- Observaciones automáticas en modificaciones

Este módulo integra perfectamente con la infraestructura existente (pipes, filtros, guards) y proporciona una base sólida para la gestión de casos clínicos en el sistema odontológico.
