<!-- src/views/HomeEstudiante.vue -->
<template>
  <div class="container mt-5">
    <h1 class="text-info">Panel Estudiante</h1>
    <p>Hola, {{ userName }}.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeEstudiante',
  setup() {
    const stored = localStorage.getItem('user') || '{}'
    const user = JSON.parse(stored)
    const userName = user.name || 'Estudiante'
    return { userName }
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
