/**
 * Store de Pinia para Encuesta de Tamizaje
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { encuestaTamizajeService } from '@/services/estudiantes/CasosClinicos/encuesta-tamizaje.service'
import type {
  PreguntaTamizaje,
  EncuestaProgreso,
  GuardarRespuestasDto
} from '@/types/encuestaTamizaje.types'

export const useEncuestaTamizajeStore = defineStore('encuestaTamizaje', () => {
  // Estado
  const preguntasPorCategoria = ref<Record<string, PreguntaTamizaje[]>>({})
  const todasLasPreguntas = ref<PreguntaTamizaje[]>([])
  const encuestaPacienteActual = ref<EncuestaProgreso | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Respuestas del formulario
  const respuestasActuales = ref<Map<number, string>>(new Map())

  // Getters
  const categorias = computed(() => Object.keys(preguntasPorCategoria.value))
  const totalPreguntas = computed(() => todasLasPreguntas.value.length)
  const porcentajeCompletitud = computed(
    () => encuestaPacienteActual.value?.porcentaje || 0
  )

  // Actions
  async function cargarTodasLasPreguntas() {
    isLoading.value = true
    error.value = null
    try {
      const preguntas = await encuestaTamizajeService.obtenerTodasLasPreguntas()
      preguntasPorCategoria.value = preguntas

      // Aplanar todas las preguntas
      todasLasPreguntas.value = Object.values(preguntas).flat()
    } catch (err: any) {
      error.value = err.message || 'Error al cargar las preguntas'
    } finally {
      isLoading.value = false
    }
  }

  async function cargarEncuestaPaciente(pacienteId: number) {
    isLoading.value = true
    error.value = null
    try {
      const encuesta = await encuestaTamizajeService.obtenerEncuestaPaciente(
        pacienteId
      )
      
      // Asegurarse de que la estructura tenga los campos necesarios
      if (encuesta) {
        encuestaPacienteActual.value = {
          ...encuesta,
          estado: encuesta.estado || 'PENDIENTE',
          porcentaje: encuesta.porcentaje || 0,
          respuestasCompletadas: encuesta.respuestasCompletadas || 0,
          totalPreguntas: encuesta.totalPreguntas || 0
        }
      } else {
        encuestaPacienteActual.value = null
      }

      // Cargar respuestas existentes
      if (encuesta && encuesta.respuestas) {
        respuestasActuales.value.clear()
        encuesta.respuestas.forEach((r: any) => {
          // Convertir SI/NO a boolean cuando corresponda
          let valor: string | boolean = r.respuesta || ''
          if (valor === 'SI') {
            valor = true
          } else if (valor === 'NO') {
            valor = false
          }
          respuestasActuales.value.set(r.preguntaId, valor)
        })
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar la encuesta'
      encuestaPacienteActual.value = null
      console.error('❌ Error al cargar encuesta:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function cargarProgresoEncuesta(pacienteId: number) {
    isLoading.value = true
    error.value = null
    try {
      const progreso = await encuestaTamizajeService.obtenerProgresoEncuesta(
        pacienteId
      )
      
      if (progreso) {
        // Solo actualizar los campos de progreso, mantener respuestas si existen
        encuestaPacienteActual.value = {
          ...encuestaPacienteActual.value,
          ...progreso,
          respuestas: encuestaPacienteActual.value?.respuestas || []
        } as EncuestaProgreso
      } else {
        encuestaPacienteActual.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar progreso'
      console.error('❌ Error al cargar progreso:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function guardarRespuestas(
    pacienteId: number,
    respuestas: Map<number, string | boolean | null>,
    detalles?: Map<number, string | null>
  ) {
    isLoading.value = true
    error.value = null
    try {
      const dto: GuardarRespuestasDto = {
        pacienteId,
        encuestaId: encuestaPacienteActual.value?.encuestaId, // Incluir ID si existe
        respuestas: Array.from(respuestas.entries()).map(([preguntaId, respuesta]) => {
          // Convertir respuesta a string o null
          let respuestaStr: string | null = null
          if (respuesta === true) {
            respuestaStr = 'SI'
          } else if (respuesta === false) {
            respuestaStr = 'NO'
          } else if (typeof respuesta === 'string' && respuesta.trim() !== '') {
            respuestaStr = respuesta
          }

          return {
            preguntaId,
            respuesta: respuestaStr,
            detalle: detalles?.get(preguntaId) || null
          }
        })
      }

      const resultado = await encuestaTamizajeService.guardarRespuestas(dto)
      
      // Actualizar el estado reactivo
      encuestaPacienteActual.value = {
        ...resultado,
        estado: resultado.estado || 'PENDIENTE',
        porcentaje: resultado.porcentaje || 0,
        respuestasCompletadas: resultado.respuestasCompletadas || 0,
        totalPreguntas: resultado.totalPreguntas || 0
      }

      return resultado
    } catch (err: any) {
      error.value = err.message || 'Error al guardar las respuestas'
      console.error('❌ Error al guardar respuestas:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function crearNuevaVersion(pacienteId: number) {
    isLoading.value = true
    error.value = null
    try {
      const resultado = await encuestaTamizajeService.crearNuevaVersion(pacienteId)
      encuestaPacienteActual.value = resultado
      
      // Limpiar respuestas para la nueva versión
      respuestasActuales.value.clear()
      
      return resultado
    } catch (err: any) {
      error.value = err.message || 'Error al crear nueva versión'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function obtenerHistorial(pacienteId: number) {
    isLoading.value = true
    error.value = null
    try {
      const historial = await encuestaTamizajeService.obtenerHistorialEncuestas(pacienteId)
      return historial
    } catch (err: any) {
      error.value = err.message || 'Error al obtener historial'
      return []
    } finally {
      isLoading.value = false
    }
  }

  function actualizarRespuesta(preguntaId: number, respuesta: string) {
    respuestasActuales.value.set(preguntaId, respuesta)
  }

  function limpiarRespuestas() {
    respuestasActuales.value.clear()
  }

  return {
    // Estado
    preguntasPorCategoria,
    todasLasPreguntas,
    encuestaPacienteActual,
    isLoading,
    error,
    respuestasActuales,

    // Getters
    categorias,
    totalPreguntas,
    porcentajeCompletitud,

    // Actions
    cargarTodasLasPreguntas,
    cargarEncuestaPaciente,
    cargarProgresoEncuesta,
    guardarRespuestas,
    crearNuevaVersion,
    obtenerHistorial,
    actualizarRespuesta,
    limpiarRespuestas
  }
})
