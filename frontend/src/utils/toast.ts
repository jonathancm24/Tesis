/**
 * Utilidad para mostrar mensajes toast/notificaciones
 * Archivo: src/utils/toast.ts
 */

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

class ToastService {
  private messages: ToastMessage[] = []
  private listeners: Array<(messages: ToastMessage[]) => void> = []

  /**
   * Genera un ID único para el mensaje
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Notifica a todos los listeners sobre cambios en los mensajes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.messages]))
  }

  /**
   * Añade un listener para cambios en los mensajes
   */
  subscribe(listener: (messages: ToastMessage[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Muestra un mensaje de éxito
   */
  success(title: string, message?: string, duration: number = 5000): void {
    this.show({
      type: 'success',
      title,
      message,
      duration
    })
  }

  /**
   * Muestra un mensaje de error
   */
  error(title: string, message?: string, duration: number = 7000): void {
    this.show({
      type: 'error',
      title,
      message,
      duration
    })
  }

  /**
   * Muestra un mensaje de advertencia
   */
  warning(title: string, message?: string, duration: number = 6000): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  /**
   * Muestra un mensaje informativo
   */
  info(title: string, message?: string, duration: number = 5000): void {
    this.show({
      type: 'info',
      title,
      message,
      duration
    })
  }

  /**
   * Muestra un mensaje toast
   */
  private show(options: Omit<ToastMessage, 'id'>): void {
    const id = this.generateId()
    const toast: ToastMessage = {
      id,
      ...options
    }

    this.messages.push(toast)
    this.notifyListeners()

    // Auto-remover después del tiempo especificado
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, options.duration)
    }
  }

  /**
   * Remueve un mensaje específico
   */
  remove(id: string): void {
    const index = this.messages.findIndex(msg => msg.id === id)
    if (index > -1) {
      this.messages.splice(index, 1)
      this.notifyListeners()
    }
  }

  /**
   * Remueve todos los mensajes
   */
  clear(): void {
    this.messages = []
    this.notifyListeners()
  }

  /**
   * Obtiene todos los mensajes actuales
   */
  getMessages(): ToastMessage[] {
    return [...this.messages]
  }
}

// Exportar instancia singleton
export const toast = new ToastService()

// Para uso en composables Vue
export function useToast() {
  return toast
}
