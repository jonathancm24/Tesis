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
- **Composables**: Lógica reutilizable (useTheme, useAuth)
- **Stores**: Manejo de estado con Pinia
- **Servicios**: Configuración centralizada de API
- **Tipos TypeScript**: Tipado fuerte para mejor DX

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
- **`styles/`**: Hojas de estilo CSS/SCSS. Organizado por módulos (ej. `admin/`, `login/`).

### `src/components/`
Componentes Vue reutilizables (UI) que se usan en múltiples vistas.
- **`icons/`**: Componentes específicos para iconos SVG.

### `src/composables/`
Lógica de estado reutilizable (Composition API). Hooks personalizados (ej. `useTheme`, `useAuth`).

### `src/Config/`
Archivos de configuración global y constantes (ej. configuración de Axios `api.ts`, constantes del sistema).

### `src/Preview/`
Espacio para componentes o vistas de previsualización/pruebas visuales antes de integrarlos.

### `src/router/`
Configuración de rutas (Vue Router) y guards de navegación (protección de rutas).

### `src/service/`
Capa de conexión con el Backend.
- Contiene las funciones que realizan las peticiones HTTP a la API.
- Separa la lógica de datos de la interfaz visual.

### `src/stores/`
Gestión de estado global con **Pinia** (ej. `auth.ts` para sesión).

### `src/views/`
Páginas principales de la aplicación (vistas conectadas al router).
- **`Admin/`**: Vistas específicas del panel de administración.

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
- **Información**: Datos del usuario autenticado
- **Navegación**: Header con opciones de tema y logout

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
- ✅ **Branding Actualizado**: Texto "Uleam" más prominente y mejor legibilidad

### v2.1.0 - Implementación de Identidad Institucional ULEAM
- ✅ **Colores Institucionales**: Implementados verde (#1e7e34) y blanco como principales
- ✅ **Branding Completo**: Agregado "Universidad Laica Eloy Alfaro de Manabí"
- ✅ **Tema Oscuro**: Adaptado con colores institucionales más brillantes
- ✅ **Interfaz Mejorada**: Botón "Entrar" y textos actualizados según diseño institucional

---

**Versión**: 2.3.0  
**Institución**: Universidad Laica Eloy Alfaro de Manabí (ULEAM)  
**Facultad**: Odontología  
**Autor**: Jonathan Alexander Cedeño Moran  
**Licencia**: Propiedad Intelectual de la ULEAM y el Autor. Uso estrictamente académico.