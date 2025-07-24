<!-- Ruta: /admin  - Archivo: src/views/admin/HomeAdmin.vue -->
<template>
  <section class="home-admin container py-4">
    <h1 class="mb-4 text-center text-primary">Panel de Administración</h1>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
      <div class="col" v-for="stat in statsList" :key="stat.label">
        <div class="card admin-stat-card h-100 shadow-sm">
          <div
            :class="['card-header', stat.bgClass, 'text-white', 'd-flex', 'align-items-center']"
          >
            <i :class="[stat.icon, 'me-2', 'stat-icon']"></i>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
          <div class="card-body d-flex justify-content-center align-items-end">
            <h2 class="stat-number mb-0">{{ stat.value }}</h2>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// Importar desde el mock específico de admin:
import type { Stats } from '@/mocks/admin/api'
import { fetchStatsMock } from '@/mocks/admin/api'

const stats = ref<Stats | null>(null)

onMounted(async () => {
  stats.value = await fetchStatsMock()
})

const statsList = computed(() => [
  {
    label: 'Usuarios',
    value: stats.value?.users ?? 0,
    icon: 'fas fa-users',
    bgClass: 'bg-primary'
  },
  {
    label: 'Citas',
    value: stats.value?.appointments ?? 0,
    icon: 'fas fa-calendar-check',
    bgClass: 'bg-success'
  },
  {
    label: 'Pacientes',
    value: stats.value?.patients ?? 0,
    icon: 'fas fa-user-injured',
    bgClass: 'bg-info text-dark'
  },
  {
    label: 'Mensajes',
    value: stats.value?.messages ?? 0,
    icon: 'fas fa-comments',
    bgClass: 'bg-warning text-dark'
  }
])
</script>

<style src="@/assets/css/pages/admin/HomeAdmin.css" scoped></style>
