/**
 * Composable para manejar el estado del sidebar
 * 
 * Gestiona:
 * - Estado de colapso/expansión del sidebar (COMPARTIDO entre componentes)
 * - Persistencia en localStorage
 * - Detección automática de tamaño de pantalla
 * - Métodos para toggle, abrir y cerrar
 */

import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

// Clave para localStorage
const STORAGE_KEY = 'sidebar-collapsed'

// Breakpoint para modo móvil
const MOBILE_BREAKPOINT = 1024

// ========== ESTADO GLOBAL COMPARTIDO (Singleton) ==========
// Esto asegura que todos los componentes compartan el mismo estado
const isCollapsed = ref(true)
const isInitialized = ref(false)

export function useSidebar() {
  // Detectar si estamos en dispositivo móvil/tablet
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)

  // Computed para saber si el sidebar está expandido
  const isExpanded = computed(() => !isCollapsed.value)

  /**
   * Alternar el estado del sidebar
   */
  const toggle = () => {
    isCollapsed.value = !isCollapsed.value
    saveToStorage()
  }

  /**
   * Colapsar el sidebar
   */
  const collapse = () => {
    isCollapsed.value = true
    saveToStorage()
  }

  /**
   * Expandir el sidebar
   */
  const expand = () => {
    isCollapsed.value = false
    saveToStorage()
  }

  /**
   * Guardar estado en localStorage (solo en desktop)
   */
  const saveToStorage = () => {
    if (!isMobile.value) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed.value))
    }
  }

  /**
   * Cargar estado desde localStorage
   */
  const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      isCollapsed.value = stored === 'true'
    }
  }

  /**
   * Manejar cambio de tamaño de pantalla
   */
  const handleResize = () => {
    // En móviles/tablets, colapsar automáticamente
    if (isMobile.value) {
      isCollapsed.value = true
    }
  }

  // Inicializar solo una vez
  const initialize = () => {
    if (isInitialized.value) return
    
    loadFromStorage()
    handleResize()
    isInitialized.value = true
  }

  // Inicializar al montar
  onMounted(() => {
    initialize()
  })

  // Observar cambios en el estado móvil
  watch(isMobile, (newValue, oldValue) => {
    // Solo colapsar al cambiar a móvil
    if (newValue && !oldValue) {
      isCollapsed.value = true
    }
  })

  return {
    isCollapsed,
    isExpanded,
    isMobile,
    toggle,
    collapse,
    expand
  }
}
