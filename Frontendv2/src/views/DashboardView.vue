<!-- Vista temporal de Dashboard para probar la funcionalidad -->
<template>
  <div class="dashboard-page">
    <!-- Header con navegación -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="logo-section">
          <i class="fas fa-tooth"></i>
          <span>Sistema Odontológico</span>
        </div>
        
        <div class="header-actions">
          <!-- Selector de tema -->
          <button
            @click="toggleTheme"
            class="theme-btn"
            :title="isDark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
          >
            <i :class="isDark() ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
          
          <!-- Info del usuario -->
          <div class="user-info">
            <span class="user-name">{{ authStore.fullName }}</span>
            <span class="user-role">{{ authStore.userRole }}</span>
          </div>
          
          <!-- Botón de logout -->
          <button @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="dashboard-main">
      <div class="dashboard-container">
        <h1>¡Bienvenido al Dashboard!</h1>
        
        <div class="welcome-cards">
          <div class="card">
            <div class="card-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="card-content">
              <h3>Autenticación Exitosa</h3>
              <p>Has iniciado sesión correctamente en el sistema.</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-icon">
              <i class="fas fa-palette"></i>
            </div>
            <div class="card-content">
              <h3>Sistema de Temas</h3>
              <p>Puedes alternar entre tema claro y oscuro usando el botón en la esquina.</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="card-content">
              <h3>Código Limpio</h3>
              <p>Esta versión está construida con un enfoque en código limpio y mantenible.</p>
            </div>
          </div>
        </div>

        <!-- Información del usuario actual -->
        <div class="user-details">
          <h2>Información del Usuario</h2>
          <div class="details-grid">
            <div class="detail-item">
              <strong>Nombre:</strong>
              <span>{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</span>
            </div>
            <div class="detail-item">
              <strong>Email:</strong>
              <span>{{ authStore.user?.email }}</span>
            </div>
            <div class="detail-item">
              <strong>Rol:</strong>
              <span>{{ authStore.user?.role?.nombre }}</span>
            </div>
            <div class="detail-item">
              <strong>ID:</strong>
              <span>{{ authStore.user?.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const { toggleTheme, isDark } = useTheme()
const router = useRouter()

/**
 * Manejar cierre de sesión
 */
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--color-background);
}

/* ========== HEADER ========== */
.dashboard-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.logo-section i {
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-primary);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  background: var(--color-background-secondary);
  transform: scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.user-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--color-error);
  color: white;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.logout-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* ========== CONTENIDO PRINCIPAL ========== */
.dashboard-main {
  padding: 2rem;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-container h1 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

/* ========== TARJETAS DE BIENVENIDA ========== */
.welcome-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.card-content h3 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.card-content p {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* ========== DETALLES DEL USUARIO ========== */
.user-details {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.user-details h2 {
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
}

.detail-item strong {
  color: var(--color-text-primary);
}

.detail-item span {
  color: var(--color-text-secondary);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-main {
    padding: 1rem;
  }

  .welcome-cards {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>