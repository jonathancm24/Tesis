<!--src/components/layouts/SecretaryLayout.vue-->
<template>
  <div :class="['secretary-layout', { 'dark-mode': darkMode }]">
    <!-- Overlay para móvil cuando el sidebar está abierto -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay d-lg-none"
      @click="closeSidebar"
    ></div>

    <!-- Contenedor principal -->
    <div class="main-container">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'sidebar-open': sidebarOpen }]">
        <Sidebar
          :items="menuItems"
          :logoSrc="logoSrc"
          title="DentApp"
          subtitle="Secretaría"
          :is-mobile="isMobile"
          @close-sidebar="closeSidebar"
        />
      </aside>

      <!-- Contenido principal -->
      <main class="content">
        <!-- Header toolbar responsive -->
        <header class="secretary-header">
          <!-- Botón hamburguesa para móvil -->
          <button 
            class="btn btn-hamburger d-lg-none"
            @click="toggleSidebar"
            :aria-label="'Abrir menú de navegación'"
          >
            <i class="fas fa-bars"></i>
          </button>

          <!-- Información del usuario -->
          <div class="header-info">
            <div class="user-welcome">
              <div class="user-avatar">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="user-details">
                <span class="welcome-text">¡Hola!</span>
                <span class="user-name">{{ userName || 'Secretario' }}</span>
              </div>
            </div>
          </div>

          <!-- Controles del header -->
          <div class="header-controls">
            <!-- Toggle modo oscuro -->
            <button
              class="btn btn-header-control"
              @click="toggleDarkMode"
              :title="darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>

            <!-- Botón de perfil -->
            <button 
              @click="goToProfile" 
              class="btn btn-profile"
              title="Ver perfil"
            >
              <i class="fas fa-user"></i>
              <span class="d-none d-sm-inline ms-1">Perfil</span>
            </button>
          </div>
        </header>

        <!-- Contenido de la vista -->
        <div class="page-content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import Sidebar from '@/components/common/Sidebar.vue'
import logoSrc from '@/assets/img/descarga.png'

const router = useRouter()
const authStore = useAuthStore()
const darkMode = ref(false)
const sidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)

// Computed para detectar si es móvil
const isMobile = computed(() => windowWidth.value < 992) // lg breakpoint

// Computed para obtener el nombre del usuario
const userName = computed(() => authStore.userName)

