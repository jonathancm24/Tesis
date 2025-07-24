<!-- src/components/common/Header.vue -->
<template>
  <header class="admin-header d-flex align-items-center justify-content-between px-3">
    <!-- Logo + Breadcrumb / Page Info -->
    <div class="d-flex align-items-center">
      <img src="../../assets/img/descarga.png" alt="Logo" class="logo me-3" />
      <div>
        <h1 class="page-title mb-0">{{ pageTitle }}</h1>
        <small class="text-muted">{{ pagePath }}</small>
      </div>
    </div>

    <!-- User Menu -->
    <div class="user-menu dropdown d-flex align-items-center">
      <img :src="avatar" alt="Avatar" class="avatar rounded-circle me-2" />
      <span class="me-3">{{ userName }}</span>
      <button
        class="btn btn-outline-secondary btn-sm dropdown-toggle p-1"
        type="button"
        id="userMenuBtn"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      ></button>
      <ul
        class="dropdown-menu dropdown-menu-end"
        aria-labelledby="userMenuBtn"
      >
        <li>
          <router-link to="/professor/profile" class="dropdown-item">Perfil</router-link>
        </li>
        <li><router-link to="/admin/settings" class="dropdown-item">Ajustes</router-link></li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <button class="dropdown-item text-danger" @click="logout">
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Import your avatar asset as an ES module
import avatarImg from '../../assets/img/Profesor.jpg'

// (Replace with real reactive/store values in your app)
const userName = 'Admin Uno'
const avatar = avatarImg

const route = useRoute()
const router = useRouter()

// Derive current page title & path
const pageTitle = computed(() => (route.name as string) || '')
const pagePath = computed(() => route.path)

function logout() {
  localStorage.removeItem('user')
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
  height: 60px;
}

.logo {
  height: 40px;
  object-fit: contain;
}

.page-title {
  font-size: 1.25rem;
  color: #2c3e50;
  font-weight: 500;
}

.avatar {
  width: 36px;
  height: 36px;
  object-fit: cover;
}

.user-menu .dropdown-toggle {
  border: none;
  background: transparent;
  padding: 0;
}
</style>
