import { computed, ref, type Ref } from 'vue'
import type { Usuario } from '@/types/usuarios.types'
import type { Especialidad } from '@/types/especialidades.types'

/**
 * Composable para manejar el filtrado de profesores por especialidades y viceversa
 * Reutilizable en múltiples componentes
 */
export const useProfesoresEspecialidades = (
  todosProfesoresRef: Ref<Usuario[]>,
  todasEspecialidadesRef: Ref<Especialidad[]>
) => {
  const profesorSeleccionadoId = ref<number>(0)
  const especialidadSeleccionadaId = ref<number>(0)

  /**
   * Profesores filtrados que tengan la especialidad seleccionada
   */
  const profesoresFiltrados = computed(() => {
    if (especialidadSeleccionadaId.value === 0) {
      return todosProfesoresRef.value
    }

    return todosProfesoresRef.value.filter((profesor) => {
      const tieneEspecialidad = profesor.especialidades?.some(
        (esp) => esp.id === especialidadSeleccionadaId.value
      )
      return tieneEspecialidad
    })
  })

  /**
   * Especialidades filtradas que tengan el profesor seleccionado
   */
  const especialidadesFiltradas = computed(() => {
    if (profesorSeleccionadoId.value === 0) {
      return todasEspecialidadesRef.value
    }

    const profesor = todosProfesoresRef.value.find((p) => p.id === profesorSeleccionadoId.value)
    if (!profesor || !profesor.especialidades) {
      return todasEspecialidadesRef.value
    }

    const especialidadesDelProfesor = profesor.especialidades.map((esp) => esp.id)
    return todasEspecialidadesRef.value.filter((esp) =>
      especialidadesDelProfesor.includes(esp.id)
    )
  })

  /**
   * Verificar si el profesor seleccionado tiene la especialidad seleccionada
   */
  const isValidCombination = computed(() => {
    if (profesorSeleccionadoId.value === 0 || especialidadSeleccionadaId.value === 0) {
      return true // Sin selecciones, no hay error
    }

    const profesor = todosProfesoresRef.value.find((p) => p.id === profesorSeleccionadoId.value)
    if (!profesor || !profesor.especialidades) {
      return false
    }

    return profesor.especialidades.some((esp) => esp.id === especialidadSeleccionadaId.value)
  })

  /**
   * Limpiar selecciones
   */
  const reset = () => {
    profesorSeleccionadoId.value = 0
    especialidadSeleccionadaId.value = 0
  }

  /**
   * Establecer selecciones
   */
  const setProfessor = (id: number) => {
    profesorSeleccionadoId.value = id
  }

  const setEspecialidad = (id: number) => {
    especialidadSeleccionadaId.value = id
  }

  return {
    profesorSeleccionadoId,
    especialidadSeleccionadaId,
    profesoresFiltrados,
    especialidadesFiltradas,
    isValidCombination,
    reset,
    setProfessor,
    setEspecialidad,
  }
}
