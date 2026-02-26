<template>
  <div class="historial-casos-widget">
    <div class="widget-header">
      <h3>📁 Historial de Casos</h3>
      <span v-if="casos.length > 0" class="count-badge">{{ casos.length }}</span>
    </div>

    <!-- Lista de casos -->
    <div v-if="casos.length > 0" class="casos-list">
      <div
        v-for="caso in casosRecientes"
        :key="caso.id"
        class="caso-item"
        @click="selectCaso(caso)"
      >
        <div class="caso-header">
          <span class="especialidad">{{ caso.especialidad.nombre }}</span>
          <span :class="['estado-badge', `estado-${caso.estado.toLowerCase()}`]">
            {{ getEstadoLabel(caso.estado) }}
          </span>
        </div>
        <div class="caso-meta">
          <span class="fecha">
            {{ formatFecha(caso.fechaCreacion) }}
          </span>
          <span v-if="caso.profesor" class="profesor">
            Dra. {{ caso.profesor.apellido }}
          </span>
        </div>
      </div>

      <!-- Link para ver todo el historial (opcional) -->
      <button v-if="casos.length > 3" class="btn-ver-mas">
        Ver historial completo →
      </button>
    </div>

    <!-- Estado vacío -->
    <div v-else class="estado-vacio">
      <span class="icon">📋</span>
      <p>No hay casos clínicos aún</p>
      <span class="hint">Los nuevos casos aparecerán aquí</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CasoClinicoListItem, EstadoCasoClinico } from '@/types/casosClinicos.types'

interface Props {
  pacienteId: number
  casos: CasoClinicoListItem[]
}

interface Emits {
  (e: 'select-caso', casoId: number): void
  (e: 'open-historial-completo'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Mostrar solo los 3 casos más recientes
const casosRecientes = computed(() => {
  return props.casos.slice(0, 3)
})

const getEstadoLabel = (estado: EstadoCasoClinico): string => {
  const labels: Record<EstadoCasoClinico, string> = {
    'EN_REVISION': '👀 Revisión',
    'EN_TRATAMIENTO': '🔧 Tratamiento',
    'FINALIZADO': '✅ Finalizado',
    'APROBADO': '✔️ Aprobado',
    'RECHAZADO': '❌ Rechazado'
  }
  return labels[estado] || estado
}

const formatFecha = (fecha: Date | string): string => {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const selectCaso = (caso: CasoClinicoListItem) => {
  emit('select-caso', caso.id)
}
</script>

<style scoped>
.historial-casos-widget {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.widget-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.count-badge {
  background-color: var(--color-primary);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
}

.casos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.caso-item {
  padding: 0.875rem;
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.caso-item:hover {
  background-color: #f9fafb;
  border-color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.caso-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.especialidad {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.estado-badge {
  background-color: var(--color-background-tertiary);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.estado-en_revision {
  background-color: color-mix(in srgb, #3b82f6 15%, transparent);
  color: #3b82f6;
}

.estado-en_tratamiento {
  background-color: color-mix(in srgb, #3b82f6 15%, transparent);
  color: #3b82f6;
}

.estado-finalizado {
  background-color: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
}

.estado-aprobado {
  background-color: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
}

.estado-rechazado {
  background-color: color-mix(in srgb, var(--color-error) 15%, transparent);
  color: var(--color-error);
}

.caso-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.fecha {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.profesor {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-ver-mas {
  background: none;
  border: none;
  color: var(--color-primary);
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.btn-ver-mas:hover {
  background-color: #eff6ff;
  text-decoration: underline;
}

.estado-vacio {
  text-align: center;
  padding: 2rem 1rem;
  background-color: var(--color-background-secondary);
  border-radius: 0.75rem;
  border: 2px dashed var(--color-border);
}

.icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.estado-vacio p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.hint {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
