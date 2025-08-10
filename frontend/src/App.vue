<!-- src/App.vue -->
<template>
  <div id="app">
    <router-view/>
    <!-- Contenedor de notificaciones toast -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '@/components/common/ToastContainer.vue';
</script>

<style>
/* Reset y variables CSS reales */
@import "@/assets/css/globals/reset.css";
@import "@/assets/css/globals/variables.css";

/* Carga Bootstrap en main.ts, no es necesario repetirlo aquí */

/* Si tienes reglas globales extra, añádelas bajo este comentario */
html, body {
  height: 100%;
  margin: 0;
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