// Función para manejar el resize de la ventana
function handleResize() {
  windowWidth.value = window.innerWidth
  // Cerrar sidebar automáticamente en desktop
  if (windowWidth.value >= 992) {
    sidebarOpen.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // Cargar datos del usuario si no están disponibles
  if (!authStore.user) {
    authStore.loadUserFromStorage()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Funciones de navegación
function goToProfile() {
  router.push({ name: 'SecretaryProfile' })
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
}

// Funciones del sidebar móvil
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

// Elementos del menú con colores institucionales
const menuItems = [
  {
    name: 'SecretaryDashboard',
    label: 'Dashboard',
    icon: 'fas fa-home',
    to: { name: 'SecretaryDashboard' },
    color: 'success'
  },
  {
    name: 'PatientManagement',
    label: 'Gestión de Pacientes',
    icon: 'fas fa-user-injured',
    to: { name: 'PatientManagement' },
    color: 'primary'
  },
  {
    name: 'PatientAssignment',
    label: 'Asignaciones',
    icon: 'fas fa-user-check',
    to: { name: 'PatientAssignment' },
    color: 'info'
  },
  {
    name: 'WeeklySchedule',
    label: 'Agenda Semanal',
    icon: 'fas fa-calendar-alt',
    to: { name: 'WeeklySchedule' },
    color: 'warning'
  },
  {
    name: 'MedicalScreening',
    label: 'Cuestionario Médico',
    icon: 'fas fa-notes-medical',
    to: { name: 'MedicalScreening' },
    color: 'secondary'
  },
  { 
    name: 'Affiliation', 
    label: 'Afiliación', 
    icon: 'fas fa-id-card', 
    to: { name: 'Affiliation' },
    color: 'danger'
  }
]
</script>

<style scoped>
/* =================================================
   VARIABLES DE COLORES INSTITUCIONALES SUAVES
   ================================================= */
.secretary-layout {
  /* Colores institucionales suaves: Tonos aqua y verde para secretario */
  --primary-aqua: #26c6da;        /* Aqua suave para secretario */
  --primary-green: #81c784;       /* Verde suave */
  --primary-white: #ffffff;       /* Blanco puro */
  
  /* Tonos secundarios más suaves */
  --soft-aqua: #e0f2f1;           /* Aqua muy claro */
  --soft-green: #c8e6c9;          /* Verde muy claro */
  --soft-gray: #f5f5f5;           /* Gris muy claro */
  
  /* Colores de soporte elegantes */
  --light-gray: #fafafa;
  --medium-gray: #9e9e9e;
  --dark-gray: #424242;
  --border-light: #f0f0f0;
  --shadow-light: rgba(0, 0, 0, 0.08);
  --shadow-medium: rgba(0, 0, 0, 0.12);
  
  /* Variables del tema claro */
  --bg-primary: var(--primary-white);
  --bg-secondary: var(--light-gray);
  --text-primary: var(--dark-gray);
  --text-secondary: var(--medium-gray);
  --border-color: var(--border-light);
  --shadow-color: var(--shadow-light);
  
  color: var(--text-primary);
  background: var(--bg-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

/* Tema oscuro */
.secretary-layout.dark-mode {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #404040;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

/* =================================================
   LAYOUT PRINCIPAL
   ================================================= */
.main-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* =================================================
   SIDEBAR RESPONSIVE
   ================================================= */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, var(--soft-aqua) 0%, #e0f7fa 100%);
  transform: translateX(-100%);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1050;
  box-shadow: 2px 0 10px var(--shadow-color);
  overflow-y: auto;
}

/* Sidebar abierto en móvil */
.sidebar.sidebar-open {
  transform: translateX(0);
}

/* Sidebar en desktop - siempre visible */
@media (min-width: 992px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
    flex: 0 0 280px;
    box-shadow: none;
    border-right: 1px solid var(--border-color);
    background: linear-gradient(135deg, var(--soft-aqua) 0%, #b2dfdb 100%);
  }
}

/* Overlay para móvil */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  backdrop-filter: blur(2px);
}

/* =================================================
   CONTENIDO PRINCIPAL
   ================================================= */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
  width: 100%;
}

/* En desktop, ajustar por el sidebar */
@media (min-width: 992px) {
  .content {
    margin-left: 0;
  }
}

/* =================================================
   HEADER RESPONSIVE
   ================================================= */
.secretary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-primary);
  border-bottom: 2px solid var(--primary-aqua);
  box-shadow: 0 2px 8px var(--shadow-light);
  z-index: 1000;
  position: sticky;
  top: 0;
}

/* Botón hamburguesa */
.btn-hamburger {
  background: var(--primary-aqua);
  color: var(--primary-white);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px var(--shadow-light);
  transition: all 0.2s ease;
}

.btn-hamburger:hover {
  background: #00acc1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.btn-hamburger:active {
  transform: translateY(0);
}

/* Información del usuario */
.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 1rem;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-avatar {
  color: var(--primary-aqua);
  font-size: 1.8rem;
  display: flex;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.welcome-text {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 400;
  margin-bottom: 1px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

/* Controles del header */
.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-header-control {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-header-control:hover {
  background: var(--soft-aqua);
  color: var(--dark-gray);
  border-color: var(--primary-aqua);
  transform: translateY(-1px);
}

.btn-profile {
  background: var(--primary-aqua);
  color: var(--primary-white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(38, 198, 218, 0.25);
}

.btn-profile:hover {
  background: #00acc1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(38, 198, 218, 0.4);
}

/* =================================================
   CONTENIDO DE LA PÁGINA
   ================================================= */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

/* =================================================
   RESPONSIVE DESIGN
   ================================================= */

/* Tablet */
@media (max-width: 991.98px) and (min-width: 768px) {
  .secretary-header {
    padding: 1rem;
  }
  
  .page-content {
    padding: 1rem;
  }
  
  .user-avatar {
    font-size: 1.6rem;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
}

/* Mobile */
@media (max-width: 767.98px) {
  .secretary-header {
    padding: 0.75rem 1rem;
  }
  
  .page-content {
    padding: 1rem;
  }
  
  .header-info {
    margin-left: 0.5rem;
  }
  
  .user-welcome {
    gap: 0.5rem;
  }
  
  .user-avatar {
    font-size: 1.6rem;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
  
  .btn-header-control {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .header-controls {
    gap: 0.25rem;
  }
}

/* Mobile pequeño */
@media (max-width: 575.98px) {
  .secretary-header {
    padding: 0.5rem 0.75rem;
  }
  
  .page-content {
    padding: 0.75rem;
  }
  
  .user-welcome {
    gap: 0.4rem;
  }
  
  .user-avatar {
    font-size: 1.4rem;
  }
  
  .welcome-text {
    font-size: 0.7rem;
  }
  
  .user-name {
    font-size: 0.85rem;
  }
}

/* =================================================
   ANIMACIONES Y TRANSICIONES
   ================================================= */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.page-content {
  animation: fadeIn 0.3s ease;
}

/* =================================================
   TEMA OSCURO - AJUSTES ESPECÍFICOS
   ================================================= */
.secretary-layout.dark-mode .secretary-header {
  border-bottom-color: var(--primary-aqua);
  background: var(--bg-secondary);
}

.secretary-layout.dark-mode .btn-hamburger {
  background: var(--primary-aqua);
}

.secretary-layout.dark-mode .btn-header-control {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

.secretary-layout.dark-mode .btn-header-control:hover {
  background: var(--soft-aqua);
  color: var(--dark-gray);
}

/* =================================================
   ACCESIBILIDAD
   ================================================= */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states para accesibilidad */
.btn-hamburger:focus,
.btn-header-control:focus,
.btn-profile:focus {
  outline: 2px solid var(--soft-aqua);
  outline-offset: 2px;
}
</style>
