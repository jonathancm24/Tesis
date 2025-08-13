# API de Administración - Especificación Técnica

## Descripción General

Esta especificación define la API utilizada por el panel de administración del sistema odontológico académico. Incluye todos los endpoints necesarios para obtener estadísticas, gestionar solicitudes y monitorear el estado del sistema.

## Base URL
```
https://api.sistema-odontologico.edu.ec/api
```

## Autenticación
Todas las rutas requieren autenticación mediante JWT Bearer Token:
```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Usuarios

#### Obtener Todos los Usuarios
```http
GET /auth/usuarios
```

**Descripción**: Retorna la lista completa de usuarios del sistema con sus roles y estado.

**Permisos**: Requiere rol ADMIN o permiso VER_USUARIOS

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": 1,
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "juan.perez@uleam.edu.ec",
    "tipoDocumento": "CEDULA",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "1995-05-15",
    "activo": true,
    "fechaCreacion": "2024-01-15T10:30:00Z",
    "fechaActualizacion": "2024-01-15T10:30:00Z",
    "rol": {
      "id": 2,
      "nombre": "ESTUDIANTE",
      "descripcion": "Estudiante de odontología"
    },
    "especialidades": [
      {
        "id": 1,
        "nombre": "Ortodoncia",
        "descripcion": "Especialidad en corrección dental"
      }
    ],
    "parroquia": {
      "id": 1,
      "nombre": "Manta",
      "canton": {
        "id": 1,
        "nombre": "Manta",
        "provincia": {
          "id": 1,
          "nombre": "Manabí"
        }
      }
    }
  }
]
```

**Errores**:
- `401`: Token inválido o expirado
- `403`: Sin permisos suficientes
- `500`: Error interno del servidor

### 2. Solicitudes

#### Obtener Contadores de Solicitudes
```http
GET /solicitudes/contadores
```

**Descripción**: Retorna contadores rápidos para el dashboard.

**Permisos**: Requiere rol ADMIN, PROFESOR o SECRETARIO

**Respuesta Exitosa (200)**:
```json
{
  "total": 156,
  "pendientes": 23,
  "aprobadas": 89,
  "rechazadas": 44,
  "canceladas": 0,
  "en_proceso": 0
}
```

#### Obtener Dashboard de Solicitudes
```http
GET /solicitudes/dashboard
```

**Descripción**: Retorna datos completos del dashboard de solicitudes.

**Parámetros de Query**:
- `fechaInicio` (opcional): Fecha de inicio para filtrar (ISO 8601)
- `fechaFin` (opcional): Fecha fin para filtrar (ISO 8601)

**Respuesta Exitosa (200)**:
```json
{
  "estadisticas": {
    "total": 156,
    "pendientes": 23,
    "aprobadas": 89,
    "rechazadas": 44
  },
  "clinicasActivas": 8,
  "clinicasInactivas": 2,
  "clinicasEnMantenimiento": 1,
  "clinicasEnRuta": 3,
  "casosNuevos": 5,
  "casosEnRevision": 12,
  "casosAprobados": 8,
  "casosEnTratamiento": 15,
  "citasProgramadas": 24,
  "citasCompletadas": 18,
  "citasCanceladas": 3,
  "citasNoAsistio": 1,
  "usuariosConectados": 12,
  "sesionesHoy": 47,
  "ultimaActividad": "2024-01-15T14:30:00Z"
}
```

#### Obtener Lista de Solicitudes
```http
GET /solicitudes
```

**Parámetros de Query**:
- `limite` (opcional): Número máximo de resultados (default: 10)
- `pagina` (opcional): Número de página (default: 1)
- `orden` (opcional): Orden de resultados (asc|desc, default: desc)
- `campo` (opcional): Campo para ordenar (fechaCreacion|fechaActualizacion, default: fechaCreacion)
- `estado` (opcional): Filtrar por estado específico

