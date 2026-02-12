<!--
  Componente: AppHeader
  
  Header reutilizable de la aplicación con:
  - Logo y branding institucional (CONFIGURABLE - ver sección BRANDING)
  - Selector de tema claro/oscuro
  - Información del usuario actual
  - Botón de cerrar sesión
  
  Responsive: Se adapta a móviles colapsando elementos
-->

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'

// Store de autenticación para obtener datos del usuario
const authStore = useAuthStore()

// Composable para manejar temas
const { toggleTheme, isDark } = useTheme()

// Router para navegación
const router = useRouter()

/**
 * Manejar cierre de sesión
 * Limpia el store y redirige al login
 */
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <!-- ========== SECCIÓN DE BRANDING - CONFIGURABLE ========== -->
      <!--
        Esta sección contiene el logo y nombre del sistema.
        PERSONALIZACIÓN:
        1. Cambiar el ícono: modifica la clase del <i> (ej: fa-hospital, fa-clinic-medical)
        2. Cambiar el texto: modifica el contenido del <span>
        3. Agregar logo imagen: reemplaza el <i> con <img src="ruta-logo.png" alt="Logo">
      -->
      <div class="logo-section">
        <i class="fas fa-tooth"></i>
        <span class="logo-text">Sistema Odontológico</span>
      </div>
      <!-- ========== FIN SECCIÓN CONFIGURABLE ========== -->

      <!-- Acciones del header (tema, usuario, logout) -->
      <div class="header-actions">
        <!-- Botón para cambiar tema (claro/oscuro) -->
        <button
          @click="toggleTheme"
          class="theme-btn"
          :title="isDark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
          aria-label="Cambiar tema"
        >
          <i :class="isDark() ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>

        <!-- Información del usuario actual -->
        <div class="user-info" v-if="authStore.user">
          <span class="user-name">{{ authStore.fullName }}</span>
          <span class="user-role">{{ authStore.userRole }}</span>
        </div>

        <!-- Botón para cerrar sesión -->
        <button @click="handleLogout" class="logout-btn" aria-label="Cerrar sesión">
          <i class="fas fa-sign-out-alt"></i>
          <span class="logout-text">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ========== HEADER PRINCIPAL ========== */
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
}

.header-content {
  height: 100%;
  width: 100%;
  max-width: 100%;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* ========== LOGO Y BRANDING ========== */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
  user-select: none;
  flex-shrink: 0;
}

.logo-section i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========== ACCIONES DEL HEADER ========== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-base);
  flex-shrink: 0;
}

.theme-btn:hover {
  background: var(--color-border);
  transform: scale(1.05);
}

.theme-btn i {
  font-size: 1.125rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
  min-width: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.user-role {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition-base);
  flex-shrink: 0;
}

.logout-btn:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

/* ========== RESPONSIVE - TABLETS Y MÓVILES ========== */
@media (max-width: 1024px) {
  .app-header {
    left: 60px;
    width: calc(100% - 60px);
  }

  .header-content {
    padding: 0 0.75rem;
  }

  .header-actions {
    gap: 0.75rem;
  }

  .user-name {
    max-width: 120px;
  }
}

@media (max-width: 768px) {
  .app-header {
    height: 52px;
    left: 56px;
    width: calc(100% - 56px);
  }

  .logo-text,
  .user-info,
  .logout-text {
    display: none;
  }

  .logo-section i {
    font-size: 1.25rem;
  }

  .logout-btn {
    padding: 0.5rem;
    width: 36px;
    height: 36px;
    justify-content: center;
  }

  .theme-btn {
    width: 36px;
    height: 36px;
  }

  .header-actions {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    left: 52px;
    width: calc(100% - 52px);
  }

  .header-content {
    gap: 0.375rem;
    padding: 0 0.5rem;
  }

  .logo-section {
    font-size: 0.9rem;
  }

  .theme-btn,
  .logout-btn {
    width: 32px;
    height: 32px;
  }

  .theme-btn i,
  .logout-btn i {
    font-size: 1rem;
  }
}
</style>
