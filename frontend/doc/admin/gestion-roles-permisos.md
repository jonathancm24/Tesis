# Gestión de Roles y Permisos

## Descripción General

El módulo de **Gestión de Roles y Permisos** proporciona una interfaz completa para administrar el sistema de permisos del proyecto odontológico universitario. Permite crear, editar y asignar roles con permisos específicos, garantizando un control de acceso granular y seguro.

## Arquitectura del Sistema

### Backend (NestJS + Prisma)

#### Controlador: `roles.controller.ts`
**Ubicación**: `backend/src/modules/Roles/roles.controller.ts`

**Endpoints disponibles**:
- `GET /roles/todos` - Obtiene roles sin permisos
- `GET /roles/todos/con-permisos` - Obtiene roles con permisos completos
- `GET /roles/:id` - Obtiene un rol específico por ID
- `POST /roles` - Crea un nuevo rol
- `PUT /roles/:id/permisos` - Asigna permisos a un rol

**Autenticación**: Requiere JWT y permisos específicos
**Permisos requeridos**: `GESTIONAR_ROLES`, `VER_ROLES`

#### DTOs del Backend
**Ubicación**: `backend/src/modules/Roles/DTO/`

1. **CreateRolDto** (`create-rol.dto.ts`):
   ```typescript
   {
     nombre: string;           // Nombre único del rol
     descripcion?: string;     // Descripción opcional
     permisos?: number[];      // IDs de permisos iniciales
   }
   ```

2. **AsignarPermisosDto** (`asignar-permisos.dto.ts`):
   ```typescript
   {
     permisos: number[];       // IDs de permisos a asignar
   }
   ```

#### Sistema de Permisos
**Ubicación**: `backend/src/common/enums/permisos.enum.ts`

**Permisos organizados por módulos**:
- **USUARIOS**: VER_USUARIOS, CREAR_USUARIOS, EDITAR_USUARIOS, ELIMINAR_USUARIOS, ASIGNAR_ROLES
- **ROLES**: GESTIONAR_ROLES, VER_ROLES, ASIGNAR_PERMISOS_INDIVIDUALES, REVOCAR_PERMISOS_INDIVIDUALES
- **CITAS**: VER_CITAS, CREAR_CITAS, EDITAR_CITAS, CANCELAR_CITAS, VER_TODAS_LAS_CITAS
- **TRATAMIENTOS**: VER_TRATAMIENTOS, CREAR_TRATAMIENTOS, EDITAR_TRATAMIENTOS, APROBAR_TRATAMIENTOS, VER_TODOS_TRATAMIENTOS
- **PACIENTES**: VER_PACIENTES, CREAR_PACIENTES, EDITAR_PACIENTES
- **SOLICITUDES**: CREAR_SOLICITUDES, VER_SOLICITUDES, APROBAR_SOLICITUDES
- **ESPECIALIDADES**: VER_ESPECIALIDADES, GESTIONAR_ESPECIALIDADES
- **ENCUESTAS**: VER_ENCUESTAS, CREAR_ENCUESTAS, VER_ESTADISTICAS, VER_CONFIGURACION

### Frontend (Vue 3 + TypeScript)

#### Servicio: `rolesService.ts`
**Ubicación**: `frontend/src/services/rolesService.ts`

**Funcionalidades**:
- Gestión completa de roles (CRUD)
- Asignación de permisos a roles
- Organización de permisos por módulos
- Estadísticas y resúmenes
- Manejo robusto de errores con fallbacks

**Métodos principales**:
```typescript
- obtenerRolesSimples(): Promise<Rol[]>
- obtenerRolesCompletos(): Promise<Rol[]>
- obtenerRolPorId(id: number): Promise<Rol>
- crearRol(datos: CrearRolDto): Promise<Rol>
- asignarPermisos(rolId: number, datos: AsignarPermisosDto): Promise<Rol>
- obtenerPermisosOrganizados(): Promise<PermisosOrganizados>
- obtenerResumenRoles(): Promise<ResumenRoles>
```

#### Tipos TypeScript: `roles.ts`
**Ubicación**: `frontend/src/types/roles.ts`

**Interfaces principales**:
```typescript
interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  permisos?: Permiso[];
  _count?: { usuarios: number; permisos: number; }
}

interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
```

#### Vista: `AdminRoles.vue`
**Ubicación**: `frontend/src/views/admin/AdminRoles.vue`
**Ruta**: `/admin/roles`

## Funcionalidades de la Interfaz

### 1. Dashboard de Estadísticas
- **Total de roles** en el sistema
- **Roles activos** vs inactivos
- **Total de permisos** disponibles
- **Número de módulos** de permisos

### 2. Gestión de Roles

#### Listado de Roles
- **Vista de tarjetas** con información completa
- **Estados visuales**: badges de colores para activo/inactivo
- **Información mostrada**:
  - Nombre y descripción del rol
  - Número de usuarios asignados
  - Número de permisos otorgados
  - Fecha de creación
  - Preview de permisos principales

#### Filtros de Búsqueda
- **Búsqueda por texto**: nombre o descripción
- **Filtro por estado**: activos, inactivos o todos
- **Aplicación en tiempo real** de filtros

#### Acciones por Rol
- **Ver detalles completos** del rol
- **Editar permisos** asignados
- **Eliminar rol** (protegido para roles del sistema)

