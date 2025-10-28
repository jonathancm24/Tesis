<!-- Vista 404 - Página no encontrada -->
<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">Página no encontrada</h2>
      
      <p class="error-message">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      
      <div class="error-actions">
        <button @click="goHome" class="btn-primary">
          <i class="fas fa-home"></i>
          Ir al inicio
        </button>
        
        <button @click="goBack" class="btn-secondary">
          <i class="fas fa-arrow-left"></i>
          Volver atrás
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

/**
 * Ir a la página de inicio apropiada según el estado de autenticación
 */
const goHome = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

/**
 * Volver a la página anterior
 */
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: 2rem;
}

.not-found-container {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 4rem;
  color: var(--color-warning);
  margin-bottom: 1rem;
}

.error-title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
}

.error-subtitle {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  margin: 1rem 0;
  font-weight: 600;
}

.error-message {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-secondary);
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .error-title {
    font-size: 4rem;
  }
  
  .error-subtitle {
    font-size: 1.25rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 200px;
  }
}
</style>