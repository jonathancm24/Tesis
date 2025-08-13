# Guía de Integración Backend-Frontend para el Panel de Administración

## Endpoints del Backend Utilizados

### 1. Gestión de Usuarios
```http
GET /auth/usuarios
```
**Propósito**: Obtener lista completa de usuarios del sistema  
**Respuesta esperada**:
```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@uleam.edu.ec",
    "activo": true,
    "rol": {
      "id": 2,
      "nombre": "ESTUDIANTE"
    },
    "especialidades": [...],
    "fechaCreacion": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Solicitudes Académicas
```http
GET /solicitudes/contadores
```
**Propósito**: Obtener contadores rápidos de solicitudes  
**Respuesta esperada**:
```json
{
  "total": 156,
  "pendientes": 23,
  "aprobadas": 89,
  "rechazadas": 44,
  "canceladas": 0
}
```

```http
GET /solicitudes?limite=10&orden=desc&campo=fechaCreacion
```
**Propósito**: Obtener solicitudes recientes para la tabla  
**Respuesta esperada**:
```json
{
  "solicitudes": [
    {
      "id": 1,
      "tipoSolicitud": "Asignación de Especialidad",
      "descripcion": "Solicitud para Ortodoncia",
      "estado": "PENDIENTE",
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "estudiante": {
        "id": 123,
        "nombre": "María García"
      },
      "especialidad": {
        "id": 1,
        "nombre": "Ortodoncia"
      }
    }
  ],
  "total": 156,
  "pagina": 1,
  "limite": 10
}
```

```http
PUT /solicitudes/:id/procesar
```
**Propósito**: Actualizar el estado de una solicitud  
**Body**:
```json
{
  "nuevoEstado": "APROBADA",
  "comentariosDocente": "Solicitud aprobada desde panel de administración"
}
```

### 3. Pacientes
```http
GET /pacientes
```
**Propósito**: Obtener lista de pacientes para estadísticas  
**Respuesta esperada**:
```json
[
  {
    "id": 1,
    "nombre": "Carlos",
    "apellido": "López",
    "numeroDocumento": "1234567890",
    "fechaRegistro": "2024-01-10T08:00:00Z",
    "activo": true
  }
]
```

### 4. Dashboard de Solicitudes (Implementado)
```http
GET /solicitudes/dashboard
```
**Propósito**: Obtener datos específicos del dashboard  
**Respuesta esperada**:
```json
{
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

## Endpoints Sugeridos para Implementar

### 1. Sistema de Logs y Errores
```http
GET /logs/errores
```
**Propósito**: Obtener reportes de errores del sistema  
**Respuesta sugerida**:
```json
[
  {
    "id": 1,
    "titulo": "Error al cargar pacientes",
    "descripcion": "La página se queda en blanco...",
    "usuario": "secretario@uleam.edu.ec",
    "prioridad": "ALTA",
    "estado": "PENDIENTE",
    "categoria": "SISTEMA",
    "fechaReporte": "2024-01-15T10:30:00Z",
    "stackTrace": "...",
    "userAgent": "Mozilla/5.0..."
  }
]
```

```http
POST /logs/errores
```
**Propósito**: Crear nuevo reporte de error  
**Body**:
```json
{
  "titulo": "Error en formulario",
  "descripcion": "El botón no responde",
  "prioridad": "MEDIA",
  "categoria": "UI",
  "url": "/admin/users",
  "stackTrace": "...",
  "userAgent": "..."
}
```

```http
PUT /logs/errores/:id
```
**Propósito**: Actualizar estado de reporte de error  
**Body**:
```json
{
  "estado": "RESUELTO",
  "resolucion": "Se corrigió el bug en la línea 45",
  "asignadoA": "admin@uleam.edu.ec"
}
```

### 2. Métricas del Sistema
```http
GET /system/health
```
**Propósito**: Estado de salud del sistema  
**Respuesta sugerida**:
```json
{
  "status": "HEALTHY",
  "database": "CONNECTED",
  "services": {
    "auth": "RUNNING",
    "api": "RUNNING",
    "storage": "RUNNING"
  },
  "uptime": 86400000,
  "memoryUsage": 75.5,
  "cpuUsage": 23.1
}
```

```http
GET /system/metrics
```
**Propósito**: Métricas detalladas de rendimiento  
**Respuesta sugerida**:
```json
{
  "responseTime": 150,
  "throughput": 1250,
  "errorRate": 0.02,
  "activeConnections": 45,
  "databaseConnections": 12,
  "memoryUsage": {
    "used": 1024,
    "total": 2048,
    "percentage": 50.0
  },
  "diskUsage": {
    "used": 5120,
    "total": 10240,
    "percentage": 50.0
  }
}
```

### 3. Dashboard Específicos
```http
GET /citas/dashboard
```
**Propósito**: Estadísticas específicas de citas  
**Respuesta sugerida**:
```json
{
  "citasHoy": {
    "programadas": 24,
    "completadas": 18,
    "canceladas": 3,
    "noAsistio": 1
  },
  "citasSemana": {
    "total": 168,
    "completadas": 142,
    "canceladas": 15,
    "noAsistio": 11
  },
  "tiempoPromedio": {
    "consulta": 45,
    "espera": 12
  }
}
```

```http
GET /casos-clinicos/dashboard
```
**Propósito**: Estadísticas de casos clínicos  
**Respuesta sugerida**:
```json
{
  "casosHoy": {
    "nuevos": 5,
    "enRevision": 12,
    "aprobados": 8,
    "enTratamiento": 15
  },
  "casosPorEspecialidad": [
    {
      "especialidad": "Ortodoncia",
      "total": 45,
      "activos": 23
    }
  ],
  "tiempoPromedio": {
    "revision": 3.5,
    "tratamiento": 12.8
  }
}
```

### 4. Usuarios Activos y Sesiones
```http
GET /auth/usuarios/conectados
```
**Propósito**: Usuarios actualmente conectados  
**Respuesta sugerida**:
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "rol": "ESTUDIANTE",
    "ultimaActividad": "2024-01-15T14:30:00Z",
    "sesionIniciada": "2024-01-15T08:00:00Z"
  }
]
```

```http
GET /auth/sesiones/estadisticas
```
**Propósito**: Estadísticas de sesiones  
**Respuesta sugerida**:
```json
{
  "sesionesHoy": 47,
  "sesionesActivas": 12,
  "tiempoPromedioSesion": 185,
  "paginasMasVisitadas": [
    {
      "url": "/pacientes",
      "visitas": 234
    }
  ]
}
```

## Implementación Requerida en el Backend

### 1. Controlador de Logs
**Archivo**: `backend/src/modules/Log/log.controller.ts`

```typescript
@Controller('logs')
export class LogController {
  
