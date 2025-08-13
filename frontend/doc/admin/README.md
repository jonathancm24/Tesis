# Documentación del Panel de Administración

## Resumen

El panel de administración (HomeAdmin.vue) ha sido integrado con el backend para mostrar datos reales del sistema odontológico académico. Esta documentación describe la implementación, servicios utilizados y funcionalidades disponibles.

## Archivos Modificados/Creados

### 1. Servicio de Administración
- **Archivo**: `src/services/adminService.ts`
- **Propósito**: Gestiona las llamadas API al backend para el dashboard administrativo
- **Funcionalidades**:
  - Obtención de estadísticas generales del sistema
  - Datos de overview del sistema (clínicas, casos clínicos, citas)
  - Gestión de solicitudes y reportes de errores
  - Resumen de usuarios por rol

### 2. Tipos TypeScript
- **Archivo**: `src/types/admin.ts`
- **Propósito**: Define las interfaces TypeScript para el módulo de administración
- **Tipos principales**:
  - `AdminStats`: Estadísticas principales del dashboard
  - `SystemOverview`: Resumen detallado del sistema
  - `UserSummary`: Resumen de usuarios por rol
  - `SystemHealth`: Estado de salud del sistema

### 3. Vista Principal Actualizada
- **Archivo**: `src/views/admin/HomeAdmin.vue`
- **Cambios**: Integración con servicios reales del backend en lugar de datos mock
- **Funcionalidades**:
  - Carga de datos en tiempo real desde el backend
  - Gestión de estados de carga y error
  - Actualización optimística de solicitudes
  - Notificaciones toast para acciones

## Endpoints del Backend Utilizados

### Datos de Usuarios
```typescript
GET /auth/usuarios - Obtener lista de todos los usuarios
```

### Solicitudes
```typescript
GET /solicitudes/contadores - Obtener contadores de solicitudes
GET /solicitudes/dashboard - Dashboard de solicitudes (si está implementado)
GET /solicitudes - Lista de solicitudes con filtros
PUT /solicitudes/:id/procesar - Procesar una solicitud
```

### Pacientes
```typescript
GET /pacientes - Obtener lista de pacientes
```

## Funcionalidades Implementadas

### 1. Dashboard de Estadísticas
- **Usuarios Activos**: Muestra usuarios activos vs total de usuarios
- **Citas Pendientes**: Citas pendientes vs total de citas
- **Pacientes Nuevos**: Pacientes recientes vs total de pacientes
- **Reportes Pendientes**: Reportes de errores pendientes vs total

### 2. Overview del Sistema
- **Clínicas**: Estado de las clínicas (activas, en ruta, mantenimiento, inactivas)
- **Casos Clínicos**: Estado de casos del día (nuevos, en revisión, aprobados, en tratamiento)
- **Citas del Día**: Estado de citas (programadas, completadas, canceladas, no asistió)
- **Actividad**: Usuarios conectados, sesiones del día, última actividad

### 3. Gestión de Solicitudes
- Lista de solicitudes recientes con información del usuario
- Botones de acción para aprobar/rechazar solicitudes
- Actualización en tiempo real del estado
- Integración con el endpoint de procesamiento de solicitudes

### 4. Reportes de Errores
- Lista de reportes de errores pendientes
- Clasificación por prioridad (baja, media, alta, crítica)
- Gestión de estados (pendiente, en proceso, resuelto)
- *Nota*: Funcionalidad parcial - requiere endpoint específico en el backend

## Servicios del Backend Requeridos

### Implementados en el Backend
✅ **Usuarios**: Endpoint completo para gestión de usuarios  
✅ **Solicitudes**: Sistema completo de solicitudes académicas  
✅ **Pacientes**: CRUD básico de pacientes  

### Pendientes de Implementación

#### 1. Sistema de Logs/Errores
```typescript
// Endpoints sugeridos para implementar en el backend
GET /logs/errores - Lista de reportes de errores
POST /logs/errores - Crear nuevo reporte de error
PUT /logs/errores/:id - Actualizar estado de reporte
GET /logs/errores/dashboard - Estadísticas de errores
```

