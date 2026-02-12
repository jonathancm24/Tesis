# Frontend v2 - Sistema Odontológico ULEAM

Esta es la versión 2 del frontend del Sistema Odontológico de la Facultad de Odontología ULEAM, construida con Vue 3, TypeScript, Pinia y un enfoque en código limpio y mantenible.

## 🚀 Características Principales

### ✨ Sistema de Autenticación
- Login funcional que se conecta con el backend v2
- Diseño institucional con colores ULEAM (verde, rojo, blanco)
- Logo circular de la universidad con el retrato característico
- Persistencia de sesión en localStorage
- Manejo de errores con mensajes descriptivos
- Guardias de ruta para protección de rutas

### 🎨 Sistema de Temas Institucionales
- **Tema Claro**: Colores institucionales ULEAM (verde #1e7e34, rojo #dc3545, blanco)
- **Tema Oscuro**: Versión oscura con colores institucionales más brillantes
- Alternancia sencilla entre temas
- Persistencia de preferencia del usuario
- Variables CSS centralizadas para fácil personalización
- Identidad visual consistente con la institución

### 🔧 Arquitectura Limpia
- **Composables**: Lógica reutilizable (useTheme, useSidebar)
- **Stores**: Manejo de estado con Pinia
- **Layout System**: Header + Sidebar colapsable para navegación
- **Servicios**: Configuración centralizada de API
- **Tipos TypeScript**: Tipado fuerte para mejor DX

### 🎯 Layout y Navegación
- **AppLayout**: Layout principal con header fijo y sidebar colapsable
- **AppHeader**: Header reutilizable con tema, usuario y logout (configurable)
- **AppSidebar**: Navegación lateral responsive con soporte móvil
- **Responsive**: Diseño adaptable a móviles, tablets y desktop
- **Persistencia**: Estado del sidebar guardado en localStorage

## 📦 Tecnologías Utilizadas

- **Vue 3** - Framework reactivo
- **TypeScript** - Tipado estático
- **Pinia** - Manejo de estado
- **Vue Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **@vueuse/core** - Utilidades de composables
- **Vite** - Build tool rápido

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Instalar Dependencias
```bash
cd Frontendv2
npm install
```

### Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3000
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```



This template should help get you started developing with Vue 3 in Vite.

## 📂 Estructura del Proyecto

Guía de organización de carpetas para el desarrollo:

### `src/assets/`
Recursos estáticos (imágenes, fuentes, estilos).
- **`images/`**: Archivos de imagen (png, jpg, svg).
- **`styles/`**: Hojas de estilo CSS/SCSS.
  - `global.css`: Variables CSS y estilos base
  - `admin/`: Estilos específicos del módulo admin
  - `login/`: Estilos del login

### `src/components/`
Componentes Vue reutilizables (UI) que se usan en múltiples vistas.
- **`layout/`**: Componentes de estructura (AppLayout, AppHeader, AppSidebar)
- **`admin/`**: Componentes específicos del módulo admin

### `src/composables/`
Lógica de estado reutilizable (Composition API).
- `useTheme.ts`: Manejo de temas claro/oscuro
- `useSidebar.ts`: Estado del sidebar colapsable
- `usePermissions.ts`: Helpers de validación de roles y permisos

### `src/Config/`
Archivos de configuración global y constantes.
- `api.ts`: Configuración de Axios y servicios base
- `permissions.ts`: Definición de roles y permisos del sistema
- `menu.ts`: Configuración de menú dinámico por rol

### `src/router/`
Configuración de rutas (Vue Router) y guards de navegación.
- Rutas organizadas con layout anidado
- Protección por autenticación
- `guards.ts`: Guards centralizados para autenticación y roles

### `src/service/`
Capa de conexión con el Backend.
- Funciones que realizan peticiones HTTP a la API
- Separación de lógica de datos de la interfaz
- **`usuarios.service.ts`**: Servicio CRUD para usuarios

### `src/stores/`
Gestión de estado global con Pinia.
- `auth.ts`: Autenticación y usuario actual
- `usuarios.ts`: Estado global de usuarios con acciones CRUD

### `src/types/`
Definiciones de tipos TypeScript compartidos.
- `usuarios.types.ts`: Interfaces y tipos para módulo de usuarios

### `src/views/`
Páginas principales de la aplicación (vistas conectadas al router).
- `LoginView.vue`: Página de inicio de sesión
- `DashboardView.vue`: Página principal post-login
- **`Admin/`**: Vistas del panel de administración
  - `UsuariosView.vue`: Gestión de usuarios
- **`Profesor/`**: Vistas para rol profesor
  - `EstudiantesView.vue`: Seguimiento de estudiantes

## Recommended IDE Setup

VS Code + Vue (Official) (and disable Vetur).

## Comentarios extras
<!-- Iconos FontAwesome -->
<!-- Agrega esta línea en el <head> del index.html para usar los iconos -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 
O si prefieres instalarlo localmente:
npm install @fortawesome/fontawesome-free

Y luego importar en main.ts:
import '@fortawesome/fontawesome-free/css/all.css'
-->

## 🎯 Funcionalidades Implementadas

### Login
- **Ruta**: `/login`
- **Diseño**: Interfaz institucional con logo oficial ULEAM
- **Logo**: Imagen real de ULEAM desde `/assets/images/LOGO-ULEAM.png`
- **Branding**: "Facultad de Odontología ULEAM" con subtítulo completo de la universidad
- **Colores**: Principalmente verde institucional (#1e7e34) y blanco
- **Distribución**: Componentes bien centrados y distribuidos
- **Funcionalidad**: Autenticación con email/contraseña
- **Validación**: Formulario con validación en tiempo real
- **Estados**: Loading, error, éxito
- **Seguridad**: Manejo seguro de tokens JWT
- **Responsive**: Adaptable a dispositivos móviles con mejor usabilidad

### Dashboard
- **Ruta**: `/dashboard` (protegida)
- **Funcionalidad**: Pantalla principal post-login
- **Información**: Datos del usuario autenticado en tarjetas
- **Layout**: Usa AppLayout con header y sidebar

### Gestión de Usuarios
- **Ruta**: `/admin/usuarios` (protegida)
- **Vista**: Tabla con filtros (búsqueda, estado) y acciones
- **Formulario**: Panel lateral para crear/editar usuarios
- **Backend**: Completamente conectado con API real
- **Funcionalidades**:
  - Listar usuarios con paginación
  - Crear usuario (con contraseña temporal)
  - Editar usuario existente
  - Activar/Desactivar usuario
  - Filtros por nombre, estado
  - **Importación masiva desde Excel** con modal interactivo
  - Descarga de plantilla Excel con instrucciones
  - Resultados detallados de importación (éxitos y errores)
  - Loading states y manejo de errores
- **Estilos**: CSS dedicado en `assets/styles/admin/usuarios.css`
- **Responsive**: Adaptable a móviles, tablets y desktop
- **Store**: Gestión de estado con Pinia (usuarios.ts)
- **Service**: Capa de servicios HTTP (usuarios.service.ts)
- **Componentes**:
  - ImportUsuariosModal: Modal de importación de Excel

### Gestión de Especialidades
- **Ruta**: `/admin/especialidades` (protegida)
- **Vista**: Tabla simple con listado de especialidades
- **Modal**: Formulario para crear/editar especialidades
- **Backend**: CRUD completo conectado con API
- **Funcionalidades**:
  - Listar todas las especialidades
  - Crear nueva especialidad
  - Editar especialidad existente
  - Eliminar especialidad (con validación de dependencias)
  - Estados de carga y vacío
- **Estilos**: CSS dedicado en `assets/styles/admin/especialidades.css`
- **Store**: Gestión de estado con Pinia (especialidades.ts)
- **Service**: Capa de servicios HTTP (especialidades.service.ts)
- **Validaciones**: No permite eliminar si tiene usuarios asignados

### Seguimiento de Estudiantes (Profesor)
- **Ruta**: `/profesor/estudiantes` (protegida)
- **Vista**: Tabla con listado de estudiantes y panel de resumen
- **Backend**: Conectado con API real filtrando por rol ESTUDIANTE
- **Funcionalidades**:
  - Listar estudiantes con búsqueda y filtros
  - Ver resumen detallado de estudiante seleccionado
  - **Importar estudiantes desde Excel**
  - Validación: Bloquea creación de usuarios con rol Administrador
  - Modal interactivo de importación con advertencias
  - Estados de carga y vacío
- **Estilos**: CSS dedicado en `assets/styles/Profesor/Estudiantes.css`
- **Store**: Gestión de estado con Pinia (estudiantes.ts)
- **Service**: Capa de servicios HTTP (estudiantes.service.ts)
- **Componentes**:
  - ImportEstudiantesModal: Modal con validación de roles

### Sistema de Layout
- **AppLayout**: Contenedor principal con header fijo + sidebar + contenido
- **AppHeader**: Branding, selector de tema, info usuario, logout
- **AppSidebar**: Navegación lateral colapsable
  - Ancho expandido: 260px
  - Ancho colapsado: 64px
  - Persistencia del estado en localStorage
  - Auto-colapso en móviles (<1024px)
  - Overlay en móviles para cerrar

### Sistema de Temas
- **Implementación**: CSS Variables + composable
- **Persistencia**: localStorage
- **Temas**: Claro y Oscuro
- **Extensibilidad**: Fácil agregar nuevos temas

## 🎨 Personalización de Temas Institucionales

Los temas se manejan mediante CSS Variables en `global.css` usando los colores oficiales de ULEAM:

```css
:root {
  /* Tema claro - Colores institucionales ULEAM suavizados */
  --color-primary: #2d5a3d;        /* Verde institucional suave */
  --color-secondary: #4a7c5a;      /* Verde secundario suave */
  --color-background: #ffffff;     /* Blanco */
  /* ... más variables */
}

[data-theme="dark"] {
  /* Tema oscuro - Colores institucionales equilibrados */
  --color-primary: #4a7c5a;        /* Verde suave para oscuro */
  --color-secondary: #5d8f6d;      /* Verde secundario suave */
  --color-background: #1a1a1a;     /* Fondo oscuro */
  /* ... más variables */
}
```

### Agregar Nuevos Temas
1. Definir variables en `global.css`
2. Actualizar tipo `Theme` en `useTheme.ts`
3. Agregar lógica de alternancia si es necesario

## 🔐 Sistema de Autenticación

### Flujo de Login
1. Usuario ingresa credenciales
2. Frontend valida formato
3. Envía request a `/auth/login`
4. Backend valida y retorna JWT + datos de usuario
5. Frontend almacena token y datos
6. Redirige a dashboard

### Manejo de Tokens
- **Storage**: localStorage para persistencia
- **Interceptors**: Axios agrega automáticamente el token
- **Expiración**: Redirección automática a login si 401

### Protección de Rutas
```typescript
// Rutas que requieren autenticación
meta: {
  requiresAuth: true
}

// Rutas solo para usuarios no autenticados
meta: {
  requiresGuest: true
}
```

## 🎯 Últimas Actualizaciones

### v2.9.0 - Importación de Estudiantes desde Excel
- ✅ **Service de Estudiantes**: Reutiliza usuarios.service con filtros específicos
- ✅ **Store de Estudiantes**: Gestión de estado con Pinia
- ✅ **Modal de Importación**: ImportEstudiantesModal con validación de roles
- ✅ **Validación de Administradores**: Bloquea intentos de crear usuarios admin
- ✅ **Advertencias Visuales**: Mensajes claros sobre restricciones
- ✅ **Integración Backend**: Conectado con API real filtrando por roleId
- ✅ **Estados de UI**: Loading, vacío y error bien manejados
- ✅ **EstudiantesView Actualizado**: Conectado con backend y funcional

### v2.8.0 - Gestión de Especialidades
- ✅ **Backend CRUD completo**: Módulo de especialidades con DTOs, service y controller
- ✅ **Validaciones**: No permite eliminar especialidades con usuarios asignados
- ✅ **Frontend Service**: Capa de servicios HTTP para especialidades
- ✅ **Store de Especialidades**: Gestión de estado con Pinia
- ✅ **Vista de Admin**: EspecialidadesView con tabla y modal
- ✅ **Modal CRUD**: Crear y editar especialidades en modal reutilizable
- ✅ **Permisos**: Integrado en sistema de roles (solo ADMIN)
- ✅ **Menú**: Agregado ítem de navegación en sidebar
- ✅ **Estilos Dedicados**: CSS separado en `especialidades.css`
- ✅ **Estados de UI**: Loading, vacío y error bien manejados

### v2.7.0 - Importación de Usuarios desde Excel
- ✅ **Modal de Importación**: Componente completo con pasos visuales
- ✅ **Descarga de Plantilla**: Endpoint para descargar plantilla Excel con ejemplos
- ✅ **Carga de Archivos**: Drag & drop y selector de archivos
- ✅ **Validación**: Preview del archivo antes de importar
- ✅ **Resultados Detallados**: Estadísticas y lista de errores
- ✅ **UX Mejorada**: Proceso guiado en 3 pasos (Upload → Processing → Results)
- ✅ **Integración Backend**: Conectado con servicio de importación masiva

### v2.6.0 - Conexión Backend y Estructura de Servicios (Fase 3)
- ✅ **Types Centralizados**: `types/usuarios.types.ts` con interfaces coherentes al backend
- ✅ **Service Layer**: `services/usuarios.service.ts` con todos los endpoints CRUD
- ✅ **Store de Usuarios**: `stores/usuarios.ts` con Pinia para gestión de estado
- ✅ **UsuariosView Conectado**: Vista completamente funcional con backend real
- ✅ **Loading States**: Indicadores de carga y manejo de errores
- ✅ **Activar/Desactivar**: Endpoints implementados con actualización en tiempo real
- ✅ **Formulario Completo**: Campos adicionales (fecha nacimiento, teléfono, dirección)
- ✅ **Estructura Escalable**: Patrón service/store/types replicable para otros módulos

### v2.5.0 - Permisos y roles (Fase 2)
- ✅ **Menu por rol**: Sidebar muestra solo opciones segun el rol
- ✅ **Guards por rol**: Acceso a rutas controlado por roles
- ✅ **Helpers**: Configuracion centralizada de permisos y menu

### v2.4.0 - Sistema de Layout y Navegación (Fase 1)
- ✅ **AppLayout**: Layout principal con header + sidebar + contenido
- ✅ **AppHeader**: Header reutilizable con branding configurable
- ✅ **AppSidebar**: Sidebar colapsable con navegación
- ✅ **useSidebar**: Composable para manejar estado del sidebar
- ✅ **Router Anidado**: Rutas organizadas con layout compartido
- ✅ **Responsive**: Sidebar auto-colapsa en móviles (<1024px)
- ✅ **Persistencia**: Estado del sidebar en localStorage
- ✅ **Dashboard Actualizado**: Simplificado para usar el nuevo layout
- ✅ **Código Documentado**: Comentarios detallados en todos los componentes

### v2.3.0 - Optimización de Colores y Layout
- ✅ **Colores Suavizados**: Verde institucional más suave (#2d5a3d) menos brillante y agresivo
- ✅ **Layout Mejorado**: Mejor distribución de espacio entre paneles (flex 1.2 vs 0.8)
- ✅ **Centrado Optimizado**: Login mejor centrado aprovechando todo el espacio disponible
- ✅ **Proporciones Ajustadas**: Logo y texto con tamaños más equilibrados
- ✅ **Sombras Suaves**: Efectos visuales más sutiles y profesionales
- ✅ **Gradientes Mejorados**: Fondos más suaves y menos saturados

### v2.2.0 - Mejoras en Diseño y Distribución
- ✅ **Logo Real**: Implementado logo oficial ULEAM desde `/assets/images/LOGO-ULEAM.png`
- ✅ **Distribución Mejorada**: Mejor centrado y distribución de componentes
- ✅ **Colores Optimizados**: Enfoque principal en verde institucional, rojo solo para errores
- ✅ **Diseño Limpio**: Eliminado CSS innecesario, mejor estructura visual
- ✅ **Responsive Mejorado**: Adaptación optimizada para dispositivos móviles
- ✅ **Branding 9.0  
**Institución**: Universidad Laica Eloy Alfaro de Manabí (ULEAM)  
**Facultad**: Odontología  
**Autor**: Jonathan Alexander Cedeño Moran  
**Licencia**: Propiedad Intelectual de la ULEAM y el Autor. Uso estrictamente académico.

---

## 📋 Próximos Pasos

### Módulo de Usuarios
- ✅ Servicios configurados
- ✅ Store con Pinia
- ✅ Types TypeScript
- ✅ Vista conectada al backend
- ✅ Importación desde Excel con modal interactivo
- ⏳ Exportación a Excel (pendiente)

### Módulo de Especialidades
- ✅ CRUD completo implementado
- ✅ Backend con validaciones
- ✅ Frontend conectado
- ✅ Modal para crear/editar
- ✅ Validación de dependencias al eliminar

### Módulo de Estudiantes
- ✅ Service conectado con backend
- ✅ Store con filtros por rol
- ✅ Vista actualizada con datos reales
- ✅ Importación desde Excel con validaciones
- ✅ Bloqueo de creación de administradores

### Otros Módulos
1. **Casos Clínicos**: Implementar service/store/types
2. **Componentes**: Dividir vistas grandes en componentes reutilizables
3. **Validaciones**: Agregar validación frontend más robusta
4 ✅ Backend con validaciones
- ✅ Frontend conectado
- ✅ Modal para crear/editar
- ✅ Validación de dependencias al eliminar

### Otros Módulos
1. **Estudiantes**: Conectar EstudiantesView con backend
2. **Casos Clínicos**: Implementar service/store/types
3. **Componentes**: Dividir vistas grandes en componentes reutilizables
4. **Validaciones**: Agregar validación frontend más robusta
5. **Notificaciones**: Sistema de toasts para feedback de usuario (✅ Implementado)