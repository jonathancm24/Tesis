import { ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// Tipos disponibles de tema
export type Theme = 'light' | 'dark'

/**
 * Composable para manejar el sistema de temas de la aplicación
 * Permite alternar entre tema claro y oscuro, con persistencia en localStorage
 */
export function useTheme() {
  // Almacenar preferencia de tema en localStorage, por defecto 'light'
  const currentTheme = useLocalStorage<Theme>('app-theme', 'light')

  // Estado reactivo para el tema actual
  const theme = ref<Theme>(currentTheme.value)

  /**
   * Alternar entre tema claro y oscuro
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  /**
   * Establecer un tema específico
   * @param newTheme - El tema a establecer
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  /**
   * Obtener el tema actual
   */
  const getTheme = () => theme.value

  /**
   * Verificar si el tema actual es oscuro
   */
  const isDark = () => theme.value === 'dark'

  /**
   * Verificar si el tema actual es claro
   */
  const isLight = () => theme.value === 'light'

  // Aplicar el tema al DOM cuando cambie
  watch(
    theme,
    (newTheme) => {
      // Actualizar localStorage
      currentTheme.value = newTheme
      
      // Aplicar el atributo data-theme al elemento html
      document.documentElement.setAttribute('data-theme', newTheme)
      
      // Opcional: cambiar clase en body para compatibilidad
      document.body.className = document.body.className
        .replace(/theme-\w+/g, '')
        .concat(` theme-${newTheme}`)
        .trim()
    },
    { immediate: true }
  )

  return {
    theme,
    toggleTheme,
    setTheme,
    getTheme,
    isDark,
    isLight
  }
}