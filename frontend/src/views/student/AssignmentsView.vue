<!-- src/views/student/AssignmentsView.vue -->
<template>
  <div class="assignments">
    <h1>Tareas del Estudiante</h1>
    <p class="text-muted">Visualiza, entrega y sigue el progreso de tus tareas.</p>

    <div class="assignments-grid">
      <div
        v-for="a in assignments"
        :key="a.id"
        class="assignment-card"
      >
        <div class="card-header">
          <h4>{{ a.title }}</h4>
          <span :class="['badge', badgeClass(a.status)]">{{ a.status }}</span>
        </div>
        <p class="subject"><strong>Materia:</strong> {{ a.subject }}</p>
        <p class="professor"><strong>Profesor:</strong> {{ a.professor }}</p>
        <p class="desc">{{ a.description }}</p>
        <p class="deadline"><strong>Fecha límite:</strong> {{ a.deadline }}</p>
        
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: a.progress + '%' }"></div>
        </div>
        <span class="progress-label">{{ a.progress }}%</span>

        <div class="files" v-if="a.files.length">
          <p class="mt-2 mb-1"><strong>Archivos entregados:</strong></p>
          <ul>
            <li v-for="(file, i) in a.files" :key="i">
              <a :href="file" target="_blank">{{ file.split('/').pop() }}</a>
            </li>
          </ul>
        </div>

        <div class="actions mt-3">
          <input
            type="file"
            ref="fileInput"
            @change="onFileChange($event, a.id)"
          />
          <button
            class="btn-submit"
            @click="markInProgress(a.id)"
            v-if="a.status === 'Pendiente'"
          >
            Empezar tarea
          </button>
          <button
            class="btn-submit"
            @click="markComplete(a.id)"
            v-if="a.status === 'En progreso'"
          >
            Marcar como completada
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { assignmentsMock, type Assignment } from '../../mocks/student/assignments';

const assignments = ref<Assignment[]>([...assignmentsMock]);

function badgeClass(status: string) {
  return {
    'badge-yellow': status === 'Pendiente',
    'badge-blue': status === 'En progreso',
    'badge-green': status === 'Completada'
  };
}

function onFileChange(event: Event, id: number) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    const found = assignments.value.find(a => a.id === id);
    if (found) {
      found.files.push(`uploads/${file.name}`);
      found.progress = 50;
      found.status = 'En progreso';
      alert(`Archivo "${file.name}" subido para la tarea "${found.title}"`);
    }
  }
}

function markInProgress(id: number) {
  const found = assignments.value.find(a => a.id === id);
  if (found) {
    found.status = 'En progreso';
    found.progress = 25;
  }
}

function markComplete(id: number) {
  const found = assignments.value.find(a => a.id === id);
  if (found) {
    found.status = 'Completada';
    found.progress = 100;
    alert(`¡Tarea "${found.title}" marcada como completada!`);
  }
}
</script>

<style scoped src="@/assets/css/pages/student/Assignments.css"></style>
