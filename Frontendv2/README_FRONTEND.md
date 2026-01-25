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

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js >= 20.19.0
- npm o yarn

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

### Ejecutar en Desarrollo
```bash
npm run dev
```

### Construir para Producción
```bash
npm run build
```

## 🏗️ Estructura del Proyecto

```
src/
├── assets/
│   └── styles/
│       ├── global.css          # Variables CSS y estilos globales
│       └── login/
│           └── login.css       # Estilos específicos del login
├── components/                 # Componentes reutilizables
├── composables/
│   └── useTheme.ts            # Manejo de temas
├── Config/
│   └── api.ts                 # Configuración de Axios y servicios
├── router/
│   └── index.ts               # Configuración de rutas y guardias
├── stores/
│   └── auth.ts                # Store de autenticación
└── views/
    ├── LoginView.vue          # Vista de login
    ├── DashboardView.vue      # Dashboard principal
    └── NotFound.vue           # Página 404
```

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

## 🧪 Testing (Pendiente)
```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e
```

## 📝 Convenciones de Código

### Naming
- **Componentes**: PascalCase (LoginView.vue)
- **Composables**: camelCase con prefijo "use" (useTheme.ts)  
- **Stores**: camelCase (auth.ts)
- **CSS Classes**: kebab-case (login-form)

### Estructura de Archivos
- Un componente por archivo
- Estilos scoped cuando sea posible
- Tipos TypeScript en archivos separados si son complejos

### Comentarios
- Comentarios JSDoc para funciones públicas
- Comentarios inline para lógica compleja
- README para cada módulo principal

## 🚀 Próximos Pasos

1. **Componentes UI**: Crear biblioteca de componentes reutilizables
2. **Testing**: Implementar tests unitarios y E2E
3. **PWA**: Convertir en aplicación web progresiva
4. **Optimización**: Lazy loading, code splitting
5. **Accessibility**: Mejorar accesibilidad web

## 🤝 Contribución

1. Mantener la filosofía de código limpio
2. Seguir las convenciones establecidas
3. Agregar tests para nuevas funcionalidades
4. Documentar cambios importantes

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