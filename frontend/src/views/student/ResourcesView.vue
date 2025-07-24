<!-- src/views/student/ResourcesView.vue -->
<template>
  <div class="resources-view">
    <header class="rv-header">
      <h1>Recursos del Estudiante</h1>
      <p class="rv-subtitle">
        Encuentra documentos, guías, formularios y retroalimentaciones subidas por tus profesores.
      </p>
    </header>

    <section class="rv-filters">
      <input
        v-model="searchTerm"
        type="search"
        class="rv-input"
        placeholder="🔍 Buscar por título o materia..."
      />
      <select v-model="typeFilter" class="rv-select">
        <option value="">Todos los tipos</option>
        <option value="PDF">PDF</option>
        <option value="Guía">Guía</option>
        <option value="Retroalimentación">Retroalimentación</option>
        <option value="Formulario">Formulario</option>
      </select>
    </section>

    <section class="rv-grid">
      <article
        v-for="r in filteredResources"
        :key="r.id"
        class="rv-card"
      >
        <div class="rv-card-body">
          <h2 class="rv-title">{{ r.title }}</h2>
          <p class="rv-meta">
            <span><strong>Materia:</strong> {{ r.subject }}</span><br/>
            <span><strong>Tipo:</strong> {{ r.type }}</span>
          </p>
          <p class="rv-desc">{{ r.description }}</p>
        </div>
        <footer class="rv-card-footer">
          <small class="rv-uploaded">
            Subido por {{ r.uploadedBy }} el {{ r.uploadedAt }}
          </small>
          <a
            :href="r.file"
            target="_blank"
            class="rv-btn"
          >
            Descargar
          </a>
        </footer>
      </article>
      <p v-if="filteredResources.length === 0" class="rv-no-results">
        No se encontraron recursos.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { resourcesMock, type Resource, type ResourceType } from '@/mocks/student/resources';

const searchTerm = ref('');
const typeFilter = ref<ResourceType | ''>('');
const resources = ref<Resource[]>(resourcesMock);

const filteredResources = computed(() =>
  resources.value.filter(r =>
    (r.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
     r.subject.toLowerCase().includes(searchTerm.value.toLowerCase())) &&
    (!typeFilter.value || r.type === typeFilter.value)
  )
);
</script>

<style scoped>
.resources-view {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.rv-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.rv-subtitle {
  color: #666;
  font-size: 0.95rem;
}

.rv-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
}
.rv-input {
  flex: 1 1 250px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.rv-select {
  flex: 0 0 180px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.rv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.rv-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}
.rv-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.rv-card-body {
  padding: 1rem;
  flex-grow: 1;
}
.rv-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
}
.rv-meta {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.75rem;
}
.rv-desc {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.3;
}

.rv-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
}
.rv-uploaded {
  font-size: 0.75rem;
  color: #888;
}
.rv-btn {
  background-color: #0d6efd;
  color: #fff;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}
.rv-btn:hover {
  background-color: #0b5ed7;
}

.rv-no-results {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  font-style: italic;
}
</style>
