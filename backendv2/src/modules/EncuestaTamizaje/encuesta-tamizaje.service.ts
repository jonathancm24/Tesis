import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/../prisma/prisma.service'
import { CreatePreguntaTamizajeDto, GuardarEncuestaDto } from './dto'

@Injectable()
export class EncuestaTamizajeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todas las preguntas de tamizaje agrupadas por categoría
   */
  async obtenerTodasLasPreguntas() {
    const preguntas = await this.prisma.preguntaTamizaje.findMany({
      orderBy: [{ categoria: 'asc' }, { orden: 'asc' }]
    })

    // Agrupar por categoría
    const agrupadas = preguntas.reduce(
      (acc, pregunta) => {
        const categoria = pregunta.categoria || 'Sin categoría'
        if (!acc[categoria]) {
          acc[categoria] = []
        }
        acc[categoria].push(pregunta)
        return acc
      },
      {} as Record<string, typeof preguntas>
    )

    return agrupadas
  }

  /**
   * Obtener preguntas por categoría específica
   */
  async obtenerPreguntasPorCategoria(categoria: string) {
    return await this.prisma.preguntaTamizaje.findMany({
      where: { categoria },
      orderBy: { orden: 'asc' }
    })
  }

  /**
   * Obtener progreso de la encuesta de un paciente (solo metadatos, sin respuestas)
   * Endpoint ligero optimizado para widgets y vistas rápidas
   */
  async obtenerProgresoEncuesta(pacienteId: number) {
    // Verificar si existe encuesta para el paciente
    const encuesta = await this.prisma.encuestaTamizaje.findFirst({
      where: { pacienteId },
      orderBy: { fecha: 'desc' }
    })

    if (!encuesta) {
      return null
    }

    // Obtener género del paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { genero: true }
    })

    // Obtener todas las preguntas para calcular el total aplicable
    const todasLasPreguntas = await this.prisma.preguntaTamizaje.findMany()
    
    // Filtrar preguntas según género
    const generoPaciente = paciente?.genero?.toLowerCase()
    const esMujer = generoPaciente === 'femenino' || generoPaciente === 'f' || generoPaciente === 'mujer'
    
    const preguntasAplicables = todasLasPreguntas.filter(pregunta => {
      if (pregunta.soloMujer && !esMujer) {
        return false
      }
      return true
    })

    // Obtener respuestas DIRECTAMENTE por pacienteId (no a través de encuesta)
    const respuestas = await this.prisma.respuestaTamizaje.findMany({
      where: { pacienteId }
    })

    const totalPreguntas = preguntasAplicables.length
    const respuestasCompletadas = respuestas.filter(
      r => r.respuesta !== null && r.respuesta !== ''
    ).length

    const porcentaje = totalPreguntas > 0 
      ? Math.round((respuestasCompletadas / totalPreguntas) * 100) 
      : 0
      
    const estado =
      respuestasCompletadas === 0
        ? 'PENDIENTE'
        : respuestasCompletadas >= totalPreguntas
          ? 'COMPLETADA'
          : 'BORRADOR'

    return {
      encuestaId: encuesta.id,
      pacienteId: encuesta.pacienteId,
      fecha: encuesta.fecha,
      totalPreguntas,
      respuestasCompletadas,
      porcentaje,
      estado
    }
  }

  /**
   * Obtener la encuesta de tamizaje de un paciente (última versión)
   */
  async obtenerEncuestaPaciente(pacienteId: number) {
    const encuesta = await this.prisma.encuestaTamizaje.findFirst({
      where: { pacienteId },
      orderBy: { fecha: 'desc' }
    })

    if (!encuesta) {
      return null
    }

    // Obtener género del paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { genero: true }
    })

    // Obtener respuestas DIRECTAMENTE por pacienteId
    const respuestasDB = await this.prisma.respuestaTamizaje.findMany({
      where: { pacienteId },
      include: {
        pregunta: true
      }
    })

    // Obtener todas las preguntas
    const todasLasPreguntas = await this.prisma.preguntaTamizaje.findMany()
    
    // Filtrar preguntas según género del paciente
    const generoPaciente = paciente?.genero?.toLowerCase()
    const esMujer = generoPaciente === 'femenino' || generoPaciente === 'f' || generoPaciente === 'mujer'
    
    const preguntasAplicables = todasLasPreguntas.filter(pregunta => {
      // Si la pregunta es solo para mujeres y el paciente no es mujer, excluirla
      if (pregunta.soloMujer && !esMujer) {
        return false
      }
      return true
    })

    // Calcular progreso solo con preguntas aplicables
    const totalPreguntas = preguntasAplicables.length
    const respuestasCompletadas = respuestasDB.filter(
      r => r.respuesta !== null && r.respuesta !== ''
    ).length

    const porcentaje = totalPreguntas > 0 
      ? Math.round((respuestasCompletadas / totalPreguntas) * 100) 
      : 0
      
    const estado =
      respuestasCompletadas === 0
        ? 'PENDIENTE'
        : respuestasCompletadas >= totalPreguntas
          ? 'COMPLETADA'
          : 'BORRADOR'

    // Verificar si es la última versión
    const totalVersiones = await this.prisma.encuestaTamizaje.count({
      where: { pacienteId }
    })

    const resultado = {
      encuestaId: encuesta.id,
      pacienteId: encuesta.pacienteId,
      fecha: encuesta.fecha,
      totalPreguntas,
      respuestasCompletadas,
      porcentaje,
      estado,
      esUltimaVersion: totalVersiones === 1,
      respuestas: respuestasDB.map(r => ({
        id: r.id,
        preguntaId: r.preguntaId,
        respuesta: r.respuesta,
        detalle: r.detalle,
        pregunta: r.pregunta
      }))
    }

    return resultado
  }

  /**
   * Obtener el historial completo de encuestas de un paciente
   */
  async obtenerHistorialEncuestas(pacienteId: number) {
    const encuestas = await this.prisma.encuestaTamizaje.findMany({
      where: { pacienteId },
      orderBy: { fecha: 'desc' }
    })

    if (encuestas.length === 0) {
      return []
    }

    // Obtener género del paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { genero: true }
    })

    // Obtener respuestas DIRECTAMENTE por pacienteId
    const respuestasDB = await this.prisma.respuestaTamizaje.findMany({
      where: { pacienteId },
      include: {
        pregunta: true
      }
    })

    // Obtener todas las preguntas una sola vez
    const todasLasPreguntas = await this.prisma.preguntaTamizaje.findMany()
    
    // Determinar el género del paciente
    const generoPaciente = paciente?.genero?.toLowerCase()
    const esMujer = generoPaciente === 'femenino' || generoPaciente === 'f' || generoPaciente === 'mujer'
    
    // Filtrar preguntas aplicables según género
    const preguntasAplicables = todasLasPreguntas.filter(pregunta => {
      if (pregunta.soloMujer && !esMujer) {
        return false
      }
      return true
    })
    
    const totalPreguntas = preguntasAplicables.length

    return encuestas.map((encuesta, index) => {
      const respuestasCompletadas = respuestasDB.filter(
        r => r.respuesta !== null && r.respuesta !== ''
      ).length

      const porcentaje = totalPreguntas > 0
        ? Math.round((respuestasCompletadas / totalPreguntas) * 100)
        : 0
        
      const estado =
        respuestasCompletadas === 0
          ? 'PENDIENTE'
          : respuestasCompletadas >= totalPreguntas
            ? 'COMPLETADA'
            : 'BORRADOR'

      return {
        encuestaId: encuesta.id,
        pacienteId: encuesta.pacienteId,
        fecha: encuesta.fecha,
        totalPreguntas,
        respuestasCompletadas,
        porcentaje,
        estado,
        esUltimaVersion: index === 0,
        respuestas: respuestasDB.map(r => ({
          id: r.id,
          preguntaId: r.preguntaId,
          respuesta: r.respuesta,
          detalle: r.detalle,
          pregunta: r.pregunta
        }))
      }
    })
  }

  /**
   * Crear una nueva versión de la encuesta
   */
  async crearNuevaVersion(pacienteId: number) {
    // Validar que el paciente existe y obtener su género
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { genero: true }
    })

    if (!paciente) {
      throw new Error(`Paciente con ID ${pacienteId} no existe`)
    }

    // Crear nueva encuesta (nueva versión)
    const nuevaEncuesta = await this.prisma.encuestaTamizaje.create({
      data: { pacienteId }
    })

    // Obtener todas las preguntas y filtrar según género
    const todasLasPreguntas = await this.prisma.preguntaTamizaje.findMany()
    const generoPaciente = paciente.genero?.toLowerCase()
    const esMujer = generoPaciente === 'femenino' || generoPaciente === 'f' || generoPaciente === 'mujer'
    
    const preguntasAplicables = todasLasPreguntas.filter(pregunta => {
      if (pregunta.soloMujer && !esMujer) {
        return false
      }
      return true
    })

    return {
      encuestaId: nuevaEncuesta.id,
      pacienteId: nuevaEncuesta.pacienteId,
      fecha: nuevaEncuesta.fecha,
      totalPreguntas: preguntasAplicables.length,
      respuestasCompletadas: 0,
      porcentaje: 0,
      estado: 'PENDIENTE',
      esUltimaVersion: true,
      respuestas: []
    }
  }

  /**
   * Guardar o actualizar encuesta de tamizaje
   * NOTA: Actualmente solo soporta una versión por paciente debido al schema
   * Para soporte completo de versiones, se necesita modificar el schema de Prisma
   */
  async guardarEncuesta(dto: GuardarEncuestaDto) {
    const { pacienteId, encuestaId, respuestas } = dto

    // Validar que el paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId }
    })

    if (!paciente) {
      throw new Error(`Paciente con ID ${pacienteId} no existe`)
    }

    // Obtener o crear la encuesta
    let encuesta
    if (encuestaId) {
      // Buscar por ID específico
      encuesta = await this.prisma.encuestaTamizaje.findUnique({
        where: { id: encuestaId }
      })
      if (!encuesta || encuesta.pacienteId !== pacienteId) {
        throw new Error(`Encuesta con ID ${encuestaId} no existe o no pertenece al paciente`)
      }
    } else {
      // Buscar encuesta existente o crear nueva
      encuesta = await this.prisma.encuestaTamizaje.findFirst({
        where: { pacienteId },
        orderBy: { fecha: 'desc' }
      })

      if (!encuesta) {
        encuesta = await this.prisma.encuestaTamizaje.create({
          data: { pacienteId }
        })
      }
    }

    // Usar transacción para garantizar que todas las respuestas se guarden
    await this.prisma.$transaction(async (prisma) => {
      // Procesar respuestas en lotes para evitar problemas de performance
      const batchSize = 50
      for (let i = 0; i < respuestas.length; i += batchSize) {
        const batch = respuestas.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async (respuesta) => {
            // Buscar si ya existe una respuesta para esta pregunta y paciente
            const respuestaExistente = await prisma.respuestaTamizaje.findFirst({
              where: {
                pacienteId,
                preguntaId: respuesta.preguntaId
              }
            })

            if (respuestaExistente) {
              // Actualizar respuesta existente
              await prisma.respuestaTamizaje.update({
                where: { id: respuestaExistente.id },
                data: {
                  respuesta: respuesta.respuesta || null,
                  detalle: respuesta.detalle || null
                }
              })
            } else {
              // Crear nueva respuesta
              await prisma.respuestaTamizaje.create({
                data: {
                  pacienteId,
                  preguntaId: respuesta.preguntaId,
                  respuesta: respuesta.respuesta || null,
                  detalle: respuesta.detalle || null
                }
              })
            }
          })
        )
      }
    })

    const resultado = await this.obtenerEncuestaPaciente(pacienteId)

    return resultado
  }

  /**
   * Crear una nueva pregunta de tamizaje (Solo admin)
   */
  async crearPregunta(dto: CreatePreguntaTamizajeDto) {
    return await this.prisma.preguntaTamizaje.create({
      data: {
        texto: dto.texto,
        tipo: dto.tipo as any, // Mapper from TipoPreguntaDTO to TipoPregunta
        categoria: dto.categoria,
        orden: dto.orden,
        soloMujer: dto.soloMujer || false,
        requiereDetalle: dto.requiereDetalle || false
      }
    })
  }

  /**
   * Obtener una pregunta específica
   */
  async obtenerPregunta(id: number) {
    return await this.prisma.preguntaTamizaje.findUnique({
      where: { id },
      include: {
        respuestas: true
      }
    })
  }

  /**
   * Actualizar una pregunta
   */
  async actualizarPregunta(id: number, dto: Partial<CreatePreguntaTamizajeDto>) {
    // Construir objeto de actualización con tipos correctos
    const dataActualizar: any = {}

    if (dto.texto !== undefined) dataActualizar.texto = dto.texto
    if (dto.tipo !== undefined) dataActualizar.tipo = dto.tipo
    if (dto.categoria !== undefined) dataActualizar.categoria = dto.categoria
    if (dto.orden !== undefined) dataActualizar.orden = dto.orden
    if (dto.soloMujer !== undefined) dataActualizar.soloMujer = dto.soloMujer
    if (dto.requiereDetalle !== undefined) dataActualizar.requiereDetalle = dto.requiereDetalle

    return await this.prisma.preguntaTamizaje.update({
      where: { id },
      data: dataActualizar
    })
  }

  /**
   * Eliminar una pregunta
   */
  async eliminarPregunta(id: number) {
    return await this.prisma.preguntaTamizaje.delete({
      where: { id }
    })
  }

  /**
   * Obtener estadísticas de la encuesta
   */
  async obtenerEstadisticas() {
    const totalPreguntas = await this.prisma.preguntaTamizaje.count()
    const totalEncuestasCompletadas = await this.prisma.encuestaTamizaje.count()
    const totalPacientes = await this.prisma.paciente.count()

    const encuestasCompletadas = totalEncuestasCompletadas
    const encuestasPendientes = totalPacientes - totalEncuestasCompletadas

    return {
      totalPreguntas,
      totalPacientes,
      encuestasCompletadas,
      encuestasPendientes,
      porcentajeCompletitud: Math.round((encuestasCompletadas / totalPacientes) * 100)
    }
  }
}
