<!--
  Vista: Dashboard
  
  Página principal del sistema después del login.
  Muestra tarjetas de bienvenida e información del usuario actual.
  
  NOTA: El header y sidebar son manejados por AppLayout,
  esta vista solo contiene el contenido específico del dashboard.
-->

<template>
  <div class="dashboard-page">
    <!-- Contenido principal del dashboard -->
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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

// Store de autenticación para obtener datos del usuario
const authStore = useAuthStore()
</script>

<style scoped>
/* ========== PÁGINA PRINCIPAL ========== */
.dashboard-page {
  padding: 2rem clamp(1.5rem, 3vw, 3rem);
  min-height: 100vh;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-container h1 {
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
}

/* ========== TARJETAS DE BIENVENIDA ========== */
.welcome-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  .dashboard-page {
    padding: 1.5rem 1rem;
  }

  .welcome-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
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