<template>
  <div class="login-page">
    <!-- Selector de tema -->
    <div class="theme-toggle">
      <button
        @click="handleThemeToggle"
        class="theme-btn"
        :title="themeLabel"
        aria-label="Alternar tema"
      >
        <i :class="themeIcon"></i>
      </button>
    </div>

    <div class="login-container">
      <div class="login-panel">
        <!-- Panel izquierdo - Branding -->
        <div class="left-panel">
          <div class="logo-section">
            <div class="logo-container">
              <!-- Logo ULEAM real -->
              <img src="@/assets/images/LOGO-ULEAM.png" alt="Logo ULEAM" class="uleam-logo-img" />
              <div class="brand-text">
              </div>
            </div>
            <div class="faculty-info">
              <h2>Facultad de Odontología ULEAM</h2>
              <p>Bienvenido a la plataforma de gestión clínica.</p>
            </div>
          </div>
        </div>

        <!-- Panel derecho - Formulario -->
        <div class="right-panel">
          <div class="login-form">
            <h3>Iniciar Sesión</h3>
            
            <!-- Mensaje de error -->
            <div v-if="authStore.error" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ authStore.error }}</span>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleLogin" novalidate>
              <!-- Campo Email -->
              <div class="input-group">
                <i class="fas fa-envelope"></i>
                <input
                  v-model="email"
                  type="email"
                  placeholder="Correo electrónico"
                  required
                  :disabled="authStore.isLoading"
                  @input="clearError"
                />
              </div>

              <!-- Campo Contraseña -->
              <div class="input-group">
                <i class="fas fa-lock"></i>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Contraseña"
                  required
                  :disabled="authStore.isLoading"
                  @input="clearError"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :disabled="authStore.isLoading"
                  tabindex="-1"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>

              <!-- Botón de Login -->
              <button
                type="submit"
                class="login-btn"
                :disabled="authStore.isLoading || !isFormValid"
              >
                <span v-if="!authStore.isLoading">
                  Entrar
                </span>
                <span v-else class="loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  Iniciando...
                </span>
              </button>
            </form>

            <!-- Enlaces adicionales -->
            <div class="login-footer">
              <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Estado del formulario
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isDarkMode = ref(false)

// Validación del formulario
const isFormValid = computed(() => {
  return email.value.length > 0 && password.value.length >= 6
})

// Propiedades del tema
const themeLabel = computed(() => {
  return isDarkMode.value ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
})

const themeIcon = computed(() => {
  return isDarkMode.value ? 'fas fa-sun' : 'fas fa-moon'
})

/**
 * Manejar el cambio de tema
 */
const handleThemeToggle = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

/**
 * Manejar el envío del formulario de login
 */
const handleLogin = async () => {
  if (!isFormValid.value) return

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })

    router.push('/dashboard')
  } catch (error) {
    console.error('Error en login:', error)
  }
}

/**
 * Limpiar errores cuando el usuario empiece a escribir
 */
const clearError = () => {
  authStore.clearError()
}

/**
 * Manejar el enlace de contraseña olvidada
 */
const handleForgotPassword = () => {
  alert('Funcionalidad de recuperación de contraseña pendiente de implementar')
}

// Inicializar el componente
onMounted(() => {
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDarkMode.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)

  // Inicializar autenticación
  authStore.initializeAuth()

  // Si ya está autenticado, redirigir
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
@import '@/assets/styles/login/login.css';
</style>
