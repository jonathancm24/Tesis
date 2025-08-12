# Módulo de Tratamientos Clínicos

## 📋 Descripción General

Este módulo gestiona los tratamientos médicos dentro del sistema de casos clínicos odontológicos. Permite crear, actualizar y gestionar tratamientos con diferentes estados y niveles de permisos según el rol del usuario.

## 🚀 Funcionalidades Principales

### ✅ Para Estudiantes
- **Crear tratamientos** con estado PENDIENTE por defecto
- **Editar información básica** solo cuando el estado es RECHAZADO
- **Ver sus propios tratamientos** con filtros
- **Verificar permisos** de edición antes de modificar

### ✅ Para Profesores
- **Control completo** sobre todos los tratamientos
- **Cambiar estados** (PENDIENTE → APROBADO/RECHAZADO)
- **Asignar docentes** responsables
- **Actualización completa** en una sola operación
- **Ver tratamientos pendientes** de revisión

### ✅ Para Administradores
- **Todos los permisos** de profesores
- **Estadísticas completas** del sistema
- **Gestión avanzada** de todos los tratamientos

### ✅ Para Secretarios
- **Solo lectura** y consultas
- **Estadísticas** básicas
- **Reportes** del sistema

## 📊 Estados de Tratamiento

```
PENDIENTE → APROBADO → EN_PROCESO → FINALIZADO
    ↓           ↓
RECHAZADO   CANCELADO
    ↓
PENDIENTE (vuelta a enviar)
```

### Transiciones Válidas:
- **PENDIENTE** → APROBADO, RECHAZADO, CANCELADO
- **RECHAZADO** → PENDIENTE, CANCELADO
- **APROBADO** → EN_PROCESO, CANCELADO
- **EN_PROCESO** → FINALIZADO, CANCELADO
- **FINALIZADO** → *(estado final)*
- **CANCELADO** → *(estado final)*

## 🛠 Endpoints Disponibles

### 🔨 Creación y Actualización

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|--------|
| `POST` | `/tratamientos` | Crear nuevo tratamiento | EST, PROF, ADMIN |
| `PUT` | `/tratamientos/:id/basico` | Actualizar info básica | EST*, PROF, ADMIN |
| `PUT` | `/tratamientos/:id/estado` | Cambiar estado | PROF, ADMIN |
| `PUT` | `/tratamientos/:id/completo` | Actualización completa | PROF, ADMIN |

*EST: Solo si estado = RECHAZADO

### 🔍 Consultas

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|--------|
| `GET` | `/tratamientos` | Lista con filtros | Todos |
| `GET` | `/tratamientos/:id` | Tratamiento específico | Todos |
| `GET` | `/tratamientos/caso-clinico/:id` | Por caso clínico | Todos |
| `GET` | `/tratamientos/mis-tratamientos/estudiante` | Propios del estudiante | EST |
| `GET` | `/tratamientos/mis-tratamientos/profesor` | Asignados al profesor | PROF |
| `GET` | `/tratamientos/pendientes-revision` | Pendientes de revisión | PROF, ADMIN |

### 📈 Estadísticas

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|--------|
| `GET` | `/tratamientos/estadisticas/general` | Estadísticas completas | PROF, ADMIN, SEC |

### 🔐 Validaciones

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|--------|
| `GET` | `/tratamientos/:id/puede-editar` | Verificar permisos | Todos |

## 🎯 Filtros Disponibles

### Filtros de Búsqueda:
- `casoClinicoId` - ID del caso clínico
- `estudianteId` - ID del estudiante
- `docenteId` - ID del docente
- `estado` - Estado del tratamiento
- `tipoDiagnostico` - Tipo de diagnóstico
- `fechaDesde` - Fecha desde (YYYY-MM-DD)
- `fechaHasta` - Fecha hasta (YYYY-MM-DD)
- `busqueda` - Búsqueda en descripción

### Paginación:
- `pagina` - Número de página (default: 1)
- `limite` - Elementos por página (default: 10, max: 100)
- `ordenarPor` - Campo para ordenar (default: fechaCreacion)
- `direccion` - asc/desc (default: desc)

## 📝 Ejemplos de Uso

### Crear Tratamiento (Estudiante)
```bash
POST /tratamientos
Authorization: Bearer <token>
Content-Type: application/json

{
  "descripcion": "Limpieza dental profunda con aplicación de flúor",
  "casoClinicoId": 123,
  "estudianteId": 456,
  "frecuenciaCardiaca": "72 bpm",
  "presArterial": "120/80 mmHg",
  "saturacionOxigeno": "98%",
  "temperatura": "36.5°C",
  "tipoDiagnostico": "Presuntivo",
  "cie10Codigo": "K02.9"
}
```

### Cambiar Estado (Profesor)
```bash
PUT /tratamientos/123/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "APROBADO",
  "docenteId": 789,
  "motivo": "Tratamiento bien planificado y fundamentado"
}
```

