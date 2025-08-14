# Dashboard del Estudiante - Documentación Técnica

## Resumen

El **Dashboard del Estudiante** es la vista principal para estudiantes de odontología, proporcionando una interfaz completa para gestionar pacientes asignados, casos clínicos, tratamientos y citas. Este dashboard integra datos reales del backend mediante APIs REST y ofrece una experiencia de usuario moderna y responsiva.

## Archivos Principales

### Vista Principal
- **Archivo**: `src/views/student/DashboardView.vue`
- **Ruta**: `/student/dashboard`
- **Descripción**: Componente Vue 3 con Composition API que muestra el dashboard principal

### Servicios
- **Archivo**: `src/services/studentService.ts`
- **Descripción**: Servicio centralizado para todas las operaciones relacionadas con estudiantes

### Tipos
- **Archivo**: `src/types/student.ts`
- **Descripción**: Definiciones TypeScript para todos los tipos de datos del módulo estudiante

## Funcionalidades Implementadas

### 1. Estadísticas en Tiempo Real

El dashboard muestra 6 tarjetas de estadísticas principales:

```typescript
interface EstadisticasEstudiante {
  totalPacientes: number;           // Pacientes asignados al estudiante
  citasHoy: number;                // Citas programadas para hoy
  casosActivos: number;            // Casos en progreso o revisión
  tratamientosEnCurso: number;     // Tratamientos activos
  casosCompletados: number;        // Casos finalizados exitosamente
  promedioCalificaciones?: number; // Promedio de calificaciones (opcional)
  citasPendientes: number;         // Citas pendientes de confirmación
}
```

**Características:**
- Carga asíncrona con indicadores de progreso
- Actualización automática al cambiar filtros
- Cálculos en tiempo real basados en datos del backend
- Manejo de errores y estados de carga

### 2. Sistema de Filtros Avanzado

Implementa filtros múltiples para refinar la vista de pacientes:

- **Búsqueda por texto**: Nombre, apellido o número de documento
- **Estado de caso clínico**: En Progreso, En Revisión, Aprobado, Finalizado
- **Especialidad**: Filtro por especialidad médica
- **Docente supervisor**: Filtro por docente asignado
- **Botón de limpieza**: Remueve todos los filtros aplicados

```typescript
interface FiltrosDashboard {
  busqueda?: string;
  estadoCaso?: EstadoCasoClinico;
  especialidadId?: number;
  docenteId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
}
```

### 3. Tabla de Pacientes Responsiva

Muestra información detallada de pacientes en formato tabular:

**Columnas:**
- **Paciente**: Avatar, nombre completo, documento, edad
- **Caso Activo**: Título del caso y especialidad
- **Estado del Caso**: Badge con color según estado
- **Próxima Cita**: Fecha y hora si está programada
- **Última Actividad**: Timestamp de última actualización
- **Acciones**: Botones para ver detalles y acceder al caso

**Características:**
- Ordenamiento por última actividad
- Avatares con iniciales generadas automáticamente
- Estados de carga independientes
- Mensajes informativos cuando no hay datos

### 4. Modal de Detalles Completo

Modal responsivo que muestra información completa del paciente:

**Secciones:**
1. **Información Personal**: Datos básicos del paciente
2. **Caso Clínico Activo**: Detalles del caso en curso
3. **Próxima Cita**: Información de la siguiente cita programada
4. **Docente Supervisor**: Datos de contacto del docente

**Características:**
- Diseño en grid responsivo (2 columnas en desktop, 1 en móvil)
- Enlaces de acción (llamar, enviar email, ver caso completo)
- Navegación directa al caso clínico
- Cierre con backdrop o botón

### 5. Integración con Backend

El dashboard se conecta a múltiples endpoints del backend:

**Endpoints utilizados:**
```typescript
// Casos clínicos del estudiante
GET /casos-clinicos
GET /casos-clinicos/{id}

// Tratamientos
GET /tratamientos/mis-tratamientos/estudiante

// Citas
GET /citas/mis-citas/usuario

// Datos de referencia
GET /especialidades
GET /auth/usuarios?rol=Profesor
```