#### 2. Métricas del Sistema
```typescript
// Endpoints sugeridos para métricas avanzadas
GET /system/health - Estado de salud del sistema
GET /system/metrics - Métricas de rendimiento
GET /citas/dashboard - Dashboard específico de citas
GET /casos-clinicos/dashboard - Dashboard de casos clínicos
```

#### 3. Actividad en Tiempo Real
```typescript
// Para mostrar actividad de usuarios
GET /auth/usuarios/conectados - Usuarios actualmente conectados
GET /auth/sesiones/estadisticas - Estadísticas de sesiones
```

## Adaptación de Datos

### Mapeo de Estados
El sistema mapea estados entre el backend y la UI:

```typescript
// Estados del Backend → Estados de la UI
'PENDIENTE' → 'pendiente'
'APROBADA' → 'aprobado'  
'RECHAZADA' → 'rechazado'
'EN_PROCESO' → 'en_proceso'
'CANCELADA' → 'rechazado'
```

### Transformación de Solicitudes
Las solicitudes del backend se transforman para la UI:

```typescript
{
  id: solicitud.id,
  title: solicitud.tipoSolicitud || 'Solicitud',
  description: solicitud.descripcion || 'Sin descripción',
  user: solicitud.estudiante?.nombre || 'Usuario desconocido',
  userRole: 'estudiante',
  type: solicitud.especialidad?.nombre || 'General',
  status: mapBackendStatusToRequestStatus(solicitud.estado),
  createdAt: solicitud.fechaCreacion,
  updatedAt: solicitud.fechaActualizacion
}
```

## Manejo de Errores

### Estrategias Implementadas
1. **Valores por Defecto**: Si falla la carga, se muestran valores en 0
2. **Notificaciones Toast**: Feedback visual para el usuario
3. **Botón de Reintento**: Opción para recargar datos manualmente
4. **Actualizaciones Optimistas**: UI se actualiza inmediatamente, revierte si falla

### Ejemplo de Manejo de Error
```typescript
try {
  await adminService.updateRequestStatus(id, status)
  // Actualizar UI optimísticamente
  showToast('Solicitud actualizada correctamente', 'success')
} catch (error) {
  // Mostrar error y mantener estado anterior
  showToast('Error al actualizar la solicitud', 'error')
}
```

## Configuración de Desarrollo

### Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto frontend:

```env
# Frontend - .env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000
VITE_APP_ENV=development
```

### Instalación de Dependencias
```bash
cd frontend
npm install
```

### Ejecución en Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Verificación de Conectividad
1. Verificar que el backend esté ejecutándose en http://localhost:3001
2. Verificar que el usuario tenga un token JWT válido en localStorage
3. Verificar que el usuario tenga los permisos necesarios (rol ADMIN)

### Compilación para Producción
```bash
npm run build
```

## Mejoras Futuras Sugeridas

### 1. Datos en Tiempo Real
- Implementar WebSockets para actualizaciones en vivo
- Dashboard que se actualice automáticamente cada X segundos

### 2. Filtros y Búsqueda
- Filtros avanzados para solicitudes y reportes
- Búsqueda por texto en las tablas
- Exportación de datos a Excel/PDF

### 3. Gráficos y Visualizaciones
- Gráficos de barras para estadísticas
- Gráficos de líneas para tendencias temporales
- Dashboard más visual con charts.js o similar

### 4. Notificaciones Avanzadas
- Sistema de notificaciones push
- Configuración de alertas por correo
- Notificaciones en tiempo real para administradores

## Notas Técnicas

### Rendimiento
- Carga de datos en paralelo usando Promise.all()
- Actualización optimística para mejor UX
- Debounce en búsquedas (cuando se implemente)

### Accesibilidad
- Diseño responsivo para móviles y tablets
- Colores coherentes con el theme institucional
- Iconos Font Awesome para mejor comprensión visual

### Seguridad
- Todas las llamadas incluyen token JWT automáticamente
- Validación de permisos en el backend
- Sanitización de datos mostrados en la UI

---

*Documentación generada el 13 de agosto de 2025*