**Respuesta Exitosa (200)**:
```json
{
  "solicitudes": [
    {
      "id": 1,
      "tipoSolicitud": "ASIGNACION_ESPECIALIDAD",
      "descripcion": "Solicitud para especialidad de Ortodoncia",
      "estado": "PENDIENTE",
      "prioridad": "NORMAL",
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "fechaActualizacion": "2024-01-15T10:30:00Z",
      "fechaLimite": "2024-01-22T10:30:00Z",
      "estudiante": {
        "id": 123,
        "nombre": "María Elena",
        "apellido": "García López",
        "email": "maria.garcia@uleam.edu.ec"
      },
      "especialidad": {
        "id": 1,
        "nombre": "Ortodoncia",
        "descripcion": "Especialidad en corrección dental"
      },
      "docente": {
        "id": 45,
        "nombre": "Dr. Carlos",
        "apellido": "Mendoza Ruiz",
        "email": "carlos.mendoza@uleam.edu.ec"
      },
      "comentarios": "Solicitud en revisión por el docente asignado"
    }
  ],
  "total": 156,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 16
}
```

#### Procesar Solicitud
```http
PUT /solicitudes/:id/procesar
```

**Descripción**: Actualiza el estado de una solicitud específica.

**Parámetros de Ruta**:
- `id`: ID de la solicitud a procesar

**Body**:
```json
{
  "nuevoEstado": "APROBADA",
  "comentariosDocente": "Solicitud aprobada desde panel de administración",
  "docenteId": 45,
  "fechaLimite": "2024-02-15T10:30:00Z"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": 1,
  "estado": "APROBADA",
  "fechaActualizacion": "2024-01-15T15:45:00Z",
  "comentarios": "Solicitud aprobada desde panel de administración",
  "procesadoPor": {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@uleam.edu.ec"
  }
}
```

**Errores**:
- `400`: Estado inválido o solicitud ya procesada
- `404`: Solicitud no encontrada
- `403`: Sin permisos para procesar solicitudes

### 3. Pacientes

#### Obtener Lista de Pacientes
```http
GET /pacientes
```

**Descripción**: Retorna la lista de pacientes registrados en el sistema.

**Parámetros de Query**:
- `activo` (opcional): Filtrar por estado activo (true|false)
- `limite` (opcional): Número máximo de resultados
- `buscar` (opcional): Término de búsqueda (nombre, apellido, documento)

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": 1,
    "nombre": "Carlos Alberto",
    "apellido": "López Mendoza",
    "tipoDocumento": "CEDULA",
    "numeroDocumento": "0987654321",
    "telefono": "0991234567",
    "email": "carlos.lopez@email.com",
    "fechaNacimiento": "1985-03-20",
    "fechaRegistro": "2024-01-10T08:00:00Z",
    "activo": true,
    "parroquia": {
      "id": 1,
      "nombre": "Manta",
      "canton": {
        "nombre": "Manta"
      }
    },
    "estadoCivil": "SOLTERO",
    "ocupacion": "Ingeniero",
    "totalCitas": 5,
    "ultimaCita": "2024-01-14T14:30:00Z"
  }
]
```

### 4. Sistema (Endpoints Sugeridos)

#### Health Check
```http
GET /system/health
```

**Descripción**: Verifica el estado de salud del sistema.

**Respuesta Exitosa (200)**:
```json
{
  "status": "HEALTHY",
  "timestamp": "2024-01-15T15:45:00Z",
  "version": "1.0.0",
  "database": {
    "status": "CONNECTED",
    "responseTime": 15
  },
  "services": {
    "auth": "RUNNING",
    "api": "RUNNING",
    "storage": "RUNNING",
    "email": "RUNNING"
  },
  "uptime": 86400000,
  "environment": "production"
}
```

#### Métricas del Sistema
```http
GET /system/metrics
```

**Descripción**: Retorna métricas detalladas de rendimiento.

**Respuesta Exitosa (200)**:
```json
{
  "performance": {
    "responseTime": {
      "average": 150,
      "p95": 300,
      "p99": 500
    },
    "throughput": 1250,
    "errorRate": 0.02
  },
  "resources": {
    "activeConnections": 45,
    "databaseConnections": 12,
    "memoryUsage": {
      "used": 1073741824,
      "total": 2147483648,
      "percentage": 50.0
    },
    "cpuUsage": {
      "current": 23.1,
      "average": 18.5
    },
    "diskUsage": {
      "used": 5368709120,
      "total": 10737418240,
      "percentage": 50.0
    }
  },
  "requests": {
    "total": 12450,
    "successful": 12225,
    "failed": 225,
    "requestsPerSecond": 15.5
  }
}
```

### 5. Logs de Errores (Endpoints Sugeridos)

#### Obtener Reportes de Errores
```http
GET /logs/errores
```

**Parámetros de Query**:
- `estado` (opcional): Filtrar por estado (PENDIENTE|EN_PROCESO|RESUELTO|CERRADO)
- `prioridad` (opcional): Filtrar por prioridad (BAJA|MEDIA|ALTA|CRITICA)
- `categoria` (opcional): Filtrar por categoría (SISTEMA|UI|API|BD|SEGURIDAD)
- `limite` (opcional): Número máximo de resultados

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": 1,
    "titulo": "Error al cargar lista de pacientes",
    "descripcion": "La página se queda en blanco al intentar acceder a la lista de pacientes desde el módulo de secretaría.",
    "usuario": "secretario@uleam.edu.ec",
    "prioridad": "ALTA",
    "estado": "PENDIENTE",
    "categoria": "SISTEMA",
    "fechaReporte": "2024-01-15T10:30:00Z",
    "fechaActualizacion": "2024-01-15T10:30:00Z",
    "url": "/secretaria/pacientes",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "stackTrace": "Error: Cannot read property 'map' of undefined\n    at PacientesList.vue:45:12",
    "asignadoA": null,
    "resolucion": null
  }
]
```

