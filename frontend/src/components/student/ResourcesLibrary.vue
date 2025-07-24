<!-- src/components/student/ResourcesLibrary.vue -->

<template>
  <div class="resources-library">
    <div v-if="!items.length" class="text-muted">No hay recursos disponibles.</div>
    <div class="row g-3">
      <div v-for="r in items" :key="r.url" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title">{{ r.title }}</h6>
            <p class="flex-grow-1 small text-muted">{{ r.description }}</p>
            <a :href="r.url" target="_blank" class="btn btn-primary mt-auto">
              <i class="fas fa-external-link-alt me-1"></i> Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Resource {
  title: string
  description: string
  url: string
}

const props = defineProps<{ resources: Resource[] }>()
const items = props.resources
</script>

<style scoped>
.card-title {
  font-weight: 600;
}
</style>
