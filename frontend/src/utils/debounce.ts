/**
 * Función de utilidad para implementar debounce
 * Retrasa la ejecución de una función hasta que no se llame durante un período específico
 * @param func Función a ejecutar
 * @param delay Tiempo de espera en milisegundos
 * @returns Función con debounce aplicado
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    // Limpiar el timeout anterior si existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Establecer un nuevo timeout
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

/**
 * Función de utilidad para implementar throttle
 * Limita la frecuencia de ejecución de una función
 * @param func Función a ejecutar
 * @param limit Tiempo mínimo entre ejecuciones en milisegundos
 * @returns Función con throttle aplicado
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
