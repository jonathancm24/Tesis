// src/mocks/utils.ts

/**
 * Simula un retardo para mocks de API.
 * @param ms Duración en milisegundos
 */
export function delay(ms = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
