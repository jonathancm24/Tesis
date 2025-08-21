<!-- 
  Modal de confirmación genérico
  Componente reutilizable para confirmar acciones críticas
  @author Sistema de Gestión Clínica
  @version 1.0
-->
<template>
  <div class="modal-overlay" @click="cancelar">
    <div class="modal-container confirmation-modal" @click.stop>
      <div class="modal-header" :class="`header-${tipo}`">
        <div class="modal-icon">
          <i 
            :class="iconoTipo" 
            aria-hidden="true"
          ></i>
        </div>
        <h2 class="modal-title">{{ titulo }}</h2>
      </div>

      <div class="modal-body">
        <p class="confirmation-message">{{ mensaje }}</p>
        
        <!-- Información adicional si se proporciona -->
        <div v-if="detalles" class="confirmation-details">
          <p>{{ detalles }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          type="button"
          @click="cancelar" 
          class="btn btn-secondary"
          :disabled="procesando"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
          {{ textoCancelar }}
        </button>
        
        <button 
          type="button"
          @click="confirmar" 
          :class="`btn btn-${tipo}`"
          :disabled="procesando"
        >
          <i v-if="procesando" class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          <i v-else :class="iconoConfirmar" aria-hidden="true"></i>
          {{ procesando ? 'Procesando...' : textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Props
interface Props {
  titulo: string
  mensaje: string
  detalles?: string
  tipo?: 'danger' | 'warning' | 'info' | 'success'
  textoConfirmar?: string
  textoCancelar?: string
}

const props = withDefaults(defineProps<Props>(), {
  tipo: 'danger',
  textoConfirmar: 'Confirmar',
  textoCancelar: 'Cancelar'
})

// Emits
interface Emits {
  (e: 'confirmar'): void
  (e: 'cancelar'): void
}

const emit = defineEmits<Emits>()

// Estado
const procesando = ref(false)

// Computed properties para iconos según el tipo
const iconoTipo = computed(() => {
  const iconos = {
    danger: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle'
  }
  return iconos[props.tipo]
})

const iconoConfirmar = computed(() => {
  const iconos = {
    danger: 'fas fa-trash',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-check',
    success: 'fas fa-check'
  }
  return iconos[props.tipo]
})

// Métodos
function confirmar() {
  procesando.value = true
  emit('confirmar')
  // Note: procesando se resetea cuando el modal se cierra
}

function cancelar() {
  if (procesando.value) return // Evitar cancelar mientras se procesa
  emit('cancelar')
}
</script>

<style scoped>
/* =================================================
   MODAL OVERLAY Y CONTAINER
   ================================================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.confirmation-modal {
  max-width: 500px;
  width: 90%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* =================================================
   HEADER CON ICONOS TEMÁTICOS
   ================================================= */
.modal-header {
  padding: 24px 24px 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.modal-icon {
  margin-bottom: 12px;
}

.modal-icon i {
  font-size: 3rem;
  margin-bottom: 8px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #2d3748;
}

/* Colores por tipo */
.header-danger .modal-icon i {
  color: #e53e3e;
}

.header-warning .modal-icon i {
  color: #d69e2e;
}

.header-info .modal-icon i {
  color: #3182ce;
}

.header-success .modal-icon i {
  color: #38a169;
}

/* =================================================
   BODY DEL MODAL
   ================================================= */
.modal-body {
  padding: 16px 24px 24px;
  text-align: center;
}

.confirmation-message {
  font-size: 1.1rem;
  color: #4a5568;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.confirmation-details {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
}

/* =================================================
   FOOTER CON BOTONES
   ================================================= */
.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botón secundario (cancelar) */
.btn-secondary {
  background: #edf2f7;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: #a0aec0;
}

/* Botones por tipo */
.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.btn-warning {
  background: #d69e2e;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #b7791f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(214, 158, 46, 0.3);
}

.btn-info {
  background: #3182ce;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #2b6cb0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.btn-success {
  background: #38a169;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #2f855a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
}

/* =================================================
   RESPONSIVE
   ================================================= */
@media (max-width: 768px) {
  .confirmation-modal {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 20px 16px 12px;
  }

  .modal-body {
    padding: 12px 16px 20px;
  }

  .modal-footer {
    padding: 12px 16px 20px;
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .modal-icon i {
    font-size: 2.5rem;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .confirmation-message {
    font-size: 1rem;
  }
}

/* =================================================
   ACCESIBILIDAD
   ================================================= */
@media (prefers-reduced-motion: reduce) {
  .confirmation-modal {
    animation: none;
  }
  
  .btn {
    transition: none;
  }
}

.btn:focus {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}
</style>