### 3. Creación de Nuevos Roles

#### Modal de Creación
- **Nombre del rol** (obligatorio, se convierte a mayúsculas)
- **Descripción** opcional
- **Selección de permisos iniciales** organizados por módulos
- **Vista jerárquica** de permisos con descripciones

#### Validaciones
- Nombre obligatorio
- Prevención de duplicados
- Verificación en tiempo real

### 4. Edición de Permisos

#### Modal de Edición
- **Vista organizada por módulos** de todos los permisos
- **Selección múltiple** con checkboxes
- **Botones rápidos** para seleccionar/deseleccionar módulos completos
- **Descripciones detalladas** de cada permiso

#### Funcionalidades
- **Carga automática** de permisos actuales del rol
- **Selección masiva** por módulo (Todo/Nada)
- **Actualización en tiempo real** de la asignación

### 5. Panel de Información Lateral

#### Permisos por Módulo
- **Acordeón expandible** con todos los módulos
- **Contador de permisos** por módulo
- **Descripciones detalladas** de cada permiso
- **Vista jerárquica** organizada

## Seguridad y Permisos

### Protecciones Implementadas
1. **Roles del sistema protegidos**: No se pueden eliminar ADMIN, PROFESOR, ESTUDIANTE, SECRETARIO
2. **Validación de permisos**: Solo usuarios con `GESTIONAR_ROLES` pueden modificar
3. **Autenticación JWT**: Todas las operaciones requieren token válido
4. **Validación de entrada**: DTOs con validaciones estrictas

### Control de Acceso
- **VER_ROLES**: Para consultar roles y permisos
- **GESTIONAR_ROLES**: Para crear, modificar y eliminar roles
- **Jerarquía de permisos**: Administradores tienen acceso completo

## Manejo de Errores

### Estrategias de Fallback
1. **Datos por defecto**: Si el backend no responde, usa datos locales
2. **Mensajes informativos**: Notificaciones claras al usuario
3. **Recuperación gradual**: Intenta diferentes endpoints antes de fallar
4. **Logs detallados**: Para debugging y monitoreo

### Casos de Error Manejados
- **Backend no disponible**: Usa datos por defecto
- **Permisos insuficientes**: Mensaje claro al usuario
- **Datos duplicados**: Validación y mensaje específico
- **Timeout de conexión**: Reintentos automáticos

## Responsive Design

### Adaptabilidad Móvil
- **Grid responsivo**: Se adapta a pantallas pequeñas
- **Modales optimizados**: Scroll interno para contenido largo
- **Botones táctiles**: Tamaños apropiados para dispositivos móviles
- **Acordeones colapsables**: Mejor navegación en móviles

### Mejoras de UX
- **Sticky sidebar**: En desktop, panel lateral fijo
- **Loading states**: Indicadores visuales durante operaciones
- **Hover effects**: Feedback visual en interacciones
- **Color coding**: Estados diferenciados por colores

## Integración con el Sistema

### Dependencias
- **Router**: Integrado en `/admin/roles`
- **Layout**: Usa `AdminLayout.vue`
- **API**: Configuración en `config/api.ts`
- **Store**: Compatible con stores existentes

### Compatibilidad
- **Vue 3 Composition API**
- **TypeScript estricto**
- **Bootstrap 5** para componentes UI
- **Font Awesome** para iconografía
- **Axios** para peticiones HTTP

## Próximas Mejoras Sugeridas

### Funcionalidades Pendientes
1. **Eliminación de roles**: Implementar endpoint DELETE en backend
2. **Historial de cambios**: Auditoría de modificaciones de permisos
3. **Roles temporales**: Permisos con fecha de expiración
4. **Plantillas de roles**: Roles predefinidos para casos comunes
5. **Exportación**: Generar reportes de roles y permisos

### Optimizaciones
1. **Paginación**: Para listas grandes de roles
2. **Búsqueda avanzada**: Filtros más específicos
3. **Cache inteligente**: Reducir llamadas a API
4. **Notificaciones push**: Cambios en tiempo real
5. **Bulk operations**: Operaciones masivas en roles

## Archivos del Proyecto

### Backend
```
backend/src/modules/Roles/
├── roles.controller.ts         # Controlador principal
├── roles.service.ts           # Lógica de negocio
├── roles.module.ts            # Módulo NestJS
└── DTO/
    ├── create-rol.dto.ts      # DTO para crear rol
    └── asignar-permisos.dto.ts # DTO para asignar permisos

backend/src/common/enums/
└── permisos.enum.ts           # Definición de permisos

backend/src/modules/permisos/
└── permisos-inicializador.service.ts # Inicialización automática
```

### Frontend
```
frontend/src/
├── services/
│   └── rolesService.ts        # Servicio de roles
├── types/
│   └── roles.ts              # Tipos TypeScript
├── views/admin/
│   └── AdminRoles.vue        # Vista principal
├── components/layouts/
│   └── AdminLayout.vue       # Layout actualizado
└── router/
    └── index.ts              # Rutas agregadas
```

### Documentación
```
frontend/doc/admin/
└── gestion-roles-permisos.md # Este archivo
```

Esta implementación proporciona una solución completa y robusta para la gestión de roles y permisos, manteniendo la coherencia con el resto del sistema y siguiendo las mejores prácticas de desarrollo.
