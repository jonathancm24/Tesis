<!-- src/views/HomePaciente.vue -->
<template>
  <div class="container mt-5">
    <h1 class="text-info">Panel Paciente</h1>
    <p>Bienvenido, {{ userName }}.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomePaciente',
  setup() {
    const stored = localStorage.getItem('user') || '{}'
    const user = JSON.parse(stored)
    const userName = user.name || 'Paciente'
    return { userName }
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>