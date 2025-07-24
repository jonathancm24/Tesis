<!-- Ruta: /admin/*  - Archivo: src/components/layouts/AdminLayout.vue -->
<template>
  <div :class="['admin-layout', { 'dark-mode': darkMode }]">
    <!-- Contenedor principal -->
    <div class="main-container d-flex">
      <!-- Sidebar -->
      <aside class="sidebar">
        <Sidebar
          :items="menuItems"
          :logoSrc="logoSrc"
          title="DentApp Admin"
          subtitle="Panel Administrativo"
        />
      </aside>

      <!-- Contenido -->
      <main class="content flex-fill p-4">
        <!-- Toolbar con toggle de tema -->
        <div class="admin-toolbar d-flex justify-content-between align-items-center mb-4">
          <div class="toolbar-left d-flex align-items-center">
            <i class="fas fa-user-shield me-2"></i>
            <h4 class="mb-0">Bienvenido, Administrador</h4>
          </div>
          <div class="toolbar-right d-flex align-items-center">
            <button
              class="btn btn-sm btn-outline-secondary me-2"
              @click="toggleDarkMode"
              :aria-label="darkMode ? 'Modo claro' : 'Modo oscuro'"
            >
              <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
            <button @click="handleLogout" class="btn btn-sm btn-outline-danger">
              <i class="fas fa-sign-out-alt me-1"></i> Cerrar sesión
            </button>
          </div>
        </div>

        <!-- Vista principal -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/common/Sidebar.vue'
import logoSrc from '@/assets/img/descarga.png'

const router = useRouter()
const darkMode = ref(false)

function handleLogout() {
  localStorage.removeItem('user')
  router.push({ name: 'Login' })
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
}

const menuItems = [
  { name: 'HomeAdmin',     label: 'Inicio',    icon: 'fas fa-home',    to: { name: 'HomeAdmin' } },
  { name: 'AdminUsers',    label: 'Usuarios',  icon: 'fas fa-users',   to: { name: 'AdminUsers' } },
  { name: 'AdminSettings', label: 'Ajustes',   icon: 'fas fa-cog',     to: { name: 'AdminSettings' } }
]
</script>

<style scoped>
/* Variables de tema */
.admin-layout {
  --header-bg: #ffffff;
  --header-text: #212529;
  --sidebar-bg: #f8f9fa;
  --sidebar-text: #343a40;
  --content-bg: #ffffff;
  --border-color: #dee2e6;
  --link-hover-bg: #e9ecef;
  color: var(--header-text);
  background: var(--content-bg);
  transition: background 0.3s, color 0.3s;
}
.admin-layout.dark-mode {
  --header-bg: #343a40;
  --header-text: #f8f9fa;
  --sidebar-bg: #212529;
  --sidebar-text: #f8f9fa;
  --content-bg: #1c1e21;
  --border-color: #2e2e4f;
  --link-hover-bg: #2e2e4f;
}

/* Layout */
.main-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  flex: 0 0 240px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid var(--border-color);
  padding-top: 1rem;
  transition: background 0.3s, color 0.3s;
}

/* Content */
.content {
  flex: 1;
  background: var(--content-bg);
  overflow-y: auto;
  padding: 1rem 1.5rem;
  transition: background 0.3s;
}

/* Toolbar */
.admin-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}
.admin-toolbar .toolbar-left h4 {
  margin: 0;
}
.admin-toolbar .btn {
  transition: background 0.2s, color 0.2s;
}

/* Toggle y logout */
.btn-outline-secondary {
  color: var(--header-text);
  border-color: var(--border-color);
}
.btn-outline-secondary:hover {
  background: var(--link-hover-bg);
}
.btn-outline-danger {
  border-color: #dc3545;
}
.btn-outline-danger:hover {
  background: #dc3545;
  color: #fff;
}
</style>
