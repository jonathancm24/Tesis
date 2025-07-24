<!-- src/components/common/Sidebar.vue -->
<template>
  <nav class="app-sidebar">
    <div class="brand">
      <img :src="logoSrc" alt="Logo" class="brand-logo" />
      <div class="brand-text">
        <h2>{{ title }}</h2>
        <small>{{ subtitle }}</small>
      </div>
    </div>
    <ul class="nav-list">
      <li v-for="item in items" :key="item.name" class="nav-item">
        <RouterLink :to="item.to" class="nav-link" active-class="active">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
    <div class="logout">
      <button @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

// Props que cada layout le pasará
defineProps<{
  title: string
  subtitle?: string
  logoSrc: string
  items: Array<{
    name: string
    label: string
    icon: string
    to: RouteLocationRaw
  }>
}>()

const router = useRouter()
function logout() {
  localStorage.removeItem('user')
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.app-sidebar {
  width: 240px;
  background: #e8f5e9;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-shadow: 2px 0 6px rgba(0,0,0,0.05);
}
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}
.brand-logo {
  width: 40px;
  margin-right: 0.75rem;
}
.brand-text h2 {
  margin: 0;
  color: #2e7d32;
  font-size: 1.2rem;
}
.brand-text small {
  color: #388e3c;
}
.nav-list {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item + .nav-item {
  margin-top: 0.75rem;
}
.nav-link {
  display: flex;
  align-items: center;
  color: #2e7d32;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}
.nav-link i {
  width: 1.25rem;
  text-align: center;
  margin-right: 0.5rem;
}
.nav-link:hover,
.nav-link.active {
  background: #c8e6c9;
}
.logout {
  margin-top: auto;
}
.logout button {
  width: 100%;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #d32f2f;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
}
.logout i {
  margin-right: 0.5rem;
}
.logout button:hover {
  background: rgba(211, 47, 47, 0.1);
  border-radius: 0.25rem;
}
</style>
