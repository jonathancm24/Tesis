# 📋 Módulo de Solicitudes Académicas

## 📝 Descripción General

El módulo de **Solicitudes** gestiona el flujo académico donde los estudiantes solicitan asignación a especialidades específicas, y los docentes procesan estas solicitudes para aprobar o rechazar la asignación académica.

### 🎯 Propósito del Sistema
- **Estudiantes**: Solicitan asignación a especialidades para realizar prácticas clínicas
- **Docentes**: Procesan solicitudes de especialidades donde están autorizados
- **Administradores**: Gestionan el sistema, generan reportes y configuran parámetros
- **Secretarios**: Apoyan en la gestión administrativa y seguimiento

---

## 🏗️ Arquitectura del Módulo

```
📁 Solicitudes/
├── 📄 Interface/
│   └── solicitud.interface.ts     # 13 interfaces para tipos de datos
├── 📄 DTO/
│   ├── crear-actualizar-solicitud.dto.ts  # 11 DTOs para operaciones CRUD
│   └── filtros-solicitudes.dto.ts         # 8 DTOs para consultas y filtros
├── 📄 solicitud.service.ts        # Lógica de negocio completa
├── 📄 solicitud.controller.ts     # 25+ endpoints especializados
└── 📄 solicitud.module.ts         # Configuración del módulo
```

---

## 🔗 Relaciones en Base de Datos

```sql
Solicitud {
  id: number (PK)
  estudianteId: number (FK -> Usuario) -- OBLIGATORIO
  docenteId: number? (FK -> Usuario)   -- OPCIONAL (asignado después)
  especialidadId: number (FK -> Especialidad)
  estado: EstadoSolicitud (PENDIENTE, APROBADA, RECHAZADA, CANCELADA)
  observaciones: string?
  fecha: DateTime
}
```

**⚠️ Nota Importante**: Solo usuarios con rol `ESTUDIANTE` pueden crear solicitudes como solicitantes. Los `ADMIN` gestionan el sistema pero no crean solicitudes para sí mismos.

---

## 🔐 Sistema de Permisos por Rol

### 👨‍🎓 **ESTUDIANTE**
- ✅ Crear sus propias solicitudes
- ✅ Ver sus solicitudes
- ✅ Actualizar solicitudes pendientes
- ✅ Cancelar sus solicitudes
- ❌ Ver solicitudes de otros estudiantes
- ❌ Procesar/aprobar solicitudes

### 👨‍🏫 **PROFESOR (DOCENTE)**
- ✅ Ver solicitudes de especialidades donde está autorizado
- ✅ Procesar solicitudes (aprobar/rechazar)
- ✅ Responder y comentar solicitudes
- ✅ Ver dashboard de sus solicitudes asignadas
- ❌ Crear solicitudes como estudiante
- ❌ Ver solicitudes de otras especialidades

### 👨‍💼 **ADMIN**
- ✅ Ver todas las solicitudes del sistema
- ✅ Gestionar solicitudes (aprobar, rechazar, asignar docentes)
- ✅ Crear solicitudes masivas para estudiantes
- ✅ Generar reportes y estadísticas
- ✅ Configurar parámetros del sistema
- ❌ Crear solicitudes como estudiante (no tiene sentido conceptual)

### 👩‍💼 **SECRETARIO**
- ✅ Ver solicitudes del sistema
- ✅ Apoyar en procesamiento de solicitudes
- ✅ Crear solicitudes prioritarias
- ✅ Generar reportes básicos
- ❌ Configurar sistema (solo ADMIN)

---

## 🛡️ Endpoints y Utilidades

### 📤 **CREAR SOLICITUDES**

#### `POST /solicitudes`
**Rol**: `ESTUDIANTE`
**Utilidad**: Crear solicitud estándar para asignación a especialidad
```json
{
  "especialidadId": 123,
  "observaciones": "Tengo experiencia previa en ortodoncia"
}
```

#### `POST /solicitudes/rapida`
**Rol**: `ESTUDIANTE`
**Utilidad**: Versión simplificada para crear solicitud rápidamente
```json
{
  "especialidadId": 123,
  "observaciones": "Solicitud rápida"
}
```

#### `POST /solicitudes/masiva`
**Rol**: `ADMIN`
**Utilidad**: Crear múltiples solicitudes para varios estudiantes (útil para asignaciones masivas)
```json
{
  "estudianteIds": [101, 102, 103],
  "especialidadId": 123,
  "observacionesComunes": "Asignación del semestre 2025-2"
}
```

