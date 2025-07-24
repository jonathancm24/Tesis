<!-- src/views/HomeSecretario.vue -->
<template>
  <div class="container mt-5">
    <h1 class="text-danger">Panel Secretario</h1>
    <p>¡Buen día, {{ userName }}!</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeSecretario',
  setup() {
    const stored = localStorage.getItem('user') || '{}'
    const user = JSON.parse(stored)
    const userName = user.name || 'Secretario'
    return { userName }
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>

