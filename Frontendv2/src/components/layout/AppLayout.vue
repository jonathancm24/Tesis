<!--
  Componente: AppLayout
  
  Layout principal de la aplicación que contiene:
  - Header superior con branding, tema y logout
  - Sidebar lateral colapsable con navegación
  - Área de contenido principal para las vistas
  
  Este layout se aplica a todas las rutas autenticadas.
  Las vistas hijas se renderizan en el <router-view /> principal.
-->

<template>
  <div class="app-layout">
    <!-- Header superior fijo -->
    <AppHeader />

    <!-- Contenedor principal con sidebar y contenido -->
    <div class="layout-container">
      <!-- Sidebar lateral -->
      <AppSidebar />

      <!-- Área de contenido principal -->
      <main class="main-content" :class="{ 'sidebar-open': !isCollapsed && !isMobile }">
        <!-- Contenedor con padding y max-width -->
        <div class="content-wrapper">
          <!-- Aquí se renderizan las vistas hijas (router-view) -->
          <router-view v-slot="{ Component }">
            <!-- Transición suave entre vistas -->
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useSidebar } from '@/composables/useSidebar'

// Obtener el estado del sidebar para ajustar el contenido principal
const { isCollapsed, isMobile } = useSidebar()
</script>

<style scoped>
/* ========== LAYOUT PRINCIPAL ========== */
.app-layout {
  min-height: 100vh;
  max-width: 100vw;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ========== CONTENEDOR PRINCIPAL ========== */
.layout-container {
  flex: 1;
  display: flex;
  position: relative;
  padding-top: 56px;
  min-height: calc(100vh - 56px);
  overflow-x: hidden;
}

/* ========== AREA DE CONTENIDO ========== */
.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease, width 0.3s ease;
  min-height: 100%;
  width: calc(100% - 60px);
  max-width: calc(100vw - 60px);
  overflow-x: hidden;
  box-sizing: border-box;
}

.main-content.sidebar-open {
  margin-left: 240px;
  width: calc(100% - 240px);
  max-width: calc(100vw - 240px);
}

/* ========== WRAPPER DEL CONTENIDO ========== */
.content-wrapper {
  padding: 1.25rem;
  min-height: 100%;
  background: var(--color-background);
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}

/* ========== TRANSICIONES ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== RESPONSIVE - TABLETS Y MÓVILES ========== */
@media (max-width: 1024px) {
  .layout-container {
    padding-top: 0;
  }

  .main-content {
    margin-left: 60px;
    width: calc(100vw - 60px);
    max-width: calc(100vw - 60px);
    padding-top: 56px;
    min-height: 100vh;
  }

  .main-content.sidebar-open {
    margin-left: 60px;
    width: calc(100vw - 60px);
    max-width: calc(100vw - 60px);
  }

  .content-wrapper {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 56px;
    width: calc(100vw - 56px);
    max-width: calc(100vw - 56px);
    padding-top: 52px;
  }

  .main-content.sidebar-open {
    margin-left: 56px;
    width: calc(100vw - 56px);
  }

  .content-wrapper {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    margin-left: 52px;
    width: calc(100vw - 52px);
  }

  .main-content.sidebar-open {
    margin-left: 52px;
    width: calc(100vw - 52px);
  }

  .content-wrapper {
    padding: 0.5rem;
  }
}
</style>
