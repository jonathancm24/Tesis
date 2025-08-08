<!-- src/components/common/Sidebar.vue -->
<template>
  <nav class="app-sidebar">
    <!-- Header del sidebar -->
    <div class="sidebar-header">
      <!-- Logo y título -->
      <div class="brand">
        <img :src="logoSrc" alt="Logo" class="brand-logo" />
        <div class="brand-text">
          <h2 class="brand-title">{{ title }}</h2>
          <small class="brand-subtitle">{{ subtitle }}</small>
        </div>
      </div>
      
      <!-- Botón cerrar para móvil -->
      <button 
        v-if="isMobile"
        @click="$emit('close-sidebar')"
        class="btn btn-close-sidebar d-lg-none"
        aria-label="Cerrar menú"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Navegación principal -->
    <div class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in items" :key="item.name" class="nav-item">
          <RouterLink 
            :to="item.to" 
            class="nav-link" 
            active-class="active"
            @click="handleNavClick"
          >
            <div class="nav-icon">
              <i :class="[item.icon, `text-${item.color || 'primary'}`]"></i>
            </div>
            <span class="nav-label">{{ item.label }}</span>
            <div class="nav-indicator"></div>
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- Footer del sidebar -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <i class="fas fa-user-shield"></i>
        </div>
        <div class="user-details">
          <span class="user-role">Administrador</span>
          <small class="user-status">En línea</small>
        </div>
      </div>
      
      <button @click="logout" class="btn btn-logout">
        <i class="fas fa-sign-out-alt me-2"></i>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

// Props del componente
interface MenuItem {
  name: string
  label: string
  icon: string
  to: RouteLocationRaw
  color?: string
}

interface Props {
  title: string
  subtitle?: string
  logoSrc: string
  items: MenuItem[]
  isMobile?: boolean
}

defineProps<Props>()

// Eventos que emite el componente
const emit = defineEmits<{
  'close-sidebar': []
}>()

const router = useRouter()

/**
 * Maneja el logout del usuario
 */
function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.replace({ name: 'Login' })
}

/**
 * Maneja el click en navegación (cierra sidebar en móvil)
 */
function handleNavClick() {
  emit('close-sidebar')
}
</script>

<style scoped>
/* =================================================
   SIDEBAR MODERNO CON COLORES INSTITUCIONALES SUAVES
   ================================================= */
.app-sidebar {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #a5d6a7 0%, #c8e6c9 50%, #e8f5e9 100%);
  color: #2e7d32;
  position: relative;
  overflow: hidden;
}

/* Patrón de fondo sutil */
.app-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(46, 125, 50, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

/* =================================================
   HEADER DEL SIDEBAR
   ================================================= */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(46, 125, 50, 0.2);
  position: relative;
  z-index: 2;
}

.brand {
  display: flex;
  align-items: center;
  flex: 1;
}

.brand-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  margin-right: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: #ffffff;
  padding: 4px;
  object-fit: contain;
}

.brand-text {
  flex: 1;
}

.brand-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1b5e20;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  line-height: 1.2;
}

.brand-subtitle {
  display: block;
  color: #388e3c;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.btn-close-sidebar {
  background: rgba(229, 115, 115, 0.8);
  border: none;
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(229, 115, 115, 0.3);
}

.btn-close-sidebar:hover {
  background: #e57373;
  transform: scale(1.05);
}

/* =================================================
   NAVEGACIÓN PRINCIPAL
   ================================================= */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  position: relative;
  z-index: 2;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0.25rem 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  color: #2e7d32;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(46, 125, 50, 0.15);
}

.nav-link:hover {
  color: #1b5e20;
  background: rgba(255, 255, 255, 0.4);
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(46, 125, 50, 0.2);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.6);
  color: #1b5e20;
  font-weight: 600;
  box-shadow: 
    0 4px 15px rgba(46, 125, 50, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.1rem;
}

.nav-label {
  flex: 1;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-indicator {
  width: 4px;
  height: 0;
  background: #2e7d32;
  border-radius: 2px;
  transition: height 0.3s ease;
}

.nav-link.active .nav-indicator {
  height: 24px;
}

/* =================================================
   FOOTER DEL SIDEBAR
   ================================================= */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(46, 125, 50, 0.2);
  position: relative;
  z-index: 2;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(46, 125, 50, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(46, 125, 50, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1.2rem;
  color: #2e7d32;
}

.user-details {
  flex: 1;
}

.user-role {
  display: block;
  font-weight: 600;
  color: #1b5e20;
  font-size: 0.9rem;
}

.user-status {
  display: block;
  color: #388e3c;
  font-size: 0.75rem;
  margin-top: 2px;
}

.btn-logout {
  width: 100%;
  background: rgba(229, 115, 115, 0.8);
  border: none;
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(229, 115, 115, 0.3);
}

.btn-logout:hover {
  background: #e57373;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 115, 115, 0.5);
}

.btn-logout:active {
  transform: translateY(0);
}

/* =================================================
   SCROLLBAR PERSONALIZADA
   ================================================= */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(46, 125, 50, 0.1);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(46, 125, 50, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(46, 125, 50, 0.5);
}

/* =================================================
   RESPONSIVE DESIGN
   ================================================= */

/* Tablet */
@media (max-width: 991.98px) and (min-width: 768px) {
  .sidebar-header {
    padding: 1.25rem 1rem;
  }
  
  .brand-logo {
    width: 45px;
    height: 45px;
  }
  
  .brand-title {
    font-size: 1.2rem;
  }
}

/* Mobile */
@media (max-width: 767.98px) {
  .sidebar-header {
    padding: 1rem;
  }
  
  .brand-logo {
    width: 40px;
    height: 40px;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
  
  .brand-subtitle {
    font-size: 0.7rem;
  }
  
  .nav-link {
    padding: 0.875rem 1rem;
  }
  
  .nav-label {
    font-size: 0.9rem;
  }
  
  .user-info {
    padding: 0.75rem;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  .btn-logout {
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
  }
}

/* =================================================
   ANIMACIONES
   ================================================= */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.nav-link.active .nav-icon {
  animation: pulse 2s ease-in-out infinite;
}

/* =================================================
   ESTADOS DE FOCO PARA ACCESIBILIDAD
   ================================================= */
.nav-link:focus,
.btn-logout:focus,
.btn-close-sidebar:focus {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

/* =================================================
   MODO REDUCE MOTION
   ================================================= */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .btn-logout,
  .btn-close-sidebar {
    transition: none;
  }
  
  .nav-link.active .nav-icon {
    animation: none;
  }
}
</style>
