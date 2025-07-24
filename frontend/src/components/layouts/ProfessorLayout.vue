<!-- src/components/layouts/ProfessorLayout.vue -->
<template>
  <div class="professor-layout d-flex">
    <!-- Sidebar específico para el profesor -->
    <Sidebar role="profesor" />

    <!-- Contenedor principal: Header, rutas y Footer -->
    <div class="main flex-grow-1 d-flex flex-column">
      <Header role="profesor" />

      <main class="content flex-grow-1 p-4 overflow-auto">
        <!-- Aquí se renderizan las vistas hijas -->
        <router-view />
      </main>

      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
// Importa los componentes globales de layout usando rutas relativas
import Sidebar from '@/components/common/Sidebar.vue'
import Header  from '@/components/common/Header.vue'
import Footer  from '@/components/common/Footer.vue'
</script>

<style scoped>
.professor-layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}

.content {
  background-color: var(--color-light);
}

/* Personalizaciones específicas para el rol profesor */
.professor-layout ::v-deep .navbar {
  background-color: var(--color-primary);
}

.professor-layout ::v-deep .footer {
  background-color: var(--color-secondary);
}
</style>
