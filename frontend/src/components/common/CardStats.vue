<template>
  <div class="col-12 col-sm-6 col-lg-3">
    <div :class="['card text-white', `bg-${bg}`, 'shadow-sm mb-3']">
      <div class="card-body d-flex align-items-center">
        <i :class="[icon, 'fa-2x', 'me-3']"></i>
        <div>
          <div class="fs-4">{{ value }}</div>
          <small>{{ label }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: number;
  bg: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}>();
</script>

<style scoped>
.card {
  border-radius: var(--radius-lg);
}
</style>
