import { ref } from 'vue'
import { parroquiasService } from '@/services/estudiantes/Pacientes/parroquias.service'
import type { ParroquiaSearch } from '@/types/parroquias.types'

/**
 * Composable para manejar la búsqueda y selección de parroquias
 * Reutilizable en modales y otras vistas
 */
export const useParroquiasSearch = () => {
  const parroquiaSearchTerm = ref('')
  const parroquiasResultados = ref<ParroquiaSearch[]>([])
  const showParroquiasResults = ref(false)
  const selectedParroquiaData = ref<ParroquiaSearch | null>(null)

  /**
   * Buscar parroquias por término
   */
  const handleSearchParroquias = async () => {
    const term = parroquiaSearchTerm.value.trim()

    if (term.length < 2) {
      parroquiasResultados.value = []
      showParroquiasResults.value = false
      if (!term) {
        selectedParroquiaData.value = null
      }
      return
    }

    try {
      parroquiasResultados.value = await parroquiasService.search(term)
      showParroquiasResults.value = parroquiasResultados.value.length > 0
    } catch (error) {
      console.error('Error al buscar parroquias:', error)
      parroquiasResultados.value = []
      showParroquiasResults.value = false
    }
  }

  /**
   * Seleccionar una parroquia
   */
  const selectParroquia = (parroquia: ParroquiaSearch) => {
    parroquiaSearchTerm.value = parroquia.nombre
    selectedParroquiaData.value = parroquia
    showParroquiasResults.value = false
    parroquiasResultados.value = []
  }

  /**
   * Cargar datos de parroquia actual
   */
  const loadParroquiaActual = async (parroquiaId: number | null, parroquiaNombre?: string) => {
    if (!parroquiaId || !parroquiaNombre) return

    try {
      const resultados = await parroquiasService.search(parroquiaNombre)
      selectedParroquiaData.value = resultados.find((p) => p.id === parroquiaId) || null
      parroquiaSearchTerm.value = parroquiaNombre
    } catch {
      selectedParroquiaData.value = null
    }
  }

  /**
   * Limpiar estado
   */
  const reset = () => {
    parroquiaSearchTerm.value = ''
    parroquiasResultados.value = []
    showParroquiasResults.value = false
    selectedParroquiaData.value = null
  }

  return {
    parroquiaSearchTerm,
    parroquiasResultados,
    showParroquiasResults,
    selectedParroquiaData,
    handleSearchParroquias,
    selectParroquia,
    loadParroquiaActual,
    reset,
  }
}
