<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast-item',
            `toast-${toast.type}`,
            { 'toast-persistent': toast.persistent }
          ]"
        >
          <div class="toast-content">
            <div class="toast-icon">
              <i :class="getIconClass(toast.type)"></i>
            </div>
            <div class="toast-message">
              {{ toast.message }}
            </div>
            <button
              v-if="toast.persistent || (toast.duration || 0) === 0"
              class="toast-close"
              @click="removeToast(toast.id)"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div
            v-if="!toast.persistent && (toast.duration || 0) > 0"
            class="toast-progress"
            :style="{ animationDuration: `${toast.duration || 5000}ms` }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts, removeToast } = useToast();

const getIconClass = (type: string): string => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  return icons[type as keyof typeof icons] || icons.info;
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.toast-item {
  pointer-events: auto;
  min-width: 320px;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  overflow: hidden;
  position: relative;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%);
  animation: toast-progress linear forwards;
  transform-origin: left;
}

.toast-success .toast-progress {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.toast-error .toast-progress {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.toast-warning .toast-progress {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.toast-info .toast-progress {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Animaciones de transición */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .toast-item {
    min-width: auto;
    width: 100%;
  }

  .toast-list {
    align-items: stretch;
  }
}
</style>
