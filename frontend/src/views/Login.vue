<!-- src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <!-- PANEL IZQUIERDO -->
      <div class="panel left-panel">
        <img src="@/assets/img/descarga.png" alt="Logo ULEAM" class="logo" />
        <h2>Facultad de Odontología ULEAM</h2>
        <p>Bienvenido a la plataforma de gestión clínica.</p>
      </div>

      <!-- PANEL DERECHO -->
      <div class="panel right-panel">
        <form @submit.prevent="onSubmit" class="login-form">
          <h3>Iniciar Sesión</h3>
          <div class="input-group">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <input
              v-model="email"
              type="email"
              placeholder="Correo electrónico"
              required
              :disabled="loading"
              aria-label="Correo electrónico"
            />
          </div>
          <div class="input-group">
            <i class="fas fa-lock" aria-hidden="true"></i>
            <input
              v-model="password"
              type="password"
              placeholder="Contraseña"
              required
              :disabled="loading"
              aria-label="Contraseña"
            />
          </div>
          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="!loading">Entrar</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Cargando...</span>
          </button>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginMock } from '@/mocks/admin/api'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

async function onSubmit() {
  if (loading.value) return
  loading.value = true

  try {
    const user = await loginMock(email.value.trim(), password.value)
    localStorage.setItem('user', JSON.stringify(user))

    switch (user.role) {
      case 'admin':
        router.push({ name: 'HomeAdmin' })
        break
      case 'profesor':
        router.push({ name: 'ProfessorDashboard' })
        break
      case 'secretario':
        router.push({ name: 'PatientManagement' })
        break
      case 'estudiante':
        router.push({ name: 'StudentDashboard' })
        break
      default:
        router.push({ name: 'Login' })
    }
  } catch (err: any) {
    alert(err.message || 'Error al iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #00695c 0%, #004d40 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .panel {
    padding: 2rem;
  }

  .left-panel {
    order: 2;
    text-align: center;
  }

  .right-panel {
    order: 1;
  }

  .logo {
    width: 80px;
    margin-bottom: 1rem;
  }

  .login-form {
    width: 100%;
  }
}

.panel {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-panel {
  background-color: #004d40;
  color: white;
  text-align: center;
}

.right-panel {
  background-color: #f9f9f9;
}

/* Logo */
.logo {
  width: 120px;
  height: auto;
  margin: 0 auto 1.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.login-form {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.login-form h3 {
  color: #004d40;
  margin-bottom: 1.5rem;
}

.input-group {
  position: relative;
  margin-bottom: 1.25rem;
}

.input-group i {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #888;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-group input:focus {
  border-color: #00796b;
  box-shadow: 0 0 0 0.2rem rgba(0, 121, 107, 0.25);
  outline: none;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-login:hover:not(:disabled) {
  background: #004d40;
}

.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.forgot-link {
  display: block;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #00796b;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>