**Características:**
- Carga paralela para mejorar performance
- Manejo robusto de errores
- Transformación de datos (fechas, tipos)
- Cache inteligente para datos de referencia

## Arquitectura Técnica

### Composables Utilizados

1. **useToast**: Notificaciones al usuario
2. **useRouter**: Navegación entre vistas

### Estructura de Datos

```typescript
// Información resumida de paciente para dashboard
interface PacienteDashboard {
  id: number;
  paciente: PacienteEstudiante;
  casoActivo?: {
    id: number;
    titulo?: string;
    estado: EstadoCasoClinico;
    especialidad: string;
    fechaActualizacion: Date;
  };
  tratamientoActivo?: {
    id: number;
    descripcion?: string;
    estado: EstadoTratamiento;
    fechaActualizacion: Date;
  };
  proximaCita?: {
    id: number;
    fecha: Date;
    hora: string;
    estado: EstadoCita;
    motivo?: string;
  };
  ultimaActividad: Date;
  docenteSupervisor?: DocenteBasico;
}
```

### Estados Reactivos

```typescript
// Estado principal del componente
const estadisticas = ref<EstadisticasEstudiante>()
const pacientes = ref<PacienteDashboard[]>([])
const especialidades = ref<EspecialidadBasica[]>([])
const docentes = ref<DocenteBasico[]>([])
const filtros = ref<FiltrosDashboard>({})
const pacienteSeleccionado = ref<PacienteDashboard | null>(null)

// Estados de carga
const loading = ref({
  estadisticas: true,
  pacientes: true,
  modal: false
})
```

## Métodos Principales

### Carga de Datos

```typescript
/**
 * Carga inicial de todos los datos del dashboard
 */
async function cargarDashboard(): Promise<void>

/**
 * Recarga solo los datos de pacientes manteniendo filtros
 */
async function recargarPacientes(): Promise<void>
```

### Filtrado

```typescript
/**
 * Aplica los filtros actuales y recarga los pacientes
 */
async function aplicarFiltros(): Promise<void>

/**
 * Limpia todos los filtros y recarga los datos
 */
async function limpiarFiltros(): Promise<void>
```

### Modal

```typescript
/**
 * Abre el modal con la información detallada del paciente
 */
function abrirModal(paciente: PacienteDashboard): void

/**
 * Cierra el modal de detalles del paciente
 */
function cerrarModal(): void
```

### Navegación

```typescript
/**
 * Navega a la vista detallada de un caso clínico
 */
function verCasoClinico(casoId: number): void
```

### Formateo

```typescript
/**
 * Obtiene las iniciales de un nombre completo
 */
function obtenerIniciales(nombre: string, apellido: string): string

/**
 * Formatea una fecha para mostrar de manera amigable
 */
function formatearFecha(fecha: Date): string

/**
 * Formatea una hora para mostrar de manera amigable
 */
function formatearHora(fecha: Date): string

/**
 * Formatea el estado de un caso clínico para mostrar
 */
function formatearEstado(estado: EstadoCasoClinico): string
```

## Estilos CSS

El dashboard utiliza clases CSS personalizadas definidas en:
- `@/assets/css/pages/student/Dashboard.css`

**Clases principales:**
```css
.dashboard-container        /* Contenedor principal */
.stats-cards               /* Grid de tarjetas de estadísticas */
.stat-card                 /* Tarjeta individual de estadística */
.filter-bar                /* Barra de filtros */
.filter-group              /* Grupo de filtro individual */
.patients-table            /* Tabla de pacientes */
.patient-cell              /* Celda de información del paciente */
.avatar                    /* Avatar circular con iniciales */
.case-title                /* Título del caso clínico */
.appointment-date          /* Fecha de cita */
.activity-date             /* Fecha de actividad */
```

**Estados de color:**
```css
.badge-secondary           /* Estado: Sin caso/datos */
.badge-primary             /* Estado: En progreso */
.badge-warning             /* Estado: En revisión */
.badge-success             /* Estado: Aprobado/Completado */
.badge-danger              /* Estado: Rechazado/Cancelado */
.badge-info                /* Estado: Finalizado */
```