#### `POST /solicitudes/prioritaria`
**Rol**: `ADMIN`, `SECRETARIO`
**Utilidad**: Crear solicitudes urgentes que requieren atención inmediata
```json
{
  "estudianteId": 101,
  "especialidadId": 123,
  "prioridad": "ALTA",
  "justificacionPrioridad": "Estudiante en riesgo académico"
}
```

---

### 📋 **CONSULTAR SOLICITUDES**

#### `GET /solicitudes`
**Rol**: `TODOS`
**Utilidad**: Listar solicitudes con filtros avanzados (cada rol ve según sus permisos)
```
?estado=PENDIENTE&especialidadId=123&page=1&limit=10
```

#### `GET /solicitudes/:id`
**Rol**: `TODOS` (con validación de permisos)
**Utilidad**: Ver detalles completos de una solicitud específica

#### `GET /solicitudes/especialidad/:especialidadId`
**Rol**: `PROFESOR`, `ADMIN`, `SECRETARIO`
**Utilidad**: Ver todas las solicitudes de una especialidad específica con estadísticas

#### `GET /solicitudes/estudiante/:estudianteId`
**Rol**: `ESTUDIANTE` (solo sus solicitudes), `ADMIN`, `SECRETARIO`
**Utilidad**: Ver historial completo de solicitudes de un estudiante

#### `GET /solicitudes/mis-solicitudes`
**Rol**: `ESTUDIANTE`
**Utilidad**: Endpoint específico para que estudiantes vean solo sus solicitudes

---

### ⚙️ **PROCESAR SOLICITUDES**

#### `PUT /solicitudes/:id/procesar`
**Rol**: `PROFESOR`, `ADMIN`, `SECRETARIO`
**Utilidad**: Aprobar, rechazar o asignar docente a una solicitud
```json
{
  "nuevoEstado": "APROBADA",
  "docenteId": 456,
  "comentariosDocente": "Aprobado por buen rendimiento académico"
}
```

#### `PUT /solicitudes/:id`
**Rol**: `ESTUDIANTE` (solo sus solicitudes), `ADMIN`
**Utilidad**: Actualizar información básica de solicitudes pendientes
```json
{
  "observaciones": "Información actualizada sobre mi experiencia"
}
```

#### `PUT /solicitudes/:id/cancelar`
**Rol**: `ESTUDIANTE` (solo sus solicitudes), `ADMIN`
**Utilidad**: Cancelar solicitud con motivo justificado
```json
{
  "motivoCancelacion": "CAMBIO_ESPECIALIDAD",
  "comentariosAdicionales": "Decidí cambiar a otra especialidad"
}
```

#### `PUT /solicitudes/:id/asignar-docente`
**Rol**: `ADMIN`, `SECRETARIO`
**Utilidad**: Asignar docente específico a una solicitud (gestión administrativa)
```json
{
  "docenteId": 456,
  "comentariosAsignacion": "Docente especializado en el área"
}
```

#### `PUT /solicitudes/:id/responder`
**Rol**: `PROFESOR`
**Utilidad**: Enviar mensajes/respuestas al estudiante solicitante
```json
{
  "solicitudId": 123,
  "mensaje": "Necesito más información sobre tu experiencia previa",
  "tipoRespuesta": "INFORMACION_ADICIONAL",
  "requiereRespuesta": true
}
```

---

### 📊 **ESTADÍSTICAS Y REPORTES**

#### `GET /solicitudes/estadisticas/generales`
**Rol**: `ADMIN`, `SECRETARIO`, `PROFESOR`
**Utilidad**: Obtener métricas generales del sistema de solicitudes
- Solicitudes por estado
- Tendencias mensuales
- Tiempos de respuesta promedio
- Docentes más activos

#### `GET /solicitudes/dashboard`
**Rol**: `TODOS`
**Utilidad**: Dashboard personalizado según el rol del usuario
- **Estudiante**: Sus solicitudes activas, historial, próximas acciones
- **Profesor**: Solicitudes asignadas, pendientes de respuesta
- **Admin**: Resumen general, alertas, estadísticas clave

#### `POST /solicitudes/reportes/generar`
**Rol**: `ADMIN`, `SECRETARIO`
**Utilidad**: Generar reportes personalizados en PDF/Excel
```json
{
  "tipoReporte": "SOLICITUDES_POR_PERIODO",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-12-31",
  "formato": "PDF",
  "incluirGraficos": true
}
```

---

### 🎯 **ENDPOINTS ESPECIALIZADOS**

#### `GET /solicitudes/docente/panel`
**Rol**: `PROFESOR`
**Utilidad**: Panel específico para docentes con sus solicitudes asignadas

