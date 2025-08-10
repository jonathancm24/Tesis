/**
 * Composable para mostrar notificaciones toast
 */

import { ref } from 'vue';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

export function useToast() {
  const toasts = ref<ToastMessage[]>([]);

  /**
   * Muestra un toast
   */
  const showToast = (
    message: string, 
    type: ToastMessage['type'] = 'info', 
    duration: number = 5000,
    persistent: boolean = false
  ): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration,
      persistent
    };

    toasts.value.push(toast);

    // Auto-eliminar el toast después del tiempo especificado
    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  /**
   * Elimina un toast específico
   */
  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * Limpia todos los toasts
   */
  const clearToasts = (): void => {
    toasts.value = [];
  };

  /**
   * Métodos de conveniencia para diferentes tipos de toast
   */
  const showSuccess = (message: string, duration?: number): string => {
    return showToast(message, 'success', duration);
  };

  const showError = (message: string, duration?: number): string => {
    return showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration?: number): string => {
    return showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number): string => {
    return showToast(message, 'info', duration);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