  @Get('errores')
  async obtenerErrores(@Query() filtros: any) {
    // Implementar lógica para obtener errores
  }

  @Post('errores')
  async crearReporteError(@Body() reporte: any) {
    // Implementar lógica para crear reporte
  }

  @Put('errores/:id')
  async actualizarError(@Param('id') id: number, @Body() data: any) {
    // Implementar lógica para actualizar estado
  }
}
```

### 2. Sistema de Salud del Sistema
**Archivo**: `backend/src/modules/System/system.controller.ts`

```typescript
@Controller('system')
export class SystemController {
  
  @Get('health')
  async healthCheck() {
    // Verificar estado de BD, servicios externos, etc.
  }

  @Get('metrics')
  async obtenerMetricas() {
    // Obtener métricas de rendimiento del sistema
  }
}
```

### 3. Dashboards Específicos
Extender controladores existentes con endpoints de dashboard:

```typescript
// En CitaController
@Get('dashboard')
async dashboardCitas() {
  // Estadísticas específicas de citas
}

// En CasoClinicoController
@Get('dashboard')
async dashboardCasos() {
  // Estadísticas específicas de casos clínicos
}
```

### 4. Tabla de Logs en la Base de Datos
**Archivo**: `backend/prisma/schema.prisma`

```prisma
model LogError {
  id          Int      @id @default(autoincrement())
  titulo      String
  descripcion String?
  usuario     String
  prioridad   String   // BAJA, MEDIA, ALTA, CRITICA
  estado      String   // PENDIENTE, EN_PROCESO, RESUELTO, CERRADO
  categoria   String   // SISTEMA, UI, API, BD, SEGURIDAD
  url         String?
  stackTrace  String?
  userAgent   String?
  fechaReporte DateTime @default(now())
  fechaResolucion DateTime?
  asignadoA   String?
  resolucion  String?
  
  @@map("logs_errores")
}

model SesionUsuario {
  id              Int      @id @default(autoincrement())
  usuarioId       Int
  fechaInicio     DateTime @default(now())
  fechaFin        DateTime?
  ipAddress       String
  userAgent       String
  ultimaActividad DateTime @default(now())
  
  usuario Usuario @relation(fields: [usuarioId], references: [id])
  
  @@map("sesiones_usuarios")
}
```

## Configuración de Desarrollo

### Variables de Entorno
```env
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
LOGS_LEVEL="debug"
ENABLE_METRICS="true"

# Frontend
VITE_API_URL="http://localhost:3001"
VITE_ENABLE_LOGS="true"
```

### Scripts de Base de Datos
```bash
# Aplicar nuevas migraciones
cd backend
npx prisma migrate dev --name add_logs_system

# Generar cliente Prisma
npx prisma generate

# Seed de datos iniciales (opcional)
npx prisma db seed
```

## Testing

### Backend
```bash
cd backend
npm test -- logs.controller.spec.ts
npm test -- system.controller.spec.ts
```

### Frontend
```bash
cd frontend
npm run test:unit -- AdminService.spec.ts
npm run test:e2e -- admin-dashboard.cy.ts
```

---

*Guía de integración - 13 de agosto de 2025*
