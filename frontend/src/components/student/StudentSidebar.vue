<!-- src/components/student/StudentSidebar.vue -->

<template>
  <nav
    class="sidebar d-flex flex-column p-3 text-white"
    :style="{ backgroundColor: 'var(--color-primary)' }"
  >
    <a href="#" class="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-white text-decoration-none">
      <i class="fas fa-user-graduate fa-2x me-2"></i>
      <span class="fs-4">Estudiante</span>
    </a>
    <hr class="text-white" />

    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item" v-for="link in links" :key="link.name">
        <router-link
          :to="link.to"
          class="nav-link text-white"
          active-class="active"
          exact
        >
          <i :class="link.icon + ' me-2'"></i>{{ link.name }}
        </router-link>
      </li>
    </ul>

    <hr class="text-white mt-auto" />
    <div>
      <small class="text-white">© 2025 OdontoEdu</small>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

interface Link {
  name: string;
  to: RouteLocationRaw;
  icon: string;
}

const links = ref<Link[]>([
  { name: 'Dashboard', to: '/student',             icon: 'fas fa-tachometer-alt' },
  { name: 'Historias Clínicas', to: '/student/histories', icon: 'fas fa-notes-medical' },
  { name: 'Casos Clínicos',    to: '/student/cases',     icon: 'fas fa-file-medical' },
  { name: 'Tareas',            to: '/student/assignments', icon: 'fas fa-tasks' },
  { name: 'Odontograma',       to: '/student/odontogram',  icon: 'fas fa-tooth' },
  { name: 'Mensajería',        to: '/student/messages',    icon: 'fas fa-envelope' }
]);
</script>

<style scoped>
.sidebar {
  width: 240px;
}
.nav-link {
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
}
.nav-link.active {
  background-color: var(--color-info);
}
</style>