### Buscar Tratamientos con Filtros
```bash
GET /tratamientos?estado=PENDIENTE&pagina=1&limite=20&ordenarPor=fechaCreacion&direccion=desc
Authorization: Bearer <token>
```

### Obtener Estadísticas
```bash
GET /tratamientos/estadisticas/general?fechaDesde=2024-01-01&fechaHasta=2024-12-31
Authorization: Bearer <token>
```

## 🔒 Validaciones de Negocio

### Validaciones Médicas:
- **Códigos CIE-10** deben existir en la base de datos
- **Códigos de procedimiento** deben ser válidos
- **Signos vitales** deben seguir formatos específicos:
  - Frecuencia cardíaca: `70 bpm` o `70`
  - Presión arterial: `120/80 mmHg` o `120/80`
  - Saturación: `98%` o `98`
  - Temperatura: `36.5°C` o `36.5`

### Validaciones de Permisos:
- **Estudiantes** solo pueden editar sus propios tratamientos RECHAZADOS
- **Profesores** pueden hacer cualquier operación
- **Estados finales** (FINALIZADO, CANCELADO) no se pueden modificar
- **Transiciones de estado** deben seguir el flujo permitido

### Validaciones de Datos:
- **Descripción**: 10-1000 caracteres
- **IDs**: números enteros positivos
- **Fechas**: formato ISO (YYYY-MM-DD)
- **Motivos de cambio**: 5-500 caracteres (requerido para rechazos)

## 📊 Respuestas de la API

### Tratamiento Completo
```json
{
  "id": 123,
  "descripcion": "Limpieza dental profunda...",
  "estado": "PENDIENTE",
  "fechaCreacion": "2024-08-11T10:00:00Z",
  "fechaActualizacion": "2024-08-11T10:00:00Z",
  "casoClinicoId": 456,
  "estudianteId": 789,
  "docenteId": null,
  "frecuenciaCardiaca": "72 bpm",
  "presArterial": "120/80 mmHg",
  "saturacionOxigeno": "98%",
  "temperatura": "36.5°C",
  "tipoDiagnostico": "Presuntivo",
  "cie10Codigo": "K02.9",
  "procedimientoCodigo": null,
  "estudiante": {
    "id": 789,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@universidad.edu"
  },
  "docente": null,
  "casoClinico": {
    "id": 456,
    "fechaCreacion": "2024-08-10T15:30:00Z"
  },
  "cie10": {
    "codigo": "K02.9",
    "descripcion": "Caries dental, no especificada"
  },
  "observaciones": []
}
```

### Lista Paginada
```json
{
  "data": [...], // Array de tratamientos
  "total": 150,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 15,
  "hayPaginaSiguiente": true,
  "hayPaginaAnterior": false
}
```

### Estadísticas
```json
{
  "total": 1250,
  "porEstado": {
    "PENDIENTE": 45,
    "APROBADO": 890,
    "RECHAZADO": 123,
    "CANCELADO": 67,
    "EN_PROCESO": 89,
    "FINALIZADO": 36
  },
  "porTipoDiagnostico": {
    "Presuntivo": 800,
    "Definitivo": 450
  },
  "promedioTiempoAprobacion": 3.5, // días
  "tratamientosDelMes": 89
}
```

## 🚨 Códigos de Error

| Código | Descripción | Causas Comunes |
|--------|-------------|----------------|
| `400` | Bad Request | Datos inválidos, transición de estado no permitida |
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Sin permisos para la operación, estado no permite edición |
| `404` | Not Found | Tratamiento, caso clínico o usuario no encontrado |
| `422` | Unprocessable Entity | Errores de validación específicos |

## 🔧 Configuración del Módulo

Para usar este módulo en tu aplicación:

```typescript
// app.module.ts
import { TratamientoModule } from './modules/tratamientos/tratamiento.module';

@Module({
  imports: [
    // ... otros módulos
    TratamientoModule,
  ],
})
export class AppModule {}
```

## 📋 Dependencias

- **PrismaModule** - Para acceso a base de datos
- **JwtAuthGuard** - Para autenticación
- **RolesGuard** - Para autorización por roles
- **class-validator** - Para validación de DTOs
- **class-transformer** - Para transformación de datos

## 🎓 Casos de Uso Típicos

### Flujo del Estudiante:
1. Crear tratamiento → Estado PENDIENTE
2. Esperar revisión del profesor
3. Si RECHAZADO → Editar y reenviar
4. Si APROBADO → Continuar con el proceso

### Flujo del Profesor:
1. Ver tratamientos pendientes
2. Revisar información médica
3. APROBAR o RECHAZAR con motivo
4. Seguimiento del progreso

### Flujo Administrativo:
1. Monitorear estadísticas
2. Generar reportes
3. Gestionar casos especiales
4. Supervisar el proceso académico

## 🚀 Próximas Mejoras

- [ ] Notificaciones en tiempo real
- [ ] Historial detallado de cambios
- [ ] Plantillas de tratamiento
- [ ] Integración con calendario
- [ ] Exportación de reportes
- [ ] Validaciones médicas avanzadas
