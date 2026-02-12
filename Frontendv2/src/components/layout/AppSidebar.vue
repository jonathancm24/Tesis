<!--
  Componente: AppSidebar
  
  Sidebar lateral colapsable con navegación principal:
  - Menú de navegación dinámico según rol del usuario
  - Estado colapsado/expandido con persistencia
  - Toggle button para móviles y desktop
  - Responsive y accesible
  
  TODO: Integrar permisos por rol cuando se implemente el sistema de permisos
-->

<template>
  <aside
    class="app-sidebar"
    :class="{ 'is-collapsed': isCollapsed, 'is-open': !isCollapsed, 'is-mobile': isMobile }"
  >
    <!-- Botón para colapsar/expandir el sidebar -->
    <button
      class="sidebar-toggle"
      @click="toggle"
      :aria-label="isCollapsed ? 'Expandir menú' : 'Colapsar menú'"
    >
      <i :class="isCollapsed ? 'fas fa-bars' : 'fas fa-times'"></i>
    </button>

    <!-- Navegación principal -->
    <nav class="sidebar-nav">
      <template v-for="section in visibleSections" :key="section.title">
        <div class="nav-section" v-if="!isCollapsed">
          <span class="nav-section-title">{{ section.title }}</span>
        </div>

        <ul class="nav-list">
          <li v-for="item in section.items" :key="item.to">
            <router-link :to="item.to" class="nav-item" active-class="active">
              <i :class="item.icon"></i>
              <span class="nav-text">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>

        <div class="nav-divider" v-if="!isCollapsed"></div>
      </template>
    </nav>

    <!-- Footer del sidebar con información adicional -->
    <div class="sidebar-footer" v-if="!isCollapsed">
      <div class="footer-info">
        <i class="fas fa-university"></i>
        <span>ULEAM v2.0</span>
      </div>
    </div>
  </aside>

  <!-- Overlay para cerrar el sidebar en móviles -->
  <div v-if="isMobile && !isCollapsed" class="sidebar-overlay" @click="collapse"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSidebar } from '@/composables/useSidebar'
import { menuSections } from '@/Config/menu'
import { usePermissions } from '@/composables/usePermissions'

// Composable para manejar el estado del sidebar
const { isCollapsed, isMobile, toggle, collapse } = useSidebar()

// Helpers de permisos para filtrar el menu
const { hasAnyRole } = usePermissions()

const visibleSections = computed(() => {
  return menuSections
    .map((section) => {
      const items = section.items.filter((item) => {
        if (!item.roles || item.roles.length === 0) return true
        return hasAnyRole(item.roles)
      })
      return { ...section, items }
    })
    .filter((section) => section.items.length > 0)
})
</script>

<style scoped>
/* ========== SIDEBAR PRINCIPAL ========== */
.app-sidebar {
  position: fixed;
  left: 0;
  top: 56px; /* Altura del header */
  bottom: 0;
  width: 240px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 90;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Estado colapsado */
.app-sidebar.is-collapsed {
  width: 60px;
}

/* ========== BOTON DE TOGGLE ========== */
.sidebar-toggle {
  position: absolute;
  top: 0.75rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  z-index: 10;
}

/* Cuando esta colapsado, centrar el boton */
.app-sidebar.is-collapsed .sidebar-toggle {
  right: 50%;
  transform: translateX(50%);
}

.sidebar-toggle:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.sidebar-toggle:active {
  transform: scale(0.95);
}

.app-sidebar.is-collapsed .sidebar-toggle:active {
  transform: translateX(50%) scale(0.95);
}

.sidebar-toggle i {
  font-size: 0.875rem;
}

/* ========== NAVEGACIÓN ========== */
.sidebar-nav {
  flex: 1;
  padding: 3rem 0.5rem 1rem;
}

.nav-section {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 0.25rem;
}

/* Items del menú */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-base);
  position: relative;
}

.nav-item:hover {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-primary);
  color: white;
}

.nav-item i {
  font-size: 1.125rem;
  min-width: 20px;
  text-align: center;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ocultar texto cuando está colapsado */
.app-sidebar.is-collapsed .nav-text {
  display: none;
}

.app-sidebar.is-collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

/* Divider */
.nav-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 1rem 0.5rem;
}

/* ========== FOOTER DEL SIDEBAR ========== */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-border-light);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.footer-info i {
  color: var(--color-primary);
}

/* ========== OVERLAY PARA MÓVILES ========== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 85;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ========== RESPONSIVE - TABLETS Y MÓVILES ========== */
@media (max-width: 1024px) {
  .app-sidebar {
    top: 0;
    height: 100vh;
    width: 60px;
  }

  .app-sidebar.is-open {
    width: 220px;
    box-shadow: var(--shadow-lg, 0 10px 40px rgba(0, 0, 0, 0.15));
    z-index: 95;
  }

  .sidebar-toggle {
    width: 28px;
    height: 28px;
  }

  .sidebar-nav {
    padding-top: 3.5rem;
  }

  .sidebar-overlay {
    left: 60px;
    top: 0;
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    width: 56px;
  }

  .app-sidebar.is-open {
    width: 200px;
    max-width: calc(100vw - 56px);
  }

  .sidebar-toggle {
    width: 26px;
    height: 26px;
  }

  .sidebar-toggle i {
    font-size: 0.75rem;
  }

  .sidebar-nav {
    padding: 3rem 0.25rem 1rem;
  }

  .nav-item {
    padding: 0.6rem 0.5rem;
  }

  .nav-item i {
    font-size: 1rem;
    min-width: 24px;
  }

  .sidebar-overlay {
    left: 56px;
  }
}

@media (max-width: 480px) {
  .app-sidebar {
    width: 52px;
  }

  .app-sidebar.is-open {
    width: calc(100vw - 52px);
    max-width: 200px;
  }

  .sidebar-toggle {
    width: 24px;
    height: 24px;
  }

  .sidebar-toggle i {
    font-size: 0.7rem;
  }

  .sidebar-overlay {
    left: 52px;
  }

  .nav-item {
    padding: 0.5rem 0.4rem;
  }

  .nav-item i {
    font-size: 0.95rem;
    min-width: 20px;
  }
}

/* ========== SCROLLBAR PERSONALIZADO ========== */
.app-sidebar::-webkit-scrollbar {
  width: 6px;
}

.app-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.app-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.app-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-dark);
}
</style>
