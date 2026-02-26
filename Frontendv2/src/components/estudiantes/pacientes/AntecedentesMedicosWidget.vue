<template>
  <div class="antecedentes-widget-container">
    <div class="antecedentes-widget">
      <div class="widget-header">
        <h3>📋 Antecedentes Médicos</h3>
        <span v-if="encuestaEstado?.estado" :class="['status-badge', `status-${encuestaEstado.estado.toLowerCase()}`]">
          {{ getEstadoLabel(encuestaEstado.estado) }}
        </span>
      </div>

      <!-- Estado de completitud -->
      <div v-if="encuestaEstado && encuestaEstado.estado" class="progreso-encuesta">
        <div class="progreso-info">
          <span class="label">Completitud</span>
          <span class="porcentaje">{{ encuestaEstado.porcentaje }}%</span>
        </div>
        <div class="progreso-bar">
          <div 
            class="progreso-fill" 
            :style="{ width: `${encuestaEstado.porcentaje}%` }"
          ></div>
        </div>
        <span class="respuestas-count">
          {{ encuestaEstado.respuestasCompletadas }} de {{ encuestaEstado.totalPreguntas }} preguntas
        </span>
      </div>

      <!-- Estado vacío -->
      <div v-else class="estado-vacio">
        <p>No hay encuesta de tamizaje registrada</p>
      </div>

      <!-- Nota informativa -->
      <div class="nota-encuesta">
        <p v-if="encuestaEstado?.estado === 'PENDIENTE' || !encuestaEstado">
          ℹ️ <strong>Opcional:</strong> Puede completarse ahora o más adelante
        </p>
        <p v-else-if="encuestaEstado?.estado === 'BORRADOR'">
          🔄 <strong>En progreso:</strong> Puede continuarse cuando lo necesites
        </p>
        <p v-else-if="encuestaEstado?.estado === 'COMPLETADA'">
          ✅ <strong>Completada:</strong> Antecedentes médicos registrados
        </p>
      </div>

      <!-- Acción -->
      <div class="widget-actions">
        <button 
          v-if="!encuestaEstado || !encuestaEstado.estado" 
          class="btn btn-primary btn-small" 
          @click="openEncuestaModal"
        >
          ➕ Nueva Encuesta
        </button>
        
        <button 
          v-else-if="encuestaEstado?.estado !== 'COMPLETADA'" 
          class="btn btn-secondary btn-small" 
          @click="openEncuestaModal"
        >
          ✏️ Editar
        </button>
        
        <template v-else>
          <button class="btn btn-secondary btn-small" @click="openEncuestaModal">
            👁️ Ver
          </button>
          <button class="btn btn-primary btn-small" @click="crearNuevaVersion">
            🔄 Nueva Versión
          </button>
        </template>
      </div>
    </div>

    <!-- Modal de Encuesta Tamizaje -->
    <EncuestaTamizajeModal
      :is-open="isOpenModal"
      :paciente-id="pacienteId"
      :genero="genero"
      @update:is-open="isOpenModal = $event"
      @saved="handleEncuestaSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { EncuestaTamizajeModal } from '@/components/estudiantes/EncuestaTamizaje'
import { useEncuestaTamizajeStore } from '@/stores/Estudiantes/encuestaTamizaje'
import type { EstadoEncuesta } from '@/types/encuestaTamizaje.types'

interface Props {
  pacienteId: number
  genero?: string
}

interface Emits {
  (e: 'encuesta-saved'): void
}

const props = withDefaults(defineProps<Props>(), {
  genero: ''
})
const emit = defineEmits<Emits>()
const encuestaTamizajeStore = useEncuestaTamizajeStore()

const isOpenModal = ref(false)
const encuestaEstado = computed(() => {
  return encuestaTamizajeStore.encuestaPacienteActual
})

onMounted(async () => {
  // Cargar solo progreso (más rápido) al montar el componente
  if (props.pacienteId) {
    await encuestaTamizajeStore.cargarProgresoEncuesta(props.pacienteId)
  }
})

// Watch para recargar cuando cambie el paciente
watch(() => props.pacienteId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await encuestaTamizajeStore.cargarProgresoEncuesta(newId)
  }
})

const getEstadoLabel = (estado: EstadoEncuesta): string => {
  const labels: Record<EstadoEncuesta, string> = {
    'PENDIENTE': '⚠️ Pendiente',
    'BORRADOR': '🔄 Borrador',
    'COMPLETADA': '✅ Completada'
  }
  return labels[estado] || estado
}

const openEncuestaModal = () => {
  isOpenModal.value = true
}

const crearNuevaVersion = async () => {
  try {
    await encuestaTamizajeStore.crearNuevaVersion(props.pacienteId)
    isOpenModal.value = true
  } catch (error) {
    console.error('❌ Widget - Error al crear nueva versión:', error)
  }
}

const handleEncuestaSaved = async () => {
  isOpenModal.value = false
  
  // Esperar un momento para que Vue procese la reactividad
  await nextTick()
  
  // Si el estado no se actualizó correctamente, recargar progreso
  if (!encuestaTamizajeStore.encuestaPacienteActual || 
      encuestaTamizajeStore.encuestaPacienteActual.porcentaje === 0) {
    await new Promise(resolve => setTimeout(resolve, 500))
    await encuestaTamizajeStore.cargarProgresoEncuesta(props.pacienteId)
  }
  emit('encuesta-saved')
}
</script>

<style scoped>
.antecedentes-widget {
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

.status-badge {
  background-color: var(--color-background-secondary);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pendiente {
  background-color: #f59e0b;
  color: white;
}

.status-borrador {
  background-color: #3b82f6;
  color: white;
}

.status-completada {
  background-color: #10b981;
  color: white;
}

.progreso-encuesta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-background-secondary);
  border-radius: 0.75rem;
}

.progreso-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progreso-info .label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.progreso-info .porcentaje {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progreso-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.respuestas-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.estado-vacio {
  padding: 1rem;
  text-align: center;
  background-color: var(--color-background-secondary);
  border-radius: 0.75rem;
}

.estado-vacio p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.nota-encuesta {
  padding: 0.75rem;
  background-color: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #92400e;
}

.nota-encuesta p {
  margin: 0;
}

.nota-encuesta strong {
  font-weight: 600;
}

.widget-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}
</style>