#### Crear Reporte de Error
```http
POST /logs/errores
```

**Body**:
```json
{
  "titulo": "Error en formulario de usuario",
  "descripcion": "El botón de guardar no responde al hacer clic",
  "prioridad": "MEDIA",
  "categoria": "UI",
  "url": "/admin/usuarios/nuevo",
  "stackTrace": "TypeError: Cannot read property 'validate' of null",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "pasos": "1. Llenar formulario\n2. Hacer clic en guardar\n3. No sucede nada"
}
```

#### Actualizar Reporte de Error
```http
PUT /logs/errores/:id
```

**Body**:
```json
{
  "estado": "RESUELTO",
  "resolucion": "Se corrigió el bug en la validación del formulario",
  "asignadoA": "desarrollador@uleam.edu.ec"
}
```

## Códigos de Estado HTTP

### Éxito
- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Solicitud exitosa sin contenido de respuesta

### Error del Cliente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token de autenticación requerido o inválido
- `403 Forbidden`: Sin permisos suficientes
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Datos válidos pero no procesables

### Error del Servidor
- `500 Internal Server Error`: Error interno del servidor
- `502 Bad Gateway`: Error en servicio externo
- `503 Service Unavailable`: Servicio temporalmente no disponible

## Modelos de Datos

### Usuario
```typescript
interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  tipoDocumento: 'CEDULA' | 'PASAPORTE' | 'RUC' | 'OTRO'
  numeroDocumento: string
  fechaNacimiento: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
  rol: Rol
  especialidades?: Especialidad[]
  parroquia: Parroquia
}
```

### Solicitud
```typescript
interface Solicitud {
  id: number
  tipoSolicitud: string
  descripcion: string
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA' | 'EN_PROCESO'
  prioridad: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE'
  fechaCreacion: string
  fechaActualizacion: string
  fechaLimite?: string
  estudiante: Usuario
  especialidad?: Especialidad
  docente?: Usuario
  comentarios?: string
}
```

### Paciente
```typescript
interface Paciente {
  id: number
  nombre: string
  apellido: string
  tipoDocumento: string
  numeroDocumento: string
  telefono?: string
  email?: string
  fechaNacimiento: string
  fechaRegistro: string
  activo: boolean
  parroquia: Parroquia
  estadoCivil?: string
  ocupacion?: string
  totalCitas: number
  ultimaCita?: string
}
```

## Rate Limiting

### Límites por Endpoint
- **Consultas generales**: 100 requests/min
- **Actualizaciones**: 30 requests/min
- **Reportes de errores**: 10 requests/min

### Headers de Respuesta
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Versionado

La API utiliza versionado semántico. La versión actual es `v1.0.0`.

### Headers de Versión
```http
X-API-Version: 1.0.0
Accept-Version: 1.0
```

---

*Especificación API v1.0.0 - 13 de agosto de 2025*