## Manejo de Errores

### Estrategias Implementadas

1. **Try-Catch en métodos async**: Captura errores de API
2. **Estados de error reactivos**: `error.value` para errores globales
3. **Notificaciones toast**: Feedback inmediato al usuario
4. **Fallbacks**: Datos por defecto cuando falla la carga
5. **Logging**: `console.error` para debugging

### Ejemplos

```typescript
try {
  const datos = await studentService.obtenerDashboard()
  // Procesamiento exitoso
} catch (err) {
  console.error('Error al cargar dashboard:', err)
  error.value = 'No se pudieron cargar los datos del dashboard'
  toast.showError('Error al cargar datos...')
}
```

## Performance y Optimizaciones

### Técnicas Aplicadas

1. **Carga paralela**: Múltiples endpoints simultáneos
2. **Computed properties**: Cálculo reactivo de filtros
3. **Lazy loading**: Carga bajo demanda del modal
4. **Debounce implícito**: Filtros se aplican al cambio
5. **Cache de datos de referencia**: Especialidades y docentes

### Métricas Objetivo

- **Tiempo de carga inicial**: < 2 segundos
- **Tiempo de filtrado**: < 500ms
- **Apertura de modal**: < 100ms

## Casos de Uso

### Usuario Estudiante

1. **Ver resumen de actividades**
   - Accede al dashboard
   - Ve estadísticas generales
   - Identifica tareas pendientes

2. **Buscar paciente específico**
   - Usa filtro de búsqueda por nombre/documento
   - Aplica filtros adicionales si necesario
   - Encuentra el paciente deseado

3. **Ver detalles de paciente**
   - Hace clic en "Detalles" en la tabla
   - Revisa información completa en modal
   - Accede al caso clínico si existe

4. **Navegar a caso clínico**
   - Desde tabla o modal
   - Hace clic en "Caso" o "Ir al Caso Clínico"
   - Es redirigido a vista de caso específico

## Testing

### Métodos Expuestos

```typescript
defineExpose({
  cargarDashboard,
  recargarPacientes,
  aplicarFiltros,
  limpiarFiltros,
  abrirModal,
  cerrarModal,
  verCasoClinico
})
```

### Casos de Prueba Sugeridos

1. **Carga inicial exitosa**
2. **Manejo de errores de API**
3. **Filtrado por texto**
4. **Filtrado por estado**
5. **Apertura y cierre de modal**
6. **Navegación a caso clínico**
7. **Limpieza de filtros**

## Configuración y Dependencias

### Dependencias Principales

```json
{
  "vue": "^3.x",
  "@vue/router": "^4.x",
  "typescript": "^5.x"
}
```

### Servicios Externos

- **StudentService**: API de estudiantes
- **ToastService**: Notificaciones
- **RouterService**: Navegación

## Roadmap y Mejoras Futuras

### Características Planificadas

1. **Notificaciones en tiempo real**: WebSockets para actualizaciones automáticas
2. **Exportación de datos**: PDF/Excel de información de pacientes
3. **Vista de calendario**: Integración con citas programadas
4. **Configuración de dashboard**: Personalización de widgets
5. **Modo offline**: Cache local para uso sin conexión

### Optimizaciones Técnicas

1. **Virtual scrolling**: Para tablas con muchos registros
2. **Service Worker**: Cache de recursos estáticos
3. **Lazy loading**: Componentes bajo demanda
4. **Bundle splitting**: Carga optimizada de código

## Soporte y Mantenimiento

### Logs y Monitoring

- Todos los errores se registran en `console.error`
- Métricas de performance disponibles en DevTools
- Estados de carga visibles para debugging

### Contacto Técnico

Para consultas sobre implementación o bugs:
- Revisar logs del navegador
- Verificar estado de APIs en Network tab
- Consultar documentación de StudentService

---

**Última actualización**: 13 de agosto de 2025
**Versión**: 1.0.0
**Autor**: Sistema de Gestión Odontológica