#### `POST /solicitudes/busqueda-avanzada`
**Rol**: `ADMIN`, `SECRETARIO`, `PROFESOR`
**Utilidad**: Búsqueda compleja con múltiples criterios

#### `POST /solicitudes/validar-creacion`
**Rol**: `ESTUDIANTE`, `ADMIN`
**Utilidad**: Validar si un estudiante puede crear una solicitud antes de crearla

#### `GET /solicitudes/notificaciones`
**Rol**: `TODOS`
**Utilidad**: Obtener notificaciones relacionadas con solicitudes

#### `GET /solicitudes/mi-resumen`
**Rol**: `TODOS`
**Utilidad**: Resumen rápido personalizado según el rol

#### `GET /solicitudes/contadores`
**Rol**: `TODOS`
**Utilidad**: Contadores rápidos para badges/notificaciones en UI

---

### ⚙️ **CONFIGURACIÓN (SOLO ADMIN)**

#### `GET /solicitudes/configuracion`
**Rol**: `ADMIN`
**Utilidad**: Obtener configuración actual del sistema

#### `PUT /solicitudes/configuracion`
**Rol**: `ADMIN`
**Utilidad**: Actualizar parámetros del sistema (límites, plazos, etc.)

---

## 🔄 Flujo de Trabajo Típico

### 1. **Estudiante crea solicitud**
```
POST /solicitudes/rapida
↓
Sistema valida: ¿Ya tiene solicitud pendiente para esta especialidad?
↓
Si válida: Crea solicitud en estado PENDIENTE
↓
Notifica a docentes de la especialidad
```

### 2. **Docente procesa solicitud**
```
GET /solicitudes/docente/panel (ve sus solicitudes asignadas)
↓
PUT /solicitudes/:id/procesar (aprueba/rechaza)
↓
Sistema actualiza estado y notifica al estudiante
```

### 3. **Seguimiento y gestión**
```
GET /solicitudes/dashboard (monitoreo por todos los roles)
↓
GET /solicitudes/estadisticas/generales (métricas para admin)
↓
POST /solicitudes/reportes/generar (reportes periódicos)
```

---

## 🚨 Validaciones Importantes

### ✅ **Validaciones de Negocio**
- Un estudiante no puede tener múltiples solicitudes PENDIENTES para la misma especialidad
- Solo docentes autorizados en una especialidad pueden procesar sus solicitudes
- Las transiciones de estado están controladas (ej: no se puede pasar de RECHAZADA a APROBADA directamente)
- Los estudiantes solo pueden cancelar solicitudes PENDIENTES o APROBADAS (no RECHAZADAS)

### 🔒 **Validaciones de Seguridad**
- Cada endpoint valida que el usuario tenga permisos para la acción
- Los estudiantes solo ven sus propias solicitudes
- Los docentes solo ven solicitudes de sus especialidades autorizadas
- Los IDs de usuario se extraen del token JWT, no del body de la petición

---

## 🛠️ Casos de Uso Prácticos

### 📚 **Para Coordinadores Académicos**
1. `GET /solicitudes/estadisticas/generales` - Ver rendimiento del proceso
2. `POST /solicitudes/masiva` - Asignar estudiantes a especialidades
3. `GET /solicitudes/dashboard` - Monitorear alertas y pendientes

### 👨‍🏫 **Para Docentes**
1. `GET /solicitudes/docente/panel` - Ver sus solicitudes asignadas
2. `PUT /solicitudes/:id/procesar` - Aprobar/rechazar estudiantes
3. `PUT /solicitudes/:id/responder` - Comunicarse con estudiantes

### 👨‍🎓 **Para Estudiantes**
1. `POST /solicitudes/rapida` - Solicitar especialidad
2. `GET /solicitudes/mis-solicitudes` - Ver estado de sus solicitudes
3. `PUT /solicitudes/:id/cancelar` - Cancelar si cambian de opinión

### 📊 **Para Reportes Institucionales**
1. `POST /solicitudes/reportes/generar` - Reportes personalizados
2. `GET /solicitudes/estadisticas/generales` - Métricas del sistema
3. `GET /solicitudes/dashboard` - Resúmenes ejecutivos

---

## 🔧 Configuración y Personalización

El sistema permite configurar:
- **Límites**: Máximo de solicitudes por estudiante
- **Plazos**: Tiempo límite para procesar solicitudes
- **Notificaciones**: Frecuencia y tipos de alertas
- **Validaciones**: Reglas de negocio personalizadas
- **Reportes**: Plantillas y formatos de exportación

---

*💡 **Nota**: Este módulo está diseñado para ser escalable y mantenible, siguiendo las mejores prácticas de NestJS y TypeScript.*
