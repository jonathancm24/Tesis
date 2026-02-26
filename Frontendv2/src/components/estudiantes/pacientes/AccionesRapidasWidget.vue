<template>
  <div class="acciones-rapidas-widget">
    <div class="widget-header">
      <h3>➕ Acciones Rápidas</h3>
    </div>

    <div class="acciones-grid">
      <!-- Botón: Ver Historial Completo (opcional) -->
      <button 
        class="accion-btn" 
        @click="emitAction('historial-completo')"
        title="Ver todo el historial del paciente"
      >
        <span class="icon">📊</span>
        <span class="label">Historial</span>
      </button>

      <!-- Botón: Nueva Cita -->
      <button 
        class="accion-btn" 
        @click="emitAction('nueva-cita')"
        title="Agendar nueva cita"
      >
        <span class="icon">📅</span>
        <span class="label">Nueva Cita</span>
      </button>

      <!-- Botón: Nuevo Caso Clínico -->
      <button 
        :class="['accion-btn', 'accion-primaria']"
        @click="emitAction('nuevo-caso')"
        title="Crear nuevo caso clínico"
      >
        <span class="icon">🏥</span>
        <span class="label">Nuevo Caso</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EstadoEncuesta } from '@/types/encuestaTamizaje.types'

interface Props {
  pacienteId: number
  puedeCrearCaso: boolean
}

interface Emits {
  (e: 'accion', accion: 'historial-completo' | 'nueva-cita' | 'nuevo-caso'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const emitAction = (accion: 'historial-completo' | 'nueva-cita' | 'nuevo-caso') => {
  emit('accion', accion)
}
</script>

<style scoped>
.acciones-rapidas-widget {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.widget-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.accion-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background-color: var(--color-background-secondary);
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: center;
  min-height: 100px;
}

.accion-btn:hover {
  background-color: #f3f4f6;
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.accion-btn:active {
  transform: translateY(0);
}

.accion-primaria {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  color: white;
}

.accion-primaria:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-dark));
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.icon {
  font-size: 1.5rem;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .acciones-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .acciones-grid {
    grid-template-columns: 1fr;
  }

  .accion-btn {
    min-height: auto;
    padding: 0.875rem 0.5rem;
  }
}
</style>
