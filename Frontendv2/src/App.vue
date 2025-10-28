<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

// Inicializar el sistema de temas al cargar la aplicación
useTheme()
</script>

<template>
  <!-- 
    App.vue simplificado - solo contiene el RouterView 
    El layout y navegación se manejan en cada vista individual
  -->
  <RouterView />
</template>

<style>
/* Estilos globales básicos ya están en global.css */
</style>

